import { z } from "zod";

export const barcodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^CR-\d{3}-\d{3}$/, { message: "Barcode must look like CR-076-001" });

export const manualScanSchema = z.object({
  barcode: z.string().min(1, { message: "Enter or scan a barcode" }),
});

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, { message: "Enter the 4-digit PIN" }),
});

export const sealSchema = z.object({
  seal: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^SEAL-[A-Z]{2}-\d{6}$/, {
      message: "Seal must look like SEAL-LK-884921",
    }),
});
