import prisma from '@/lib/db';
import { analyzeMemory, OracleProvider } from '@/lib/services/oracle';

export async function generateMemorySummary(rawContent: string, model?: OracleProvider): Promise<{ summary: string, importance: number, tags: string[] }> {
  return await analyzeMemory(rawContent, model);
}

export async function processTrustUpdate(eventType: string): Promise<number> {
  // Placeholder: simple mapping; real logic would use model weights
  switch (eventType) {
    case 'HELP': return 5;
    case 'BETRAY': return -10;
    case 'GREET': return 1;
    default: return 0;
  }
}

export async function adjustTrustState(sourceId: string, targetId: string, delta: number): Promise<void> {
  const existing = await prisma.trustState.findUnique({ where: { sourceId_targetId: { sourceId, targetId } } });
  let newLevel = delta;
  if (existing) {
    newLevel = existing.trustLevel + delta;
    await prisma.trustState.update({ where: { id: existing.id }, data: { trustLevel: newLevel } });
  } else {
    const created = await prisma.trustState.create({ data: { sourceId, targetId, trustLevel: newLevel } });
    newLevel = created.trustLevel;
  }
  await prisma.trustEvent.create({ data: { sourceId, targetId, delta, resultingTrust: newLevel, eventType: 'UPDATE' } });
}

export async function decideAction(npcId: string, context: string): Promise<string> {
  const npc = await prisma.nPC.findUnique({ 
    where: { id: npcId },
    include: { factionRef: true }
  });
  if (!npc) return "ERROR: NPC_NOT_FOUND";

  // Fetch Global Context (Active World Events)
  const activeEvents = await prisma.worldEvent.findMany({
    where: { active: true },
    select: { title: true, description: true }
  });
  const worldContext = activeEvents.map(e => `${e.title}: ${e.description}`).join("; ");

  // Fetch Faction Context
  const factionContext = npc.factionRef ? `Faction: ${npc.factionRef.name} - ${npc.factionRef.description}` : "Faction: None";

  // Fetch recent memories to inform decision
  const recentMemories = await prisma.memoryEvent.findMany({
    where: { npcId },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  // Fetch high importance memories (long-term memory)
  const importantMemories = await prisma.memoryEvent.findMany({
    where: { npcId, importance: { gt: 7 } },
    orderBy: { createdAt: 'desc' },
    take: 2
  });

  // Combine and deduplicate
  const allMemories = [...recentMemories, ...importantMemories];
  const uniqueMemories = Array.from(new Map(allMemories.map(m => [m.id, m])).values());

  const memoryContext = uniqueMemories.map(m => `[${m.createdAt.toISOString().split('T')[0]}] ${m.summary} (Tags: ${m.tags || ''})`).join("; ");

  if (process.env.OPENAI_API_KEY) {
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
            { role: 'system', content: `You are ${npc.name}, a survivor in a fractured world. 
              Alignment: ${npc.alignment || 'Neutral'}.
              ${factionContext}
              
              Global Events Active:
              ${worldContext || "None"}
              
              Your Memories:
              ${memoryContext}
              
              Based on your personality, faction, the state of the world, and your past experiences, decide your next action.` },
            { role: 'user', content: `Situation: ${context}. What do you do? Respond with a single action sentence.` }
          ],
          max_tokens: 100
        })
      });
      const data = await res.json();
      return data.choices[0]?.message?.content || "DECISION_FAILURE";
    } catch (e) {
      console.error(e);
      return "DECISION_OFFLINE";
    }
  }
  return "DECISION_STUB: WAIT_AND_OBSERVE";
}

export async function decideEconomicAction(npcId: string): Promise<{ action: string, item?: string, cost?: number }> {
  const npc = await prisma.nPC.findUnique({ 
    where: { id: npcId },
    include: { wallet: true }
  });

  if (!npc || !npc.wallet) return { action: "NO_WALLET" };

  const balance = npc.wallet.balance;
  const marketItems = [
    { name: "Ration Pack", cost: 15, benefit: "Survival" },
    { name: "Data Cache", cost: 50, benefit: "Intel" },
    { name: "Weapon Parts", cost: 100, benefit: "Defense" },
    { name: "Bribe", cost: 30, benefit: "Influence" }
  ];

  const affordableItems = marketItems.filter(i => i.cost <= balance);
  if (affordableItems.length === 0) return { action: "POOR" };

  if (process.env.OPENAI_API_KEY) {
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
            { role: 'system', content: `You are ${npc.name}. Balance: ${balance} credits.
              Available Items: ${JSON.stringify(affordableItems)}.
              Decide if you want to buy something to help your survival.
              Return JSON: { "buy": boolean, "itemName": string | null, "reason": string }` 
            },
            { role: 'user', content: "Do you make a purchase?" }
          ],
          response_format: { type: "json_object" },
          max_tokens: 100
        })
      });
      const data = await res.json();
      const decision = JSON.parse(data.choices[0]?.message?.content || '{}');

      if (decision.buy && decision.itemName) {
        const item = marketItems.find(i => i.name === decision.itemName);
        if (item) {
          return { action: "BUY", item: item.name, cost: item.cost };
        }
      }
      return { action: "HOLD" };
    } catch (e) {
      console.error(e);
      return { action: "ERROR" };
    }
  }
  return { action: "STUB_HOLD" };
}

export async function simulateInteraction(sourceId: string, targetId: string, content: string, eventType: string, model?: OracleProvider) {
  const analysis = await generateMemorySummary(`Interaction (${eventType}): ${content}`, model);
  
  // Save memory for the target
  await prisma.memoryEvent.create({
    data: {
      npcId: targetId,
      rawContent: content,
      summary: analysis.summary,
      importance: analysis.importance,
      tags: analysis.tags.join(','),
    }
  });

  const delta = await processTrustUpdate(eventType);
  await adjustTrustState(sourceId, targetId, delta);
  
  // New: Target NPC reacts to the interaction
  const reaction = await decideAction(targetId, `I was just subjected to ${eventType} by another survivor. They said: "${content}"`);
  
  return { 
    trustDelta: delta, 
    summary: analysis.summary, 
    modelUsed: model || process.env.ORACLE_MODEL,
    targetReaction: reaction 
  };
}

export async function decideNextTask(npcId: string): Promise<{ task: string, duration: number, reason: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const npc = await prisma.nPC.findUnique({ where: { id: npcId } }) as any;
  if (!npc) return { task: "IDLE", duration: 0, reason: "NPC_NOT_FOUND" };

  const skills = npc.skills as Record<string, number> || {};
  const habits = npc.habits as string[] || [];

  if (process.env.OPENAI_API_KEY) {
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
            { role: 'system', content: `You are ${npc.name}. 
              Stats: Health ${npc.health}%.
              Skills: ${JSON.stringify(skills)}.
              Habits: ${JSON.stringify(habits)}.
              Decide on your next task (e.g., SCAVENGING, TRAINING, RESTING, SOCIALIZING, WORKING).
              Return JSON: { "task": string, "duration": number (minutes), "reason": string }` 
            },
            { role: 'user', content: "What do you do next?" }
          ],
          response_format: { type: "json_object" }
        })
      });
      const data = await res.json();
      const decision = JSON.parse(data.choices[0]?.message?.content || '{}');
      return { 
        task: decision.task || "IDLE", 
        duration: decision.duration || 15, 
        reason: decision.reason || "Uncertainty" 
      };
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback
  if (npc.health < 50) return { task: "RESTING", duration: 60, reason: "Low health" };
  return { task: "PATROLLING", duration: 30, reason: "Routine patrol" };
}
