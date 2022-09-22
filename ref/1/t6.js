/** @param {NS} ns */
export async function main(ns) {
	ns.tprint('arguments:')
	ns.tprint(JSON.stringify(arguments))
	const [host] = arguments[0].args
	ns.tprint(`Getting info for '${host}'`)
	ns.tprint(JSON.stringify(ns.getServer(host), null, 2))
}