"use client";

import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
  path?: string;
};

const SITE_NAME = "Base Impact";
const SITE_URL = "https://baseimpact.org";
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

export function PageMeta({ title, description, path = "/" }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;

    const setMeta = (attr: "name" | "property", name: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", `${title} | ${SITE_NAME}`);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", `${SITE_URL}${path}`);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:image", DEFAULT_IMAGE);
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", `${title} | ${SITE_NAME}`);
    setMeta("name", "twitter:description", description);
  }, [title, description, path]);

  return null;
}
