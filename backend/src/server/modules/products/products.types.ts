export interface ColorVariant {
  id: string;
  name: string;
  hexColor: string;
  label: string;
}

export interface ProductInput {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  category: string;
  collection: string;
  description: string;
  material?: string;
  weight?: string;
  sizes?: number[];
  colorVariants?: ColorVariant[] | null;
  rating?: number;
  reviews?: number;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  stock: number | null;
}

export type ProductPatchInput = Partial<Omit<ProductInput, 'id'>>;
