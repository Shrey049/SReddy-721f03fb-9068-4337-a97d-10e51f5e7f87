
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;
}
