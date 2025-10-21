import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnHeader } from "./column-header";
import { EditableCell } from "./editable-cell";
import { ImagePreview } from "./image-preview";
import { InfoModal } from "./info-modal";
import { SlidingDescription } from "./sliding-description";
import { Tutorial } from "./tutorial";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Trash,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  PlusCircle,
  RefreshCw,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Infinity,
  FileText,
  Search,
  Filter,
  X,
  MapPin,
  Route,
  Share2,
  Power,
  Bookmark,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  SkeletonLoader,
  LoadingOverlay,
  InlineLoading,
} from "./skeleton-loader";
import { TableRow as TableRowType, TableColumn } from "@shared/schema";
import { UseMutationResult } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Simple mobile-friendly tooltip component
interface MobileTooltipProps {
  content: string;
  children: React.ReactNode;
  showBelow?: boolean;
}

function MobileTooltip({ content, children, showBelow = false }: MobileTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device supports touch
    const checkIsMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      setIsVisible(!isVisible);
      // Auto-hide after 3 seconds on mobile
      setTimeout(() => setIsVisible(false), 3000);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsVisible(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isMobile ? 'cursor-pointer' : 'cursor-help'}`}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 z-50 ${showBelow ? 'top-full mt-1' : 'bottom-full mb-1'}`}>
          <div className="px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap">
            {content}
          </div>
          <div className={`absolute left-1/2 transform -translate-x-1/2 border-4 border-transparent ${showBelow ? 'bottom-full border-b-gray-900' : 'top-full border-t-gray-900'}`} />
        </div>
      )}
    </div>
  );
}

interface DataTableProps {
  rows: TableRowType[];
  columns: TableColumn[];
  editMode: boolean;
  onUpdateRow: UseMutationResult<
    any,
    Error,
    { id: string; updates: Partial<any> },
    unknown
  >;
  onDeleteRow: UseMutationResult<void, Error, string, unknown>;
  onReorderRows: UseMutationResult<TableRowType[], Error, string[], unknown>;
  onReorderColumns: UseMutationResult<TableColumn[], Error, string[], unknown>;
  onDeleteColumn: UseMutationResult<void, Error, string, unknown>;
  onSelectRowForImage: (rowId: string) => void;
  onShowCustomization?: () => void;
  onOptimizeRoute?: () => void;
  onShareTable?: () => void;
  onSavedLinks?: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  isFiltered?: boolean;
  // Search and filter props
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
  filterValue?: string[];
  onFilterValueChange?: (filters: string[]) => void;
  deliveryFilterValue?: string[];
  onDeliveryFilterValueChange?: (filters: string[]) => void;
  routeOptions?: string[];
  deliveryOptions?: string[];
  onClearAllFilters?: () => void;
  filteredRowsCount?: number;
  totalRowsCount?: number;
}

