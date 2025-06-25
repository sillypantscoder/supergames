/** @type {string} */
var gameName = expect("script[data-game]").dataset.game ?? "[Invalid]"

sgtabs.extra(2, "Game: " + gameName);

getData().then((info) => {
	sgtabs.userfix(info);
	// Display buttons
	var leaderboards = [...info.leaderboards].sort((a, b) => {
		return b.game.localeCompare(a.game)
	})
	expect("#buttons").innerText = ""
	for (var i = 0; i < leaderboards.length; i++) {
		if (leaderboards[i].game != gameName) continue
		var e = document.createElement("a")
		e.innerText = leaderboards[i].name
		e.href = "../leaderboards/" + leaderboards[i].name + location.search
		expect("#buttons").appendChild(e)
	}
})
