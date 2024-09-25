import { FC, PropsWithChildren } from "react";

interface ButtonGroupProps {
  align?: "center" | "left" | "right";
  className?: string;
}

const ButtonGroup: FC<PropsWithChildren<ButtonGroupProps>> = ({
  children,
  align,
  className,
}) => {
  const classes = ["flex button-grp"];
  if (align === "right") {
    classes.push("justify-end");
  }
  if (className) {
    classes.push(className);
  }
  return <div className={classes.join(" ")}>{children}</div>;
};

export default ButtonGroup;
