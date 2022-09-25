/** @param {NS} ns */
export async function main(ns) {
	ns.tprint('Usgage: run exec.js [script} [host] (server) (threads) (...args)')
	let [script, host, server, threads, ...args] = ns.args
    server = server || host
    await ns.scp(script, host)
    if (!threads) {
        const neededRam = await ns.getScriptRam(script, host)
        const server = await ns.getServer(host)
        threads = Math.trunc((server.maxRam - server.ramUsed) / neededRam)
    }
    await ns.exec(script, host, threads, server, ...args)
}
