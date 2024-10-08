"use client";
import { BiSolidGroup, BiSolidUser } from "react-icons/bi";
import ButtonGroup from "./components/ButtonGroup";
import Modal from "./components/reactflow/Modal";
import CreateForm from "./components/CreateForm";
import useAuth from "./firebase/useAuth";
import { ChangeEvent, useEffect, useState } from "react";
import {
  deleteProject,
  listenToCollection,
  updateImageUrl,
} from "./item-service-v2";
import { ProjectRecord } from "./types/proejct";
import { toast } from "react-toastify";
import { useSpinnerContext } from "./context/SpinnerContext";
import ShareBoard from "./components/ShareBoard";
import ConfirmModal from "./components/ConfirmButton";
import { toastConfigs } from "./utils/toast";
import { uploadImageWithTransaction } from "./utils/upload";
import {
  AuditTrailButton,
  CreateButton,
  DeleteButton,
  ViewButton,
} from "./buttons/CommonButtons";
import CloneProject from "./components/CloneProject";

export default function HomePage() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const { setLoading } = useSpinnerContext();
  const handleClose = () => {
    setShowCreate(false);
  };
  const handleOpen = () => {
    setShowCreate(true);
  };

  const userId = user?.uid ?? "";

  useEffect(() => {
    if (!userId) {
      return;
    }
    const unsub = listenToCollection(userId, setProjects);
    return () => unsub();
  }, [userId]);

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    project: ProjectRecord
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile || !project) {
      return;
    }

    setLoading(true);
    uploadImageWithTransaction(selectedFile)
      .then((url) => {
        console.log(url);
        if (url) {
          return updateImageUrl({ url, userId, projectId: project.id });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (project: ProjectRecord) => () => {
    if (!project.id) {
      toast.error("unknwon projectId", toastConfigs);
      return;
    }
    setLoading(true);
    deleteProject(userId, project.id)
      .then(() => {
        toast.success("Project deleted successfully.", toastConfigs);
      })
      .catch((error) => {
        toast.error("Cant delete project. " + error?.message, toastConfigs);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto border rounded-md p-4">
      <div className="flex justify-between border-b pb-4">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 ">
          Projects
        </h1>
        <CreateButton onClick={handleOpen} />
        <Modal
          show={showCreate}
          title="Create new project"
          onClose={handleClose}
        >
          <CreateForm onCancel={handleClose} onSuccess={handleClose} />
        </Modal>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {projects.length > 0 ? (
          projects.map((project) => (
            <li
              key={project.id}
              className="flex justify-between gap-x-6 py-5 gap-y-2 flex-col sm:flex-row"
            >
              <div className="flex min-w-0 gap-x-4">
                <label htmlFor={`image-${project.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element*/}
                  <img
                    alt=""
                    src={project.imageUrl}
                    className="h-12 w-12 flex-none rounded-full bg-gray-50"
                  />
                </label>
                <input
                  className="hidden"
                  type="file"
                  id={`image-${project.id}`}
                  onChange={(e) => handleFileUpload(e, project)}
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {project.name}
                  </p>
                  <p className="text-xs leading-5 text-gray-500">
                    {project.sharedWith?.length > 0 ? (
                      <BiSolidGroup fontSize={18} />
                    ) : (
                      <BiSolidUser />
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col max-w-sm self-center">
                <ButtonGroup align="right">
                  <CloneProject project={project} />
                  <ViewButton href={`/${userId}/${project.id}`} />
                  <AuditTrailButton
                    href={`/${userId}/${project.id}/audit-trail`}
                  />
                  <ShareBoard
                    userId={userId}
                    projectId={project.id}
                    projectTitle={project.name}
                    sharedWith={project.sharedWith ?? []}
                  />
                  <ConfirmModal
                    title="Delete Project"
                    description={`Delete this project ${project.name ?? ""}?`}
                    onConfirm={handleDelete(project)}
                    renderConfirmButton={(open) => (
                      <DeleteButton
                        className="rounded-r-[30px]"
                        onClick={open}
                      />
                    )}
                  />
                </ButtonGroup>
              </div>
            </li>
          ))
        ) : (
          <div className="my-5 text-center">No projects found.</div>
        )}
      </ul>
    </div>
  );
}
