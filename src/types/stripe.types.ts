export interface IPaymentPayload {
  amount: number;
  customerId: string;
  emailId: string;
}

export interface IGetCustomerPayload {
  emailId: string;
  name: string;
}

export interface IAttachCustomerPayload {
  paymentMethodId: string;
  customerId: string;
}
