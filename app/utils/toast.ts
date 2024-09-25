import { Bounce, ToastOptions } from "react-toastify";

export const toastConfigs = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Bounce,
} as ToastOptions;
