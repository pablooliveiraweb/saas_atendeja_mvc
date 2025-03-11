import React, { useState } from 'react';
import { Product, ProductFormData } from '../types/product';
import { Category } from '../types/category';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product;
  categories: Category[];
  isLoading?: boolean;
}

// ... resto do código ... 