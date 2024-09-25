"use client";

import { toast } from "react-toastify";
import { ChangeEvent, useState } from "react";
import Modal from "./reactflow/Modal";
import {
  addEmailToSharedList,
  removeEmailToSharedList,
} from "../item-service-v2";
import ConfirmModal from "./ConfirmButton";
import { toastConfigs } from "../utils/toast";
import { DeleteButton, ShareButton } from "../buttons/CommonButtons";

const getUrl = (userId: string, projectId: string) =>
  `https://simple-family-tree.netlify.app/${userId}/${projectId}`;

export default function ShareBoard({
  userId,
  projectId,
  sharedWith,
  projectTitle,
}: {
  userId: string;
  projectId: string;
  projectTitle: string;
  sharedWith: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailId, setEmailId] = useState("");

  const handleShare = () => {
    if (!emailId) {
      return;
    }
    setLoading(true);
    addEmailToSharedList({ userId, emailId, projectId })
      .then(() => {
        navigator && navigator.clipboard.writeText(getUrl(userId, projectId));
        toast.success("Link copied", toastConfigs);
      })
      .catch((error) => {
        console.error(error);
        toast.error(
          `Error while adding email Id ${emailId} to shared List`,
          toastConfigs
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setEmailId(event.target.value.trim());
  }
  const handleRemoveShare = (emailId: string) => {
    setLoading(true);
    removeEmailToSharedList({ userId, emailId, projectId })
      .then(() => {
        toast.success(
          `Removed emailId: ${emailId} from share list`,
          toastConfigs
        );
      })
      .catch((error) => {
        console.error(error);
        toast.error(
          `Error while removing email Id ${emailId} to shared List`,
          toastConfigs
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <ShareButton disabled={loading} onClick={() => setOpen(true)} />
      <Modal
        show={open}
        title={`Enter EmailId to share this chart (${
          projectTitle ?? projectId
        })`}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="flex flex-col gap-2 min-w-64">
          <input
            className="customInput"
            autoFocus
            type="email"
            placeholder="example@gmail.com"
            value={emailId}
            onChange={handleChange}
          />
          <div className="flex mb-4 justify-end">
            <ShareButton onClick={handleShare} varient="success" />
          </div>
          {sharedWith?.length > 0 ? (
            <div>
              <hr className="mt-4 border-2 border-black" />
              <h3 className="font-bold text-center">Shared with</h3>
              <div className="flex flex-col">
                {sharedWith.map((emailId: string) => (
                  <div className="flex my-1" key={emailId}>
                    <div className="primary-button no-button bg-white flex-1  border-b px-2">
                      {emailId}
                    </div>

                    <ConfirmModal
                      title="Remove Permission"
                      description={`Remove permission for ${emailId} from project ${projectTitle}?`}
                      onConfirm={() => handleRemoveShare(emailId)}
                      renderConfirmButton={(onConfirm) => (
                        <DeleteButton onClick={onConfirm} />
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center mt-4">not shared with anyone yet.</div>
          )}
        </div>
      </Modal>
    </>
  );
}
