import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  FirestoreError,
  getDocFromServer,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { firestoreDb } from "./firebase/config";
import { ProjectRecord } from "./types/proejct";

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
  project: ProjectRecord
): Promise<void> {
  if (await getRecord(userId, project.name)) {
    throw new Error(
      "Project already exist. Please choose a different project name"
    );
  }
  console.log("creating new ...", userId);

  return setDoc(getDoc(userId, project.name), project);
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

export async function getRecords(
  userId: string
): Promise<ProjectRecord[] | null> {
  const snapshot = await getDocs(getCol(userId));
  const data = snapshot.docs.map((doc) => {
    const docData = doc.data() as ProjectRecord;
    return {
      ...docData,
      id: doc.id,
      name: docData.name ?? doc.id,
    } as ProjectRecord;
  });
  data.sort((a, b) => b.lastUpdatedDatedTs - a.lastUpdatedDatedTs);
  return data;
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

export const listenToProject = (
  userId: string,
  projectId: string,
  callback: (data?: ProjectRecord) => void,
  callbackError?: (error: FirestoreError) => void
): Unsubscribe => {
  const ref = getDoc(userId, projectId);
  return onSnapshot(
    ref,
    (snapshot) => {
      const data = snapshot.data() as ProjectRecord;
      callback(data);
    },
    callbackError
  );
};

export async function deleteProject(userId: string, project: string) {
  await deleteDoc(getDoc(userId, project));
}

export type ProjectAuditTrail = {
  data: ProjectRecord;
  updatedTs: number;
  id: string;
  updatedBy?: string | null;
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
    throw e;
  }
}

export async function deleteAuditTrail(
  userId: string,
  projectId: string,
  auditIds: string[]
) {
  const batch = writeBatch(firestoreDb);
  auditIds.forEach((id) => batch.delete(getAuditDoc(userId, projectId, id)));
  await batch.commit();
}

export async function updateProject({
  projectId,
  project,
  force,
  item,
  emailId,
}: {
  projectId: string;
  project: string;
  item: Pick<
    ProjectRecord,
    "nodes" | "edges" | "lastUpdatedBy" | "lastUpdatedDatedTs"
  >;
  force: boolean;
  emailId?: string | null;
}): Promise<boolean> {
  if (!force && item.nodes.length === 0) {
    return false;
  }
  const batch = writeBatch(firestoreDb);
  batch.update(getDoc(projectId, project), item);

  const auditTrail = getAuditDoc(projectId, project, Date.now() + "");

  batch.set(auditTrail, {
    data: item,
    updatedTs: Date.now(),
    updatedBy: emailId,
  } as ProjectAuditTrail);

  console.log("Updating...", projectId, item);
  await batch.commit();
  return true;
}

//share list

export async function addEmailToSharedList({
  userId,
  projectId,
  emailId,
}: {
  userId: string;
  projectId: string;
  emailId: string;
}) {
  const ref = getDoc(userId, projectId);
  await updateDoc(ref, {
    sharedWith: arrayUnion(emailId.toLowerCase()),
  });
}

export async function removeEmailToSharedList({
  userId,
  projectId,
  emailId,
}: {
  userId: string;
  projectId: string;
  emailId: string;
}) {
  debugger;
  const ref = getDoc(userId, projectId);
  await updateDoc(ref, {
    sharedWith: arrayRemove(emailId.trim().toLowerCase()),
  });
}
