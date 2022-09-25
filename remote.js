/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length < 2 || ns.args[0] === '--help') {
		ns.tprint('Usgage: run remote.js [script] [host] (threads) (...args)')
		ns.tprint('	 NOTE: [script] should be in remote, and path not specified')
		ns.tprint('  For example "simple.js" will run "/remote/simple.js"')
		ns.tprint('  All remote and lib files are pushed to server')
		return
	}

	let [script, host, threads, ...args] = ns.args
	if (!host) { ns.tprint('HOST NOT SPECIFIED'); return; }

	var files = await ns.ls('home')
	files = files.filter(x => x.indexOf('/remote/') === 0 || x.indexOf("/lib/") === 0)
	await ns.scp(files, host)

	const neededRam = await ns.getScriptRam(script, host)
	const server = await ns.getServer(host)
	const possibleThreads = Math.trunc((server.maxRam - server.ramUsed) / neededRam)
	threads = threads || possibleThreads || 1
    if (threads > possibleThreads) {
		ns.tprint(`Not enough memory ${format.gb(neededRam)} on ${host}`)
		return
    }

	ns.tprint(`Running /remote/${script} on ${host} with ${threads} threads and args: ${JSON.stringify(args)}`)
    const pid = await ns.exec(`/remote/${script}`, host, threads, ...args)
	ns.tprint(`Started, pid is ${pid}`)
}