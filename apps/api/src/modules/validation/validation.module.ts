import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidationController } from './validation.controller';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
    imports: [ProfilesModule],
    providers: [ValidationService],
    controllers: [ValidationController],
    exports: [ValidationService],
})
export class ValidationModule { }
