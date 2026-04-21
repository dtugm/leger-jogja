import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
