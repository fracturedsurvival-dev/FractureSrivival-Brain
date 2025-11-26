import prisma from '@/lib/db';

export async function executeAttack(attackerId: string, defenderId: string) {
  const attacker = await prisma.nPC.findUnique({ where: { id: attackerId } });
  const defender = await prisma.nPC.findUnique({ where: { id: defenderId } });

  if (!attacker || !defender) throw new Error("INVALID_COMBATANTS");
  if (defender.status === 'DEAD') throw new Error("TARGET_ALREADY_DEAD");

  // Simple damage logic (can be expanded with items/stats later)
  const baseDamage = Math.floor(Math.random() * 20) + 5; // 5-25 damage
  const crit = Math.random() > 0.8;
  const damage = crit ? baseDamage * 2 : baseDamage;

  const newHealth = Math.max(0, defender.health - damage);
  const newStatus = newHealth === 0 ? 'DEAD' : (newHealth < 30 ? 'INJURED' : 'ALIVE');

  // Update Defender
  await prisma.nPC.update({
    where: { id: defenderId },
    data: { 
      health: newHealth,
      status: newStatus
    }
  });

  // Create Memories
  const attackDesc = `Attacked ${defender.name} dealing ${damage} damage.${crit ? ' (CRITICAL HIT)' : ''}`;
  const defendDesc = `Attacked by ${attacker.name} taking ${damage} damage.${newStatus === 'DEAD' ? ' I have fallen.' : ''}`;

  await prisma.memoryEvent.create({
    data: {
      npcId: attackerId,
      rawContent: attackDesc,
      summary: `Fought ${defender.name}`,
      importance: 5,
      tags: 'combat,violence'
    }
  });

  await prisma.memoryEvent.create({
    data: {
      npcId: defenderId,
      rawContent: defendDesc,
      summary: `Attacked by ${attacker.name}`,
      importance: 8,
      tags: 'combat,survival,trauma'
    }
  });

  // Trust Update (Massive penalty)
  await prisma.trustEvent.create({
    data: {
      sourceId: defenderId,
      targetId: attackerId,
      delta: -50,
      resultingTrust: -100, // Force hatred
      eventType: 'COMBAT'
    }
  });

  return {
    damage,
    crit,
    defenderHealth: newHealth,
    defenderStatus: newStatus,
    message: crit ? `CRITICAL HIT! ${damage} damage!` : `${damage} damage dealt.`
  };
}
