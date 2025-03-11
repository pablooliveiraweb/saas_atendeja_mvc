import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersAltController } from './customers-alt.controller';
import { Customer } from './entities/customer.entity';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Order, Restaurant])
  ],
  controllers: [CustomersController, CustomersAltController],
  providers: [CustomersService],
  exports: [CustomersService]
})
export class CustomersModule {} 