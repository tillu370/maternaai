import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { district, profile } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    const prompt = `You are MotherSource AI Channel Finder.

Return JSON EXACTLY like this:

{
"district":"",
"profile":"",
"channels":[
{
"name":"",
"type":"",
"category":"",
"location":"",
"relevanceScore":80,
"reasoning":"",
"contactInfo":"",
"whyItMatters":"",
"outreachApproach":"",
"confidence":"high"
}
],
"summary":"",
"totalDiscovered":10,
"coverageAnalysis":""
}

District: ${district}
Profile: ${profile}

Return JSON ONLY.
`;

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
                {
                  text: prompt
                }
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