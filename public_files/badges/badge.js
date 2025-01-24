/** @type {string} */
var leaderboardName = expect("script[data-leaderboard]").dataset.leaderboard ?? "[Invalid]"
/** @type {number} */
var rank = Number(expect("script[data-rank]").dataset.rank ?? "[Invalid]")

var stringRank = ["Novice", "Vassal", "Apprentice", "Prospect", "Artisan", "Expert", "Master", "Ultimate Master"][rank]

sgtabs.extra(3, stringRank + " " + leaderboardName)

getData().then((info) => {
	sgtabs.userfix(info);
	// get badge info
	var leaderboard = info.getLeaderboard(leaderboardName)
	if (leaderboard.badges == null) throw new Error("This is a specialty leaderboard, it does not have badges")
	var badge_value = leaderboard.badges.values[rank]
	var badge_desc = leaderboard.badges.description
	expect("#badge_desc").innerText = `${badge_desc.replaceAll("%s", leaderboard.isTime ? formatTime(badge_value) : addCommas(badge_value.toString()))}`
	// owners
	var owners = leaderboard.getUsersWithBadge(info.users, rank)
	for (var i = 0; i < owners.length; i++) {
		var e = document.createElement("li")
		e.appendChild(document.createElement("a"))
			e.children[0].setAttribute("href", "/profile/" + owners[i].name + location.search)
			e.children[0].setAttribute("style", "color: rgb(0, 0, 200);")
			e.children[0].appendChild(document.createElement("b"))
				e.children[0].children[0].textContent = owners[i].name
		e.appendChild(document.createElement("span"))
			var score = leaderboard.getEntryForUser(owners[i])
			if (score != undefined) {
				if (leaderboard.isTime) {
					e.children[1].textContent = ` at ${formatTime(score.score)}`
				} else {
					e.children[1].textContent = ` with ${addCommas(score.score.toString())} points`
				}
			}
		expect("#owners").appendChild(e)
	}
})
expect("#leaderboard_link").setAttribute("href", expect("#leaderboard_link").getAttribute("href") + location.search)