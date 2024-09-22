import { FunctionComponent, PropsWithChildren, ReactNode } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<{
    startIcon: ReactNode;
  }>;

const Button: FunctionComponent<PropsWithChildren<ButtonProps>> = (props) => {
  const { children, startIcon, ...rest } = props;
  return (
    <button {...rest} className="primary-button">
      {startIcon} {children}
    </button>
  );
};

export default Button;
