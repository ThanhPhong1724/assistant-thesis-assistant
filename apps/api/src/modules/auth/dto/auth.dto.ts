import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'student@thesis.local' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'student123' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'newuser@thesis.local' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Nguyễn Văn A' })
    @IsString()
    @MinLength(2)
    fullName: string;
}
