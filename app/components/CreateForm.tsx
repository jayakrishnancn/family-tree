"use client";
import { FunctionComponent, useState } from "react";
import Button from "./Button";
import { useSpinnerContext } from "../context/SpinnerContext";
import { createRecordIfNotExist } from "../item-service-v2";
import { toast } from "react-toastify";
import ButtonGroup from "./ButtonGroup";
import { toastConfigs } from "../utils/toast";
import { ProjectRecord } from "../types/proejct";
import { Node } from "@xyflow/react";
import { SexEnum } from "./reactflow/CustomNode";
import useAuth from "../firebase/useAuth";

const initialNodes = [
  {
    id: "0",
    type: "custom",
    data: { label: "", sex: SexEnum.Unknown },
    position: { x: 0, y: 50 },
  },
] as Node[];

interface CreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateForm: FunctionComponent<CreateFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { setLoading } = useSpinnerContext();
  const { user } = useAuth();

  const [projectName, setProjectName] = useState("");
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (projectName.trim().length === 0) {
      toast.error("Project name is empty.", toastConfigs);
      return;
    }
    if (!user?.uid) {
      return;
    }
    setLoading(true);
    const projectData: ProjectRecord = {
      nodes: initialNodes,
      edges: [],
      id: "UNKNOWN",
      name: projectName,
      imageUrl: "/u.svg",
      lastUpdatedBy: {
        uid: user?.uid,
        displayName: user?.displayName,
      },
      lastUpdatedDatedTs: Date.now(),
      sharedWith: [],
    } as ProjectRecord;
    createRecordIfNotExist(user?.uid, projectData)
      .then(() => {
        toast.success(
          "Created new project with name " + projectName,
          toastConfigs
        );
        setProjectName("");
        onSuccess();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error creating project. " + error?.message, toastConfigs);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-screen max-w-xl flex flex-col gap-2">
        <div className="text-lg">Project name</div>
        <input
          autoFocus
          placeholder="Project name"
          className="p-3 border border-black rounded"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value);
          }}
        />
        <ButtonGroup align="right">
          <Button varient="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </ButtonGroup>
      </div>
    </form>
  );
};

export default CreateForm;
