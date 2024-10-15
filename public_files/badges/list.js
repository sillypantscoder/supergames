sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	for (var i = 0; i < info.leaderboards.length; i++) {
		// Get badge values
		var leaderboard = info.leaderboards[i]
		if (leaderboard.badges == null) continue;
		var badges = leaderboard.badges.values
		// Create table row
		var e = document.createElement("tr")
		var n = document.createElement("td")
		n.innerHTML = `<a href="/leaderboard/${leaderboard.name}${location.search}" style="color: rgb(0, 0, 200);">${leaderboard.name}</a>`
		e.appendChild(n)
		for (var x = 0; x < badges.length; x++) {
			var n = document.createElement("td")
			n.innerText = leaderboard.isTime ? formatTime(badges[x]) : addCommas(badges[x].toString())
			var bl = document.createElement("a")
			bl.href = "/badges/" + leaderboard.name + "/" + x + location.search
			n.appendChild(bl)
			var b = document.createElement("div")
			b.classList.add("badge")
			b.classList.add("badge-" + ["bronze", "bronze", "bronze", "silver", "silver", "gold", "gold", "platinum"][x])
			b.innerText = "NVAPREMU"[x]
			bl.appendChild(b)
			e.appendChild(n)
		}
		if (leaderboard.badges == null) {
			// Specialty leaderboard!
			var n = document.createElement("td")
			n.setAttribute("colspan", "8")
			n.setAttribute("style", "opacity: 0.5; font-style: italic; text-align: center;")
			n.innerText = `This is a specialty leaderboard; there are no badges`
			e.appendChild(n)
		}
		expect("table tbody").appendChild(e)
	}
})