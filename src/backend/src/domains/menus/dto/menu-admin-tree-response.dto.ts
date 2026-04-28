import { ApiProperty } from '@nestjs/swagger';
import { MenuResponseDto } from './menu-response.dto';

export class MenuAdminTreeResponseDto extends MenuResponseDto {
  @ApiProperty({ type: () => [MenuAdminTreeResponseDto] })
  children: MenuAdminTreeResponseDto[];
}
