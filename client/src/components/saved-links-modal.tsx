import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit, ExternalLink, Copy, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SavedShareLink } from "@shared/schema";

interface SavedLinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SavedLinksModal({ open, onOpenChange }: SavedLinksModalProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<SavedShareLink | null>(null);
  const [remark, setRemark] = useState("");
  const { toast } = useToast();

  const { data: savedLinks = [], isLoading } = useQuery<SavedShareLink[]>({
    queryKey: ["/api/saved-share-links"],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/saved-share-links/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete saved link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-share-links"] });
      setDeleteDialogOpen(false);
      setSelectedLink(null);
      toast({
        title: "Link deleted",
        description: "The saved link has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete saved link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRemarkMutation = useMutation({
    mutationFn: async ({ id, remark }: { id: string; remark: string }) => {
      const response = await apiRequest("PATCH", `/api/saved-share-links/${id}/remark`, {
        remark,
      });
      if (!response.ok) {
        throw new Error("Failed to update remark");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-share-links"] });
      setEditDialogOpen(false);
      setSelectedLink(null);
      setRemark("");
      toast({
        title: "Remark updated",
        description: "The link remark has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update remark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (link: SavedShareLink) => {
    setSelectedLink(link);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (link: SavedShareLink) => {
    setSelectedLink(link);
    setRemark(link.remark);
    setEditDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLink) {
      deleteMutation.mutate(selectedLink.id);
    }
  };

  const saveRemark = () => {
    if (selectedLink) {
      updateRemarkMutation.mutate({ id: selectedLink.id, remark });
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] animate-in zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl">
          {/* iOS Frosted Glass Layer */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl border-0 shadow-inner" />
          <DialogHeader>
            <DialogTitle>Saved Share Links</DialogTitle>
            <DialogDescription>
              Manage your saved share links. Add remarks to organize them better.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading saved links...</p>
              </div>
            ) : savedLinks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No saved links yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-xl hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 hover:scale-[1.02] animate-in zoom-in-95"
                    data-testid={`saved-link-${link.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{link.remark || "Untitled Link"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {formatDate(link.createdAt)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
                            data-testid={`button-actions-${link.id}`}
                            title="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(link.url)}
                            className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                            data-testid={`menu-copy-${link.id}`}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(link.url, "_blank")}
                            className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                            data-testid={`menu-open-${link.id}`}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(link)}
                            className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                            data-testid={`menu-edit-${link.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Remark
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(link)}
                            className="cursor-pointer text-destructive focus:text-destructive transition-all duration-200 hover:scale-[1.02]"
                            data-testid={`menu-delete-${link.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={link.url}
                        readOnly
                        className="flex-1 h-8 text-xs"
                        data-testid={`input-url-${link.id}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl">
          {/* iOS Frosted Glass Layer */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl border-0 shadow-inner" />
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Remark Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl">
          {/* iOS Frosted Glass Layer */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl border-0 shadow-inner" />
          <DialogHeader>
            <DialogTitle>Edit Link Remark</DialogTitle>
            <DialogDescription>
              Add a note to help you remember what this link is for.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g., Weekly sales report - Jan 2024"
              className="mt-2"
              data-testid="input-remark"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveRemark}
              disabled={updateRemarkMutation.isPending}
              data-testid="button-save-remark"
            >
              {updateRemarkMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
