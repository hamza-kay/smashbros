"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientSecret = searchParams.get("clientSecret");
  const amount = searchParams.get("amount");

  // Stripe PaymentElement theme with your brand variables
  const appearance = {
    theme: "stripe",
    variables: {
      fontFamily: "Inter, sans-serif",
      borderRadius: "6px",
      // brand colors
      colorPrimary: "var(--color-accent)",         // primary action / highlights
      colorPrimaryText: "#ffffff",
      colorText: "#111111",
      colorTextSecondary: "var(--color-muted)",
      colorDanger: "#dc2626",
      colorBackground: "#ffffff",                  // keep PE light even if site is dark
      focusOutline: "var(--color-accent)",
    },
    // PayPal only exposes a few branded colors; pick the closest to your blue
    rules: {
      ".PaymentElement--paypal": {
        "--paypal-button-color": "blue",
        "--paypal-button-border-radius": "6px",
        "--paypal-button-height": "40px",
      },
      
    },
  };

  if (!clientSecret) {
    return <p className="p-4 text-[var(--color-accent)]">No payment found.</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm amount={amount} router={router} />
    </Elements>
  );
}

function CheckoutForm({ amount, router }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (paymentIntent?.status === "succeeded") {
      router.push("/complete");
    } else if (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 !border-0 shadow-none rounded">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-center
                              text-[var(--color-accent)]">
          Stripe Secure Checkout
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />

          <Button
            type="submit"
            variant="outline"
            className="!w-full
                       !bg-[var(--color-accent)]
                       !text-white
                       !border-[var(--color-accent)]
                       hover:!bg-[var(--color-secondary)]
                       focus-visible:ring-2
                       focus-visible:ring-[var(--color-accent)]
                       focus-visible:ring-offset-2
                       focus-visible:ring-offset-white"
          >
            Pay £{(amount / 100).toFixed(2)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
