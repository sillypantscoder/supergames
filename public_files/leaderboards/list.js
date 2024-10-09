sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	// Display buttons
	expect("#buttons").innerText = ""
	for (var i = 0; i < info.leaderboards.length; i++) {
		var e = document.createElement("a")
		e.innerText = info.leaderboards[i].name
		e.href = "./" + info.leaderboards[i].name + location.search
		expect("#buttons").appendChild(e)
	}
})
