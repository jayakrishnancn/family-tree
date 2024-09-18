import { Handle, Position, useConnection, useReactFlow } from "@xyflow/react";
import Image from "next/image";
import { useCallback } from "react";

export enum SexEnum {
  M,
  F,
  Unknown,
}

export const IMGS = [SexEnum.F, SexEnum.M, SexEnum.Unknown];

function getNextItem(currentItem: SexEnum): SexEnum {
  const currentIndex = IMGS.indexOf(currentItem);
  if (currentIndex === -1) {
    throw new Error("Item not found in the array");
  }
  const nextIndex = (currentIndex + 1) % IMGS.length;
  return IMGS[nextIndex] ?? SexEnum.Unknown;
}

export default function CustomNode({ id, data }: any) {
  const connection = useConnection();
  const { updateNodeData } = useReactFlow();

  const onChange = useCallback(
    (evt: any) => {
      updateNodeData(id, { label: evt.target.value });
    },
    [id, updateNodeData]
  );
  const onChangeImg = useCallback(() => {
    const sex = getNextItem(data?.sex ?? SexEnum.Unknown);
    updateNodeData(id, { sex });
  }, [data?.sex, id, updateNodeData]);

  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const getImageFromSex = (sex: SexEnum | null) => {
    if (sex === SexEnum.F) {
      return "/f.svg";
    }
    if (sex === SexEnum.M) {
      return "/m.svg";
    }
    return "/u.svg";
  };

  return (
    <div className="customNode">
      <div
        className="customNodeBody"
        style={{
          borderStyle: isTarget ? "dashed" : "solid",
          backgroundColor: isTarget ? "#ffcce3" : "#fbeee0",
        }}
      >
        {(!connection.inProgress || !isTarget) && (
          <Handle
            className="customHandle source"
            position={Position.Bottom}
            type="source"
          />
        )}

        {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
        {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
        <Handle
          className="customHandle target"
          style={{
            display: isTarget ? "block" : "none",
          }}
          position={Position.Top}
          type="target"
        />
        <div className="flex flex-col gap-1 items-center card-content">
          <Image
            src={getImageFromSex(data?.sex)}
            alt="pic"
            width={30}
            height={30}
            className="pic"
            onClick={onChangeImg}
          />
          <input
            id="text"
            name="text"
            value={data?.label ?? ""}
            placeholder="Name"
            autoComplete="off"
            onChange={onChange}
            className="nodrag"
          />
        </div>
      </div>
    </div>
  );
}
