"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AppIdContext } from "@/components/AppIdProvider";
import { FormSchema } from "@/lib/formSchema";
import { v4 as uuidv4 } from "uuid";



export default function OrderSummary() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

const { appId } = useContext(AppIdContext);

  const cartItems = useCartStore((state) => state.cartItems);
  const totalPrice = useCartStore((state) => state.totalPrice("other"));
  const serviceFee = parseFloat((totalPrice * 0.05).toFixed(2));
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const removeDealFromCart = useCartStore((state) => state.removeDealFromCart);

  const customer = useCheckoutStore((state) => state.customer);
  const isValid = FormSchema.safeParse(customer).success;


  const handleCheckout = async () => {
    if (!customer.fulfillmentType) {
      console.error("Fulfillment type is missing");
      return;
    }

    const fulfillments = [
      {
        uid: "59083446-6deb-409f-b6f6-3f504114462b",
        type: customer.fulfillmentType?.toUpperCase(),
        state: "PROPOSED",
        location: "UK",
        ...(customer.fulfillmentType === "DELIVERY"
          ? {
              deliveryDetails: {
                appId,
                recipient: {
                  displayName: `${customer.firstName || ""} ${customer.lastName || ""}`,
                  email_address: customer.email || "",
                  phone_number: customer.phoneNumber || "",
                  address_line_1: customer.deliveryAddress || "",
                  postal_code: customer.postcode || "",
                  country: "GB",
                  locality: customer.city || "London",
                },
                scheduleType: "ASAP",
                pickupAt: new Date().toISOString(),
                note: customer.notes || "",
                pos: "other",
              },
            }
          : {
              pickupDetails: {
                appId,
                recipient: {
                  displayName: `${customer.firstName || ""} ${customer.lastName || ""}`,
                },
                scheduleType: "ASAP",
                pickupAt: new Date().toISOString(),
                note: customer.notes || "",
                address: customer.deliveryAddress || "",
                email: customer.email || "",
                number: customer.phoneNumber || "",
                pos: "other",
              },
            }),
      },
    ];

    const updatedCart = {
      cartItems,
      fulfillments,
    };

    try {
      const token = process.env.NEXT_PUBLIC_API_TOKEN;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(
        `${baseUrl}/eposnow/create-payment-intent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-App-Id": appId,
          },
          body: JSON.stringify(updatedCart),
        }
      );

      if (!response.ok) {
        console.error("Backend error:", response.status, response.statusText);
        return;
      }

      const data = await response.json();

      if (!data.clientSecret) {
        console.error("No clientSecret returned!");
        return;
      }

      router.push(`/checkout?clientSecret=${data.clientSecret}&amount=${data.amount}&currency=${data.currency}`);
    } catch (error) {
      console.error("Stripe error:", error);
    }
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-500">Loading your order...</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = {};
  cartItems.forEach((item) => {
    const groupKey = item.parentDealId || item.cartLineId;
    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(item);
  });



  return (
    <>
      <Card className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)]">
        <CardHeader>
          <CardTitle>Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cartItems.length > 0 ? (
            Object.entries(grouped).map(([groupKey, items]) => {
              const deal = items.find((i) => i.isDeal);
              const children = items.filter((i) => !i.isDeal);

              if (deal) {
                return (
                  <div key={groupKey} className="border-b border-gray-300 pb-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">{deal.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-accent font-semibold text-sm">
                          £{(deal.price * deal.quantity).toFixed(2)}
                        </p>
    <button
  onClick={() => removeDealFromCart(groupKey)}
  className="text-gray-400 hover:text-accent transition"
>
  <X className="w-4 h-4" />
</button>

                      </div>
                    </div>
                    <ul className="mt-2 space-y-1 ml-4 text-sm text-gray-700">
                      {children.map((child, index) => (
                        <li key={child.cartLineId}>
                          {child.name}
                          {child.variationName && ` - ${child.variationName}`}
                          {child.selectedSize && ` (${typeof child.selectedSize === 'string' ? child.selectedSize : `${child.selectedSize}"`})`}
                          {Array.isArray(child.selectedAddons) && child.selectedAddons.length > 0 && (
                            <> - {child.selectedAddons.join(", ")}</>
                          )}
                          {(Number(child?.price) || 0) * (Number(child?.quantity) || 1) > 0 && (
  <> - £{((Number(child?.price) || 0) * (Number(child?.quantity) || 1)).toFixed(2)}</>
)}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              } else {
                return items.map((item) => (
                  <div
                    key={item.cartLineId}
                    className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-none"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <ul className="mt-1 text-sm text-gray-700 space-y-1">
                        {item.selectedSize && <li>Size: {typeof item.selectedSize === 'string' ? item.selectedSize : `${item.selectedSize}"`}</li>}
                        {item.variationName && <li>Variation: {item.variationName}</li>}
                        {Array.isArray(item.selectedAddons) && item.selectedAddons.length > 0 && (
                          <li>Add-ons: {item.selectedAddons.join(", ")}</li>
                        )}
                      </ul>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className="w-7 h-7 border border-accent text-accent bg-white hover:bg-accent/10 rounded flex items-center justify-center transition-colors"
                          onClick={() => decreaseQuantity(item.cartLineId)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center text-gray-900 font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          className="w-7 h-7 border border-accent text-accent bg-white hover:bg-accent/10 rounded flex items-center justify-center transition-colors"
                          onClick={() => increaseQuantity(item.cartLineId)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <p className="text-accent font-semibold text-sm">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartLineId)}
                        className="text-gray-400 hover:text-accent transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ));
              }
            })
          ) : (
            <p className="text-gray-500">Your cart is empty.</p>
          )}

          <hr className="my-4" />

          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">£{totalPrice.toFixed(2)}</span>
          </div>

         <div className="flex justify-between">
  <span className="text-gray-600">Service Fee</span>
  <span className="font-medium">£{serviceFee.toFixed(2)}</span>
</div>


          {/* <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium italic text-gray-500">
              To be calculated
            </span>
          </div> */}

          <hr className="my-4" />

     <div className="flex justify-between text-lg font-bold">
  <span>Total</span>
  <span>£{(totalPrice + serviceFee).toFixed(2)}</span>
</div>


          <Button
            size="lg"
            className="w-full !bg-accent !text-white !hover:bg-secondary hidden lg:block"
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || !isValid}
          >
            Proceed to Payment
          </Button>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-card-bg)] border-t border-gray-200 shadow-md lg:hidden">
        <Button
          size="lg"
          className="w-full !bg-accent !text-white !hover:bg-secondary"
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || !isValid}
        >
          Proceed to Payment
        </Button>
      </div>
    </>
  );
}
