import { useState } from "react";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetResults } from "@/components/BudgetResults";
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
  const [budgetCriteria, setBudgetCriteria] = useState<BudgetCriteria | null>(null);

  const handleBudgetGenerated = (criteria: BudgetCriteria) => {
    setBudgetCriteria(criteria);
  };

  const handleBack = () => {
    setBudgetCriteria(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
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
            <BudgetResults criteria={budgetCriteria} onBack={handleBack} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
