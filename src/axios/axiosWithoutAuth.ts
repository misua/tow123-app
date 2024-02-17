import { axiosInstance } from './axiosInstance';

const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL;

export interface ApiResponse<T> {
  data: T;
}
export interface ApiError {
  error: string;
}

export const axiosGet = async <T>(url: string): Promise<T | Error> => {
  try {
    const mainUrl = `${baseUrl}${url}`;
    const response = await axiosInstance.get<T>(mainUrl);
    return response.data;
  } catch (error) {
    return error as Error;
  }
};

export const axiosPost = async <T>(
  url: string,
  payload: Record<string, any>
): Promise<T | Error> => {
  try {
    const mainUrl = `${baseUrl}${url}`;
    const response = await axiosInstance.post<T>(mainUrl, { ...payload });
    return response.data;
  } catch (error) {
    return error as Error;
  }
};

export const axiosPatch = async <T>(
  url: string,
  payload: Record<string, any>
): Promise<T | Error> => {
  try {
    const mainUrl = `${baseUrl}${url}`;
    const response = await axiosInstance.patch<T>(mainUrl, { ...payload });
    return response.data;
  } catch (error) {
    return error as Error;
  }
};

export const axiosPut = async <T>(
  url: string,
  payload: Record<string, any>
): Promise<T | Error> => {
  try {
    const mainUrl = `${baseUrl}${url}`;
    const response = await axiosInstance.put<T>(mainUrl, { ...payload });
    return response.data;
  } catch (error) {
    return error as Error;
  }
};
