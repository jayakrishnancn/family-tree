"use client";
import "@xyflow/react/dist/style.css";
import Flow from "./components/reactflow/Flow";
import { Edge, Node, ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { createTree, getTree, updateTree } from "./item-service";
import Login from "./login/page";
import useAuth from "./firebase/useAuth";
import { auth } from "./firebase/config";
import { Bounce, toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export type NodesAndEdges = {
  nodes: Node[];
  edges: Edge[];
};

const toastConfigs = {
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

export default function Home() {
  const [data, setData] = useState<NodesAndEdges | null>(null);
  const { user, loading } = useAuth();
  const userId = user?.uid ?? "";
  const [isAutoSaveOn, setIsAutoSaveOn] = useState(false);
  const onChange = (
    nodeAndEdges: NodesAndEdges,
    eventFromAutoSave: boolean
  ) => {
    console.log(nodeAndEdges, eventFromAutoSave, isAutoSaveOn);
    if (!userId) {
      return;
    }

    if (!isAutoSaveOn && eventFromAutoSave) {
      console.log("autosave disabled");
      return;
    }

    updateTree(userId, nodeAndEdges, !eventFromAutoSave)
      .then((res) => res && toast.success("Saved", toastConfigs))
      .catch((error) => {
        console.log(error);
        toast.error("Error" + (error?.message ?? "unknown error"));
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
    if (!userId || loading) {
      return;
    }
    getTree(userId)
      .then((res) => {
        console.log(userId, res, "res");
        if (res === null) {
          return createTree(userId);
        }
        setData(res);
        return null;
      })
      .then((res) => {
        res && toast.success("Saved", toastConfigs);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error" + (error?.message ?? "unknown error"));
      });
  }, [loading, userId]);

  if (loading) {
    return "Loading...";
  }
  if (!userId) {
    return <Login />;
  }
  if (!data) {
    return "Error loading data";
  }

  return (
    <div>
      {!userId ? (
        <Login />
      ) : (
        <div>
          <div className="flex gap-4 m-4 justify-between">
            <div className="flex items-center flex-col">
              <span className="switch">
                <input
                  id="switch-rounded"
                  type="checkbox"
                  checked={isAutoSaveOn}
                  onChange={() => {
                    setIsAutoSaveOn((prev) => !prev);
                  }}
                />
                <label htmlFor="switch-rounded"></label>
              </span>
              <b>Auto Save {isAutoSaveOn ? "ON" : "OFF"}</b>
            </div>
            <button className="button-74 round" onClick={handleLogout}>
              Logout - {user?.displayName ?? "Unknown"}
            </button>
          </div>
          <ToastContainer />
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
                initialEdges={data.edges}
                initialNodes={data.nodes}
                onChange={onChange}
              />
            </ReactFlowProvider>
          </div>
        </div>
      )}
    </div>
  );
}
