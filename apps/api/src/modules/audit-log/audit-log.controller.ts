import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard, RbacGuard, Roles } from '@libs/auth';
import { Role } from '@libs/data';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Get audit logs
   * GET /audit-logs
   * Requires: ADMIN or OWNER role
   * Returns org-scoped audit logs
   */
  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  async getAuditLogs(
    @Request() req: any,
    @Query('orgId') orgId?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number
  ) {
    return this.auditLogService.findAll(req.user.id, orgId, limit, offset);
  }
}
