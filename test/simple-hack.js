/** @param {NS} ns */
export async function main(ns) {
	// this costs 50mb
	// ns.tprint(`hostname is: ${ns.getHostname()}`)

	// this is free
	eval('window.obj = window.obj || {}'); obj['mn'] = ns; const mn = obj['mn'];
	mn['tprint'](`FREE! hostname is: ${mn['getHostname']()}`)

  // these are then memory-free as well, but they work just fine
	while(true) {
	 	await mn['weaken']('n00dles')
	 	await mn['grow']('n00dles')
	 	await mn['hack']('n00dles')
	 	await mn['hack']('n00dles')
	}
}