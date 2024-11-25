import { useSpinnerContext } from "@/app/context/SpinnerContext";
import useAuth from "@/app/firebase/useAuth";
import { uploadImageWithTransaction } from "@/app/utils/upload";
import {
  Handle,
  Node,
  Position,
  useConnection,
  useReactFlow,
} from "@xyflow/react";
import { ChangeEvent, useCallback, useRef } from "react";
import ButtonGroup from "../ButtonGroup";
import Button from "../Button";
import { MdUploadFile } from "react-icons/md";
import { BiTrash } from "react-icons/bi";

export enum SexEnum {
  M,
  F,
  Unknown,
}

export const IMGS = [SexEnum.F, SexEnum.M, SexEnum.Unknown];

export function getNextItem(currentItem: SexEnum): SexEnum {
  const currentIndex = IMGS.indexOf(currentItem);
  if (currentIndex === -1) {
    throw new Error("Item not found in the array");
  }
  const nextIndex = (currentIndex + 1) % IMGS.length;
  return IMGS[nextIndex] ?? SexEnum.Unknown;
}
export default function CustomNode(params: any) {
  const { id, data } = params;
  const connection = useConnection();
  const { updateNodeData } = useReactFlow();
  const { setLoading } = useSpinnerContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { user } = useAuth();
  const onChange = useCallback(
    (evt: any) => {
      updateNodeData(id, { label: evt.target.value });
    },
    [id, updateNodeData]
  );
  const onChangeImg = useCallback(() => {
    if (data?.imageUrl) {
      return;
    }
    const sex = getNextItem(data?.sex ?? SexEnum.Unknown);
    updateNodeData(id, { sex });
  }, [data?.imageUrl, data?.sex, id, updateNodeData]);

  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, data: Node) => {
    const selectedFile = e.target.files?.[0];

    const userId = user?.uid;
    if (!selectedFile || !data || !userId) {
      return;
    }

    setLoading(true);
    uploadImageWithTransaction(selectedFile)
      .then((imageUrl) => {
        updateNodeData(id, { imageUrl });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const removeImage = () => {
    updateNodeData(id, { imageUrl: null });
  };

  const getImageFromSex = (sex: SexEnum | null) => {
    if (sex === SexEnum.F) {
      return "/f.svg";
    }
    if (sex === SexEnum.M) {
      return "/m.svg";
    }
    return "/u.svg";
  };
  const isLate = !!data.late;

  return (
    <div className="group customNode">
      <div
        className="customNodeBody"
        style={{
          borderStyle: isTarget ? "dashed" : "solid",
          backgroundColor: isTarget
            ? "#ffcce3"
            : isLate
            ? "#ffa099"
            : "#fbeee0",
        }}
      >
        {data.birth_order && data.birth_order > 0 && (
          <div className="bg-blue-500 absolute p-1 rounded-tl-lg rounded-br-lg text-white">
            {data.birth_order ?? "0"}
          </div>
        )}
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
        <div className=" flex flex-col gap-1 items-center card-content">
          <ButtonGroup className="invisible group-hover:visible flex-row absolute top-8 -right-8 rotate-90 ">
            <Button
              className="text-xs min-w-0 p-1 "
              varient="primary"
              onClick={() => {
                inputRef.current?.click();
              }}
              startIcon={<MdUploadFile className="-rotate-90" />}
            />

            <Button
              className="textt-xs min-w-0 p-1"
              varient="danger"
              onClick={removeImage}
              startIcon={<BiTrash className="-rotate-90" />}
            />
          </ButtonGroup>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img
              src={data.imageUrl ?? getImageFromSex(data?.sex)}
              alt="pic"
              width={30}
              height={30}
              className="pic w-7 h-7"
              onClick={onChangeImg}
            />
            <input
              className="hidden"
              type="file"
              ref={inputRef}
              id={`image-${id}`}
              onChange={(e) => handleFileUpload(e, data)}
            />
          </div>
          <input
            id="text"
            name="text"
            value={data?.label ?? ""}
            placeholder="Name"
            autoComplete="off"
            disabled
            onChange={onChange}
            className="nodrag"
          />
        </div>
      </div>
    </div>
  );
}
