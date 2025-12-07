import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NodesModule } from './modules/nodes/nodes.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { ExportModule } from './modules/export/export.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        OrganizationModule,
        DocumentsModule,
        NodesModule,
        ProfilesModule,
        ExportModule,
    ],
})
export class AppModule { }
