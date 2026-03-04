import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { profile } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");



    // AI PROMPT
    const prompt = `You are Materna AI - Pregnancy Care Assistant.

Generate personalized pregnancy recommendations based on:

- Pregnancy Weeks
- Risk Level
- Monthly Income
- Location

Recommendations must be:

- Practical
- Affordable
- Safe
- Local if possible

Do NOT copy internet diet plans.

Suggest realistic Indian foods.


Return JSON EXACTLY like this:

{

"hospitals":[
{"name":"","location":"","suitability":"","distance":"","confidence":80}
],

"schemes":[
{"name":"","benefits":"","eligibility":"","howToApply":"","confidence":80}
],

"ngos":[
{"name":"","supportType":"","coverage":"","contact":"","confidence":80}
],

"dietPlan":[
"",
"",
"",
""
],

"precautions":[
"",
"",
""
],

"exercises":[
"",
"",
""
],

"dos":[
"",
"",
""
],

"donts":[
"",
"",
""
],

"overallConfidence":80,

"reasoning":"Explain briefly why these recommendations match pregnancy weeks and income."

}



Patient Details:

State: ${profile.state}

District: ${profile.district}

Area Type: ${profile.areaType}

Monthly Income: ${profile.income}

Risk Level: ${profile.riskLevel}

Pregnancy Weeks: ${profile.gestationalAge}



Return JSON ONLY.
`;



    // GEMINI CALL

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    );


    const data = await response.json();


    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";


    let jsonStr = text;


    // Remove markdown if Gemini sends it

    const match = text.match(/```json\s*([\s\S]*?)```/);

    if (match) jsonStr = match[1];



    const result = JSON.parse(jsonStr);



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
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  }

});