import * as format from '/lib/format.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(`${JSON.stringify(format)}`)

	let ram = 57 * 1024
	while (ram < 1e30) {
		ns.tprint(`Ram: ${format.ram(ram)} (${ram})`)
		ram *= 8
	}

	ns.tprint('')
	let money = 57293
	while (money < 1e60) {
		ns.tprint(`Money: ${format.money(money)} (${money})`)
		money *= 10
	}
	
	ns.tprint('')
	let num = 57293
	while (num < 1e60) {
		ns.tprint(`Num: ${format.short(num)} (${num})`)
		num *= 10
	}
}
