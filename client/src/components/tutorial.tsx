import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  mode?: 'view' | 'edit' | 'both';
}

const allTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Route Manager',
    description: 'This interactive guide will show you how to manage your delivery routes efficiently. Navigate using Next/Previous buttons, or skip anytime. You can restart this tutorial from the help button in the corner.',
    position: 'center',
    mode: 'both',
  },
  {
    id: 'theme',
    title: '🌓 Theme Toggle',
    description: 'Switch between light and dark modes for comfortable viewing. The dark mode features a premium deep black design with optimized contrast.',
    targetSelector: '[data-testid="button-toggle-theme"]',
    position: 'bottom',
    mode: 'both',
  },
  // VIEW MODE STEPS
  {
    id: 'view-search',
    title: '🔍 Smart Search & Filtering',
    description: 'Search across all locations and use filters to find specific routes, deliveries, or destinations instantly. Combine filters for precise results.',
    targetSelector: '[data-testid="search-input"]',
    position: 'top',
    mode: 'view',
  },
  {
    id: 'view-customize',
    title: '👁️ Customize Table View',
    description: 'Click to show/hide columns and drag to reorder them. Your custom layout is automatically saved when you exit edit mode and persists across sessions.',
    targetSelector: '[data-testid="button-show"]',
    position: 'top',
    mode: 'view',
  },
  {
    id: 'view-share',
    title: '🔗 Share Table State',
    description: 'Generate a shareable URL that includes your current filters, search terms, and column settings. Perfect for team collaboration.',
    targetSelector: '[data-testid="button-share-table"]',
    position: 'bottom',
    mode: 'view',
  },
  {
    id: 'view-links',
    title: '🔖 Saved Links',
    description: 'Access your previously saved share links from the navigation bar. View, manage, and quickly access all your saved table states.',
    targetSelector: '[data-testid="button-saved-links"]',
    position: 'bottom',
    mode: 'view',
  },
  {
    id: 'view-map',
    title: '🗺️ View Map',
    description: 'Click on any row\'s map button to see the location on an interactive map with route visualization and fullscreen support.',
    targetSelector: '.table-container',
    position: 'top',
    mode: 'view',
  },
  {
    id: 'view-edit-mode',
    title: '✏️ Switch to Edit Mode',
    description: 'Enter edit mode to add locations, calculate toll prices, modify data, and manage your routes. All changes can be saved.',
    targetSelector: '[data-testid="button-edit-mode"]',
    position: 'bottom',
    mode: 'view',
  },
  // EDIT MODE STEPS
  {
    id: 'edit-add-row',
    title: '➕ Add New Location',
    description: 'Add new route stops by clicking here. Fill in location details, coordinates, delivery info, and upload images if needed.',
    targetSelector: '[data-testid="button-add-row"]',
    position: 'bottom',
    mode: 'edit',
  },
  {
    id: 'edit-add-column',
    title: '📊 Add Custom Column',
    description: 'Create custom columns to track additional data points specific to your operations and workflow needs.',
    targetSelector: '[data-testid="button-add-column"]',
    position: 'bottom',
    mode: 'edit',
  },
  {
    id: 'edit-tolls',
    title: '💰 Auto-Calculate Tolls',
    description: 'Use Google Maps Routes API to automatically calculate toll prices and distances for lorry vehicles. Supports class 1 toll pricing with traffic-aware routing.',
    targetSelector: '[data-testid="button-calculate-tolls"]',
    position: 'bottom',
    mode: 'edit',
  },
  {
    id: 'edit-optimize',
    title: '🚀 Route Optimization',
    description: 'Use AI algorithms to optimize your delivery route for minimum distance, time, and fuel consumption. Choose from multiple optimization strategies.',
    targetSelector: '[data-testid="button-optimize-route"]',
    position: 'bottom',
    mode: 'edit',
  },
  {
    id: 'edit-save',
    title: '💾 Save All Changes',
    description: 'Save your modifications to persist all edits. Changes include new rows, updated data, column modifications, and reordering.',
    targetSelector: '[data-testid="button-save-data"]',
    position: 'bottom',
    mode: 'edit',
  },
  {
    id: 'edit-exit',
    title: '🚪 Return to View Mode',
    description: 'Exit edit mode to return to the read-only view. Your column layout preferences are automatically saved when you exit. Remember to save data changes before exiting to avoid data loss.',
    targetSelector: '[data-testid="button-edit-mode"]',
    position: 'bottom',
    mode: 'edit',
  },
  {
    id: 'complete',
    title: '🎉 Tutorial Complete!',
    description: 'You\'re now ready to manage routes like a pro! Access this guide anytime via the help button. Happy routing!',
    position: 'center',
    mode: 'both',
  },
];

