import { firestoreDb } from "./firebase/config";
import { updateDoc, getDoc, doc, setDoc } from "firebase/firestore";
import { NodesAndEdges } from "./page";
import { Node } from "@xyflow/react";

const getRef = (userId: string) => doc(firestoreDb, userId, "item");

export async function getTree(userId: string): Promise<NodesAndEdges | null> {
  console.log("Fetching...", userId);
  try {
    const docSnap = await getDoc(getRef(userId));
    if (docSnap.exists()) {
      return docSnap.data() as NodesAndEdges;
    }
    return { nodes: [], edges: [] };
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
    data: { label: "", image: "/f.svg" },
    position: { x: 0, y: 50 },
  },
] as Node[];

export async function createTree(userId: string) {
  console.log("creating new ...", userId);
  return setDoc(getRef(userId), {
    nodes: initialNodes,
    edges: [],
  } as NodesAndEdges);
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
