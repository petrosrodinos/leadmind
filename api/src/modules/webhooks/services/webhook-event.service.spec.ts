/// <reference types="jest" />
import {
    CampaignContactStatus,
    Channel,
    InteractionType,
    LeadStatus,
    MsgDirection,
    MsgStatus,
} from '@/generated/prisma';
import { WebhookEventService } from './webhook-event.service';

describe('WebhookEventService', () => {
    const provider_message_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const baseMessage = {
        uuid: 'msg-uuid',
        user_uuid: 'user-uuid',
        contact_uuid: 'contact-uuid',
        campaign_uuid: 'campaign-uuid',
        channel: Channel.EMAIL,
        direction: MsgDirection.OUTBOUND,
        status: MsgStatus.DELIVERED,
        provider_message_id,
    };

    function createService(overrides?: {
        message?: { status?: MsgStatus } | null;
        mcc?: { uuid: string; status: CampaignContactStatus } | null;
        receivedEmail?: { headers?: Record<string, string> } | null;
        contactStatus?: LeadStatus;
    }) {
        const prisma = {
            outreachMessage: {
                findFirst: jest.fn().mockResolvedValue(
                    overrides?.message === null ? null : { ...baseMessage, ...overrides?.message },
                ),
                findUnique: jest.fn().mockResolvedValue(null),
                update: jest.fn().mockResolvedValue({}),
            },
            marketingCampaignContact: {
                findUnique: jest.fn().mockResolvedValue(overrides?.mcc ?? { uuid: 'mcc-uuid', status: CampaignContactStatus.DELIVERED }),
                update: jest.fn().mockResolvedValue({}),
            },
            marketingCampaign: {
                update: jest.fn().mockResolvedValue({}),
            },
            interaction: {
                create: jest.fn().mockResolvedValue({}),
            },
            contact: {
                findFirst: jest.fn().mockResolvedValue(null),
                findUnique: jest.fn().mockResolvedValue({
                    status: overrides?.contactStatus ?? LeadStatus.NEW,
                }),
                update: jest.fn().mockResolvedValue({}),
            },
            $transaction: jest.fn(async (ops: unknown[]) => {
                for (const op of ops) {
                    await op;
                }
            }),
        };
        const resendAdapter = {
            getReceivedEmail: jest.fn().mockResolvedValue({
                data: overrides?.receivedEmail ?? { headers: {} },
            }),
        };
        const campaignSendService = {
            checkCompletion: jest.fn().mockResolvedValue(undefined),
        };
        const contactsService = {
            buildPromoteToContactedIfNewOps: jest.fn(() => [
                prisma.contact.update({
                    where: { uuid: 'contact-uuid' },
                    data: { status: LeadStatus.CONTACTED },
                }),
                prisma.interaction.create({
                    data: {
                        contact_uuid: 'contact-uuid',
                        user_uuid: 'user-uuid',
                        type: InteractionType.STATUS_CHANGE,
                    },
                }),
            ]),
            syncContactSearchIndex: jest.fn().mockResolvedValue(undefined),
        };

        return {
            service: new WebhookEventService(
                prisma as any,
                resendAdapter as any,
                campaignSendService as any,
                contactsService as any,
            ),
            prisma,
            resendAdapter,
            campaignSendService,
            contactsService,
        };
    }

    it('records email open engagement', async () => {
        const { service, prisma } = createService();

        await service.ingest({ kind: 'opened', provider_message_id });

        expect(prisma.outreachMessage.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: MsgStatus.OPENED,
                    opened_at: expect.any(Date),
                }),
            }),
        );
        expect(prisma.interaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ type: InteractionType.EMAIL_OPENED }),
            }),
        );
        expect(prisma.marketingCampaign.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { opened_count: { increment: 1 } },
            }),
        );
    });

    it('promotes contact from NEW to CONTACTED on email delivery', async () => {
        const { service, contactsService } = createService({
            message: { status: MsgStatus.SENT },
            mcc: { uuid: 'mcc-uuid', status: CampaignContactStatus.SENT },
            contactStatus: LeadStatus.NEW,
        });

        await service.ingest({
            kind: 'delivered',
            channel: 'email',
            provider_message_id,
        });

        expect(contactsService.buildPromoteToContactedIfNewOps).toHaveBeenCalledWith(
            'contact-uuid',
            'user-uuid',
            'email_delivered',
            LeadStatus.NEW,
        );
        expect(contactsService.syncContactSearchIndex).toHaveBeenCalledWith('contact-uuid');
    });

    it('does not promote contact when status is not NEW', async () => {
        const { service, contactsService } = createService({
            message: { status: MsgStatus.SENT },
            mcc: { uuid: 'mcc-uuid', status: CampaignContactStatus.SENT },
            contactStatus: LeadStatus.CONTACTED,
        });

        await service.ingest({
            kind: 'delivered',
            channel: 'email',
            provider_message_id,
        });

        expect(contactsService.buildPromoteToContactedIfNewOps).not.toHaveBeenCalled();
        expect(contactsService.syncContactSearchIndex).not.toHaveBeenCalled();
    });

    it('records email reply engagement', async () => {
        const { service, prisma } = createService({
            message: { status: MsgStatus.OPENED },
            mcc: { uuid: 'mcc-uuid', status: CampaignContactStatus.OPENED },
        });

        await service.ingest({
            kind: 'replied',
            provider_message_id,
            metadata: { from: 'lead@example.com' },
        });

        expect(prisma.outreachMessage.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: MsgStatus.REPLIED,
                    replied_at: expect.any(Date),
                }),
            }),
        );
        expect(prisma.interaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ type: InteractionType.REPLY_RECEIVED }),
            }),
        );
        expect(prisma.marketingCampaign.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { replied_count: { increment: 1 } },
            }),
        );
        expect(prisma.contact.update).toHaveBeenCalled();
    });

    it('resolves outbound message from received email headers', async () => {
        const { service, prisma } = createService({
            receivedEmail: {
                headers: {
                    'in-reply-to': `<${provider_message_id}@resend.dev>`,
                },
            },
        });

        const resolved = await service.resolveOutboundMessageIdFromReceived(
            'received-id',
            'lead@example.com',
        );

        expect(resolved).toBe(provider_message_id);
        expect(prisma.outreachMessage.findFirst).toHaveBeenCalled();
    });
});
