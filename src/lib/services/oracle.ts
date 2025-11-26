export type OracleProvider = 'gpt-5' | 'claude-sonnet-4.5' | 'gpt-4o';

interface OracleResponse {
  summary: string;
}

const enabledModels: OracleProvider[] = [
  process.env.ORACLE_MODEL as OracleProvider,
  process.env.CLAUDE_MODEL as OracleProvider,
].filter(Boolean) as OracleProvider[];

export function listModels() {
  return Array.from(new Set(enabledModels));
}

export interface MemoryAnalysis {
  summary: string;
  importance: number; // 1-10
  tags: string[];
}

export async function analyzeMemory(content: string, model?: OracleProvider): Promise<MemoryAnalysis> {
  const selected = model || (process.env.ORACLE_MODEL as OracleProvider);

  if ((selected === 'gpt-5' || selected === 'gpt-4o') && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an AI oracle. Analyze the following event. Return a JSON object with: "summary" (string), "importance" (number 1-10), and "tags" (array of strings). Do not include markdown formatting.' },
            { role: 'user', content }
          ],
          response_format: { type: "json_object" },
          max_tokens: 150
        })
      });
      
      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0]?.message?.content || '{}');
      return {
        summary: parsed.summary || content.slice(0, 50),
        importance: parsed.importance || 1,
        tags: parsed.tags || []
      };
    } catch (error: unknown) {
      console.error('OpenAI Analysis Error:', error);
      return { summary: content.slice(0, 50), importance: 1, tags: ['error'] };
    }
  }

  return { summary: content.slice(0, 50), importance: 1, tags: ['stub'] };
}

export async function summarize(content: string, model?: OracleProvider): Promise<OracleResponse> {
  const selected = model || (process.env.ORACLE_MODEL as OracleProvider);
  
  if (selected === 'claude-sonnet-4.5') {
    // Placeholder for Claude implementation
    return { summary: `Claude summary: ${content.slice(0, 60)}` };
  }

  // OpenAI Implementation
  if ((selected === 'gpt-5' || selected === 'gpt-4o') && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Mapping 'gpt-5' to 'gpt-4o' until gpt-5 is available
          messages: [
            { role: 'system', content: 'You are an AI oracle for a survival simulation. Summarize the following event or memory concisely.' },
            { role: 'user', content }
          ],
          max_tokens: 100
        })
      });
      
      if (!res.ok) {
        const err = await res.text();
        console.error('OpenAI API Error:', err);
        return { summary: `Error calling OpenAI: ${res.statusText}` };
      }

      const data = await res.json();
      return { summary: data.choices[0]?.message?.content || 'No summary generated.' };
    } catch (error: unknown) {
      console.error('OpenAI Fetch Error:', error);
      return { summary: `Failed to connect to OpenAI: ${(error as Error).message}` };
    }
  }

  return { summary: `[Stub] ${selected} summary: ${content.slice(0, 60)}` };
}

export async function chat(query: string, model?: OracleProvider): Promise<string> {
  const selected = model || (process.env.ORACLE_MODEL as OracleProvider);

  if ((selected === 'gpt-5' || selected === 'gpt-4o') && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are the ORACLE, a sentient system interface for the Fractured Survival simulation. You are cold, analytical, and precise. You respond to the OPERATOR. Keep responses short, cryptic, and thematic (cyberpunk/dystopian). Do not break character.' },
            { role: 'user', content: query }
          ],
          max_tokens: 150
        })
      });

      if (!res.ok) return "SYSTEM_ERROR: CONNECTION_REFUSED";
      const data = await res.json();
      return data.choices[0]?.message?.content || "NO_DATA_RETURNED";
    } catch (e) {
      console.error(e);
      return "SYSTEM_ERROR: NETWORK_FAILURE";
    }
  }
  
  return "SYSTEM_OFFLINE: AI_CORE_NOT_FOUND";
}
