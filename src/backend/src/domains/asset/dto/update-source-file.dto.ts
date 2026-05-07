import { IsOptional, IsString } from "class-validator";
import { ImportMode } from "src/domains/citydb-tool/enums/import-mode.enum";
import { User } from "src/domains/users/entities/user.entity";

export class UpdateSourceFileDto {
    @IsString()
    @IsOptional()
    validFrom?: string;

    @IsString()
    @IsOptional()
    validTo?: string;

    @IsString()
    importMode: ImportMode;

    @IsOptional()
    file?: Express.Multer.File;

    @IsString()
    @IsOptional()
    uploadedBy: User;
}