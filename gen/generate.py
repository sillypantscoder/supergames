import json

f = open("gen/badges.csv", "r")
d = [x.split(",") for x in f.read().split("\n")[1:]]
f.close()

f = open("public_files/data.json", "r")
data = json.loads(f.read())
f.close()

newData = {}
newentries = []
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
		print(f"Warning: {name} is not in the CSV file!")
		i = input(f"\tThere are {len(data[name]['entries'])} entries, delete this leaderboard? [y/N]:")
		if i != "yes": newData[name] = data[name]
	else:
		newData[name]["entries"] = data[name]["entries"]
		newentries.remove(name)

print("New leaderboards:")
for x in newentries: print("\t" + x)

f = open("public_files/data.json", "w")
f.write(json.dumps(newData, indent='\t'))
f.close()
