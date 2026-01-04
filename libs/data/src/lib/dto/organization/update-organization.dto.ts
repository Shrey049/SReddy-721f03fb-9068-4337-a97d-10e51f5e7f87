
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateOrganizationDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    name?: string;

    @IsUUID()
    @IsOptional()
    parentId?: string | null;
}
