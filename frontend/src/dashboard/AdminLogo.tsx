import { FormEvent, useEffect, useState } from "react";

import { api, assetUrl } from "../api/client";
import type { LogoState } from "../types";

export function AdminLogo() {
  const [logo, setLogo] = useState<LogoState | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const load = () => api.logoPreview().then(setLogo);
  useEffect(() => {
    void load();
  }, []);
  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const next = await api.uploadLogo(form);
    setLogo(next);
    setMessage("تم رفع الشعار للمعاينة. اضغط تأكيد لاستخدامه في الموقع.");
  };
  const confirm = async () => {
    const next = await api.confirmLogo();
    setLogo(next);
    setMessage("تم تأكيد الشعار واستخدامه في الموقع.");
  };
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <form className="admin-card h-fit" onSubmit={upload}>
        <h1 className="mb-2 text-3xl font-black">إدارة الشعار</h1>
        <p className="mb-5 text-ink/60">ارفع الشعار الحقيقي، راجعه في المعاينة، ثم أكد استخدامه في النافبار والفوتر والبيانات.</p>
        <input className="input" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button className="btn-primary mt-4">رفع للمعاينة</button>
        {message && <p className="mt-4 rounded-md bg-soft p-3 font-bold text-ink/70">{message}</p>}
      </form>
      <div className="admin-card">
        <h2 className="mb-4 text-2xl font-black">المعاينة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-soft p-5 text-center">
            <p className="mb-3 font-bold text-ink/50">الشعار المؤكد</p>
            <img src={assetUrl(logo?.confirmed_logo_url)} alt="Confirmed logo" className="mx-auto max-h-44 object-contain" />
          </div>
          <div className="rounded-lg bg-soft p-5 text-center">
            <p className="mb-3 font-bold text-ink/50">شعار قيد المعاينة</p>
            {logo?.pending_logo_url ? <img src={assetUrl(logo.pending_logo_url)} alt="Pending logo" className="mx-auto max-h-44 object-contain" /> : <p className="py-16 text-ink/40">لا يوجد شعار بانتظار التأكيد</p>}
          </div>
        </div>
        <button className="btn-primary mt-5" disabled={!logo?.pending_logo_url} onClick={confirm}>تأكيد استخدام الشعار</button>
      </div>
    </section>
  );
}
