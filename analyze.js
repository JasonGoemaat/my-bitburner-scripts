// Analyze a server

import { default as f } from '/lib/formulas.js'
import { default as format } from '/lib/format.js'

const showUsage = ns => {
	ns.tprint('Usage: run analyze.js (options) [target]')
	ns.tprint('  [target] - target machine')
	ns.tprint('	 Options:')
	ns.tprint('		--json   			 - show JSON of data')
	ns.tprint('		--batch  			 - show batch info')
	ns.tprint('		--profit 			 - show profit info')
	ns.tprint('		--prep [host]		 - prep target using host')
	ns.tprint('		--wait   			 - wait for prep and alert')
	ns.tprint('		--detail [hackCount] - batch detail for given hackCount')
	ns.tprint('		--delay [ms] 		 - delay between batch components (default 500)')
}

/** @param {NS} ns */
export async function main(ns) {
	// if (ns.args.length === 0) return showUsage(ns)
	// let args = [...ns.args]
	// if (args[0] === '-all') {
	// 	args.shift()
	// 	if (args.length !== 3) return showUsage(ns)
	// }

	let args = [...ns.args]
	let optionJson = false
	let optionBatch = false
	let optionProfit = false
	let optionPrep = null
	let optionDetail = 0
	let optionDelay = 500
	for (let i = 0; i < args.length;) {
		const optionName = `${args[i]}`;
		if (optionName.substring(0, 2) === '--') {
			args.splice(i, 1)
			switch (optionName) {
				case '--json':
					optionJson = true
					break
				case '--batch':
					optionBatch = true
					break
				case '--profit':
					optionProfit = true
					break
				case '--prep':
					optionPrep = args.splice(i, 1)[0]
					break
				case '--wait':
					optionWait = true
					break
				case '--detail':
					optionDetail = args.splice(i, 1)[0]
					break
				case '--delay':
					optionDelay = args.splice(i, 1)[0]
					break
				default:
					ns.tprint(`ERROR!   Unknown option '${optionName}'`)
					showUsage(ns)
					return
			}
		} else {
			i++
		}
	}
	let [target] = args
	let host = optionPrep
	ns.tprint(`Analyzing target '${target}'' with host '${host}'`)
	if (!target) {
		ns.tprint(`ERROR!  target not specified!`)
		showUsage(ns)
		return
	}
	
	const server = await ns.getServer(target)
	const prepped = {...server, hackDifficulty: server.minDifficulty, moneyAvailable: server.moneyMax}
	const player = await ns.getPlayer()
	const threads = 1
	const cores = 1

	const base = {
		hackTime: await ns.getHackTime(target),
		weakenTime: await ns.getWeakenTime(target),
		growTime: await ns.getGrowTime(target),
		growthSecurity: await ns.growthAnalyzeSecurity(1, target, 1),
		weaken: await ns.weakenAnalyze(1, 1),
		hackSecurity: await ns.hackAnalyzeSecurity(1, target),
		hack: await ns.hackAnalyze(target), // part of money stolen with single thread
		s1: await ns.growthAnalyze(target, 1.00245212), // is .245212% for each (multiplier is 1.00245212)
		s2: await ns.growthAnalyze(target, Math.pow(1.00245212, 2)), // is .245212% for each (multiplier is 1.00245212)
		s3: await ns.growthAnalyze(target, Math.pow(1.00245212, 3)), // is .245212% for each (multiplier is 1.00245212)
		s4: await ns.growthAnalyze(target, Math.pow(1.00245212, 4)), // is .245212% for each (multiplier is 1.00245212)
	}

	// const bnmultipliers = ns.getBitNodeMultipliers() // Requires Source-File-5 to run
	// ns.tprint(`BitNodeMultipliers: ${JSON.stringify(bnmultipliers, null, 2)}`)

	const real = {
		growPercent: await ns.formulas.hacking.growPercent(server, threads, player, cores),
		growTime: await ns.formulas.hacking.growTime(server, player),
		hackChance: await ns.formulas.hacking.hackChance(server, player),
		hackExp: await ns.formulas.hacking.hackExp(server, player),
		hackPercent: await ns.formulas.hacking.hackPercent(server, player),
		hackTime: await ns.formulas.hacking.hackTime(server, player),
		weakenTime: await ns.formulas.hacking.weakenTime(server, player)
	}
	
	const realPrepped = {
		growPercent: await ns.formulas.hacking.growPercent(prepped, threads, player, cores),
		growTime: await ns.formulas.hacking.growTime(prepped, player),
		hackChance: await ns.formulas.hacking.hackChance(prepped, player),
		hackExp: await ns.formulas.hacking.hackExp(prepped, player),
		hackPercent: await ns.formulas.hacking.hackPercent(prepped, player),
		hackTime: await ns.formulas.hacking.hackTime(prepped, player),
		weakenTime: await ns.formulas.hacking.weakenTime(prepped, player)
	}
	
	const data = {
		base,
		hackingMultipliers: ns.getHackingMultipliers(),
		all: f.all(server, player, 1, 1),
		real,
		realPrepped
	}

	const weakensNeeded = (server.hackDifficulty - server.minDifficulty) / 0.05
	const moneyNeeded = server.moneyMax - server.moneyAvailable
	const percentNeeded = moneyNeeded / server.moneyAvailable
	const growsNeeded = percentNeeded / (data.real.growPercent - 1)
	const totalWeakensNeeded = weakensNeeded + Math.ceil(growsNeeded * 0.004 / 0.050)

	const cycleLength = (data.realPrepped.weakenTime + optionDelay * 4)
	const cycleSeconds = Math.trunc(cycleLength) / 1000
	const batchesPerCycle = Math.trunc(cycleLength / (optionDelay * 5))

	//ns.tprint(JSON.stringify({weakensNeeded, moneyNeeded, percentNeeded, growsNeeded}))
	ns.tprint(`Need ${weakensNeeded} weakens and ${growsNeeded} grows (${totalWeakensNeeded} weakens including grows)`)
	ns.tprint(`Server size: ${format.money(server.moneyMax)}, seconds to weaken: ${Math.trunc(data.real.weakenTime)/1000}`)
	ns.tprint(`Batch cycle takes ${cycleSeconds} seconds for ${batchesPerCycle} batches`)

	let results = []
	for (let hackCount = 1; hackCount <= 30; hackCount++) {
		let hackFraction = Math.min(1, data.realPrepped.hackPercent * hackCount) // hackPercent is really hackFraction
		let hackWeakens = Math.ceil(hackCount * 0.002 / 0.050)
		let moneyHacked = Math.trunc(server.moneyMax * hackFraction)
		let moneyRemaining = server.moneyMax - moneyHacked
		let growFractionNeeded = moneyHacked / moneyRemaining
		let growCount = Math.ceil(growFractionNeeded / (data.realPrepped.growPercent - 1))
		let growWeakens = Math.ceil(growCount * 0.004 / 0.050)
		let requiredGB = Math.ceil((hackCount + hackWeakens + growCount + growWeakens) * 1.8)
		// let profit = moneyHacked / requiredGB / 0.5
		let totalGB = requiredGB * batchesPerCycle
		let paddedGB = requiredGB * (batchesPerCycle + 2) // padded for scheduling 2 batches ahead
		let totalMoney = moneyHacked * batchesPerCycle
		let totalProfit = totalMoney / cycleSeconds

		let messageBatch = `Batch: ${('' + hackCount).padStart(2)} hacks, ${hackWeakens} weakens, ${growCount} grows, ${growWeakens} weakens, gain ${format.money(moneyHacked)}`
		let totalProfitPerGB = totalProfit / totalGB
		
		let messageProfit = `${('' + hackCount).padStart(2)} hacks gives ${format.money(moneyHacked * batchesPerCycle).padStart(9)} in ${cycleSeconds} seconds at ${format.money(totalProfit).padStart(9)}/s requiring ${format.gb(totalGB).padStart(9)} - ${format.money(totalProfitPerGB)}/gb/s`

		results.push({ 
			hackCount, hackWeakens, growCount, growWeakens,
			cycleSeconds, batchesPerCycle, totalGB, totalMoney, totalProfit,
			totalProfitPerGB, paddedGB,
			messageBatch, messageProfit,
			detail: {
				hackCount, hackFraction, hackWeakens, moneyHacked, moneyRemaining, growFractionNeeded,
				growCount, growWeakens, requiredGB, cycleLength, cycleSeconds, batchesPerCycle,
				totalGB, totalMoney, totalProfit, totalProfitPerGB, paddedGB
			}
		})
	}

	if (optionJson) ns.tprint(`all: ${JSON.stringify(data, null, 2)}`)

	if (optionBatch) {
		ns.tprint('')
		ns.tprint(`Batch info for ${target}`)
		results.forEach(x => ns.tprint(x.messageBatch))
	}

	if (optionProfit) {
		ns.tprint('')
		ns.tprint(`Profit info for ${target}`)
		results.forEach(x => ns.tprint(x.messageProfit))
	}

	if (optionDetail) {
		ns.tprint('')
		ns.tprint(`Profit info for ${target} with ${optionDetail} hacks per batch`)
		let detail = results.find(x => x.hackCount === optionDetail)
		ns.tprint(`type of optionDetail is ${typeof(optionDetail)}`)
		if (!detail) {
			ns.tprint(`ERROR!  Detail not found for ${optionDetail} hacks`)
			return
		}
		ns.tprint(JSON.stringify(detail, null, 2))
	}

	if (optionPrep) {
		// really should have a remote/prep.js script for this...
		ns.tprint('')
		ns.tprint(`Prepping ${target} using ${host}`)
		ns.tprint(`Need ${weakensNeeded} weakens and ${growsNeeded} grows (${totalWeakensNeeded} weakens including grows)`)
		await ns.scp(['/remote/grow.js', '/remote/weaken.js', '/remote/hack.js'], host)
		const timeString = `${Math.trunc(performance.now())}`
		const pidGrow = await ns.exec('/remote/grow.js', host, growsNeeded, target, timeString)
		const pidWeaken = await ns.exec('/remote/weaken.js', host, totalWeakensNeeded + 5, target, timeString)
		while (true) {
			await ns.sleep(100)
			const growRunning = await ns.isRunning(pidGrow, host)
			const weakenRunning = await ns.isRunning(pidWeaken, host)
			if (!(growRunning || weakenRunning)) {
				ns.tprint('--------------------------------------------------------------------------------')
				ns.tprint(`-- PREP OF ${target} FINISHED!`)
				ns.tprint('--------------------------------------------------------------------------------')
				break;
			}
		}
	}

	ns.tprint('')
	const all = [...results]
	all.sort((a, b) => b.totalProfitPerGB - a.totalProfitPerGB)
	const rec = all[0]
	ns.tprint(rec.messageBatch)
	ns.tprint(rec.messageProfit)
	ns.tprint('')
	ns.tprint(`Server max money: ${format.money(server.moneyMax)}`)
	ns.tprint(`Recommendation (requires ${format.gb(rec.paddedGB)}):`)
	ns.tprint(`    run batch.js ${target} [host] ${rec.hackCount}`)
	
	// debug sorting
	// all.forEach(x => ns.tprint(x.messageProfit, x.totalProfitPerGB))

}