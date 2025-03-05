"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductDto {
    name;
    description;
    price;
    image;
    order;
    isActive;
    isAvailable;
    categoryId;
    additionalOptions;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nome do produto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório' }),
    (0, class_validator_1.IsString)({ message: 'O nome deve ser uma string' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descrição do produto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A descrição deve ser uma string' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preço do produto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O preço é obrigatório' }),
    (0, class_validator_1.IsNumber)({}, { message: 'O preço deve ser um número' }),
    (0, class_validator_1.Min)(0, { message: 'O preço deve ser maior ou igual a zero' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL da imagem do produto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A imagem deve ser uma string' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ordem de exibição do produto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'A ordem deve ser um número' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indica se o produto está ativo' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indica se o produto está disponível' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID da categoria do produto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O ID da categoria é obrigatório' }),
    (0, class_validator_1.IsUUID)('4', { message: 'O ID da categoria deve ser um UUID válido' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opções adicionais do produto',
        type: 'object',
        additionalProperties: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "additionalOptions", void 0);
//# sourceMappingURL=create-product.dto.js.map