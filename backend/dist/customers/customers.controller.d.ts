import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, restaurantId: string): Promise<import("./entities/customer.entity").Customer>;
    findAll(restaurantId: string, search?: string): Promise<import("./entities/customer.entity").Customer[]>;
    search(restaurantId: string, query: string): Promise<import("./entities/customer.entity").Customer[]>;
    findInactive(restaurantId: string): Promise<any[]>;
    findTop(restaurantId: string): Promise<any[]>;
    findOne(restaurantId: string, id: string): Promise<import("./entities/customer.entity").Customer>;
    findByPhone(restaurantId: string, phone: string): Promise<import("./entities/customer.entity").Customer>;
    update(restaurantId: string, id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    updatePut(restaurantId: string, id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    remove(restaurantId: string, id: string): Promise<void>;
}
