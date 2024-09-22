"use client";
import { createContext, useContext, useState } from "react";
import Spinner from "../components/Spinner/Spinner";

const defaultContextValues = {
  loading: false,
  setLoading: (_: boolean) => {},
};
const SpinnerContext = createContext(defaultContextValues);

export const SpinnerProvider = ({ children }: any) => {
  const [loading, setLoading] = useState(false);
  return (
    <SpinnerContext.Provider
      value={{
        loading,
        setLoading,
      }}
    >
      {children}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <Spinner />
        </div>
      )}
    </SpinnerContext.Provider>
  );
};

export const useSpinnerContext = () => useContext(SpinnerContext);
