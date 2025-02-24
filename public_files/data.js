const query = (() => {
	/** @type {Object<string, string>} */
	var q = {}
	var items = location.search.substring(1).split("&")
	for (var item of items) {
		var key = item.split("=")[0]
		var val = item.split("=")[1]
		if (val == undefined) val = "1"
		// record the item
		q[key] = val
	}
	return {
		raw: q,
		/** @type {(key: string, defaultValue: string) => string} */
		get: (key, defaultValue) => {
			if (Object.keys(q).includes(key)) return q[key]
			else return defaultValue
		},
		/** @type {(key: string) => boolean} */
		has: (key) => {
			if (Object.keys(q).includes(key)) return true
			else return false
		}
	}
})();
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
	x.send(`url: ${location.href}; message: ${e.message} @${e.filename}:${e.lineno}`)
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
/**
 * @param {Node} e
 * @returns {HTMLSelectElement}
 */
function expectSelect(e) {
	if (! (e instanceof HTMLSelectElement)) throw new Error("Element is not a select: " + e)
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
	 * @param {string} game
	 * @param {string} description
	 * @param {{ values: number[], description: string } | null} badges
	 * @param {Entry[]} entries
	 * @param {boolean} reverseOrder
	 * @param {boolean} isTime
	 */
	constructor(name, game, description, badges, entries, reverseOrder, isTime) {
		this.name = name
		this.game = game ?? "undefined"
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
	 * Get a list of all the entries in the leaderboard, sorted according to score from best to worst.
	 */
	getRanked() {
		// Organize the entries according to score
		/** @type {Object<string, { entry: Entry, rank: number, tied: boolean }[]>} */
		var scores = {}
		for (var i = 0; i < this.entries.length; i++) {
			var entry = this.entries[i]
			// Get score
			if (! Object.keys(scores).includes(entry.score.toString())) {
				scores[entry.score.toString()] = []
			}
			scores[entry.score.toString()].push({ entry, rank: i, tied: false })
		}
		// Go through all the possible scores
		var possibleScores = Object.keys(scores).map((v) => Number(v))
		possibleScores.sort();
		var cumRank = 1 // (Keep track of the rank)
		for (var score of possibleScores) {
			var entriesWithThisScore = scores[score]
			entriesWithThisScore.forEach((v) => {
				v.rank = cumRank;
				v.tied = entriesWithThisScore.length > 1
			})
			cumRank += entriesWithThisScore.length // (Increase the rank)
		}
		// Collect all the entries now that we've set their `rank` and `tied` parameters
		var collected = Object.values(scores).reduce((a, b) => [...a, ...b], [])
		// Order the entries appropriately
		collected.sort((a, b) => {
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
		if (!this.reverseOrder) collected.reverse()
		// Finish
		return collected
	}
	/**
	 * @param {number} score
	 */
	getNumberOfBadges(score) {
		if (this.badges == null) throw new Error("There are no badges on a specialty leaderboard")
		if (!this.reverseOrder) {
			// Highest score is best. Return 0 if the score is less than the lowest badge.
			if (score < this.badges.values[0]) return 0
			// For each badge from left to right (lowest to highest), stop once we find a higher badge.
			for (var i = 0; i < this.badges.values.length; i++) {
				if (this.badges.values[i] > score) return i
			}
			return this.badges.values.length
		} else {
			// Lowest score is best. Return 0 if the score is higher than the highest badge.
			if (score > this.badges.values[0]) return 0
			// For each badge from right to left (lowest to highest), stop once we find a lower badge.
			for (var i = this.badges.values.length - 1; i >= 0; i--) {
				if (this.badges.values[i] >= score) return i + 1
			}
			return 0
		}
	}
	/**
	 * @param {User} user
	 * @param {number} badge_rank
	 */
	doesUserHaveBadge(user, badge_rank) {
		var score = this.getEntryForUser(user)?.score
		if (score == undefined) return false
		var n = this.getNumberOfBadges(score)
		return n >= badge_rank + 1
	}
	/**
	 * @param {User[]} userList
	 * @param {number} badge_rank
	 */
	getUsersWithBadge(userList, badge_rank) {
		return userList.filter((v) => this.doesUserHaveBadge(v, badge_rank))
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
class Form {
	/**
	 * @param {string} name
	 * @param {any[]} questions
	 * @param {any[]} responses
	 */
	constructor(name, questions, responses) {
		this.name = name
		this.questions = questions
		this.responses = responses
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
	 * @param {string} name
	 */
	getUserForName(name) {
		for (var i = 0; i < this.users.length; i++) {
			if (this.users[i].name == name) {
				return this.users[i]
			}
		}
		throw new Error("There is no user with the name: " + name)
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
		var leaderboard = new Leaderboard(eventname, eventData.game, eventData.leaderboard_desc, eventData.badges.length == 0 ? null : {
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