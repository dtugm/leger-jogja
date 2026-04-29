import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CurrentUserResponseDto } from 'src/domains/users/dto/current-user-response.dto';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;
  
  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ default: 'Bearer' })
  tokenType: string;

  @ApiProperty()
  expiresIn: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
  
  @ApiProperty({ type: CurrentUserResponseDto })
  menus: CurrentUserResponseDto;
}
