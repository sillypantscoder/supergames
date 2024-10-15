/** @type {string} */
var leaderboardName = expect("script[data-leaderboard]").dataset.leaderboard ?? "[Invalid]"

sgtabs.extra(2, `Leaderboard for ${leaderboardName}`);
getData().then((info) => { try {
	sgtabs.userfix(info);
	// Admin buttons header
	if (info.profile != null && info.profile.admin) {
		var th = document.createElement("th")
		th.innerText = "Admin Buttons"
		expect("table").children[0].children[0].appendChild(th)
	}
	var leaderboard = info.getLeaderboard(leaderboardName)
	// Get description
	var leaderboard_desc = leaderboard.description
	expect("#desc").innerText = `${leaderboard_desc}`
	// Specialty leaderboard (does not have badges)
	if (leaderboard.badges == null) {
		expect("#badge_head").remove()
	}
	// Time leaderboard
	if (leaderboard.isTime) expect("#score_head").innerText = "Time"
	// Find ranks
	var ranks = leaderboard.getRanked()
	var i = 0;
	for (; i < ranks.length; i++) {
		// Create element
		var e = document.createElement("tr")
		// @ts-ignore
		e._EntryTime = ranks[i].entry.date
		// 1st column: Place value
		e.appendChild(document.createElement("td"))
			e.children[0].appendChild(document.createElement("span"))
				e.children[0].children[0].classList.add("outline")
				e.children[0].children[0].setAttribute("style", `color: ${getColor(i)}; opacity: 0.7;${i >= 3 ? " font-size: 0.8em;" : ""}`)
				e.children[0].children[0].innerHTML = String(i + 1) + getSuffix(i + 1)
		// // Progress bar: Distance to next place value
		// if (i > 0) {
		// 	if (! info.data[leaderboardName].reverseOrder) {
		// 		var bar = document.createElement("a")
		// 		bar.classList.add("bar")
		// 		bar.innerText = String(i) + getSuffix(i)
		// 		var nextValue = info.getScore(ranks[i - 1], leaderboardName)
		// 		var thisValue = info.getScore(ranks[i], leaderboardName)
		// 		var prevValue = info.getScore(ranks[i + 1], leaderboardName)
		// 		if (prevValue == undefined) prevValue = 0
		// 		bar.setAttribute("style", `--amount: ${(thisValue - prevValue) / (nextValue - prevValue)}; background: ${getColor(i - 1)};`);
		// 		// bar.innerText += `, ${prevValue}, ${thisValue}, 	${nextValue}`
		// 		e.children[0].appendChild(bar)
		// 	} else if (i != ranks.length - 1) {
		// 		var bar = document.createElement("a")
		// 		bar.classList.add("bar")
		// 		bar.innerText = String(i) + getSuffix(i)
		// 		var nextValue = -info.getScore(ranks[i - 1], leaderboardName)
		// 		var thisValue = -info.getScore(ranks[i], leaderboardName)
		// 		var prevValue = -info.getScore(ranks[i + 1], leaderboardName)
		// 		if (prevValue == undefined) prevValue = 0
		// 		bar.setAttribute("style", `--amount: ${(thisValue - prevValue) / (nextValue - prevValue)}; background: ${getColor(i - 1)};`);
		// 		// bar.innerText += `, ${prevValue}, ${thisValue}, 	${nextValue}`
		// 		e.children[0].appendChild(bar)
		// 	}
		// }
		// 2nd column: User name
		e.appendChild(document.createElement("td"))
			e.children[1].appendChild(document.createElement("a"))
				e.children[1].children[0].setAttribute("href", "/profile/" + ranks[i].entry.user.name)
				e.children[1].children[0].setAttribute("style", "color: rgb(0, 0, 200);")
				e.children[1].children[0].textContent = ranks[i].entry.user.name
		// 3rd column: Score
		e.appendChild(document.createElement("td"))
			e.children[2].classList.add("outline")
			e.children[2].setAttribute("style", `color: ${getColor(i)}; opacity: 0.7;${i >= 3 ? " font-size: 0.8em;" : ""}`)
			var score = ranks[i].entry.score
			if (leaderboard.isTime) {
				e.children[2].textContent = formatTime(score)
			} else {
				e.children[2].textContent = addCommas(score.toString())
			}
		// 4th column: Badges
		if (leaderboard.badges != null) {
			e.appendChild(document.createElement("td"))
			// Badges
			var badgeno = leaderboard.getNumberOfBadges(ranks[i].entry.score)
			for (var x = 0; x < badgeno; x++) {
				e.children[3].innerHTML += `<a href="/badges/{{NAME}}/${x}${location.search}"><div class="badge badge-${['bronze', 'bronze', 'bronze', 'silver', 'silver', 'gold', 'gold', 'platinum'][x]}">${'NVAPREMU'[x]}</div></a>`
			}
			// // Progress bar: Distance to next badge
			// if (badgeno < 8) {
			// 	var bar = document.createElement("a")
			// 	bar.setAttribute("href", `/badges/{{NAME}}/${badgeno}${location.search}`)
			// 	bar.classList.add("bar")
			// 	bar.innerText = ["Novice", "Vassal", "Apprentice", "Prospect", "Artisan", "Expert", "Master", "Ultimate Master"][badgeno]
			// 	var nextValue = info.data[leaderboardName].badges[badgeno]
			// 	var prevValue = [0, ...info.data[leaderboardName].badges][badgeno]
			// 	bar.setAttribute("style", `--amount: ${(score - prevValue) / (nextValue - prevValue)};`);
			// 	e.children[3].appendChild(bar)
			// }
		}
		// // 5th column: Description
		var newE = document.createElement("td")
		newE.innerText = ranks[i].entry.note
		e.appendChild(newE)
		// 6th column (if needed): Admin buttons
		if (info.profile != null && info.profile.admin) {
			var admin = document.createElement("td")
			admin.innerHTML = `<button>Remove entry</button>`;
			((name) => admin.children[0].addEventListener("click", () => {
				// funny thing: alert(name)
				var x = new XMLHttpRequest()
				x.open("POST", "/remove_entry")
				x.addEventListener("loadend", () => location.reload())
				x.send(location.search.substring(1) + "\n{{NAME}}\n" + name)
			}))(ranks[i]);
			e.appendChild(admin)
		}
		// Add the row to the table
		expect("table tbody").appendChild(e)
	}
	if (leaderboard.badges != null) {
		var badge_container = expect("#badges") // NVAPREMU
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/0${location.search}" class="physics"><div class="badge badge-bronze">N</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/1${location.search}" class="physics"><div class="badge badge-bronze">V</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/2${location.search}" class="physics"><div class="badge badge-bronze">A</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/3${location.search}" class="physics"><div class="badge badge-silver">P</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/4${location.search}" class="physics"><div class="badge badge-silver">R</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/5${location.search}" class="physics"><div class="badge badge-gold">E</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/6${location.search}" class="physics"><div class="badge badge-gold">M</div></a>`
		badge_container.innerHTML += `<a href="/badges/{{NAME}}/7${location.search}" class="physics"><div class="badge badge-platinum">U</div></a>`
	} else {
		document.querySelectorAll("#badges, :has( + #badges)").forEach((e) => e.remove())
	}
	expect("#e").setAttribute("max", i.toString())
}catch(e){alert(e)}
})
/**
 * @param {number} days
 */
function filter(days) {
	var rows = [...document.querySelectorAll("table tbody tr:not(:first-child)")]
	var targetDate = new Date()
	targetDate.setDate(targetDate.getDate() - days)
	for (var i = 0; i < rows.length; i++) {
		// @ts-ignore
		if (rows[i]._EntryTime.getTime() < targetDate.getTime()) {
			rows[i].setAttribute("style", `display: none;`)
		} else rows[i].removeAttribute("style")
	}
}