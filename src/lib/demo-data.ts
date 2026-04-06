export const DEMO_MODE = !process.env.DATABASE_URL;
export const DEMO_FUNNEL_STEPS = [
  { id: 1, title: "Welcome", type: "landing" },
  { id: 2, title: "Product Info", type: "content" },
  { id: 3, title: "Pricing", type: "pricing" },
  { id: 4, title: "Checkout", type: "payment" },
  { id: 5, title: "Thank You", type: "confirmation" },
];
