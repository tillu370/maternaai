import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { profile } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    console.log("Key exists:", !!OPENROUTER_API_KEY);

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }),
        { headers: corsHeaders }
      );
    }

    const prompt = `
Return ONLY valid JSON.

{
"hospitals":[
{
"name":"",
"location":"",
"suitability":"",
"confidence":80
}
],
"schemes":[
{
"name":"",
"benefits":"",
"eligibility":"",
"confidence":80
}
],
"ngos":[
{
"name":"",
"supportType":"",
"contact":"",
"confidence":80
}
],
"dietPlan":[],
"precautions":[],
"exercises":[],
"dos":[],
"donts":[],
"overallConfidence":80,
"reasoning":""
}

You are a maternal healthcare assistant for India.

Provide real maternal health recommendations for the given profile.

Hospitals must include:
- hospital name
- location
- why it is suitable for pregnancy care
- confidence score

Schemes must include:
- scheme name
- benefits
- eligibility

NGOs must include:
- NGO name
- support type
- contact info if possible

Patient Info:
State: ${profile?.state}
District: ${profile?.district}
Area Type: ${profile?.areaType}
Income: ${profile?.income}
Risk Level: ${profile?.riskLevel}
Pregnancy Weeks: ${profile?.gestationalAge}

Return JSON ONLY.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            {
              role: "system",
              content: "You are a maternal healthcare assistant. Return only JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {

      const err = await response.text();

      return new Response(
        JSON.stringify({
          error: "OpenRouter API request failed",
          status: response.status,
          details: err
        }),
        { headers: corsHeaders }
      );
    }

    const ai = await response.json();

    console.log("AI RESPONSE:", JSON.stringify(ai, null, 2));

    const text = ai?.choices?.[0]?.message?.content || "";

    if (!text) {
      return new Response(
        JSON.stringify({
          error: "AI returned empty response",
          raw: ai
        }),
        { headers: corsHeaders }
      );
    }

    let result;

    try {

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}") + 1;

      const cleanJson = text.slice(start, end);

      result = JSON.parse(cleanJson);

    } catch {

      return new Response(
        JSON.stringify({
          error: "Invalid JSON from AI",
          raw: text
        }),
        { headers: corsHeaders }
      );

    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {

    return new Response(
      JSON.stringify({
        error: err.message
      }),
      { headers: corsHeaders }
    );

  }

});