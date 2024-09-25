import { TbRestore, TbTrash } from "react-icons/tb";
import Button, { ButtonProps } from "../components/Button";
import { FaClone, FaHistory } from "react-icons/fa";
import { BiShareAlt } from "react-icons/bi";
import { PiPlus } from "react-icons/pi";
import { BsEye } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

export function DeleteButton(props: ButtonProps) {
  return (
    <Button varient="danger" startIcon={<TbTrash />} {...props}>
      Delete
    </Button>
  );
}

export function ViewButton(props: ButtonProps) {
  return (
    <Button startIcon={<BsEye />} {...props}>
      View
    </Button>
  );
}

export function CloneButton(props: ButtonProps) {
  return (
    <Button startIcon={<FaClone />} {...props}>
      Clone
    </Button>
  );
}

export function AuditTrailButton(props: ButtonProps) {
  return (
    <Button startIcon={<FaHistory />} {...props}>
      Audit trail
    </Button>
  );
}

export function ShareButton(props: ButtonProps) {
  return (
    <Button startIcon={<BiShareAlt />} {...props}>
      Share
    </Button>
  );
}

export function CreateButton(props: ButtonProps) {
  return (
    <Button varient="success" startIcon={<PiPlus />} {...props}>
      Create new project
    </Button>
  );
}

export function BackButton(props: ButtonProps) {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        router.back();
      }}
      startIcon={<IoMdArrowRoundBack />}
      {...props}
    >
      Back
    </Button>
  );
}

export function RestoreButton(props: ButtonProps) {
  return (
    <Button startIcon={<TbRestore />} {...props}>
      Restore
    </Button>
  );
}
