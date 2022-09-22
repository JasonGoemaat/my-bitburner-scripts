/** @param {NS} ns */
export async function main(ns) {
	await ns.installBackdoor('n00dles')
	const data = ns.server('n00dles')
	ns.tprint(`\r\n${JSON.stringify(data, null, 2)}`)
}