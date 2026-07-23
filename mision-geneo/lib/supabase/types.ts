/**
 * Tipos de la base de datos (fase 2). Escritos a mano según supabase/schema.sql.
 * Si el esquema cambia, actualizar acá (o regenerar con `supabase gen types`).
 */

export type Role = "employee" | "admin" | "vendor";
export type RedemptionStatus = "requested" | "approved" | "delivered";

export type PharmacyRow = {
  id: string;
  code: string;
  name: string;
  city: string | null;
  active: boolean;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  pharmacy_id: string | null;
  name: string;
  role: Role;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type DailyAnswerRow = {
  id: string;
  user_id: string;
  /** Día local YYYY-MM-DD (unique junto a user_id). */
  day: string;
  question_id: string;
  correct: boolean;
  points: number;
  created_at: string;
};

export type MissionProgressRow = {
  id: string;
  user_id: string;
  mission_slug: string;
  score: number;
  completed_at: string;
};

export type RedemptionRow = {
  id: string;
  user_id: string;
  reward_id: string;
  points: number;
  status: RedemptionStatus;
  created_at: string;
};

export type CertificateRow = {
  id: string;
  user_id: string;
  type: string;
  issued_at: string;
};

export type PharmacyPurchaseRow = {
  id: string;
  pharmacy_id: string;
  units: number;
  amount: number;
  period: string | null;
  created_at: string;
};

export type VendorPharmacyRow = {
  vendor_id: string;
  pharmacy_id: string;
  created_at: string;
};

/** Shape que consume @supabase/supabase-js para tipar queries. */
export type Database = {
  public: {
    Tables: {
      pharmacies: {
        Row: PharmacyRow;
        Insert: Partial<PharmacyRow> & Pick<PharmacyRow, "code" | "name">;
        Update: Partial<PharmacyRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Pick<ProfileRow, "id" | "name"> & Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      mission_progress: {
        Row: MissionProgressRow;
        Insert: Pick<MissionProgressRow, "user_id" | "mission_slug" | "score"> &
          Partial<MissionProgressRow>;
        Update: Partial<MissionProgressRow>;
        Relationships: [];
      };
      redemptions: {
        Row: RedemptionRow;
        Insert: Pick<RedemptionRow, "user_id" | "reward_id" | "points"> & Partial<RedemptionRow>;
        Update: Partial<RedemptionRow>;
        Relationships: [];
      };
      certificates: {
        Row: CertificateRow;
        Insert: Pick<CertificateRow, "user_id"> & Partial<CertificateRow>;
        Update: Partial<CertificateRow>;
        Relationships: [];
      };
      daily_answers: {
        Row: DailyAnswerRow;
        Insert: Pick<DailyAnswerRow, "user_id" | "day" | "question_id" | "correct" | "points"> &
          Partial<DailyAnswerRow>;
        Update: Partial<DailyAnswerRow>;
        Relationships: [];
      };
      pharmacy_purchases: {
        Row: PharmacyPurchaseRow;
        Insert: Pick<PharmacyPurchaseRow, "pharmacy_id"> & Partial<PharmacyPurchaseRow>;
        Update: Partial<PharmacyPurchaseRow>;
        Relationships: [];
      };
      vendor_pharmacies: {
        Row: VendorPharmacyRow;
        Insert: Pick<VendorPharmacyRow, "vendor_id" | "pharmacy_id"> &
          Partial<VendorPharmacyRow>;
        Update: Partial<VendorPharmacyRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
