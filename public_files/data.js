/**
 * @template {any} T
 * @param {T[]} items
 * @returns {T}
 */
function _choice(items) { return items[Math.floor(Math.random()*items.length)]; }
window.addEventListener("error", (e) => {
	alert(`ERROR: ${e.message} @${e.filename}:${e.lineno}`)
	var x = new XMLHttpRequest()
	x.open("POST", "/error")
	x.send(`user: ${location.search}; message: ${e.message} @${e.filename}:${e.lineno}`)
})
/**
 * @param {string} selector
 * @returns {HTMLElement}
 */
function expect(selector) {
	var e = document.querySelector(selector)
	if (e == null) throw new Error("Element is missing: " + selector)
	if (! (e instanceof HTMLElement)) throw new Error("Document is of the wrong type?!?!")
	return e
}
/**
 * @param {Node} e
 * @returns {HTMLInputElement}
 */
function expectInput(e) {
	if (! (e instanceof HTMLInputElement)) throw new Error("Element is not an input: " + e)
	return e
}
Object.prototype.toString = function () {
	var r = [];
	var keys = Object.keys(this);
	/** @type {Object<any, any>} */
	var _o = this;
	for (var i = 0; i < keys.length; i++) {
		r.push(`${keys[i]}: ${_o[keys[i]]}`)
	}
	return "{" + r.join(", ") + "}"
}
Array.prototype.toString = function () { return "[" + this.join(", ") + "]" }
/**
 * @param {string} t
 */
function addCommas(t) { t = String(t); var i = t.lastIndexOf(".") - 3; if (i == -4) { i = t.length - 3 } for (; i > 0; i -= 3) { t = t.substring(0, i) + "," + t.substring(i, t.length) } return t }
/**
 * @param {number} t
 */
function formatTime(t) { var s = ""; if (t > 3600) { s += String(Math.floor(t / 3600)) + "h " } if (t > 60) { s += String(Math.floor((t % 3600) / 60)) + "m " } s += String(Math.floor(t % 60)); if (t % 1 != 0) { s += "." + String(Math.round((t % 1) * 1000)).padEnd(3, "0") } s += "s"; return s }
/**
 * @param {number} i
 */
function getColor(i) {
	if (i == 0) return "#FFE085";
	else if (i == 1) return "#C3C3C3";
	else if (i == 2) return "#FE8585";
	else if (i < 10) return "#80F4F4";
	else if (i < 50) return "#FC83FB";
	else if (i < 100) return "#85FF85";
	else if (i < 500) return "#FFFF85";
	else if (i < 1000) return "#8585FF";
	else if (i < 5000) return "#FECE83";
	else if (i < 10000) return "#CB82FB";
	else if (i < 50000) return "#93B7F1";
	else if (i < 100000) return "#BDE2A8";
	else if (i < 500000) return "#C0B3ED";
	else if (i < 1000000) return "#FFFFFF";
	return "inherit";
}
/**
 * @param {number} i
 */
function getSuffix(i) {
	if (i == 11) return 'th'
	if (i == 12) return 'th'
	if (i == 13) return 'th'
	return ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][Number(String(i)[String(i).length - 1])]
}
/**
 * @param {string} key
 * @param {any} obj
 */
function describe(key, obj) {
	var e = document.createElement("div")
	e.setAttribute("style", "font-family: monospace;")
	if (typeof obj == "string") {
		e.innerHTML = `${key}: <span style="color: orange;">"` + obj + '"</span>'
	} else if (typeof obj == "number") {
		e.innerHTML = `${key}: <span style="color: blue;">${obj}</span>`
	} else if (typeof obj == "object") {
		if (Array.isArray(obj)) {
			e.innerHTML = `<span><span>&gt;</span> <span>${key}: [${obj.length} items]</span></span>`
		} else {
			e.innerHTML = `<span><span>&gt;</span> <span>${key}: {...}</span></span>`
		}
		e.children[0].addEventListener("click", expand)
	}
	var expanded = false
	function expand() {
		if (! expanded) {
			e.children[0].children[0].textContent = "x"
			expanded = true
			e.appendChild(document.createElement("div"))
			e.children[1].setAttribute("style", "margin-left: 4ch;")
			var items = [Object.keys(obj), Object.values(obj)]
			for (var i = 0; i < items[0].length; i++) {
				e.children[1].appendChild(describe(items[0][i], items[1][i]))
			}
		} else {
			e.children[0].children[0].textContent = ">"
			expanded = false
			e.children[1].remove()
		}
	}
	return e
}
/**
 * @param {number} i
 */
