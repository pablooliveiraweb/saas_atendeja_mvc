import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    EvolutionApiModule,
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [TypeOrmModule, RestaurantService],
})
export class RestaurantModule {} 