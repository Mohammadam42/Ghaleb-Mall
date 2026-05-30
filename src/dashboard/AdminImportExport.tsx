import { FileSpreadsheet } from "lucide-react";
import { FormEvent, useState } from "react";

import { api, downloadAdminFile } from "../api/client";

interface ImportResult {
  ok: boolean;
  created: number;
  updated: number;
  rows: Record<string, unknown>[];
  errors: string[];
}

export function AdminImportExport() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const runImport = async (commit: boolean) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("commit", String(commit));
    const data = await api.importProducts(form);
    setResult(data as ImportResult);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await runImport(false);
  };

  return (
    <section>
      <h1 className="mb-2 text-3xl font-black">استيراد وتصدير CSV</h1>
      <p className="mb-6 text-ink/60">نسخة العرض تعمل بدون Backend، لذلك تستخدم ملفات CSV التي تفتح مباشرة داخل Excel.</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <form className="admin-card grid gap-3" onSubmit={submit}>
          <h2 className="text-xl font-black">استيراد المنتجات</h2>
          <input className="input" type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary"><FileSpreadsheet size={18} /> معاينة قبل الحفظ</button>
            <button className="btn-primary" type="button" onClick={() => runImport(true)}>استيراد وحفظ</button>
          </div>
        </form>
        <div className="admin-card">
          <h2 className="mb-3 text-xl font-black">ملفات جاهزة</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={() => downloadAdminFile("/template", "ghaleb-mall-products-template.csv")}>تحميل قالب CSV</button>
            <button className="btn-secondary" onClick={() => downloadAdminFile("/products", "ghaleb-mall-products.csv")}>تصدير المنتجات</button>
            <button className="btn-secondary" onClick={() => downloadAdminFile("/orders", "ghaleb-mall-orders.csv")}>تصدير الطلبات</button>
          </div>
        </div>
      </div>
      {result && (
        <div className="admin-card mt-6 overflow-auto">
          <h2 className="mb-3 text-xl font-black">نتيجة المعاينة</h2>
          {result.errors.length > 0 && <div className="mb-4 rounded-md bg-red-50 p-3 font-bold text-red-700">{result.errors.join("، ")}</div>}
          <p className="mb-3 text-ink/60">Created: {result.created} | Updated: {result.updated} | Rows preview: {result.rows.length}</p>
          <pre className="max-h-80 overflow-auto rounded-md bg-ink p-4 text-left text-xs text-white" dir="ltr">{JSON.stringify(result.rows.slice(0, 10), null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
