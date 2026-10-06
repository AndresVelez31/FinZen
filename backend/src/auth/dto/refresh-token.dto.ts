// External imports
import { IsNotEmpty, IsString } from 'class-validator';

// Exports
export class RefreshTokenDto {
  @IsString({ message: 'El token de renovación no es válido.' })
  @IsNotEmpty({ message: 'El token de renovación no es válido.' })
  refreshToken: string;
}
