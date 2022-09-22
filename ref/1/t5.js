/** @param {NS} ns */
export async function main(ns) {
	const pid = ns.exec('t4.js', 'n00dles', 1, 'Hello, world!')
	ns.tprint(`started with pid ${pid}`)
	await ns.sleep(10)
	var logs = ns.getScriptLogs('t4.js', 'n00dles', 'Hello, world!')
	ns.scriptKill('t4.js', 'n00dles');

	ns.tprint('There are ${logs?.length} log entries!')
	ns.tprint(JSON.stringify(logs, null, 2))
	var parsed = JSON.parse(logs.join(''))
	ns.tprint(`parsed is a ${typeof parsed}`)
	ns.tprint(JSON.stringify(parsed, null, 2))
}