import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from '@turbovets-workspace/data';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = this.usersRepository.create({
            ...createUserDto,
            passwordHash,
        });

        return this.usersRepository.save(user);
    }

    async findOne(id: string): Promise<User> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'organizationId']
        });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'isActive', 'role', 'organizationId']
        });
    }
    async updateRole(id: string, role: string): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        // Cast string to Role enum (validation should be done in DTO/Controller)
        user.role = role as any;
        return this.usersRepository.save(user);
    }
}
