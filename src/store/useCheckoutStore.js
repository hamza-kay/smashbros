// src/store/useCheckoutStore.js

import { create } from "zustand";

export const useCheckoutStore = create((set) => ({
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    fulfillmentType: "DELIVERY",
    deliveryAddress: "",
    apartment: "",
    postcode: "",
    city: "",
    notes: "",
  },
  setCustomer: (data) =>
    set((state) => ({
      customer: { ...state.customer, ...data },
    })),
}));
