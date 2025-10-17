import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { dataSourceOptions } from './database/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { TaskModule } from './modules/task/task.module';
import { PermissionsModule } from './modules/permission/permission.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // Rate limiting: 100 requests per 15 minutes
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env['RATE_LIMIT_TTL'] || '900000'), // 15 minutes
        limit: parseInt(process.env['RATE_LIMIT_MAX'] || '100'),
      },
    ]),
    AuthModule,
    UserModule,
    OrganizationModule,
    TaskModule,
    PermissionsModule,
    AuditLogModule,
    CommonModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
