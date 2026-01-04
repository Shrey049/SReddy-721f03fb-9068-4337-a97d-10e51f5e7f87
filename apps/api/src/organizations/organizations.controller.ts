
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, Role } from '@turbovets-workspace/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, AuthenticatedUser } from '@turbovets-workspace/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Roles(Role.SUPER_ADMIN, Role.OWNER)
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

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.update(id, updateOrganizationDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.remove(id, user);
    }

    @Get(':id/members')
    getMembers(@Param('id') orgId: string, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.getMembers(orgId, user);
    }

    @Post(':id/members')
    addMember(
        @Param('id') orgId: string,
        @Body('userId') userId: string,
        @Body('role') role: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.organizationsService.addMember(orgId, userId, role, user);
    }

    @Put(':id/members/:userId')
    updateMemberRole(
        @Param('id') orgId: string,
        @Param('userId') userId: string,
        @Body('role') role: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.organizationsService.updateMemberRole(orgId, userId, role, user);
    }

    @Delete(':id/members/:userId')
    removeMember(
        @Param('id') orgId: string,
        @Param('userId') userId: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.organizationsService.removeMember(orgId, userId, user);
    }
}
