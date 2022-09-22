/** @param {NS} ns */
export async function main(ns) {
	const [host] = arguments[0].args;
	if (!host) { ns.tprint('No host specified'); return; }
	
	// ns.nuke(host);
	
	// ns.getPlayer();
	
	//const ls = ns.ls('home');
	//ns.tprint(ls);

	// ns.alterReality();

	// ns.tprint(JSON.stringify(this)); // empty, error no 'hasOwnProperty' without stringify
	// ns.tprint(`${this}`);

	const server = ns.getServer(host)
    const player = ns.getPlayer()
    
    if (server.hasAdminRights && server.backdoorInstalled) {
        ns.tprint(`${host} has already been nuked and has a backdoor installed!`)
        return
    }

    if (player.skills.hacking < server.requiredHackingSkill) {
        ns.tprint(`You do not have the required skill (${player.skills.hacking} / ${server.requiredHackingSkill})`)
        return;
    }

	if (!server.hasAdminRights) {
        if (!(await hackPorts(ns, host, server))) {
            ns.tprint(`Could not hack enough ports on ${host}, write some programs!`)
            return;
        }

        await ns.nuke(host)
        ns.tprint(`${host} has been NUKED!`)
	} else {
        ns.tprint(`${host} is already nuked`)
    }

    if (!server.backdoorInstalled) {
        ns.tprint(`typeof ns.installBackdoor is '${typeof ns.installBackdoor}'`)
        if (!ns.installBackdoor) {
            ns.tprint(`You need to manually install a backdoor on ${host}`)
            ns.tprint(`Run 'run find-server ${host}' to find a path to connect to it`)
            ns.tprint('Backdooring:')
            ns.tprint('    * is necessary for hacking challenges (i.e. CSEC)')
            ns.tprint('    * lets you connect directly to a server no matter where is is in the network')
            ns.tprint('    * gives you discounts and gyms/universities')
            ns.tprint('    * lowers penalties for stopping jobs early')
            ns.tprint('    * can be done automatically after getting to BN4 (the singularity)')
            ns.tprint('      (don\'t worry about this until you know what a BitNode (BN) is, just play')
            ns.tprint('          the game and you will eventually find out :))')
            return;
        }
        ns.installBackdoor()
        ns.tprint(`Backdoor installed on ${host}!`)
    }

    ns.tprint(`Server ${host} has been hacked!`)
	
    /*
    "contracts": [],
    "cpuCores": 1,
    "ftpPortOpen": false,
    "hasAdminRights": false,
    "hostname": "foodnstuff",
    "httpPortOpen": false,
    "ip": "87.7.4.0",
    "isConnectedTo": false,
    "maxRam": 16,
    "messages": [],
    "organizationName": "FoodNStuff",
    "programs": [],
    "ramUsed": 0,
    "runningScripts": [],
    "scripts": [],
    "serversOnNetwork": [],
    "smtpPortOpen": false,
    "sqlPortOpen": false,
    "sshPortOpen": false,
    "textFiles": [],
    "purchasedByPlayer": false,
    "backdoorInstalled": false,
    "baseDifficulty": 10,
    "hackDifficulty": 10,
    "minDifficulty": 3,
    "moneyAvailable": 2000000,
    "moneyMax": 50000000,
    "numOpenPortsRequired": 0,
    "openPortCount": 0,
    "requiredHackingSkill": 1,
    "serverGrowth": 5
	*/
}

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