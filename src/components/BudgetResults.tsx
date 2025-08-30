import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

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
  // Calculate budget breakdown
  const totalFixedExpenses = criteria.housing + criteria.mealPlan + criteria.textbooks + criteria.transportation;
  const remainingAfterFixed = criteria.monthlyIncome - totalFixedExpenses;
  const recommendedSavings = Math.min(criteria.savingsGoal, remainingAfterFixed * 0.2);
  const availableForDiscretionary = remainingAfterFixed - recommendedSavings;
  
  // Budget categories with recommended amounts
  const budgetCategories = [
    { name: "Housing/Rent", amount: criteria.housing, type: "fixed" as const },
    { name: "Food/Meals", amount: criteria.mealPlan, type: "fixed" as const },
    { name: "Textbooks/Supplies", amount: criteria.textbooks, type: "fixed" as const },
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
    </div>
  );
};