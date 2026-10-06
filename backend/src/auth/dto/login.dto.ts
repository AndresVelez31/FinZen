// External imports
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Exports
export class LoginDto {
  @IsEmail({}, { message: 'Introduce un correo electrónico válido.' })
  email: string;

  @IsString({ message: 'Introduce la contraseña.' })
  @IsNotEmpty({ message: 'Introduce la contraseña.' })
  password: string;
}
