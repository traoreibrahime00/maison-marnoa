export interface ProductInput {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  collection: string;
  description: string;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  stock: number | null;
}

export type ProductPatchInput = Partial<Omit<ProductInput, 'id'>>;
