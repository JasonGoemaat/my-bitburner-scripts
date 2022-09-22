/** @param {NS} ns */
export async function main(ns) {
	// this costs 50mb
	// ns.tprint(`hostname is: ${ns.getHostname()}`)

	// this is free, but when the script finishes you get an error alert that
	// you used more memory than you were supposed to :(
	eval('window.obj = window.obj || {}')
	obj['mn'] = ns
	const mn = obj['mn']
	mn['tprint'](`Hmm...   hostname is: ${mn['getHostname']()}`)

	let [hostname] = ns.args
	hostname = hostname || mn['getHostname']()
	const info = await mn['getServer'](hostname)
	const targetSecurityLevel = info.minDifficulty + 2
	const targetMoney = info.moneyMax * 0.95

	while(true) {
		if (await mn['getServerSecurityLevel'](hostname) > targetSecurityLevel) {
		 	await mn['weaken'](hostname)
		} else if (await mn['getServerMoneyAvailable'](hostname) < targetMoney) {
		 	await mn['grow'](hostname)
		} else {
		 	await mn['hack'](hostname)
		}
	}
}