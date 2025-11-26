import prisma from '@/lib/db';

export async function applyEventEffects(event: { id: string, type: string, title: string }) {
  let log = `Event Effect: ${event.title}`;
  
  switch (event.type) {
    case 'WEATHER':
      // Acid Rain / Storms: Damage random NPCs
      const victims = await prisma.nPC.findMany({ take: 3, where: { status: 'ALIVE' } }); // Random-ish
      for (const npc of victims) {
        const dmg = Math.floor(Math.random() * 10) + 1;
        await prisma.nPC.update({
          where: { id: npc.id },
          data: { health: { decrement: dmg } }
        });
      }
      log += ` -> Damaged ${victims.length} survivors.`;
      break;
      
    case 'RESOURCE':
      // Supply Drop: Heal random NPCs
      const lucky = await prisma.nPC.findMany({ take: 3, where: { status: 'ALIVE' } });
      for (const npc of lucky) {
        await prisma.nPC.update({
          where: { id: npc.id },
          data: { health: { increment: 10 } } // Cap at 100 logic needed? Prisma doesn't cap automatically.
        });
      }
      log += ` -> Healed ${lucky.length} survivors.`;
      break;

    case 'POLITICAL':
      // Tensions rise: Reduce trust globally?
      // For now, just log it.
      log += ` -> Faction tensions rising.`;
      break;
  }
  return log;
}

export async function advanceWorldTime() {
  const logs: string[] = [];

  // 1. Process Active Events
  const activeEvents = await prisma.worldEvent.findMany({ where: { active: true } });
  for (const event of activeEvents) {
    // Apply effect
    const effectLog = await applyEventEffects(event);
    logs.push(effectLog);

    // Chance to end event (30%)
    if (Math.random() < 0.3) {
      await prisma.worldEvent.update({
        where: { id: event.id },
        data: { active: false }
      });
      logs.push(`Event Ended: ${event.title}`);
    }
  }

  // 2. Chance for New Event (50% if no active events, 10% otherwise)
  const spawnChance = activeEvents.length === 0 ? 0.5 : 0.1;
  if (Math.random() < spawnChance) {
    const newEvent = await generateWorldEvent();
    logs.push(`New Event Generated: ${newEvent.title}`);
  }

  return {
    timestamp: new Date(),
    logs
  };
}

export async function generateWorldEvent() {
  // 1. Get context
  const recentEvents = await prisma.worldEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  const context = recentEvents.map(e => `${e.type}: ${e.title} - ${e.description}`).join('\n');

  // 2. Call Oracle
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
            { role: 'system', content: 'You are the World Engine for a dystopian survival simulation. Generate a new world event based on recent history. Return a JSON object with keys: title, description, type (WEATHER, POLITICAL, INVASION, RESOURCE, ANOMALY).' },
            { role: 'user', content: `Recent History:\n${context}\n\nGenerate next event:` }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      const data = await res.json();
      const content = JSON.parse(data.choices[0].message.content);
      
      return await prisma.worldEvent.create({
        data: {
          title: content.title,
          description: content.description,
          type: content.type
        }
      });

    } catch (e) {
      console.error("World Engine Error:", e);
      // Fallback if API fails
    }
  }
  
  // Fallback
  return await prisma.worldEvent.create({
    data: {
      title: "Static Interference",
      description: "The world simulation experiences a momentary lapse in coherence.",
      type: "ANOMALY"
    }
  });
}
