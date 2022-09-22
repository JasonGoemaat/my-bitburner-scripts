import * as format from '/lib/format.js'

let homeApps = {}

/** @param {NS} ns */
export async function main(ns) {
	ns.ls('home').forEach(x => homeApps[x] = true)

	const parents = {}
	const children = {}
	const serverInfo = {}
	const servers = []
	const queue = []
	const serverMessages = {}
	const queued = {}

	const doScan = async (host) => {
		if (serverInfo[host]) return
		servers.push(host)
		ns.tprint(`${host}: scanning...`)
		var server = await ns.getServer(host)
		serverInfo[host] = server
		children[host] = children[host] || []

		// hack server
		if (!server.hasAdminRights) {
        	if (!(await hackPorts(ns, host, server))) {
            	ns.tprint(`${host}: need more programs to nuke!`)
				serverMessages[host] = 'Need to write more programs to nuke'
            	return;
        	} else {
				ns.tprint(`${host}: nuking...`);
				await ns.nuke(host)
				ns.tprint(`${host}: NUKED!`)
			}
		}

		// scan
		const connected = await ns.scan(host)
		connected.forEach(connectedHost => {
			if (!queued[connectedHost]) {
				queue.push(connectedHost)
				queued[connectedHost] = true
				children[host].push(connectedHost)
				parents[connectedHost] = parents[connectedHost] || []
				parents[connectedHost].push(host)
			}
		})
	}

	queued[ns.getHostname()] = true
	queue.push(ns.getHostname())
	while (queue.length > 0) {
		await doScan(queue.shift());
	}

	// ok, we may have hacked some servers, so let's refresh their infos
	for (let i = 0; i < servers.length; i++) {
		let host = servers[i]
		serverInfo[host] = await ns.getServer(host)
	}

	const reportWithChildren = (host, level = 0) => {
		const server = serverInfo[host]
		// output will be tabbed basec on level (2 spaces)
		const padding = "".padStart(level * 2, ' ')
		const cores = `${server.cpuCores} core${server.cpuCores > 1 ? 's' : ''}`
		const ram = format.ram(server.maxRam * Math.pow(2, 30)) // it's in GB
		const arr = []
		let displayName = host
		if (server.hasAdminRights) arr.push('ADMIN')
		if (server.backdoorInstalled) {
			displayName = `[${host}]`
			arr.push('BACKDOOR')
		} 
		ns.tprint(`${padding}${displayName} ${cores} ${ram} [${arr.join(',')}] ${server.maxRam} ${format.money(server.moneyAvailable)}/${format.money(server.moneyMax)} ${server.hackDifficulty}/${server.minDifficulty} diff, ${server.serverGrowth} growth`)

		for (let i = 0; i < children[host].length; i++) {
			reportWithChildren(children[host][i], level + 1)
		}
	}

	// report on all servers, starting with our current one
	ns.tprint('--------------------------------------------------------------------------------')
	reportWithChildren(ns.getHostname())

	ns.tprint('--------------------------------------------------------------------------------')
	let moneyServers = [...servers].sort((a, b) => {
		return serverInfo[a].moneyMax - serverInfo[b].moneyMax
	})
	let maxServerLength = servers.reduce((p, c) => Math.max(c.length, p), 0)
	for (let i = 0; i < moneyServers.length; i++) {
		const host = moneyServers[i]
		const server = serverInfo[host]
		const name = host.padEnd(maxServerLength, ' ')
		const money1 = `${format.money(server.moneyAvailable)}`.padStart(12)
		const money2 = `${format.money(server.moneyMax)} `.padStart(12)
		const growth = `growth: ${server.serverGrowth}`.padEnd(20)
		const difficulty = `${Math.trunc(server.hackDifficulty)}/${Math.trunc(server.minDifficulty)}`.padEnd(10)
		ns.tprint(`${name} ${money1} ${money2} ${growth} ${difficulty} ${format.ram(server.maxRam * 1024 * 1024 * 1024)}`)
	}
}

/// Automatically hack the ports on server required for nuking if possible
const hackPorts = async (ns, host, server) => {
    const portApps = [
        [ns.ftpcrack, server.ftpPortOpen, 'FTPCrack.exe'],
        [ns.brutessh, server.sshPortOpen, 'BruteSSH.exe'],
        [ns.httpworm, server.httpPortOpen, 'HTTPWorm.exe'],
        [ns.sqlinject, server.sqlPortOpen, 'SQLInject.exe' ],
        [ns.relaysmtp, server.smtpPortOpen, 'relaySMTP.exe']
    ]

    let portsNeeded = server.numOpenPortsRequired - server.openPortCount
    let needed = []

    for (let i = 0; i < portApps.length && portsNeeded > 0; i++) {
        const [fn, flag, name] = portApps[i]
        if (flag) {
            ns.tprint(`Already open: ${name}`)
            continue;
        }
        if (!fn) {
            needed.push(name);
            ns.tprint(`Need to write ${name}`)
            continue;
        }
        if (!homeApps[name]) {
            needed.push(name);
            ns.tprint(`Missing program ${name}`)
            continue;
        }

        ns.tprint(`Running ${name}...`)
        await fn(host)
        portsNeeded--
    }

    if (portsNeeded > 0) {
        ns.tprint(`Sorry, the server '${host}' needs ${portsNeeded} more ports open.`)
        ns.tprint(`Try to buy or write these programs: ${needed.join(', ')}`)
        return false;
    }

    return true;
}