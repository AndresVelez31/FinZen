// External imports
import { Public } from '@nestjs/authentication';
import { Controller, Get } from '@nestjs/common';

// Exports
@Controller()
export class HomeController {
  @Public()
  @Get()
  index(): string {
    return 'API is running';
  }
}
