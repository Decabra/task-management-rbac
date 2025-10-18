import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities';
import { PermissionsService } from '../permission/permission.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly logFilePath = path.join(process.cwd(), 'audit.log');

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly permissionsService: PermissionsService
  ) {}

  async log(
    userId: string,
    orgId: string,
    action: string,
    entity: string,
    entityId: string,
    meta: Record<string, any> = {}
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      userId,
      orgId,
      action,
      entity,
      entityId,
      meta,
    });

    await this.auditLogRepository.save(auditLog);

    this.logger.log(
      `[AUDIT] User ${userId} performed ${action} on ${entity} ${entityId} in org ${orgId}`
    );

    this.writeToFile(auditLog);
  }

  private writeToFile(auditLog: AuditLog): void {
    try {
      const logEntry = `${new Date().toISOString()} | User: ${auditLog.userId} | Org: ${auditLog.orgId} | Action: ${auditLog.action} | Entity: ${auditLog.entity} | ID: ${auditLog.entityId} | Meta: ${JSON.stringify(auditLog.meta)}\n`;

      fs.appendFileSync(this.logFilePath, logEntry, 'utf8');
    } catch (error) {
      this.logger.error(`Failed to write audit log to file: ${error.message}`);
    }
  }

  async findAll(
    userId: string,
    orgId?: string,
    limit = 50,
    offset = 0
  ): Promise<{
    logs: any[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }> {
    // Get organizations user has access to
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (accessibleOrgIds.length === 0) {
      return { logs: [], total: 0, limit, offset, hasMore: false };
    }

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.orgId IN (:...orgIds)', { orgIds: accessibleOrgIds })
      .orderBy('audit.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (orgId) {
      queryBuilder.andWhere('audit.orgId = :orgId', { orgId });
    }

    const [auditLogs, total] = await queryBuilder.getManyAndCount();

    const logs = await Promise.all(auditLogs.map(async (log) => {
      let userName = 'Unknown User';
      let userEmail = 'unknown@example.com';
      try {
        const user = await this.auditLogRepository.manager
          .getRepository('User')
          .findOne({ where: { id: log.userId }, select: ['name', 'email'] });
        if (user) {
          userName = user.name || 'Unknown User';
          userEmail = user.email || 'unknown@example.com';
        }
      } catch (error) {
        // User not found, use defaults
      }

      let organizationName = 'Unknown Organization';
      try {
        const organization = await this.auditLogRepository.manager
          .getRepository('Organization')
          .findOne({ where: { id: log.orgId }, select: ['name'] });
        if (organization) {
          organizationName = organization.name || 'Unknown Organization';
        }
      } catch (error) {
        // Organization not found, use defaults
      }

      let taskTitle = null;
      if (log.entity === 'task') {
        try {
          const task = await this.auditLogRepository.manager
            .getRepository('Task')
            .findOne({ where: { id: log.entityId }, select: ['title'] });
          if (task) {
            taskTitle = task.title || 'Unknown Task';
          }
        } catch (error) {
          // Task not found, use defaults
        }
      }

      return {
        ...log,
        userName,
        userEmail,
        organizationName,
        taskTitle,
        originalUserId: log.userId,
        originalOrgId: log.orgId,
        originalEntityId: log.entityId
      };
    }));

    return {
      logs,
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    };
  }
}
