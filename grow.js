/** @param {NS} ns */
export async function main(ns) {
	let [host, server, threads, batch] = ns.args
    batch = batch || 0
    server = server || host
    await ns.scp('/remote/grow.js', host)
    if (!threads) {
        const neededRam = await ns.getScriptRam('/remote/grow.js', host)
        const server = await ns.getServer(host)
        threads = Math.trunc((server.maxRam - server.ramUsed) / neededRam)
    }
    await ns.exec('/remote/grow.js', host, threads, server, batch)
}