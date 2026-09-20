import { ArrowRight, Gift, Percent, Sparkles } from "lucide-react";

const offers = [
  {
    icon: Gift,
    title: "Flat ₹50 OFF",
    description: "On your first food order",
    code: "FIRST50",
  },
  {
    icon: Percent,
    title: "20% OFF",
    description: "On stationery essentials",
    code: "STUDY20",
  },
  {
    icon: Sparkles,
    title: "Free Delivery",
    description: "On orders above ₹199",
    code: "FREEDEL",
  },
];

function Offers() {
  return (
    <section className="bg-white py-14 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-1 text-sm font-bold uppercase tracking-wide text-red-500">
            Don't miss out
          </p>

          <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
            Exclusive campus offers
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Save more on your favorite campus essentials.
          </p>
        </div>

        {/* Offers */}
        <div className="grid gap-5 md:grid-cols-3">
          {offers.map((offer) => {
            const Icon = offer.icon;

            return (
              <div
                key={offer.code}
                className="group relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-red-500/10 dark:from-red-950/30 dark:to-orange-950/20"
              >
                {/* Decorative circle */}
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-red-200/40 transition duration-500 group-hover:scale-125 dark:bg-red-500/10" />

                {/* Icon */}
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm dark:bg-gray-900">
                  <Icon size={23} />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {offer.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {offer.description}
                  </p>

                  {/* Code */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="rounded-lg border border-dashed border-red-300 bg-white/70 px-3 py-2 dark:border-red-500/30 dark:bg-gray-900/60">
                      <span className="text-xs font-bold tracking-wider text-red-500">
                        {offer.code}
                      </span>
                    </div>

                    <button className="flex items-center gap-1 text-sm font-bold text-red-500 transition group-hover:gap-2">
                      Order
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Offers;