/** @param {NS} ns */
export async function main(ns) {
	let [ host ] = ns.args
	while (true) {
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.grow(host) // raises security by .004
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.grow(host) // raises security by .004
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.grow(host) // raises security by .004
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.grow(host) // raises security by .004
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.hack(host) // raises security by .002
		await ns.grow(host) // raises security by .004
		await ns.weaken(host) // lowers security by 0.050
	}
}