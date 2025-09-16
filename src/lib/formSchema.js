import { z } from "zod";

export const FormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(7, "Phone number is too short"),
    fulfillmentType: z.enum(["DELIVERY", "PICKUP"]),
    deliveryAddress: z.string().optional(),
    apartment: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentType === "DELIVERY") {
      if (!data.deliveryAddress?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Street address is required",
          path: ["deliveryAddress"],
        });
      }
      if (!data.postcode?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Postcode is required",
          path: ["postcode"],
        });
      }
      if (!data.city?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "City is required",
          path: ["city"],
        });
      }
    }
  });
