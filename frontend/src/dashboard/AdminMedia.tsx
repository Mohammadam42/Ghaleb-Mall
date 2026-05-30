import { FormEvent, useEffect, useState } from "react";

import { api, assetUrl } from "../api/client";

interface MediaFile {
  id: number;
  original_name: string;
  url: string;
  content_type: string;
  size: number;
}

export function AdminMedia() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const load = () => api.media().then((data) => setMedia(data as MediaFile[]));
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await api.uploadMedia(form);
    setFile(null);
    load();
  };
  return (
    <section>
      <h1 className="mb-6 text-3xl font-black">مكتبة الوسائط</h1>
      <form className="admin-card mb-6 flex flex-wrap items-center gap-3" onSubmit={submit}>
        <input className="input max-w-md" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button className="btn-primary">رفع صورة</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {media.map((item) => (
          <article key={item.id} className="admin-card">
            <img src={assetUrl(item.url)} alt={item.original_name} className="mb-3 aspect-square w-full rounded-md object-cover" />
            <p className="truncate font-bold">{item.original_name}</p>
            <p className="mb-3 break-all text-xs text-ink/50">{item.url}</p>
            <button className="rounded-md bg-red-600 px-3 py-2 font-bold text-white" onClick={() => api.deleteMedia(item.id).then(load)}>حذف</button>
          </article>
        ))}
      </div>
    </section>
  );
}
