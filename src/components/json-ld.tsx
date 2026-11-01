"use client";

import { useEffect } from "react";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.setAttribute("data-json-ld", "true");
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [data]);

  return null;
}
