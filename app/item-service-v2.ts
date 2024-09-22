import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { auth, firestoreDb } from "./firebase/config";
import { SexEnum } from "./components/reactflow/CustomNode";
import { Node } from "@xyflow/react";
import { ProjectRecord } from "./types/proejct";

const initialNodes = [
  {
    id: "0",
    type: "custom",
    data: { label: "", sex: SexEnum.Unknown },
    position: { x: 0, y: 50 },
  },
] as Node[];

function getDoc(userId: string, project: string) {
  return doc(firestoreDb, userId, project);
}

function getCol(userId: string) {
  return collection(firestoreDb, userId);
}

export async function createRecordIfNotExist(
  userId: string,
  project: string
): Promise<ProjectRecord> {
  if (await getRecord(userId, project)) {
    throw new Error(
      "Project already exist. Please choose a different project name"
    );
  }
  console.log("creating new ...", userId);
  const data = {
    nodes: initialNodes,
    edges: [],
    id: "UNKNOWN",
    name: project,
    imageUrl: "/u.svg",
    lastUpdatedBy: {
      uid: auth.currentUser?.uid,
      displayName: auth.currentUser?.displayName,
    },
    lastUpdatedDatedTs: Date.now(),
    sharedWith: [],
  } as ProjectRecord;
  return setDoc(getDoc(userId, project), data, {}).then(() => data);
}

export async function getRecord(
  userId: string,
  project: string
): Promise<ProjectRecord | null> {
  const record = await getDocFromServer(getDoc(userId, project));
  if (record.exists()) {
    return record.data() as ProjectRecord;
  }
  return null;
}

export const listenToCollection = (
  userId: string,
  callback: (data: ProjectRecord[]) => void
): Unsubscribe => {
  return onSnapshot(getCol(userId), (snapshot) => {
    const data = snapshot.docs.map((doc) => {
      const docData = doc.data() as ProjectRecord;
      return {
        ...docData,
        id: doc.id,
        name: docData.name ?? doc.id,
      } as ProjectRecord;
    });
    data.sort((a, b) => b.lastUpdatedDatedTs - a.lastUpdatedDatedTs);
    callback(data);
  });
};

export async function deleteProject(userId: string, project: string) {
  await deleteDoc(getDoc(userId, project));
}
