import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackText, budgetData, currentCriteria } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a college budget advisor. Analyze the user's previous budget feedback and suggest specific adjustments to their new budget allocation.

Previous budget data: ${JSON.stringify(budgetData)}
User's feedback: "${feedbackText}"
Current budget inputs: ${JSON.stringify(currentCriteria)}

Based on their feedback, return ONLY a JSON object with percentage adjustments for budget categories. Use positive numbers to increase allocation and negative to decrease.

Example response format:
{
  "savings": 10,
  "discretionary": -5,
  "food": 0,
  "explanation": "Based on your feedback about needing more savings, I've increased your savings allocation by 10% and reduced discretionary spending by 5%."
}

Categories you can adjust: savings, discretionary, food, housing, transportation, textbooks
Return percentages as whole numbers (e.g., 10 for 10%, -5 for -5%)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analyze the feedback and provide budget adjustments." }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const adjustments = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ adjustments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-budget-feedback:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
