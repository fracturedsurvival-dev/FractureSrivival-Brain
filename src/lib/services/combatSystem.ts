import prisma from '@/lib/db';

export async function executeAttack(attackerId: string, defenderId: string) {
  const attacker = await prisma.nPC.findUnique({ 
    where: { id: attackerId },
    include: { inventory: { where: { equipped: true }, include: { item: true } } }
  });
  const defender = await prisma.nPC.findUnique({ 
    where: { id: defenderId },
    include: { inventory: { where: { equipped: true }, include: { item: true } } }
  });

  if (!attacker || !defender) throw new Error("INVALID_COMBATANTS");
  if (defender.status === 'DEAD') throw new Error("TARGET_ALREADY_DEAD");

  // Calculate Attacker Stats
  let attackPower = 5; // Base unarmed damage
  let weaponName = "Fists";
  
  const weapon = attacker.inventory.find(i => i.item.type === 'WEAPON');
  if (weapon) {
    const stats = weapon.item.stats as { damage?: number };
    if (stats?.damage) attackPower = stats.damage;
    weaponName = weapon.item.name;
  }

  // Calculate Defender Stats
  let defense = 0;
  let armorName = "None";

  const armor = defender.inventory.find(i => i.item.type === 'ARMOR');
  if (armor) {
    const stats = armor.item.stats as { defense?: number };
    if (stats?.defense) defense = stats.defense;
    armorName = armor.item.name;
  }

  // Damage Formula
  // Roll between 50% and 100% of attack power
  const roll = (Math.random() * 0.5) + 0.5;
  const rawDamage = Math.floor(attackPower * roll);
  
  // Defense reduces damage flatly, but always at least 1 damage
  const mitigatedDamage = Math.max(1, rawDamage - defense);
  
  const crit = Math.random() > 0.9; // 10% crit chance
  const damage = Math.floor(crit ? mitigatedDamage * 1.5 : mitigatedDamage);

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
  const attackDesc = `Attacked ${defender.name} with ${weaponName} dealing ${damage} damage.${crit ? ' (CRITICAL HIT)' : ''}`;
  const defendDesc = `Attacked by ${attacker.name} (${weaponName}) taking ${damage} damage.${defense > 0 ? ` My ${armorName} absorbed some impact.` : ''}${newStatus === 'DEAD' ? ' I have fallen.' : ''}`;

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
