import { FC, PropsWithChildren } from "react";

interface ButtonGroupProps {}

const ButtonGroup: FC<PropsWithChildren<ButtonGroupProps>> = ({ children }) => {
  return <div className="button-grp">{children}</div>;
};

export default ButtonGroup;
