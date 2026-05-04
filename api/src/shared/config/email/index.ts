const EmailAddress = "info@appointmy.com"

export const EmailConfig = {
    email_addresses: {
        verification: EmailAddress,
        confirmation: EmailAddress,
    },
    lists: {
        waitlist: 'b50df3f8-835f-42f8-966f-6e47a375bacf',
    },
    templates: {
        verification: {
            subject: 'Verification',
            template_id: 'd-035ed5cca9f74917a390c1edcab99193',
        },
        waitlist: {
            subject: 'Waitlist',
            template_id: 'd-5ec6860f4431448d87e763e1b04b234b',
        },
    }
}