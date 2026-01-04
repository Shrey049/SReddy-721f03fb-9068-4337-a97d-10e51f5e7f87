
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, Role } from '@turbovets-workspace/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, AuthenticatedUser } from '@turbovets-workspace/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Roles(Role.OWNER)
    @Post()
    create(@Body() createOrganizationDto: CreateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.create(createOrganizationDto, user);
    }

    @Get()
    findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(id);
    }

    @Roles(Role.OWNER)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.update(id, updateOrganizationDto, user);
    }

    @Roles(Role.OWNER)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.remove(id, user);
    }

    @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN)
    @Post(':id/members')
    addMember(
        @Param('id') orgId: string,
        @Body('userId') userId: string,
        @Body('role') role: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.organizationsService.addMember(orgId, userId, role as any, user);
    }

    @Roles(Role.OWNER)
    @Delete(':id/members/:userId')
    removeMember(
        @Param('id') orgId: string,
        @Param('userId') userId: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.organizationsService.removeMember(orgId, userId, user);
    }
}
