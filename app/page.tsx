"use client";
import Link from "next/link";
import { BiSolidGroup } from "react-icons/bi";
import Button from "./components/Button";
import ButtonGroup from "./components/ButtonGroup";
import { IoMdAdd } from "react-icons/io";
import Modal from "./components/reactflow/Modal";
import CreateForm from "./components/CreateForm";
import useAuth from "./firebase/useAuth";
import { useEffect, useState } from "react";
import { listenToCollection } from "./item-service-v2";
import { ProjectRecord } from "./types/proejct";

export default function HomePage() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
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

  return (
    <div className="mx-auto border rounded-md p-4">
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
        {projects.map((person) => (
          <li
            key={person.id}
            className="flex justify-between gap-x-6 py-5 flex-col sm:flex-row"
          >
            <div className="flex min-w-0 gap-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img
                alt=""
                src={person.imageUrl}
                className="h-12 w-12 flex-none rounded-full bg-gray-50"
              />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {person.name}
                </p>
                <p className="text-xs leading-5 text-gray-500">
                  <BiSolidGroup fontSize={18} />
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col sm:items-end">
              <ButtonGroup align="right">
                <Button disabled>Share</Button>
                <Button disabled>Delete</Button>
                <Link href={person.id} className="primary-button">
                  View
                </Link>
              </ButtonGroup>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Last updated by {person.lastUpdatedBy?.displayName ?? "Unknown"}
                <br />
                on {new Date(person.lastUpdatedDatedTs).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
