export const money = money => {
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

export const short = short => {
	const exp = Math.trunc(Math.log10(short))
	const num = Math.trunc(short * 1000 / Math.pow(10, exp)) / 1000
	return `${num}e+${exp}`
}

export const ram = ram => {
	const postfix = 'KB MB GB TB PB EB ZB YB'.split(' ')
	const powers = [10, 20, 30, 40, 50, 60, 70, 80]
	for (let i = 0; i < postfix.length; i++) {
		const pow = Math.pow(2, powers[i])
		if (ram < pow * 1024 || i === (postfix.length - 1)) {
			let div = ram / pow
			div = Math.trunc(div * 10) / 10
			return `${div}${postfix[i]}`
		}
	}
	return `${Math.trunc(ram)}`
}

export default {
  money,
  ram,
  short
}