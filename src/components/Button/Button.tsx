import classNames from 'classnames';
import React, { ReactNode, MouseEvent } from 'react';
import styles from './button.module.scss';

interface ButtonProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  theme: 'primary' | 'secondary' | 'transparent';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  selected?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  theme,
  disabled,
  fullWidth,
  className,
  selected,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        styles[`container-${theme}${selected ? '-selected' : ''}`],
        disabled && styles[`container-disabled`],
        !disabled && styles[`container-enabled`],
        styles[`container-${fullWidth ? 'full' : 'min-content'}`],
        className
      )}
      style={disabled ? { cursor: 'pointer' } : {}}
      disabled={disabled}
      onClick={onClick}>
      <p className={styles[`text-${theme}`]}>{children}</p>
    </button>
  );
};

export default Button;
