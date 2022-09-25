import { default as format } from '/lib/format.js'

/** @param {NS} ns */
export async function main(ns) {

	let limit = ns.getPurchasedServerLimit()
	let gb = ns.getPurchasedServerMaxRam()
	let current = ns.getPurchasedServers()
	let cost = ns.getPurchasedServerCost(gb)
	// ns.purchaseServer('mega', ram)
	ns.tprint(`limit ${limit}, have ${current.length}, max ram ${format.gb(gb)}, cost ${format.money(cost)}`)

	for (let i = 4; i <= gb; i *= 2) {
		let cost = format.money(ns.getPurchasedServerCost(i)).padStart(20)
		let memory = `${format.gb(i)}`
		ns.tprint(`${cost} for ${memory}`)
	}
}
