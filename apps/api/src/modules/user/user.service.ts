import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../database/entities';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Permission } from '../../database/entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: createUserDto.password, // Will be hashed by entity hooks
    });

    return this.userRepository.save(user);
  }

  async findAll(accessibleOrgIds: string[]): Promise<User[]> {
    // Only return users who have permissions in the accessible organizations
    const userIds = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.userId', 'userId')
      .where('permission.orgId IN (:...orgIds)', { orgIds: accessibleOrgIds })
      .getRawMany();

    const userIdList = userIds.map(p => p.userId);

    if (userIdList.length === 0) {
      return [];
    }

    return this.userRepository.find({
      where: { id: In(userIdList) },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });
  }

  async findAllForAccessPermissions(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
    
    return users;
  }

  async findOne(id: string, accessibleOrgIds: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findOneForAccessPermissions(id: string): Promise<User> {
    // For Access & Permissions page, allow access to any user
    // The RBAC guard already ensures only ADMIN and OWNER can access this endpoint
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, accessibleOrgIds: string[]): Promise<User> {
    const user = await this.findOne(id, accessibleOrgIds);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async updateForAccessPermissions(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // For Access & Permissions page, allow updating any user
    // The RBAC guard already ensures only ADMIN and OWNER can access this endpoint
    const user = await this.findOneForAccessPermissions(id);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async remove(id: string, accessibleOrgIds: string[]): Promise<void> {
    const user = await this.findOne(id, accessibleOrgIds);
    await this.userRepository.remove(user);
  }

  async removeForAccessPermissions(id: string): Promise<void> {
    // For Access & Permissions page, allow removing any user
    // The RBAC guard already ensures only OWNER can access this endpoint
    const user = await this.findOneForAccessPermissions(id);
    await this.userRepository.remove(user);
  }
}
