import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import envConfig from './index';
import { validateEnv, EnvConfig } from './env.validation';

@Module({
    imports: [
        NestConfigModule.forRoot<EnvConfig>({
            isGlobal: true,
            envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`],
            ignoreEnvFile: process.env.NODE_ENV === 'production',
            load: [envConfig],
            validate: validateEnv,
        }),

    ],
    exports: [NestConfigModule],
})
export class ConfigModule { }
