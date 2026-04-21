import { ApiProperty } from '@nestjs/swagger';
import { MenuTreeResponseDto } from '../../menus/dto/menu-tree-response.dto';
import { UserResponseDto } from './user-response.dto';

export class CurrentUserResponseDto extends UserResponseDto {
  @ApiProperty({ type: () => [MenuTreeResponseDto] })
  availableMenus: MenuTreeResponseDto[];
}
