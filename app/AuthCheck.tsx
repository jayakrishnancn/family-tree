"use client";
import { FC, PropsWithChildren } from "react";
import Login from "./login/page";
import useAuth from "./firebase/useAuth";
import { auth } from "./firebase/config";
import { toast } from "react-toastify";
import { toastConfigs } from "./[id]/page";
import Spinner from "./components/Spinner/Spinner";

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
    <div>
      <button className="button-74 text-small" onClick={handleLogout}>
        Logout - {user?.displayName ?? "Unknown"}
      </button>
      {props.children}
    </div>
  );
};

export default AuthCheck;
