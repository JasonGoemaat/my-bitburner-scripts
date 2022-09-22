/** @param {NS} ns */
export async function main(ns) {
	// requires Source-File 5 to run (Singularity)
	// ns.tprint(JSON.stringify(ns.getBitNodeMultipliers(), null, 2));

	var logs = ns.getScriptLogs('t2.js', 'home');
	ns.tprint("Logs:");
	logs.forEach(log => ns.tprint(log));
}