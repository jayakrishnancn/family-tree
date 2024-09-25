import { storage } from "../firebase/config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export async function uploadImageWithTransaction(file: File) {
  const storageRef = ref(storage, `images/${file.name}${Date.now()}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = getDownloadURL(snapshot.ref);
    console.log("Transaction successfully committed!");
    return url;
  } catch (error) {
    console.error("Transaction failed: ", error);
  }
}
