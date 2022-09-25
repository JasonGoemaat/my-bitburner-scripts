import * as format from '/lib/format.js'

let homeApps = {}

const showUsage = ns => {
	ns.tprint('Usage: run scan.js (options)')
	ns.tprint('	 Options:')
	ns.tprint('		--push   			 - re-push lib and remote files to all hosts')
}

/** @param {NS} ns */
export async function main(ns) {
	await ns.ls('home').forEach(x => homeApps[x] = true)
	let args = [...ns.args]
	let optionPush = false
	for (let i = 0; i < args.length;) {
		const optionName = `${args[i]}`;
		if (optionName.substring(0, 2) === '--') {
			args.splice(i, 1)
			switch (optionName) {
				case '--push':
					optionPush = true
					break

				default:
					ns.tprint(`ERROR!  Unknown option '${optionName}'`)
					showUsage(ns)
					return
			}
		} else {
			i++
		}
	}
	//let [target] = args

	const remoteFiles = [...(await ns.ls('home', 'remote/')),...(await ns.ls('home', 'lib/'))]
	ns.tprint('remote files:')
	ns.tprint(JSON.stringify(remoteFiles, null, 2))

	const parents = {}
	const children = {}
	const serverInfo = {}
	const servers = []
	const queue = []
	const serverMessages = {}
	const queued = {}

	const player = await ns.getPlayer()

	const doScan = async (host) => {
		if (serverInfo[host]) return
		servers.push(host)
		// ns.tprint(`${host}: scanning...`)
		var server = await ns.getServer(host)
		serverInfo[host] = server
		children[host] = children[host] || []

		// hack server
		if (!server.hasAdminRights) {
        	if (!(await hackPorts(ns, host, server))) {
            	// ns.tprint(`${host}: need more programs to nuke!`)
				serverMessages[host] = 'Need to write more programs to nuke'
            	return;
        	} else {
				ns.tprint(`${host}: nuking...`);
				await ns.nuke(host)
				ns.tprint(`${host}: NUKED!`)

				// install remote files
				if (remoteFiles && remoteFiles.length > 0) {
					await ns.scp(remoteFiles, host)
					ns.tprint(`${host}: files copied`)
				}
			}
		} else if (optionPush) {
			// install remote files
			if (remoteFiles && remoteFiles.length > 0) {
				await ns.scp(remoteFiles, host)
                ns.tprint(`${host}: files copied`)
				await ns.sleep(25)
			}
		}

		// backdoor
		if (ns.installBackdoor && ns.connect && !server.backdoorInstalled) {
			ns.tprint(`${host}: installing backdoor...`);
			await ns.connect(host)
			await ns.installBackdoor()
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
		
		let hackingDiff = Math.trunc(player.skills.hacking - server.requiredHackingSkill)
		arr.push(`Hacking${hackingDiff >= 0 ? '+' : ''}${hackingDiff}`)

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
		const growth = `growth: ${server.serverGrowth}`.padEnd(12)
		const difficulty = `${Math.trunc(server.hackDifficulty)}/${server.minDifficulty}`.padEnd(7)
		const ram = format.ram(server.maxRam * Math.pow(2, 30)).padEnd(7)
		const arr = []
		let displayName = host
		if (server.hasAdminRights) arr.push('ADMIN')
		if (server.backdoorInstalled) {
			displayName = `[${host}]`
			arr.push('BACKDOOR')
		}
		let hackingDiff = Math.trunc(player.skills.hacking - server.requiredHackingSkill)
		arr.push(`${server.requiredHackingSkill}${hackingDiff >= 0 ? '+' : ''}${hackingDiff}`)
		ns.tprint(`${name} ${money1} ${money2} ${growth} ${difficulty} ${ram} [${arr.join(',')}]`)
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
            //ns.tprint(`Already open: ${name}`)
            continue;
        }
        if (!fn) {
            needed.push(name);
            //ns.tprint(`Need to write ${name}`)
            continue;
        }
        if (!homeApps[name]) {
            needed.push(name);
            //ns.tprint(`Missing program ${name}`)
            continue;
        }

        ns.tprint(`Running ${name}...`)
        await fn(host)
        portsNeeded--
    }

    if (portsNeeded > 0) {
        ns.tprint(`'${host}': needs ${portsNeeded} more ports open (write ${needed.join(', ')}).`)
        return false;
    }

    return true;
}