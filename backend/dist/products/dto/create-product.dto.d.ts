export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    image?: string;
    order?: number;
    isActive?: boolean;
    isAvailable?: boolean;
    categoryId: string;
    additionalOptions?: any;
}
