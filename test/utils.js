// this will scan the network and hack all the machines you can,
// and report

const formatRam = ram => {
	const postfix = 'KB MG GB TB PB EB ZB YB'.split(' ')
	const powers = [10, 20, 30, 40, 50, 60, 70, 80]
	for (let i = 0; i < postfix.length; i++) {
		const pow = Math.pow(2, powers[i])
		if (ram < pow * 1024 || i === (postfix.length - 1)) {
			let div = ram / pow
			div = Math.trunc(div * 10) / 10
			return `${div}${postfix[i]}`
		}
	}
	return `${Math.trunc(ram)}`
}

let first = true;
let myns = null;

const formatMoney = money => {
	const postfix = 'k m b t q Q s S o n'.split(' ')
	// double 18s are $1.000Q and $1000.000Q, same for 's'
	const powers = '3 6 9 12 15 18 21 24 27 30'.split(' ').map(x => parseInt(x)) // higher shows in exponent format
	if (first) {
		first = false;
	}

	for (let i = 0; i < postfix.length; i++) {
		const pow = Math.pow(10, powers[i]);
		if (money < (1000 * pow)) {
			let fm = Math.trunc(money / pow * 1000)/ 1000;
			return `$${fm}${postfix[i]}`;
		}
	}

	for (let i = 30; i < 303; i++) {
		const pow = Math.pow(10, i);
		if (money < (1000 * pow)) {
			let fm = Math.trunc(money / pow * 1000)/ 1000
			return `$${fm}e+${i}`
		}
	}
}

/** @param {NS} ns */
export async function main(ns) {
	myns = ns;
	const parents = {}
	const children = {}
	const serverInfo = {}
	const servers = []
	const queue = []
	const serverMessages = {}
	const queued = {}

	// test out formatRam(), seems to work fine
	// let amount = 1024
	// while (amount < Math.pow(10, 40)) {
	// 	ns.tprint(formatRam(amount))
	// 	amount = amount * Math.pow(2, 5)
	// }
	// return

	// test out formatMoney
	// let amount = 15.724921;
	// for (let i = 0; i < 309; i += 3) {
	// 	ns.tprint(`${i}: ${formatMoney(amount * Math.pow(10, i))}`)
	// }
	// return

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
		const ram = formatRam(server.maxRam * Math.pow(2, 30)) // it's in GB
		const arr = []
		let displayName = host
		if (server.hasAdminRights) arr.push('ADMIN')
		if (server.backdoorInstalled) {
			displayName = `[${host}]`
			arr.push('BACKDOOR')
		} 
		ns.tprint(`${padding}${displayName} ${cores} ${ram} [${arr.join(',')}] ${server.maxRam} ${formatMoney(server.moneyAvailable)}/${formatMoney(server.moneyMax)} ${server.hackDifficulty}/${server.minDifficulty} diff, ${server.serverGrowth} growth`)

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
		const money1 = `${formatMoney(server.moneyAvailable)}`.padStart(12)
		const money2 = `${formatMoney(server.moneyMax)} `.padStart(12)
		const difficulty = `${server.hackDifficulty}/${server.minDifficulty}`
		const growth = `growth: ${server.serverGrowth}`.padEnd(20)
		ns.tprint(`${name} ${money1} ${money2} ${growth} ${difficulty}`)
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