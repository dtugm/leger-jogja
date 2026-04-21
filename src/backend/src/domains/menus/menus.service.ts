import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuAdminTreeResponseDto } from './dto/menu-admin-tree-response.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { ListMenusQueryDto } from './dto/list-menus-query.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { MenuTreeResponseDto } from './dto/menu-tree-response.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, QueryFailedError, Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { randomUUID } from 'crypto';
import { PagedResponseDto } from 'src/common/dto/paged-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserRole } from '../users/entities/user.entity';

type TreeNode<TNode> = {
  id: string;
  parentId: string | null;
  index: number;
  createdAt: Date;
  children: TNode[];
};

interface MenuTreeNode extends TreeNode<MenuTreeNode> {
  name: string;
  icon: string | null;
  href: string;
}

interface MenuAdminTreeNode extends TreeNode<MenuAdminTreeNode> {
  name: string;
  icon: string | null;
  href: string;
  roles: UserRole[];
  updatedAt: Date;
}

type MenuConstraintError = {
  code?: string;
  constraint?: string;
};

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menusRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.executeMutation(async (manager) => {
      const parentId = createMenuDto.parentId ?? null;
      const href = createMenuDto.href.trim();

      await this.ensureParentExists(manager, parentId, 'Parent menu not found');
      await this.ensureUniqueHref(manager, href);
      await this.ensureAcceptedIndexForCreate(
        manager,
        parentId,
        createMenuDto.index,
      );

      const menu = manager.create(Menu, {
        id: randomUUID(),
        parentId,
        name: createMenuDto.name.trim(),
        icon: createMenuDto.icon?.trim() ?? null,
        href,
        index: createMenuDto.index,
        roles: createMenuDto.roles,
      });

      const savedMenu = await manager.save(Menu, menu);

      return this.toResponse(savedMenu);
    });
  }

  async findAll(actor: UserResponseDto): Promise<MenuTreeResponseDto[]> {
    const menus = await this.findVisibleMenus(actor.role);
    return this.buildPublicTree(menus);
  }

  async findAllForSuperAdmin(
    query: ListMenusQueryDto,
  ): Promise<PagedResponseDto<MenuAdminTreeResponseDto>> {
    const menus = await this.menusRepository.find({
      order: {
        index: 'ASC',
        createdAt: 'ASC',
      },
    });

    const tree = this.buildAdminTree(menus);
    const total = tree.length;
    const page = query.page;
    const limit = query.limit;
    const start = (page - 1) * limit;

    return {
      result: tree.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(actor: UserResponseDto, id: string): Promise<MenuResponseDto> {
    const menu = await this.findVisibleMenuOrThrow(actor.role, id);
    return this.toResponse(menu);
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.executeMutation(async (manager) => {
      const existingMenu = await this.findMenuOrThrow(manager, id);
      const nextParentId = this.hasProperty(updateMenuDto, 'parentId')
        ? (updateMenuDto.parentId ?? null)
        : existingMenu.parentId;

      if (nextParentId === id) {
        throw new BadRequestException('Menu cannot be its own parent');
      }

      await this.ensureParentExists(
        manager,
        nextParentId,
        'Parent menu not found',
      );

      if (nextParentId) {
        await this.ensureNoCycle(manager, id, nextParentId);
      }

      const nextHref = this.hasProperty(updateMenuDto, 'href')
        ? updateMenuDto.href!.trim()
        : existingMenu.href;
      const nextIndex = this.hasProperty(updateMenuDto, 'index')
        ? updateMenuDto.index!
        : existingMenu.index;
      if (nextHref !== existingMenu.href) {
        await this.ensureUniqueHref(manager, nextHref, id);
      }
      await this.ensureAcceptedIndexForUpdate(
        manager,
        id,
        nextParentId,
        nextIndex,
      );

      const updatedMenu: Menu = {
        ...existingMenu,
        parentId: nextParentId,
        name: this.hasProperty(updateMenuDto, 'name')
          ? updateMenuDto.name!.trim()
          : existingMenu.name,
        icon: this.hasProperty(updateMenuDto, 'icon')
          ? (updateMenuDto.icon?.trim() ?? null)
          : existingMenu.icon,
        href: nextHref,
        index: nextIndex,
        roles: this.hasProperty(updateMenuDto, 'roles')
          ? updateMenuDto.roles!
          : existingMenu.roles,
      };

      const sourceParentId = existingMenu.parentId;

      if (sourceParentId === nextParentId) {
        const savedMenu = await manager.save(Menu, updatedMenu);

        return this.toResponse(savedMenu);
      }

      const previousGroup = await this.findSiblingGroup(
        manager,
        sourceParentId,
        new Set([id]),
      );
      const savedMenu = await manager.save(Menu, updatedMenu);
      await this.persistSiblingGroup(manager, previousGroup);

      return this.toResponse(savedMenu);
    });
  }

  async remove(id: string): Promise<void> {
    await this.executeMutation(async (manager) => {
      const targetMenu = await this.findMenuOrThrow(manager, id);
      const remainingSiblings = await this.findSiblingGroup(
        manager,
        targetMenu.parentId,
        new Set([id]),
      );

      await manager.remove(Menu, targetMenu);
      await this.persistSiblingGroup(manager, remainingSiblings);
    });
  }

  private async findVisibleMenus(role: UserRole): Promise<Menu[]> {
    const queryBuilder = this.menusRepository
      .createQueryBuilder('menu')
      .orderBy('menu.index', 'ASC')
      .addOrderBy('menu.createdAt', 'ASC')
      .select([
        'menu.id',
        'menu.parentId',
        'menu.name',
        'menu.icon',
        'menu.href',
        'menu.index',
        'menu.roles',
        'menu.createdAt',
      ]);

    if (role !== UserRole.SUPER_ADMIN) {
      queryBuilder.where(':role = ANY(menu.roles)', { role });
    }
    return queryBuilder.getMany();
  }

  private async findVisibleMenuOrThrow(
    role: UserRole,
    id: string,
  ): Promise<Menu> {
    const queryBuilder = this.menusRepository
      .createQueryBuilder('menu')
      .where('menu.id = :id', { id });

    if (role !== UserRole.SUPER_ADMIN) {
      queryBuilder.andWhere(':role = ANY(menu.roles)', { role });
    }

    const menu = await queryBuilder.getOne();

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return menu;
  }

  private async findMenuOrThrow(
    manager: EntityManager,
    id: string,
    message = 'Menu not found',
  ): Promise<Menu> {
    const menu = await manager.findOne(Menu, { where: { id } });

    if (!menu) {
      throw new NotFoundException(message);
    }

    return menu;
  }

  private findMenuFromCollectionOrThrow(
    menus: Menu[],
    id: string,
    message = 'Menu not found',
  ): Menu {
    const menu = menus.find((item) => item.id === id);

    if (!menu) {
      throw new NotFoundException(message);
    }

    return menu;
  }

  private async ensureParentExists(
    manager: EntityManager,
    parentId: string | null,
    message: string,
  ): Promise<void> {
    if (!parentId) {
      return;
    }

    await this.findMenuOrThrow(manager, parentId, message);
  }

  private async ensureUniqueHref(
    manager: EntityManager,
    href: string,
    excludeId?: string,
  ): Promise<void> {
    const duplicatedMenu = await manager.findOne(Menu, {
      where: { href },
    });

    if (duplicatedMenu) {
      if (excludeId && duplicatedMenu.id === excludeId) {
        return;
      }

      throw new ConflictException('Menu href is already in use');
    }
  }

  private async ensureNoCycle(
    manager: EntityManager,
    id: string,
    parentId: string,
  ): Promise<void> {
    let currentParentId: string | null = parentId;

    while (currentParentId) {
      if (currentParentId === id) {
        throw new BadRequestException(
          'Menu cannot be assigned to one of its descendants',
        );
      }

      const parentMenu = await this.findMenuOrThrow(
        manager,
        currentParentId,
        'Parent menu not found',
      );
      currentParentId = parentMenu.parentId;
    }
  }

  private async ensureAcceptedIndexForCreate(
    manager: EntityManager,
    parentId: string | null,
    index: number,
  ): Promise<void> {
    const siblings = await this.findSiblingGroup(manager, parentId);
    this.ensureIndexIsAvailable(siblings, index);
  }

  private async ensureAcceptedIndexForUpdate(
    manager: EntityManager,
    id: string,
    parentId: string | null,
    index: number,
  ): Promise<void> {
    const siblings = await this.findSiblingGroup(
      manager,
      parentId,
      new Set([id]),
    );
    this.ensureIndexIsAvailable(siblings, index);
  }

  private ensureIndexIsAvailable(siblings: Menu[], index: number): void {
    const duplicatedIndex = siblings.some((menu) => menu.index === index);

    if (duplicatedIndex) {
      throw new ConflictException('Menu index is already in use');
    }
  }

  private async findSiblingGroup(
    manager: EntityManager,
    parentId: string | null,
    excludedIds: Set<string> = new Set(),
  ): Promise<Menu[]> {
    const menus = await manager.find(Menu, {
      where: {
        parentId: parentId === null ? IsNull() : parentId,
      },
      order: {
        index: 'ASC',
        createdAt: 'ASC',
      },
    });

    if (excludedIds.size === 0) {
      return menus;
    }

    return menus.filter((menu) => !excludedIds.has(menu.id));
  }
  private hasProperty<T extends object>(
    value: T,
    key: keyof CreateMenuDto,
  ): boolean {
    return Boolean(Object.prototype.hasOwnProperty.call(value, key));
  }

  private async persistSiblingGroup(
    manager: EntityManager,
    menus: Menu[],
  ): Promise<Menu[]> {
    if (menus.length === 0) {
      return [];
    }

    const temporaryMenus = menus.map((menu, index) => ({
      ...menu,
      index: -(index + 1),
    }));
    const persistedMenus = temporaryMenus.filter((menu) =>
      this.isPersistedMenu(menu),
    );
    const newMenus = temporaryMenus.filter(
      (menu) => !this.isPersistedMenu(menu),
    );

    if (persistedMenus.length > 0) {
      await manager.save(Menu, persistedMenus);
    }

    if (newMenus.length > 0) {
      await manager.save(Menu, newMenus);
    }

    return await manager.save(
      Menu,
      menus.map((menu, index) => ({
        ...menu,
        index: index + 1,
      })),
    );
  }

  private isPersistedMenu(menu: Partial<Menu>): menu is Menu {
    return menu.createdAt instanceof Date && menu.updatedAt instanceof Date;
  }

  private buildPublicTree(menus: Menu[]): MenuTreeResponseDto[] {
    const tree = this.buildTree(menus, (menu) => ({
      id: menu.id,
      parentId: menu.parentId,
      name: menu.name,
      icon: menu.icon,
      href: menu.href,
      index: menu.index,
      createdAt: menu.createdAt,
      children: [],
    }));

    return this.stripTreeMetadata(tree);
  }

  private buildAdminTree(menus: Menu[]): MenuAdminTreeResponseDto[] {
    return this.buildTree<MenuAdminTreeNode>(menus, (menu) => ({
      ...this.toResponse(menu),
      children: [],
    }));
  }

  private buildTree<TNode extends TreeNode<TNode>>(
    menus: Menu[],
    createNode: (menu: Menu) => TNode,
  ): TNode[] {
    const nodes = new Map<string, TNode>();

    for (const menu of menus) {
      nodes.set(menu.id, createNode(menu));
    }

    const roots: TNode[] = [];

    for (const menu of menus) {
      const node = nodes.get(menu.id)!;
      const parentNode = menu.parentId ? nodes.get(menu.parentId) : undefined;

      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return this.sortNodes(roots);
  }

  private sortNodes<TNode extends TreeNode<TNode>>(nodes: TNode[]): TNode[] {
    return nodes
      .sort((left, right) => {
        if (left.index !== right.index) {
          return left.index - right.index;
        }

        return left.createdAt.getTime() - right.createdAt.getTime();
      })
      .map((node) => ({
        ...node,
        children: this.sortNodes(node.children),
      }));
  }

  private stripTreeMetadata(nodes: MenuTreeNode[]): MenuTreeResponseDto[] {
    return nodes.map((node) => ({
      name: node.name,
      icon: node.icon,
      href: node.href,
      index: node.index,
      children: this.stripTreeMetadata(node.children),
    }));
  }

  toResponse(menu: Menu): MenuResponseDto {
    return {
      id: menu.id,
      parentId: menu.parentId,
      name: menu.name,
      icon: menu.icon,
      href: menu.href,
      index: menu.index,
      roles: menu.roles,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  }

  private async executeMutation<T>(
    callback: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.menusRepository.manager.transaction(async (manager) => {
      try {
        return await callback(manager);
      } catch (error) {
        this.rethrowPersistenceError(error);
      }
    });
  }

  private rethrowPersistenceError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as MenuConstraintError;

      if (driverError.code === '23505') {
        if (driverError.constraint === 'UQ_menus_href') {
          throw new ConflictException('Menu href is already in use');
        }

        if (
          driverError.constraint === 'UQ_menus_root_index' ||
          driverError.constraint === 'UQ_menus_parent_index'
        ) {
          throw new ConflictException('Menu index is already in use');
        }

        throw new ConflictException(
          'Menu data violates a uniqueness constraint',
        );
      }

      if (
        driverError.code === '23503' &&
        driverError.constraint === 'FK_menus_parent_id'
      ) {
        throw new NotFoundException('Parent menu not found');
      }
    }

    throw error;
  }
}
