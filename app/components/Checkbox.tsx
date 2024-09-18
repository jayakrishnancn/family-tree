import { ChangeEventHandler } from "react";

export default function Checkbox({
  isChecked,
  onChange,
  id,
}: {
  id: string | number;
  isChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}) {
  return (
    <span className="switch">
      <input
        id={"switch-rounded" + id}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
      />
      <label htmlFor={"switch-rounded" + id}></label>
    </span>
  );
}
