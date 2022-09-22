/** @param {NS} ns */
export async function main(ns) {
	(window).hello = 'Hello, world!';
	(window).ch = ns;
	const ch = (window).ch
	await ch['hack']('n00dles') // does not cost ram?
	ns.tprint('done!')
}