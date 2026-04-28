import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
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
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  create(
    @CurrentUser() currentUser: UserResponseDto,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.create(currentUser, createUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto, isArray: true })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, type: CurrentUserResponseDto })
  me(
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<CurrentUserResponseDto> {
    return this.usersService.findCurrentUserProfile(currentUser.id);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user detail' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user detail' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  update(
    @CurrentUser() currentUser: UserResponseDto,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(currentUser, id, updateUserDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: HttpStatus.OK })
  async remove(
    @CurrentUser() currentUser: UserResponseDto,
    @Param('id') id: string,
  ): Promise<void> {
    return this.usersService.remove(currentUser, id);
  }
}
