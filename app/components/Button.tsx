import { FunctionComponent, PropsWithChildren, ReactNode } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<{
    startIcon: ReactNode;
    varient: "primary" | "secondary";
  }>;

const Button: FunctionComponent<PropsWithChildren<ButtonProps>> = (props) => {
  const { children, startIcon, varient, ...rest } = props;
  const classes =
    varient === "secondary"
      ? ["primary-button bg-white flex gap-1"]
      : ["primary-button flex gap-1"];
  return (
    <button {...rest} className={classes.join(" ")}>
      {startIcon} {children}
    </button>
  );
};

export default Button;