function scrollToEntry(i) {
	var _elm = document.querySelector(`table tr:nth-child(${i + 1})`)
	if (_elm == null) throw new Error("table is missing, cannot scroll")
	var elm = _elm
	window.scrollBy({
		left: 0,
		top: elm.getBoundingClientRect().y - (window.innerHeight / 2),
		behavior: "smooth"
	})
	var oleft = elm.children[elm.children.length - 1].getBoundingClientRect().right
	var newE = document.createElement("div")
	newE.setAttribute("style", `position: absolute; top: ${window.scrollY + elm.getBoundingClientRect().y}px; left: calc(${oleft}px + 5em); display: inline-block; width: 5em; height: ${elm.getBoundingClientRect().height}px; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPgoJPHBhdGggZD0iTSAwIDEuNSBMIDIgMCBMIDIgMyBaIiBmaWxsPSJ5ZWxsb3ciIC8+Cgk8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJ5ZWxsb3ciIC8+Cjwvc3ZnPg==) no-repeat; transition: opacity 2s linear, left 2s cubic-bezier(0.04, 0.43, 0.23, 1.01); opacity: 1;`)
	document.body.appendChild(newE)
	requestAnimationFrame(() => {
		newE.setAttribute("style", `position: absolute; top: ${window.scrollY + elm.getBoundingClientRect().y}px; left: ${oleft}px; display: inline-block; width: 5em; height: ${elm.getBoundingClientRect().height}px; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPgoJPHBhdGggZD0iTSAwIDEuNSBMIDIgMCBMIDIgMyBaIiBmaWxsPSJ5ZWxsb3ciIC8+Cgk8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJ5ZWxsb3ciIC8+Cjwvc3ZnPg==) no-repeat; transition: opacity 2s linear, left 2s cubic-bezier(0.04, 0.43, 0.23, 1.01); opacity: 1;`)
	})
	setTimeout(() => {
		newE.setAttribute("style", `position: absolute; top: ${window.scrollY + elm.getBoundingClientRect().y}px; left: ${oleft}px; display: inline-block; width: 5em; height: ${elm.getBoundingClientRect().height}px; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPgoJPHBhdGggZD0iTSAwIDEuNSBMIDIgMCBMIDIgMyBaIiBmaWxsPSJ5ZWxsb3ciIC8+Cgk8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJ5ZWxsb3ciIC8+Cjwvc3ZnPg==) no-repeat; transition: opacity 2s linear, left 2s cubic-bezier(0.04, 0.43, 0.23, 1.01); opacity: 0;`)
	}, 2000)
	setTimeout(() => {
		newE.remove()
	}, 4000)
}

class BulkDownloader {
	/**
	 * @param {string[]} urls
	 */
	constructor(urls) {
		this.urls = urls
		/**
		 * @type {XMLHttpRequest[]}
		 */
		this.requests = []
		/** @type {Object<string, null | string>} */
		this.results = {}
		/** @type {((results: Object<string, string>) => void)[]} */
		this.promises = []
	}
	sendRequests() {
		var _bd = this
		for (var i = 0; i < this.urls.length; i++) {
			this.results[this.urls[i]] = null
			var x = new XMLHttpRequest()
			x.open("GET", this.urls[i]);
			((url, x) => {
				x.addEventListener("loadend", () => _bd.saveData(url, x.responseText))
			})(this.urls[i], x);
			x.send()
			this.requests.push(x)
		}
	}
	/**
	 * @param {string} url
	 * @param {string} response
	 */
	saveData(url, response) {
		this.results[url] = response
		this.checkForFinish()
	}
	checkForFinish() {
		/** @type {Object<string, string>} */
		var finishedResults = {}
		var finished = true
		for (var i = 0; i < this.urls.length; i++) {
			var url = this.urls[i]
			var result = this.results[url]
			if (result == null) {
				finished = false;
			} else {
				finishedResults[url] = result
			}
		}
		if (!finished) return
		// Finished, trigger promises
		for (var i = 0; i < this.promises.length; i++) {
			this.promises[i](finishedResults)
		}
		this.promises = [];
	}
	getPromise() {
		var _bd = this
		/** @type {Promise<Object<string, string>>} */
		var promise = new Promise((resolve) => {
			_bd.promises.push(resolve)
		})
		this.checkForFinish()
		return promise
	}
}


