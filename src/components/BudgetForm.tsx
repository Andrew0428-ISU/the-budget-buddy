import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface BudgetFormProps {
  onBudgetGenerated: (criteria: BudgetCriteria) => void;
}

export const BudgetForm = ({ onBudgetGenerated }: BudgetFormProps) => {
  const [criteria, setCriteria] = useState<BudgetCriteria>({
    monthlyIncome: 0,
    tuition: 0,
    housing: 0,
    mealPlan: 0,
    textbooks: 0,
    transportation: 0,
    savingsGoal: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBudgetGenerated(criteria);
  };

  const updateCriteria = (field: keyof BudgetCriteria, value: string) => {
    setCriteria(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
          Tell us about your finances
        </CardTitle>
        <CardDescription>
          Enter your monthly income and estimated expenses to generate your personalized budget
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="income" className="text-base font-medium">
                Monthly Income
              </Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g., 1500"
                value={criteria.monthlyIncome || ""}
                onChange={(e) => updateCriteria("monthlyIncome", e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Include jobs, financial aid, family support
              </p>
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="housing" className="text-base font-medium">
                  Housing/Rent
                </Label>
                <Input
                  id="housing"
                  type="number"
                  placeholder="e.g., 800"
                  value={criteria.housing || ""}
                  onChange={(e) => updateCriteria("housing", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="mealPlan" className="text-base font-medium">
                  Food/Meal Plan
                </Label>
                <Input
                  id="mealPlan"
                  type="number"
                  placeholder="e.g., 300"
                  value={criteria.mealPlan || ""}
                  onChange={(e) => updateCriteria("mealPlan", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="textbooks" className="text-base font-medium">
                  Textbooks/Supplies
                </Label>
                <Input
                  id="textbooks"
                  type="number"
                  placeholder="e.g., 150"
                  value={criteria.textbooks || ""}
                  onChange={(e) => updateCriteria("textbooks", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="transportation" className="text-base font-medium">
                  Transportation
                </Label>
                <Input
                  id="transportation"
                  type="number"
                  placeholder="e.g., 100"
                  value={criteria.transportation || ""}
                  onChange={(e) => updateCriteria("transportation", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="savings" className="text-base font-medium">
                Monthly Savings Goal
              </Label>
              <Input
                id="savings"
                type="number"
                placeholder="e.g., 200"
                value={criteria.savingsGoal || ""}
                onChange={(e) => updateCriteria("savingsGoal", e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How much you'd like to save each month
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            Generate My Budget
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};