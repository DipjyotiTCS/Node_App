import { BookMetadata, RoyaltyRow } from "@/types/royalty";

export const mockBookData: BookMetadata = {
  title: "Advanced Data Structures and Algorithms",
  isbn: "978-0-13-468599-1",
  author: "Dr. Sarah Mitchell",
};

export const mockRoyaltyData: RoyaltyRow[] = [
  {
    id: "us-domestic",
    royaltyHead: "US Domestic",
    databaseRate: 12.5,
    salesAmount: 245000,
    calculatedRoyalty: 30625,
    latestRate: 12.5,
    latestCalculatedRoyalty: 30625,
    hasDiscrepancy: false,
  },
  {
    id: "canadian",
    royaltyHead: "Canadian",
    databaseRate: 10.0,
    salesAmount: 45000,
    calculatedRoyalty: 4500,
    latestRate: 10.0,
    latestCalculatedRoyalty: 4500,
    hasDiscrepancy: false,
  },
  {
    id: "foreign",
    royaltyHead: "Foreign",
    databaseRate: 8.5,
    salesAmount: 78000,
    calculatedRoyalty: 6630,
    latestRate: 8.5,
    latestCalculatedRoyalty: 6630,
    hasDiscrepancy: false,
  },
  {
    id: "chapter-sales",
    royaltyHead: "Chapter Sales",
    databaseRate: 15.0,
    salesAmount: 12500,
    calculatedRoyalty: 1875,
    latestRate: 15.0,
    latestCalculatedRoyalty: 1875,
    hasDiscrepancy: false,
  },
  {
    id: "high-discount",
    royaltyHead: "High Discount",
    databaseRate: 6.0,
    salesAmount: 34000,
    calculatedRoyalty: 2040,
    latestRate: 7.5,
    latestCalculatedRoyalty: 2550,
    discrepancyReason: "Amendment Q2-2024: High Discount rate increased from 6.0% to 7.5%",
    hasDiscrepancy: true,
  },
  {
    id: "state-adoption",
    royaltyHead: "State Adoption",
    databaseRate: 5.5,
    salesAmount: 89000,
    calculatedRoyalty: 4895,
    latestRate: 5.5,
    latestCalculatedRoyalty: 4895,
    hasDiscrepancy: false,
  },
  {
    id: "subscription-trial",
    royaltyHead: "Subscription – Trial/Present",
    databaseRate: 3.0,
    salesAmount: 15000,
    calculatedRoyalty: 450,
    latestRate: 3.0,
    latestCalculatedRoyalty: 450,
    hasDiscrepancy: false,
  },
  {
    id: "subscription-domestic",
    royaltyHead: "Subscription Sales – Domestic",
    databaseRate: 9.0,
    salesAmount: 56000,
    calculatedRoyalty: 5040,
    latestRate: 11.0,
    latestCalculatedRoyalty: 6160,
    discrepancyReason: "Amendment Q3-2024: Subscription Domestic rate increased from 9.0% to 11.0%",
    hasDiscrepancy: true,
  },
  {
    id: "subscription-foreign",
    royaltyHead: "Subscription Sales – Foreign",
    databaseRate: 7.0,
    salesAmount: 23000,
    calculatedRoyalty: 1610,
    latestRate: 7.0,
    latestCalculatedRoyalty: 1610,
    hasDiscrepancy: false,
  },
];

export const calculateTotals = (rows: RoyaltyRow[], useLatest: boolean = false) => {
  return rows.reduce(
    (acc, row) => {
      const latestExists =
        row.latestCalculatedRoyalty !== undefined &&
        row.latestCalculatedRoyalty !== null;

      const royaltyToAdd = useLatest
        ? (latestExists ? row.latestCalculatedRoyalty! : 0)              // use ONLY latest
        : (row.calculatedRoyalty ?? 0);                                  // use ONLY original

      return {
        salesAmount: acc.salesAmount + row.salesAmount,
        calculatedRoyalty: acc.calculatedRoyalty + royaltyToAdd,
      };
    },
    { salesAmount: 0, calculatedRoyalty: 0 }
  );
};
