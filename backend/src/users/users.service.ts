import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

// The password column is `select: false`: every method returns users without
// it. Only findByEmailWithPassword() reads the hash, and only the sign-in uses it.
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

  // For the sign-in only: AuthService compares the hash and never returns this user.
  async findByEmailWithPassword(email: string): Promise<User | null> {
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

}
