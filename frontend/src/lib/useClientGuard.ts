"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useClientGuard() {
  const r = useRouter();
  useEffect(()=>{
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) r.replace("/login");
  },[r]);
}
