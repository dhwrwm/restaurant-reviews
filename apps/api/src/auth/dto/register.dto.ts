import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { Role } from 'types';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
