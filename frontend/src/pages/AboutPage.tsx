export function AboutPage() {
  return (
    <main className="container-page py-12">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="font-bold text-mallOrange">من نحن</p>
          <h1 className="mt-2 text-4xl font-black">غالب مول للألبسة في عمان</h1>
          <p className="mt-5 text-lg leading-9 text-ink/65">غالب مول متجر ألبسة عائلي في عمان، يقدم خيارات للرجال والنساء والأطفال، إضافة إلى فساتين السهرة والأحذية والإكسسوارات. هذا الموقع جاهز لعرض المنتجات، تثبيت الطلبات، وإدارة المحتوى من لوحة تحكم سهلة.</p>
        </div>
        <img src="/ghaleb-logo-transparent.png" alt="Ghaleb Mall" className="mx-auto max-h-96 object-contain p-8" />
      </section>
    </main>
  );
}
