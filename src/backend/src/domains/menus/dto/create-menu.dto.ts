import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class CreateMenuDto {
  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Parent menu identifier. Omit or send null for root menu.',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  icon?: string | null;

  @ApiProperty({
    description: 'Internal application route for the menu item.',
  })
  @IsString()
  @IsNotEmpty()
  href: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  index: number;

  @ApiProperty({
    enum: UserRole,
    isArray: true,
    description: 'Roles allowed to see this menu item.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
