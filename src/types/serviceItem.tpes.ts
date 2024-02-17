export interface ServiceItemData {
  _id: {
    $oid: string;
  };
  name: string;
  description: string;
  basePrice: number;
  isDistanceApplicable: boolean;
  specificServiceIds: {
    $oid: string;
  }[];
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
  imageName: string;
}

export interface ServiceItemResult {
  data?: ServiceItemData[];
  success?: boolean;
  msg?: string;
}

type ServiceItemQuestion = {
  _id: { $oid: string };
  title: string;
  description: string;
  type: string;
  isUnit: boolean;
  formFieldType: string;
  index: number;
  __v: number;
  specificServices: SpecificService[];
  options: Option[];
};

type Option = {
  _id: { $oid: string };
  title: string;
  info: string;
  __v: number;
  imagePath: string;
};

type SpecificService = {
  _id: { $oid: string };
  name: string;
  description: string;
  price: number;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
};

type Step = {
  _id: { $oid: string };
  title: string;
  index: number;
  __v: number;
  serviceItemQuestions: ServiceItemQuestion[];
};

export interface AllDataOfServiceItemData {
  _id: { $oid: string };
  name: string;
  description: string;
  basePrice: number;
  isDistanceApplicable: boolean;
  __v: number;
  imagePath: string;
  steps: Step[];
}

export interface AllDataOfServiceItemResult {
  data?: AllDataOfServiceItemData[];
  success?: boolean;
  msg?: string;
}
