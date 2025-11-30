export interface BookMetadata {
  title: string;
  isbn: string;
  author: string;
}

export interface RoyaltyRow {
  id: string;
  royaltyHead: string;
  databaseRate: number;
  salesAmount: number;
  calculatedRoyalty: number;
  latestRate?: number;
  latestCalculatedRoyalty?: number;
  discrepancyReason?: string;
  hasDiscrepancy?: boolean;
}

export interface SearchFilters {
  title: string;
  isbn: string;
  author: string;
}


export interface AuthorDetails {
  title: string;
  isbn: number;
  author: string;

  royalty_canada: number;
  royalty_chapter: number;
  royalty_us: number;
  royalty_foreign: number;
  royalty_high_discount: number;
  royalty_state_adoption: number;
  royalty_sub_us: number;
  royalty_sub_foreign: number;
  royalty_sub_trial: number;

  royalty_canada_amount: number;
  royalty_chapter_amount: number;
  royalty_us_amount: number;
  royalty_foreign_amount: number;
  royalty_high_discount_amount: number;
  royalty_state_adoption_amount: number;
  royalty_sub_us_amount: number;
  royalty_sub_foreign_amount: number;
  royalty_sub_trial_amount: number;

  royalty_total_amount: number;

  sales_total: number;
  sales_canada: number;
  sales_chapter: number;
  sales_us: number;
  sales_foreign: number;
  sales_high_discount: number;
  sales_state_adoption: number;
  sales_sub_us: number;
  sales_sub_foreign: number;
  sales_sub_trial: number;
}


export interface AuthorSalesDetails {
  id: number;
  title: string;
  isbn: number;
  author: string;
  process_date: string; // or Date if you parse it later
}


export interface RoyaltyComparisonResponse {
  // Primary metadata
  title: string;
  isbn: number;
  author: string;
  process_date: string; // e.g., "23-Nov-2025"

  // Amounts & discrepancies by category
  royalty_canada_amount: number;
  royalty_canada_discr: number;

  royalty_chapter_amount: number;
  royalty_chapter_discr: number;

  royalty_us_amount: number;
  royalty_us_discr: number;

  royalty_foreign_amount: number;
  royalty_foreign_discr: number;

  royalty_high_discount_amount: number;
  royalty_high_discount_discr: number;

  royalty_state_adoption_amount: number;
  royalty_state_adoption_discr: number;

  royalty_sub_us_amount: number;
  royalty_sub_us_discr: number;

  royalty_sub_foreign_amount: number;
  royalty_sub_foreign_discr: number;

  royalty_sub_trial_amount: number;
  royalty_sub_trial_discr: number;

  // Totals
  royalty_total_DB: number;
  royalty_total_latest: number;
  royalty_total_disc: number;

  // Narrative / explanation fields (nullable when not available)
  royalty_rate_us_response: string;
  can_frn_chptr_state_response: string | null;
  royalty_rate_high_disc_response: string;
  royalty_rate_sub_response: string | null;
  royalty_rate_canada_response: string;
  royalty_rate_chapter_response: string;
  royalty_us_discr_response: string | null;
  royalty_rate_foreign_response: string;
  royalty_rate_state_adoptions_response: string;
  royalty_rate_sub_us_response: string;
  royalty_rate_sub_foreign_response: string;
  royalty_rate_sub_trial_response: string;
}

