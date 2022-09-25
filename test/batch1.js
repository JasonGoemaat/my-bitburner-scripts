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
	const host = 'tera-0'
	await ns.scp('/remote/weaken.js', host)
	await ns.scp('/remote/grow.js', host)
	await ns.scp('/remote/hack.js', host)

	const msHack = 920
	const msWeaken = 3679
	const msGrow = 2943

	// hack 10 threads will finish first (at 3579)
	// weaken 1 thread will finish next (at 3679)
	// grow 74 threads will finish next (at 3779)
	// weaken 6 threds will finish last (at 3879)
	const runBatch = async () => {

		const weaken2At = 400 // finish 200ms after weaken1
		const growAt = 200 + msWeaken - msGrow // finish 100ms after weaken1
		const hackAt = -200 + msWeaken - msHack // finish 100ms before weaken1
		const start = performance.now()
		await ns.exec('/remote/weaken.js', host, 1, 'omega-net', 'weaken 1') // weaken 1 - 1 thread

		await ns.sleep(weaken2At - (performance.now() - start))
		await ns.exec('/remote/weaken.js', host, 6, 'omega-net', 'weaken 2') // weaken 2 - 6 threads

		await ns.sleep(growAt - (performance.now() - start))
		await ns.exec('/remote/grow.js', host, 74, 'omega-net', 'grow') // grow - 74 threads

		await ns.sleep(hackAt - (performance.now() - start))
		await ns.exec('/remote/hack.js', host, 10, 'omega-net', 'hack') // hack - 10 threads
	}

	while (true) {
		// this should be fine for running 5 scripts, about 1 batch a second
		await runBatch()
		await ns.sleep(600)
	}
}
