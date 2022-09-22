/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(`ns keys: ${JSON.stringify(Object.keys(ns), null, 2)}`)
	ns.tprint(`enums: ${JSON.stringify(ns.enums, null, 2)}`)
}