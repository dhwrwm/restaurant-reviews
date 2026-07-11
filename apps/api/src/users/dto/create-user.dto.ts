import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';
import { Role } from 'types';

export class CreateUserDto {
  @IsDefined({ message: 'User email is required' })
  @IsEmail()
  email!: string;

  @IsDefined({ message: 'User name is required' })
  @IsNotEmpty({ message: 'User name is required' })
  name!: string;

  @IsDefined({ message: 'User password is required' })
  passwordHash!: string;

  @IsDefined({ message: 'User role is required' })
  role!: Role;
}
