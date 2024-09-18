import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Edge,
  Node,
  useReactFlow,
  Panel,
  OnNodesChange,
  applyNodeChanges,
  Controls,
  MiniMap,
  Connection,
  FinalConnectionState,
  Background,
  BackgroundVariant,
} from "@xyflow/react";

import CustomNode from "./CustomNode";
import FloatingEdge from "./FloatingEdge";

import "@xyflow/react/dist/style.css";
import CustomConnectionLine from "./CustomConnectionLine";
import useDebounce from "./useDebounce";
import { NodesAndEdges } from "@/app/page";
const DELAY = 10000;

const connectionLineStyle = {
  strokeWidth: 3,
  stroke: "black",
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: "black" },
  type: "floating",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "black",
  },
};

const getId = () => `${Date.now()}`;

const Flow = ({
  initialEdges,
  initialNodes,
  onChange,
  showPanel,
}: {
  initialEdges: Edge[];
  initialNodes: Node[];
  onChange: (nodeAndEdges: NodesAndEdges, isAutoSave: boolean) => void;
  showPanel?: boolean;
}) => {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (!connectionState.fromNode?.id) {
        return;
      }
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          type: "custom",
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `` },
          origin: [0.5, 0.0],
        } as Node;

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode!.id, target: id })
        );
      }
    },
    [screenToFlowPosition, setEdges, setNodes]
  );

  const input = useMemo(() => ({ nodes, edges }), [edges, nodes]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      onChange(input, false);
    }
  }, [input, onChange, rfInstance]);

  const debouncedSearchTerm = useDebounce(input, DELAY);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onChange(debouncedSearchTerm, true);
    }
  }, [debouncedSearchTerm, onChange]);

  const onAdd = useCallback(() => {
    const newNode = {
      id: getId(),
      data: { label: "" },
      type: "custom",
      position: {
        x: 0,
        y: 0,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onConnectEnd={onConnectEnd}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={setRfInstance}
      connectionLineComponent={CustomConnectionLine}
      connectionLineStyle={connectionLineStyle}
      snapToGrid
      minZoom={0.1}
    >
      <Controls />
      <Background variant={BackgroundVariant.Lines} />
      <MiniMap />
      {showPanel && (
        <Panel position="top-right">
          <button className="button-74" onClick={onSave}>
            save
          </button>
          <button className="button-74" onClick={onAdd}>
            add node
          </button>
        </Panel>
      )}
    </ReactFlow>
  );
};

export default Flow;
