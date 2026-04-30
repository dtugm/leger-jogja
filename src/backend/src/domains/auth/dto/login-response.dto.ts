import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { MenuTreeResponseDto } from 'src/domains/menus/dto/menu-tree-response.dto';

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

  @ApiProperty({ type: () => [MenuTreeResponseDto] })
  availableMenus: MenuTreeResponseDto[];
}
