/**
 * @template {any} T
 */
class SpecialLeaderboard {
	/**
	 * @param {SGData} info
	 */
	constructor(info) {
		this.info = info
	}
	/**
	 * @param {User} a
	 * @param {User} b
	 * @returns {number}
	 */
	compareUsers(a, b) {
		return this.compareScores(this.getScore(a), this.getScore(b))
	}
	/**
	 * @param {T} a
	 * @param {T} b
	 * @returns {number}
	 */
	compareScores(a, b) {
		return 1
	}
	/**
	 * @param {User} user
	 * @returns {T}
	 */
	getScore(user) {
		throw new Error("cannot get score of base special leaderboard")
	}
	/**
	 * Get a list of all the entries in the leaderboard, sorted from best to worst.
	 * The entries have some extra data indicating their place value.
	 */
	getRanked() {
		/** @type {{ user: User, score: T }[]} */
		var data = []
		for (var i = 0; i < this.info.users.length; i++) {
			var user = this.info.users[i]
			// Get score
			var score = this.getScore(user)
			data.push({ user, score })
		}
		data.reverse()
		data.sort((a, b) => this.compareScores(a.score, b.score))
		return data
	}
	/**
	 * @param {User} user
	 */
	getRankForUser(user) {
		var ranked = this.getRanked()
		var index = ranked.findIndex((v) => v.user == user)
		return index
	}
}

/** @extends {SpecialLeaderboard<number[]>} */
class BadgeLeaderboard extends SpecialLeaderboard {
	/**
	 * @param {number[]} a
	 * @param {number[]} b
	 */
	compareScores(a, b) {
		if (a[3] > b[3]) return -1;
		if (a[3] < b[3]) return 1;
		if (a[2] > b[2]) return -1;
		if (a[2] < b[2]) return 1;
		if (a[1] > b[1]) return -1;
		if (a[1] < b[1]) return 1;
		if (a[0] > b[0]) return -1;
		if (a[0] < b[0]) return 1;
		return 0;
	}
	/**
	 * @param {User} user
	 */
	getScore(user) {
		return this.info.getNumberOfBadgesInEachCategory(user)
	}
}
/** @extends {SpecialLeaderboard<number>} */
class MetaLeaderboard extends SpecialLeaderboard {
	/**
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	compareScores(a, b) {
		return a - b
	}
	/**
	 * @param {User} user
	 */
	getScore(user) {
		var points = 0
		// go through all the leaderboards
		for (var n = 0; n < this.info.leaderboards.length; n++) {
			var leaderboard = this.info.leaderboards[n]
			// find this user's rank
			var ranks = leaderboard.getRanked()
			var rank = ranks.findIndex((v) => v.entry.user == user)
			// assign points
			if (rank == -1) points += this.info.users.length
			else points += n + 1
		}
		return points
	}
}
/** @extends {SpecialLeaderboard<number>} */
class ActivityLeaderboard extends SpecialLeaderboard {
	/**
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	compareScores(a, b) {
		return a - b
	}
	/**
	 * @param {User} user
	 */
	getScore(user) {
		var totalScore = 0
		for (var n = 0; n < this.info.leaderboards.length; n++) {
			// get leaderboard
			var leaderboard = this.info.leaderboards[n]
			// get score
			var score = leaderboard.getEntryForUser(user)?.score
			if (score == undefined) continue;
			// find vassal amount
			var vassal = leaderboard.badges?.values[1]
			if (vassal == undefined) continue;
			// add to total score
			totalScore += Math.round(score / (vassal / 25))
		}
		return totalScore
	}
	getRanked() {
		var r = super.getRanked()
		r.reverse()
		return r
	}
	/**
	 * @param {User} user
	 */
	getRankForUser(user) {
		return super.getRankForUser(user) + 1
	}
}