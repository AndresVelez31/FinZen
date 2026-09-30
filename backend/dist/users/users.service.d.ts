import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import type { CredentialsInterface } from './interfaces/credentials.interface.js';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findActive(id: number): Promise<User | null>;
    findCredentials(email: string): Promise<CredentialsInterface | null>;
    update(id: number, updateUserDto: UpdateUserDto, currentUserId: number): Promise<User>;
}
