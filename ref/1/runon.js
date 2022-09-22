/** @param {NS} ns */
export async function main(ns) {
	let [scriptName, runHost, moneyHost, count, extra ] = ns.args
	// 'extra' is so you can run this multiple times on a server
	
	const server = await ns.getServer(runHost)
	const { maxRam } = server
	await ns.scp(scriptName, runHost)
	const scriptRam = ns.getScriptRam(scriptName, runHost)
	if (!scriptRam) {
		ns.tprint('ERROR!!!!!  Could not get script ram on server')
		const data = { maxRam, scriptRam, scriptName, runHost, moneyHost, count, threads }
		ns.tprint(JSON.stringify(data, null, 2))
		return
	}
	count = count ? parseInt(count) : Math.trunc(maxRam / scriptRam)
	await ns.exec(scriptName, runHost, count, moneyHost, extra)
	ns.tprint(`started ${count} instances of ${scriptName} on ${runHost} targeting ${moneyHost}`)
}