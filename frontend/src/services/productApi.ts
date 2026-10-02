import { api } from './api';

export const productApi = {
  ...api.products,
  categories: api.categories,
};
