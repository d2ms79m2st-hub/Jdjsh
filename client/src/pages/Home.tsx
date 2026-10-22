import { ArrowLeft, ArrowUpLeft, CheckCircle2, ExternalLink, Gem, Leaf, MessageCircle, Search, ShieldCheck, Sparkles, Store, WandSparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { BRAND, QUICK_PROMPTS, TRUST_POINTS, VERIFIED_COLLECTIONS } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";

const initialMessage = "يا هلا بك. أنا مساعد بدر، أساعدك تكتشف متجر بدر أبا الخيل بوضوح — وش تدور عليه اليوم؟";

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" aria-label="العودة إلى الرئيسية">
          <img src={BRAND.logo} alt="شعار بدر أبا الخيل" />
          <div><strong>مساعد بدر</strong><span>بدر أبا الخيل · عزنا بطيبنا</span></div>
        </Link>
        <nav className="main-nav" aria-label="التنقل الرئيسي">
          <Link href="/" aria-current="page">المساعد</Link>
          <Link href="/store">المتجر الرسمي</Link>
          <a href={`${BRAND.website}/offers`} target="_blank" rel="noreferrer">التخفيضات</a>
          <Link href="/admin">الإدارة</Link>
        </nav>
        <div className="header-actions">
          <a className="icon-button" href={BRAND.website} target="_blank" rel="noreferrer" aria-label="فتح المتجر الرسمي"><Store size={17} /></a>
          <Link className="outline-button" href="/store">اكتشف المتجر</Link>
        </div>
      </div>
    </header>
  );
}

function Assistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; content: string }>>([{ role: "assistant", content: initialMessage }]);
  const ask = trpc.assistant.ask.useMutation();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || ask.isPending) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setMessage("");
    ask.mutate({ message: trimmed, history: messages.slice(-8) }, {
      onSuccess: (result) => setMessages(current => [...current, { role: "assistant", content: result.reply }]),
      onError: () => setMessages(current => [...current, { role: "assistant", content: "صار عندي تعذر مؤقت في الرد. تقدر تفتح المتجر الرسمي مباشرة، أو تعيد إرسال سؤالك بعد لحظات." }]),
    });
  };

  return (
    <section className="assistant-card" aria-labelledby="assistant-title">
      <div className="assistant-intro">
        <span className="kicker">مساعدك في الاختيار</span>
        <h2 id="assistant-title">اسأل بدر،<br />وخلّ الاختيار أهدى.</h2>
        <p>محادثة عربية مختصرة تساعدك توصل للقسم المناسب، وتقول لك بوضوح متى تحتاج تراجع تفاصيل المنتج من المتجر الرسمي.</p>
        <span className="assistant-status">يعمل على معلومات موثقة ومتاحة</span>
      </div>
      <div className="chat-window">
        <div className="chat-feed" aria-live="polite">
          {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`chat-bubble ${item.role}`}>{item.content}</div>)}
          {ask.isPending && <div className="chat-bubble assistant">أراجع سؤالك بهدوء…</div>}
        </div>
        <div className="quick-prompts" aria-label="اقتراحات سريعة">
          {QUICK_PROMPTS.map(prompt => <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>)}
        </div>
        <form className="chat-form" onSubmit={submit}>
          <input value={message} onChange={event => setMessage(event.target.value)} placeholder="مثال: أبي هدية بميزانية ٢٠٠ ريال" aria-label="اكتب سؤالك" />
          <button type="submit" disabled={ask.isPending || !message.trim()} aria-label="إرسال السؤال"><ArrowUpLeft size={18} /></button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><div><strong>مساعد بدر</strong><div>واجهة ذكية لعلامة بدر أبا الخيل · {BRAND.tagline}</div></div><div className="footer-links"><a href={BRAND.website} target="_blank" rel="noreferrer">المتجر الرسمي</a><a href={`${BRAND.website}/offers`} target="_blank" rel="noreferrer">التخفيضات</a><Link href="/admin">منطقة الإدارة</Link></div></div></footer>;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const searchHref = useMemo(() => `/store${search.trim() ? `?query=${encodeURIComponent(search.trim())}` : ""}`, [search]);
  return <div className="app-shell">
    <Header />
    <main>
      <section className="hero"><div className="container hero-grid">
        <div className="hero-copy">
          <span className="kicker">منصة اكتشاف بدر</span>
          <h1>طيبٌ تعرفه.<br /><em>واختيارٌ أذكى.</em></h1>
          <p className="hero-lead">مساعد بدر يقرّب لك عالم العود والعطور من بدر أبا الخيل. اسأل، استكشف، ثم انتقل للمتجر الرسمي بأقل عدد من الخطوات.</p>
          <div className="hero-cta"><a className="primary-button" href="#assistant"><MessageCircle size={17} /> اسأل مساعد بدر</a><a className="outline-button" href={BRAND.website} target="_blank" rel="noreferrer">زيارة المتجر الرسمي <ExternalLink size={15} /></a></div>
          <div className="hero-note"><ShieldCheck size={14} /> المعلومات المعروضة مرتبطة بالمصدر الرسمي أو موضحة بأنها تحتاج ربطًا</div>
        </div>
        <div className="hero-visual"><img src={BRAND.heroImage} alt="صورة أصلية من متجر بدر أبا الخيل" /><div className="visual-caption"><div><strong>{BRAND.shortName}</strong><span>{BRAND.tagline}</span></div><div className="seal">ب</div></div></div>
      </div></section>

      <div id="assistant" className="container"><Assistant /></div>

      <section className="section"><div className="container">
        <div className="section-heading"><div><span className="kicker">ابدأ من المكان الصحيح</span><h2>مسارات بدر الرسمية</h2></div><p>هذه هي الأقسام التي تم التحقق من وجودها في متجر بدر أبا الخيل. افتح القسم وأكمل تفاصيل المنتجات من المصدر نفسه.</p></div>
        <div className="collection-grid">{VERIFIED_COLLECTIONS.map(item => <a key={item.id} className="collection-card" href={item.href} target="_blank" rel="noreferrer"><div><div className="collection-icon">{item.icon === "oud" ? <Leaf size={20} /> : item.icon === "perfume" ? <Gem size={20} /> : <Sparkles size={20} />}</div><h3>{item.title}</h3><p>{item.description}</p></div><div className="card-footer"><small>{item.eyebrow}</small><span className="card-arrow"><ArrowLeft size={18} /></span></div></a>)}</div>
        <div className="trust-strip">{TRUST_POINTS.map(point => <div className="trust-item" key={point.label}><div className="trust-icon"><CheckCircle2 size={17} /></div><div><strong>{point.label}</strong><span>{point.detail}</span></div></div>)}</div>
      </div></section>

      <section className="section"><div className="container"><div className="info-band"><div><strong>تدور على منتج محدد؟</strong><p>ابحث في المسارات الموصولة، أو اكتب سؤالك لمساعد بدر وسأوجّهك للقسم الأنسب.</p></div><div className="store-tools" style={{ margin: 0 }}><Search size={17} color="#9c7f48" style={{ alignSelf: "center", marginInlineEnd: -35, zIndex: 1 }} /><input className="search-field" value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث عن عود أو عطر…" aria-label="البحث عن منتج" /><Link className="primary-button" href={searchHref}>بحث</Link></div></div></div></section>
    </main>
    <Footer />
  </div>;
}
