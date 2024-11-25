import { ChangeEventHandler } from "react";

export default function Checkbox({
  isChecked,
  onChange,
  id,
  name,
  color,
}: {
  color?: string;
  id: string | number;
  isChecked?: boolean;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}) {
  return (
    <span className={"switch " + color}>
      <input
        id={"switch-rounded" + id}
        type="checkbox"
        checked={isChecked}
        name={name ?? ""}
        onChange={onChange}
      />
      <label htmlFor={"switch-rounded" + id}></label>
    </span>
  );
}
