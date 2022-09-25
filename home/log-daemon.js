/** @param {NS} ns */
export async function main(ns) {
    const port = ns.args[0] || 1
    ns.print(`Listening for messages on port ${port}`)
    ns.disableLog('sleep')
    while(true) {
        let message = await ns.readPort(1)
        if (message === 'NULL PORT DATA') {
            await ns.sleep(100)
        } else {
            ns.print(message)
        }
    }
}