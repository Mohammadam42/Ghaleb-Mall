import { useEffect, useState } from "react";

import { api, assetUrl } from "../api/client";
import type { LogoState } from "../types";

export function Logo({ compact = false }: { compact?: boolean }) {
  const [logo, setLogo] = useState<LogoState | null>(null);

  useEffect(() => {
    api.getLogo().then(setLogo).catch(() => setLogo({ confirmed_logo_url: "/ghaleb-logo-transparent.png", fallback_text: "غالب مول | Ghaleb Mall" }));
  }, []);

  if (logo?.confirmed_logo_url) {
    return <img src={assetUrl(logo.confirmed_logo_url)} alt="Ghaleb Mall" className={compact ? "h-14 w-auto object-contain" : "h-20 w-auto object-contain"} />;
  }

  return <span className={compact ? "font-black text-ink" : "text-xl font-black text-ink"}>{logo?.fallback_text || "غالب مول | Ghaleb Mall"}</span>;
}
