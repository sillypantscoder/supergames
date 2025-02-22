sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	// Display buttons
	/** @type {string[]} */
	var games = []
	for (var i = 0; i < info.leaderboards.length; i++) {
		var game = info.leaderboards[i].game
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
