import { Controller, Get, Post, Query } from '@nestjs/common';
import { ExampleService } from './example.service';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('greeting')
  async greeting(@Query('name') name?: string): Promise<string> {
    return this.exampleService.getGreeting(name ?? 'world');
  }

  @Post('greeting/bump')
  async bumpGreetingCache(): Promise<{ ok: true }> {
    await this.exampleService.bumpGreetingCache();
    return { ok: true };
  }
}
