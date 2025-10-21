import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

export function PasswordPrompt({ open, onOpenChange, onSuccess, title, description }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const correctPassword = "Acun97";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      onSuccess();
      onOpenChange(false);
      setPassword("");
      toast({
        title: "Access Granted",
        description: "You now have access to restricted features.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handleCancel = () => {
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] animate-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 duration-300 transition-all bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-3xl">
        {/* iOS Frosted Glass Layer */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl border-0 shadow-inner" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-white/10 dark:bg-black/10 backdrop-blur-sm border-transparent"
                data-testid="password-input"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-transparent backdrop-blur-sm border-transparent text-red-500 hover:bg-red-500/10"
                data-testid="cancel-password"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!password.trim()}
                className="transition-all duration-200 backdrop-blur-sm border-transparent bg-transparent text-green-500 hover:bg-green-500/10 disabled:text-muted-foreground disabled:hover:bg-transparent"
                data-testid="submit-password"
              >
                Unlock
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}