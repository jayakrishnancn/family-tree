// Modal.js
import { useCallback, useEffect, PropsWithChildren } from "react";
import "./Modal.css";
type ModalProps = {
  show: boolean;
  onClose: (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  title: string;
};

const Modal = ({
  show,
  onClose,
  children,
  title,
}: PropsWithChildren<ModalProps>) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!show) {
    return null;
  }

  return (
    <div className="z-50 fixed text-left inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80">
      <div className="bg-white rounded-lg shadow-lg w-1/3 min-w-min">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg p-0 m-0 font-bold">{title}</h2>
          <button
            onClick={() => onClose()}
            className="text-gray-500  hover:text-gray-700"
          >
            x
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
