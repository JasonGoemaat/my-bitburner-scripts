/** @param {NS} ns */
export async function main(ns) {
	const host = arguments[0].args[0] || ns.getHostname()
	const server = ns.getServer(host)
	ns.tprint(`\r\n${JSON.stringify(server, null, 2)}`)
}