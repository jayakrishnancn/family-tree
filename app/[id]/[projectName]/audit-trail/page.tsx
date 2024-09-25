"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { NodesAndEdges } from "../page";
import Modal from "../../../components/reactflow/Modal";
import Flow from "../../../components/reactflow/Flow";
import { ReactFlowProvider } from "@xyflow/react";
import { useSpinnerContext } from "@/app/context/SpinnerContext";
import {
  deleteAuditTrail,
  getAuditTrail,
  ProjectAuditTrail,
  updateProject,
} from "@/app/item-service-v2";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import useAuth from "@/app/firebase/useAuth";
import ButtonGroup from "@/app/components/ButtonGroup";
import ConfirmModal from "@/app/components/ConfirmButton";
import { toastConfigs } from "@/app/utils/toast";

export default function AuditTrail({ params }: any) {
  const [items, setItems] = useState([] as ProjectAuditTrail[]);
  const { setLoading } = useSpinnerContext();
  const userId = decodeURIComponent(params.id ?? "") || null;
  const projectId = decodeURIComponent(params.projectName ?? "") || null;
  const router = useRouter();
  const { user } = useAuth();

  const fetchData = useCallback(() => {
    if (!userId || !projectId) {
      return;
    }
    setLoading(true);
    getAuditTrail(userId, projectId)
      .then((res) => {
        res && setItems(res);
      })
      .catch((error) => {
        toast.error(
          "Error fetching audit taril: " + error.message,
          toastConfigs
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, setLoading, userId]);

  const handleRestore = useCallback(
    (item: NodesAndEdges) => {
      if (!userId || !projectId) {
        toast.error("Unknown userid", toastConfigs);
        return;
      }
      setLoading(true);
      updateProject({
        projectId: userId,
        project: projectId,
        item: {
          ...item,
          lastUpdatedBy: {
            uid: user?.uid ?? "unknown",
            displayName: user?.displayName ?? "unknown",
          },
          lastUpdatedDatedTs: Date.now(),
        },
        force: true,
      })
        .then(() => {
          toast.success("Restored", toastConfigs);
          return fetchData();
        })
        .catch((error) => {
          toast.error("Error restoring data" + error, toastConfigs);
        })
        .finally(() => {
          setLoading(false);
          setShowModalData(null);
        });
    },
    [fetchData, projectId, setLoading, user?.displayName, user?.uid, userId]
  );

  const [showModalData, setShowModalData] = useState<ProjectAuditTrail | null>(
    null
  );

  const handleClose = () => {
    setShowModalData(null);
  };

  const deleteItem = (id: string) => {
    if (!userId || !projectId) {
      return;
    }
    setLoading(true);
    deleteAuditTrail(userId, projectId, [id])
      .then(() => {
        toast.error("Deleted Audit trail", toastConfigs);
        return fetchData();
      })
      .catch((error) => {
        toast.error("Error deelting data" + error, toastConfigs);
      })
      .finally(() => {
        setLoading(false);
        setShowModalData(null);
      });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return !userId ? (
    "Unknown user"
  ) : (
    <div className="w-screen flex justify-center flex-col p-10">
      <div className="flex">
        <Button
          onClick={() => {
            router.back();
          }}
        >
          Back
        </Button>
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
            items.map((autitTrailRecord, index) => (
              <tr key={autitTrailRecord.id}>
                <td className="border  border-2 p-2 border-slate-300 text-center  ">
                  {new Date(autitTrailRecord.updatedTs).toLocaleString()}
                </td>
                <td className="border  border-2 p-2 border-slate-300 text-center">
                  <ButtonGroup>
                    <Button
                      disabled={index === 0}
                      onClick={() => {
                        handleRestore(autitTrailRecord.data);
                      }}
                    >
                      Restore
                    </Button>

                    <ConfirmModal
                      title="Delete Audit trail"
                      description={`Delete this audit trail record for project ${
                        autitTrailRecord.data.name ?? ""
                      }?`}
                      onConfirm={() => {
                        deleteItem(autitTrailRecord.id);
                      }}
                      renderConfirmButton={(open) => (
                        <Button disabled={index === 0} onClick={open}>
                          Delete
                        </Button>
                      )}
                    />
                    <Button
                      onClick={() => {
                        setShowModalData(autitTrailRecord);
                      }}
                    >
                      View
                    </Button>
                  </ButtonGroup>
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
