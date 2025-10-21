import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import TablePage from "@/pages/table";
import SharedTablePage from "@/pages/shared-table";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen pb-16 text-sm">
      <Switch>
        <Route path="/">
          {() => <TablePage />}
        </Route>
        <Route path="/share/:shareId">
          {() => <SharedTablePage />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
