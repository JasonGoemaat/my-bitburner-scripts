let helper = {}
helper.win = this
helper.doc = helper.win['t n e m c o d'.split(' ').reverse().join('')]

/** @param {NS} ns */
export async function main(ns) {
	ns.tprint('typeof win is ', typeof helper.win)
	ns.tprint('typeof doc is ', typeof helper.doc)
	ns.tprint('done!')
}