import { toast } from "react-toastify";
import { CloneButton } from "../buttons/CommonButtons";
import { useSpinnerContext } from "../context/SpinnerContext";
import useAuth from "../firebase/useAuth";
import { createRecordIfNotExist } from "../item-service-v2";
import { ProjectRecord } from "../types/proejct";
import ConfirmModal from "./ConfirmButton";
import { toastConfigs } from "../utils/toast";

type CloneProjectProps = {
  project: ProjectRecord;
};

export default function CloneProject({ project }: CloneProjectProps) {
  const { setLoading } = useSpinnerContext();
  const { user } = useAuth();
  const handleClone = () => {
    if (!project || !user?.uid) {
      return;
    }
    setLoading(true);
    const projectName = project.name + "-Clone";
    const projectData: ProjectRecord = {
      ...project,
      id: "UNKNOWN",
      name: projectName,
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
    <ConfirmModal
      onConfirm={handleClone}
      title="Clone project"
      description={`Clone this project ${project.name}`}
      renderConfirmButton={(open) => <CloneButton onClick={open} />}
    />
  );
}
