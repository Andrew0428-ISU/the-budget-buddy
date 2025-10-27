import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import { useBudgetFeedback } from "@/hooks/useBudgetFeedback";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

interface BudgetCriteria {
  monthlyIncome: number;
  tuition: number;
  housing: number;
  mealPlan: number;
  textbooks: number;
  transportation: number;
  savingsGoal: number;
}

interface BudgetResultsProps {
  criteria: BudgetCriteria;
  onBack: () => void;
}

export const BudgetResults = ({ criteria, onBack }: BudgetResultsProps) => {
  const [userId, setUserId] = useState<string | undefined>();
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { saveFeedback, isLoading: isSavingFeedback } = useBudgetFeedback(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  const handleSaveFeedback = async () => {
    if (feedbackText.trim()) {
      const success = await saveFeedback(criteria, feedbackText);
      if (success) {
        setFeedbackText("");
        setShowFeedbackForm(false);
      }
    }
  };

  // Calculate budget breakdown
  const totalFixedExpenses = criteria.housing + criteria.mealPlan + criteria.textbooks + criteria.transportation;
  const remainingAfterFixed = criteria.monthlyIncome - totalFixedExpenses;
  const recommendedSavings = Math.min(criteria.savingsGoal, remainingAfterFixed * 0.2);
  const availableForDiscretionary = remainingAfterFixed - recommendedSavings;
  
  // Budget categories with recommended amounts
  const budgetCategories = [
    { name: "Housing/Rent", amount: criteria.housing, type: "fixed" as const },
    { name: "Food/Meals", amount: criteria.mealPlan, type: "fixed" as const },
    { name: "Insurance", amount: criteria.textbooks, type: "fixed" as const },
    { name: "Transportation", amount: criteria.transportation, type: "fixed" as const },
    { name: "Entertainment", amount: Math.round(availableForDiscretionary * 0.3), type: "flexible" as const },
    { name: "Personal Care", amount: Math.round(availableForDiscretionary * 0.15), type: "flexible" as const },
    { name: "Emergency Fund", amount: Math.round(availableForDiscretionary * 0.25), type: "flexible" as const },
    { name: "Miscellaneous", amount: Math.round(availableForDiscretionary * 0.3), type: "flexible" as const },
    { name: "Savings", amount: Math.round(recommendedSavings), type: "savings" as const },
  ];

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const budgetHealth = totalBudgeted <= criteria.monthlyIncome ? "healthy" : "warning";

  const tips = [
    "Track your spending weekly to stay on budget",
    "Look for student discounts on textbooks and software",
    "Consider meal prepping to save on food costs",
    "Use campus resources like the gym instead of paid memberships"
  ];

  const localRecommendations = {
    restaurants: [
      { name: "Medici", description: "Affordable pizza and sandwiches, student favorite", price: "$" },
      { name: "Avanti's", description: "Italian comfort food, great for groups", price: "$$" },
      { name: "Destihl", description: "Brewpub with creative food and craft beer", price: "$$" },
      { name: "Blaze Pizza", description: "Build-your-own pizza, quick and budget-friendly", price: "$" },
      { name: "Epiphany Farms", description: "Farm-to-table, perfect for special occasions", price: "$$$" }
    ],
    entertainment: [
      { name: "The Planetarium", description: "Free ISU planetarium shows", price: "Free" },
      { name: "Downtown Bloomington", description: "Shops, galleries, and weekend events", price: "Varies" },
      { name: "Constitution Trail", description: "Biking and walking path through both cities", price: "Free" },
      { name: "The Castle Theatre", description: "Historic venue for concerts and comedy shows", price: "$$" },
      { name: "Grady's Family Fun Park", description: "Mini golf, go-karts, and arcade", price: "$$" },
      { name: "ISU Recreation Center", description: "State-of-the-art gym included with tuition", price: "Free" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Form
        </Button>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Your Personalized Budget
          </h2>
          <p className="text-muted-foreground">Based on your monthly income of ${criteria.monthlyIncome}</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-primary">${criteria.monthlyIncome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold text-secondary">${totalBudgeted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              {budgetHealth === "healthy" ? (
                <TrendingUp className="h-5 w-5 text-secondary" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${budgetHealth === "healthy" ? "text-secondary" : "text-destructive"}`}>
                  ${criteria.monthlyIncome - totalBudgeted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    <Badge 
                      variant={category.type === "fixed" ? "default" : category.type === "savings" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {category.type}
                    </Badge>
                  </div>
                  <span className="font-bold">${category.amount}</span>
                </div>
                <Progress 
                  value={(category.amount / criteria.monthlyIncome) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Tips */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>College Budgeting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ISU Local Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>🍕 Places to Eat Near ISU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localRecommendations.restaurants.map((place, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold">{place.name}</h4>
                    <Badge variant="outline" className="text-xs">{place.price}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{place.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>🎉 Entertainment & Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localRecommendations.entertainment.map((place, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold">{place.name}</h4>
                    <Badge variant="outline" className="text-xs">{place.price}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{place.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {budgetHealth === "warning" && (
        <Card className="border-destructive shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Budget Warning</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your planned expenses exceed your income. Consider reducing discretionary spending 
                  or finding additional income sources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Feedback Section */}
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Budget Feedback</CardTitle>
            </div>
            {!showFeedbackForm && (
              <Button 
                variant="outline"
                onClick={() => setShowFeedbackForm(true)}
              >
                Add Feedback
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showFeedbackForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">How is this budget working for you?</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts... e.g., 'I need more for entertainment' or 'Savings goal is too high'"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Your feedback will help adjust recommendations for your next budget
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveFeedback}
                  disabled={!feedbackText.trim() || isSavingFeedback}
                  className="bg-gradient-primary"
                >
                  {isSavingFeedback ? "Saving..." : "Save Feedback"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedbackText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">
                Share your experience with this budget to get better recommendations next time
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};