"use client";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export function ToastProvider() {
    return (<ToastContainer position="top-right" autoClose={4000} transition={Slide} newestOnTop closeOnClick pauseOnFocusLoss={false} theme="light" toastClassName="!rounded-xl !font-sans !text-sm !shadow-lg !border !border-line"/>);
}
