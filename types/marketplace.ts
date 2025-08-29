// types/marketplace.ts
export type ProviderType = "consultor" | "empresa" | "freelancer";

export interface PriceRange {
  min: number;
  max: number;
  currency: string; // "USD", "MXN", etc.
}

export interface Provider {
  providerId: string;
  userId: string;
  status: "active" | "paused" | "draft";
  type: ProviderType;
  name: string;
  slug: string;
  headline?: string;
  country?: string;
  city?: string;
  languages?: string[];        // e.g., ["es", "en"]
  expertiseAreas?: string[];   // chips
  industries?: string[];
  priceRange?: PriceRange;
  ratingAvg?: number;
  ratingCount?: number;
  logoUrl?: string;
  coverUrl?: string;
  bio?: string;
  servicesSummary?: string[];
  nameLower?: string;
  primaryArea?: string;
  keywords?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Service {
  providerId: string;
  serviceId: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  priceFrom?: number;
  priceUnit?: "hora" | "proyecto" | "sesión" | string;
  deliveryTimeDays?: number;
  images?: string[];
  active?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ContactPayload {
  providerId: string;
  serviceId?: string;
  name: string;
  email: string;
  message: string;
}

export interface ListResponse<T> {
  items: T[];
  cursor?: string;
}
