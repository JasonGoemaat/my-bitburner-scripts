const formatMoney = money => {
	const postfix = 'k m b t q Q s S o n'.split(' ')
	const powers = '3 6 9 12 15 18 21 24 27 30'.split(' ').map(x => parseInt(x)) // higher shows in exponent format

	for (let i = 0; i < postfix.length; i++) {
		const pow = Math.pow(10, powers[i]);
		if (money < (1000 * pow)) {
			let fm = Math.trunc(money / pow * 1000)/ 1000;
			return `$${fm}${postfix[i]}`;
		}
	}

	for (let i = 30; i < 303; i += 3) {
		const pow = Math.pow(10, i);
		if (money < (1000 * pow)) {
			let fm = Math.trunc(money / pow * 1000)/ 1000
			return `$${fm}e+${i}`
		}
	}
}

const formatShort = short => {
    if (short < 1000) return `${short}`
	const exp = Math.trunc(Math.log10(short) / 3) * 3
	const num = Math.trunc(short * 1000 / Math.pow(10, exp)) / 1000
	return `${num}e${exp}`
}

/** @param {NS} ns */
export async function main(ns) {
	const hostname = ns.args[0] || await ns.getHostname()
    const batch = ns.args[1] || 0
    let start = performance.now()
    let amount = await ns.hack(hostname)
    let ms = Math.trunc((performance.now() - start) * 1000) / 1000
    await ns.writePort(1, `Stole ${formatMoney(amount)} from ${hostname} in ${formatShort(ms/1000)} s for batch ${batch}`)
}
