
import { Controller, Put, Get, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, AuthenticatedUser } from '@turbovets-workspace/auth';
import { Role } from '@turbovets-workspace/data';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // No @Roles - service handles authorization based on org-level roles
    @Get()
    async findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.findAll(user);
    }

    @Roles(Role.SUPER_ADMIN, Role.OWNER)
    @Put(':id/role')
    async updateRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        // Super Admin and Owner can change roles
        // Validate role against Role enum
        if (!Object.values(Role).includes(role as Role)) {
            throw new ForbiddenException('Invalid role');
        }

        // Exclude passwordHash from response
        const updatedUser = await this.usersService.updateRole(id, role);
        const { passwordHash, ...userWithoutPassword } = updatedUser as any;
        return userWithoutPassword;
    }
}
