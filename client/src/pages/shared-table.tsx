import { useEffect, useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { useTableData } from "@/hooks/use-table-data";
import { LoadingOverlay } from "@/components/skeleton-loader";
import { Footer } from "@/components/footer";
import { Database } from "lucide-react";
import type { SharedTableState, TableColumn, TableRow } from "@shared/schema";

export default function SharedTablePage() {
  const [, params] = useRoute("/share/:shareId");
  const shareId = params?.shareId;

  const { rows, columns, isLoading } = useTableData();

  // Fetch shared table state
  const { data: sharedState, isLoading: isLoadingState, error } = useQuery<SharedTableState>({
    queryKey: ['/api/share-table', shareId],
    enabled: !!shareId,
  });

  // Apply filters and column visibility from shared state
  const { filteredRows, displayColumns } = useMemo(() => {
    if (!sharedState || rows.length === 0 || columns.length === 0) {
      return { filteredRows: rows, displayColumns: columns };
    }

    const { filters, columnVisibility, columnOrder } = sharedState.tableState;

    // Filter rows
    let filtered = rows;
    
    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.searchTerm.toLowerCase())
        )
      );
    }

    // Apply route filters
    if (filters.routeFilters.length > 0) {
      filtered = filtered.filter(row => filters.routeFilters.includes(row.route));
    }

    // Apply delivery filters
    if (filters.deliveryFilters.length > 0) {
      filtered = filtered.filter(row => filters.deliveryFilters.includes(row.delivery));
    }

    // Filter and reorder columns based on shared state
    // Note: columnVisibility only stores hidden columns (false), visible ones are undefined
    const visibleCols = columns.filter(col => columnVisibility[col.id] !== false);
    const orderedCols = columnOrder
      .map(id => visibleCols.find(col => col.id === id))
      .filter((col): col is TableColumn => col !== undefined);

    return { filteredRows: filtered, displayColumns: orderedCols };
  }, [rows, columns, sharedState]);

  // Create no-op mutations for read-only mode
  const noOpMutation = useMutation({
    mutationFn: async () => {},
  });

  const deleteNoOpMutation = useMutation<void, Error, string>({
    mutationFn: async () => {},
  });

  const reorderNoOpMutation = useMutation<TableRow[], Error, string[]>({
    mutationFn: async () => [],
  });

  const reorderColumnsNoOpMutation = useMutation<TableColumn[], Error, string[]>({
    mutationFn: async () => [],
  });

  const deleteColumnNoOpMutation = useMutation<void, Error, string>({
    mutationFn: async () => {},
  });

  if (isLoading || isLoadingState) {
    return (
      <div className="min-h-screen relative">
        <LoadingOverlay message="Loading shared table..." type="wave" />
      </div>
    );
  }

  if (error || !sharedState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Shared Table Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            The shared table you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <nav className="sticky top-0 z-50 w-full border-b-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between text-[12px]">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white">
                  <Database className="h-4 w-4" />
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300" style={{ fontSize: '14px' }}>
                  Table View
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              View Only
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-4">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Info Banner */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              You're viewing a shared table with predefined filters and settings. This is a read-only view.
            </p>
          </div>

          {/* Data Table */}
          <DataTable
            rows={filteredRows}
            columns={displayColumns}
            editMode={false}
            onUpdateRow={noOpMutation as any}
            onDeleteRow={deleteNoOpMutation as any}
            onReorderRows={reorderNoOpMutation as any}
            onReorderColumns={reorderColumnsNoOpMutation as any}
            onDeleteColumn={deleteColumnNoOpMutation as any}
            onSelectRowForImage={() => {}}
            isAuthenticated={false}
          />
        </div>
      </main>

      <Footer editMode={false} />
    </>
  );
}
