const features = [
  {
    title: "Send a package",
    description:
      "Create a delivery and connect with a verified mobility partner.",
  },
  {
    title: "Earn from your trip",
    description:
      "Already going somewhere? Carry compatible packages and earn from your route.",
  },
  {
    title: "Track every movement",
    description:
      "Follow your delivery from pickup through confirmed drop-off.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mobility-X</h1>
          <p className="text-xs text-slate-500">Move. Deliver. Earn.</p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-full px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Log in
          </button>

          <button className="rounded-full bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Get started
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Movement-powered delivery
          </p>

          <h2 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Your movement can
            <span className="block">create value.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Mobility-X connects people who need things moved with verified
            riders, drivers, travelers, and mobility partners already moving
            toward compatible destinations.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
  href="/send"
  className="rounded-xl bg-slate-950 px-7 py-4 font-semibold text-white hover:bg-slate-800"
>
  Send a package
</a>
  <a
  href="/earn"
  className="rounded-xl border border-slate-300 px-7 py-4 font-semibold text-slate-900 hover:bg-slate-50"
>
  Earn from your trip
</a>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-px px-6 py-6 sm:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="p-6">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            The Mobility-X idea
          </p>

          <h3 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Who can deliver this package?
            <span className="block text-slate-400">
              Better question: who is already going there?
            </span>
          </h3>

          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Turn existing movement and available vehicle capacity into useful
            delivery capacity.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">Mobility-X</p>
          <p className="text-sm text-slate-500">
            Move. Deliver. Earn.
          </p>
        </div>
      </footer>
    </main>
  );
}
