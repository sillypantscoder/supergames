window.addEventListener("error", (e) => alert(`${e.message} @${e.filename}:${e.lineno}`))
Object.prototype.toString = function () { var r = []; var keys = Object.keys(this); for (var i = 0; i < keys.length; i++) { r.push(`${keys[i]}: ${this[keys[i]]}`) } return "{" + r.join(", ") + "}" }
Array.prototype.toString = function () { return "[" + this.join(", ") + "]" }
function addCommas(t) { t = String(t); var i = t.lastIndexOf(".") - 3; if (i == -4) { i = t.length - 3 } for (; i > 0; i -= 3) { t = t.substring(0, i) + "," + t.substring(i, t.length) } return t }
function formatTime(t) { var s = ""; if (t > 3600) { s += String(Math.floor(t / 3600)) + "h " } if (t > 60) { s += String(Math.floor((t % 3600) / 60)) + "m " } s += String(Math.floor(t % 60)); if (t % 1 != 0) { s += "." + String(Math.round((t % 1) * 1000)).padEnd(3, "0") } s += "s"; return s }
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
function getSuffix(i) {
	if (i == 11) return 'th'
	if (i == 12) return 'th'
	if (i == 13) return 'th'
	return ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][Number(String(i)[String(i).length - 1])]
}
function describe(key, obj) {
	var e = frame.createElement("div")
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
			e.children[0].children[0].innerText = "x"
			expanded = true
			e.appendChild(frame.createElement("div"))
			e.children[1].setAttribute("style", "margin-left: 4ch;")
			var items = [Object.keys(obj), Object.values(obj)]
			for (var i = 0; i < items[0].length; i++) {
				e.children[1].appendChild(describe(items[0][i], items[1][i]))
			}
		} else {
			e.children[0].children[0].innerText = ">"
			expanded = false
			e.children[1].remove()
		}
	}
	return e
}

function getData() {
	return new Promise((resolve) => {
		var info = {
			users: null,
			data: null,
			profile: null
		}
		function finish() {
			if (info.users == null) return
			if (info.data == null) return
			if (info.profile == null) return
			generateObject(info)
		}
		var x1 = new XMLHttpRequest()
		x1.open("GET", "/users.json")
		x1.addEventListener("loadend", (e) => {
			info.users = JSON.parse(e.target.responseText)
			finish()
		})
		x1.send()
		var x2 = new XMLHttpRequest()
		x2.open("GET", "/data.json")
		x2.addEventListener("loadend", (e) => {
			info.data = JSON.parse(e.target.responseText)
			finish()
		})
		x2.send()
		var x3 = new XMLHttpRequest()
		x3.open("GET", "/usercheck" + location.search)
		x3.addEventListener("loadend", (e) => {
			info.profile = JSON.parse(e.target.responseText)
			finish()
		})
		x3.send()
		// generator
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
						var f = (entry, badge) => (entry >= badge)
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
				var userlist = getUserList()
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
						var f = (entry, badge) => (entry >= badge)
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
			function getScore(user, event) {
				var event_info = info.data[event].entries
				for (var i = 0; i < event_info.length; i++) {
					var entry_info = event_info[i]
					if (entry_info[0] == user) return entry_info[1]
				}
			}
			function getDuplicates(event, score) {
				var users = []
				var event_info = info.data[event].entries
				for (var i = 0; i < event_info.length; i++) {
					var entry_info = event_info[i]
					if (entry_info[1] == score) users.push(entry_info[0])
				}
				return users
			}
			function getBadgeCount(user, event) {
				var event_info = info.data[event].entries
				for (var i = 0; i < event_info.length; i++) {
					var entry_info = event_info[i]
					if (entry_info[0] == user) {
						// Get badges
						var e_values = info.data[event].badges
						if (e_values.length == 0) return 0; // Specialty leaderboard
						var n_badges = 0
						var f = (entry, badge) => (entry >= badge)
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
			function getBadgeOwners(event, level) {
				var users = []
				var event_info = info.data[event].entries
				for (var i = 0; i < event_info.length; i++) {
					var entry_info = event_info[i]
					// Get badges
					var e_values = info.data[event].badges
					var f = (entry, badge) => (entry >= badge)
					if (info.data[event].reverseOrder) f = (entry, badge) => (entry <= badge)
					if (f(entry_info[1], e_values[level])) users.push(entry_info[0])
				}
				users.sort((a, b) => {
					return getScore(b, event) - getScore(a, event)
				})
				return users
			}
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
			function getLeaderboardRanks(event) {
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
			function getUserObject(user) {
				for (var i = 0; i < info.users.length; i++) {
					var thisname = info.users[i].name
					if (thisname == user) return info.users[i]
				}
			}
			function getMetaPoints(user) {
				var users = getUserList()
				var points = 0
				var eventlist = Object.keys(info.data)
				for (var n = 0; n < eventlist.length; n++) {
					var event = eventlist[n]
					var ranks = getLeaderboardRanks(event)
					var rank = ranks.indexOf(user)
					if (rank == -1) points += users.length
					else points += rank + 1
				}
				return points
			}
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
			resolve({
				getUserList,
				getBadgeTypeCounts,
				getTotalBadgeCounts,
				getScore,
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
	})
}