/** @type {string} */
var gameName = expect("script[data-game]").dataset.game ?? "[Invalid]"

sgtabs.extra(2, "Game: " + gameName);

getData().then((info) => {
	sgtabs.userfix(info);
	// Display buttons
	expect("#buttons").innerText = ""
	for (var i = 0; i < info.leaderboards.length; i++) {
		if (info.leaderboards[i].game != gameName) continue
		var e = document.createElement("a")
		e.innerText = info.leaderboards[i].name
		e.href = "../leaderboards/" + info.leaderboards[i].name + location.search
		expect("#buttons").appendChild(e)
	}
})
