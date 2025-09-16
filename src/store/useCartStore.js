import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

const withLineId = (item) => ({
  cartLineId: item.cartLineId || uuidv4(),
  ...item,
});

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      

addToCart: (item) => {
  const sameLine = (a, b) =>
    a.id === b.id &&
    (a.parentDealId ?? null) === (b.parentDealId ?? null) &&
    (a.selectedVariation ?? null) === (b.selectedVariation ?? null) &&
    (a.selectedSize ?? null) === (b.selectedSize ?? null) &&
    JSON.stringify(a.selectedAddons || []) === JSON.stringify(b.selectedAddons || []) &&
    JSON.stringify(a.selectedModifiers || []) === JSON.stringify(b.selectedModifiers || []);

  const line = withLineId(item);
  const existing = get().cartItems.find((ci) => sameLine(ci, line));

  if (existing) {
    set({
      cartItems: get().cartItems.map((ci) =>
        sameLine(ci, line) ? { ...ci, quantity: ci.quantity + line.quantity } : ci
      ),
    });
  } else {
    set({ cartItems: [...get().cartItems, line] });
  }
},

removeFromCart: (cartLineId) => {
  set({ cartItems: get().cartItems.filter((ci) => ci.cartLineId !== cartLineId) });
},


      


removeDealFromCart: (dealGroupId) => {
  set({
    cartItems: get().cartItems.filter(
      (item) => item.parentDealId !== dealGroupId && item.id !== dealGroupId
    ),
  });
},






increaseQuantity: (cartLineId) => {
  set({
    cartItems: get().cartItems.map((ci) =>
      ci.cartLineId === cartLineId ? { ...ci, quantity: ci.quantity + 1 } : ci
    ),
  });
},

decreaseQuantity: (cartLineId) => {
  set({
    cartItems: get().cartItems
      .map((ci) =>
        ci.cartLineId === cartLineId ? { ...ci, quantity: Math.max(1, ci.quantity - 1) } : ci
      )
      .filter((ci) => ci.quantity > 0),
  });
},

      clearCart: () => {
        set({ cartItems: [] });
      },

      totalItems: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      groupedCartCount: () => {
  const items = get().cartItems;

  // group by parentDealId if it exists, else by id
  const uniqueGroups = new Set(
    items.map(item => item.parentDealId || item.id)
  );

  return uniqueGroups.size;
},

      totalPrice: () => {
        return get().cartItems.reduce((total, item) => {
          const basePrice = item.price || 0;

          const modifiersPrice = (item.selectedModifiers || []).reduce(
            (sum, mod) => sum + (mod.price || 0),
            0
          );

          const addonsPrice = (item.selectedAddons || []).reduce(
            (sum, addon) => sum + (addon.price || 0),
            0
          );

          const sizePrice = item.selectedSize?.price || 0;
          const variationPrice = item.selectedVariation?.price || 0;

          const itemTotal =
            (basePrice +
              modifiersPrice +
              addonsPrice +
              sizePrice +
              variationPrice) * item.quantity;

          return total + itemTotal;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
    }
  )
);
