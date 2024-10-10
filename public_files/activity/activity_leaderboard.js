sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	var users = [...info.users]
	/** @type {Map<User, number>} */
	var user_data = new Map()
	for (var i = 0; i < users.length; i++) {
		var user = users[i]
		user_data.set(user, info.getActivityPoints(user))
	}
	users.sort((a, b) => {
		var ascore = user_data.get(a)
		if (ascore == undefined) throw new Error("The user does not have a score (somehow)")
		var bscore = user_data.get(b)
		if (bscore == undefined) throw new Error("The user does not have a score (somehow)")
		// compare
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
	for (var i = 0; i < users.length; i++) {
		var user = users[i]
		var firsts = user_data.get(user)
		if (firsts == undefined) throw new Error("The user does not have a score (somehow)")
		// Ties
		var duplicates = []
		for (var n = 0; n < users.length; n++) {
			var otherData = user_data.get(users[n])
			if (otherData == undefined) throw new Error("The user does not have a score (somehow)")
			if (otherData == firsts) duplicates.push(users[n])
		}
		var pcscore = i + 0
		for (var n = i - 1; n >= 0; n--) {
			if (duplicates.includes(users[n])) {
				pcscore -= 1
			}
		}
		// Create the element
		var e = document.createElement("tr")
		e.appendChild(document.createElement("td"))
			e.children[0].classList.add("outline")
			e.children[0].setAttribute("style", `color: ${getColor(pcscore)};`)
			e.children[0].innerHTML = String(pcscore + 1) + getSuffix(pcscore + 1)
		e.appendChild(document.createElement("td"))
			e.children[1].setAttribute("style", "text-align: right;")
			e.children[1].appendChild(document.createElement("a"))
				e.children[1].children[0].setAttribute("href", "/profile/" + user.name + location.search)
				e.children[1].children[0].setAttribute("style", "color: rgb(0, 0, 200);")
				e.children[1].children[0].textContent = user.name
		e.appendChild(document.createElement("td"))
			e.children[2].setAttribute("class", "outline")
			e.children[2].setAttribute("style", `color: ${getColor(pcscore)};`)
			e.children[2].innerHTML = addCommas(firsts.toString())
		expect("#athl tbody").appendChild(e)
	}
	expect("#e").setAttribute("max", i.toString())
})