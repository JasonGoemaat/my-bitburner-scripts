/** @param {NS} ns */
export async function main(ns) {
	const contents = ns.read('top10000.txt')
	const lines = contents.split('\n').reverse()
	ns.tprint(lines.length)
	ns.tprint(lines[0].length)
	ns.tprint(`'${lines[0]}'`)
	for (let i = 0; i < lines.length; i++) {
		const guess = lines[i];
		if (ns.rainbow(guess)) {
			ns.tprint(`Answer is at index ${i}: '${guess}'`)
			break;
		}
		if ((i % 100) === 0) {
			ns.tprint(`At ${i}/${lines.length} ...`)
		}
		ns.print(`${i}`)
		await ns.sleep(10)
	}
}