import { apiFetch, getApiUrl, type SesiPengguna } from "./api";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Kontrak: POST /api/auth/google -> { success, data: { user, token } },
// sama seperti /api/auth/login.
export async function loginDenganGoogle(idToken: string): Promise<SesiPengguna> {
  const { data } = await apiFetch(`${await getApiUrl()}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  return { ...data.data.user, token: data.data.token } as SesiPengguna;
}
