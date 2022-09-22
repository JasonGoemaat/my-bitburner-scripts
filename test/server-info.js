/** @param {NS} ns */
export async function main(ns) {
	const [hostname] = ns.args
	ns.tprint(`${JSON.stringify(ns.getServer(hostname), null, 2)}`)
}