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

    const { focusArea, programDescription } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const prompt = `
Return ONLY valid JSON in this EXACT structure:

{
  "funders":[
    {
      "name":"",
      "type":"foundation | corporate_fund | hni | ngo_partner | grant_program",
      "focusAreas":[],
      "geographicFocus":"",
      "relevanceScore":85,
      "reasoning":"",
      "fundingCapacity":"small | medium | large",
      "whyTheyFund":"",
      "approachStrategy":"",
      "contactInfo":"",
      "priority":"high | medium | low"
    }
  ],
  "summary":"",
  "totalDiscovered":5,
  "topRecommendation":""
}

You are an AI funding research assistant for maternal health programs in India.

Find relevant organizations that could fund a maternal health initiative.

Focus Area: ${focusArea}

Program Description: ${programDescription}

Rules:
- Return ONLY JSON
- Provide 4–6 funders
- Ensure all fields are filled
- Use realistic organizations (foundations, CSR programs, grant programs)

Examples of possible funders:
- Gates Foundation
- Tata Trusts
- Azim Premji Foundation
- Reliance Foundation
- UNICEF India

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
              content: "Return JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content || "";

    let jsonStr = text;

    const match = text.match(/```json\s*([\s\S]*?)```/);

    if (match) jsonStr = match[1];

    let result;

    try {
      result = JSON.parse(jsonStr);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (err) {

    return new Response(
      JSON.stringify({ error: err.message }),
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