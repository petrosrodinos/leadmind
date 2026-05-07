import { registerDecorator, ValidationOptions } from 'class-validator';
import { isValidCron } from 'cron-validator';

export function IsCronExpression(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isCronExpression',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;
                    return isValidCron(value, { seconds: false, alias: true });
                },
                defaultMessage() {
                    return `${propertyName} must be a valid cron expression (e.g. "0 9 * * *")`;
                },
            },
        });
    };
}
