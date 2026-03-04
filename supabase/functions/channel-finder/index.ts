/// <reference lib="deno.ns" />

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

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const prompt = `
Return ONLY valid JSON in this EXACT structure:

{
  "channels":[
    {
      "name":"",
      "type":"hospital | clinic | medical_college | corporate | ngo | health_office | PHC",
      "category":"",
      "location":"",
      "relevanceScore":85,
      "reasoning":"",
      "contactInfo":"",
      "whyItMatters":"",
      "outreachApproach":"",
      "confidence":"high | medium | low"
    }
  ],
  "summary":"",
  "totalDiscovered":5,
  "coverageAnalysis":""
}

You are an AI healthcare outreach strategist.

Your job is to identify local institutions or organizations that can help reach pregnant women in maternal health programs.

District: ${district}

Target Population:
${profile}

Rules:
- Return JSON ONLY
- Provide 4–6 outreach channels
- Use realistic institutions in India
- Focus on healthcare access points

Possible channels include:
- Government hospitals
- PHCs (Primary Health Centres)
- Private maternity clinics
- Medical colleges
- NGOs working with ASHA workers
- District health offices
- CSR health programs

Each channel must explain:
- why the channel matters
- outreach strategy
- contact info if available

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
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "Return valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ]
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

    const text =
      ai?.choices?.[0]?.message?.content || "";

    if (!text) {

      return new Response(
        JSON.stringify({
          error: "AI returned empty response",
          raw: ai
        }),
        { headers: corsHeaders }
      );
    }

    let jsonStr = text;

    const match = text.match(/```json\s*([\s\S]*?)```/);

    if (match) jsonStr = match[1];

    let result;

    try {

      result = JSON.parse(jsonStr);

    } catch {

      return new Response(
        JSON.stringify({
          parseError: true,
          raw: text
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
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