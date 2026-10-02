import { api } from './api';

export const orderApi = {
  ...api.orders,
  customOrders: api.customOrders,
};
