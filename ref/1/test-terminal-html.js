/** @param {NS} ns */
export async function main(ns) {
	// Acquire a reference to the terminal list of lines.
	//const list = document.querySelector("#generic-react-container ul");

	// Inject some HTML.
	//list.insertAdjacentHTML('beforeend',`<li><p color=red>Hello, world!</p></li>`)

	//ns.tprint(`document is a '${typeof document}'`)
	//ns.tprint(`document.querySelector is a '${typeof document.querySelector}'`)
	//ns.tprint(`document.getElementById is a '${typeof document.getElementById}'`)
	// <input aria-invalid="false" autocomplete="off" id="terminal-input" type="text" class="MuiInput-input MuiInputBase-input MuiInputBase-inputAdornedStart css-bcr43k-MuiInputBase-input-MuiInput-input" value="">

	const ul = document.getElementById('terminal')
	const li = document.createElement('li')
	'MuiListItem-root MuiListItem-gutters MuiListItem-padding'.split(' ').forEach(x => li.classList.add(x))
	//li.setAttribute('class', 'makeStyles-nopadding-1421 MuiListItem-root MuiListItem-gutters MuiListItem-padding css-1hvpof1-MuiListItem-root')
	//li.setAttribute('class', 'makeStyles-nopadding-1421 MuiListItem-root MuiListItem-gutters MuiListItem-padding css-1hvpof1-MuiListItem-root')
	li.style.padding = '0'
	const p = document.createElement('p')
	'MuiTypography-root MuiTypography-body1'.split(' ').forEach(x => p.classList.add(x))
	// p.setAttribute('class', 'makeStyles-primary-1426 MuiTypography-root MuiTypography-body1 css-f3yi4k-MuiTypography-root')
	p.style.color = "red"
	p.style.fontFamily = 'Lucida Console'
	p.style.margin = '0'
	p.innerText = "Hello, world!"
	li.appendChild(p)
/*
<li class="makeStyles-nopadding-1421 MuiListItem-root MuiListItem-gutters MuiListItem-padding css-1hvpof1-MuiListItem-root">
<p class="makeStyles-primary-1426 MuiTypography-root MuiTypography-body1 css-f3yi4k-MuiTypography-root">Running script with 1 thread(s), pid 10 and args: [].
</p>
</li>
*/
	//li.innerHTML = '<p style="color: red">Hello, world!</p>'
	ul.appendChild(li)
}