import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CreateJwtService } from './jwt.service';

@Module({
    imports: [JwtModule.register({})],
    providers: [CreateJwtService],
    exports: [CreateJwtService],
})
export class CreateJwtServiceModule { }