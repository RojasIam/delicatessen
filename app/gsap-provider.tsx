"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

function registerGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  registered = true;
}

/** Registra useGSAP y ScrollTrigger una sola vez en el cliente (Next.js App Router). */
export function GsapProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    registerGsapPlugins();
  }, []);
  return <>{children}</>;
}