interface TutorialProps {
  editMode?: boolean;
}

export function Tutorial({ editMode = false }: TutorialProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHelpButton, setShowHelpButton] = useState(true);

  // Filter steps based on current mode
  const tutorialSteps = allTutorialSteps.filter(
    step => step.mode === 'both' || step.mode === (editMode ? 'edit' : 'view')
  );

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('tutorial_completed');
    if (!hasSeenTutorial) {
      setIsActive(true);
    }
  }, []);

  // Reset to first step when mode changes
  useEffect(() => {
    if (isActive && currentStep > 0) {
      setCurrentStep(0);
    }
  }, [editMode]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setIsActive(false);
    setCurrentStep(0);
  };

  const skipTutorial = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setIsActive(false);
    setCurrentStep(0);
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const step = tutorialSteps[currentStep];

  useEffect(() => {
    if (!isActive || !step.targetSelector) return;

    const targetElement = document.querySelector(step.targetSelector);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If target element not found, skip to next step after a brief delay
      const timer = setTimeout(() => {
        if (currentStep < tutorialSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive, step.targetSelector]);

  if (!isActive && step.position === 'center') {
    return (
      <>
        {showHelpButton && (
          <div className="fixed bottom-4 right-4 z-50 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-60 group-hover:opacity-90 blur-sm animate-pulse" />
            <Button
              variant="ghost"
              size="sm"
              onClick={restartTutorial}
              className="relative rounded-full w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50"
              data-testid="button-help-tutorial"
              title="Show tutorial"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        )}
      </>
    );
  }

  if (!isActive) return null;

  // Center positioned dialogs
  if (step.position === 'center') {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-blue-500/30 dark:border-blue-400/30" aria-describedby="tutorial-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {step.title}
            </DialogTitle>
            <DialogDescription id="tutorial-description" className="text-base pt-3 leading-relaxed">
              {step.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: tutorialSteps.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep 
                        ? 'w-6 bg-gradient-to-r from-blue-600 to-purple-600' 
                        : 'w-1.5 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  data-testid="button-tutorial-previous"
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={skipTutorial}
                data-testid="button-tutorial-skip"
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-1"
                data-testid="button-tutorial-next"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    Finish
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Positioned tooltips
  const targetElement = step.targetSelector ? document.querySelector(step.targetSelector) : null;
  const rect = targetElement?.getBoundingClientRect();

  // If target not found, return null and let useEffect handle skipping
  if (!rect) {
    return null;
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 60,
  };

  switch (step.position) {
    case 'bottom':
      tooltipStyle.top = `${rect.bottom + 12}px`;
      tooltipStyle.left = `${rect.left + rect.width / 2 - 80}px`;
      tooltipStyle.transform = 'translateX(-50%)';
      break;
    case 'top':
      tooltipStyle.bottom = `${window.innerHeight - rect.top + 12}px`;
      tooltipStyle.left = `${rect.left + rect.width / 2 - 80}px`;
      tooltipStyle.transform = 'translateX(-50%)';
      break;
    case 'left':
      tooltipStyle.top = `${rect.top + rect.height / 2}px`;
      tooltipStyle.right = `${window.innerWidth - rect.left + 12}px`;
      tooltipStyle.transform = 'translateY(-50%)';
      break;
    case 'right':
      tooltipStyle.top = `${rect.top + rect.height / 2}px`;
      tooltipStyle.left = `${rect.right + 12}px`;
      tooltipStyle.transform = 'translateY(-50%)';
      break;
  }

  return (
    <>
      {/* Enhanced Highlight with glow */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-lg ring-4 ring-blue-500/60 dark:ring-blue-400/60 animate-pulse"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      />

      {/* Premium Tooltip */}
      <div
        style={tooltipStyle}
        className="fixed z-[10000] bg-gradient-to-br from-background/95 via-background/98 to-background dark:from-black/95 dark:via-black/98 dark:to-black border-2 border-blue-500/30 dark:border-blue-400/30 rounded-xl p-5 shadow-2xl max-w-md backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent pr-2">
            {step.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={skipTutorial}
            data-testid="button-tutorial-close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              {currentStep + 1}/{tutorialSteps.length}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(tutorialSteps.length, 8) }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentStep 
                      ? 'w-4 bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'w-1 bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevious} 
                data-testid="button-tutorial-previous"
                className="h-8 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={handleNext} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-8 px-3 gap-1" 
              data-testid="button-tutorial-next"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
