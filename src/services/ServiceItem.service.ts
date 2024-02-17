// import { axiosInstance } from '../axios/axiosInstance';
import { axiosGet, axiosPost } from '../axios/axiosWithoutAuth';
import { IAnswerPayload } from '../types/answer.types';
import {
  IAttachCustomerPayload,
  IGetCustomerPayload,
  IPaymentPayload,
} from '../types/stripe.types';

export const getServiceItems = async (): Promise<any | Error> => {
  try {
    const data = await axiosGet<any>('/getAllServiceItems');
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

export const getAllDataOfServiceItem = async (serviceItemId: string): Promise<any | Error> => {
  try {
    const data = await axiosGet<any>(`/getAllDataOfServiceItem/${serviceItemId}`);
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

export const createOrder = async (payload: IAnswerPayload): Promise<any | Error> => {
  try {
    const data = await axiosPost<any>('/createOrderWithAnswerId', payload);
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

export const createPaymentIntent = async (payload: IPaymentPayload): Promise<any | Error> => {
  try {
    const data = await axiosPost<any>('/createPaymentIntent', payload);
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

export const getCustomer = async (payload: IGetCustomerPayload): Promise<any | Error> => {
  try {
    const data = await axiosPost<any>('/getCustomer', payload);
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

export const attachCustomer = async (payload: IAttachCustomerPayload): Promise<any | Error> => {
  try {
    const data = await axiosPost<any>('/attachCustomerWithPaymentMethod', payload);
    return data;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};
