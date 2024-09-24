"use client";

import { toast } from "react-toastify";
import { ChangeEvent, useState } from "react";
import Modal from "./reactflow/Modal";
import {
  addEmailToSharedList,
  removeEmailToSharedList,
} from "../item-service-v2";
import Button from "./Button";
import { BiShareAlt, BiTrash } from "react-icons/bi";

const getUrl = (userId: string, projectId: string) =>
  `https://simple-family-tree.netlify.app/${userId}/${projectId}`;

export default function ShareBoard({
  userId,
  projectId,
  sharedWith,
}: {
  userId: string;
  projectId: string;
  sharedWith: string[];
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
      });
  };
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setEmailId(event.target.value);
  }
  const handleRemoveShare = (emailId: string) => {
    setLoading(true);
    removeEmailToSharedList({ userId, emailId, projectId })
      .then(() => {
        toast.success(`Removed emailId: ${emailId} from share list`);
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Error while removing email Id ${emailId} to shared List`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
          {sharedWith?.length > 0 ? (
            <div>
              <hr className="mt-4 border-2 border-black" />
              <h3 className="font-bold text-center">Shared with</h3>
              <div className="flex flex-col">
                {sharedWith.map((emailId) => (
                  <div className="flex my-1" key={emailId}>
                    <div className="primary-button flex-1  no-button px-2">
                      {emailId}
                    </div>
                    <Button onClick={() => handleRemoveShare(emailId)}>
                      <BiTrash />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center mt-4">not shared with anyone yet.</div>
          )}
        </div>
      </Modal>

      <Button
        disabled={loading}
        className="primary-button flex flex–col gap-1"
        onClick={() => setOpen(true)}
        startIcon={<BiShareAlt />}
      >
        Share
      </Button>
    </>
  );
}
