import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { PasswordService } from '../../common/security/password.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { MenusService } from '../menus/menus.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserRole } from './entities/user.entity';
import { PagedResponseDto } from 'src/common/dto/paged-response.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
    private readonly menusService: MenusService,
    private readonly cacheService: CacheService,
  ) {}

  async create(
    actor: UserResponseDto,
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const role = this.resolveCreateRole(actor, createUserDto.role);
    const response = await this.createUserRecord(
      {
        email: createUserDto.email,
        username: createUserDto.username,
        fullname: createUserDto.fullname,
        password: createUserDto.password,
        role,
      },
      `Failed to create user ${createUserDto.username}`,
    );

    try {
      await this.cacheService.delByPattern('users:list:*');
    } catch (e) {
      this.logger.error(
        `Failed to create user ${createUserDto.username}`,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        `Failed to create ${createUserDto.username}`,
      );
    }

    return response;
  }

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const response = await this.createUserRecord(
      {
        email: registerDto.email,
        username: registerDto.username,
        fullname: registerDto.fullname,
        password: registerDto.password,
        role: UserRole.USER,
      },
      `Failed to register ${registerDto.username}`,
    );

    try {
      await this.cacheService.delByPattern('users:list:*');
    } catch (err) {
      this.logger.error(
        `Failed to register ${registerDto.username}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        `Failed to register ${registerDto.username}`,
      );
    }

    return response;
  }

  async findAll(
    query: ListUsersQueryDto,
  ): Promise<PagedResponseDto<UserResponseDto>> {
    const key = await this.cacheService.generateKey(
      'users',
      'list',
      this.cacheService.generateQueryHash(query),
    );
    const cached =
      await this.cacheService.get<PagedResponseDto<UserResponseDto>>(key);
    if (cached) return cached;

    let users: User[] = [];
    let total = 0;
    try {
      const builder = this.usersRepository.createQueryBuilder('user');

      if (query.search) {
        const search = `%${query.search.trim()}%`;
        builder.andWhere(
          new Brackets((qb) => {
            qb.where('user.email ILIKE :search', { search })
              .orWhere('user.username ILIKE :search', { search })
              .orWhere('user.fullname ILIKE :search', { search });
          }),
        );
      }

      if (query.role) {
        builder.andWhere('user.role = :role', { role: query.role });
      }

      [users, total] = await builder
        .orderBy('user.created_at', 'DESC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();
    } catch (e) {
      this.logger.error(
        'Failed to fetch all user',
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException('Failed to fetch all user');
    }

    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const response = {
      result: users.map((user) => this.toResponse(user)),
      pagination: {
        page: query.page,
        limit,
        total,
        totalPages,
      },
      metadata: {
        searchableFields: ['email', 'username', 'fullname'],
        filterableFields: ['role'],
      },
    };

    try {
      await this.cacheService.set(key, response);
    } catch (e) {
      this.logger.error(
        'Failed to fetch all user',
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException('Failed to fetch all user');
    }

    return response;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findActiveUserById(id);
    return this.toResponse(user);
  }

  async findActiveUserById(id: string): Promise<User> {
    let user: User | null;
    try {
      user = await this.usersRepository.findOne({ where: { id } });
    } catch (e) {
      this.logger.error(
        `Failed to fetch user with ID ${id}`,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        `Failed to fetch user with ID ${id}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findActiveUserForAuth(identifier: string): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.deleted_at IS NULL')
        .andWhere(
          new Brackets((qb) => {
            qb.where('LOWER(user.email) = LOWER(:identifier)', {
              identifier,
            }).orWhere('LOWER(user.username) = LOWER(:identifier)', {
              identifier,
            });
          }),
        )
        .getOne();
    } catch (e) {
      this.logger.error(
        'Failed to fetch user for authentication',
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        'Failed to fetch user for authentication',
      );
    }
  }

  async findActiveUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.deleted_at IS NULL')
        .andWhere('LOWER(user.email) = LOWER(:email)', {
          email: email.trim(),
        })
        .getOne();
    } catch (e) {
      this.logger.error(
        'Failed to fetch user by email',
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException('Failed to fetch user by email');
    }
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const user = await this.findActiveUserById(userId);
    user.password = await this.passwordService.hash(password);
    try {
      await this.usersRepository.save(user);
    } catch (e) {
      this.logger.error(
        `Failed to update password for user with ID ${userId}`,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        `Failed to update password for user with ID ${userId}`,
      );
    }
  }

  async update(
    actor: UserResponseDto,
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findVisibleUserOrThrow(actor, id);

    if (actor.id !== user.id && actor.role === UserRole.USER) {
      throw new ForbiddenException(
        'You cannot update a user with a higher role',
      );
    }

    if (
      updateUserDto.email &&
      updateUserDto.email.trim().toLowerCase() !== user.email
    ) {
      await this.ensureUniqueFields(updateUserDto.email, undefined, user.id);
      user.email = updateUserDto.email.trim().toLowerCase();
    }

    if (
      updateUserDto.username &&
      updateUserDto.username.trim() !== user.username
    ) {
      await this.ensureUniqueFields(undefined, updateUserDto.username, user.id);
      user.username = updateUserDto.username.trim();
    }

    if (updateUserDto.fullname) {
      user.fullname = updateUserDto.fullname.trim();
    }

    if (updateUserDto.role && updateUserDto.role !== user.role) {
      user.role = this.resolveUpdateRole(actor, updateUserDto.role);
    }

    if (updateUserDto.password) {
      user.password = await this.passwordService.hash(updateUserDto.password);
    }

    try {
      const updatedUser = await this.usersRepository.save(user);
      await this.cacheService.delByPattern('users:list:*');
      return this.toResponse(updatedUser);
    } catch (e) {
      this.logger.error(
        `Failed to update user with ID ${user.id}`,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        `Failed to update user with ID ${user.id}`,
      );
    }
  }

  async remove(actor: UserResponseDto, id: string): Promise<void> {
    if (actor.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const user = await this.findActiveUserById(id);
    try {
      await this.usersRepository.softDelete({ id: user.id });
      await this.cacheService.delByPattern('users:list:*');
    } catch (e) {
      this.logger.error(
        `Failed to delete user with ID ${user.id}`,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        `Failed to delete user with ID ${user.id}`,
      );
    }
  }

  async findOneForCurrentUser(id: string): Promise<UserResponseDto> {
    const user = await this.findActiveUserById(id);
    return this.toResponse(user);
  }

  async findCurrentUserProfile(id: string): Promise<CurrentUserResponseDto> {
    const currentUser = await this.findOneForCurrentUser(id);
    const availableMenus = await this.menusService.findAll(currentUser);

    return {
      ...currentUser,
      availableMenus,
    };
  }

  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async createUserRecord(
    input: {
      email: string;
      username: string;
      fullname: string;
      password?: string;
      role: UserRole;
    },
    failureMessage = 'Failed to create user',
  ): Promise<UserResponseDto> {
    await this.ensureUniqueFields(input.email, input.username);

    const user = this.usersRepository.create({
      id: randomUUID(),
      email: input.email.trim().toLowerCase(),
      username: input.username.trim(),
      fullname: input.fullname.trim(),
      role: input.role,
      password: await this.passwordService.hash(input.password as string),
    });

    let savedUser: User;
    try {
      savedUser = await this.usersRepository.save(user);
    } catch (e) {
      this.logger.error(
        failureMessage,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(failureMessage);
    }
    return this.toResponse(savedUser);
  }

  private async ensureUniqueFields(
    email?: string,
    username?: string,
    excludeUserId?: string,
  ): Promise<void> {
    if (email) {
      let existingEmailUser: User | null;
      try {
        existingEmailUser = await this.usersRepository
          .createQueryBuilder('user')
          .where('LOWER(user.email) = LOWER(:email)', { email })
          .andWhere(excludeUserId ? 'user.id != :excludeUserId' : '1=1', {
            excludeUserId,
          })
          .getOne();
      } catch (e) {
        this.logger.error(
          'Failed to validate user email uniqueness',
          e instanceof Error ? e.stack : String(e),
        );
        throw new InternalServerErrorException(
          'Failed to validate user email uniqueness',
        );
      }

      if (existingEmailUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (username) {
      let existingUsernameUser: User | null;
      try {
        existingUsernameUser = await this.usersRepository
          .createQueryBuilder('user')
          .where('LOWER(user.username) = LOWER(:username)', { username })
          .andWhere(excludeUserId ? 'user.id != :excludeUserId' : '1=1', {
            excludeUserId,
          })
          .getOne();
      } catch (e) {
        this.logger.error(
          'Failed to validate username uniqueness',
          e instanceof Error ? e.stack : String(e),
        );
        throw new InternalServerErrorException(
          'Failed to validate username uniqueness',
        );
      }

      if (existingUsernameUser) {
        throw new ConflictException('Username is already in use');
      }
    }
  }

  private resolveCreateRole(
    actor: UserResponseDto,
    requestedRole: UserRole,
  ): UserRole {
    if (requestedRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'super_admin can only be created manually through the database',
      );
    }

    if (actor.role === UserRole.SUPER_ADMIN) {
      return requestedRole;
    }

    if (actor.role === UserRole.ADMIN) {
      return UserRole.USER;
    }

    throw new ForbiddenException('You do not have permission to create users');
  }

  private resolveUpdateRole(
    actor: UserResponseDto,
    requestedRole: UserRole,
  ): UserRole {
    if (requestedRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'super_admin can only be created manually through the database',
      );
    }

    if (actor.role === UserRole.SUPER_ADMIN) {
      return requestedRole;
    }

    if (actor.role === UserRole.ADMIN && requestedRole === UserRole.USER) {
      return requestedRole;
    }

    throw new ForbiddenException('You do not have permission to update roles');
  }

  private async findVisibleUserOrThrow(
    actor: UserResponseDto,
    id: string,
  ): Promise<User> {
    const visibleRoles = this.getVisibleRoles(actor.role);
    let user: User | null;
    try {
      user = await this.usersRepository.findOne({
        where: {
          id,
          role: In(visibleRoles),
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to fetch visible user with ID ${id}`,
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        `Failed to fetch visible user with ID ${id}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private getVisibleRoles(actorRole: UserRole): UserRole[] {
    if (actorRole === UserRole.SUPER_ADMIN) {
      return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER];
    }

    if (actorRole === UserRole.ADMIN) {
      return [UserRole.ADMIN, UserRole.USER];
    }

    return [];
  }
}
