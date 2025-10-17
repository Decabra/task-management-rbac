import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Request,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './task.dto';
import { JwtAuthGuard, RbacGuard, Roles, OrgParam } from '@libs/auth';
import { Role } from '@libs/data';
import { TaskStatus } from '@libs/data';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.taskService.create(createTaskDto, req.user.id);
  }

  @Get()
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async findAll(@Query() filterDto: TaskFilterDto, @Request() req: any) {
    return this.taskService.findAll(filterDto, req.user.id);
  }

  @Get('categories')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async getCategories(@Request() req: any) {
    return this.taskService.getCategories(req.user.id);
  }

  @Get('by-status')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async getTasksByStatus(
    @Query() filterDto: TaskFilterDto,
    @Request() req: any
  ) {
    return this.taskService.getTasksByStatus(filterDto, req.user.id);
  }

  @Get('search')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async getTasksWithSearch(
    @Query() filterDto: TaskFilterDto,
    @Request() req: any
  ) {
    return this.taskService.getTasksWithSearch(filterDto, req.user.id);
  }

  @Get('stats')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async getTotalCounts(@Request() req: any) {
    return this.taskService.getTotalCounts(req.user.id);
  }

  @Get(':id')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.taskService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any
  ) {
    return this.taskService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.taskService.remove(id, req.user.id);
    return { message: 'Task deleted successfully' };
  }

  @Patch(':id/order')
  @Roles(Role.ADMIN, Role.OWNER)
  async updateOrder(
    @Param('id') id: string,
    @Body() body: { orderIndex: number; status: TaskStatus },
    @Request() req: any
  ) {
    return this.taskService.updateTaskOrder(id, body.orderIndex, body.status, req.user.id);
  }
}
