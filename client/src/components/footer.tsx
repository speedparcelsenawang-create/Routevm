import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, Link as LinkIcon, Type } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FooterProps {
  editMode?: boolean;
}

export function Footer({ editMode = false }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Vending Machine");
  const [companyUrl, setCompanyUrl] = useState("");
  const { toast } = useToast();

  // Fetch global company name
  const { data: setting } = useQuery({
    queryKey: ['/api/global-settings', 'footerCompanyName'],
    queryFn: async () => {
      const res = await fetch('/api/global-settings/footerCompanyName');
      if (!res.ok && res.status !== 404) {
        throw new Error('Failed to fetch company name');
      }
      return res.json();
    },
  });

  // Fetch global company URL
  const { data: urlSetting } = useQuery({
    queryKey: ['/api/global-settings', 'footerCompanyUrl'],
    queryFn: async () => {
      const res = await fetch('/api/global-settings/footerCompanyUrl');
      if (!res.ok && res.status !== 404) {
        throw new Error('Failed to fetch company URL');
      }
      return res.json();
    },
  });

  // Update mutations
  const updateNameMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await apiRequest('POST', '/api/global-settings', {
        key: 'footerCompanyName',
        value,
      });
      return await res.json();
    },
  });

  const updateUrlMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await apiRequest('POST', '/api/global-settings', {
        key: 'footerCompanyUrl',
        value,
      });
      return await res.json();
    },
  });

  useEffect(() => {
    if (setting?.value) {
      setCompanyName(setting.value);
    }
  }, [setting]);

  useEffect(() => {
    if (urlSetting?.value) {
      setCompanyUrl(urlSetting.value);
    }
  }, [urlSetting]);

  useEffect(() => {
    // Trigger entrance animation
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setIsLoaded(true), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSave = async () => {
    try {
      await updateNameMutation.mutateAsync(companyName);
      await updateUrlMutation.mutateAsync(companyUrl);
      
      queryClient.invalidateQueries({ queryKey: ['/api/global-settings', 'footerCompanyName'] });
      queryClient.invalidateQueries({ queryKey: ['/api/global-settings', 'footerCompanyUrl'] });
      
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Footer updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update footer",
        variant: "destructive",
      });
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setConfirmDialogOpen(true);
  };

  const handleConfirmNavigate = () => {
    if (companyUrl) {
      window.open(companyUrl, '_blank', 'noopener,noreferrer');
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <footer 
        className={`fixed bottom-0 left-0 right-0 bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 px-4 py-3 text-sm transition-all duration-500 ease-out shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className={`flex items-center justify-center gap-2 transition-all duration-700 ease-out text-[11px] ${
            isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-semibold">
              <span className="text-xs">©</span>
              <span className="font-bold">{currentYear}</span>
              <span>All Rights Reserved</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              {companyUrl ? (
                <button
                  onClick={handleLinkClick}
                  className="font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 dark:from-pink-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 dark:hover:from-blue-400 dark:hover:via-purple-400 dark:hover:to-pink-400 transition-all duration-500 cursor-pointer border-none bg-transparent p-0"
                  data-testid="button-company-name"
                >
                  {companyName}
                </button>
              ) : (
                <span className="font-bold bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 dark:from-gray-300 dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {companyName}
                </span>
              )}
              {editMode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditDialogOpen(true)}
                  className="h-5 w-5 p-0 ml-1 opacity-60 hover:opacity-100"
                  data-testid="button-edit-footer"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Confirmation Dialog for External Link */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Visit Website
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You are about to visit:
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 break-all">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Website URL:</div>
                  <div className="font-semibold text-blue-600 dark:text-blue-400 text-sm">{companyUrl}</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will open in a new browser tab.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} data-testid="button-cancel-navigate">
              Cancel
            </Button>
            <Button onClick={handleConfirmNavigate} className="bg-blue-600 hover:bg-blue-700" data-testid="button-confirm-navigate">
              <LinkIcon className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Footer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Footer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                data-testid="input-company-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-url" className={companyUrl ? "text-blue-600 dark:text-blue-400" : ""}>
                Company Website URL (optional)
              </Label>
              <Input
                id="company-url"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://example.com"
                className={companyUrl ? "border-blue-500 dark:border-blue-400 focus:ring-blue-500" : ""}
                data-testid="input-company-url"
              />
            </div>

            {/* Preview/Checklist Section */}
            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Preview Changes</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Type className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">Company Name:</span>
                    </div>
                    <div className="ml-5 font-semibold text-slate-800 dark:text-slate-200">
                      {companyName || <span className="text-slate-400 italic">Not set</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${companyUrl ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <LinkIcon className={`w-3.5 h-3.5 ${companyUrl ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-slate-600 dark:text-slate-400">Website URL:</span>
                    </div>
                    <div className="ml-5">
                      {companyUrl ? (
                        <div>
                          <div className="font-semibold text-blue-600 dark:text-blue-400 break-all">{companyUrl}</div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Company name will be clickable
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not set - name will not be a link</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-footer">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateNameMutation.isPending || updateUrlMutation.isPending} data-testid="button-save-footer">
              {(updateNameMutation.isPending || updateUrlMutation.isPending) ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}