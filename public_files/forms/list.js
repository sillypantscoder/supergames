sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	if (info.profile == null) {
		location.replace("/login.html")
		return;
	}
	// Request form list
	var x = new XMLHttpRequest()
	x.open("GET", "/forms.json" + location.search)
	x.addEventListener("loadend", () => {
		var forms = JSON.parse(x.responseText)
		expect("#buttons").innerText = ""
		for (var i = 0; i < forms.length; i++) {
			var e = document.createElement("a")
			e.appendChild(document.createElement("span"))
			e.children[0].textContent = forms[i].name
			e.href = `./${i}${location.search}`
			if (info.profile != null && info.profile.admin) {
				var n_responses = forms[i].responses.length
				if (n_responses > 0) {
					var s = document.createElement("span")
					s.classList.add("responses")
					s.innerText = n_responses
					e.appendChild(s)
				}
			}
			expect("#buttons").appendChild(e)
		}
	})
	x.send()
})