class User {
	/**
	 * @param {string} name
	 * @param {Date} date
	 * @param {string} email
	 * @param {string} desc
	 */
	constructor(name, date, email, desc) {
		this.name = name
		this.date = date
		this.email = email
		this.desc = desc
	}
}
class Entry {
	/**
	 * @param {User} user
	 * @param {number} score
	 * @param {Date} date
	 * @param {string} note
	 */
	constructor(user, score, date, note) {
		this.user = user
		this.score = score
		this.date = date
		this.note = note
	}
}
class Leaderboard {
	/**
	 * @param {string} name
	 * @param {string} description
	 * @param {{ values: number[], description: string } | null} badges
	 * @param {Entry[]} entries
	 * @param {boolean} reverseOrder
	 * @param {boolean} isTime
	 */
	constructor(name, description, badges, entries, reverseOrder, isTime) {
		this.name = name
		this.description = description
		this.badges = badges
		this.entries = entries
		this.reverseOrder = reverseOrder
		this.isTime = isTime
	}
	/**
	 * @param {User} user
	 * @returns {Entry | undefined}
	 */
	getEntryForUser(user) {
		for (var i = 0; i < this.entries.length; i++) {
			if (this.entries[i].user == user) {
				return this.entries[i]
			}
		}
		return undefined
	}
	/**
	 * Get a list of all the entries in the leaderboard, sorted according to score.
	 * The entries have some extra data indicating their place value.
	 */
	getRanked() {
		/** @type {{ entry: Entry }[]} */
		var data = []
		for (var i = 0; i < this.entries.length; i++) {
			var entry = this.entries[i]
			// Get score
			data.push({ entry })
		}
		data.reverse()
		data.sort((a, b) => {
			/**
			 * @param {{ entry: Entry }} x
			 * @return {number}
			 */
			function g(x) { return x.entry.score }
			if (g(a) < g(b)) {
				return -1;
			}
			if (g(a) > g(b)) {
				return 1;
			}
			// a must be equal to b
			return 0;
		})
		if (!this.reverseOrder) data.reverse()
		return data
	}
	/**
	 * @param {number} score
	 */
	getNumberOfBadges(score) {
		if (this.badges == null) throw new Error("There are no badges on a specialty leaderboard")
		for (var i = 0; i < this.badges.values.length; i++) {
			var value = this.badges.values[i]
			if (score <= value) return i
		}
		return this.badges.values.length
	}
	/**
	 * @param {number} score
	 */
	getNumberOfBadgesInEachCategory(score) {
		var n = this.getNumberOfBadges(score)
		return [
			[1, 0, 0, 0],
			[1, 0, 0, 0],
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		].slice(0, n).reduce((a, b) => a.map((v, i) => v + b[i]), [0, 0, 0, 0])
	}
}
class SGData {
	/**
	 * @param {User[]} users
	 * @param {Leaderboard[]} leaderboards
	 * @param {{ name: string, admin: boolean } | null} profile
	 */
	constructor(users, leaderboards, profile) {
		this.users = users
		this.leaderboards = leaderboards
		this.profile = profile
	}
	/**
	 * @param {string} name
	 */
	getLeaderboard(name) {
		for (var i = 0; i < this.leaderboards.length; i++) {
			if (this.leaderboards[i].name == name) {
				return this.leaderboards[i]
			}
		}
		throw new Error("There is no leaderboard with the name: " + name)
	}
	/**
	 * @param {User} user
	 */
	getNumberOfBadgesInEachCategory(user) {
		/** @type {number[][]} */
		var total = []
		for (var i = 0; i < this.leaderboards.length; i++) {
			var leaderboard = this.leaderboards[i]
			if (leaderboard.badges == null) continue
			var entry = leaderboard.getEntryForUser(user)
			if (entry == undefined) continue
			var badges = leaderboard.getNumberOfBadgesInEachCategory(entry.score)
			total.push(badges)
		}
		return total.reduce((a, b) => a.map((v, i) => v + b[i]), [0, 0, 0, 0])
	}
	/**
	 * @param {User} user
	 */
	getMetaPoints(user) {
		var points = 0
		for (var n = 0; n < this.leaderboards.length; n++) {
			var leaderboard = this.leaderboards[n]
			var ranks = leaderboard.getRanked()
			var rank = ranks.findIndex((v) => v.entry.user == user)
			if (rank == -1) points += this.users.length
			else points += n + 1
		}
		return points
	}
	/**
	 * @param {User} user
	 */
	getActivityPoints(user) {
		var totalScore = 0
		for (var n = 0; n < this.leaderboards.length; n++) {
			var leaderboard = this.leaderboards[n]
			var score = leaderboard.getEntryForUser(user)?.score
			if (score == undefined) continue;
			var vassal = leaderboard.badges?.values[1]
			if (vassal == undefined) continue;
			totalScore += Math.round(score / (vassal / 25))
		}
		return totalScore
	}
	getBadgeLeaderboardRanked() {
		var user_data = this.users.map((v) => ({ user: v, badges: this.getNumberOfBadgesInEachCategory(v) })).sort((a, b) => {
			if (a.badges[3] > b.badges[3]) return -1;
			if (a.badges[3] < b.badges[3]) return 1;
			if (a.badges[2] > b.badges[2]) return -1;
			if (a.badges[2] < b.badges[2]) return 1;
			if (a.badges[1] > b.badges[1]) return -1;
			if (a.badges[1] < b.badges[1]) return 1;
			if (a.badges[0] > b.badges[0]) return -1;
			if (a.badges[0] < b.badges[0]) return 1;
			return 0;
		})
		return user_data
	}
}

