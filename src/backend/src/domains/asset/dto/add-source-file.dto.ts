import { IsOptional, IsString } from "class-validator";
import { User } from "src/domains/users/entities/user.entity";

export class AddSourceFileDto {
    @IsString()
    @IsOptional()
    validFrom: string;

    @IsString()
    @IsOptional()
    validTo: string;

    @IsString()
    @IsOptional()
    assetId: string;

    @IsOptional()
    file?: Express.Multer.File;
    
    @IsString()
    @IsOptional()
    uploadedBy: User;
}