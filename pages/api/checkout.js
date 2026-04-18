const Stripe = require("stripe");

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
