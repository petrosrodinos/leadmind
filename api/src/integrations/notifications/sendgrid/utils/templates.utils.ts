import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplate } from '../interfaces/mail.interfaces';

@Injectable()
export class TemplateService {
    private readonly logger = new Logger(TemplateService.name);
    private readonly templatesPath = path.join(process.cwd(), 'dist', 'integrations', 'notifications', 'sendgrid', 'templates');
    private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

    constructor() {
        this.registerHelpers();
    }

    private registerHelpers() {
        Handlebars.registerHelper('formatDate', (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        });

        Handlebars.registerHelper('formatPrice', (price: number) => {
            if (typeof price !== 'number') return '0.00';
            return (price).toFixed(2);
        });

        Handlebars.registerHelper('eq', (a: any, b: any) => {
            return a === b;
        });

        Handlebars.registerHelper('or', (a: any, b: any) => {
            return a || b;
        });
    }

    private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        if (this.compiledTemplates.has(templateName)) {
            return this.compiledTemplates.get(templateName)!;
        }

        try {
            const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = Handlebars.compile(templateContent);

            this.compiledTemplates.set(templateName, compiledTemplate);
            return compiledTemplate;
        } catch (error) {
            this.logger.error(`Failed to load template ${templateName}:`, error);
            throw new Error(`Template ${templateName} not found`);
        }
    }

    async renderTemplate(templateName: EmailTemplate, data: any): Promise<string> {
        try {
            const template = await this.loadTemplate(templateName);
            return template(data);
        } catch (error) {
            this.logger.error(`Failed to render template ${templateName}:`, error);
            throw new Error(`Failed to render template ${templateName}`);
        }
    }


}
