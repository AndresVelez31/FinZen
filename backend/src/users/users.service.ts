// Imports
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { Role } from './enums/role.enum.js';
import type { CredentialsInterface } from './interfaces/credentials.interface.js';

// Exports
// The password column is `select: false`: every method returns users without
// it, and only findCredentials() reads the hash, for the sign-in.
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('El usuario no existe.');
    }
    return user;
  }

  // Used by JwtAuthProvider on every request: null rejects the token.
  async findActive(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id, active: true });
  }

  async findCredentials(email: string): Promise<CredentialsInterface | null> {
    const row = await this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        password: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!row) {
      return null;
    }

    const { password: passwordHash, ...user } = row;
    return { user, passwordHash };
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number): Promise<User> {
    if (id === currentUserId) {
      throw new BadRequestException('No puedes modificar tu propio usuario.');
    }

    const user = await this.findOne(id);

    if (updateUserDto.role !== undefined) {
      if (!Object.values(Role).includes(updateUserDto.role)) {
        throw new BadRequestException('El rol no es válido.');
      }
      user.role = updateUserDto.role;
    }

    if (updateUserDto.active !== undefined) {
      if (typeof updateUserDto.active !== 'boolean') {
        throw new BadRequestException('El estado del usuario no es válido.');
      }
      user.active = updateUserDto.active;
    }

    return await this.usersRepository.save(user);
  }
}
