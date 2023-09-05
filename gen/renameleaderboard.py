import json

oldname = input("Enter the old name:")
newname = input("Enter the new name:")

f = open("public_files/data.json", "r")
data = json.loads(f.read())
f.close()

data[newname] = data[oldname]
del data[oldname]

f = open("public_files/data.json", "w")
f.write(json.dumps(data, indent='\t'))
f.close()