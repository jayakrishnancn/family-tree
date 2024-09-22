"use client";
import { FunctionComponent, useState } from "react";
import Button from "./Button";
import { useSpinnerContext } from "../context/SpinnerContext";
import { createRecordIfNotExist } from "../item-service-v2";
import { toast } from "react-toastify";
import ButtonGroup from "./ButtonGroup";

interface CreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  userId: string;
}

const CreateForm: FunctionComponent<CreateFormProps> = ({
  userId,
  onCancel,
  onSuccess,
}) => {
  const { setLoading } = useSpinnerContext();
  const [projectName, setProjectName] = useState("");
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (projectName.trim().length === 0) {
      toast.error("Project name is empty.");
      return;
    }
    setLoading(true);
    createRecordIfNotExist(userId, projectName)
      .then(() => {
        toast.success("Created new project with name " + projectName);
        setProjectName("");
        onSuccess();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error creating project. " + error?.message);
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
