// run any command on the ns object
// example: 'run any.js purchaseServer tera 1024'

/** @param {NS} ns */
export async function main(ns) {
    let [command, ...args] = ns.args
    ns.tprint(`running ns.${command}(${args.join(', ')})`)
    let result = await ns[command](...args)
    ns.tprint(`result: ${JSON.stringify(result, null, 2)}`)
}