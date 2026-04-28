import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuTreeResponseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  icon: string | null;

  @ApiProperty()
  href: string;

  @ApiProperty()
  index: number;

  @ApiProperty({ type: () => [MenuTreeResponseDto] })
  children: MenuTreeResponseDto[];
}
