import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';

@Module({
  imports: [EvolutionApiModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {} 