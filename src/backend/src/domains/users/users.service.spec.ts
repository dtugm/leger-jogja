import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordService } from '../../common/security/password.service';
import { MenusService } from '../menus/menus.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

type PersistedUser = Pick<
  User,
  'email' | 'username' | 'fullname' | 'role' | 'password'
> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
  };
  const menusService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: PasswordService, useValue: passwordService },
        { provide: MenusService, useValue: menusService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('creates a user with hashed password', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    const dto: CreateUserDto = {
      email: 'user@example.com',
      username: 'user',
      fullname: 'Example User',
      role: UserRole.USER,
      password: 'password123',
    };
    const savedUser = {
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'Example User',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    passwordService.hash.mockResolvedValue('hashed-password');
    repository.create.mockReturnValue({
      ...savedUser,
      password: 'hashed-password',
    });
    repository.save.mockResolvedValue(savedUser);

    await expect(
      service.create(
        {
          id: 'super-admin-id',
          email: 'root@example.com',
          username: 'root',
          fullname: 'Root User',
          role: UserRole.SUPER_ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        dto,
      ),
    ).resolves.toMatchObject({
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      role: UserRole.USER,
    });
    expect(passwordService.hash).toHaveBeenCalledWith('password123');
  });

  it('toResponse should not include password', () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'User',
      role: UserRole.USER,
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    const response = service.toResponse(user);
    expect(response).not.toHaveProperty('password');
  });

  it('prevents self-deletion', async () => {
    repository.findOne.mockResolvedValue({
      id: 'user-id',
      role: UserRole.USER,
    });

    await expect(
      service.remove(
        {
          id: 'user-id',
          email: 'admin@example.com',
          username: 'admin',
          fullname: 'Admin User',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'user-id',
      ),
    ).rejects.toThrow('You cannot delete your own account');
  });

  it('forces admin-created accounts to remain user role', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    passwordService.hash.mockResolvedValue('hashed-password');
    repository.create.mockImplementation((payload: PersistedUser) => payload);
    repository.save.mockImplementation((payload: PersistedUser) => ({
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.create(
      {
        id: 'admin-id',
        email: 'admin@example.com',
        username: 'admin',
        fullname: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'editor@example.com',
        username: 'editor',
        fullname: 'Editor User',
        role: UserRole.ADMIN,
        password: 'password123',
      },
    );

    expect(result.role).toBe(UserRole.USER);
  });

  it('registers a public account as user role', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    passwordService.hash.mockResolvedValue('hashed-password');
    repository.create.mockImplementation((payload: PersistedUser) => payload);
    repository.save.mockImplementation((payload: PersistedUser) => ({
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.register({
      email: 'self.user@example.com',
      username: 'selfuser',
      fullname: 'Self User',
      password: 'password123',
    });

    expect(result.role).toBe(UserRole.USER);
  });

  it('rejects assigning super_admin through API', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.create(
        {
          id: 'super-admin-id',
          email: 'root@example.com',
          username: 'root',
          fullname: 'Root User',
          role: UserRole.SUPER_ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: 'boss@example.com',
          username: 'boss',
          fullname: 'Boss User',
          role: UserRole.SUPER_ADMIN,
          password: 'password123',
        },
      ),
    ).rejects.toThrow(
      'super_admin can only be created manually through the database',
    );
  });

  it('prevents admin from promoting a user to admin', async () => {
    repository.findOne.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'User Account',
      role: UserRole.USER,
    });

    await expect(
      service.update(
        {
          id: 'admin-id',
          email: 'admin@example.com',
          username: 'admin',
          fullname: 'Admin User',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'user-id',
        { role: UserRole.ADMIN },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns current user profile with available menus', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'User Account',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    const availableMenus = [
      {
        name: 'Assets',
        icon: 'folder',
        href: '/assets',
        index: 1,
        children: [],
      },
    ];

    repository.findOne.mockResolvedValue(user);
    menusService.findAll.mockResolvedValue(availableMenus);

    await expect(service.findCurrentUserProfile('user-id')).resolves.toEqual({
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'User Account',
      role: UserRole.USER,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      availableMenus,
    });
    expect(menusService.findAll).toHaveBeenCalledWith({
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'User Account',
      role: UserRole.USER,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });
});
