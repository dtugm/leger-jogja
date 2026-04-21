import { Test, TestingModule } from '@nestjs/testing';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { UserRole } from '../users/entities/user.entity';

describe('MenusController', () => {
  let controller: MenusController;
  const menusService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllForSuperAdmin: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: MenusService,
          useValue: menusService,
        },
      ],
    }).compile();

    controller = module.get<MenusController>(MenusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates role-aware tree listing to the service', async () => {
    const actor = {
      id: 'user-id',
      email: 'user@example.com',
      username: 'user',
      fullname: 'Example User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await controller.findMyMenus(actor);

    expect(menusService.findAll).toHaveBeenCalledWith(actor);
  });

  it('delegates full tree listing to the service for super admin endpoint', async () => {
    const query = { page: 2, limit: 5 };
    await controller.findAllForSuperAdmin(query);

    expect(menusService.findAllForSuperAdmin).toHaveBeenCalledWith(query);
  });
});
