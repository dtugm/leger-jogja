export class PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class MetadataDto {
  searchableFields?: string[];
  filterableFields?: string[];
}

// T adalah tipe data array yang akan dinamis
export class PagedResponseDto<T> {
  result: T[];
  pagination: PaginationDto;
  metadata?: MetadataDto;

  constructor(result: T[], pagination: PaginationDto, metadata: MetadataDto) {
    this.result = result;
    this.pagination = pagination;
    this.metadata = metadata;
  }
}