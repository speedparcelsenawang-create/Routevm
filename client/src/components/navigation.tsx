import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Save, DoorOpen, Rows, Receipt, Layout, Sun, Moon, Bookmark, Plus, ChevronDown } from "lucide-react";
import { AddColumnModal } from "./add-column-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  editMode?: boolean;
  onEditModeRequest?: () => void;
  onShowCustomization?: () => void;
  onAddRow?: () => void;
  onSaveData?: () => void;
  onGenerateTng?: () => void;
  onAddColumn?: (columnData: { name: string; dataKey: string; type: string; options?: string[] }) => Promise<void>;
  onOptimizeRoute?: () => void;
  onCalculateTolls?: () => void;
  onSaveLayout?: () => void;
  onSavedLinks?: () => void;
  isAuthenticated?: boolean;
  theme?: string;
  onToggleTheme?: () => void;
}

export function Navigation({ editMode, onEditModeRequest, onShowCustomization, onAddRow, onSaveData, onGenerateTng, onAddColumn, onOptimizeRoute, onCalculateTolls, onSaveLayout, onSavedLinks, isAuthenticated, theme, onToggleTheme }: NavigationProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between text-[12px]">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white">
                <Database className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-600 dark:text-slate-300" style={{ fontSize: '14px' }}>
                  {editMode ? "Edit Mode" : "Route Management"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  {formatDateTime(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button
              onClick={onSavedLinks}
              variant="outline"
              size="sm"
              className="btn-glass w-8 h-8 md:w-28 md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 active:shadow-none"
              data-testid="button-saved-links"
              title="View saved share links"
            >
              <Bookmark className="w-3 h-3 text-amber-500 dark:text-amber-400 transition-all duration-300 group-hover:scale-110" />
              <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Link</span>
            </Button>
            <Button
              onClick={onToggleTheme}
              variant="outline"
              size="sm"
              className="btn-glass w-8 h-8 md:w-20 md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 active:shadow-none"
              data-testid="button-toggle-theme"
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3 h-3 text-yellow-500 transition-all duration-300 group-hover:rotate-180" />
                  <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-blue-500 transition-all duration-300 group-hover:-rotate-12" />
                  <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Dark</span>
                </>
              )}
            </Button>
            {editMode ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-glass w-8 h-8 md:w-24 md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 active:shadow-none animate-in fade-in-0 slide-in-from-left-2 duration-300"
                    data-testid="button-edit-menu"
                  >
                    <Settings className="w-3 h-3 text-red-900 dark:text-red-400 transition-all duration-300 group-hover:rotate-90" />
                    <span className="hidden md:inline ml-1 text-xs transition-all duration-300">Edit</span>
                    <ChevronDown className="w-3 h-3 ml-1 hidden md:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-2xl"
                >
                  <DropdownMenuItem 
                    onClick={onAddRow}
                    className="cursor-pointer"
                    data-testid="menu-add-row"
                  >
                    <Rows className="w-4 h-4 mr-2" />
                    <span style={{fontSize: '10px'}}>Add Row</span>
                  </DropdownMenuItem>
                  {onAddColumn && (
                    <DropdownMenuItem 
                      onClick={() => {
                        // Trigger add column modal
                        const addColumnButton = document.querySelector('[data-testid="button-add-column"]') as HTMLButtonElement;
                        if (addColumnButton) addColumnButton.click();
                      }}
                      className="cursor-pointer"
                      data-testid="menu-add-column"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span style={{fontSize: '10px'}}>Add Column</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem 
                    onClick={onEditModeRequest}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    data-testid="menu-exit-edit"
                  >
                    <DoorOpen className="w-4 h-4 mr-2" />
                    <span style={{fontSize: '10px'}}>Exit Edit Mode</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onEditModeRequest}
                variant="outline"
                size="sm"
                className="btn-glass w-8 h-8 md:w-20 md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 active:shadow-none"
                data-testid="button-edit-mode"
                title="Enter edit mode"
              >
                <Settings className="w-3 h-3 text-red-900 dark:text-red-400 transition-all duration-300 group-hover:rotate-90" />
                <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Edit</span>
              </Button>
            )}
            {/* Hidden Add Column Modal - triggered from dropdown */}
            {editMode && onAddColumn && (
              <div className="hidden">
                <AddColumnModal
                  onCreateColumn={onAddColumn}
                  disabled={!isAuthenticated}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}