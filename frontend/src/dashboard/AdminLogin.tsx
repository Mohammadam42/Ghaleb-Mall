import { LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { api, setToken } from "../api/client";
import { Logo } from "../components/Logo";

export function AdminLogin() {
  const [email, setEmail] = useState("admin@ghalebmall.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      navigate((location.state as { from?: string } | null)?.from || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-soft p-4" dir="rtl">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-8 shadow-glow">
        <div className="mb-8 text-center"><Logo /></div>
        <h1 className="mb-2 text-3xl font-black">تسجيل دخول الإدارة</h1>
        <p className="mb-6 text-ink/60">استخدم بيانات ADMIN_EMAIL و ADMIN_PASSWORD من ملف البيئة.</p>
        <form className="grid gap-4" onSubmit={submit}>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني" />
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" />
          {error && <p className="rounded-md bg-red-50 p-3 font-bold text-red-700">{error}</p>}
          <button className="btn-primary"><LockKeyhole size={18} /> دخول</button>
        </form>
      </section>
    </main>
  );
}

