/** @param {NS} ns */
export async function main(ns) {
	// have access to the 'window' object as the global, I set 'window.my'
	// as a cheat object in my altered version of the game - cool!
	// ns.tprint(`'my' is a ${typeof my}`);

	// you can alter the 'ns' object, but it gets reset between runs
	var test = ns.servers;
	ns.tprint(`ns.servers is: ${JSON.stringify(ns.servers)}`);
	ns.servers = ns.servers || {}
	ns.servers[ns.getHostname()] = ns.servers[ns.getHostname()] || {}
	ns.servers[ns.getHostname()].runCount = (ns.servers[ns.getHostname()].runCount || 0) + 1;
	ns.tprint(`ns.servers is now: ${JSON.stringify(ns.servers)}`);

	// you can alter the 'window' global object no problem!
	window.servers = window.servers || {};
	ns.tprint(`window.servers is: ${JSON.stringify(window.servers)}`);
	window.servers = servers || {}
	window.servers[ns.getHostname()] = window.servers[ns.getHostname()] || {}
	window.servers[ns.getHostname()].runCount = (window.servers[ns.getHostname()].runCount || 0) + 1;
	ns.tprint(`window.servers is now: ${JSON.stringify(window.servers)}`);
}