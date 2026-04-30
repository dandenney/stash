import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-white font-inter inter-features text-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 sm:px-10">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">Stash</span>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-950 underline underline-offset-4 transition-colors hover:text-orange-500 focus-visible:text-orange-500 focus-visible:outline-none"
        >
          Open dashboard →
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-8 pb-16 sm:px-10 sm:pt-10">
        <div className="border-b border-zinc-100 pb-20">
          <h1 className="max-w-[18ch] text-6xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-7xl lg:text-[5.5rem]">
            Save now.<br />
            Triage later.<br />
            <em className="not-italic text-orange-400">Actually</em> read it.
          </h1>
          <div className="mt-14 grid items-start gap-8 sm:grid-cols-[1fr_auto]">
            <p className="max-w-[44ch] text-xl/9 text-pretty text-zinc-500">
              Stash is your personal link library with a daily triage workflow. No algorithms. No noise. Just you and your links.
            </p>
            <Link
              href="/dashboard"
              className="shrink-0 whitespace-nowrap border-b-2 border-zinc-950 pb-0.5 text-base font-medium text-zinc-950 transition-colors hover:border-orange-400 hover:text-orange-500 focus-visible:border-orange-400 focus-visible:text-orange-500 focus-visible:outline-none"
            >
              Open dashboard →
            </Link>
          </div>
        </div>

        <div className="grid gap-x-8 sm:grid-cols-3">
          {[
            {
              num: "01",
              title: "Save from anywhere",
              body: "Chrome extension, Discord bot, or direct API — every link lands in The Score with AI-generated tags.",
            },
            {
              num: "02",
              title: "Triage The Score",
              body: "Your daily queue, oldest-first. A deliberate habit: keep what matters, discard the rest, no backlog guilt.",
            },
            {
              num: "03",
              title: "Share selectively",
              body: "Toggle any stashed link public. It joins your chronological monthly feed — a reading list you can share with anyone.",
            },
          ].map(({ num, title, body }) => (
            <div key={num} className="border-t-2 border-zinc-950 py-10">
              <p className="mb-4 text-sm font-semibold text-orange-400">{num}</p>
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
              <p className="text-sm/6 text-pretty text-zinc-500">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
