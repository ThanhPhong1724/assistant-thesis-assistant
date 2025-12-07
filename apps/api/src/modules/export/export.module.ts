import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { NodesModule } from '../nodes/nodes.module';

@Module({
    imports: [ProfilesModule, NodesModule],
    controllers: [ExportController],
    providers: [ExportService],
    exports: [ExportService],
})
export class ExportModule { }
