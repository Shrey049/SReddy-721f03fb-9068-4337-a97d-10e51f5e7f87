import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto, LoginDto } from '@turbovets-workspace/data';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private auditService: AuditService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto, ipAddress?: string) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Get user's organization memberships
        const organizations = await this.usersService.getUserOrganizations(user.id);

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role || 'viewer',
            organizations: organizations.map(o => ({
                organizationId: o.organizationId,
                organizationName: o.organizationName,
                role: o.role,
            })),
        };

        // Log successful login
        await this.auditService.logLogin(user.id, true, ipAddress);

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                ...user,
                organizations,
            },
        };
    }

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create(registerDto);
        // Auto login after register - exclude passwordHash from response
        const { passwordHash, ...userWithoutPassword } = user as any;
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role || 'viewer',
            organizations: [],
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                ...userWithoutPassword,
                organizations: [],
            }
        }
    }
}
