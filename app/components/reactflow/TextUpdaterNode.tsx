import { useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";

function TextUpdaterNode({ data, id }: any) {
  const { updateNodeData } = useReactFlow();

  const onChange = useCallback(
    (evt: any) => {
      updateNodeData(id, { label: evt.target.value });
    },
    [id, updateNodeData]
  );

  return (
    <div className="jk">
      <Handle type="target" position={Position.Top} isConnectable />
      <div className="input-wrapper">
        <input
          id="text"
          name="text"
          placeholder="Name"
          value={data.name}
          onChange={onChange}
          autoComplete="person-name-1"
        />
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable />
      <Handle type="source" position={Position.Left} isConnectable />
      <Handle type="source" position={Position.Right} isConnectable />
    </div>
  );
}

export default TextUpdaterNode;
