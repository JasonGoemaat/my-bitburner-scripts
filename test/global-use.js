/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(`${hello}`)
	ns.tprint(`typeof ch is ${typeof(ch)}`)
	await ch['hack']('n00dles')
}
