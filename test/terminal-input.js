/** @param {NS} ns */
export async function main(ns) {
	// Acquire a reference to the terminal text field
	const terminalInput = document.getElementById("terminal-input");
	if (!terminalInput) { ns.tprint('Cannot find "terminal-input" element!'); return }
	const handler = Object.keys(terminalInput)[1];
	terminalInput.value="home;connect n00dles;";
	terminalInput[handler].onChange({target:terminalInput});
	terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
}