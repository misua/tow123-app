import { axiosGet, axiosPut } from '../axios/axiosWithoutAuth';
import { IOrderUpdatePayload } from '../types/order.types';

export const getAllOrders = async (orderId: string): Promise<any | Error> => {
  try {
    const data = await axiosGet<any>(`/getAllOrders/${orderId}`);
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  payload: IOrderUpdatePayload
): Promise<any | Error> => {
  try {
    const data = await axiosPut<any>(`/updateOrderStatus/${orderId}`, { ...payload });
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};
