import { default as formulas} from '/lib/formulas.js'
import { default as format } from '/lib/format.js'

const showUsage = ns => {
	ns.tprint('Usage: run batch.js (options) [target] [host] [hackCount]')
	ns.tprint('  [target] 	 - target machine')
	ns.tprint('  [host] 	 - host machine')
	ns.tprint('  [hackCount] - hack threads per batch')
	ns.tprint('	 Options:')
	ns.tprint('		--delay [ms] - delay between batch components (default 500)')
}


/** @param {NS} ns 
 * @param {string} host
 * @param {number} addedDifficulty - weakens will take longer than if minimum security
*/
const calculateTimes = (server, player, hackCount, growCount) => {
	let localServer = {...server}
	localServer.hackDifficulty = server.minDifficulty
	localServer.moneyAvailable = server.moneyMax
	let localServerHacked = {...localServer, hackDifficulty: server.minDifficulty + (hackCount || 0) * 0.002}
	let localServerGrown = {...localServer, hackDifficulty: server.minDifficulty + (growCount || 0) * 0.004}
	return {
		hackMs: formulas.hackingTime(localServer, player) * 1000,
		growMs: formulas.growTime(localServer, player) * 1000,
		weakenMs: formulas.weakenTime(localServer, player) * 1000,
		weakenHackMs: formulas.weakenTime(localServerHacked, player) * 1000,
		weakenGrowMs: formulas.weakenTime(localServerGrown, player) * 1000,
	}
}

/** @param {NS} ns 
 * @param {string} host
*/
const calculate = (server, player, hackCount) => {
	let localServer = {...server}
	localServer.hackDifficulty = server.minDifficulty
	localServer.moneyAvailable = server.moneyMax
	const data = {
		hackMs: formulas.hackingTime(server, player) * 1000,
		growMs: formulas.growTime(server, player) * 1000,
		weakenMs: formulas.weakenTime(server, player) * 1000,
		growth: formulas.serverGrowth(server, 1, player, 1) - 1, // will be for 1 thread, 1 core
		moneyMax: server.moneyMax,
		hackFraction: formulas.percentMoneyHacked(server, player),
	}

	const list = []
	const min = hackCount || 1
	const max = hackCount || 40
	for (let i = min; i <= max; i++) {
		let hackFraction = Math.min(1, data.hackFraction * i)
		let hackWeakens = Math.ceil(i * 0.002 / 0.050)
		let moneyHacked = Math.trunc(localServer.moneyMax * hackFraction)
		let moneyRemaining = server.moneyMax - moneyHacked
		let growFractionNeeded = moneyHacked / moneyRemaining
		let growsNeeded = Math.ceil(growFractionNeeded / data.growth)
		let growWeakens = Math.ceil(growsNeeded * 0.004 / 0.050)
		let requiredGB = Math.ceil((i + hackWeakens + growsNeeded + growWeakens) * 1.8)
		let profit = moneyHacked / requiredGB / 0.5
		let cycleLength = (data.weakenMs + 500)
		let cycleSeconds = Math.trunc(cycleLength) / 1000
		let cycles = Math.trunc(cycleLength / 500)
		let totalGB = requiredGB * cycles
		let totalMoney = moneyHacked * cycles
		let totalProfit = totalMoney / cycleSeconds

		list.push({
			...data,
			cycles,
			moneyHacked,
			hackCount: i,
			hackWeakens,
			growCount: growsNeeded,
			growWeakens,
			totalSeconds: Math.trunc(data.weakenMs + 400) / 1000,
			requiredScripts: Math.ceil(i + hackWeakens + growsNeeded + growWeakens),
			requiredGB,
			message: `Batch: ${('' + i).padStart(2)} hacks, ${hackWeakens} weakens, ${growsNeeded} grows, ${growWeakens} weakens, gain ${format.money(moneyHacked)} (need ${requiredGB} GB) profit ${format.money(profit)}/GB/s`,
			message2: `${i} hacks gives ${format.money(moneyHacked * cycles)} in ${cycleSeconds} seconds at ${format.money(totalProfit)}/s requiring ${format.gb(totalGB)}`
		})
	}

	return list
}


// this is my first attempt at batching
// trying on omega-net:
// analyze.js: Batch: 10 hacks, 1 weakens, 74 grows, 6 weakens, gain 58793010
// so each batch takes 91 total threads running at the same time to make 58 million dollars
//    "hackingTime": 0.9197585255721703,
//    "growTime": 2.943227281830945,
//    "weakenTime": 3.679034102288681,
// Takes a total of 91 threads running over 4 seconds, so we can run 5 

