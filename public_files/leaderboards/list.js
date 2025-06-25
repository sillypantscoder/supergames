sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	// Display buttons
	var leaderboards = info.leaderboards.sort((a, b) => {
		return a.game.localeCompare(b.game)
	})
	/** @type {string[]} */
	var games = []
	for (var i = 0; i < leaderboards.length; i++) {
		var game = leaderboards[i].game
		if (! games.includes(game)) {
			games.push(game)
		}
	}
	expect("#buttons").innerText = ""
	for (var i = 0; i < games.length; i++) {
		var e = document.createElement("a")
		e.innerText = games[i]
		e.href = "../games/" + games[i] + location.search
		expect("#buttons").appendChild(e)
	}
})
