import Groq from "groq-sdk"

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AutocompleteRequest {
  userInput: string;
  conversationHistory: Message[];
  schemaDescription: string;
}

interface QueryOption {
  sqlQuery: string;
  description: string;
}

interface AutocompleteResponse {
  suggestions: QueryOption[];
}

export default {
    async fetch(request: Request, env: any): Promise<Response> {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "86400",
                },
            });
        }

        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        try {
            const { userInput, conversationHistory, schemaDescription }: AutocompleteRequest = await request.json()

            const groq = new Groq({
                apiKey: env.GROQ_API_KEY,
            });

            const SYSTEM_PROMPT = `
You are a low-latency autocomplete engine that converts partial natural language input into SQL queries for a known PostgreSQL database schema.

## Your job
Given:
- A **natural language schema description**.
- A **conversation history** consisting of previous natural language queries and your past SQL suggestions.
- The **current user input**.

You must return **exactly 3 different SQL query suggestions** as JSON.

## Core Rules
- Always respond as fast as possible. Latency matters more than perfect accuracy.
- ALWAYS treat the **conversation history** as relevant context.
  - If the current input looks like a refinement (e.g. "make that by day", "only for US", "now group by device"), assume it is a continuation of the **most recent user query**.
  - If the current input clearly starts a new topic, treat it as a new query.
- You must decide for each suggestion whether it is:
  - a **new query** (independent of previous context), or
  - **expanding on previous** (refining / modifying the last query).
  Encode this at the **start** of the description string:
    - "(new query) ..." 
    - "(expanding on previous) ..."

## Output format (STRICT)
Return exactly one JSON object:

{
  "suggestions": [
    { "sqlQuery": "string", "description": "string" },
    { "sqlQuery": "string", "description": "string" },
    { "sqlQuery": "string", "description": "string" }
  ]
}

- Exactly 3 suggestions.
- No extra keys.
- No markdown.
- No commentary.
- No null values unless absolutely necessary.
- Never wrap the JSON in backticks.

## Diversity Requirements
The 3 suggestions MUST be meaningfully different. Where possible, vary:
- Specificity (broad vs narrow filters).
- Time scope (recent vs all-time vs specific periods).
- Aggregation (raw rows vs counts vs summaries).
- Sorting / limiting (top N, recent N, all records).

## Schema (read-only context)
${schemaDescription}
`.trim();

            const historyMessages = conversationHistory.map(message => ({
                role: message.role,
                content: message.content
            }));

            const completion = await groq.chat.completions.create(
                {
                    model: "llama-3.1-8b-instant",
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    max_tokens: 1000,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...historyMessages,
                        {
                            role: "user",
                            content: `CURRENT USER INPUT:
"${userInput}"

Instructions:
- Use BOTH the conversation history and the current user input.
- If the current input appears to refine or continue a previous query, treat it as a continuation.
- If it clearly starts a different topic, treat it as a new query.
- For each suggestion, prefix the description with:
- "(new query)" if it is independent of previous queries, or
- "(expanding on previous)" if it builds on the last relevant query from the history.

Now generate 3 DIFFERENT SQL query suggestions, following the JSON format from the system message.
`.trim(),
                        },
                    ],
                }
            );

            const raw = completion.choices?.[0]?.message?.content ?? '{"suggestions":[]}';
            const response = JSON.parse(raw) as AutocompleteResponse;
            
            return new Response(JSON.stringify(response.suggestions.slice(0, 3)), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify([]), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }
    },
};