// External imports
import { Module } from '@nestjs/common';

// Internal imports
import { HomeController } from './home.controller.js';

// Exports
@Module({
  controllers: [HomeController],
})
export class HomeModule {}
