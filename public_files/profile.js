sgtabs.extra(0, "Profile: {{NAME}}");

getData().then((info) => {
	sgtabs.userfix(info);
	var this_user_obj = info.getUserObject("{{NAME}}")
	document.querySelector("#desc").appendChild(document.createElement("div"))
	document.querySelector("#desc").children[0].innerText = this_user_obj.desc
	var userlist = info.getUserList()
	if (! userlist.includes("{{NAME}}")) {
		// Invalid profile...
		document.querySelectorAll(".rm").forEach((e) => e.remove())
		document.querySelector("#header").innerText = "The profile does not exist. Use one of the tabs at the top to get back to a real page."
		return;
	}
	document.querySelector("#profilen").innerText = ((userlist.length - 1) - userlist.indexOf("{{NAME}}")) + 1
	var join_date = new Date(this_user_obj.date + "T08:00")
	document.querySelector("#joindate").innerText = `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][join_date.getDay()]}, ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][join_date.getMonth()]} ${join_date.getDate()}, ${join_date.getFullYear()}`
	// Get data
	var eventlist = info.getEventList("{{NAME}}")
	for (var eventno = 0; eventno < eventlist.length; eventno++) {
		// Create the row
		var e = document.createElement("tr")
		// 1st column: Leaderboard name
		e.appendChild(document.createElement("td"))
			e.children[0].appendChild(document.createElement("a"))
				e.children[0].children[0].href = "/leaderboard/" + eventlist[eventno] + location.search
				e.children[0].children[0].setAttribute("style", "color: rgb(0, 0, 200);")
				e.children[0].children[0].innerText = eventlist[eventno]
		// 2nd column: Score
		e.appendChild(document.createElement("td"))
			e.children[1].setAttribute("style", "text-align: right;")
			var score = info.getScore("{{NAME}}", eventlist[eventno])
			if (info.data[eventlist[eventno]].isTime) {
				e.children[1].innerText = formatTime(score)
			} else {
				e.children[1].innerText = addCommas(score)
			}
		// 3rd column: Badges
		e.appendChild(document.createElement("td"))
			var badgeno = info.getBadgeCount("{{NAME}}", eventlist[eventno])
			for (var i = 0; i < badgeno; i++) {
				e.children[2].innerHTML += `<a href="/badges/${eventlist[eventno]}/${i}${location.search}"><div class="badge badge-${['bronze', 'bronze', 'bronze', 'silver', 'silver', 'gold', 'gold', 'platinum'][i]}">${'NVAPREMU'[i]}</div></a>`
			}
		// Progress bar: Distance to next badge
		if (badgeno < 8) {
			if (info.data[eventlist[eventno]].badges.length == 0) {
				e.children[2].innerHTML = "<i style='font-family: sans-serif; font-size: 0.7em;'>Specialty leaderboard</i>"
			} else {
				var bar = document.createElement("a")
				bar.setAttribute("href", `/badges/${eventlist[eventno]}/${badgeno}${location.search}`)
				bar.classList.add("bar")
				bar.innerText = ["Novice", "Vassal", "Apprentice", "Prospect", "Artisan", "Expert", "Master", "Ultimate Master"][badgeno]
				var nextValue = info.data[eventlist[eventno]].badges[badgeno]
				var prevValue = [0, ...info.data[eventlist[eventno]].badges][badgeno]
				bar.setAttribute("style", `--amount: ${(score - prevValue) / (nextValue - prevValue)};`);
				e.children[2].appendChild(bar)
			}
		}
		// 4th column: Rank
		e.appendChild(document.createElement("td"))
			var ranks = info.getLeaderboardRanks(eventlist[eventno])
			var i = ranks.indexOf("{{NAME}}")
			// Find real score
			var duplicates = info.getDuplicates(eventlist[eventno], score)
			var pcscore = i + 0
			for (var n = i - 1; n >= 0; n--) {
				if (duplicates.includes(ranks[n])) {
					pcscore -= 1
				}
			}
			// Create the element
			var s = "<span class='outline'"
			if (pcscore < 3) s += " style='"
			else s += " style='font-size: 0.8em; opacity: 0.7; "
			s += `color: ${getColor(pcscore)};`
			s += "'>"
			if (duplicates.length > 1) s += "<i>T</i> "
			e.children[3].innerHTML = `${s}${pcscore + 1}${getSuffix(pcscore + 1)} place</span>`
		// Progress bar: Distance to next place
		if (pcscore > 0 && (! info.data[eventlist[eventno]].reverseOrder)) {
			var ranks = info.getLeaderboardRanks(eventlist[eventno])
			var bar = document.createElement("a")
			bar.classList.add("bar")
			bar.innerText = String(pcscore) + getSuffix(pcscore)
			var nextValue = info.getScore(ranks[pcscore - 1], eventlist[eventno])
			var thisValue = info.getScore(ranks[pcscore], eventlist[eventno])
			var prevValue = info.getScore(ranks[pcscore + 1], eventlist[eventno])
			if (prevValue == undefined) prevValue = 0
			// bar.innerText = `${prevValue} - ${thisValue} - ${nextValue}`
			bar.setAttribute("style", `--amount: ${(thisValue - prevValue) / (nextValue - prevValue)}; background: ${getColor(pcscore - 1)};`);
			e.children[3].appendChild(bar)
		}
		// Add the row to the table
		document.querySelector("table tbody").appendChild(e)
	}
	// badge leaderboard
	var badgeranks = info.getBadgeTypeCounts()
	for (var i = 0; i < badgeranks.length; i++) {
		if (badgeranks[i][0] == "{{NAME}}") {
			var e = document.createElement("tr")
			e.appendChild(document.createElement("td"))
				e.children[0].setAttribute("colspan", "3")
				e.children[0].innerText = "Badge Leaderboard"
			e.appendChild(document.createElement("td"))
				e.children[1].innerHTML = `<b class="outline" style="color: ${getColor(i)};">${i + 1}${getSuffix(i + 1)} place</b>`
			document.querySelector("table tbody").appendChild(e)
		}
	}
	// meta
	var users = info.getUserList()
	users.reverse()
	var user_data = {}
	for (var i = 0; i < users.length; i++) {
		var user = users[i]
		user_data[user] = info.getMetaPoints(user)
	}
	users.sort((a, b) => {
		if (user_data[a] < user_data[b]) {
			return -1;
		}
		if (user_data[a] > user_data[b]) {
			return 1;
		}
		// a must be equal to b
		return 0;
	})
	var meta_rank = users.indexOf("{{NAME}}")
	var e = document.createElement("tr")
		e.appendChild(document.createElement("td"))
			e.children[0].setAttribute("colspan", "3")
			e.children[0].innerText = "Meta Leaderboard"
		e.appendChild(document.createElement("td"))
			e.children[1].innerHTML = `<b class="outline" style="color: ${getColor(meta_rank)};">${meta_rank + 1}${getSuffix(meta_rank + 1)} place</b>`
		document.querySelector("table tbody").appendChild(e)
	// activity leaderboard
	var users = info.getUserList()
	var user_data = {}
	for (var i = 0; i < users.length; i++) {
		var user = users[i]
		user_data[user] = info.getActivityPoints(user)
	}
	users.sort((a, b) => {
		if (user_data[a] < user_data[b]) {
			return 1;
		}
		if (user_data[a] > user_data[b]) {
			return -1;
		}
		// a must be equal to b
		return 0;
	})
	var active_rank = users.indexOf("{{NAME}}")
	var e = document.createElement("tr")
		e.appendChild(document.createElement("td"))
			e.children[0].setAttribute("colspan", "3")
			e.children[0].innerText = "Activity Leaderboard"
		e.appendChild(document.createElement("td"))
			e.children[1].innerHTML = `<b class="outline" style="color: ${getColor(active_rank)};">${active_rank + 1}${getSuffix(active_rank + 1)} place</b>`
		document.querySelector("table tbody").appendChild(e)
	// Are we on our own profile page?
	if (window.isOwnProfile) {
		// Yes we are!
		// Add buttons
		document.querySelector("#self").innerHTML = "<b>This is your profile page.</b> <a style='color: rgb(0, 0, 200);' href='/'>Sign Out</a> <a style='color: rgb(0, 0, 200);' href='javascript:void(changepwd());'>Change Password</a>"
		// Add "change description" button
		document.querySelector("#desc").insertAdjacentElement("afterBegin", document.createElement("div"))
		document.querySelector("#desc").childNodes[0].appendChild(document.createElement("button"))
		document.querySelector("#desc").childNodes[0].children[0].innerText = "edit"
		document.querySelector("#desc").childNodes[0].children[0].setAttribute("onclick", "changedesc()")
		// Hint
		if (document.querySelector("table tbody").children.length <= 4) {
			document.querySelector("#hint").removeAttribute("style")
			document.querySelector("#submitscoresbtn").setAttribute("href", "/form/0" + location.search)
		}
		// Admin tools
		if (info.profile[0].admin) {
			// document.querySelector("#self").innerHTML += " <a style='color: rgb(0, 0, 200);' href='javascript:void(changeuser());'>Change User</a>"
			document.querySelector("#self").innerHTML += ` <a style='color: rgb(0, 0, 200);' href='/admin.html${location.search}'>Admin Board</a>`
			window.changeuser = () => {
				var newUser = prompt("Enter the new username")
				if (newUser == null) return;
				location.replace("/user_id_create/sudo?" + location.search.substr(1) + "&" + newUser)
			}
		}
	} else if (info.profile[0].admin) {
		document.querySelector("#self").innerHTML = "<a style='color: rgb(0, 0, 200);' href='javascript:void(changeuser());'>Switch User</a>"
		window.changeuser = () => {
			var newUser = location.pathname.split("/")[2]
			location.replace("/user_id_create/sudo?" + location.search.substr(1) + "&" + newUser)
		}
	}
})
function changepwd() {
	var newPwd = prompt("Enter the new password")
	if (newPwd == null) return;
	if (confirm("Are you sure you want to change your password? (You will be logged out.)")) {
		var x = new XMLHttpRequest()
		x.open("POST", "/setting/pwd")
		x.addEventListener("loadend", (e) => {
			location.replace("/login.html")
		})
		x.send(location.search.substr(1) + "\n" + newPwd)
	}
}
function changedesc() {
	document.querySelector("#desc").appendChild(document.createElement("div"))
	document.querySelector("#desc").children[2].appendChild(document.createElement("textarea"))
	document.querySelector("#desc").children[2].children[0].setAttribute("style", "width: 100%; height: 20vh;")
	document.querySelector("#desc").children[2].children[0].value = document.querySelector("#desc").children[1].innerText
	document.querySelector("#desc").children[1].remove()
	document.querySelector("#desc").children[0].children[0].remove()
	document.querySelector("#desc").children[0].appendChild(document.createElement("button"))
	document.querySelector("#desc").children[0].children[0].innerText = "cancel"
	document.querySelector("#desc").children[0].children[0].setAttribute("onclick", "location.reload()")
	document.querySelector("#desc").children[0].appendChild(document.createElement("button"))
	document.querySelector("#desc").children[0].children[1].innerText = "submit"
	document.querySelector("#desc").children[0].children[1].setAttribute("onclick", "submitChangeDesc()")
}
function submitChangeDesc() {
	var t = document.querySelector("#desc").children[1].children[0].value
	var x = new XMLHttpRequest()
	x.open("POST", "/setting/desc")
	x.addEventListener("loadend", (e) => {
		location.reload()
	})
	x.send(location.search.substr(1) + "\n" + t)
}