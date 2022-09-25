// Analyze a server
// test/analyze1.js - saving this version, it takes a hostname and gives
// how many grow and weaken threads total needed to get to min difficulty
// and max money, and plots how to run batches IF THE SERVER IS PREPPED

import { default as f } from '/lib/formulas.js'

/** @param {NS} ns */
export async function main(ns) {
	const hostname = ns.args[0] || await ns.getHostname()
	const server = await ns.getServer(hostname)
	const player = await ns.getPlayer()
	const threads = 1
	const cores = 1

	const base = {
		hackTime: await ns.getHackTime(hostname),
		weakenTime: await ns.getWeakenTime(hostname),
		growTime: await ns.getGrowTime(hostname),
		growthSecurity: await ns.growthAnalyzeSecurity(1, hostname, 1),
		weaken: await ns.weakenAnalyze(1, 1),
		hackSecurity: await ns.hackAnalyzeSecurity(1, hostname),
		hack: await ns.hackAnalyze(hostname), // part of money stolen with single thread
		s1: await ns.growthAnalyze(hostname, 1.00245212), // is .245212% for each (multiplier is 1.00245212)
		s2: await ns.growthAnalyze(hostname, Math.pow(1.00245212, 2)), // is .245212% for each (multiplier is 1.00245212)
		s3: await ns.growthAnalyze(hostname, Math.pow(1.00245212, 3)), // is .245212% for each (multiplier is 1.00245212)
		s4: await ns.growthAnalyze(hostname, Math.pow(1.00245212, 4)), // is .245212% for each (multiplier is 1.00245212)
	}

	// const bnmultipliers = ns.getBitNodeMultipliers() // Requires Source-File-5 to run
	// ns.tprint(`BitNodeMultipliers: ${JSON.stringify(bnmultipliers, null, 2)}`)

	ns.tprint(`formulas.js keys: ${JSON.stringify(Object.keys(f), null, 2)}`)
	
	const real = {
		growPercent: await ns.formulas.hacking.growPercent(server, threads, player, cores),
		growTime: await ns.formulas.hacking.growTime(server, player),
		hackChance: await ns.formulas.hacking.hackChance(server, player),
		hackExp: await ns.formulas.hacking.hackExp(server, player),
		hackPercent: await ns.formulas.hacking.hackPercent(server, player),
		hackTime: await ns.formulas.hacking.hackTime(server, player),
		weakenTime: await ns.formulas.hacking.weakenTime(server, player)
	}
	
	const data = {
		base,
		hackingMultipliers: ns.getHackingMultipliers(),
		all: f.all(server, player, 1, 1),
		real,
	}

	ns.tprint(`all: ${JSON.stringify(data, null, 2)}`)

	const weakensNeeded = (server.hackDifficulty - server.minDifficulty) / 0.05
	const moneyNeeded = server.moneyMax - server.moneyAvailable
	const percentNeeded = moneyNeeded / server.moneyAvailable
	const growsNeeded = percentNeeded / (data.real.growPercent - 1)

	ns.tprint(JSON.stringify({weakensNeeded, moneyNeeded, percentNeeded, growsNeeded}))

	ns.tprint(`Need ${weakensNeeded} weakens and ${growsNeeded} grows`)

	for (let i = 1; i <= 30; i++) {
		let hackFraction = Math.min(1, Math.trunc(real.hackPercent * i * 1000) / 1000)
		let hackWeakens = Math.ceil(i * 0.002 / 0.050)

		let moneyHacked = Math.trunc(server.moneyMax * hackFraction)
		let moneyRemaining = server.moneyMax - moneyHacked
		let growFractionNeeded = moneyHacked / moneyRemaining
		let growsNeeded = Math.ceil(growFractionNeeded / (real.growPercent - 1))
		let growWeakens = Math.ceil(growsNeeded * 0.004 / 0.050)
		ns.tprint(`Batch: ${('' + i).padStart(2)} hacks, ${hackWeakens} weakens, ${growsNeeded} grows, ${growWeakens} weakens, gain ${moneyHacked}`)
	}

	// ns.tprint(`formulas: ${JSON.stringify(Object.keys(formulas))}`)
	// ["calculateGrowTime","calculateHackingChance","calculateHackingExpGain","calculateHackingTime","calculatePercentMoneyHacked","calculateWeakenTime","default"]
	// const weakenTime = f.weakenTime(server, player)
	// ns.tprint(`Weaken time: ${weakenTime}`)
	// const start = performance.now()
	// await ns.weaken(hostname)
	// const end = performance.now()
	// ns.tprint(`Weakened in ${(end - start)/1000} seconds`)

	// sample:
	// Running script with 1 thread(s), pid 19 and args: ["nectar-net"].
	// analyze.js: Weaken time: 92.67625965396027
	// weaken: Executing on 'nectar-net' in 1 minutes 32.676 seconds (t=1)
	// analyze.js: Weakened in 92.67759999990463 seconds
}