import Link from "next/link";
import { BiSolidGroup } from "react-icons/bi";
import Button from "./components/Button";
import ButtonGroup from "./components/ButtonGroup";
import { IoMdAdd } from "react-icons/io";

const projects = [
  {
    name: "Leslie Alexander",
    id: "leslie.alexander@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastUpdatedBy: "Jayakrishnan",
    lastUpdatedDatedTs: Date.now(),
    sharedWith: ["abc", "def"],
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto border rounded p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 ">
          Projects
        </h1>
        <Button startIcon={<IoMdAdd />}>Create</Button>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {projects.map((person) => (
          <li
            key={person.id}
            className="flex justify-between gap-x-6 py-5 flex-col sm:flex-row"
          >
            <div className="flex min-w-0 gap-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img
                alt=""
                src={person.imageUrl}
                className="h-12 w-12 flex-none rounded-full bg-gray-50"
              />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {person.name}
                </p>
                <p className="text-xs leading-5 text-gray-500">
                  <BiSolidGroup fontSize={18} />
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col sm:items-end">
              <ButtonGroup>
                <Button disabled>Share</Button>
                <Button disabled>Delete</Button>
                <Link href={person.id} className="primary-button">
                  View
                </Link>
              </ButtonGroup>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Last updated by {person.lastUpdatedBy}
                <br />
                on {new Date(person.lastUpdatedDatedTs).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
