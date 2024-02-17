import React from 'react';
import classNames from 'classnames';

import { ILoaderProps } from './Loader.props';
import styles from './Loader.module.scss';

const Loader: React.FC<ILoaderProps> = ({ className, theme = 'light', size = 'md' }) => {
  const loaderClasses = classNames(styles[`loader-${theme}`], styles[`loader-${size}`]);
  return (
    <div className={className}>
      <span className={loaderClasses}></span>
    </div>
  );
};

export default Loader;
