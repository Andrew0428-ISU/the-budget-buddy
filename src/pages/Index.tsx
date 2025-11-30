import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetResults } from "@/components/BudgetResults";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useBudgetFeedback } from "@/hooks/useBudgetFeedback";
import { LogOut, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import isuLogo from "@/assets/isu-redbird-logo.svg";

interface BudgetCriteria {
  monthlyIncome: number;
  tuition: number;
  housing: number;
  mealPlan: number;
  textbooks: number;
  transportation: number;
  savingsGoal: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budgetCriteria, setBudgetCriteria] = useState<BudgetCriteria | null>(null);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [aiAdjustments, setAiAdjustments] = useState<any>(null);
  const { previousFeedback, analyzeAndAdjust } = useBudgetFeedback(user?.id);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleBudgetGenerated = async (criteria: BudgetCriteria) => {
    // Apply adjustments from previous feedback if available
    if (previousFeedback) {
      toast({
        title: "Analyzing your feedback...",
        description: "AI is adjusting your budget based on previous feedback",
      });
      
      const adjustments = await analyzeAndAdjust(criteria);
      if (adjustments) {
        setAiAdjustments(adjustments);
        toast({
          title: "Budget adjusted!",
          description: adjustments.explanation || "Your budget has been personalized based on your feedback",
        });
      }
    }
    setBudgetCriteria(criteria);
  };

  const handleBack = () => {
    setBudgetCriteria(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Auth Button */}
      <div className="container mx-auto px-4 py-4 flex justify-end">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      <main className="container mx-auto px-4 py-8">
        {!budgetCriteria ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="relative max-w-md mx-auto">
                <img 
                  src={isuLogo} 
                  alt="Illinois State University Redbird Logo"
                  className="w-full h-48 object-contain"
                />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  The Budget Buddy
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Take control of your finances! Enter your income and expenses to get a personalized 
                  budget plan designed specifically for college students.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="max-w-2xl mx-auto">
              <BudgetForm onBudgetGenerated={handleBudgetGenerated} />
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <BudgetResults 
              criteria={budgetCriteria} 
              onBack={handleBack}
              aiAdjustments={aiAdjustments}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
