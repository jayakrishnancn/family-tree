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
import { NodesAndEdges } from "@/app/[id]/[projectName]/page";
import ButtonGroup from "../ButtonGroup";
import Button from "../Button";
import { BiSave } from "react-icons/bi";
import { CgAdd } from "react-icons/cg";
import SidebarForm from "../SidebarForm";
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [openSidebar, setOpenSidebar] = useState(true);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        const selected = updatedNodes.find((node) => node.selected);
        setSelectedNode(selected || null);
        return updatedNodes;
      }),
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

  //todo: make this dynamic
  const { x, y } = nodes.find((i) => !!i.data.isDefault)?.position || {
    x: -21000,
    y: -60,
  };

  const defaultViewport = { x: x + 21000, y: y + 60, zoom: 0.5 };

  return (
    <div style={{ display: "flex", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        edgeTypes={edgeTypes}
        onConnectEnd={onConnectEnd}
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={setRfInstance}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}
        snapToGrid
        minZoom={0.1}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Lines} />
        <MiniMap />
        {showPanel && (
          <Panel position="top-right">
            <ButtonGroup>
              <Button onClick={onAdd} startIcon={<CgAdd />}>
                Add node
              </Button>
              <Button varient="success" onClick={onSave} startIcon={<BiSave />}>
                Save
              </Button>
            </ButtonGroup>
          </Panel>
        )}
      </ReactFlow>
      {openSidebar ? (
        <SidebarForm
          closeSidebar={() => {
            setOpenSidebar(false);
          }}
          selectedNode={selectedNode}
        />
      ) : (
        <div>
          <Button
            className="absolute -top-10 right-0"
            onClick={() => {
              setOpenSidebar((prev) => !prev);
            }}
          >
            Open Sidebar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Flow;
