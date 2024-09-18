import { firestoreDb } from "./firebase/config";
import { updateDoc, getDoc, doc, setDoc } from "firebase/firestore";
import { NodesAndEdges } from "./page";
import { Node } from "@xyflow/react";
import { SexEnum } from "./components/reactflow/CustomNode";

const getRef = (userId: string) => doc(firestoreDb, userId, "project-1");

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

export async function updateTree(
  userId: string,
  item: NodesAndEdges,
  force: boolean
): Promise<boolean> {
  if (!force && item.nodes.length === 0) {
    return false;
  }
  console.log("Updating...", userId, item);
  return updateDoc(getRef(userId), item).then((_) => true);
}
