import json

f = open("public_files/data.json", "r")
data = json.loads(f.read())
f.close()

# Max number of entries

maxnames = []
maxamt = 0

entries = {
	n: len(data[n]["entries"])
	for n in data.keys()
}
for name in entries.keys():
	value = entries[name]
	if value > maxamt:
		maxamt = value
		maxnames = []
	if value == maxamt:
		maxnames.append(name)

print(f"Maximum number of entries in a leaderboard ({maxamt}): {', '.join(maxnames)}")

# Max number of non-1sts

users = {}
for key in data.keys():
	for entry in data[key]["entries"][1:]:
		name = entry[0]
		if name not in users.keys(): users[name] = 0
		users[name] += 1

maxnames = []
maxamt = 0

for name in users.keys():
	value = users[name]
	if value > maxamt:
		maxamt = value
		maxnames = []
	if value == maxamt:
		maxnames.append(name)

print(f"Maximum number of non-1st entries for a profile ({maxamt}): {', '.join(maxnames)}")

# Max number of entries in a reversed leaderboard

maxnames = []
maxamt = 0

entries = {
	n: len(data[n]["entries"])
	for n in data.keys()
	if data[n]["reverseOrder"] == True
}
for name in entries.keys():
	value = entries[name]
	if value > maxamt:
		maxamt = value
		maxnames = []
	if value == maxamt:
		maxnames.append(name)

print(f"Maximum number of entries in a reversed leaderboard ({maxamt}): {', '.join(maxnames)}")