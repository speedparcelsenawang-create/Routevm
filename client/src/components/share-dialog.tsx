import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableState: {
    filters: {
      searchTerm: string;
      routeFilters: string[];
      deliveryFilters: string[];
    };
    sorting: {
      column: string;
      direction: 'asc' | 'desc';
    } | null;
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
  };
}

export function ShareDialog({ open, onOpenChange, tableState }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareId, setShareId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const generateShareUrl = async () => {
    setIsGenerating(true);
    try {
      // Generate a unique 6-character share ID
      const generatedShareId = Math.random().toString(36).substring(2, 8);
      
      // Create shared state via API
      const response = await apiRequest("POST", "/api/share-table", {
        shareId: generatedShareId,
        tableState,
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      // Generate the shareable URL
      const url = `${window.location.origin}/share/${generatedShareId}`;
      setShareUrl(url);
      setShareId(generatedShareId);
      
      toast({
        title: "Share link created",
        description: "Your table view has been saved and can now be shared.",
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveShareLink = async () => {
    setIsSaving(true);
    try {
      const response = await apiRequest("POST", "/api/saved-share-links", {
        shareId,
        url: shareUrl,
        remark: "",
      });

      if (!response.ok) {
        throw new Error("Failed to save share link");
      }

      setIsSaved(true);
      toast({
        title: "Link saved!",
        description: "Share link has been added to your saved links.",
      });
    } catch (error) {
      console.error("Error saving share link:", error);
      toast({
        title: "Error",
        description: "Failed to save share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setShareUrl("");
      setShareId("");
      setCopied(false);
      setIsSaved(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] animate-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 duration-300 transition-all bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl">
        {/* iOS Frosted Glass Layer */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl border-0 shadow-inner" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle>Share Table View</DialogTitle>
          <DialogDescription>
            Create a shareable link for the current table state including filters, sorting, and visible columns.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 relative z-10">
          {!shareUrl ? (
            <Button
              onClick={generateShareUrl}
              disabled={isGenerating}
              className="w-full bg-transparent text-blue-500 hover:bg-blue-500/10 border-transparent backdrop-blur-sm"
              data-testid="button-generate-share-link"
            >
              {isGenerating ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-white/10 dark:bg-black/10 backdrop-blur-sm border-transparent"
                  data-testid="input-share-url"
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="shrink-0 bg-transparent border-transparent hover:bg-blue-500/10 backdrop-blur-sm"
                  data-testid="button-copy-share-link"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={saveShareLink}
                  size="sm"
                  variant={isSaved ? "default" : "outline"}
                  className="shrink-0 bg-transparent border-transparent hover:bg-blue-500/10 backdrop-blur-sm"
                  disabled={isSaving || isSaved}
                  data-testid="button-save-share-link"
                  title={isSaved ? "Link saved" : "Save link"}
                >
                  {isSaved ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view your table with the current filters and settings.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="relative z-10">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="bg-transparent border-transparent text-red-500 hover:bg-red-500/10 backdrop-blur-sm"
            data-testid="button-cancel-share"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
