// External imports
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

// Exports
// The Transform decorators only trim what the validators see: AuthService normalizes
// the values it stores.
export class SignUpDto {
  @MaxLength(80, { message: 'El nombre no puede superar 80 caracteres.' })
  @IsNotEmpty({ message: 'Introduce tu nombre.' })
  @IsString({ message: 'Introduce tu nombre.' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsEmail({}, { message: 'Introduce un correo electrónico válido.' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  @MaxLength(128, { message: 'La contraseña debe tener entre 12 y 128 caracteres.' })
  @MinLength(12, { message: 'La contraseña debe tener entre 12 y 128 caracteres.' })
  @IsString({ message: 'La contraseña debe tener entre 12 y 128 caracteres.' })
  password: string;
}