/** @param {NS} ns */
export async function main(ns) {
	let args = [...ns.args]
	let optionDelay = 500
	for (let i = 0; i < args.length;) {
		const optionName = `${args[i]}`;
		if (optionName.substring(0, 2) === '--') {
			args.splice(i, 1)
			switch (optionName) {
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
	let [target, host, hackCount] = args
	if (args.length != 3 || !target || !host || !hackCount) {
		showUsage(ns)
		return
	}

	await ns.scp('/remote/weaken.js', host)
	await ns.scp('/remote/grow.js', host)
	await ns.scp('/remote/hack.js', host)

	let player = await ns.getPlayer()
	let server = await ns.getServer(target)
	
	if (server.moneyAvailable < server.moneyMax) {
		ns.tprint('ERROR!  Money is not at max!')
		return;
	}
	
	if (server.hackDifficulty > server.minDifficulty) {
		ns.tprint('ERROR!  Difficulty is not at min!')
		return;
	}

	const data = calculate(server, player, hackCount)
	ns.tprint(`hackCount: ${hackCount} (type is ${typeof(hackCount)})`)
	ns.tprint(JSON.stringify(data))
	const chosen = data.filter(x => x.hackCount === hackCount)[0]
	let times = calculateTimes(server, player, chosen.hackCount, chosen.growCount)
	const schedule = []

	const scheduleCommand = (command, timeKey, count, batchId, targetTime) => {
		const item = {
			command, count, batchId: batchId.padEnd(20), targetTime,
			scheduleTime: () => targetTime - times[timeKey], // needs to adjust possible after scheduling
		}
		schedule.push(item)
	}

	// loop forever
	let targetTime = Math.trunc((performance.now() + times.weakenMs) / 100) * 100;
	let batchId = 1
	while(true) {
		// refresh times
		player = await ns.getPlayer()
		server = await ns.getServer(target)
		times = calculateTimes(server, player, chosen.hackCount, chosen.growCount)

		// make sure we're scheduled into the future
		while (targetTime - times.weakenMs <= performance.now() + (optionDelay * 4)) { // schedule ahead
			// weakens are cheap, throwing in an extra weaken thread on each
			scheduleCommand('hack', 'hackMs', chosen.hackCount, `hack ${batchId}`, targetTime)
			scheduleCommand('weaken', 'weakenHackMs', chosen.hackWeakens + 1, `weaken(hack) ${batchId}`, targetTime + optionDelay)
			scheduleCommand('grow', 'growMs', chosen.growCount, `grow ${batchId}`, targetTime + optionDelay * 2)
			scheduleCommand('weaken', 'weakenGrowMs', chosen.growWeakens + 1, `weaken(grow) ${batchId}`, targetTime + optionDelay * 3)
			targetTime += optionDelay * 4
			batchId++
		}

		schedule.sort((a, b) => a.scheduleTime() - b.scheduleTime())

		// for testing
		// var test = [...schedule]
		// test.sort((a, b) => a.targetTime - b.targetTime)
		// test.forEach(item => ns.tprint(JSON.stringify(item)));
		// return;

		if (schedule.length > 0) {
			const next = schedule.shift()
			let scheduleTime = next.scheduleTime()
			await ns.sleep(scheduleTime - performance.now())
			// verify that server is at min difficulty, or wait
			let si = await ns.getServer(target)
			let waitCount = 0
			while (si.hackDifficulty > si.minDifficulty && waitCount < 3) {
				await ns.sleep(25)
				waitCount++
				si = await ns.getServer(target)
			}
			if (performance.now() - next.scheduleTime() > optionDelay) {
				ns.tprint(`ERROR!   Waited, but server is not at min difficulty in time`)
				ns.tprint(`Failed command ${next.command} for batch ${next.batchId}`)
				ns.tprint(`${si.hackDifficulty} difficulty, and min is ${si.minDifficulty}`)
				ns.tprint(`Now: ${performance.now()}, next.scsheduleTime(): ${next.scheduleTime()}`)
				ns.tprint(`Diff: ${performance.now() - next.scheduleTime()}, optionDelay: ${optionDelay}`)
				return // should be fine, hacks are last to schedule so grows and weakens should prep the server
			}
			await ns.exec(`/remote/${next.command}.js`, host, next.count, target, `${next.batchId}`)
			if (waitCount > (optionDelay / 2 / 25)) {
				// pause scheduling for a while
				let addMs = Math.trunc((performance.now() - scheduleTime + 25) / 100) * 100
				if (addMs > 0) {
					ns.tprint(`Adding ${addMs} ms to future batches`)
					targetTime += addMs
				}
			}
		} else {
			ns.tprint("Ran out of things to do!")
			await ns.sleep(5000)
		}
	}
}