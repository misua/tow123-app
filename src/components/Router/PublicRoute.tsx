import React from 'react';
import { IRoute } from './Routes.props';

const PublicRoute: React.FC<IRoute> = ({ component }) => {
  return (
    <div>
      <div>{component}</div>
    </div>
  );
};

export default PublicRoute;
