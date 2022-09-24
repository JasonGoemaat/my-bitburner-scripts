/** @param {NS} ns */
export async function main(ns) {
	const hostname = ns.args[0] || ns.getHostname()
	const data = await ns.getServer(hostname)
	ns.tprint(`\r\n${JSON.stringify(data, null, 2)}`)
}