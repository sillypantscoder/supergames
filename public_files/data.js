window.addEventListener("error", (e) => alert(`${e.message} @${e.filename}:${e.lineno}`))
Object.prototype.toString = function () { var r = []; var keys = Object.keys(this); for (var i = 0; i < keys.length; i++) { r.push(`${keys[i]}: ${this[keys[i]]}`) } return "{" + r.join(", ") + "}" }
Array.prototype.toString = function () { return "[" + this.join(", ") + "]" }
function addCommas(t) { t = String(t); var i = t.lastIndexOf(".") - 3; if (i == -4) { i = t.length - 3 } for (; i > 0; i -= 3) { t = t.substring(0, i) + "," + t.substring(i, t.length) } return t }
function getColor(i) {
	if (i == 0) return "#FFFF00";
	else if (i == 1) return "#999999";
	else if (i == 2) return "#c27c53";
	else if (i < 10) return "#05ffe6";
	else if (i < 50) return "#148012";
	else if (i < 100) return "#6f1eba";
	else if (i < 500) return "#ff8103";
	else if (i < 1000) return "#0000c8";
	else if (i < 5000) return "#cf40cc";
	return "inherit";
}
function getSuffix(i) {
	if (i == 11) return 'th'
	if (i == 12) return 'th'
	if (i == 13) return 'th'
	return ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][Number(String(i)[String(i).length - 1])]
}

function getData() {
	return new Promise((resolve) => {
		var info = {
			users: null,
			data: null
		}
		function finish() {
			if (info.users == null) return
			if (info.data == null) return
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
						if (entry_info[1] >= e_values[0]) names[entry_info[0]][0] += 1
						if (entry_info[1] >= e_values[1]) names[entry_info[0]][0] += 1
						if (entry_info[1] >= e_values[2]) names[entry_info[0]][0] += 1
						if (entry_info[1] >= e_values[3]) names[entry_info[0]][1] += 1
						if (entry_info[1] >= e_values[4]) names[entry_info[0]][1] += 1
						if (entry_info[1] >= e_values[5]) names[entry_info[0]][2] += 1
						if (entry_info[1] >= e_values[6]) names[entry_info[0]][2] += 1
						if (entry_info[1] >= e_values[7]) names[entry_info[0]][3] += 1
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
						if (entry_info[1] >= e_values[0]) badges[0] += 1
						if (entry_info[1] >= e_values[1]) badges[0] += 1
						if (entry_info[1] >= e_values[2]) badges[0] += 1
						if (entry_info[1] >= e_values[3]) badges[1] += 1
						if (entry_info[1] >= e_values[4]) badges[1] += 1
						if (entry_info[1] >= e_values[5]) badges[2] += 1
						if (entry_info[1] >= e_values[6]) badges[2] += 1
						if (entry_info[1] >= e_values[7]) badges[3] += 1
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
			function getBadgeCount(user, event) {
				var event_info = info.data[event].entries
				for (var i = 0; i < event_info.length; i++) {
					var entry_info = event_info[i]
					if (entry_info[0] == user) {
						// Get badges
						var e_values = info.data[event].badges
						if (e_values.length == 0) return 0; // Specialty leaderboard
						var n_badges = 0
						if (entry_info[1] >= e_values[0]) n_badges += 1
						if (entry_info[1] >= e_values[1]) n_badges += 1
						if (entry_info[1] >= e_values[2]) n_badges += 1
						if (entry_info[1] >= e_values[3]) n_badges += 1
						if (entry_info[1] >= e_values[4]) n_badges += 1
						if (entry_info[1] >= e_values[5]) n_badges += 1
						if (entry_info[1] >= e_values[6]) n_badges += 1
						if (entry_info[1] >= e_values[7]) n_badges += 1
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
					var n_badges = 0
					if (entry_info[1] >= e_values[level]) users.push(entry_info[0])
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
				list_data.reverse()
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
			resolve({
				getUserList,
				getBadgeTypeCounts,
				getTotalBadgeCounts,
				getScore,
				getBadgeCount,
				getBadgeOwners,
				getEventList,
				getLeaderboardRanks,
				getUserObject,
				data: info.data,
				users: info.users
			})
		}
	})
}