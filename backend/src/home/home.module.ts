// Imports
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller.js';

// Exports
@Module({
  controllers: [HomeController],
})
export class HomeModule {}
