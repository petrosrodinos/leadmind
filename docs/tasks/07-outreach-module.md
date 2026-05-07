# Task: Outreach Module (Drafts, Sending, Sequences)

## Objective

Build the `outreach` NestJS module that owns the full lifecycle of `OutreachMessage` rows: AI-drafted messages (created by Task 05's pipeline), user edits, dispatching via Email (SendGrid), SMS (Twilio), and LinkedIn (placeholder), and follow-up sequences with configurable delays.

## Domain reminder

- An `OutreachMessage` is **always linked to a Contact** (`contact_uuid`); recipient info comes from `contact.lead`. There is no `lead_uuid` on `OutreachMessage`.
- AI-drafted messages from Task 05 land in this table with `status: PENDING`. The user reviews/edits them, then explicitly sends.
- A single message has a single `channel`. A Filter with multiple `channels` produces multiple OutreachMessage rows (one each).
- `MsgStatus` enum: `PENDING | SENT | FAILED`. PENDING covers both "AI-drafted, awaiting review" and "queued for sending" — distinguishable by whether `scheduled_at` is set or the message is in the BullMQ queue.

## Requirements

- Sending is always async via BullMQ (`outreach-send` queue)
- The user explicitly triggers send via `POST /outreach/messages/:uuid/send`; the AI pipeline never enqueues sends on its own
- Worker updates `status` to `SENT` / `FAILED` after the provider call
- Sequence steps are scheduled by setting `scheduled_at` on future `OutreachMessage` records and using BullMQ's `delay` option
- Reuse existing `integrations/notifications/sendgrid/` for email and `integrations/notifications/twillio/` for SMS

## Subtasks

- [ ] Add `OUTREACH_SEND_QUEUE = 'outreach-send'` to `queues.constants.ts`
- [ ] Register queue in `queues.module.ts`
- [ ] Create `api/src/modules/outreach/dto/send-outreach.dto.ts` (manual create-and-send, e.g., for ad-hoc messages):
  - `channel: Channel`
  - `content: string`
  - `subject?: string`
  - `contact_uuid: string` (required)
  - `scheduled_at?: string` (ISO date for delayed sending)
- [ ] Create `api/src/modules/outreach/dto/update-message.dto.ts` (edit a PENDING draft):
  - `subject?: string`
  - `content?: string`
- [ ] Create `api/src/modules/outreach/dto/create-sequence.dto.ts`:
  - `name: string`
  - `steps: Array<{ delayHours: number; channel: Channel; template: string }>`
- [ ] Create `api/src/modules/outreach/outreach.service.ts`:
  - `createAndQueue(userUuid, dto: SendOutreachDto): Promise<OutreachMessage>` — for manual/ad-hoc sends. Verify contact ownership, create `OutreachMessage` row with `status: PENDING`, immediately enqueue (with optional `delay` from `scheduled_at`).
  - `updateMessage(userUuid, messageUuid, dto): Promise<OutreachMessage>` — only allowed when `status: PENDING` (preserves the audit trail for sent messages); verify ownership.
  - `sendMessage(userUuid, messageUuid): Promise<{ jobId: string }>` — only allowed when `status: PENDING`; enqueue to `outreach-send` queue; return jobId.
  - `deleteMessage(userUuid, messageUuid): Promise<void>` — only allowed when `status: PENDING` (don't delete sent history).
  - `listMessages(userUuid, filters: { contact_uuid?, status? })` — paginated list, scoped to user.
  - `createSequence(userUuid, dto)` — persists `OutreachSequence`.
  - `assignSequence(userUuid, sequenceUuid, contactUuid)` — creates one `OutreachMessage` per step with `scheduled_at` computed from `now() + step.delayHours`; enqueues each with appropriate BullMQ delay.
  - `listSequences(userUuid)` — list user's sequences.
- [ ] Create `api/src/workers/outreach-send.worker.ts` — `OutreachSendWorker`:
  - `@Processor(OUTREACH_SEND_QUEUE, { concurrency: 10 })`
  - Payload: `{ message_uuid: string }`
  - Load `OutreachMessage` (include `contact.lead`)
  - Switch on `channel`:
    - `EMAIL` → call `MailService.sendMail({ to: contact.lead.email, subject, html: content })`
    - `SMS` → call `SmsService.sendSms({ to: contact.lead.phone, body: content })`
    - `LINKEDIN` → no-op for now; mark `status: FAILED` with `metadata: { reason: 'LinkedIn DM not yet implemented' }` (future integration)
  - Update `OutreachMessage.status = SENT, sent_at = now()` on success
  - Update `OutreachMessage.status = FAILED` with error in `metadata` on failure
  - Also create an `Interaction` record (type matches channel) on successful send so the Contact's timeline reflects it
- [ ] Create `api/src/modules/outreach/outreach.controller.ts`:
  - `GET /outreach/messages` (query: `?contact_uuid=...&status=...`)
  - `PUT /outreach/messages/:uuid` — edit a PENDING draft
  - `POST /outreach/messages/:uuid/send` — dispatch a PENDING message
  - `DELETE /outreach/messages/:uuid` — delete a PENDING draft
  - `POST /outreach/messages` — manual create-and-queue (uses `createAndQueue`)
  - `POST /outreach/sequences`
  - `GET /outreach/sequences`
  - `POST /outreach/sequences/:uuid/assign` (body: `{ contact_uuid }`)
- [ ] Create `api/src/modules/outreach/outreach.module.ts` — imports notifications modules, BullMQ, Prisma; exports `OutreachService`
- [ ] Register `OutreachModule` in `app.module.ts`
- [ ] Register `OutreachSendWorker` in `workers.module.ts`

## Technical Notes

- Existing `MailService` is at `integrations/notifications/sendgrid/services/mail.service.ts`
- Existing `SmsService` is at `integrations/notifications/twillio/services/sms.service.ts`
- BullMQ delayed job: `queue.add('send', { message_uuid }, { delay: ms(delayHours + 'h') })`
- Recipient resolution: `email = message.contact.lead.email`, `phone = message.contact.lead.phone`
- Sequence `template` field can contain `{{name}}`, `{{company}}` placeholders — resolve them against the contact's linked Lead before enqueueing
- `Interaction.type` mapping: `EMAIL → EMAIL`, `SMS → CALL` (closest available; or extend the enum), `LINKEDIN → EMAIL` placeholder
- AI-drafted messages (created by Task 05) land here as PENDING — they are NOT enqueued automatically. The user has to call `POST /outreach/messages/:uuid/send` after reviewing.

## Acceptance Criteria

- [ ] `GET /outreach/messages?contact_uuid=...&status=PENDING` returns the AI drafts for that contact
- [ ] `PUT /outreach/messages/:uuid` updates `subject`/`content` only when `status: PENDING`; returns 409 otherwise
- [ ] `POST /outreach/messages/:uuid/send` enqueues a BullMQ job and returns `{ jobId }`; returns 409 if the message is not PENDING
- [ ] The worker updates `OutreachMessage.status` to `SENT` after calling `MailService` and creates a matching `Interaction`
- [ ] Failed sends set `status: FAILED` and store error in `metadata.error`
- [ ] `DELETE /outreach/messages/:uuid` removes a PENDING draft; returns 409 for SENT/FAILED messages
- [ ] `POST /outreach/sequences` persists a sequence with steps
- [ ] `POST /outreach/sequences/:uuid/assign` creates one `OutreachMessage` per step with correct `scheduled_at` offsets, all linked to the same Contact
- [ ] Sending to a contact owned by another user returns 403/404
- [ ] No endpoint allows editing a `SENT` message (audit integrity)
