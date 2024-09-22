"use client";
import Link from "next/link";
import { BiSolidGroup, BiSolidUser } from "react-icons/bi";
import Button from "./components/Button";
import ButtonGroup from "./components/ButtonGroup";
import { IoMdAdd } from "react-icons/io";
import Modal from "./components/reactflow/Modal";
import CreateForm from "./components/CreateForm";
import useAuth from "./firebase/useAuth";
import { useEffect, useState } from "react";
import { deleteProject, listenToCollection } from "./item-service-v2";
import { ProjectRecord } from "./types/proejct";
import { toast } from "react-toastify";
import { useSpinnerContext } from "./context/SpinnerContext";

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

  const handleDelete = (project: ProjectRecord) => () => {
    if (!project.id) {
      toast.error("unknwon projectId");
      return;
    }
    setLoading(true);
    deleteProject(userId, project.id)
      .then(() => {
        toast.success("Project deleted successfully.");
      })
      .catch((error) => {
        toast.error("Cant delete project. " + error?.message);
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
        <Button startIcon={<IoMdAdd />} onClick={handleOpen}>
          Create
        </Button>
        <Modal show={showCreate}>
          <CreateForm
            onCancel={handleClose}
            onSuccess={handleClose}
            userId={userId}
          />
        </Modal>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {projects.length > 0 ? (
          projects.map((project) => (
            <li
              key={project.id}
              className="flex justify-between gap-x-6 py-5 flex-col sm:flex-row"
            >
              <div className="flex min-w-0 gap-x-4">
                {/* eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  alt=""
                  src={project.imageUrl}
                  className="h-12 w-12 flex-none rounded-full bg-gray-50"
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
              <div className="flex sm:flex-col sm:items-end">
                <ButtonGroup align="right">
                  <Button disabled>Share</Button>
                  <Button onClick={handleDelete(project)}>Delete</Button>
                  <Link
                    href={`/${userId}/${project.id}`}
                    className="primary-button"
                  >
                    View
                  </Link>
                  <Link
                    href={`/${userId}/${project.id}/audit-trail`}
                    className="primary-button"
                  >
                    Audit trail
                  </Link>
                </ButtonGroup>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Last updated by{" "}
                  {project.lastUpdatedBy?.displayName ?? "Unknown"}
                  <br />
                  on {new Date(project.lastUpdatedDatedTs).toLocaleString()}
                </p>
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
