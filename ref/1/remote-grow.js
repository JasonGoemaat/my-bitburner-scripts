/** @param {NS} ns */
export async function main(ns) {
	let [ host ] = ns.args
	while (true) {
		await ns.grow(host)
	}
}