async function getData() {
	var downloader = new BulkDownloader([
		"/users.json",
		"/data.json",
		"/usercheck" + location.search
	])
	downloader.sendRequests()
	var results = await downloader.getPromise()
	var info = {
		data: results["/data.json"],
		users: results["/users.json"],
		profile: results["/usercheck" + location.search]
	}
	return parseData(info)
}
/**
 * @param {{ data: string; users: string; profile: string; }} info
 */
function parseData(info) {
	// Parse users
	/** @type {User[]} */
	var users = []
	for (var data of JSON.parse(info.users)) {
		var user = new User(data.name, new Date(data.date), data.email, data.desc)
		users.push(user)
	}
	// Parse leaderboards
	var leaderboards = []
	var events = JSON.parse(info.data)
	for (var eventname of Object.keys(events)) {
		var eventData = events[eventname]
		/** @type {any[][]} */
		var encodedEntries = eventData.entries
		var entries = encodedEntries.map((v) => {
			var user = users.find((d) => d.name == v[0])
			if (user == undefined) throw new Error("Entry in event " + eventname + " refers to unknown user: " + v.toString())
			var entry = new Entry(user, v[1], new Date(v[2]), v[3])
			return entry
		})
		var leaderboard = new Leaderboard(eventname, eventData.leaderboard_desc, eventData.badges.length == 0 ? null : {
			description: eventData.badge_desc,
			values: eventData.badges
		}, entries, eventData.reverseOrder, eventData.isTime)
		leaderboards.push(leaderboard)
	}
	// Parse profile
	/** @type {{ name: string, admin: boolean } | null} */
	var profile = null
	var encodedProfile = JSON.parse(info.profile)
	if (encodedProfile.length > 0) {
		profile = {
			name: encodedProfile[0].name,
			admin: encodedProfile[0].admin
		}
	}
	// Return objects
	return new SGData(users, leaderboards, profile)
}
/**
 * @param {any} info
 */
