const SERVICES = [
  { name: "Consultation / Check-up", price: 300, duration: "30 min" },
  { name: "Teeth Cleaning", price: 1500, duration: "45 min" },
  { name: "Teeth Whitening", price: 8000, duration: "60 min" },
  { name: "Tooth Filling", price: 1200, duration: "45 min" },
  { name: "Tooth Extraction", price: 1500, duration: "45 min" },
  { name: "Dental Crown / Cap", price: 5000, duration: "60 min" },
  { name: "Root Canal", price: 6000, duration: "4 sessions", note: "Total treatment price" },
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function ServicesPanel() {
  return (
    <div className="bg-card rounded-[10px] border border-border shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
          Services &amp; Pricing
        </h2>
      </div>
      <div className="divide-y divide-border">
        {SERVICES.map((service) => (
          <div key={service.name} className="flex items-start justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <p className="text-sm text-foreground/85 leading-snug">{service.name}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {service.duration}
                {service.note ? ` · ${service.note}` : ""}
              </p>
            </div>
            <span className="font-serif text-base text-foreground shrink-0 tabular-nums">
              {formatPrice(service.price)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
