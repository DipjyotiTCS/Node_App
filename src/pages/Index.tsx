import { useState } from "react";
import Header from "@/components/Header";
import SearchPanel from "@/components/SearchPanel";
import BookMetadataPanel from "@/components/BookMetadataPanel";
import RoyaltyTable from "@/components/RoyaltyTable";
import { BookMetadata, RoyaltyRow, SearchFilters, AuthorDetails, AuthorSalesDetails } from "@/types/royalty";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [bookMetadata, setBookMetadata] = useState<BookMetadata | null>(null);
  const [royaltyData, setRoyaltyData] = useState<RoyaltyRow[]>([]);

  const [authorData, setAuthorResponse] = useState<AuthorDetails | null>(null);
  const [salesData, setSalesData] = useState<AuthorSalesDetails | null>(null);

  const handleSearch = (filters: SearchFilters) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {

      //API call to get author details
      fetch(`/author/getAuthorDetails/${filters.author}/${filters.isbn}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} ${res.statusText}`);
            }
            return res.json(); // parse JSON
          })
        .then(data => {
          const authorData: AuthorDetails = data;
          setAuthorResponse(authorData)
          
          const royaltyData: RoyaltyRow[] = [
                {
                  id: "us-domestic",
                  royaltyHead: "US Domestic",
                  databaseRate: authorData.royalty_us,
                  salesAmount: authorData.sales_us,
                  calculatedRoyalty: authorData.royalty_us_amount,
                  latestRate: 12.5,
                  latestCalculatedRoyalty: 30625,
                  hasDiscrepancy: false,
                },
                {
                  id: "canadian",
                  royaltyHead: "Canadian",
                  databaseRate: authorData.royalty_canada,
                  salesAmount: authorData.sales_canada,
                  calculatedRoyalty: authorData.royalty_canada_amount,
                  latestRate: 10.0,
                  latestCalculatedRoyalty: 4500,
                  hasDiscrepancy: false,
                },
                {
                  id: "foreign",
                  royaltyHead: "Foreign",
                  databaseRate: authorData.royalty_sub_foreign,
                  salesAmount: authorData.sales_foreign,
                  calculatedRoyalty: authorData.royalty_foreign_amount,
                  latestRate: 8.5,
                  latestCalculatedRoyalty: 6630,
                  hasDiscrepancy: false,
                },
                {
                  id: "chapter-sales",
                  royaltyHead: "Chapter Sales",
                  databaseRate: authorData.royalty_chapter,
                  salesAmount: authorData.sales_chapter,
                  calculatedRoyalty: authorData.royalty_chapter_amount,
                  latestRate: 15.0,
                  latestCalculatedRoyalty: 1875,
                  hasDiscrepancy: false,
                },
                {
                  id: "high-discount",
                  royaltyHead: "High Discount",
                  databaseRate: authorData.royalty_high_discount,
                  salesAmount: authorData.sales_high_discount,
                  calculatedRoyalty: authorData.royalty_high_discount_amount,
                  latestRate: 7.5,
                  latestCalculatedRoyalty: 2550,
                  discrepancyReason: "Amendment Q2-2024: High Discount rate increased from 6.0% to 7.5%",
                  hasDiscrepancy: true,
                },
                {
                  id: "state-adoption",
                  royaltyHead: "State Adoption",
                  databaseRate: authorData.royalty_state_adoption,
                  salesAmount: authorData.sales_state_adoption,
                  calculatedRoyalty: authorData.royalty_state_adoption_amount,
                  latestRate: 5.5,
                  latestCalculatedRoyalty: 4895,
                  hasDiscrepancy: false,
                },
                {
                  id: "subscription-trial",
                  royaltyHead: "Subscription – Trial/Present",
                  databaseRate: authorData.royalty_sub_trial,
                  salesAmount: authorData.sales_sub_trial,
                  calculatedRoyalty: authorData.royalty_sub_trial_amount,
                  latestRate: 3.0,
                  latestCalculatedRoyalty: 450,
                  hasDiscrepancy: false,
                },
                {
                  id: "subscription-domestic",
                  royaltyHead: "Subscription Sales – Domestic",
                  databaseRate: authorData.royalty_sub_us,
                  salesAmount: authorData.sales_sub_us,
                  calculatedRoyalty: authorData.royalty_sub_us_amount,
                  latestRate: 11.0,
                  latestCalculatedRoyalty: 6160,
                  discrepancyReason: "Amendment Q3-2024: Subscription Domestic rate increased from 9.0% to 11.0%",
                  hasDiscrepancy: true,
                },
                {
                  id: "subscription-foreign",
                  royaltyHead: "Subscription Sales – Foreign",
                  databaseRate: authorData.royalty_sub_foreign,
                  salesAmount: authorData.sales_sub_foreign,
                  calculatedRoyalty: authorData.royalty_sub_foreign_amount,
                  latestRate: 7.0,
                  latestCalculatedRoyalty: 1610,
                  hasDiscrepancy: false,
                },
              ]; 

          setRoyaltyData(royaltyData);
          filters.title = authorData.title;
          setBookMetadata(filters);
          setSearchPerformed(true);
          setIsLoading(false);
        })
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
          
          {searchPerformed && bookMetadata && (
            <>
              <BookMetadataPanel metadata={bookMetadata} />
              <RoyaltyTable data={royaltyData} />
            </>
          )}
          
          {!searchPerformed && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Search for a Book Record
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Enter a title, ISBN, or author name above to view royalty
                calculations and perform reconciliation with the latest rates.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
