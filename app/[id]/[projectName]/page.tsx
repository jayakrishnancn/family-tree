"use client";
import "@xyflow/react/dist/style.css";
import Flow from "../../components/reactflow/Flow";
import { Edge, Node, ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import useAuth from "../../firebase/useAuth";
import { Bounce, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Link from "next/link";
import Checkbox from "../../components/Checkbox";
import ShareBoard from "../../components/ShareBoard";
import { listenToProject, updateProject } from "../../item-service-v2";
import { deepEqual } from "@/app/utils/deepEqual";
import ButtonGroup from "@/app/components/ButtonGroup";

export type NodesAndEdges = {
  nodes: Node[];
  edges: Edge[];
};

export const toastConfigs = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Bounce,
} as ToastOptions;

export default function Home({ params }: any) {
  const [data, setData] = useState<NodesAndEdges | null>(null);
  const { user, loading } = useAuth();
  const userId = decodeURIComponent(params.id ?? "") || null;
  const projectId = decodeURIComponent(params.projectName ?? "") || null;
  const [error, setError] = useState<string | null>(null);

  const [isAutoSaveOn, setIsAutoSaveOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const onChange = (
    nodeAndEdges: NodesAndEdges,
    eventFromAutoSave: boolean
  ) => {
    if (!projectId || !userId) {
      return;
    }

    if (!isAutoSaveOn && eventFromAutoSave) {
      console.log("autosave disabled");
      return;
    }
    setError(null);
    if (
      deepEqual(
        { edges: data?.edges, nodes: data?.nodes } as NodesAndEdges,
        nodeAndEdges
      )
    ) {
      return;
    }

    updateProject({
      projectId: userId,
      project: projectId,
      item: nodeAndEdges,
      force: !eventFromAutoSave,
      emailId: user?.email,
    })
      .then((res) => res === true && toast.success("Saved", toastConfigs))
      .catch((error) => {
        console.log(error);
        setError(error);
        toast.error("Error: " + (error?.message ?? "unknown error"));
      });
  };

  useEffect(() => {
    if (!userId || !projectId || loading) {
      return;
    }
    setError(null);
    setIsLoading(true);
    listenToProject(
      userId,
      projectId,
      (data) => {
        console.log(projectId, "data", data);
        setData(data ?? null);
        setIsLoading(false);
      },
      (error) => {
        setError(error + "");
        setData(null);
        setIsLoading(false);
      }
    );
  }, [loading, projectId, userId]);

  if (loading) {
    return "Loading account details...";
  }

  if (isLoading) {
    return "Loading data...";
  }

  if (error) {
    return "Error: " + error;
  }

  if (!data || !userId) {
    return "Error loading data!";
  }

  return (
    projectId && (
      <div>
        <div className="flex m-4 flex-wrap justify-start gap-2">
          <ButtonGroup align="left">
            <div
              className="primary-button flex items-center gap-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAutoSaveOn((prev) => !prev);
              }}
            >
              <Checkbox
                id="auto-save"
                isChecked={isAutoSaveOn}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAutoSaveOn((prev) => !prev);
                }}
              />
              <b>Auto Save {isAutoSaveOn ? "ON" : "OFF"}</b>
            </div>

            <ShareBoard userId={userId} projectId={projectId} />
            <Link
              href={`/${userId}/${projectId}/audit-trail`}
              className="primary-button "
            >
              Audit Trail
            </Link>
          </ButtonGroup>
        </div>

        <div
          style={{
            height: "80vh",
            border: "2px solid #000",
            margin: "4px ",
            borderRadius: 10,
          }}
        >
          <ReactFlowProvider>
            <Flow
              key={JSON.stringify(data)}
              showPanel
              initialEdges={data.edges}
              initialNodes={data.nodes}
              onChange={onChange}
            />
          </ReactFlowProvider>
        </div>
      </div>
    )
  );
}
