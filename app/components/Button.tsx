import Link from "next/link";
import { FunctionComponent, PropsWithChildren, ReactNode } from "react";

type Varient = "primary" | "secondary" | "danger" | "success" | "default";
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<{
    startIcon: ReactNode;
    varient: Varient;
    href: string;
  }>;

const VARIENT_COLOR_MAP = {
  primary: "bg-blue-500 text-white",
  secondary: "bg-white",
  danger: "bg-red-500 text-white",
  success: "bg-green-600 text-white",
  warning: "bg-amber-500 text-black",
  default: "",
} as Record<Varient, string>;

export const defaultButtonClassess = "primary-button flex gap-1";

const Button: FunctionComponent<PropsWithChildren<ButtonProps>> = (props) => {
  const { children, startIcon, varient = "default", href, ...rest } = props;
  const classes = ["primary-button flex gap-1"];

  classes.push(VARIENT_COLOR_MAP[varient]);
  rest.className && classes.push(rest.className);

  return href ? (
    <Link href={href} className={classes.join(" ")}>
      {startIcon} {children}
    </Link>
  ) : (
    <button {...rest} className={classes.join(" ")}>
      {startIcon} {children}
    </button>
  );
};

export default Button;
