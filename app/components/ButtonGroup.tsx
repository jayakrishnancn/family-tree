import { FC, PropsWithChildren } from "react";

interface ButtonGroupProps {
  align: "center" | "left" | "right";
}

const ButtonGroup: FC<PropsWithChildren<ButtonGroupProps>> = ({
  children,
  align,
}) => {
  const classes = ["flex button-grp"];
  if (align === "right") {
    classes.push("justify-end");
  }
  return <div className={classes.join(" ")}>{children}</div>;
};

export default ButtonGroup;
