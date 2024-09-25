"use client";
import "@xyflow/react/dist/style.css";
import Flow from "../../components/reactflow/Flow";
import { Edge, Node, ReactFlowProvider } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import useAuth from "../../firebase/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Checkbox from "../../components/Checkbox";
import ShareBoard from "../../components/ShareBoard";
import { listenToProject, updateProject } from "../../item-service-v2";
import { deepEqual } from "@/app/utils/deepEqual";
import ButtonGroup from "@/app/components/ButtonGroup";
import { ProjectRecord } from "@/app/types/proejct";
import { toastConfigs } from "@/app/utils/toast";
import { AuditTrailButton } from "@/app/buttons/CommonButtons";

export type NodesAndEdges = {
  nodes: Node[];
  edges: Edge[];
};

export default function Home({ params }: any) {
  const [data, setData] = useState<ProjectRecord | null>(null);
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
      item: {
        ...nodeAndEdges,
        lastUpdatedBy: {
          uid: user?.uid ?? "unknown",
          displayName: user?.displayName ?? "unknown",
        },
        lastUpdatedDatedTs: Date.now(),
      },
      force: !eventFromAutoSave,
      emailId: user?.email,
    })
      .then((res) => res === true && toast.success("Saved", toastConfigs))
      .catch((error) => {
        console.log(error);
        setError(error);
        toast.error(
          "Error: " + (error?.message ?? "unknown error"),
          toastConfigs
        );
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

  const dataChecksum = useMemo(() => JSON.stringify(data), [data]);

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

            <ShareBoard
              userId={userId}
              projectId={projectId}
              sharedWith={data.sharedWith}
              projectTitle={data.name}
            />
            <AuditTrailButton href={`/${userId}/${projectId}/audit-trail`} />
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
              key={dataChecksum}
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
