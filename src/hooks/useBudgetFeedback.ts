import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BudgetCriteria {
  monthlyIncome: number;
  tuition: number;
  housing: number;
  mealPlan: number;
  textbooks: number;
  transportation: number;
  savingsGoal: number;
}

interface BudgetFeedback {
  id: string;
  feedback_text: string;
  budget_data: any;
  adjustments: any;
  created_at: string;
}

export const useBudgetFeedback = (userId: string | undefined) => {
  const [previousFeedback, setPreviousFeedback] = useState<BudgetFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAdjustments, setAiAdjustments] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchLatestFeedback();
    }
  }, [userId]);

  const fetchLatestFeedback = async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("budget_feedback")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setIsLoading(false);

    if (error) {
      console.error("Error fetching feedback:", error);
    } else if (data) {
      setPreviousFeedback(data);
    }
  };

  const saveFeedback = async (criteria: BudgetCriteria, feedbackText: string, rating?: number) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save feedback",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from("budget_feedback")
      .insert([{
        user_id: userId,
        budget_data: criteria as any,
        feedback_text: feedbackText,
        rating: rating,
      }]);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error saving feedback",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } else {
      toast({
        title: "Feedback saved!",
        description: "Your feedback will help improve your next budget",
      });
      await fetchLatestFeedback();
      return true;
    }
  };

  const analyzeAndAdjust = async (currentCriteria: BudgetCriteria) => {
    if (!previousFeedback) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-budget-feedback', {
        body: {
          feedbackText: previousFeedback.feedback_text,
          budgetData: previousFeedback.budget_data,
          currentCriteria
        }
      });

      setIsLoading(false);

      if (error) {
        console.error('Error analyzing feedback:', error);
        toast({
          title: "Could not apply feedback",
          description: "Using standard budget calculations",
          variant: "destructive"
        });
        return null;
      }

      setAiAdjustments(data.adjustments);
      return data.adjustments;
    } catch (error) {
      setIsLoading(false);
      console.error('Error in analyzeAndAdjust:', error);
      return null;
    }
  };

  return {
    previousFeedback,
    isLoading,
    saveFeedback,
    refetch: fetchLatestFeedback,
    analyzeAndAdjust,
    aiAdjustments
  };
};
