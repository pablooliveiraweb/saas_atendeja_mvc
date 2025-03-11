import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersAltController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    findAll(search?: string): Promise<import("./entities/customer.entity").Customer[]>;
    search(query: string): Promise<import("./entities/customer.entity").Customer[]>;
    findInactive(): Promise<any[]>;
    findTop(): Promise<any[]>;
    findOne(id: string): Promise<import("./entities/customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    updatePut(id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    remove(id: string): Promise<void>;
    createSimple(data: any): Promise<import("./entities/customer.entity").Customer>;
    ensureDefaultRestaurant(): Promise<{
        success: boolean;
        message: string;
        restaurant: {
            id: string;
            name: string;
        };
    }>;
}
