import { useState, useMemo } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RoyaltyRow, RoyaltyComparisonResponse } from "@/types/royalty";
import { calculateTotals } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isBefore } from "date-fns";

interface RoyaltyTableProps {
  data: RoyaltyRow[];
}

// You can change this to match your actual backend endpoint
const UPDATE_RATES_API_URL = "/author/updateAuthorRates";
const RESET_RATES_API_URL = "/author/resetAuthorRates";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
};

const truncateWords = (text: string | null | undefined, limit = 30) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ");
};

/**
 * Reverse-calculate royalty rate based on sales amount and royalty amount.
 *
 * @param salesAmount number - total sales amount
 * @param royaltyAmount number - royalty amount paid based on latest rate
 * @returns number - percentage value (e.g., 12.5 for 12.5%)
 */
export function calculateRoyaltyRate(
  salesAmount: number,
  royaltyAmount: number
): number {
  if (!salesAmount || salesAmount === 0) return 0;
  if (!royaltyAmount || royaltyAmount === 0) return 0;

  const rate = (royaltyAmount / salesAmount) * 100;
  return Number(rate.toFixed(3)); // keep 3 decimals for accuracy
}

export function calculateDescrepency(
  calculatedRoyalty: number,
  latestRoyalty: number,
  descripency: number
): boolean {
  if(descripency != 0) {
     if(calculatedRoyalty == latestRoyalty) {
      return false
     } else {
      return true
     }
  } else {
    return false
  }
}

//const formatPercentage = (value: number) => {
//  return `${value.toFixed(3)}`;
//};

const formatPercentage = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "";

  const num = Number(value);

  if (isNaN(num)) return value + "";

  let formatted = num.toString();

  // Force decimal form for cases like 0.300 that may appear as "0.3" automatically
  formatted = num.toFixed(6);         
  formatted = formatted.replace(/\.?0+$/, "");  // remove trailing zeros + dot if empty

  return formatted;
};

