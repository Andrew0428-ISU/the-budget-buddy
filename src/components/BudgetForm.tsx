import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mic } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

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

  const createVoiceHandler = (field: keyof BudgetCriteria) => {
    return useVoiceInput((transcript: string) => {
      const numbers = transcript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        updateCriteria(field, numbers.join(''));
      }
    });
  };

  const monthlyIncomeVoice = createVoiceHandler('monthlyIncome');
  const tuitionVoice = createVoiceHandler('tuition');
  const housingVoice = createVoiceHandler('housing');
  const mealPlanVoice = createVoiceHandler('mealPlan');
  const textbooksVoice = createVoiceHandler('textbooks');
  const transportationVoice = createVoiceHandler('transportation');
  const savingsGoalVoice = createVoiceHandler('savingsGoal');

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
              <div className="flex gap-2 mt-1">
                <Input
                  id="income"
                  type="number"
                  placeholder="e.g., 1500"
                  value={criteria.monthlyIncome || ""}
                  onChange={(e) => updateCriteria("monthlyIncome", e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={monthlyIncomeVoice.startListening}
                  disabled={monthlyIncomeVoice.isListening}
                >
                  <Mic className={monthlyIncomeVoice.isListening ? "text-red-500" : ""} />
                </Button>
              </div>
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
                <div className="flex gap-2 mt-1">
                  <Input
                    id="housing"
                    type="number"
                    placeholder="e.g., 800"
                    value={criteria.housing || ""}
                    onChange={(e) => updateCriteria("housing", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={housingVoice.startListening}
                    disabled={housingVoice.isListening}
                  >
                    <Mic className={housingVoice.isListening ? "text-red-500" : ""} />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="mealPlan" className="text-base font-medium">
                  Food/Meal Plan
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="mealPlan"
                    type="number"
                    placeholder="e.g., 300"
                    value={criteria.mealPlan || ""}
                    onChange={(e) => updateCriteria("mealPlan", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={mealPlanVoice.startListening}
                    disabled={mealPlanVoice.isListening}
                  >
                    <Mic className={mealPlanVoice.isListening ? "text-red-500" : ""} />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="textbooks" className="text-base font-medium">
                  Insurance
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="textbooks"
                    type="number"
                    placeholder="e.g., 100"
                    value={criteria.textbooks || ""}
                    onChange={(e) => updateCriteria("textbooks", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={textbooksVoice.startListening}
                    disabled={textbooksVoice.isListening}
                  >
                    <Mic className={textbooksVoice.isListening ? "text-red-500" : ""} />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="transportation" className="text-base font-medium">
                  Transportation
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="transportation"
                    type="number"
                    placeholder="e.g., 100"
                    value={criteria.transportation || ""}
                    onChange={(e) => updateCriteria("transportation", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={transportationVoice.startListening}
                    disabled={transportationVoice.isListening}
                  >
                    <Mic className={transportationVoice.isListening ? "text-red-500" : ""} />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="savings" className="text-base font-medium">
                Monthly Savings Goal
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="savings"
                  type="number"
                  placeholder="e.g., 200"
                  value={criteria.savingsGoal || ""}
                  onChange={(e) => updateCriteria("savingsGoal", e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={savingsGoalVoice.startListening}
                  disabled={savingsGoalVoice.isListening}
                >
                  <Mic className={savingsGoalVoice.isListening ? "text-red-500" : ""} />
                </Button>
              </div>
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