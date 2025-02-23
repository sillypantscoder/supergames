import json

f = open("gen/badges.tsv", "r")
d = [x.split("\t") for x in f.read().split("\n")[1:]]
f.close()

f = open("public_files/data.json", "r")
data = json.loads(f.read())
f.close()

newData = {}
newentries: list[str] = []
for line in d:
	if line[0] == "DONTREGISTER": continue
	newentries.append(line[0])
	newData[line[0]] = {
		"game": line[-1],
		"badges": [float(x) for x in line[1:-5]] if line[1] != '' else [],
		"badge_desc": line[-6],
		"leaderboard_desc": line[-5],
		"entries": [],
		"isTime": line[-3] == "Time",
		"reverseOrder": line[-4] == "Lowest"
	}

not_tsv_deleted: list[str] = []
not_tsv_notdeleted: list[str] = []
for name in data:
	if name not in newData.keys():
		print(f"Warning: Not in the TSV file: \u001b[33m{name}\u001b[0m")
		nEntries = len(data[name]['entries'])
		if nEntries == 0:
			print("\tThere are no entries.")
		else:
			print(f"\tThere are \u001b[33m{nEntries} entries\u001b[0m; users are:", *[f"{x[0]}({x[1]})" for x in data[name]['entries']])
		i = input("\tDelete this leaderboard? [y/N]:")
		if i != "y":
			newData[name] = data[name]
			not_tsv_notdeleted.append(name)
		else:
			print("Leaderboard was deleted")
			not_tsv_deleted.append(name)
	else:
		newData[name]["entries"] = data[name]["entries"]
		newentries.remove(name)

print("New leaderboards:")
for x in newentries: print("\t" + x)

print("Not in the TSV file, not deleted:")
for x in not_tsv_notdeleted: print("\t" + x)

print("Not in the TSV file, deleted:")
for x in not_tsv_deleted: print("\t" + x)

f = open("public_files/data.json", "w")
f.write(json.dumps(newData, indent='\t'))
f.close()
