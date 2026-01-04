import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, Role, TaskStatus, UpdateTaskStatusDto } from '@turbovets-workspace/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@turbovets-workspace/auth';
import { CurrentUser, Roles, AuthenticatedUser } from '@turbovets-workspace/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Roles(Role.OWNER, Role.ADMIN)
    @Post()
    create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
        return this.tasksService.create(createTaskDto, user);
    }

    @Get()
    findAll(@Query() query: TaskQueryDto, @CurrentUser() user: AuthenticatedUser) {
        return this.tasksService.findAll(user, query);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.tasksService.findOne(id, user);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user: AuthenticatedUser) {
        return this.tasksService.update(id, updateTaskDto, user);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() updateTaskStatusDto: UpdateTaskStatusDto, @CurrentUser() user: AuthenticatedUser) {
        // Re-using service logic which might be cleaner to separate, but service update handles it.
        // Or call specific method:
        return this.tasksService.updateStatus(id, updateTaskStatusDto.status, user);
    }

    @Roles(Role.OWNER, Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.tasksService.remove(id, user);
    }
}
