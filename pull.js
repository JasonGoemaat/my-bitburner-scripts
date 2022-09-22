// https://raw.githubusercontent.com/JasonGoemaat/my-bitburner-scripts/main/pull.js
const base = 'https://raw.githubusercontent.com/JasonGoemaat/my-bitburner-scripts/main'
const fileNames = `
/lib/format.js
/lib/formulas.js
/remote/simple.js
/test/formulas.js
/test/simple-hack.js
/test/test-format.js
`

/** @param {NS} ns */
export async function main(ns) {
  
  // await ns.wget(base + 'lib/format.js', 'lib/format.js') // does not work
  await ns.wget(base + '/lib/format.js', '/lib/format.js')  // this does work

  //await ns.wget('https://raw.githubusercontent.com/JasonGoemaat/my-bitburner-scripts/main/lib/format.js', 'f1.js')
  // await ns.wget(base + '/lib/format.js', 'f1.js') // WORKS IN ROOT DIRECTORY
  
  // demo, works fine
  // await ns.wget("https://raw.githubusercontent.com/danielyxie/bitburner/master/README.md", "game_readme.txt");
  while (true) {
    ns.tprint('waiting 5 seconds...')
    await ns.sleep(5000)
  }
}