import axios, { AxiosError, AxiosResponse } from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    return Promise.reject(error);
  }
);
