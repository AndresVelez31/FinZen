import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs/authentication';

@Controller()
export class HomeController {
  @Public()
  @Get()
  index(): string {
    return 'API is running';
  }
}
