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
		"badges": [int(x) for x in line[1:-5]] if line[1] != '' else [],
		"badge_desc": line[-5],
		"leaderboard_desc": line[-4],
		"entries": [],
		"isTime": line[-2] == "Time",
		"reverseOrder": line[-3] == "Lowest"
	}

for name in data:
	if name not in newData.keys():
		print(f"Warning: Not in the TSV file: \u001b[33m{name}\u001b[0m")
		print(f"\tThere are \u001b[33m{len(data[name]['entries'])} entries\u001b[0m; users are:", *[f"{x[0]}({x[1]})" for x in data[name]['entries']])
		i = input("\tDelete this leaderboard? [y/N]:")
		if i != "y":
			newData[name] = data[name]
		else:
			print("Leaderboard was deleted")
	else:
		newData[name]["entries"] = data[name]["entries"]
		newentries.remove(name)

print("New leaderboards:")
for x in newentries: print("\t" + x)

f = open("public_files/data.json", "w")
f.write(json.dumps(newData, indent='\t'))
f.close()
