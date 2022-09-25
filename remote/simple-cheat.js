/*
    This script will work on the passed target or the host and 
    work on the server running grow/hack/weaken as needed.
 */

import { default as format } from '/lib/format.js'
import { default as formulas } from '/lib/formulas.js'

/** @param {NS} ns */
export async function main(ns) {
    eval('window.obj = window.obj || {}'); obj['my'] = ns; const my = obj['my']; delete obj['my'];
    const { pid, threads } = my['getRunningScript']()
    ns.tprint(`Running ${threads} threads on pid ${pid}`)

    let [target] = ns.args
    target = target || my['getHostname']()

    while (true) {
        let server = await my['getServer'](target)
        let player = await my['getPlayer'](target)
        let analysis = formulas.analyze(server, player)
        ns.print(`Threads: ${threads}, Weakens: ${analysis.weakensNeeded}, Grows: ${analysis.growsNeeded}`)
        if (analysis.weakensNeeded >= threads) {
            await my['weaken'](target)
        } else if (analysis.growsNeeded >= threads) {
            await my['grow'](target)
        } else {
            await my['hack'](target)
        }
    }
}