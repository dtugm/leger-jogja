import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenusService } from './menus.service';
import { Menu } from './entities/menu.entity';
import { UserRole } from '../users/entities/user.entity';

type MenuRecord = Menu;
type FindOptions = {
  where?: Record<string, unknown>;
  order?: Record<string, 'ASC' | 'DESC'>;
};

type MockEntityManager = {
  create: jest.Mock<MenuRecord, [typeof Menu, Partial<MenuRecord>]>;
  find: jest.Mock<Promise<MenuRecord[]>, [typeof Menu, FindOptions?]>;
  findOne: jest.Mock<Promise<MenuRecord | null>, [typeof Menu, FindOptions?]>;
  save: jest.Mock<
    Promise<MenuRecord[] | MenuRecord>,
    [typeof Menu, Partial<MenuRecord> | Partial<MenuRecord>[]]
  >;
  remove: jest.Mock<Promise<void>, [typeof Menu, MenuRecord | MenuRecord[]]>;
};

type TransactionCallback = (manager: MockEntityManager) => Promise<unknown>;

type RepositoryDouble = {
  createQueryBuilder: jest.Mock;
  find: jest.Mock;
  manager: {
    transaction: jest.Mock<Promise<unknown>, [TransactionCallback]>;
  };
};

describe('MenusService', () => {
  let service: MenusService;
  const repository: RepositoryDouble = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    manager: {
      transaction: jest.fn<Promise<unknown>, [TransactionCallback]>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        { provide: getRepositoryToken(Menu), useValue: repository },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
  });

  const useTransactionManager = (manager: MockEntityManager) => {
    repository.manager.transaction.mockImplementation((callback) =>
      callback(manager),
    );
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a root menu with an unused index and keeps existing sibling indexes unchanged', async () => {
    const { manager, state } = mockTransactionManager([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 1,
      }),
      createMenu({
        id: 'reports-id',
        name: 'Reports',
        href: '/reports',
        index: 2,
      }),
    ]);
    useTransactionManager(manager);

    const createdMenu = await service.create({
      name: 'Assets',
      href: '/assets',
      index: 4,
      roles: [UserRole.ADMIN, UserRole.USER],
    });

    expect(createdMenu.index).toBe(4);
    expect(
      orderByIndex(state, null).map((menu) => `${menu.href}:${menu.index}`),
    ).toEqual(['/settings:1', '/reports:2', '/assets:4']);
  });

  it('rejects duplicate href values on create', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 1,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.create({
        name: 'Assets Copy',
        href: '/assets',
        index: 2,
        roles: [UserRole.ADMIN],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects an invalid parent on create', async () => {
    const { manager } = mockTransactionManager([]);
    useTransactionManager(manager);

    await expect(
      service.create({
        parentId: 'missing-parent-id',
        name: 'Child',
        href: '/child',
        index: 1,
        roles: [UserRole.ADMIN],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects duplicate root indexes on create', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 2,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.create({
        name: 'Assets',
        href: '/assets',
        index: 2,
        roles: [UserRole.ADMIN],
      }),
    ).rejects.toThrow('Menu index is already in use');
  });

  it('rejects duplicate child indexes on create under the same parent', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'root-id',
        name: 'Root',
        href: '/root',
        index: 1,
      }),
      createMenu({
        id: 'child-a',
        parentId: 'root-id',
        name: 'Child A',
        href: '/root/a',
        index: 2,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.create({
        parentId: 'root-id',
        name: 'Child B',
        href: '/root/b',
        index: 2,
        roles: [UserRole.ADMIN],
      }),
    ).rejects.toThrow('Menu index is already in use');
  });

  it('rejects assigning a menu to itself as parent', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'menu-id',
        name: 'Assets',
        href: '/assets',
        index: 1,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.update('menu-id', {
        parentId: 'menu-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects assigning a menu to one of its descendants', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'root-id',
        name: 'Root',
        href: '/root',
        index: 1,
      }),
      createMenu({
        id: 'child-id',
        parentId: 'root-id',
        name: 'Child',
        href: '/child',
        index: 1,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.update('root-id', {
        parentId: 'child-id',
      }),
    ).rejects.toThrow('Menu cannot be assigned to one of its descendants');
  });

  it('updates a menu to an unused index within the same parent without reordering siblings', async () => {
    const { manager, state } = mockTransactionManager([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 1,
      }),
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 2,
      }),
      createMenu({
        id: 'reports-id',
        name: 'Reports',
        href: '/reports',
        index: 3,
      }),
    ]);
    useTransactionManager(manager);

    const updatedMenu = await service.update('reports-id', { index: 5 });

    expect(updatedMenu.index).toBe(5);
    expect(
      orderByIndex(state, null).map((menu) => `${menu.id}:${menu.index}`),
    ).toEqual(['settings-id:1', 'assets-id:2', 'reports-id:5']);
  });

  it('rejects updating a menu to a duplicate index within the same parent', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 1,
      }),
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 2,
      }),
    ]);
    useTransactionManager(manager);

    await expect(service.update('assets-id', { index: 1 })).rejects.toThrow(
      'Menu index is already in use',
    );
  });

  it('moves a menu to a new parent with an unused index and compacts only the source sibling group', async () => {
    const { manager, state } = mockTransactionManager([
      createMenu({
        id: 'root-a',
        name: 'Root A',
        href: '/root-a',
        index: 1,
      }),
      createMenu({
        id: 'root-b',
        name: 'Root B',
        href: '/root-b',
        index: 2,
      }),
      createMenu({
        id: 'child-a1',
        parentId: 'root-a',
        name: 'Child A1',
        href: '/root-a/a1',
        index: 1,
      }),
      createMenu({
        id: 'child-a2',
        parentId: 'root-a',
        name: 'Child A2',
        href: '/root-a/a2',
        index: 2,
      }),
      createMenu({
        id: 'child-b1',
        parentId: 'root-b',
        name: 'Child B1',
        href: '/root-b/b1',
        index: 1,
      }),
    ]);
    useTransactionManager(manager);

    const updatedMenu = await service.update('child-a1', {
      parentId: 'root-b',
      index: 5,
    });

    expect(updatedMenu.parentId).toBe('root-b');
    expect(updatedMenu.index).toBe(5);
    expect(
      orderByIndex(state, 'root-a').map((menu) => `${menu.id}:${menu.index}`),
    ).toEqual(['child-a2:1']);
    expect(
      orderByIndex(state, 'root-b').map((menu) => `${menu.id}:${menu.index}`),
    ).toEqual(['child-b1:1', 'child-a1:5']);
  });

  it('rejects moving a menu to a new parent when the requested index is already used there', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'root-a',
        name: 'Root A',
        href: '/root-a',
        index: 1,
      }),
      createMenu({
        id: 'root-b',
        name: 'Root B',
        href: '/root-b',
        index: 2,
      }),
      createMenu({
        id: 'child-a1',
        parentId: 'root-a',
        name: 'Child A1',
        href: '/root-a/a1',
        index: 1,
      }),
      createMenu({
        id: 'child-b1',
        parentId: 'root-b',
        name: 'Child B1',
        href: '/root-b/b1',
        index: 1,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.update('child-a1', {
        parentId: 'root-b',
        index: 1,
      }),
    ).rejects.toThrow('Menu index is already in use');
  });

  it('keeps the current index when moving to a new parent without index and rejects conflicts there', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'root-a',
        name: 'Root A',
        href: '/root-a',
        index: 1,
      }),
      createMenu({
        id: 'root-b',
        name: 'Root B',
        href: '/root-b',
        index: 2,
      }),
      createMenu({
        id: 'child-a1',
        parentId: 'root-a',
        name: 'Child A1',
        href: '/root-a/a1',
        index: 2,
      }),
      createMenu({
        id: 'child-b1',
        parentId: 'root-b',
        name: 'Child B1',
        href: '/root-b/b1',
        index: 2,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.update('child-a1', {
        parentId: 'root-b',
      }),
    ).rejects.toThrow('Menu index is already in use');
  });

  it('rejects duplicate href values on update', async () => {
    const { manager } = mockTransactionManager([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 1,
      }),
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 2,
      }),
    ]);
    useTransactionManager(manager);

    await expect(
      service.update('assets-id', {
        href: '/settings',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a role-filtered tree sorted by index at each level', async () => {
    const queryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        createMenu({
          id: 'settings-id',
          name: 'Settings',
          href: '/settings',
          index: 3,
          roles: [UserRole.ADMIN],
        }),
        createMenu({
          id: 'assets-id',
          name: 'Assets',
          href: '/assets',
          index: 1,
          roles: [UserRole.ADMIN],
        }),
        createMenu({
          id: 'assets-list-id',
          parentId: 'assets-id',
          name: 'Assets List',
          href: '/assets/list',
          index: 2,
          roles: [UserRole.ADMIN],
        }),
        createMenu({
          id: 'assets-dashboard-id',
          parentId: 'assets-id',
          name: 'Assets Dashboard',
          href: '/assets/dashboard',
          index: 1,
          roles: [UserRole.ADMIN],
        }),
      ]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findAll({
      id: 'admin-id',
      email: 'admin@example.com',
      username: 'admin',
      fullname: 'Admin',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(':role = ANY(menu.roles)', {
      role: UserRole.ADMIN,
    });
    expect(queryBuilder.select).toHaveBeenCalledWith([
      'menu.id',
      'menu.parentId',
      'menu.name',
      'menu.icon',
      'menu.href',
      'menu.index',
      'menu.roles',
      'menu.createdAt',
    ]);
    expect(result).toEqual([
      {
        name: 'Assets',
        icon: null,
        href: '/assets',
        index: 1,
        children: [
          {
            name: 'Assets Dashboard',
            icon: null,
            href: '/assets/dashboard',
            index: 1,
            children: [],
          },
          {
            name: 'Assets List',
            icon: null,
            href: '/assets/list',
            index: 2,
            children: [],
          },
        ],
      },
      {
        name: 'Settings',
        icon: null,
        href: '/settings',
        index: 3,
        children: [],
      },
    ]);
  });

  it('allows super_admin to read all menus without role filter', async () => {
    const queryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await service.findAll({
      id: 'super-admin-id',
      email: 'root@example.com',
      username: 'root',
      fullname: 'Root',
      role: UserRole.SUPER_ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(queryBuilder.where).not.toHaveBeenCalled();
  });

  it('returns a paginated full tree with all menu data for super admin listing', async () => {
    repository.find.mockResolvedValue([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 2,
        roles: [UserRole.SUPER_ADMIN],
      }),
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 1,
        roles: [UserRole.SUPER_ADMIN],
      }),
      createMenu({
        id: 'assets-list-id',
        parentId: 'assets-id',
        name: 'All Assets',
        href: '/assets/list',
        index: 1,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      }),
    ]);

    const result = await service.findAllForSuperAdmin({
      page: 1,
      limit: 10,
    });

    expect(repository.find).toHaveBeenCalledWith({
      order: {
        index: 'ASC',
        createdAt: 'ASC',
      },
    });
    expect(result).toEqual({
      result: [
        {
          id: 'assets-id',
          parentId: null,
          name: 'Assets',
          icon: null,
          href: '/assets',
          index: 1,
          roles: [UserRole.SUPER_ADMIN],
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          children: [
            {
              id: 'assets-list-id',
              parentId: 'assets-id',
              name: 'All Assets',
              icon: null,
              href: '/assets/list',
              index: 1,
              roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              children: [],
            },
          ],
        },
        {
          id: 'settings-id',
          parentId: null,
          name: 'Settings',
          icon: null,
          href: '/settings',
          index: 2,
          roles: [UserRole.SUPER_ADMIN],
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          children: [],
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  it('paginates root menus for super admin listing', async () => {
    repository.find.mockResolvedValue([
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 2,
        roles: [UserRole.SUPER_ADMIN],
      }),
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 1,
        roles: [UserRole.SUPER_ADMIN],
      }),
      createMenu({
        id: 'reports-id',
        name: 'Reports',
        href: '/reports',
        index: 3,
        roles: [UserRole.SUPER_ADMIN],
      }),
      createMenu({
        id: 'assets-list-id',
        parentId: 'assets-id',
        name: 'All Assets',
        href: '/assets/list',
        index: 1,
        roles: [UserRole.SUPER_ADMIN],
      }),
    ]);

    const result = await service.findAllForSuperAdmin({
      page: 2,
      limit: 1,
    });

    expect(result).toEqual({
      result: [
        {
          id: 'settings-id',
          parentId: null,
          name: 'Settings',
          icon: null,
          href: '/settings',
          index: 2,
          roles: [UserRole.SUPER_ADMIN],
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          children: [],
        },
      ],
      pagination: {
        page: 2,
        limit: 1,
        total: 3,
        totalPages: 3,
      },
    });
  });

  it('throws not found when a visible menu cannot be read', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.findOne(
        {
          id: 'user-id',
          email: 'user@example.com',
          username: 'user',
          fullname: 'User',
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'menu-id',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes only the target menu directly, lets the database cascade descendants, and resequences siblings', async () => {
    const { manager, state } = mockTransactionManager([
      createMenu({
        id: 'assets-id',
        name: 'Assets',
        href: '/assets',
        index: 1,
      }),
      createMenu({
        id: 'assets-list-id',
        parentId: 'assets-id',
        name: 'Assets List',
        href: '/assets/list',
        index: 1,
      }),
      createMenu({
        id: 'settings-id',
        name: 'Settings',
        href: '/settings',
        index: 2,
      }),
      createMenu({
        id: 'reports-id',
        name: 'Reports',
        href: '/reports',
        index: 3,
      }),
    ]);
    useTransactionManager(manager);

    await service.remove('assets-id');

    expect(manager.remove).toHaveBeenCalledWith(
      Menu,
      expect.objectContaining({ id: 'assets-id' }),
    );

    expect(state.map((menu) => menu.id)).toEqual(['settings-id', 'reports-id']);
    expect(
      orderByIndex(state, null).map((menu) => `${menu.id}:${menu.index}`),
    ).toEqual(['settings-id:1', 'reports-id:2']);
  });
});

function createMenu(overrides: Partial<MenuRecord>): MenuRecord {
  const baseDate = new Date('2026-01-01T00:00:00.000Z');

  return {
    id: overrides.id ?? randomId(),
    parentId: overrides.parentId ?? null,
    name: overrides.name ?? 'Menu',
    icon: overrides.icon ?? null,
    href: overrides.href ?? `/${overrides.id ?? 'menu'}`,
    index: overrides.index ?? 1,
    roles: overrides.roles ?? [UserRole.ADMIN],
    createdAt: overrides.createdAt ?? baseDate,
    updatedAt: overrides.updatedAt ?? baseDate,
  };
}

function mockTransactionManager(initialMenus: MenuRecord[]) {
  const state = initialMenus.map((menu) => ({ ...menu }));
  const manager: MockEntityManager = {
    create: jest.fn((_entity, payload) => payload as MenuRecord),
    find: jest.fn((_entity, options?: FindOptions) => {
      let result = state.map((menu) => ({ ...menu }));
      const where = options?.where;
      const order = options?.order;

      if (where) {
        result = result.filter((menu) => matchesWhere(menu, where));
      }

      if (order) {
        result.sort((left, right) => compareByOrder(left, right, order));
      }

      return Promise.resolve(result);
    }),
    findOne: jest.fn((_entity, options?: FindOptions) =>
      manager.find(_entity, options).then((result) => result[0] ?? null),
    ),
    save: jest.fn((_entity, payload) => {
      const items: Partial<MenuRecord>[] = Array.isArray(payload)
        ? payload
        : [payload];
      const savedItems = items.map((item, index) => {
        const existingIndex = state.findIndex((menu) => menu.id === item.id);
        const currentDate = new Date(
          `2026-01-0${(index % 8) + 1}T00:00:00.000Z`,
        );
        const nextMenu = {
          ...(existingIndex >= 0 ? state[existingIndex] : {}),
          ...item,
          createdAt:
            existingIndex >= 0
              ? state[existingIndex].createdAt
              : (item.createdAt ?? currentDate),
          updatedAt: currentDate,
        } as MenuRecord;

        if (existingIndex >= 0) {
          state[existingIndex] = nextMenu;
        } else {
          state.push(nextMenu);
        }

        return { ...nextMenu };
      });

      return Promise.resolve(
        Array.isArray(payload) ? savedItems : savedItems[0],
      );
    }),
    remove: jest.fn((_entity, payload) => {
      const items: MenuRecord[] = Array.isArray(payload) ? payload : [payload];
      const idsToDelete = collectCascadeIds(
        state,
        items.map((item) => item.id),
      );

      for (let index = state.length - 1; index >= 0; index -= 1) {
        if (idsToDelete.has(state[index].id)) {
          state.splice(index, 1);
        }
      }

      return Promise.resolve();
    }),
  };

  return { manager, state };
}

function orderByIndex(menus: MenuRecord[], parentId: string | null) {
  return menus
    .filter((menu) => menu.parentId === parentId)
    .sort((left, right) => left.index - right.index);
}

function compareByOrder(
  left: MenuRecord,
  right: MenuRecord,
  order: NonNullable<FindOptions['order']>,
) {
  for (const [field, direction] of Object.entries(order)) {
    const leftValue = left[field as keyof MenuRecord];
    const rightValue = right[field as keyof MenuRecord];

    if (leftValue === rightValue) {
      continue;
    }

    if (leftValue instanceof Date && rightValue instanceof Date) {
      return direction === 'ASC'
        ? leftValue.getTime() - rightValue.getTime()
        : rightValue.getTime() - leftValue.getTime();
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return direction === 'ASC'
        ? leftValue - rightValue
        : rightValue - leftValue;
    }

    const leftString = String(leftValue);
    const rightString = String(rightValue);
    return direction === 'ASC'
      ? leftString.localeCompare(rightString)
      : rightString.localeCompare(leftString);
  }

  return 0;
}

function matchesWhere(menu: MenuRecord, where: Record<string, unknown>) {
  return Object.entries(where).every(([field, expected]) => {
    const actual = menu[field as keyof MenuRecord];

    if (isIsNullOperator(expected)) {
      return actual === null;
    }

    return actual === expected;
  });
}

function isIsNullOperator(value: unknown): value is { _type: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_type' in value &&
    value._type === 'isNull'
  );
}

function collectCascadeIds(menus: MenuRecord[], initialIds: string[]) {
  const ids = new Set<string>();
  const stack = [...initialIds];

  while (stack.length > 0) {
    const currentId = stack.pop()!;

    if (ids.has(currentId)) {
      continue;
    }

    ids.add(currentId);

    for (const menu of menus) {
      if (menu.parentId === currentId) {
        stack.push(menu.id);
      }
    }
  }

  return ids;
}

function randomId() {
  return Math.random().toString(36).slice(2);
}
