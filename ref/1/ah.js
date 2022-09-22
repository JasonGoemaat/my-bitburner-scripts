/** @param {NS} ns */
export async function main(ns) {
	// var names = 'ftpcrack brutessh httpworm sqlinject relaysmtp'.split(' ')
	// for (let i = 0; i < names.length; i++) {
	// 	const name = names[i]
	// 	ns.tprint(`${name} is a '${typeof ns['name']}'`)
	// }

	await ns.installBackdoor('n00dles')
	const data = ns.server('n00dles')
	ns.tprint(`\r\n${JSON.stringify(data, null, 2)}`)
}