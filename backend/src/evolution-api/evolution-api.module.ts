import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EvolutionApiService } from './evolution-api.service';
import { EvolutionApiController } from './evolution-api.controller';
import evolutionApiConfig from '../config/evolution-api.config';

@Module({
  imports: [
    ConfigModule.forFeature(evolutionApiConfig),
  ],
  controllers: [EvolutionApiController],
  providers: [EvolutionApiService],
  exports: [EvolutionApiService],
})
export class EvolutionApiModule {} 