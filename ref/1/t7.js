// t7.js is run remotely by t6 to analyze a server

/** @param {NS} ns */
export async function main(ns) {
	const host = 'foodnstuff';
	const hackAnalyze = ns.hackAnalyze(host)
	const getServer = ns.getServer(host)
	const data = {  hackAnalyze, getServer }
	ns.tprint('\r\n' + JSON.stringify(data, null, 2))
}