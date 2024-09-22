"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AuditFirebaseFamilyRecord,
  deleteAuditTrail,
  getAuditTrail,
  updateTree,
} from "../item-service";
import useAuth from "../firebase/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { NodesAndEdges } from "../[id]/page";
import Link from "next/link";
import Modal from "../components/reactflow/Modal";
import Flow from "../components/reactflow/Flow";
import { ReactFlowProvider } from "@xyflow/react";

export default function AuditTrail() {
  const [items, setItems] = useState([] as AuditFirebaseFamilyRecord[]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const userId = user?.uid;
  const fetchData = useCallback(() => {
    if (!userId || loading) {
      return;
    }
    setIsLoading(true);
    getAuditTrail(userId)
      .then((res) => {
        res && setItems(res);
      })
      .catch((error) => {
        toast.error("Error fetching audit taril: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loading, userId]);

  const handleRestore = useCallback(
    (item: NodesAndEdges) => {
      if (!userId) {
        toast.error("Unknown userid");
        return;
      }
      setIsLoading(true);
      updateTree(userId, item, true)
        .then(() => {
          toast.success("Restored");
          return fetchData();
        })
        .catch((error) => {
          toast.error("Error restoring data" + error);
        })
        .finally(() => {
          setIsLoading(false);
          setShowModalData(null);
        });
    },
    [fetchData, userId]
  );

  const [showModalData, setShowModalData] =
    useState<AuditFirebaseFamilyRecord | null>(null);

  const handleClose = () => {
    setShowModalData(null);
  };

  const deleteItem = (id: string) => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    deleteAuditTrail([id], userId)
      .then(() => {
        toast.warn("Deleted");
        return fetchData();
      })
      .catch((error) => {
        toast.error("Error deelting data" + error);
      })
      .finally(() => {
        setIsLoading(false);
        setShowModalData(null);
      });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return loading ? (
    "Loading auth..."
  ) : !userId ? (
    "Unknown user"
  ) : isLoading ? (
    "Loading firebase data"
  ) : (
    <div className="w-screen flex justify-center flex-col p-10">
      <div>
        <Link href="/" className="primary-button rounded">
          Home
        </Link>
      </div>
      <div className="flex gap-4 mb-4 justify-center items-center">
        <h2 className="text-2xl font-bold text-center">Audit trail</h2>
      </div>
      <table className="table-auto border-2 border-collapse border border-slate-400">
        <thead>
          <tr>
            <th className="border  border-2 p-2 border-slate-300 ">
              Timestamp
            </th>
            <th className="border  border-2 p-2 border-slate-300 ">Action</th>
          </tr>
        </thead>
        <tbody>
          {items?.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="border border-2 p-2 border-slate-300 text-center"
              >
                No data found
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id}>
                <td className="border  border-2 p-2 border-slate-300 text-center  ">
                  {new Date(item.updatedTs).toLocaleString()}
                </td>
                <td className="border  border-2 p-2 border-slate-300 text-center">
                  <div>
                    <button
                      disabled={index === 0}
                      className="primary-button flex-1 text-sm"
                      onClick={() => {
                        handleRestore(item.data);
                      }}
                    >
                      Restore
                    </button>

                    <button
                      disabled={index === 0}
                      className="primary-button flex-1 text-sm"
                      onClick={() => {
                        deleteItem(item.id);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="primary-button flex-1 text-sm"
                      onClick={() => {
                        setShowModalData(item);
                      }}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <ReactFlowProvider>
        <Modal show={showModalData} onClose={handleClose}>
          <button
            className="primary-button  round text-sm"
            onClick={() => {
              showModalData?.data && handleRestore(showModalData.data);
            }}
          >
            Restore
          </button>
          <div style={{ height: "80vh", width: "90vw" }}>
            <Flow
              onChange={() => {}}
              initialEdges={showModalData?.data.edges ?? []}
              initialNodes={showModalData?.data.nodes ?? []}
            />
          </div>
        </Modal>
      </ReactFlowProvider>
    </div>
  );
}
