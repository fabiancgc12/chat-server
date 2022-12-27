import {IsNotEmpty, IsString} from "class-validator";

export class LoginModel{
    @IsString()
    @IsNotEmpty()
    username:string
}