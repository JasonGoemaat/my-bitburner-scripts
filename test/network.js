import * as format from '/lib/format.js'

/** @param {NS} ns 
 * @param {n} number
*/
const checkPort = async (ns, n) => {
	const pd = await ns.peek(n)
	ns.tprint(`typeof data on port 1 is '${typeof pd}'`)
	if (typeof(pd) === 'string') {
		ns.tprint(`length of port string is ${pd.length}`)
		if (pd.length < 1000) {
			ns.tprint(`string data is: '${pd}'`) // 'NULL PORT DATA'
		}
	}
}

/** @param {NS} ns */
export async function main(ns) {
	// checkPort(ns, 1)

	let start = performance.now()

	const servers = {}
	
	const handleServer = async hostname => {
		const info = await ns.getServer(hostname)
		if (!info) return null
		const connections = await ns.scan(hostname)
		const data = { hostname, info, connections }
		servers[hostname] = data
		return data
	}

	const queue = ['home'] // gotta start somewhere
	while (queue.length > 0) {
		const host = queue.shift()
		if (servers[host]) continue
		const data = await handleServer(host)
		if (!data) continue
		data.connections.filter(x => !servers[x]).forEach(x => queue.push(x))
	}

	let end = performance.now()

	ns.tprint(`Done creating network in ${format.short(end - start)} ms`)

	await checkPort(ns, 1)
	// await ns.writePort(1, JSON.stringify(servers, null, 2))
	await ns.writePort(1, servers)
	await checkPort(ns, 1)
	await ns.clearPort(1)
}