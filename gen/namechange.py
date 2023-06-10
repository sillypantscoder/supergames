import json

oldname = input("Enter the old name >")
newname = input("Enter the new name >")

f = open("../public_files/users.json", "r")
d = json.loads(f.read())
f.close()

for e in d:
	if e["name"] == oldname:
		e["name"] = newname
		print("Changed username")

f = open("../public_files/users.json", "w")
f.write(json.dumps(d, indent='\t'))
f.close()

f = open("../public_files/data.json", "r")
d = json.loads(f.read())
f.close()

for eventname in d.keys():
	entries = d[eventname]["entries"]
	for itemno in range(len(entries)):
		if entries[itemno][0] == oldname:
			entries[itemno][0] = newname
			print("Changed entry for event: " + eventname + " item: " + str(itemno))

f = open("../public_files/data.json", "w")
f.write(json.dumps(d, indent='\t'))
f.close()