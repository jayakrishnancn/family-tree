"use client";
import "@xyflow/react/dist/style.css";
import Flow from "../components/reactflow/Flow";
import { Edge, Node, ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { createTree, getTree, updateTree } from "../item-service";
import Login from "../login/page";
import useAuth from "../firebase/useAuth";
import { auth } from "../firebase/config";
import { Bounce, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Link from "next/link";
import Checkbox from "../components/Checkbox";
import ShareBoard from "../components/ShareBoard";

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

export default function Home({ params }: { params: { id?: string } }) {
  const [data, setData] = useState<NodesAndEdges | null>(null);
  const { user, loading } = useAuth();
  const recordId = params.id ?? user?.uid ?? "";
  const [isAutoSaveOn, setIsAutoSaveOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const onChange = (
    nodeAndEdges: NodesAndEdges,
    eventFromAutoSave: boolean
  ) => {
    if (!recordId || !user?.uid) {
      return;
    }

    if (!isAutoSaveOn && eventFromAutoSave) {
      console.log("autosave disabled");
      return;
    }

    updateTree(recordId, nodeAndEdges, !eventFromAutoSave)
      .then((res) => res === true && toast.success("Saved", toastConfigs))
      .catch((error) => {
        console.log(error);
        toast.error("Error: " + (error?.message ?? "unknown error"));
      });
  };

  const handleLogout = (): void => {
    auth
      .signOut()
      .then((res) => {
        console.log("User signed out", res);
        toast.success("Signed out", toastConfigs);
      })
      .catch((error) => {
        // An error happened.
        console.error("Error signing out: ", error);

        toast.error("Error signing out:" + (error?.message ?? "unknown error"));
      });
  };

  useEffect(() => {
    console.log(recordId, "recordId");
    if (!recordId || loading || !user?.uid) {
      return;
    }
    setIsLoading(true);
    getTree(recordId)
      .then((res) => {
        console.log(recordId, res, "res");
        if (res !== null) {
          setData(res);
          return;
        }

        return createTree(recordId).then((res) => {
          setData(res);
          setIsLoading(false);
          toast.success("Created new Project", toastConfigs);
        });
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        toast.error("Error" + (error?.message ?? "unknown error"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loading, recordId, user?.uid]);

  if (loading) {
    return "Loading account details...";
  }

  if (!user?.uid) {
    return <Login />;
  }

  if (isLoading) {
    return "Loading data...";
  }

  if (!data) {
    return "Error loading data!";
  }

  return (
    <div>
      <div className="flex m-4 justify-start">
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

        <ShareBoard id={recordId} />
        <Link href="/audit-trail" className="primary-button ">
          Audit Trail
        </Link>
        <button className="primary-button" onClick={handleLogout}>
          Logout - {user?.displayName ?? "Unknown"}
        </button>
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
            showPanel
            initialEdges={data.edges}
            initialNodes={data.nodes}
            onChange={onChange}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
