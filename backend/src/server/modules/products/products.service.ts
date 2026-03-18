import { productsRepository } from './products.repository';
import type { ProductInput, ProductPatchInput } from './products.types';

export const productsService = {
  listProducts() {
    return productsRepository.list();
  },

  findProduct(id: string) {
    return productsRepository.findById(id);
  },

  saveProduct(input: ProductInput) {
    return productsRepository.upsert(input);
  },

  updateProduct(id: string, input: ProductPatchInput) {
    return productsRepository.updateById(id, input);
  },

  removeProduct(id: string) {
    return productsRepository.deleteById(id);
  },
};
