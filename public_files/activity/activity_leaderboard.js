sgtabs();

getData().then((info) => {
	sgtabs.userfix(info);
	var leaderboard = new ActivityLeaderboard(info);
	var ranked = leaderboard.getRanked();
	for (var i = 0; i < info.users.length; i++) {
		var entry = ranked[i]
		// Create the element
		var e = leaderboard.createTableRow(i + 1, entry)
		expect("#athl tbody").appendChild(e)
	}
	expect("#e").setAttribute("max", i.toString())
})
