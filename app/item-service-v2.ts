import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
  writeBatch,
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

const AUDIT_TRAIL = "auditTrail";

const getAuditDoc = (userId: string, project: string, id: string) => {
  return doc(firestoreDb, AUDIT_TRAIL, userId, project, id);
};
const getAuditCol = (userId: string, project: string) => {
  return collection(firestoreDb, AUDIT_TRAIL, userId, project);
};

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
  return setDoc(getDoc(userId, project), data).then(() => data);
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

export type ProjectAuditTrail = {
  data: ProjectRecord;
  updatedTs: number;
  id: string;
};

export async function getAuditTrail(
  userId: string,
  project: string
): Promise<ProjectAuditTrail[] | null> {
  console.log("Fetching...", userId);
  try {
    const items = [] as ProjectAuditTrail[];
    const docSnap = await getDocs(getAuditCol(userId, project));
    docSnap.forEach((item) => {
      const data = item.data();
      data &&
        items.push({
          ...data,
          id: item.id,
        } as ProjectAuditTrail);
    });
    items.sort((a, b) => b.updatedTs - a.updatedTs);
    return items;
  } catch (e) {
    console.error("error", e);
  }
  // no record exist
  return null;
}

export async function updateProject({
  userId,
  project,
  force,
  item,
}: {
  userId: string;
  project: string;
  item: Pick<ProjectRecord, "nodes" | "edges">;
  force: boolean;
}): Promise<boolean> {
  if (!force && item.nodes.length === 0) {
    return false;
  }
  const batch = writeBatch(firestoreDb);
  batch.update(getDoc(userId, project), item);

  const auditTrail = getAuditDoc(userId, project, Date.now() + "");

  batch.set(auditTrail, {
    data: item,
    updatedTs: Date.now(),
  } as ProjectAuditTrail);

  console.log("Updating...", userId, item);
  await batch.commit();
  return true;
}
