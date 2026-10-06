// External imports
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// Internal imports
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: corsOrigins?.length
      ? corsOrigins
      : ['http://localhost:5173', 'http://localhost', 'http://127.0.0.1'],
  });

  // Validation errors answer a single message string, so the API keeps the
  // { message: string } shape that the SPA shows as-is.
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const firstConstraint = Object.values(errors[0]?.constraints ?? {})[0];
        return new BadRequestException(firstConstraint ?? 'La solicitud no es válida.');
      },
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
