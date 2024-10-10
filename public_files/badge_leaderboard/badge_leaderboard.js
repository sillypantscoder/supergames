sgtabs();
getData().then((info) => { try {
	sgtabs.userfix(info);
	var user_data = info.getBadgeLeaderboardRanked()
	for (var i = 0; i < user_data.length; i++) {
		var username = user_data[i].user.name
		var counts = user_data[i]
		if (counts == undefined) throw new Error("The user is not registered")
		// Create the element
		var e = document.createElement("tr")
		e.appendChild(document.createElement("td"))
			e.children[0].setAttribute("style", "text-align: right;")
			e.children[0].appendChild(document.createElement("a"))
				e.children[0].children[0].setAttribute("href", "/profile/" + username + location.search)
				e.children[0].children[0].setAttribute("style", "color: rgb(0, 0, 200);")
				e.children[0].children[0].textContent = username
		e.appendChild(document.createElement("td"))
			e.children[1].innerHTML = "<div class='badge badge-bronze'></div>" + counts.badges[0]
		e.appendChild(document.createElement("td"))
			e.children[2].innerHTML = "<div class='badge badge-silver'></div>" + counts.badges[1]
		e.appendChild(document.createElement("td"))
			e.children[3].innerHTML = "<div class='badge badge-gold'></div>" + counts.badges[2]
		e.appendChild(document.createElement("td"))
			e.children[4].innerHTML = "<div class='badge badge-platinum'></div>" + counts.badges[3]
		expect("#badges2 tbody").appendChild(e)
	}
	expect("#e").setAttribute("max", i.toString())
	// Statistics
	var total_badges = [...user_data.values()].reduce((a, b) => a.map((v, i) => v + b.badges[i]), [0, 0, 0, 0])
	var total_users = info.users.length
	var total_events = (() => { var n = 0; for (var i = 0; i < info.leaderboards.length; i++) { if (info.leaderboards[i].badges != null) n += 1; } return n; })();
	expect("#stats").innerHTML =
		`<div class="physics">Total awarded badges of each type:</div>` +
		`<span class="physics"><div class='badge badge-bronze'></div>${total_badges[0]}</span> <span class="physics"><div class='badge badge-silver'></div>${total_badges[1]}</span> <span class="physics"><div class='badge badge-gold'></div>${total_badges[2]}</span> <span class="physics"><div class='badge badge-platinum'></div>${total_badges[3]}</span><br>` +
		`<div class="physics">Total number of awarded badges: <b>${total_badges[0] + total_badges[1] + total_badges[2] + total_badges[3]}</b></div>` +
		`<div class="physics">Total number of users: <b>${total_users}</b></div>` +
		`<div class="physics">Average number of badges per user: <b>${Math.round(((total_badges[0] + total_badges[1] + total_badges[2] + total_badges[3]) / total_users) * 10) / 10}</b></div>` +
		`<div class="physics">Average number of badges of each type per user:</div>` +
		`<span class="physics"><div class='badge badge-bronze'></div>${Math.round((total_badges[0] / total_users) * 100) / 100}</span> <span class="physics"><div class='badge badge-silver'></div>${Math.round((total_badges[1] / total_users) * 100) / 100}</span> <span class="physics"><div class='badge badge-gold'></div>${Math.round((total_badges[2] / total_users) * 100) / 100}</span> <span class="physics"><div class='badge badge-platinum'></div>${Math.round((total_badges[3] / total_users) * 100) / 100}</span>` +
		`<div class="physics">Total badges available to earn:</div>` +
		`<span class="physics"><div class='badge badge-bronze'></div>${total_events * 3}</span> <span class="physics"><div class='badge badge-silver'></div>${total_events * 2}</span> <span class="physics"><div class='badge badge-gold'></div>${total_events * 2}</span> <span class="physics"><div class='badge badge-platinum'></div>${total_events * 1}</span>`
} catch (e) { alert(e) }
})
function scrollToEntrySpecial() {
	scrollToEntry(Number(expectInput(expect("#e")).valueAsNumber - 1))
}