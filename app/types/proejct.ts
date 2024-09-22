import { NodesAndEdges } from "../[id]/page";

export type ProjectRecord = {
  id: string;
  name: string;
  imageUrl: string;
  lastUpdatedBy: {
    uid: string;
    displayName: string;
  };
  lastUpdatedDatedTs: number;
  sharedWith: string[];
} & NodesAndEdges;
