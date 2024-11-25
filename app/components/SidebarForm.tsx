import { ChangeEvent, ChangeEventHandler, useCallback, useRef } from "react";
import Button from "./Button";
import { BiTrash } from "react-icons/bi";
import { getNextItem, SexEnum } from "./reactflow/CustomNode";
import { Node, useReactFlow } from "@xyflow/react";
import useAuth from "../firebase/useAuth";
import { useSpinnerContext } from "../context/SpinnerContext";
import { uploadImageWithTransaction } from "../utils/upload";
import ButtonGroup from "./ButtonGroup";
import { MdUploadFile } from "react-icons/md";

type FieldType = {
  value: string;
  name: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: "number" | "text";
};

function Field({ value, label, name, onChange, type }: FieldType) {
  return (
    <div className="w-full max-w-sm min-w-[200px]">
      <input
        className="w-full bg-transparent placeholder:text-slate-900 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder={label}
        value={value ?? ""}
        onChange={onChange}
        name={name}
        type={type ?? "text"}
      />
    </div>
  );
}

type SidebarFormProps = {
  selectedNode: Node | null;
};

const SidebarForm = ({ selectedNode }: SidebarFormProps) => {
  const { updateNodeData } = useReactFlow();

  const id = selectedNode?.id + "";
  const data = selectedNode?.data as any;

  const { user } = useAuth();
  const { setLoading } = useSpinnerContext();
  const getImageFromSex = (sex: SexEnum | null) => {
    if (sex === SexEnum.F) {
      return "/f.svg";
    }
    if (sex === SexEnum.M) {
      return "/m.svg";
    }
    return "/u.svg";
  };

  const onChangeImg = useCallback(() => {
    if (data?.imageUrl) {
      return;
    }
    const sex = getNextItem(data?.sex ?? SexEnum.Unknown);
    updateNodeData(id, { sex });
  }, [data?.imageUrl, data?.sex, id, updateNodeData]);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    // onUpdate({ data: { ...data, imageUrl: null }, id });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    updateNodeData(id, { [name]: value });
  };

  return (
    <div
      className="flex gap-2 flex-col w-full p-2 max-w-50 border-l-2 border-black"
      style={{ maxWidth: 250 }}
    >
      <div className="text-md font-bold">Details</div>
      {!data ? (
        <div>no nodes selected</div>
      ) : (
        <>
          <Field
            value={data.label}
            label="Name"
            name="label"
            onChange={handleChange}
          />
          <Field
            value={data.nickname}
            label="Nickname"
            name="nickname"
            onChange={handleChange}
          />
          <Field
            value={data.house_name}
            label="House name"
            name="house_name"
            onChange={handleChange}
          />
          <Field
            value={data.age}
            label="Age"
            name="age"
            onChange={handleChange}
            type="number"
          />
          <select
            value={data.sex ?? 2}
            name="sex"
            onChange={handleChange}
            className="w-full border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded "
          >
            <option value={0}>Male</option>
            <option value={1}>Female</option>
            <option value={2}>Unknown</option>
          </select>
          <div className="flex justify-between p-2">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img
                src={data.imageUrl ?? getImageFromSex(data?.sex)}
                alt="pic"
                width={50}
                height={50}
                className="pic"
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
            <div>
              <ButtonGroup>
                <Button
                  className="text-xs min-w-0 p-1 "
                  varient="primary"
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                  startIcon={<MdUploadFile />}
                >
                  Upload
                </Button>

                <Button
                  className="text-xs min-w-0 p-1"
                  varient="danger"
                  onClick={removeImage}
                  startIcon={<BiTrash />}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <pre className="bg-white border p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default SidebarForm;
