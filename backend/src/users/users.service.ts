// External imports
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

// Internal imports
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { Role } from './enums/role.enum.js';

// Exports
// The password column is `select: false`: every method returns users without
// it. Only findCredentialsByEmail() reads the hash, and only the sign-in uses it.
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

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }

  // Saves a regular active user. It returns the user read back, because the saved
  // entity still carries the hash and the column is `select: false`. It runs inside the
  // sign-up transaction (manager), which also copies the activity template.
  async create(
    name: string,
    email: string,
    passwordHash: string,
    manager: EntityManager,
  ): Promise<User> {
    const repository = manager.getRepository(User);
    const saved = await repository.save(
      repository.create({
        name,
        email,
        password: passwordHash,
        role: Role.User,
        active: true,
      }),
    );
    const user = await repository.findOneBy({ id: saved.id });
    if (!user) {
      throw new NotFoundException('El usuario no existe.');
    }
    return user;
  }

  // For the sign-in only: AuthService compares the hash and never returns this user.
  async findCredentialsByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
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
