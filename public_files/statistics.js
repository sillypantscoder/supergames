/**
 * @param {HTMLElement} body
 * @param {Object<string, any[]>} categories
 * @param {((category: string, v: any) => boolean | null)[]} filters
 * @param {string} all_title
 * @param {any[]} all_values
 */
function addRows(body, categories, filters, all_title, all_values) {
	/** @type {Object<string, any[]>} */
	var _categories = {}
	// Get a list of keys (category names)
	var keys = Object.keys(categories)
	keys.sort((a, b) => a.localeCompare(b))
	// Populate the items copy
	for (var i = 0; i < keys.length; i++) _categories[keys[i]] = categories[keys[i]]
	// - "All" entry
	_categories[all_title] = [...all_values]
	keys.unshift(all_title)
	// Go through the list of keys
	for (var i = 0; i < keys.length; i++) {
		var o = keys[i]
		// Construct row
		var row = document.createElement("tr")
		row.appendChild(document.createElement("td"))
		row.children[0].textContent = o
		for (var j = 0; j < filters.length; j++) {
			// Filter
			/** @type {(v: any) => boolean | null} */
			var filter = (v) => filters[j](o, v)
			if (_categories[o].find((v) => filter(v) === null) != undefined) {
				// Blank
				row.appendChild(document.createElement("td"))
				continue;
			}
			var leaderboards = _categories[o].filter(filter).length
			// Create cell
			var cell = row.appendChild(document.createElement("td"))
			cell.textContent = leaderboards.toString()
		}
		// Insert row
		body.insertAdjacentElement("beforeend", row)
	}
}
/** @param {SGData} info */
function addGamesRows(info) {
	// Games by number of leaderboards
	var body = expect("#games")
	// - Collect all the games
	/** @type {Object<string, Leaderboard[]>} */
	var collected = {}
	for (var i = 0; i < info.leaderboards.length; i++) {
		var g = info.leaderboards[i].game
		if (collected[g] == undefined) collected[g] = []
		collected[g].push(info.leaderboards[i])
	}
	// - Get list of columns
	/** @type {((category: string, v: Leaderboard) => boolean)[]} */
	var filters = [
		(c, v) => true,
		(c, v) => v.badges != null,
		(c, v) => v.badges == null,
		(c, v) => v.isTime,
		(c, v) => !v.isTime,
		(c, v) => v.entries.length >= 1,
		(c, v) => v.entries.length >= 3
	]
	// - Add Rows
	addRows(body, collected, filters, "All Games", info.leaderboards)
}
/** @param {SGData} info */
function addLeaderboardsRows(info) {
	// Leaderboards by number of entries
	var body = expect("#leaderboards")
	// - Collect all the entries
	/** @type {Object<string, Entry[]>} */
	var collected = {}
	for (var i = 0; i < info.leaderboards.length; i++) {
		var g = info.leaderboards[i].name
		collected[g] = info.leaderboards[i].entries
	}
	// - Get list of columns
	/** @type {((category: string, v: Entry) => boolean | null)[]} */
	var filters = [
		(c, v) => true,
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[0])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[1])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[2])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[3])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[4])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[5])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[6])(info.getLeaderboard(c).badges),
		(c, v) => c == "All Leaderboards" ? null : ((badges) => badges == null ? null : v.score > badges.values[7])(info.getLeaderboard(c).badges)
	]
	// - Add Rows
	addRows(body, collected, filters, "All Leaderboards", info.leaderboards)
}
getData().then((info) => {
	// var autofills = [...document.querySelectorAll("[autofill]")]
	// for (var i = 0; i < autofills.length; i++) {
	// 	var e = autofills[i]
	// 	var fillWith = eval(e.getAttribute("autofill"))
	// 	var newE = document.createElement("td")
	// 	newE.innerText = fillWith
	// 	e.insertAdjacentElement("afterend", newE)
	// }
	addGamesRows(info)
	addLeaderboardsRows(info)
});