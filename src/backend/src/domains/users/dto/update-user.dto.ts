import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description:
      'API-assignable roles are `admin` and `user` for super admins. Admin-managed updates can only keep or assign `user`. `super_admin` cannot be assigned through the API.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
