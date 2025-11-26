import prisma from '@/lib/db';

export async function evaluateFactionTurn(factionId: string) {
  const faction = await prisma.faction.findUnique({
    where: { id: factionId },
    include: { members: true }
  });

  if (!faction) throw new Error("FACTION_NOT_FOUND");

  // Fetch World Context
  const activeEvents = await prisma.worldEvent.findMany({ where: { active: true } });
  const worldContext = activeEvents.map(e => e.title).join(", ");

  let action = "MAINTAIN";
  let resourceChange = -5; // Daily upkeep
  let log = "Routine maintenance.";

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
            { role: 'system', content: `You are the leader of the faction "${faction.name}". 
              Description: ${faction.description}.
              Current Goals: ${faction.goals}.
              Resources: ${faction.resources}.
              Members: ${faction.members.length}.
              World Events: ${worldContext || "None"}.
              
              Decide on a strategic move for this turn.
              Options:
              - EXPAND (Cost: 20, Risk: High)
              - FORTIFY (Cost: 10, Risk: Low)
              - SCAVENGE (Gain: 10-30, Risk: Med)
              - RECRUIT (Cost: 15, Risk: Low)
              
              Return JSON: { "action": "EXPAND"|"FORTIFY"|"SCAVENGE"|"RECRUIT", "reasoning": "string", "newGoal": "string (optional update)" }` 
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 150
        })
      });
      
      const data = await res.json();
      const decision = JSON.parse(data.choices[0]?.message?.content || '{}');
      
      action = decision.action || "MAINTAIN";
      log = decision.reasoning || "No clear strategy.";
      
      // Apply Logic
      switch (action) {
        case 'EXPAND':
          resourceChange = -20;
          break;
        case 'FORTIFY':
          resourceChange = -10;
          break;
        case 'SCAVENGE':
          resourceChange = Math.floor(Math.random() * 20) + 10;
          break;
        case 'RECRUIT':
          resourceChange = -15;
          break;
      }

      // Update Goals if AI suggests it
      if (decision.newGoal) {
        await prisma.faction.update({
          where: { id: factionId },
          data: { goals: decision.newGoal }
        });
      }

    } catch (e) {
      console.error("Faction AI Error", e);
      log = "AI_OFFLINE: Defaulting to maintenance.";
    }
  }

  // Apply Resource Change
  const newResources = Math.max(0, faction.resources + resourceChange);
  await prisma.faction.update({
    where: { id: factionId },
    data: { resources: newResources }
  });

  // Log Event (using TextBlob for now, or maybe a new FactionLog model later)
  // For now, we'll just return it to the UI
  
  return {
    faction: faction.name,
    action,
    resources: newResources,
    delta: resourceChange,
    reasoning: log
  };
}
