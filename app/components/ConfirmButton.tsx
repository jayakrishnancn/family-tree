import React, { useState } from "react";
import Modal from "./reactflow/Modal";
import Button from "./Button";

interface ConfirmModalProps {
  title: string;
  description: string;
  onConfirm: (e: React.MouseEvent<HTMLElement>) => void;
  renderConfirmButton: (handleOpen: () => void) => React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  onConfirm,
  renderConfirmButton,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent<any, MouseEvent>) => {
    e?.preventDefault?.();
    setIsOpen(false);
  };

  const handleConfirm = (e: React.MouseEvent<HTMLElement>) => {
    setIsOpen(false);
    onConfirm(e);
  };

  return (
    <>
      {renderConfirmButton(handleClickOpen)}
      <Modal title={title} onClose={handleClose} show={isOpen}>
        <div className="p-4"> {description}</div>
        <div className="flex justify-end p-4 border-t">
          <Button onClick={handleClose} varient="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} varient="danger">
            Confirm
          </Button>
        </div>
      </Modal>
      {/* {isOpen && (
        <div className="z-10 fixed text-left inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80">
          <div className="bg-white rounded-lg shadow-lg w-1/3 min-w-min">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg p-0 m-0 font-bold">{title}</h2>
              <button
                onClick={handleClose}
                className="text-gray-500  hover:text-gray-700"
              >
                x
              </button>
            </div>
            {description}
            
          </div>
        </div>
      )} */}
    </>
  );
};

export default ConfirmModal;
