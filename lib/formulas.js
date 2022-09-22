/**
 * Returns the chance the player has to successfully hack a server
 */
export function calculateHackingChance(server, player) {
  const hackFactor = 1.75;
  const difficultyMult = (100 - server.hackDifficulty) / 100;
  const skillMult = hackFactor * player.skills.hacking;
  const skillChance = (skillMult - server.requiredHackingSkill) / skillMult;
  const chance =
    skillChance *
    difficultyMult *
    player.mults.hacking_chance *
    calculateIntelligenceBonus(player.skills.intelligence, 1);
  if (chance > 1) {
    return 1;
  }
  if (chance < 0) {
    return 0;
  }

  return chance;
}

/**
 * Returns the amount of hacking experience the player will gain upon
 * successfully hacking a server
 */
export function calculateHackingExpGain(server, player) {
  const baseExpGain = 3;
  const diffFactor = 0.3;
  if (server.baseDifficulty == null) {
    server.baseDifficulty = server.hackDifficulty;
  }
  let expGain = baseExpGain;
  expGain += server.baseDifficulty * diffFactor;

  return expGain * player.mults.hacking_exp * BitNodeMultipliers.HackExpGain;
}

/**
 * Returns the percentage of money that will be stolen from a server if
 * it is successfully hacked (returns the decimal form, not the actual percent value)
 */
export function calculatePercentMoneyHacked(server, player) {
  // Adjust if needed for balancing. This is the divisor for the final calculation
  const balanceFactor = 240;

  const difficultyMult = (100 - server.hackDifficulty) / 100;
  const skillMult = (player.skills.hacking - (server.requiredHackingSkill - 1)) / player.skills.hacking;
  const percentMoneyHacked =
    (difficultyMult * skillMult * player.mults.hacking_money * BitNodeMultipliers.ScriptHackMoney) / balanceFactor;
  if (percentMoneyHacked < 0) {
    return 0;
  }
  if (percentMoneyHacked > 1) {
    return 1;
  }

  return percentMoneyHacked;
}

/**
 * Returns time it takes to complete a hack on a server, in seconds
 */
export function calculateHackingTime(server, player) {
  const difficultyMult = server.requiredHackingSkill * server.hackDifficulty;

  const baseDiff = 500;
  const baseSkill = 50;
  const diffFactor = 2.5;
  let skillFactor = diffFactor * difficultyMult + baseDiff;
  // tslint:disable-next-line
  skillFactor /= player.skills.hacking + baseSkill;

  const hackTimeMultiplier = 5;
  const hackingTime =
    (hackTimeMultiplier * skillFactor) /
    (player.mults.hacking_speed * calculateIntelligenceBonus(player.skills.intelligence, 1));

  return hackingTime;
}

/**
 * Returns time it takes to complete a grow operation on a server, in seconds
 */
export function calculateGrowTime(server, player) {
  const growTimeMultiplier = 3.2; // Relative to hacking time. 16/5 = 3.2
  return growTimeMultiplier * calculateHackingTime(server, player);
}

/**
 * Returns time it takes to complete a weaken operation on a server, in seconds
 */
export function calculateWeakenTime(server, player) {
  const weakenTimeMultiplier = 4; // Relative to hacking time
  return weakenTimeMultiplier * calculateHackingTime(server, player);
}

export default {
  calculateHackingChance,
  calculateHackingExpGain,
  calculatePercentMoneyHacked,
  calculateHackingTime,
  calculateGrowTime,
  calculateWeakenTime
}