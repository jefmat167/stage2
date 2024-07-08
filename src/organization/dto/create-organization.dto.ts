import { IsString, IsOptional} from "class-validator";

export class CreateOrganizationDto {

    @IsString()
    @IsOptional()
    orgId: string;

    @IsString()
    name: string;

    @IsString()
    description: string;
}
