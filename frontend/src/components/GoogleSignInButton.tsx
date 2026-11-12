"use client";

import { useEffect, useRef, useState } from "react";

import { simpanSesi } from "@/lib/api";
import { GOOGLE_CLIENT_ID, loginDenganGoogle } from "@/lib/google";

// Deklarasi minimal GIS; bentuk asli lebih luas, any lokal pada objek google
// cukup karena kita hanya menyentuh initialize/renderButton.
type GoogleCredentialResponse = { credential?: string };
interface GoogleGlobal {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }): void;
      renderButton(el: HTMLElement, options: Record<string, string>): void;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleGlobal;
    __kawalGsiLoading?: boolean;
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

export default function GoogleSignInButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId || !containerRef.current || initializedRef.current) return;

    const callback = (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      loginDenganGoogle(response.credential)
        .then((sesi) => {
          simpanSesi(sesi);
          window.location.href = redirectTo;
        })
        .catch((err: unknown) =>
          setError(err instanceof Error ? err.message : "Gagal masuk dengan Google.")
        );
    };

    const render = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
      });
      initializedRef.current = true;
    };

    if (window.google) {
      render();
      return;
    }
    if (initializedRef.current || window.__kawalGsiLoading) {
      // Script sedang dimuat render lain; tunggu lalu render di elemen ini.
      const t = setInterval(() => {
        if (window.google) {
          clearInterval(t);
          render();
        }
      }, 100);
      return () => clearInterval(t);
    }
    window.__kawalGsiLoading = true;
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => {
      window.__kawalGsiLoading = false;
      render();
    };
    script.onerror = () => {
      window.__kawalGsiLoading = false;
      setError("Gagal memuat Google Identity Services.");
    };
    document.head.appendChild(script);
  }, [redirectTo]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" disabled className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-500">
        Login Google belum dikonfigurasi
      </button>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {error && (
        <p className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
