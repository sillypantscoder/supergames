sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	// Download Entries
	var x = new XMLHttpRequest()
	x.open("GET", "/entries.json")
	x.addEventListener("loadend", () => {
		var form = JSON.parse(x.responseText)
		if (info.profile == null) {
			location.replace("/login.html")
			return;
		}
		if (info.profile.admin) {
			addResponseBoard(form)
			document.body.classList.add("h_a")
		}
	})
	x.send()
	// Leaderboard List
	var sorted = [...info.leaderboards]
	sorted.sort((a, b) => a.game.localeCompare(b.game))
	/** @type {Object<string, HTMLOptGroupElement>} */
	var game_groups = {}
	for (var leaderboard of sorted) {
		var game = leaderboard.game
		// Get opt group
		var group = document.createElement("optgroup")
		if (Object.keys(game_groups).includes(game)) {
			group = game_groups[game]
		} else {
			group.setAttribute("label", game)
			expect(".events").appendChild(group)
			game_groups[game] = group
		}
		// Create option element
		var e = document.createElement("option")
		e.innerText = leaderboard.name
		e.setAttribute("value", leaderboard.name)
		group.appendChild(e)
		// Select this option, if on a direct link
		if (leaderboard.name == decodeURIComponent(query.get("leaderboard", ""))) {
			e.setAttribute("selected", "true")
		}
	}
	// User List
	for (var i = 0; i < info.users.length; i++) {
		var e = document.createElement("option")
		e.innerText = info.users[i].name
		e.setAttribute("value", info.users[i].name)
		if (info.users[i].name == info.profile?.name) e.setAttribute("selected", "")
		expect(".users").appendChild(e)
	}
	// @ts-ignore
	window.getScore = () => {
		var event = expectSelect(expect("#eventselect")).value
		var name = expectSelect(expect("#username")).value
		var entry = info.getLeaderboard(event).getEntryForUser(info.getUserForName(name))
		if (entry == null) return
		return entry.score
	}
})
function submit() {
	var x = new XMLHttpRequest()
	x.open("POST", "/tryaddentry")
	x.addEventListener("loadend", (e) => {
		location.replace("/" + location.search)
	})
	x.send(JSON.stringify({
		user: expectSelect(expect("#username")).value,
		event: expectSelect(expect("#eventselect")).value,
		newscore: expectInput(expect("#newscore")).valueAsNumber,
		mode: expectSelect(expect("#modeselect")).value,
		note: expectInput(expect("#note")).value
	}))
}
function addSearchResponsesButton() {
	var e = document.createElement("button")
	e.innerText = "Search Responses"
	e.addEventListener("click", () => {
		var s = prompt("Enter the search term")
		if (s == null) return
		/** @type {HTMLButtonElement[]} */
		var elms = [...document.querySelectorAll("[data-searchterms]")].map((v) => v instanceof HTMLButtonElement ? v : (() => { throw new Error("not a button") })())
		for (var i = 0; i < elms.length; i++) {
			var terms = elms[i].dataset.searchterms
			if (terms == undefined) continue
			if (! terms.includes(s)) {
				elms[i].remove()
			}
		}
	})
	expect("#responses").appendChild(e)
}
/**
 * @param {{ user: string, event: string, newscore: number, mode: "add" | "replace" | "max", note: string }[]} responses
 */
function addResponseBoard(responses) {
	addSearchResponsesButton()
	for (var res = 0; res < responses.length; res++) {
		var response = responses[res]
		var e = document.createElement("button")
		e.innerText = `Entry from ${response.user}`
		e.dataset.searchterms = `${response.user} ${response.event} ${response.note}`
		e.addEventListener("click", ((response, responseIndex) => (() => {
			fillResponse(response, responseIndex)
		}))(response, res))
		expect("#responses").appendChild(e)
	}
}
/**
 * @param {{ user: string, event: string, newscore: number, mode: "add" | "replace" | "max", note: string }} response
 * @param {number} responseIndex
 */
function fillResponse(response, responseIndex) {
	// Add Delete Button
	expect("#endbtn").innerText = "Delete Response"
	expect("#endbtn").removeAttribute("onclick")
	expect("#endbtn").addEventListener("click", () => {
		var x = new XMLHttpRequest()
		x.open("POST", "/handle_entry")
		x.addEventListener("loadend", (e) => {
			location.reload()
		})
		x.send(cookies.user + "\n0\n" + responseIndex)
	})
	// Add Accept Button
	var e = document.createElement("button")
	expect("#endbtn").parentNode?.appendChild(e)
	e.innerText = "Accept"
	e.addEventListener("click", () => {
		var x = new XMLHttpRequest()
		x.open("POST", "/handle_entry")
		x.addEventListener("loadend", (e) => {
			location.reload()
		})
		x.send(cookies.user + "\n1\n" + responseIndex)
	});
	// Add Cancel Button
	[...document.querySelectorAll("#responses button")].forEach((e) => e.remove())
	var e = document.createElement("button")
	e.innerText = "Cancel"
	e.addEventListener("click", () => {
		location.reload()
	})
	expect("#responses").appendChild(e)
	// Fill Responses
	expectSelect(expect("#username")).value = response.user
	expectSelect(expect("#eventselect")).value = response.event
	expectInput(expect("#newscore")).valueAsNumber = response.newscore
	expectSelect(expect("#modeselect")).value = response.mode
	expectInput(expect("#note")).value = response.note
}
