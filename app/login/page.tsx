"use client";
import { auth, provider } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../components/Button";

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    signInWithPopup(auth, provider)
      .then((res) => {
        console.log("User signed in", res);
        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing in: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div>
        <Button disabled={loading} className="text-lg" onClick={handleLogin}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
