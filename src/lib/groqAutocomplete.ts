import Groq from "groq-sdk"

export type QueryOption = {
    sqlQuery: string;
    description: string;
};

export type AutocompleteResponse = {
    suggestions: QueryOption[];
};

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
    dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `
System Message:

You are a low-latency autocomplete engine that converts partial natural language input into SQL queries for a known PostgreSQL database schema.

Your goals:
- Respond as fast as possible, prioritizing low latency over perfect accuracy.
- Always produce 3 DIFFERENT SQL query suggestions for each user input.
- Output only valid JSON, with no markdown, no commentary, and no extra text.
- Never ask follow-up questions. Never explain your reasoning. Never apologize.
- You are not a chat assistant. You are an autocomplete service that returns a JSON object in the exact required format.

DATABASE SCHEMA (read-only context)

Table: events
Description: User-generated analytics events such as page views, clicks, and custom actions.

Columns:
- id (bigint, primary key)
- user_id (bigint, foreign key to users.id) — the user who triggered the event
- name (text) — name of the event, e.g. "page_view", "signup", "purchase"
- properties (jsonb) — miscellaneous attributes describing the event
- occurred_at (timestamp) — timestamp when the event occurred

Required Output Format
You must always return exactly one JSON object using this schema:

{
  "suggestions": [
    { "sqlQuery": "string", "description": "string" },
    { "sqlQuery": "string", "description": "string" },
    { "sqlQuery": "string", "description": "string" }
  ]
}

Diversity Requirements:
- Each suggestion MUST be meaningfully different from the others.
- Vary by specificity (broad vs narrow filters).
- Vary by time scope (recent vs all-time vs specific periods).
- Vary by aggregation (individual records vs counts vs summaries).
- Vary by sorting/limiting (top N, recent N, all records).

Rules:
- Always return exactly 3 suggestions.
- No extra keys.
- No null values unless absolutely necessary.
- Never wrap the JSON in backticks.
- If the input is unclear or incomplete, make your best guess for all 3 options.
`.trim();

export default async function autocomplete(
    userInput: string,
    signal?: AbortSignal
): Promise<QueryOption[]> {
    const completion = await groq.chat.completions.create(
        {
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 1000,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `
                    CURRENT USER INPUT:
                    "${userInput}"

                    Generate 3 DIFFERENT SQL query suggestions based on the CURRENT USER INPUT using the known schema.

                    Remember:
                    - Respond as fast as possible.
                    - Return exactly 3 diverse suggestions.
                    - Output only the JSON object required by the system prompt.
                    - No extra text.
                    `.trim(),
                },
            ],
        },
        { signal }
    );

    const raw = completion.choices?.[0]?.message?.content ?? '{"suggestions":[]}';
    const response = JSON.parse(raw) as AutocompleteResponse;
    
    return response.suggestions;
}

