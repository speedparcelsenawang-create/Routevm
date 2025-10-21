import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GripVertical, RotateCcw, X, CheckCheck, Columns3 } from "lucide-react";
import { TableColumn } from "@shared/schema";

interface ColumnCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: TableColumn[];
  visibleColumns: string[];
  onApplyChanges: (visibleColumns: string[], columnOrder: string[]) => void;
  editMode?: boolean;
}

interface ColumnItem {
  id: string;
  name: string;
  dataKey: string;
  visible: boolean;
  isCore: boolean;
}

export function ColumnCustomizationModal({
  open,
  onOpenChange,
  columns,
  visibleColumns,
  onApplyChanges,
  editMode = false,
}: ColumnCustomizationModalProps) {
  const [localColumns, setLocalColumns] = useState<ColumnItem[]>([]);
  const [originalColumns, setOriginalColumns] = useState<ColumnItem[]>([]);

  // Core columns that cannot be hidden (using column names since Action is UI-only)
  const coreColumnNames = ['ID', 'No', 'Route', 'Code', 'Location', 'Delivery', 'Destination'];

  useEffect(() => {
    if (columns.length > 0) {
      const columnsToHide = editMode 
        ? ['longitude', 'latitude', 'tollPrice'] // In edit mode, hide longitude, latitude, and tollPrice
        : ['longitude', 'latitude', 'info', 'tollPrice']; // In view mode, also hide info column and tollPrice
      
      const columnItems: ColumnItem[] = columns
        .filter(column => !columnsToHide.includes(column.dataKey))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(column => ({
          id: column.id,
          name: column.name,
          dataKey: column.dataKey,
          visible: visibleColumns.includes(column.id),
          isCore: coreColumnNames.includes(column.name),
        }));
      setLocalColumns(columnItems);
      setOriginalColumns(columnItems);
    }
  }, [columns, visibleColumns, editMode]);

  const handleToggleVisibility = (columnId: string) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(localColumns);
    const [reorderedItem] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, reorderedItem);

    setLocalColumns(reorderedColumns);
  };

  const handleApply = () => {
    const visibleIds = localColumns.filter(col => col.visible).map(col => col.id);
    const columnOrder = localColumns.map(col => col.id);
    onApplyChanges(visibleIds, columnOrder);
    onOpenChange(false);
  };

  const handleReset = () => {
    const columnsToHide = editMode 
      ? ['longitude', 'latitude', 'tollPrice'] // In edit mode, hide longitude, latitude, and tollPrice
      : ['longitude', 'latitude', 'info', 'tollPrice']; // In view mode, also hide info column and tollPrice
    
    const resetColumns = columns
      .filter(column => !columnsToHide.includes(column.dataKey))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(column => ({
        id: column.id,
        name: column.name,
        dataKey: column.dataKey,
        visible: true, // Show all columns by default
        isCore: coreColumnNames.includes(column.name),
      }));
    setLocalColumns(resetColumns);
  };

  const visibleCount = localColumns.filter(col => col.visible).length;

  // Check if there are changes compared to original state
  const hasChanges = () => {
    if (localColumns.length !== originalColumns.length) return true;
    if (originalColumns.length === 0) return false; // No changes if no original data
    
    // Check visibility changes - compare by ID to handle order changes
    for (const currentCol of localColumns) {
      const originalCol = originalColumns.find(col => col.id === currentCol.id);
      if (!originalCol || originalCol.visible !== currentCol.visible) {
        return true;
      }
    }
    
    // Check order changes
    const originalOrder = originalColumns.map(col => col.id);
    const currentOrder = localColumns.map(col => col.id);
    
    if (originalOrder.length !== currentOrder.length) return true;
    
    for (let i = 0; i < originalOrder.length; i++) {
      if (originalOrder[i] !== currentOrder[i]) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl transition-smooth">
        {/* iOS Frosted Glass Layer */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl border-0 shadow-inner" />
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Columns3 className="w-6 h-6" />
            Customize Columns
            <span className="text-sm text-muted-foreground font-normal">
              ({visibleCount} of {localColumns.length} visible)
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Toggle column visibility and drag to reorder them in your table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="column-customization">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-80 overflow-y-auto"
                >
                  {localColumns.map((column, index) => (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors ${
                            snapshot.isDragging ? 'shadow-lg border-blue-500 dark:border-blue-400' : 'border-border'
                          } ${!column.visible ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <Label
                              htmlFor={`column-${column.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {column.name}
                            </Label>
                          </div>
                          <Switch
                            id={`column-${column.id}`}
                            checked={column.visible}
                            onCheckedChange={() => handleToggleVisibility(column.id)}
                            disabled={column.isCore && column.visible && visibleCount <= 1}
                            data-testid={`switch-column-${column.dataKey}`}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="text-sm bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <strong className="text-blue-900 dark:text-blue-100">Tip:</strong> At least one column must remain visible. Core columns are recommended to stay visible for the best experience.
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
              className="w-8 h-8 p-0"
              data-testid="button-reset-columns"
              title="Reset columns"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
              className="w-8 h-8 p-0"
              data-testid="button-cancel-customize"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleApply} 
              size="sm" 
              className={`w-8 h-8 p-0 transition-all duration-200 ${hasChanges() ? 'bg-transparent border border-border/50 text-green-500 hover:text-green-400 hover:bg-green-500/10' : 'bg-transparent border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background/50'}`} 
              data-testid="button-apply-customize" 
              title="Apply changes"
            >
              <CheckCheck className="w-4 h-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}