/** @type {string} */
var profileName = expect("script[data-profile]").dataset.profile ?? "[Invalid]"

sgtabs.extra(0, "Profile: " + profileName);

getData().then((info) => {
	sgtabs.userfix(info);
	var this_user_obj_index = info.users.findIndex((v) => v.name == profileName)
	if (this_user_obj_index == undefined) {
		// Invalid profile...
		document.querySelectorAll(".rm").forEach((e) => e.remove())
		expect("#header").innerText = "The profile does not exist. Use one of the tabs at the top to get back to a real page."
		return
	}
	var this_user_obj = info.users[this_user_obj_index];
	expect("#desc").appendChild(document.createElement("div"))
	expect("#desc").children[0].textContent = this_user_obj.desc
	expect("#profilen").innerText = String(1 + info.users.sort((a, b) => a.date.getTime() - b.date.getTime()).indexOf(this_user_obj))
	expect("#joindate").innerText = `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this_user_obj.date.getDay()]}, \
	${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][this_user_obj.date.getMonth()]} \
	${this_user_obj.date.getDate()}, ${this_user_obj.date.getFullYear()}`
	// Get data
	for (var eventno = 0; eventno < info.leaderboards.length; eventno++) {
		var event = info.leaderboards[eventno]
		var entry = event.getEntryForUser(this_user_obj)
		if (entry == undefined) continue;
		// Create the row
		var e = document.createElement("tr")
		// 1st column: Leaderboard name
		e.appendChild(document.createElement("td"))
			e.children[0].appendChild(document.createElement("a"))
				e.children[0].children[0].setAttribute("href", "/leaderboards/" + event.name + location.search)
				e.children[0].children[0].setAttribute("style", "color: rgb(0, 0, 200);")
				e.children[0].children[0].textContent = event.name
		// 2nd column: Score
		e.appendChild(document.createElement("td"))
			e.children[1].setAttribute("style", "text-align: right;")
			if (event.isTime) {
				e.children[1].textContent = formatTime(entry.score)
			} else {
				e.children[1].textContent = addCommas(entry.score.toString())
			}
		// 3rd column: Badges
		e.appendChild(document.createElement("td"))
			if (event.badges == null) {
				e.children[2].innerHTML = "<i style='font-family: sans-serif; font-size: 0.7em;'>Specialty leaderboard</i>"
			} else {
				var badgeno = event.getNumberOfBadges(entry.score)
				for (var i = 0; i < badgeno; i++) {
					e.children[2].innerHTML += `<a href="/badges/${event}/${i}${location.search}"><div class="badge badge-${['bronze', 'bronze', 'bronze', 'silver', 'silver', 'gold', 'gold', 'platinum'][i]}">${'NVAPREMU'[i]}</div></a>`
				}
				// Progress bar: Distance to next badge
				if (badgeno < 8) {
					var bar = document.createElement("a")
					bar.setAttribute("href", `/badges/${event}/${badgeno}${location.search}`)
					bar.classList.add("bar")
					bar.innerText = ["Novice", "Vassal", "Apprentice", "Prospect", "Artisan", "Expert", "Master", "Ultimate Master"][badgeno]
					var nextBadgeValue = event.badges.values[badgeno]
					var prevBadgeValue = [0, ...event.badges.values][badgeno]
					bar.setAttribute("style", `--amount: ${(entry.score - prevBadgeValue) / (nextBadgeValue - prevBadgeValue)};`);
					e.children[2].appendChild(bar)
				}
			}
		// 4th column: Rank
		e.appendChild(document.createElement("td"))
			var ranks = event.getRanked()
			var i = ranks.findIndex((v) => v.entry.user == this_user_obj)
			if (i == undefined) throw new Error("User is not listed in ranked")
			// Create the element
			var s = "<span class='outline'"
			if (i < 3) s += " style='"
			else s += " style='font-size: 0.8em; opacity: 0.7; "
			s += `color: ${getColor(i)};`
			s += "'>"
			// if (duplicates.length > 1) s += "<i>T</i> "
			e.children[3].innerHTML = `${s}${i + 1}${getSuffix(i + 1)} place</span>`
		// Progress bar: Distance to next place
		if (i > 0 && (! event.reverseOrder)) {
			var ranks = event.getRanked()
			var bar = document.createElement("a")
			bar.classList.add("bar")
			bar.innerText = String(i) + getSuffix(i)
			var nextValue = ranks[i - 1].entry.score
			var thisValue = ranks[i].entry.score
			var prevValue = ranks[i + 1].entry.score
			if (prevValue == undefined) prevValue = 0
			// bar.innerText = `${prevValue} - ${thisValue} - ${nextValue}`
			bar.setAttribute("style", `--amount: ${(thisValue - prevValue) / (nextValue - prevValue)}; background: ${getColor(i - 1)};`);
			e.children[3].appendChild(bar)
		}
		// Add the row to the table
		expect("table tbody").appendChild(e)
	}
	// badge leaderboard
	(() => {
		var badgeranks = info.getBadgeLeaderboardRanked()
		var rank = badgeranks.findIndex((v) => v.user == this_user_obj)
		if (rank == undefined) throw new Error("User is not on the badge leaderboard! (Somehow.)")
			var e = document.createElement("tr")
			e.appendChild(document.createElement("td"))
				e.children[0].setAttribute("colspan", "3")
				e.children[0].textContent = "Badge Leaderboard"
			e.appendChild(document.createElement("td"))
				e.children[1].innerHTML = `<b class="outline" style="color: ${getColor(rank)};">${rank + 1}${getSuffix(rank + 1)} place</b>`
			expect("table tbody").appendChild(e)
	})();
	// meta
	(() => {
		var users = [...info.users]
		users.reverse()
		users.sort((a, b) => {
			var ascore = info.getMetaPoints(a)
			var bscore = info.getMetaPoints(b)
			if (ascore < bscore) {
				return -1;
			}
			if (ascore > bscore) {
				return 1;
			}
			// a must be equal to b
			return 0;
		})
		var meta_rank = users.indexOf(this_user_obj)
		var e = document.createElement("tr")
			e.appendChild(document.createElement("td"))
				e.children[0].setAttribute("colspan", "3")
				e.children[0].textContent = "Meta Leaderboard"
			e.appendChild(document.createElement("td"))
				e.children[1].innerHTML = `<b class="outline" style="color: ${getColor(meta_rank)};">${meta_rank + 1}${getSuffix(meta_rank + 1)} place</b>`
			expect("table tbody").appendChild(e)
	})();
	// activity leaderboard
	(() => {
		var users = [...info.users]
		users.sort((a, b) => {
			var ascore = info.getActivityPoints(a)
			var bscore = info.getActivityPoints(b)
			if (ascore < bscore) {
				return -1;
			}
			if (ascore > bscore) {
				return 1;
			}
			// a must be equal to b
			return 0;
		})
		users.reverse()
		var active_rank = users.indexOf(this_user_obj)
		var e = document.createElement("tr")
			e.appendChild(document.createElement("td"))
				e.children[0].setAttribute("colspan", "3")
				e.children[0].textContent = "Activity Leaderboard"
			e.appendChild(document.createElement("td"))
				e.children[1].innerHTML = `<b class="outline" style="color: ${getColor(active_rank)};">${active_rank + 1}${getSuffix(active_rank + 1)} place</b>`
			expect("table tbody").appendChild(e)
	})();
	// Are we on our own profile page?
	if (info.profile != null && info.profile.name == this_user_obj.name) {
		// Yes we are!
		// Add buttons
		expect("#self").innerHTML = "<b>This is your profile page.</b> <a style='color: rgb(0, 0, 200);' href='/'>Sign Out</a> <a style='color: rgb(0, 0, 200);' href='javascript:void(changepwd());'>Change Password</a>"
		// Add "change description" button
		expect("#desc").insertAdjacentElement("afterbegin", document.createElement("div"))
		expect("#desc").children[0].appendChild(document.createElement("button"))
		expect("#desc").children[0].children[0].textContent = "edit"
		expect("#desc").children[0].children[0].setAttribute("onclick", "changedesc()")
		// Hint
		if (expect("table tbody").children.length <= 4) {
			expect("#hint").removeAttribute("style")
			expect("#submitscoresbtn").setAttribute("href", "/form/0" + location.search)
		}
		// Admin tools
		if (info.profile.admin) {
			expect("#self").innerHTML += ` <a style='color: rgb(0, 0, 200);' href='/admin.html${location.search}'>Admin Board</a>`
		}
	} else if (info.profile?.admin) {
		var switchbtn = expect("#self").appendChild(document.createElement("button"))
		switchbtn.innerText = "Switch User"
		switchbtn.addEventListener("click", () => {
			var newUser = location.pathname.split("/")[2]
			location.replace("/user_id_create/sudo?" + location.search.substring(1) + "&" + newUser)
		})
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
		x.send(location.search.substring(1) + "\n" + newPwd)
	}
}
function changedesc() {
	var desc = expect("#desc")
	desc.appendChild(document.createElement("div"))
	desc.children[2].appendChild(document.createElement("textarea"))
	desc.children[2].children[0].setAttribute("style", "width: 100%; height: 20vh;")
	expectInput(desc.children[2].children[0]).value = desc.children[1].textContent ?? "Error getting the previous profile text. Please reload the page, and maybe also contact the developers of SuperGames."
	desc.children[1].remove()
	desc.children[0].children[0].remove()
	desc.children[0].appendChild(document.createElement("button"))
	desc.children[0].children[0].textContent = "cancel"
	desc.children[0].children[0].setAttribute("onclick", "location.reload()")
	desc.children[0].appendChild(document.createElement("button"))
	desc.children[0].children[1].textContent = "submit"
	desc.children[0].children[1].setAttribute("onclick", "submitChangeDesc()")
}
function submitChangeDesc() {
	var t = expectInput(expect("#desc").children[1].children[0]).value
	var x = new XMLHttpRequest()
	x.open("POST", "/setting/desc")
	x.addEventListener("loadend", (e) => {
		location.reload()
	})
	x.send(location.search.substring(1) + "\n" + t)
}