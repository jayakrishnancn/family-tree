import { Handle, Position, useConnection, useReactFlow } from "@xyflow/react";
import Image from "next/image";
import { useCallback } from "react";

function getNextItem(currentItem: string): string {
  const items = ["/f.svg", "/m.svg", "/u.svg"];
  const currentIndex = items.indexOf(currentItem);
  if (currentIndex === -1) {
    throw new Error("Item not found in the array");
  }
  const nextIndex = (currentIndex + 1) % items.length;
  return items[nextIndex];
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
    const image = getNextItem(data?.image ?? "/u.svg");
    updateNodeData(id, { image });
  }, [data?.image, id, updateNodeData]);

  const isTarget = connection.inProgress && connection.fromNode.id !== id;

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
            src={data?.image ?? "/u.svg"}
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
            onChange={onChange}
            className="nodrag"
          />
        </div>
      </div>
    </div>
  );
}
