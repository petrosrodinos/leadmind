# Task: Outreach Module (Email, SMS, Calls, Sequences)

## Objective

Build the `outreach` NestJS module that handles sending messages through Email (SendGrid), SMS (Twilio), and Phone Call scripts (Twilio), persisting `OutreachMessage` records, and supporting follow-up sequences with configurable delays. Wire this into the stubs left by the Leads API and CRM modules.

## Requirements

- Sending is always async via BullMQ (`outreach-send` queue)
- `OutreachMessage` record is created with `status: PENDING` before enqueueing
- Worker updates `status` to `SENT` / `FAILED` after the provider call
- Sequence steps are scheduled by setting `scheduledAt` on future `OutreachMessage` records and using BullMQ's `delay` option
- Reuse existing `integrations/notifications/sendgrid/` for email and `integrations/notifications/twillio/` for SMS/calls

## Subtasks

- [ ] Add `OUTREACH_SEND_QUEUE = 'outreach-send'` to `queues.constants.ts`
- [ ] Register queue in `queues.module.ts`
- [ ] Create `api/src/modules/outreach/dto/send-outreach.dto.ts`:
  - `channel: Channel`
  - `content: string`
  - `subject?: string`
  - `leadId?: number`
  - `contactId?: number`
  - `scheduledAt?: string` (ISO date for delayed sending)
- [ ] Create `api/src/modules/outreach/dto/create-sequence.dto.ts`:
  - `name: string`
  - `steps: Array<{ delayHours: number; channel: Channel; template: string }>`
- [ ] Create `api/src/modules/outreach/outreach.service.ts`:
  - `send(userId, dto: SendOutreachDto): Promise<OutreachMessage>` — creates `OutreachMessage` record, enqueues to `outreach-send` with optional `delay` (if `scheduledAt` is future)
  - `createSequence(userId, dto)` — persists `OutreachSequence`
  - `assignSequence(userId, sequenceId, contactId)` — creates one `OutreachMessage` per step with `scheduledAt` computed from `now() + step.delayHours`; enqueues each with appropriate BullMQ delay
  - `listMessages(userId, filters: { leadId?, contactId? })` — paginated list
  - `listSequences(userId)` — list user's sequences
- [ ] Create `api/src/workers/outreach-send.worker.ts` — `OutreachSendWorker`:
  - `@Processor(OUTREACH_SEND_QUEUE, { concurrency: 10 })`
  - Payload: `{ messageId: number }`
  - Load `OutreachMessage` from DB
  - Switch on `channel`:
    - `EMAIL` → call `MailService.sendMail({ to: recipientEmail, subject, html: content })`
    - `SMS` → call `SmsService.sendSms({ to: recipientPhone, body: content })`
    - `PHONE_CALL` → call `CallsService.initiateCall({ to: recipientPhone, script: content })`
  - Get recipient email/phone from linked `lead` or `contact` record
  - Update `OutreachMessage.status = SENT, sentAt = now()` on success
  - Update `OutreachMessage.status = FAILED` with error in `metadata` on failure
- [ ] Create `api/src/modules/outreach/outreach.controller.ts`:
  - `GET /outreach/messages`
  - `POST /outreach/sequences`
  - `GET /outreach/sequences`
  - `POST /outreach/sequences/:id/assign`
- [ ] Update `LeadsService.sendMessage()` stub to call `OutreachService.send()`
- [ ] Create `api/src/modules/outreach/outreach.module.ts` — imports notifications modules, BullMQ, Prisma; exports `OutreachService`
- [ ] Register `OutreachModule` in `app.module.ts`
- [ ] Register `OutreachSendWorker` in `workers.module.ts`

## Technical Notes

- Existing `MailService` is at `integrations/notifications/sendgrid/services/mail.service.ts`
- Existing `SmsService` is at `integrations/notifications/twillio/services/sms.service.ts`
- Existing `CallsService` is at `integrations/notifications/twillio/services/calls.service.ts`
- BullMQ delayed job: `queue.add('send', { messageId }, { delay: ms(delayHours + 'h') })`
- Install `ms` if not present for converting hours to milliseconds, or use `delayHours * 3600 * 1000`
- Phone call via Twilio uses TwiML — the `content` field should be the script to read via Twilio's `<Say>` verb
- When both `leadId` and `contactId` are null, throw `BadRequestException`
- Sequence `template` field in steps can contain `{{firstName}}`, `{{company}}` placeholders — resolve them against the contact record before enqueueing

## Acceptance Criteria

- [ ] `POST /leads/:id/send` with `{ channel: 'EMAIL', message: '...', subject: '...' }` creates an `OutreachMessage` with `status: PENDING` and enqueues a BullMQ job
- [ ] The worker updates `OutreachMessage.status` to `SENT` after calling `MailService`
- [ ] `POST /outreach/sequences` persists a sequence with steps
- [ ] `POST /outreach/sequences/:id/assign` creates one `OutreachMessage` per step with correct `scheduledAt` offsets
- [ ] `GET /outreach/messages?leadId=5` returns messages filtered by lead
- [ ] SMS sending calls `SmsService.sendSms` (unit test with mock)
- [ ] Failed sends set `status: FAILED` and store error in `metadata.error`