const RoyaltyTable: React.FC<RoyaltyTableProps> = ({ data }) => {
  const [rows, setRows] = useState<RoyaltyRow[]>(() => data);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [reconData, setReconData] = useState<RoyaltyComparisonResponse | null>(
    null
  );

  // loading states
  const [isReconciling, setIsReconciling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // success modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<"update" | "reset" | null>(null);


  // Row selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set()
  );

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [activeReason, setActiveReason] = useState<{
    royaltyHead: string;
    text: string;
  } | null>(null);


  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    setSelectedIds((prev) => {
      if (prev.size === rows.length) {
        // everything was selected -> clear selection
        return new Set();
      }
      // select all current rows
      return new Set(rows.map((r) => r.id));
    });
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < rows.length;
  const headerChecked = allSelected ? true : someSelected ? "indeterminate" : false;

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedIds.has(r.id)),
    [rows, selectedIds]
  );

  const handleToggleReconciliation = () => {
    if (!showReconciliation) {
      setIsReconciling(true);
      fetch("/wisdomnext/callWisdomNext", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((responseData: RoyaltyComparisonResponse) => {
          const reconn = responseData;
          setReconData(reconn);

          const updated = rows.map((row) => {
            const copy: RoyaltyRow = { ...row };

            if (copy.id === "us-domestic") {
              copy.latestCalculatedRoyalty = reconn.royalty_us_amount;
              copy.discrepancyReason = reconn.royalty_rate_us_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_us_amount,
                reconn.royalty_us_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_us_amount
              );
            }

            if (copy.id === "canadian") {
              copy.latestCalculatedRoyalty = reconn.royalty_canada_amount;
              copy.discrepancyReason = reconn.royalty_rate_canada_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_canada_amount,
                reconn.royalty_canada_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_canada_amount
              );
            }

            if (copy.id === "chapter-sales") {
              copy.latestCalculatedRoyalty = reconn.royalty_chapter_amount;
              copy.discrepancyReason = reconn.royalty_rate_chapter_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_chapter_amount,
                reconn.royalty_chapter_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_chapter_amount
              );
            }

            if (copy.id === "foreign") {
              copy.latestCalculatedRoyalty = reconn.royalty_foreign_amount;
              copy.discrepancyReason = reconn.royalty_rate_foreign_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_foreign_amount,
                reconn.royalty_foreign_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_foreign_amount
              );
            }

            if (copy.id === "high-discount") {
              copy.latestCalculatedRoyalty =
                reconn.royalty_high_discount_amount;
              copy.discrepancyReason = reconn.royalty_rate_high_disc_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_high_discount_amount,
                reconn.royalty_high_discount_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_high_discount_amount
              );
            }

            if (copy.id === "state-adoption") {
              console.log(
                "STATE ADOPTION amount from API:",
                reconn.royalty_state_adoption_amount
              );
              copy.latestCalculatedRoyalty =
                reconn.royalty_state_adoption_amount;
              copy.discrepancyReason =
                reconn.royalty_rate_state_adoptions_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_state_adoption_amount,
                reconn.royalty_state_adoption_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_state_adoption_amount
              );
            }

            if (copy.id === "subscription-trial") {
              copy.latestCalculatedRoyalty = reconn.royalty_sub_trial_amount;
              copy.discrepancyReason =
                reconn.royalty_rate_sub_trial_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_sub_trial_amount,
                reconn.royalty_sub_trial_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_sub_trial_amount
              );
            }

            if (copy.id === "subscription-domestic") {
              copy.latestCalculatedRoyalty = reconn.royalty_sub_us_amount;
              copy.discrepancyReason = reconn.royalty_rate_sub_us_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_sub_us_amount,
                reconn.royalty_sub_us_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_sub_us_amount
              );
            }

            if (copy.id === "subscription-foreign") {
              copy.latestCalculatedRoyalty =
                reconn.royalty_sub_foreign_amount;
              copy.discrepancyReason =
                reconn.royalty_rate_sub_foreign_response;
              copy.hasDiscrepancy = calculateDescrepency(
                copy.calculatedRoyalty,
                reconn.royalty_sub_foreign_amount,
                reconn.royalty_sub_foreign_discr
              );
              copy.latestRate = calculateRoyaltyRate(
                copy.salesAmount,
                reconn.royalty_sub_foreign_amount
              );
            }

            return copy;
          });

          setRows(updated);
          setShowReconciliation(true);
        })
        .catch((error) => {
          console.error("Error calling WisdomNext API:", error);
        })
        .finally(() => {
          setIsReconciling(false);
        });
    } else {
      setShowReconciliation(false);
      // If you want to reset to original values when toggling off:
      // setRows(data);
    }
  };

  const handleUpdateSelected = async () => {
    if (selectedRows.length === 0) return;

    try {
      setIsUpdating(true);

      const response = await fetch(UPDATE_RATES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: selectedRows,
          author: reconData.author,
          isbn: reconData.isbn
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Update successful:", result);

      // ✅ Update table data in real time using existing latest values
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (!selectedIds.has(row.id)) return row;

          const updated = { ...row };

          if (typeof updated.latestRate === "number") {
            updated.databaseRate = updated.latestRate;
          }

          if (typeof updated.latestCalculatedRoyalty === "number") {
            updated.calculatedRoyalty = updated.latestCalculatedRoyalty;
          }

          updated.hasDiscrepancy = false;
          updated.discrepancyReason = "No discrepancy after update";

          return updated;
        })
      );

      // Clear selected rows so button disables again
      setSelectedIds(new Set());

      // Open success modal instead of toast
      setModalSource("update");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating selected rows:", error);

      // Keep toast for error feedback
      toast("Update Failed", {
        description:
          "Unable to update selected royalty rates. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetSelected = async () => {
    if (selectedRows.length === 0) return;

    try {
      setIsUpdating(true);

      const response = await fetch(RESET_RATES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Reset successful:", result);

      // Clear selected rows so button disables again
      setSelectedIds(new Set());

      // Open success modal instead of toast
      setModalSource("reset");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating selected rows:", error);

      // Keep toast for error feedback
      toast("Update Failed", {
        description:
          "Unable to update selected royalty rates. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const totals = calculateTotals(rows, false);
  const latestTotals = calculateTotals(rows, true);

  const discrepancyCount = rows.filter((row) => row.hasDiscrepancy).length;
  const totalDifference =
    latestTotals.calculatedRoyalty - totals.calculatedRoyalty;

  return (
    <>
      <Card className="animate-fade-in shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Royalty Calculation Summary
            </CardTitle>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row">
              <Button
                onClick={handleToggleReconciliation}
                variant={showReconciliation ? "secondary" : "default"}
                className="gap-2"
                disabled={isReconciling}
              >
                {isReconciling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      showReconciliation && "animate-spin"
                    )}
                  />
                )}
                {showReconciliation
                  ? "Hide Reconciliation"
                  : "Reconciliation with Latest Royalty Rates"}
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={handleUpdateSelected}
                disabled={selectedRows.length === 0 || isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isUpdating
                  ? "Updating Selected..."
                  : `Update Latest Rates (${selectedRows.length} selected)`}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleResetSelected}
                disabled={selectedRows.length === 0 || isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isUpdating
                  ? "Resetting...."
                  : `Reset Rates (${selectedRows.length} selected)`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-table-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-table-header hover:bg-table-header">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={headerChecked}
                      onCheckedChange={toggleAllSelection}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Royalty Head</TableHead>
                  <TableHead className="text-center font-semibold">
                    Royalty Rate (DB) (%)
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Sales Amount
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Royalty Amount (DB)
                  </TableHead>
                  {showReconciliation && (
                    <>
                      <TableHead className="text-center font-semibold">
                        Latest Royalty Rate (%)
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        Royalty Amount (Latest)
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        Probable Reason for Discrepancy
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => {
                  const isDiscrepancy = showReconciliation && row.hasDiscrepancy;
                  const rowClass = showReconciliation
                    ? isDiscrepancy
                      ? "bg-warning-light/30 hover:bg-warning-light/50"
                      : "bg-success-light/30 hover:bg-success-light/50"
                    : index % 2 === 0
                    ? "bg-card"
                    : "bg-table-row-alt";

                  const isSelected = selectedIds.has(row.id);

                  return (
                    <TableRow key={row.id} className={rowClass}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(row.id)}
                          aria-label={`Select ${row.royaltyHead}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.royaltyHead}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatPercentage(row.databaseRate)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatCurrency(row.salesAmount)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatCurrency(row.calculatedRoyalty)}
                      </TableCell>
                      {showReconciliation && (
                        <>
                          {/* Latest Royalty Rate */}
                          <TableCell
                            className={cn(
                              "text-center font-mono rounded-sm px-2",
                              isDiscrepancy 
                                ? "bg-warning-light/60 text-warning font-semibold" 
                                : "bg-primary/5 text-foreground/90"
                            )}
                          >
                            {formatPercentage(row.latestRate ?? row.databaseRate)}
                          </TableCell>

                          {/* Latest Royalty Amount */}
                          <TableCell
                            className={cn(
                              "text-center font-mono rounded-sm px-2",
                              isDiscrepancy 
                                ? "bg-warning-light/60 text-warning font-semibold" 
                                : "bg-primary/5 text-foreground/90"
                            )}
                          >
                            {formatCurrency(
                              row.latestCalculatedRoyalty ?? row.calculatedRoyalty
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "max-w-xs rounded-sm px-2",
                              isDiscrepancy
                                ? "bg-warning-light/60 text-warning"
                                : "bg-primary/5 text-foreground/90"
                            )}
                          >
                            {isDiscrepancy ? (() => {
                              const wordLimit = 30;
                              const fullText = row.discrepancyReason ?? "";
                              const words = fullText.trim() ? fullText.trim().split(/\s+/) : [];
                              const isTruncated = words.length > wordLimit;

                              const truncatedCore = truncateWords(fullText, wordLimit);
                              const displayText = isTruncated
                                ? `${truncatedCore}... more`
                                : truncatedCore;

                              const handleClick = () => {
                                if (!fullText) return;
                                setActiveReason({
                                  royaltyHead: row.royaltyHead,
                                  text: fullText,
                                });
                                setReasonModalOpen(true);
                              };

                              return (
                                <div className="flex w-full items-start gap-2 text-left">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                                  <span
                                    className="text-sm cursor-pointer"
                                    onClick={handleClick}
                                  >
                                    {displayText}
                                  </span>
                                </div>
                              );
                            })() : (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span className="text-sm text-success">No discrepancy</span>
                              </div>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
                {/* Total Row */}
                <TableRow className="border-t-2 border-primary/20 bg-primary/5 font-semibold hover:bg-primary/10">
                  <TableCell className="w-10"></TableCell>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-center">—</TableCell>
                  <TableCell className="text-center font-mono">
                    {formatCurrency(totals.salesAmount)}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatCurrency(totals.calculatedRoyalty)}
                  </TableCell>
                  {showReconciliation && (
                    <>
                      <TableCell className="text-center">—</TableCell>
                      <TableCell
                        className={cn(
                          "text-center font-mono",
                          totalDifference !== 0 && "text-warning"
                        )}
                      >
                        {formatCurrency(latestTotals.calculatedRoyalty)}
                      </TableCell>
                      <TableCell className="text-center">
                        {totalDifference !== 0 && (
                          <span className="text-sm font-medium text-warning text-center">
                            Difference: {formatCurrency(totalDifference)}
                          </span>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Reconciliation Summary */}
          {showReconciliation && (
            <div className="mt-6 animate-fade-in rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Reconciliation Summary
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-success/30 bg-success-light p-3">
                  <p className="text-sm text-muted-foreground">
                    Matched Records
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {data.length - discrepancyCount}
                  </p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning-light p-3">
                  <p className="text-sm text-muted-foreground">
                    Discrepancies Found
                  </p>
                  <p className="text-2xl font-bold text-warning">
                    {discrepancyCount}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    Total Difference
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(totalDifference)}
                  </p>
                </div>
              </div>
              {discrepancyCount > 0 && (
                <div className="mt-4 rounded-lg border border-warning/30 bg-warning-light/50 p-3">
                  <p className="text-sm font-medium text-foreground">
                    Discrepancy Details:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {rows
                      .filter((row) => row.hasDiscrepancy)
                      .map((row) => (
                        <li
                          key={row.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                          <span>
                            <strong>{row.royaltyHead}:</strong>{" "}
                            {row.discrepancyReason}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discrepancy Reason Modal */}
      <Dialog open={reasonModalOpen} onOpenChange={setReasonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Discrepancy Details
              {activeReason?.royaltyHead ? ` – ${activeReason.royaltyHead}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 max-h-[60vh] overflow-y-auto whitespace-pre-line text-sm">
            {activeReason?.text}
          </div>
          <DialogFooter>
            <Button onClick={() => setReasonModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    {/* Success Modal */}
    <Dialog open={isSuccessModalOpen} onOpenChange={(open) => {
        setIsSuccessModalOpen(open);

        if (!open && modalSource === "reset") {
          window.location.reload();
        }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Operation Successful</DialogTitle>
          <DialogDescription>
            {modalSource === "reset"
              ? "Values have been reset to database defaults."
              : "Selected royalty rates have been updated."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    </>
  );
};

export default RoyaltyTable;
