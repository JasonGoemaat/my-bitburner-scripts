// t4.js - run on remote server to get info and log it for t5.js to access
/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('disableLog')
	ns.disableLog('getServer')
	ns.disableLog('sleep')
	const server = ns.getServer();
	const data = { server }
	ns.print(JSON.stringify(data));
	while(true) await ns.sleep(5000);
}