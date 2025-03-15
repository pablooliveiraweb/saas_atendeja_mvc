import { CouponsService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(createCouponDto: CreateCouponDto): Promise<Coupon>;
    findAll(restaurantId: string): Promise<Coupon[]>;
    findOne(id: string): Promise<Coupon>;
    update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon>;
    remove(id: string): Promise<void>;
    validateCoupon(body: {
        code: string;
        restaurantId: string;
        orderValue: number;
    }): Promise<{
        coupon: Coupon;
        discount: number;
    }>;
}
