import { LinkedInLeadsAdapter } from './linkedin-leads.adapter';

describe('LinkedInLeadsAdapter', () => {
    const adapter = new LinkedInLeadsAdapter();

    it('maps Apify dataset items with human-readable keys', () => {
        const leads = adapter.normalize([
            {
                Name: 'Gary Gibbons',
                'First Name': 'Gary',
                'Last Name': 'Gibbons',
                Email: 'gary.gibbons@amh.com',
                'Job Title': 'Senior Manager of Application Engineering',
                Department: 'Engineering & Technical',
                City: 'Las Vegas',
                State: 'Nevada',
                Country: 'United Kingdom',
                LinkedIn: 'https://www.linkedin.com/in/mrgarygibbons/',
                'Company Name': 'AMH',
                'Company Domain': 'amh.com',
                'Company Industry': 'Real Estate',
            },
        ]);

        expect(leads).toHaveLength(1);
        expect(leads[0]).toMatchObject({
            name: 'Gary Gibbons',
            email: 'gary.gibbons@amh.com',
            linkedin_url: 'https://www.linkedin.com/in/mrgarygibbons/',
            company: 'AMH',
            website: 'https://amh.com',
            title: 'Senior Manager of Application Engineering',
            industry: 'Real Estate',
        });
    });

    it('still maps legacy camelCase keys', () => {
        const leads = adapter.normalize([
            {
                fullName: 'Jane Doe',
                email: 'jane@example.com',
                linkedinUrl: 'https://www.linkedin.com/in/janedoe/',
            },
        ]);

        expect(leads).toHaveLength(1);
        expect(leads[0].email).toBe('jane@example.com');
    });
});
