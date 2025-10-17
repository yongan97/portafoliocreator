import { z } from "zod";

export type InstrumentCategory =
  | "Acción Local"
  | "CEDEAR"
  | "Bono Soberano Ley NY"
  | "Bono Soberano Ley AR"
  | "Bono Provincial"
  | "Obligación Negociable"
  | "Letra del Tesoro"
  | "Efectivo";

export type Currency = "USD" | "ARS" | "EUR";

export type RateType =
  | "Hard Dollar" // Bonos en dólares
  | "Tasa Fija" // LECAP, bonos a tasa fija
  | "Tasa Variable" // Tasa variable
  | "CER" // Ajustado por inflación
  | "Badlar" // Indexado a Badlar
  | "Dual" // Bonos duales
  | "Dollar Link" // Dollar linked
  | "N/A"; // No aplica (acciones, CEDEARs, efectivo)

export type Instrument = {
  id: string;
  name: string;
  category: InstrumentCategory;
  currency: Currency;
  rateType: RateType;
  description: string;
  priceARS?: number; // Precio en pesos
  priceUSD?: number; // Precio en dólares
  yieldARS?: number; // TIR o rendimiento en pesos (%)
  yieldUSD?: number; // TIR o rendimiento en dólares (%)
};

export type Allocation = {
  instrumentId: string;
  percent: number;
};

export type Portfolio = {
  allocations: Allocation[];
};

export const AllocationSchema = z.object({
  instrumentId: z.string().min(1, "Instrument ID is required"),
  percent: z
    .number()
    .positive("Percent must be greater than 0")
    .max(100, "Percent cannot exceed 100"),
});

export const PortfolioSchema = z
  .object({
    allocations: z.array(AllocationSchema).min(1, "At least one allocation is required"),
  })
  .refine(
    (data) => {
      const sum = data.allocations.reduce((acc, curr) => acc + curr.percent, 0);
      return Math.abs(sum - 100) < 0.01; // Allow small floating point errors
    },
    {
      message: "Total allocation must equal 100%",
    }
  );
