sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	var leaderboard = new ActivityLeaderboard(info);
	var ranked = leaderboard.getRanked();
	for (var i = 0; i < info.users.length; i++) {
		var entry = ranked[i]
		// Create the element
		var e = document.createElement("tr")
		e.appendChild(document.createElement("td"))
			e.children[0].classList.add("outline")
			e.children[0].setAttribute("style", `text-align: right; color: ${getColor(i)};`)
			e.children[0].innerHTML = addCommas(String(i + 1)) + getSuffix(i + 1)
		e.appendChild(document.createElement("td"))
			e.children[1].setAttribute("style", "text-align: right;")
			e.children[1].appendChild(document.createElement("a"))
				e.children[1].children[0].setAttribute("href", "/profile/" + entry.user.name + location.search)
				e.children[1].children[0].setAttribute("style", "color: rgb(0, 0, 200);")
				e.children[1].children[0].textContent = entry.user.name
		e.appendChild(document.createElement("td"))
			e.children[2].setAttribute("class", "outline")
			e.children[2].setAttribute("style", `color: ${getColor(i)};`)
			e.children[2].innerHTML = addCommas(entry.score.toString())
		expect("#athl tbody").appendChild(e)
	}
	expect("#e").setAttribute("max", i.toString())
})
