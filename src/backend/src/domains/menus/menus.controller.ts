import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserRole } from '../users/entities/user.entity';
import { PagedResponseDto } from 'src/common/dto/paged-response.dto';
import { MenusService } from './menus.service';
import { MenuAdminTreeResponseDto } from './dto/menu-admin-tree-response.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { ListMenusQueryDto } from './dto/list-menus-query.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { MenuTreeResponseDto } from './dto/menu-tree-response.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('menus')
@ApiBearerAuth()
@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MenuResponseDto })
  create(@Body() createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all menus as a tree with full details' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MenuAdminTreeResponseDto,
    isArray: true,
  })
  findAllForSuperAdmin(
    @Query() query: ListMenusQueryDto,
  ): Promise<PagedResponseDto<MenuAdminTreeResponseDto>> {
    return this.menusService.findAllForSuperAdmin(query);
  }

  @Get('my-menus')
  @ApiOperation({ summary: 'List menus as a tree' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MenuTreeResponseDto,
    isArray: true,
  })
  findMyMenus(
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<MenuTreeResponseDto[]> {
    return this.menusService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu detail' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuResponseDto })
  findOne(
    @CurrentUser() currentUser: UserResponseDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MenuResponseDto> {
    return this.menusService.findOne(currentUser, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update menu detail' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a menu and all descendants' })
  @ApiResponse({ status: HttpStatus.OK })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.menusService.remove(id);
  }
}
