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
  let files = fileNames.split('\r\n').filter(x => x.length > 0)
  if (files.length < 2 && files[0].length === fileNames.length) files = fileNames.split('\n').filter(x => x.length > 0)
  ns.tprint(`there are ${files.length} files to download...`)
  // await ns.wget(base + 'lib/format.js', 'lib/format.js') // does not work
  // await ns.wget(base + '/lib/format.js', '/lib/format.js')  // this DOES work

  //await ns.wget('https://raw.githubusercontent.com/JasonGoemaat/my-bitburner-scripts/main/lib/format.js', 'f1.js')
  // await ns.wget(base + '/lib/format.js', 'f1.js') // WORKS IN ROOT DIRECTORY
  
  // demo, works fine
  // await ns.wget("https://raw.githubusercontent.com/danielyxie/bitburner/master/README.md", "game_readme.txt");
  // while (true) {
  //   ns.tprint('waiting 5 seconds...')
  //   await ns.sleep(5000)
  // }
}