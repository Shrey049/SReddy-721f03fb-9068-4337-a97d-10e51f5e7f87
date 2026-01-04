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
            // Log failed login attempt (we don't have userId, so we use email hash or skip)
            throw new UnauthorizedException('Invalid credentials');
        }

        // Simplified: read role and organizationId directly from User
        const role = user.role || 'viewer';
        const organizationId = user.organizationId || null;

        const payload = {
            email: user.email,
            sub: user.id,
            role,
            organizationId
        };

        // Log successful login
        await this.auditService.logLogin(user.id, true, ipAddress);

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                ...user,
                role,
                organizationId
            },
        };
    }

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create(registerDto);
        // Auto login after register - exclude passwordHash from response
        const { passwordHash, ...userWithoutPassword } = user as any;
        const payload = { email: user.email, sub: user.id };
        return {
            accessToken: this.jwtService.sign(payload),
            user: userWithoutPassword
        }
    }
}
