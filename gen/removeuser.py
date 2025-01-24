import json

oldname = input("Enter the old name >")

f = open("../users.json", "r")
d = json.loads(f.read())
f.close()

for e in d:
	if e["name"] == oldname:
		d.remove(e)
		print("Removed from user list")

f = open("../users.json", "w")
f.write(json.dumps(d, indent='\t'))
f.close()

f = open("../public_files/data.json", "r")
d = json.loads(f.read())
f.close()

for eventname in d.keys():
	entries = d[eventname]["entries"]
	for itemno in range(len(entries)):
		if entries[itemno][0] == oldname:
			print("Removed entry for event: " + eventname + " with data: " + str(entries[itemno]))
			entries.remove(entries[itemno])
			break

f = open("../public_files/data.json", "w")
f.write(json.dumps(d, indent='\t'))
f.close()