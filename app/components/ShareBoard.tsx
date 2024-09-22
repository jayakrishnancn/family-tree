"use client";

import { toast } from "react-toastify";
import { ChangeEvent, useState } from "react";
import Modal from "./reactflow/Modal";
import { addEmailToSharedList } from "../item-service-v2";

const getUrl = (userId: string, projectId: string) =>
  `https://simple-family-tree.netlify.app/${userId}/${projectId}`;

export default function ShareBoard({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailId, setEmailId] = useState("");

  const handleShare = () => {
    setLoading(true);
    addEmailToSharedList({ userId, emailId, projectId })
      .then(() => {
        navigator && navigator.clipboard.writeText(getUrl(userId, projectId));
        toast.success("Link copied");
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Error while adding email Id ${emailId} to shared List`);
      })
      .finally(() => {
        setLoading(false);
        setOpen(false);
      });
  };
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setEmailId(event.target.value);
  }

  return (
    <>
      <Modal
        show={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="mt-10 flex flex-col gap-2 min-w-64">
          <h2 className="mb-4 ">Enter EmailId to share this chart</h2>
          <input
            className="customInput"
            autoFocus
            type="email"
            placeholder="example@gmail.com"
            value={emailId}
            onChange={handleChange}
          />
          <button
            className="primary-button round text-sm"
            onClick={handleShare}
          >
            Share
          </button>
        </div>
      </Modal>

      <button
        disabled={loading}
        className="primary-button flex flex–col gap-1"
        onClick={() => setOpen(true)}
      >
        Share
      </button>
    </>
  );
}
