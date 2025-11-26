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

export async function generateChatResponse(npcId: string, playerId: string, playerMessage: string): Promise<{ response: string, mission?: any }> {
  const npc = await prisma.nPC.findUnique({ 
    where: { id: npcId },
    include: { 
      factionRef: true,
      wallet: true,
      inventory: { include: { item: true } }
    }
  });
  if (!npc) return { response: "..." };

  // Calculate Budget for Missions
  const budget = {
    credits: npc.wallet?.balance || 0,
    items: npc.inventory.map(i => ({ id: i.item.id, name: i.item.name, qty: i.quantity }))
  };

  // Fetch recent memories to inform decision
  const recentMemories = await prisma.memoryEvent.findMany({
    where: { npcId },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  const memoryContext = recentMemories.map(m => `[${m.createdAt.toISOString().split('T')[0]}] ${m.summary}`).join("; ");

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
              Personality: ${npc.alignment || 'Neutral'}.
              Memories: ${memoryContext}.
              Budget: ${JSON.stringify(budget)}.
              You are talking to another survivor.
              If they ask for a mission or work, or if you need help, you can offer a mission IF you have the budget.
              
              Return JSON: { 
                "response": "Your spoken response to the player", 
                "offerMission": boolean,
                "missionDetails": { 
                  "title": string, 
                  "description": string, 
                  "rewards": { "credits": number, "itemId": string (optional, must be from Budget) } 
                } (optional, only if offerMission is true)
              }` 
            },
            { role: 'user', content: playerMessage }
          ],
          response_format: { type: "json_object" }
        })
      });
      const data = await res.json();
      const decision = JSON.parse(data.choices[0]?.message?.content || '{}');
      
      let mission = null;
      if (decision.offerMission && decision.missionDetails) {
        // Validate Budget
        const cost = decision.missionDetails.rewards?.credits || 0;
        const itemId = decision.missionDetails.rewards?.itemId;

        let canAfford = true;
        if (cost > budget.credits) canAfford = false;
        if (itemId && !budget.items.find(i => i.id === itemId)) canAfford = false;

        if (canAfford) {
          mission = await prisma.mission.create({
            data: {
              title: decision.missionDetails.title,
              description: decision.missionDetails.description,
              rewards: decision.missionDetails.rewards,
              giverId: npcId,
              receiverId: playerId,
              status: 'PENDING'
            }
          });
        } else {
          decision.response += " (I thought about offering you a job, but I can't afford it right now.)";
        }
      }

      return { response: decision.response, mission };

    } catch (e) {
      console.error(e);
      return { response: "I... I can't think right now." };
    }
  }
  return { response: "I don't have much to say." };
}

export async function decideEconomicAction(npcId: string): Promise<{ action: string, listingId?: string, itemName?: string, cost?: number }> {
  const npc = await prisma.nPC.findUnique({ 
    where: { id: npcId },
    include: { wallet: true }
  });

  if (!npc || !npc.wallet) return { action: "NO_WALLET" };

  const balance = npc.wallet.balance;
  
  // Fetch real market listings
  const listings = await prisma.marketListing.findMany({
    where: { active: true },
    include: { item: true }
  });

  const affordableListings = listings.filter(l => l.price <= balance);
  
  if (affordableListings.length === 0) return { action: "POOR" };

  // Simplify for AI context
  const marketContext = affordableListings.map(l => ({
    id: l.id,
    name: l.item.name,
    type: l.item.type,
    price: l.price,
    stats: l.item.stats
  }));

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
              Available Market Listings: ${JSON.stringify(marketContext)}.
              Decide if you want to buy something to help your survival (Weapon, Armor, Consumable).
              Return JSON: { "buy": boolean, "listingId": string | null, "reason": string }` 
            },
            { role: 'user', content: "Do you make a purchase?" }
          ],
          response_format: { type: "json_object" },
          max_tokens: 100
        })
      });
      const data = await res.json();
      const decision = JSON.parse(data.choices[0]?.message?.content || '{}');

      if (decision.buy && decision.listingId) {
        const listing = listings.find(l => l.id === decision.listingId);
        if (listing) {
          return { action: "BUY", listingId: listing.id, itemName: listing.item.name, cost: listing.price };
        }
      }
      return { action: "HOLD" };
    } catch (e) {
      console.error(e);
      return { action: "ERROR" };
    }
  }
  
  // Fallback Logic (No AI)
  // Buy a weapon if we don't have one and can afford it
  const weapon = affordableListings.find(l => l.item.type === 'WEAPON');
  if (weapon) return { action: "BUY", listingId: weapon.id, itemName: weapon.item.name, cost: weapon.price };

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
  
  let reaction = "";
  let mission = null;

  if (eventType === 'CHAT') {
    const chatResult = await generateChatResponse(targetId, sourceId, content);
    reaction = chatResult.response;
    mission = chatResult.mission;
  } else {
    reaction = await decideAction(targetId, `I was just subjected to ${eventType} by another survivor. They said: "${content}"`);
  }
  
  return { 
    trustDelta: delta, 
    summary: analysis.summary, 
    modelUsed: model || process.env.ORACLE_MODEL,
    targetReaction: reaction,
    mission
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

export async function processNPCTurn(npcId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const npc = await prisma.nPC.findUnique({ where: { id: npcId } }) as any;
  if (!npc) return;

  // 1. Check if busy
  if (npc.actionExpiresAt && new Date(npc.actionExpiresAt) > new Date()) {
    return { status: 'BUSY', action: npc.currentAction };
  }

  // 2. Decide next task
  const decision = await decideNextTask(npcId);
  
  // 3. Execute Task Logic
  let log = `NPC ${npc.name} decided to ${decision.task} (${decision.reason})`;

  if (decision.task === 'SOCIALIZING') {
    // Find a random target
    const potentialTargets = await prisma.nPC.findMany({
      where: { 
        id: { not: npcId },
        // @ts-ignore
        status: 'ALIVE'
      },
      take: 5
    });
    
    if (potentialTargets.length > 0) {
      const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
      const interaction = await simulateInteraction(npcId, target.id, "Greetings, survivor.", "GREET");
      log += ` -> Interacted with ${target.name}: "${interaction.targetReaction}"`;
    }
  } else if (decision.task === 'SCAVENGING') {
    // Simple loot logic
    const foundCredits = Math.floor(Math.random() * 20);
    if (foundCredits > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { ownerId: npcId } });
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: foundCredits } }
        });
        log += ` -> Found ${foundCredits} credits.`;
      }
    }
  }

  // 4. Update State
  await prisma.nPC.update({
    where: { id: npcId },
    data: {
      // @ts-ignore
      currentAction: decision.task,
      // @ts-ignore
      actionExpiresAt: new Date(Date.now() + decision.duration * 60000) // duration in minutes
    }
  });

  return { status: 'NEW_ACTION', action: decision.task, log };
}
