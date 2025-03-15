import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsService {
    private readonly couponRepository;
    constructor(couponRepository: Repository<Coupon>);
    create(createCouponDto: CreateCouponDto): Promise<Coupon>;
    findAll(restaurantId: string): Promise<Coupon[]>;
    findOne(id: string): Promise<Coupon>;
    findByCode(code: string, restaurantId: string): Promise<Coupon>;
    update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon>;
    remove(id: string): Promise<void>;
    validateCoupon(code: string, restaurantId: string, orderValue: number): Promise<Coupon>;
    applyCoupon(couponId: string): Promise<Coupon>;
    calculateDiscount(coupon: Coupon, orderValue: number): number;
}
