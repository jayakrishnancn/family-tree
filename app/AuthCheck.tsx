"use client";
import { FC, PropsWithChildren } from "react";
import Login from "./login/page";
import useAuth from "./firebase/useAuth";
import { auth } from "./firebase/config";
import { toast } from "react-toastify";
import { toastConfigs } from "./[id]/[projectName]/page";
import Spinner from "./components/Spinner/Spinner";
import Link from "next/link";
import ButtonGroup from "./components/ButtonGroup";
import { BiLogOut } from "react-icons/bi";
import Button from "./components/Button";

interface AuthCheckProps {}

const AuthCheck: FC<PropsWithChildren<AuthCheckProps>> = (props) => {
  const { user, loading } = useAuth();
  const showLogin = !user?.uid;
  const handleLogout = (): void => {
    auth
      .signOut()
      .then((res) => {
        console.log("User signed out", res);
        toast.success("Signed out", toastConfigs);
      })
      .catch((error) => {
        // An error happened.
        console.error("Error signing out: ", error);

        toast.error("Error signing out:" + (error?.message ?? "unknown error"));
      });
  };

  return loading ? (
    <div className="w-screen h-screen flex justify-center items-center">
      <Spinner />
    </div>
  ) : showLogin ? (
    <Login />
  ) : (
    <div className="mx-auto p-4">
      <div className="flex justify-end p-4">
        <ButtonGroup>
          <Link href="/" className="primary-button">
            Home
          </Link>
          <div className="primary-button no-button">{user.email}</div>
          <Button startIcon={<BiLogOut />} onClick={handleLogout}>
            Logout
          </Button>
        </ButtonGroup>
      </div>
      {props.children}
    </div>
  );
};

export default AuthCheck;
