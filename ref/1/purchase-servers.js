/** @param {NS} ns */
export async function main(ns) {
	let limit = ns.getPurchasedServerLimit()
	let ram = ns.getPurchasedServerMaxRam()
	let current = ns.getPurchasedServers()
	let cost = ns.getPurchasedServerCost(ram)
	ns.purchaseServer('mega', ram)
}