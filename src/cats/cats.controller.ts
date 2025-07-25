
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from 'cats/dto';
import { CatsService } from './cats.service';
import { Cat } from 'cats/interfaces/cat.interface';

@Controller('cats')
export class CatsController {
    constructor(private catsService: CatsService) { }

    @Post()
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        return this.catsService.findAll();
    }
}
