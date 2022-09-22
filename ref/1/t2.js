/** @param {NS} ns */
export async function main(ns) {
	let i = 0;
	while (true) {
		ns.print(`Logging:`, i++);
		ns.tprint('Logged ', i, ' times, sleeping for a few seconds...')
		ns.tprint('is logging enabled? ', ns.isLogEnabled('print'))
		if ((i % 10) === 1) {
			await ns.hack('n00dles');
		}
		await ns.sleep(3000);
	}
}