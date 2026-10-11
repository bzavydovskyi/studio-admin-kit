// A small dot + label status pill (.admin-status) — tone is one of
// "success"|"warning"|"danger"|"accent"|"neutral", mapped to the theme's
// semantic color tokens. The actual status→tone mapping is each app's
// own business vocabulary, not this component's concern.
export default function StatusPill({ tone = "neutral", children }) {
  return <span className={`admin-status tone-${tone}`}>{children}</span>;
}
