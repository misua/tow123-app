// interface AnswerData {
//   Email: string;
//   Address: string;
//   'Pickup location': string;
//   'Drop location': string;
//   Name: string;
//   'Phone Number': string;
//   'On Site Availability': string;
//   'Fuel requirement in litre': string;
// }

interface Answer {
  _id: string;
  data: any;
}

interface SpecificService {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  isDistanceApplicable: boolean;
  specificServices: SpecificService[];
}

export interface OrderData {
  _id: string;
  status: string;
  answers: Answer;
  service: Service;
  createdAt: Date;
}

export interface AllOrderResult {
  data?: OrderData[];
  success?: boolean;
  msg?: string;
}

export interface IOrderUpdatePayload {
  status: string;
}