function generateObject(info) {
	function getUserList() {
		var userlist = []
		for (var i = info.users.length - 1; i >= 0; i--) {
			userlist.push(info.users[i].name)
		}
		return userlist
	}
	function getBadgeTypeCounts() {
		var userlist = getUserList()
		/** @type {Object<any, number[]>} */
		var names = {}
		for (var i = 0; i < userlist.length; i++) {
			names[userlist[i]] = [0, 0, 0, 0]
		}
		// 1. Loop over the different events
		var eventnames = Object.keys(info.data)
		for (var eventno = 0; eventno < eventnames.length; eventno++) {
			var event = 	info.data[eventnames[eventno]].entries
			var e_values = 	info.data[eventnames[eventno]].badges
			if (e_values.length == 0) continue; // Specialty leaderboard
			// 2. Loop over the different entries
			for (var i = 0; i < event.length; i++) {
				var entry_info = event[i]
				var f = (/** @type {number} */ entry, /** @type {number} */ badge) => (entry >= badge)
				if (info.data[eventnames[eventno]].reverseOrder) f = (entry, badge) => (entry <= badge)
				if (f(entry_info[1], e_values[0])) names[entry_info[0]][0] += 1
				if (f(entry_info[1], e_values[1])) names[entry_info[0]][0] += 1
				if (f(entry_info[1], e_values[2])) names[entry_info[0]][0] += 1
				if (f(entry_info[1], e_values[3])) names[entry_info[0]][1] += 1
				if (f(entry_info[1], e_values[4])) names[entry_info[0]][1] += 1
				if (f(entry_info[1], e_values[5])) names[entry_info[0]][2] += 1
				if (f(entry_info[1], e_values[6])) names[entry_info[0]][2] += 1
				if (f(entry_info[1], e_values[7])) names[entry_info[0]][3] += 1
			}
		}
		// 3. Format & sort the data
		var list_data = []
		var keys = Object.keys(names)
		for (var i = 0; i < keys.length; i++) {
			var thisBadges = names[keys[i]]
			list_data.push([keys[i], thisBadges])
		}
		list_data.sort((a, b) => {
			/** @param {any[]} x */
			function g(x) { return x[1][0] + (x[1][1] * 100) + (x[1][2] * 10000) + (x[1][3] * 10000) }
			if (g(a) < g(b)) {
				return -1;
			}
			if (g(a) > g(b)) {
				return 1;
			}
			// a must be equal to b
			return 0;
		})
		list_data.reverse()
		return list_data
	}
	function getTotalBadgeCounts() {
		var badges = [0, 0, 0, 0]
		// 1. Loop over the different events
		var eventnames = Object.keys(info.data)
		for (var eventno = 0; eventno < eventnames.length; eventno++) {
			var event = 	info.data[eventnames[eventno]].entries
			var e_values = 	info.data[eventnames[eventno]].badges
			if (e_values.length == 0) continue; // Specialty leaderboard
			// 2. Loop over the different entries
			for (var i = 0; i < event.length; i++) {
				var entry_info = event[i]
				var f = (/** @type {number} */ entry, /** @type {number} */ badge) => (entry >= badge)
				if (info.data[eventnames[eventno]].reverseOrder) f = (entry, badge) => (entry <= badge)
				if (f(entry_info[1], e_values[0])) badges[0] += 1
				if (f(entry_info[1], e_values[1])) badges[0] += 1
				if (f(entry_info[1], e_values[2])) badges[0] += 1
				if (f(entry_info[1], e_values[3])) badges[1] += 1
				if (f(entry_info[1], e_values[4])) badges[1] += 1
				if (f(entry_info[1], e_values[5])) badges[2] += 1
				if (f(entry_info[1], e_values[6])) badges[2] += 1
				if (f(entry_info[1], e_values[7])) badges[3] += 1
			}
		}
		return badges
	}
	/**
	 * @param {any} user
	 * @param {string} event
	 */
	function getScore(user, event) {
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			if (entry_info[0] == user) return entry_info[1]
		}
	}
	/**
	 * @param {any} user
	 * @param {any} event
	 */
	function getTimeForEntry(user, event) {
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			if (entry_info[0] == user) return new Date(entry_info[2])
		}
	}
	/**
	 * @param {any} user
	 * @param {any} event
	 */
	function getDesc(user, event) {
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			if (entry_info[0] == user) return entry_info[3]
		}
	}
	/**
	 * @param {string} event
	 * @param {any} score
	 */
	function getDuplicates(event, score) {
		var users = []
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			if (entry_info[1] == score) users.push(entry_info[0])
		}
		return users
	}
	/**
	 * @param {any} user
	 * @param {any} event
	 */
	function getBadgeCount(user, event) {
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			if (entry_info[0] == user) {
				// Get badges
				var e_values = info.data[event].badges
				if (e_values.length == 0) return 0; // Specialty leaderboard
				var n_badges = 0
				var f = (/** @type {number} */ entry, /** @type {number} */ badge) => (entry >= badge)
				if (info.data[event].reverseOrder) f = (entry, badge) => (entry <= badge)
				if (f(entry_info[1], e_values[0])) n_badges += 1
				if (f(entry_info[1], e_values[1])) n_badges += 1
				if (f(entry_info[1], e_values[2])) n_badges += 1
				if (f(entry_info[1], e_values[3])) n_badges += 1
				if (f(entry_info[1], e_values[4])) n_badges += 1
				if (f(entry_info[1], e_values[5])) n_badges += 1
				if (f(entry_info[1], e_values[6])) n_badges += 1
				if (f(entry_info[1], e_values[7])) n_badges += 1
				return n_badges
			}
		}
	}
	/**
	 * @param {string} event
	 * @param {any} level
	 */
	function getBadgeOwners(event, level) {
		var users = []
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			// Get badges
			var e_values = info.data[event].badges
			var f = (/** @type {number} */ entry, /** @type {number} */ badge) => (entry >= badge)
			if (info.data[event].reverseOrder) f = (entry, badge) => (entry <= badge)
			if (f(entry_info[1], e_values[level])) users.push(entry_info[0])
		}
		users.sort((a, b) => {
			return getScore(b, event) - getScore(a, event)
		})
		return users
	}
	/**
	 * @param {any} user
	 */
	function getEventList(user) {
		var events = []
		var eventnames = Object.keys(info.data)
		for (var eventno = 0; eventno < eventnames.length; eventno++) {
			var event_info = info.data[eventnames[eventno]].entries
			for (var i = 0; i < event_info.length; i++) {
				var entry_info = event_info[i]
				if (entry_info[0] == user) events.push(eventnames[eventno])
			}
		}
		return events
	}
	/**
	 * @param {string} event
	 */
	function getLeaderboardRanks(event) {
		/** @type {Object<any, any>} */
		var users = {}
		var event_info = info.data[event].entries
		for (var i = 0; i < event_info.length; i++) {
			var entry_info = event_info[i]
			// Get score
			users[entry_info[0]] = entry_info[1]
		}
		// Format & sort the data
		var list_data = []
		var keys = Object.keys(users)
		for (var i = 0; i < keys.length; i++) {
			var thisBadges = users[keys[i]]
			list_data.push([keys[i], thisBadges])
		}
		list_data.reverse()
		list_data.sort((a, b) => {
			/**
			 * @param {any[]} x
			 */
			function g(x) { return x[1] }
			if (g(a) < g(b)) {
				return -1;
			}
			if (g(a) > g(b)) {
				return 1;
			}
			// a must be equal to b
			return 0;
		})
		if (!info.data[event].reverseOrder) list_data.reverse()
		var ret_data = []
		for (var i = 0; i < list_data.length; i++) {
			ret_data.push(list_data[i][0])
		}
		return ret_data
	}
	/**
	 * @param {any} user
	 */
	function getUserObject(user) {
		for (var i = 0; i < info.users.length; i++) {
			var thisname = info.users[i].name
			if (thisname == user) return info.users[i]
		}
	}
	/**
	 * @param {any} user
	 */
	function getMetaPoints(user) {
		var users = getUserList()
		var points = 0
		var eventlist = Object.keys(info.data)
		for (var n = 0; n < eventlist.length; n++) {
			var event = eventlist[n]
			var ranks = getLeaderboardRanks(event)
			var rank = ranks.indexOf(user)
			var score = getScore(user, event)
			if (rank == -1) points += users.length
			else {
				// Find real score
				var duplicates = getDuplicates(eventlist[n], score)
				var pcscore = rank + 0
				for (var xn = rank - 1; xn >= 0; xn--) {
					if (duplicates.includes(ranks[xn])) {
						pcscore -= 1
					}
				}
				// Give points
				points += pcscore + 1
			}
		}
		return points
	}
	/**
	 * @param {any} user
	 */
	function getActivityPoints(user) {
		var firsts = 0
		var eventlist = Object.keys(info.data)
		for (var n = 0; n < eventlist.length; n++) {
			var event = eventlist[n]
			var score = getScore(user, event)
			if (score == undefined) continue;
			var vassal = info.data[event].badges
			if (vassal.length > 0) vassal = vassal[1]
			else continue;
			firsts += Math.round(score / (vassal / 25))
		}
		return firsts
	}
	return({
		getUserList,
		getBadgeTypeCounts,
		getTotalBadgeCounts,
		getScore,
		getTimeForEntry,
		getDesc,
		getDuplicates,
		getBadgeCount,
		getBadgeOwners,
		getEventList,
		getLeaderboardRanks,
		getUserObject,
		getMetaPoints,
		getActivityPoints,
		data: info.data,
		users: info.users,
		profile: info.profile
	})
}