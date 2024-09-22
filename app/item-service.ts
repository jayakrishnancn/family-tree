import { firestoreDb } from "./firebase/config";

import { getDoc, doc, writeBatch, collection } from "firebase/firestore";
import { NodesAndEdges } from "./[id]/[projectName]/page";

type FirebaseRecord = NodesAndEdges & {
  allowedEmail: string[];
};

const PROJECT = "PROJECT-1";
const getRef = (userId: string) => doc(firestoreDb, userId, PROJECT);
const getAuditRef = (userId: string, timeStamp: number | string) =>
  doc(firestoreDb, "auditTrail", userId, PROJECT, timeStamp + "");
const getAuditsRef = (userId: string) =>
  collection(firestoreDb, "auditTrail", userId, PROJECT);

export async function getTree(userId: string): Promise<NodesAndEdges | null> {
  console.log("Fetching...", userId);
  try {
    const docSnap = await getDoc(getRef(userId));
    if (docSnap.exists()) {
      return docSnap.data() as FirebaseRecord;
    }
    return null;
  } catch (e) {
    console.error("error", e);
  }
  // no record exist
  return null;
}

export type AuditFirebaseFamilyRecord = {
  data: FirebaseRecord;
  updatedTs: number;
  id: string;
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
  } as AuditFirebaseFamilyRecord);

  console.log("Updating...", userId, item);
  await batch.commit();
  return true;
}

// export async function getAuditTrail(
//   userId: string
// ): Promise<AuditFirebaseFamilyRecord[] | null> {
//   console.log("Fetching...", userId);
//   try {
//     const items = [] as AuditFirebaseFamilyRecord[];
//     const docSnap = await getDocs(getAuditsRef(userId));
//     docSnap.forEach((item) => {
//       const data = item.data();
//       data &&
//         items.push({
//           ...data,
//           id: item.id,
//         } as AuditFirebaseFamilyRecord);
//     });
//     items.sort((a, b) => b.updatedTs - a.updatedTs);
//     return items;
//   } catch (e) {
//     console.error("error", e);
//   }
//   // no record exist
//   return null;
// }

export async function deleteAuditTrail(ids: string[], userId: string) {
  const batch = writeBatch(firestoreDb);
  ids.forEach((id) => batch.delete(getAuditRef(userId, id)));
  await batch.commit();
}
