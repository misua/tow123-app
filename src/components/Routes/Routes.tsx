import { ReactNode } from 'react';
import { Home } from '../../pages';
import { Service } from '../../pages';
import { Confirmation } from '../../pages';
// import { RouteMap } from '../RouteMap';
export interface IRoute {
  path: string;
  cmp: ReactNode;
}

export const publicRoutes: IRoute[] = [
  {
    path: '/',
    cmp: <Home />,
  },
  {
    path: '/service/:serviceItemId',
    cmp: <Service />,
  },
  {
    path: '/confirmation/:orderId',
    cmp: <Confirmation />,
  },
  // {
  //   path: '/routeMap',
  //   cmp: <RouteMap />,
  // },
];
