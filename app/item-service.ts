import { firestoreDb } from "./firebase/config";
import {
  getDoc,
  doc,
  setDoc,
  writeBatch,
  getDocs,
  collection,
} from "firebase/firestore";
import { NodesAndEdges } from "./page";
import { Node } from "@xyflow/react";
import { SexEnum } from "./components/reactflow/CustomNode";

const PROJECT = "PROJECT-1";
const getRef = (userId: string) => doc(firestoreDb, userId, PROJECT);
const getAuditRef = (userId: string, timeStamp: number) =>
  doc(firestoreDb, "auditTrail", userId, PROJECT, timeStamp + "");
const getAuditsRef = (userId: string) =>
  collection(firestoreDb, "auditTrail", userId, PROJECT);

export async function getTree(userId: string): Promise<NodesAndEdges | null> {
  console.log("Fetching...", userId);
  try {
    const docSnap = await getDoc(getRef(userId));
    if (docSnap.exists()) {
      return docSnap.data() as NodesAndEdges;
    }
    return null;
  } catch (e) {
    console.error("error", e);
  }
  // no record exist
  return null;
}

const initialNodes = [
  {
    id: "0",
    type: "custom",
    data: { label: "", sex: SexEnum.Unknown },
    position: { x: 0, y: 50 },
  },
] as Node[];

export async function createTree(userId: string): Promise<NodesAndEdges> {
  console.log("creating new ...", userId);
  const data = {
    nodes: initialNodes,
    edges: [],
  } as NodesAndEdges;
  return setDoc(getRef(userId), data).then(() => data);
}

export type AudotNodesAndEdges = {
  data: NodesAndEdges;
  updatedTs: number;
};

export async function updateTree(
  userId: string,
  item: NodesAndEdges,
  force: boolean
): Promise<boolean> {
  if (!force && item.nodes.length === 0) {
    return false;
  }
  const batch = writeBatch(firestoreDb);
  batch.update(getRef(userId), item);

  const auditTrail = getAuditRef(userId, Date.now());

  batch.set(auditTrail, {
    data: item,
    updatedTs: Date.now(),
  } as AudotNodesAndEdges);

  console.log("Updating...", userId, item);
  await batch.commit();
  return true;
}

export async function getAuditTrail(
  userId: string
): Promise<AudotNodesAndEdges[] | null> {
  console.log("Fetching...", userId);
  try {
    const items = [] as AudotNodesAndEdges[];
    const docSnap = await getDocs(getAuditsRef(userId));
    docSnap.forEach((item) => {
      const data = item.data();
      data && items.push(data as AudotNodesAndEdges);
    });
    items.sort((a, b) => b.updatedTs - a.updatedTs);
    return items;
  } catch (e) {
    console.error("error", e);
  }
  // no record exist
  return null;
}