export function DataTable({
  rows,
  columns,
  editMode,
  onUpdateRow,
  onDeleteRow,
  onReorderRows,
  onReorderColumns,
  onDeleteColumn,
  onSelectRowForImage,
  onShowCustomization,
  onOptimizeRoute,
  onShareTable,
  onSavedLinks,
  isAuthenticated = false,
  isLoading = false,
  isFiltered = false,
  // Search and filter props
  searchTerm = '',
  onSearchTermChange,
  filterValue = [],
  onFilterValueChange,
  deliveryFilterValue = [],
  onDeliveryFilterValueChange,
  routeOptions = [],
  deliveryOptions = [],
  onClearAllFilters,
  filteredRowsCount = 0,
  totalRowsCount = 0,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<
    string | null
  >(null);
  const [sortState, setSortState] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null);
  const { toast } = useToast();

  // Filter columns to hide "info" column when not in edit mode
  const visibleColumns = editMode ? columns : columns.filter(col => col.dataKey !== 'info');

  // Reset to page 1 when rows change (due to filtering)
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [rows.length]);

  // Use rows as provided (already filtered by parent with distances calculated)
  
  // Apply sorting based on sortState
  const sortedRows = sortState ? (() => {
    const sorted = [...rows].sort((a, b) => {
      // Always put inactive rows at the bottom
      const activeA = a.active !== false;
      const activeB = b.active !== false;
      if (activeA !== activeB) {
        return activeA ? -1 : 1;
      }
      
      const direction = sortState.direction === 'asc' ? 1 : -1;
      
      switch (sortState.column) {
        case 'code': {
          const codeA = a.code || "";
          const codeB = b.code || "";
          const numA = parseInt(codeA) || 0;
          const numB = parseInt(codeB) || 0;
          return (numA - numB) * direction;
        }
        case 'route': {
          const routeA = a.route || "";
          const routeB = b.route || "";
          return routeA.localeCompare(routeB) * direction;
        }
        case 'location': {
          const locationA = a.location || "";
          const locationB = b.location || "";
          return locationA.localeCompare(locationB) * direction;
        }
        case 'delivery': {
          const deliveryA = a.delivery || "";
          const deliveryB = b.delivery || "";
          return deliveryA.localeCompare(deliveryB) * direction;
        }
        case 'kilometer': {
          const kmA = parseFloat((a as any).kilometer) || 0;
          const kmB = parseFloat((b as any).kilometer) || 0;
          return (kmA - kmB) * direction;
        }
        case 'order': {
          const noA = a.no || 0;
          const noB = b.no || 0;
          return (noA - noB) * direction;
        }
        default:
          return 0;
      }
    });
    
    // Keep QL Kitchen at top if it exists and is active
    const qlKitchenIndex = sorted.findIndex(row => row.location === "QL Kitchen" && row.active !== false);
    if (qlKitchenIndex > 0) {
      const qlKitchenRow = sorted.splice(qlKitchenIndex, 1)[0];
      sorted.unshift(qlKitchenRow);
    }
    
    return sorted;
  })() : (() => {
    // Even without sorting, put inactive rows at the bottom
    const activeRows = rows.filter(row => row.active !== false);
    const inactiveRows = rows.filter(row => row.active === false);
    return [...activeRows, ...inactiveRows];
  })();

  // Calculate pagination
  const totalRows = sortedRows.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  // Reset to first page when page size changes
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "column") {
      const newColumnOrder = Array.from(columns);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);

      const columnIds = newColumnOrder.map((col) => col.id);
      onReorderColumns.mutate(columnIds);
    } else if (type === "row") {
      const newRowOrder = Array.from(rows);
      const [reorderedRow] = newRowOrder.splice(source.index, 1);
      newRowOrder.splice(destination.index, 0, reorderedRow);

      const rowIds = newRowOrder.map((row) => row.id);
      onReorderRows.mutate(rowIds);
    }
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      currencyDisplay: "symbol",
    })
      .format(num || 0)
      .replace("MYR", "RM");
  };

  const getCellValue = (
    row: TableRowType,
    column: TableColumn,
    rowIndex?: number,
  ) => {
    switch (column.dataKey) {
      case "id":
        return row.id.slice(0, 8).toUpperCase();
      case "no":
        // Show infinity icon for QL Kitchen row
        if (row.location === "QL Kitchen") {
          return "∞";
        }
        // Display sequential numbers (1, 2, 3...) based on position in table
        // This shows sequential numbers even if code has gaps
        if (rowIndex !== undefined) {
          const hasQLKitchenAtTop = paginatedRows[0]?.location === "QL Kitchen";
          return hasQLKitchenAtTop ? rowIndex : rowIndex + 1;
        }
        return row.no || 0;
      case "route":
        return row.route || "";
      case "code":
        return row.code || "";
      case "location":
        return row.location || "";
      case "delivery":
        return row.delivery || "";
      case "alt1":
        return (row as any).alt1 || "";
      case "alt2":
        return (row as any).alt2 || "";
      case "info":
        return row.info || "";
      case "tngSite":
        return row.tngSite || "";
      case "tngRoute":
        // Handle currency formatting for TnG column
        if (column.type === "currency") {
          const value = parseFloat(row.tngRoute || "0") || 0;
          return formatCurrency(value);
        }
        return row.tngRoute || "";
      case "destination":
        // Handle currency formatting for Destination column
        if (column.type === "currency") {
          const value = parseFloat(row.destination || "0") || 0;
          return formatCurrency(value);
        }
        return row.destination || "";
      case "images":
        const images = row.images || [];
        // Convert string arrays to ImageWithCaption format
        return images.map((img: any) =>
          typeof img === "string" ? { url: img, caption: "" } : img,
        );
      case "kilometer":
        // Use the kilometer value already calculated by parent component
        const kmValue = (row as any).kilometer;
        if (kmValue === "—" || kmValue === undefined || kmValue === null) {
          return "—";
        }
        if (typeof kmValue === "number") {
          if (kmValue === 0) {
            return "0.00 km";
          }
          return `${kmValue.toFixed(2)} km`;
        }
        return "—";
      default:
        // Handle dynamic columns - return empty value for new columns
        return (row as any)[column.dataKey] || "";
    }
  };

  const getDeliveryBadgeColor = (delivery: string) => {
    const colors: Record<string, string> = {
      "Same Day": "bg-transparent text-white",
      "Next Day": "bg-transparent text-white",
      "2-3 Days": "bg-transparent text-white",
      "3-5 Days": "bg-transparent text-white",
      Daily: "bg-transparent text-white",
      Weekday: "bg-transparent text-white",
      "Alternate 1": "bg-transparent text-white",
      "Alternate 2": "bg-transparent text-white",
    };
    return colors[delivery] || "bg-transparent text-white";
  };

  // Calculate totals based on currently visible filtered/searched data
  // The 'rows' prop already contains only the filtered data from the parent component
  const calculateColumnSum = (dataKey: string, columnType: string) => {
    if (dataKey === "no") {
      return rows.reduce((sum, row) => sum + (row.no || 0), 0);
    }
    if (columnType === "currency" && dataKey === "tngRoute") {
      return rows.reduce((sum, row) => {
        const value = parseFloat(row.tngRoute || "0") || 0;
        return sum + value;
      }, 0);
    }
    if (columnType === "currency" && dataKey === "destination") {
      return rows.reduce((sum, row) => {
        const value = parseFloat(row.destination || "0") || 0;
        return sum + value;
      }, 0);
    }
    if (columnType === "currency" && dataKey === "tollPrice") {
      return rows.reduce((sum, row) => {
        const value = parseFloat(row.tollPrice || "0") || 0;
        return sum + value;
      }, 0);
    }
    return 0;
  };

  const handleSortByCode = (direction: 'asc' | 'desc') => {
    // Sort rows by code column
    const sortedRows = [...rows].sort((a, b) => {
      const codeA = a.code || "";
      const codeB = b.code || "";

      // Handle numeric codes by parsing them
      const numA = parseInt(codeA) || 0;
      const numB = parseInt(codeB) || 0;

      // If both are numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === 'asc' ? numA - numB : numB - numA;
      }

      // Otherwise sort alphabetically
      return direction === 'asc' ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortBySortOrder = (direction: 'asc' | 'desc') => {
    // Sort rows by no field
    const sortedRows = [...rows].sort((a, b) => {
      const noA = a.no || 0;
      const noB = b.no || 0;
      return direction === 'asc' ? noA - noB : noB - noA;
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByDelivery = (direction: 'asc' | 'desc') => {
    // Sort rows by delivery column (A-Z or Z-A)
    const sortedRows = [...rows].sort((a, b) => {
      const deliveryA = a.delivery || "";
      const deliveryB = b.delivery || "";
      return direction === 'asc' ? deliveryA.localeCompare(deliveryB) : deliveryB.localeCompare(deliveryA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByLocation = (direction: 'asc' | 'desc') => {
    // Sort rows by location column (A-Z or Z-A)
    const sortedRows = [...rows].sort((a, b) => {
      const locationA = a.location || "";
      const locationB = b.location || "";
      return direction === 'asc' ? locationA.localeCompare(locationB) : locationB.localeCompare(locationA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByRoute = (direction: 'asc' | 'desc') => {
    // Sort rows by route column (A-Z or Z-A)
    const sortedRows = [...rows].sort((a, b) => {
      const routeA = a.route || "";
      const routeB = b.route || "";
      return direction === 'asc' ? routeA.localeCompare(routeB) : routeB.localeCompare(routeA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByKilometer = (direction: 'asc' | 'desc') => {
    // Sort rows by kilometer column (0-9 or 9-0)
    const sortedRows = [...rows].sort((a, b) => {
      const kmA = parseFloat((a as any).kilometer) || 0;
      const kmB = parseFloat((b as any).kilometer) || 0;
      return direction === 'asc' ? kmA - kmB : kmB - kmA;
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortToggle = (column: string) => {
    // Cycle through: null → asc → desc → null
    let newDirection: 'asc' | 'desc' | null = null;
    
    if (!sortState || sortState.column !== column) {
      // First click: set to ascending
      newDirection = 'asc';
    } else if (sortState.direction === 'asc') {
      // Second click: set to descending
      newDirection = 'desc';
    } else {
      // Third click: clear sort
      newDirection = null;
    }
    
    if (newDirection === null) {
      setSortState(null);
      // No need to reorder, just clear the state
      return;
    }
    
    setSortState({ column, direction: newDirection });
    
    // Apply the sort
    switch (column) {
      case "route":
        handleSortByRoute(newDirection);
        break;
      case "code":
        handleSortByCode(newDirection);
        break;
      case "delivery":
        handleSortByDelivery(newDirection);
        break;
      case "location":
        handleSortByLocation(newDirection);
        break;
      case "kilometer":
        handleSortByKilometer(newDirection);
        break;
      case "order":
        handleSortBySortOrder(newDirection);
        break;
      default:
        break;
    }
  };

  const handleDeleteClick = (rowId: string) => {
    setSelectedRowForDelete(rowId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRowForDelete) {
      onDeleteRow.mutate(selectedRowForDelete);
      setDeleteConfirmOpen(false);
      setSelectedRowForDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedRowForDelete(null);
  };

  // Filter toggle functions
  const toggleRouteFilter = (route: string) => {
    if (!onFilterValueChange) return;
    
    const newFilters = filterValue.includes(route)
      ? filterValue.filter(f => f !== route)
      : [...filterValue, route];
    onFilterValueChange(newFilters);
  };

  const toggleDeliveryFilter = (delivery: string) => {
    if (!onDeliveryFilterValueChange) return;
    
    const newFilters = deliveryFilterValue.includes(delivery)
      ? deliveryFilterValue.filter(f => f !== delivery)
      : [...deliveryFilterValue, delivery];
    onDeliveryFilterValueChange(newFilters);
  };

  return (
    <div
      className="glass-table rounded-xl border-none shadow-2xl table-container my-10"
      data-testid="data-table"
    >
      {/* Top Row: Entries (Left) and Customize Buttons (Right) */}
      <div className="px-6 py-3 border-b border-border/20 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/5 dark:via-transparent dark:to-blue-500/5 backdrop-blur-sm text-[10px]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>
        <div className="flex flex-row gap-3 items-center justify-between">
          
          {/* Left Side: Entries Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-muted-foreground pagination-10px">
              Show
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-6 px-2 pagination-button text-xs font-semibold [&>svg]:hidden w-auto min-w-[3rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                <SelectItem value="16" className="font-semibold">16</SelectItem>
                <SelectItem value="30" className="font-semibold">30</SelectItem>
                <SelectItem value="50" className="font-semibold">50</SelectItem>
                <SelectItem value="100" className="font-semibold">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground pagination-10px">
              of {totalRows} entries
            </span>
          </div>
          
          {/* Right Side: Customize and Other Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onShowCustomization}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 pagination-button"
              data-testid="button-show"
              title="Customize columns"
            >
              <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </Button>
            <Button
              onClick={onOptimizeRoute}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 pagination-button"
              data-testid="button-optimize-route"
              title="Optimize delivery route with AI"
            >
              <Route className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </Button>
            <Button
              onClick={onShareTable}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 pagination-button"
              data-testid="button-share-table"
              title="Share current table view"
            >
              <Share2 className="w-3 h-3 text-green-500 dark:text-green-400" />
            </Button>
          </div>
        </div>
        
      </div>
      {/* Bottom Row: Sort/Filter/Clear (Left) and Search (Right) */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-border/20 bg-background/30">
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sort Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-6 px-2 pagination-button text-xs justify-start"
                data-testid="sort-trigger"
              >
                {sortState && (
                  <>
                    {sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                    <span className="hidden sm:inline">
                      {sortState.column === 'route' && 'Route'}
                      {sortState.column === 'code' && 'Code'}
                      {sortState.column === 'location' && 'Location'}
                      {sortState.column === 'delivery' && 'Delivery'}
                      {sortState.column === 'kilometer' && 'Km'}
                      {sortState.column === 'order' && 'No'}
                    </span>
                    <span className="sm:hidden">Sort</span>
                  </>
                )}
                {!sortState && (
                  <>
                    <ArrowUpDown className="w-3 h-3 mr-1 opacity-50" />
                    <span>Sort</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0" align="start">
              <div className="p-3 btn-glass">
                <h4 className="font-medium text-sm mb-3 pb-2 border-b border-border/20 flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  Sort By
                </h4>
                <div className="space-y-1.5 text-sm">
                  <Button
                    variant={sortState?.column === 'route' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'route' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('route')}
                    data-testid="button-sort-route"
                  >
                    <span>Route</span>
                    {sortState?.column === 'route' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'route' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'code' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'code' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('code')}
                    data-testid="button-sort-code"
                  >
                    <span>Code</span>
                    {sortState?.column === 'code' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'code' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'location' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'location' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('location')}
                    data-testid="button-sort-location"
                  >
                    <span>Location</span>
                    {sortState?.column === 'location' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'location' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'delivery' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'delivery' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('delivery')}
                    data-testid="button-sort-delivery"
                  >
                    <span>Delivery</span>
                    {sortState?.column === 'delivery' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'delivery' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'kilometer' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'kilometer' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('kilometer')}
                    data-testid="button-sort-kilometer"
                  >
                    <span>Kilometer</span>
                    {sortState?.column === 'kilometer' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'kilometer' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  {isFiltered && (
                    <Button
                      variant={sortState?.column === 'order' ? 'default' : 'ghost'}
                      size="sm"
                      className={`w-full justify-between text-xs ${
                        sortState?.column === 'order' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                      }`}
                      onClick={() => handleSortToggle('order')}
                      data-testid="button-sort-order"
                    >
                      <span>No</span>
                      {sortState?.column === 'order' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      {sortState?.column !== 'order' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Combined Filter Section */}
          <div className="w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-6 px-2 pagination-button text-xs justify-start" data-testid="combined-filter-trigger">
                  <span className="hidden sm:inline">
                    {filterValue.length === 0 && deliveryFilterValue.length === 0 
                      ? "🔍 Filters" 
                      : `📍 ${filterValue.length} • 🚫 ${deliveryFilterValue.length}`}
                  </span>
                  <span className="sm:hidden">
                    {filterValue.length === 0 && deliveryFilterValue.length === 0 
                      ? "🔍" 
                      : `📍${filterValue.length} 🚫${deliveryFilterValue.length}`}
                  </span>
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="space-y-4 p-4 text-sm btn-glass">
                {/* Routes Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-accent" />
                      Routes ({filterValue.length} selected)
                    </h4>
                    {filterValue.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => onFilterValueChange?.([])} className="h-auto p-1 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2 bg-background/50">
                    {routeOptions.map(route => (
                      <div key={route} className="flex items-center space-x-2">
                        <Checkbox
                          id={`route-${route}`}
                          checked={filterValue.includes(route)}
                          onCheckedChange={() => toggleRouteFilter(route)}
                        />
                        <Label htmlFor={`route-${route}`} className="text-xs cursor-pointer">
                          📍 {route}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Separator */}
                <div className="border-t border-border/20"></div>
                
                {/* Trips Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Filter className="w-3 h-3 text-orange-500" />
                      Hide Deliveries ({deliveryFilterValue.length} hidden)
                    </h4>
                    {deliveryFilterValue.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => onDeliveryFilterValueChange?.([])} className="h-auto p-1 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2 bg-background/50">
                    {deliveryOptions.map(delivery => (
                      <div key={delivery} className="flex items-center space-x-2">
                        <Checkbox
                          id={`delivery-${delivery}`}
                          checked={deliveryFilterValue.includes(delivery)}
                          onCheckedChange={() => toggleDeliveryFilter(delivery)}
                        />
                        <Label htmlFor={`delivery-${delivery}`} className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs cursor-pointer font-medium">
                          🚫 {delivery}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          </div>
          
          {/* Clear All Section */}
          {(searchTerm || filterValue.length > 0 || deliveryFilterValue.length > 0) && (
            <Button
              onClick={onClearAllFilters}
              variant="outline"
              size="sm"
              className="h-6 px-2 pagination-button text-xs border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
              data-testid="clear-all-filters"
            >
              <span className="hidden sm:inline bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">Clear</span>
              <span className="sm:hidden bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">Clear</span>
            </Button>
          )}
        </div>
        
        {/* Right Side: Search Input */}
        <div className="flex-1 max-w-[30%] lg:max-w-md ml-auto flex items-center gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-4 text-muted-foreground group-hover:text-info transition-colors" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange?.(e.target.value)}
              className="pl-7 pr-7 h-8 bg-background text-foreground placeholder:text-muted-foreground border-2 border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-sm"
              data-testid="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchTermChange?.('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-0.5 w-5 h-5 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center"
                data-testid="clear-search"
                aria-label="Clear search"
              >
                <X className="w-2.5 h-2.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {(searchTerm || filterValue.length > 0 || deliveryFilterValue.length > 0) && (
        <div className="px-6 py-2 border-b border-border/20 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/5 dark:via-transparent dark:to-blue-500/5">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-muted-foreground font-medium text-xs">Active:</span>
            {searchTerm && (
              <div className="flex items-center gap-0.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs">
                <Search className="w-2.5 h-2.5" />
                <span>"{searchTerm}"</span>
                <button onClick={() => onSearchTermChange?.('')} className="ml-0.5 p-0.5 hover:text-primary/70 flex items-center justify-center rounded-full hover:bg-primary/10" aria-label="Remove text filter">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            {filterValue.map(route => (
              <div key={route} className="flex items-center gap-0.5 px-2 py-0.5 bg-transparent border border-transparent rounded-full text-gray-400 text-xs">
                <Filter className="w-2.5 h-2.5" />
                <span>{route}</span>
                <button onClick={() => toggleRouteFilter(route)} className="ml-0.5 p-0.5 hover:text-red-600 flex items-center justify-center rounded-full hover:bg-red-500/10" aria-label={`Remove route filter: ${route}`}>
                  <X className="w-2.5 h-2.5 text-red-500" />
                </button>
              </div>
            ))}
            {deliveryFilterValue.map(delivery => (
              <div key={delivery} className="flex items-center gap-0.5 px-2 py-0.5 bg-transparent border border-transparent rounded-full text-gray-400 text-xs">
                <Filter className="w-2.5 h-2.5" />
                <span>{delivery}</span>
                <button onClick={() => toggleDeliveryFilter(delivery)} className="ml-0.5 p-0.5 hover:text-red-600 flex items-center justify-center rounded-full hover:bg-red-500/10" aria-label={`Remove delivery filter: ${delivery}`}>
                  <X className="w-2.5 h-2.5 text-red-500" />
                </button>
              </div>
            ))}
            <div className="ml-auto text-muted-foreground text-xs">
              {filteredRowsCount} of {totalRowsCount} results
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto w-full">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table className="min-w-full">
            <TableHeader className="table-header-glass sticky top-0 z-20 bg-white dark:bg-slate-900 border-b-2 border-yellow-400/30">
              <Droppable
                droppableId="columns"
                direction="horizontal"
                type="column"
              >
                {(provided) => (
                  <TableRow
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {visibleColumns.map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided) => (
                          <TableHead
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="px-8 py-3 text-center table-header-footer-12px font-medium text-blue-700 dark:text-blue-300 tracking-wide border-b border-border sticky top-0 bg-white dark:bg-slate-900 shadow-sm whitespace-nowrap"
                            style={{
                              textAlign: "center",
                              textDecoration: "normal",
                              fontSize: "10px",
                              ...(column.dataKey === "location" && {
                                minWidth: `${120 + 15}px`,
                              }),
                            }}
                            colSpan={column.dataKey === "location" ? 3 : 1}
                            data-testid={`column-header-${column.dataKey}`}
                          >
                            <ColumnHeader
                              column={column}
                              dragHandleProps={provided.dragHandleProps}
                              onDelete={() => onDeleteColumn.mutate(column.id)}
                              isAuthenticated={isAuthenticated}
                              editMode={editMode}
                            />
                          </TableHead>
                        )}
                      </Draggable>
                    ))}
                    <TableHead
                      className="px-8 py-3 text-center table-header-footer-12px font-semibold tracking-wide border-b border-border sticky top-0 bg-white dark:bg-slate-900 shadow-sm whitespace-nowrap"
                      style={{
                        textAlign: "center",
                        textDecoration: "normal",
                        fontSize: "10px",
                      }}
                    >
                      <span className="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                        Actions
                      </span>
                    </TableHead>
                    {provided.placeholder}
                  </TableRow>
                )}
              </Droppable>
            </TableHeader>
            <Droppable droppableId="rows" type="row">
              {(provided) => (
                <TableBody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="pt-2 motion-layer zoom-in"
                  key={`page-${currentPage}`}
                >
                  {isLoading
                    ? Array.from({ length: Math.min(pageSize, 5) }).map(
                        (_, index) => (
                          <tr
                            key={`skeleton-${index}`}
                            className={`skeleton-row fade-in-stagger odd:bg-white dark:odd:bg-gray-900/50 even:bg-blue-50/50 dark:even:bg-blue-900/20 backdrop-blur-sm hover:bg-muted/60 table-cell-unique-transition`}
                          >
                            {/* Actions column */}
                            <td className="p-3 w-16">
                              <div className="flex gap-3 justify-center">
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-gray-500/20 to-slate-500/20 animate-pulse" />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" style={{animationDelay: "0.1s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse" style={{animationDelay: "0.2s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-yellow-500/20 to-green-500/20 animate-pulse" style={{animationDelay: "0.3s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-red-500/20 to-yellow-500/20 animate-pulse" style={{animationDelay: "0.4s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 animate-pulse" style={{animationDelay: "0.5s"}} />
                              </div>
                            </td>

                            {/* Dynamic columns - cleaner skeleton */}
                            {visibleColumns.map((column) => (
                              <td
                                key={column.id}
                                className="p-3"
                                colSpan={column.dataKey === "location" ? 3 : 1}
                              >
                                {column.dataKey === "images" ? (
                                  <div className="skeleton w-12 h-8 rounded mx-auto bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                                ) : column.dataKey === "delivery" ? (
                                  <div className="skeleton w-16 h-6 rounded-full mx-auto bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-pulse" />
                                ) : column.dataKey === "location" ? (
                                  <div className="skeleton w-32 h-4 mx-auto bg-gradient-to-r from-yellow-400/20 to-green-400/20 animate-pulse" />
                                ) : (
                                  <div className="skeleton w-20 h-4 mx-auto bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ),
                      )
                    : paginatedRows.map((row, index) => (
                        <Draggable
                          key={row.id}
                          draggableId={row.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`table-row-glass group ${
                                row.active === false
                                  ? "bg-gray-100/60 dark:bg-gray-800/40 opacity-50"
                                  : row.location === "QL Kitchen" 
                                    ? "bg-gradient-to-r from-gray-100/80 to-slate-100/80 dark:from-gray-800/60 dark:to-slate-800/60" 
                                    : "odd:bg-white dark:odd:bg-gray-900/50 even:bg-blue-50/50 dark:even:bg-blue-900/20"
                              } hover:bg-blue-100/60 dark:hover:bg-blue-800/30 table-cell-unique-transition ${
                                snapshot.isDragging ? "drag-elevate" : ""
                              }`}
                              data-testid={`table-row-${row.id}`}
                            >
                              {visibleColumns.map((column) => (
                                <TableCell
                                  key={column.id}
                                  className="p-4 align-middle [&:has([role=checkbox])]:pr-0 px-6 py-3 table-cell-10px text-center text-[12px] bg-transparent text-foreground whitespace-nowrap font-normal table-zoom-in"
                                  style={{
                                    minWidth: "100px",
                                    ...(column.dataKey === "location" && {
                                      minWidth: `${120 + 15}px`,
                                      fontSize: "10px",
                                    }),
                                    ...(column.dataKey === "delivery" && {
                                      minWidth: "110px",
                                      fontSize: "10px",
                                      fontWeight: "normal",
                                    }),
                                    ...(column.dataKey === "id" && {
                                      minWidth: "120px",
                                    }),
                                    ...(column.dataKey === "code" && {
                                      minWidth: "100px",
                                    }),
                                    ...(column.dataKey === "route" && {
                                      minWidth: "90px",
                                    }),
                                    ...(column.dataKey === "no" && {
                                      minWidth: "70px",
                                    }),
                                    ...(column.dataKey === "kilometer" && {
                                      minWidth: "80px",
                                    }),
                                    ...(column.dataKey === "tollPrice" && {
                                      minWidth: "90px",
                                    }),
                                    ...(column.dataKey === "tngRoute" && {
                                      minWidth: "90px",
                                    }),
                                    ...(column.dataKey === "images" && {
                                      minWidth: "120px",
                                    }),
                                    ...(column.type === "currency" && !column.dataKey.match(/tollPrice|tngRoute/) && {
                                      minWidth: "100px",
                                    }),
                                  }}
                                  colSpan={
                                    column.dataKey === "location" ? 3 : 1
                                  }
                                  data-testid={`cell-${row.id}-${column.dataKey}`}
                                >
                                  <div className="w-[98%] mx-auto text-center">
                                  {column.dataKey === "images" ? (
                                    <ImagePreview
                                      images={row.images}
                                      rowId={row.id}
                                      onAddImage={() =>
                                        onSelectRowForImage(row.id)
                                      }
                                      editMode={editMode}
                                      onAccessDenied={() =>
                                        onSelectRowForImage("access-denied")
                                      }
                                    />
                                  ) : column.dataKey === "info" ? (
                                    row.info && row.info.trim() ? (
                                      <InfoModal
                                        info={row.info}
                                        rowId={row.id}
                                        code={row.code}
                                        route={row.route}
                                        location={row.location}
                                        latitude={row.latitude ? String(row.latitude) : undefined}
                                        longitude={row.longitude ? String(row.longitude) : undefined}
                                        qrCode={row.qrCode || undefined}
                                        no={row.no}
                                        onUpdateRow={(updates) =>
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates,
                                          })
                                        }
                                        editMode={false}
                                        allRows={rows}
                                        iconType="info"
                                      />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )
                                  ) : column.dataKey === "delivery" ? (
                                    editMode && column.isEditable === "true" ? (
                                      <EditableCell
                                        value={getCellValue(row, column, index)}
                                        type="text"
                                        dataKey={column.dataKey}
                                        onSave={(value) =>
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates: {
                                              [column.dataKey]: value,
                                            },
                                          })
                                        }
                                      />
                                    ) : (
                                      <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                                        {getCellValue(row, column, index) || '—'}
                                      </span>
                                    )
                                  ) : column.dataKey === "id" ? (
                                    <span className="font-mono text-slate-600 dark:text-slate-300" style={{ fontSize: '10px' }}>
                                      {getCellValue(row, column, index)}
                                    </span>
                                  ) : column.dataKey === "no" && editMode && row.location !== "QL Kitchen" ? (
                                    <EditableCell
                                      value={String(row.no || 0)}
                                      type="number"
                                      dataKey={column.dataKey}
                                      onSave={(value) =>
                                        onUpdateRow.mutate({
                                          id: row.id,
                                          updates: { no: parseInt(value) || 0 },
                                        })
                                      }
                                    />
                                  ) : editMode &&
                                    column.isEditable === "true" ? (
                                    <EditableCell
                                      value={getCellValue(row, column, index)}
                                      type={column.type}
                                      options={column.options || undefined}
                                      dataKey={column.dataKey}
                                      onSave={(value) =>
                                        onUpdateRow.mutate({
                                          id: row.id,
                                          updates: { [column.dataKey]: value },
                                        })
                                      }
                                    />
                                  ) : (
                                    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                                      {column.dataKey === "kilometer" ? (
                                        <MobileTooltip
                                          content={(() => {
                                            const segmentDistance = (row as any).segmentDistance;
                                            if (segmentDistance && typeof segmentDistance === "number" && segmentDistance > 0) {
                                              return `${segmentDistance.toFixed(2)} km`;
                                            }
                                            return "Starting point";
                                          })()}
                                          showBelow={index === 0 && index !== paginatedRows.length - 1}
                                        >
                                          <span className="cursor-help">
                                            {getCellValue(row, column, index)}
                                          </span>
                                        </MobileTooltip>
                                      ) : (
                                        getCellValue(row, column, index)
                                      )}
                                    </span>
                                  )}
                                  </div>
                                </TableCell>
                              ))}
                              <TableCell
                                className="px-4 py-2 text-sm text-center text-foreground"
                                style={{ textAlign: "center" }}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  {editMode && (
                                    <span className="text-xs text-muted-foreground opacity-70" style={{fontSize: '8px'}}>
                                      #{row.sortOrder || (startIndex + index + 1)}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className={`p-2 rounded ${
                                        snapshot.isDragging ? "cursor-grabbing" : editMode ? "cursor-grab" : "cursor-default"
                                      } text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all`}
                                      title={editMode ? "Drag to reorder" : ""}
                                      data-testid={`drag-handle-${row.id}`}
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {editMode && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-blue-400 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-400 ${
                                            onUpdateRow.isPending &&
                                            onUpdateRow.variables?.id === row.id
                                              ? "mutation-loading"
                                              : ""
                                          }`}
                                          onClick={() => {
                                            if (editMode) {
                                              onSelectRowForImage(row.id);
                                            } else {
                                              onSelectRowForImage(
                                                "access-denied",
                                              );
                                            }
                                          }}
                                          disabled={
                                            onUpdateRow.isPending &&
                                            onUpdateRow.variables?.id === row.id
                                          }
                                          data-testid={`button-add-image-${row.id}`}
                                          title="Add image"
                                        >
                                          {onUpdateRow.isPending &&
                                          onUpdateRow.variables?.id === row.id ? (
                                            <InlineLoading />
                                          ) : (
                                            <PlusCircle className="w-4 h-4" />
                                          )}
                                        </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className={`bg-transparent border-transparent hover:bg-transparent hover:border-transparent ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : "text-blue-400 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-400"} ${
                                          onDeleteRow.isPending &&
                                          onDeleteRow.variables === row.id
                                            ? "mutation-loading"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          isAuthenticated &&
                                          handleDeleteClick(row.id)
                                        }
                                        disabled={
                                          !isAuthenticated ||
                                          (onDeleteRow.isPending &&
                                            onDeleteRow.variables === row.id)
                                        }
                                        data-testid={`button-delete-row-${row.id}`}
                                        title={
                                          !isAuthenticated
                                            ? "Authentication required to delete rows"
                                            : "Delete row"
                                        }
                                      >
                                        {onDeleteRow.isPending &&
                                        onDeleteRow.variables === row.id ? (
                                          <InlineLoading type="particles" />
                                        ) : (
                                          <Trash className="w-4 h-4" />
                                        )}
                                      </Button>
                                      </>
                                    )}
                                    <InfoModal
                                      info={row.info || ""}
                                      rowId={row.id}
                                      code={row.code}
                                      route={row.route}
                                      location={row.location}
                                      latitude={row.latitude ? String(row.latitude) : undefined}
                                      longitude={row.longitude ? String(row.longitude) : undefined}
                                      qrCode={row.qrCode || undefined}
                                      no={row.no}
                                      onUpdateRow={(updates) =>
                                        onUpdateRow.mutate({
                                          id: row.id,
                                          updates,
                                        })
                                      }
                                      editMode={editMode}
                                      allRows={rows}
                                      iconType={editMode ? "filetext" : "info"}
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`bg-transparent border-transparent hover:bg-transparent hover:border-transparent ${
                                        row.active !== false
                                          ? "text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-500"
                                          : "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
                                      } ${
                                        onUpdateRow.isPending &&
                                        onUpdateRow.variables?.id === row.id
                                          ? "mutation-loading"
                                          : ""
                                      } ${!editMode ? "opacity-50 cursor-not-allowed" : ""}`}
                                      onClick={() => {
                                        if (editMode) {
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates: { active: row.active === false ? true : false },
                                          });
                                        }
                                      }}
                                      disabled={
                                        !editMode ||
                                        (onUpdateRow.isPending &&
                                        onUpdateRow.variables?.id === row.id)
                                      }
                                      data-testid={`button-toggle-active-${row.id}`}
                                      title={
                                        !editMode
                                          ? "Enable edit mode to toggle row status"
                                          : row.active !== false
                                          ? "Deactivate row"
                                          : "Activate row"
                                      }
                                    >
                                      <Power className="w-4 h-4" />
                                    </Button>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
            <tfoot>
              <TableRow>
                {visibleColumns.map((column, index) => (
                  <TableCell
                    key={column.id}
                    className="px-6 py-3 text-center table-header-footer-12px font-semibold tracking-wide border-t border-border sticky bottom-0 bg-white dark:bg-slate-900 shadow-sm whitespace-nowrap"
                    style={{
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                    colSpan={column.dataKey === "location" ? 3 : 1}
                  >
                    {index === 0 ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent" style={{fontSize: '11px'}}>Totals</span>
                    ) : column.dataKey === "no" ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">—</span>
                    ) : column.dataKey === "tngRoute" &&
                      column.type === "currency" ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        {formatCurrency(
                          calculateColumnSum("tngRoute", column.type),
                        )}
                      </span>
                    ) : column.dataKey === "tollPrice" &&
                      column.type === "currency" ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        {formatCurrency(
                          calculateColumnSum("tollPrice", column.type),
                        )}
                      </span>
                    ) : (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">—</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="px-6 py-3 text-center table-header-footer-12px font-semibold tracking-wide border-t border-border sticky bottom-0 bg-white dark:bg-slate-900 shadow-sm text-foreground whitespace-nowrap" style={{ textAlign: "center", fontSize: '10px' }}>
                  <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">—</span>
                </TableCell>
              </TableRow>
            </tfoot>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-blue-200 dark:border-blue-500/20 transition-smooth-fast">
            <div></div>

            <div className="flex items-center gap-1.5">
              {/* Only show First button if not on first page */}
              {currentPage > 1 && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => goToPage(1)}
                  className="pagination-button"
                  data-testid="button-first-page"
                >
                  <ChevronsLeft className="h-3 w-3" />
                </Button>
              )}

              <div className="flex items-center gap-1">
                {(() => {
                  // Calculate sliding window of 5 pages
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + 4);

                  // Adjust if we're near the end
                  if (endPage - startPage < 4 && totalPages >= 5) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  const pages = [];
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  return pages.map((pageNum) => {
                    const isCurrentPage = pageNum === currentPage;

                    return (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="xs"
                        onClick={() => goToPage(pageNum)}
                        className={`pagination-button page-number ${
                          isCurrentPage ? "active" : ""
                        }`}
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  });
                })()}
              </div>

              {/* Only show Last button if not on last page */}
              {currentPage < totalPages && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => goToPage(totalPages)}
                  className="pagination-button"
                  data-testid="button-last-page"
                >
                  <ChevronsRight className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </DragDropContext>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] transition-smooth-fast">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this row? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tutorial - Hide in shared view */}
      {isAuthenticated !== false && <Tutorial editMode={editMode} />}
    </div>
  );
}
