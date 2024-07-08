import { IsEmail, IsString, IsPhoneNumber, MinLength, IsOptional} from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsOptional()
    userId: string;

    @IsString()
    // @MinLength(3, {message: "firstName must have at least 3 characters"})
    firstName: string;

    @IsString()
    // @MinLength(3, {message: "firstName must have at least 3 characters"})
    lastName: string;

    @IsEmail(/*{allow_display_name: true}, {message: "Please provide a valid email in the format 'example@email.com'"}*/)
    email: string;

    @IsString()
    password: string;

    @IsPhoneNumber("NG", /*{message: "Provide a valid phone number in the format '080xxxxxxxx' or '23480xxxxxxxx"}*/)
    phone: string;
}
