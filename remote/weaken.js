/** @param {NS} ns */
export async function main(ns) {
	const hostname = ns.args[0] || await ns.getHostname()
    const batch = ns.args[1] || 0
    await ns.weaken(hostname)
}
