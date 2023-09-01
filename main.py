from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import time
import json
import datetime
import traceback
from urllib.parse import unquote

vandalize = False

hostName = "0.0.0.0"
serverPort = 8080

def read_file(filename):
	f = open(filename, "r")
	t = f.read()
	f.close()
	return t

def bin_read_file(filename):
	f = open(filename, "rb")
	t = f.read()
	f.close()
	return t

def write_file(filename, content):
	f = open(filename, "w")
	f.write(content)
	f.close()

def multiply(s1, s2):
	i1 = list(s1.encode("UTF-8"))
	i2 = list(s2.encode("UTF-8"))
	f = [0, 0, 0, 0, 0]
	for startIndex in range(len(f)):
		xpos = startIndex + 0
		for i in range(len(i1)):
			f[xpos] += i1[i]
			xpos += 1
			if xpos >= len(f): xpos -= len(f)
	for startIndex in range(len(f)):
		xpos = startIndex + 0
		for i in range(len(i2)):
			f[xpos] += i2[i]
			xpos += 1
			if xpos >= len(f): xpos -= len(f)
	return (f[0] * 16) * (f[1] * 8) * (f[2] * 4) * (f[3] * 2) * (f[4] * 1)

def getUserFromID(id):
	ou = json.loads(read_file("users.json"))
	for n in ou:
		uid = multiply(n["name"], n["password"])
		if str(uid) == id:
			return n
	return None

def getPwdFromUser(name):
	ou = json.loads(read_file("users.json"))
	for n in ou:
		if name == n["name"]:
			return n["password"]
	return None

def getIDFromUser(name, pwd):
	ou = json.loads(read_file("users.json"))
	for n in ou:
		if name == n["name"] and pwd == n["password"]:
			return str(multiply(n["name"], n["password"]))
	return None

def get(path):
	if vandalize:
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": "<!DOCTYPE html><html><head></head><body>Hahaha! The website is gone!!!</body></html>"
		}
	user = getUserFromID(''.join(path.split("?")[1:]))
	if path == "/users.json":
		ou = json.loads(read_file("users.json"))
		for n in ou:
			del n["password"]
			del n["admin"]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "application.json"
			},
			"content": json.dumps(ou)
		}
	elif os.path.isfile("public_files" + path.split("?")[0]):
		return {
			"status": 200,
			"headers": {
				"Content-Type": {
					"html": "text/html",
					"json": "application/json",
					"css": "text/css",
					"ico": "image/x-icon",
					"otf": "application/x-font-opentype",
					"jpeg": "image/jpeg",
					"png": "image/png",
					"js": "application/javascript",
					"txt": "text/plain",
					"xml": "image/svg+xml"
				}[path.split("?")[0].split(".")[-1]]
			},
			"content": bin_read_file("public_files" + path.split("?")[0])
		}
	elif path.split("?")[0] == "/":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<!DOCTYPE html><html><head></head><body><script>location.replace('/home.html'+location.search);</script></body></html>"
		}
	elif path.startswith("/leaderboard/"):
		name = path.split("?")[0][13:]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("leaderboard.html").replace("{{NAME}}", name.replace("%20", " "))
		}
	elif path.startswith("/badges/"):
		name = path.split("?")[0].split("/")[2]
		rank = path.split("?")[0].split("/")[3]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("badge.html").replace("{{NAME}}", name.replace("%20", " ")).replace("{{RANK}}", rank).replace("{{SRANK}}", ["Novice", "Vassal", "Apprentice", "Prospect", "Artisan", "Expert", "Master", "Ultimate Master"][int(rank)]).replace("{{SNAME}}", name[0].upper() + name[1:].replace("%20", " "))
		}
	elif path.startswith("/profile/"):
		name = path.split("?")[0].split("/")[2]
		userlist = [x["name"] for x in json.loads(read_file("users.json"))]
		if name in userlist:
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": read_file("profile.html").replace("{{NAME}}", name.replace("%20", " "))
			}
		elif name.isdigit() and int(name) - 1 < len(userlist):
			name = userlist[int(name) - 1]
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": read_file("profile.html").replace("{{NAME}}", name.replace("%20", " "))
			}
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("profile.html").replace("{{NAME}}", name.replace("%20", " "))
		}
	elif path.startswith("/form/"):
		formid = path.split("?")[0].split("/")[2]
		formlist = [x["name"] for x in json.loads(read_file("public_files/forms.json"))]
		if formid.isdigit() and int(formid) < len(formlist):
			name = formlist[int(formid)]
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": read_file("form.html").replace("{{NAME}}", name).replace("{{FORMID}}", formid)
			}
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<script>location.replace('/form_list.html')</script>"
		}
	elif path == "/entryeditor":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("entryeditor.html")
		}
	elif path.split("?")[0] == "/usercheck":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "application/json"
			},
			"content": json.dumps([{"name": user["name"], "admin": user["admin"]}]) if user != None else "[]"
		}
	elif path.split("?")[0] == "/user_id_create":
		u = path.split("?")[1].split("&")[0]
		p = path.split("?")[1].split("&")[1]
		id = getIDFromUser(unquote(u), unquote(p))
		# print(repr(u), repr(p), repr(id))
		if id == None:
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": f"<script>location.replace('/login.html#invalid')</script>"
			}
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<script>location.replace('/?{id}')</script>"
		}
	elif path.split("?")[0] == "/user_id_create/sudo":
		u = path.split("?")[1].split("&")[0]
		p = path.split("?")[1].split("&")[1]
		user = getUserFromID(u)
		if user["admin"]:
			newID = getIDFromUser(p, getPwdFromUser(p))
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": f"<script>location.replace('/profile/{getUserFromID(newID)['name']}?{newID}')</script>"
			}
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<script>location.replace('/?{u}')</script>"
		}
	else: # 404 page
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f""
		}

def post(path, body):
	if path == "/addentry":
		update = "There was an error and no entries were updated."
		try:
			data = json.loads(read_file("public_files/data.json"))
			finished = False
			bodydata = body.decode("UTF-8").split("\n")
			eventname = bodydata[0]
			username = bodydata[1]
			score = bodydata[2]
			mode = bodydata[3]
			if eventname in data:
				for d in data[eventname]["entries"]:
					if d[0] == username:
						# Update existing entry
						update = f"Updated entry\n\tevent: {eventname}\n\tuser: {username}\n\told score: {d[1]}\n\tnew score: {score}\n\tmode: {mode}"
						if mode == "add": d[1] += float(score)
						elif mode == "replace": d[1] = float(score)
						else: d[1] = max(d[1], float(score))
						d[2] = datetime.datetime.now().isoformat()
						update += f"\n\tregistered score: {d[1]}"
						finished = True
				if not finished:
					# Create new entry
					update = f"Created entry\n\tevent: {eventname}\n\tuser: {username}\n\tnew score: {score}"
					data[eventname]["entries"].append([username, float(score), datetime.datetime.now().isoformat()])
			else:
				update += f"\n\nERROR: Unknown event: {eventname}\nRequest data:\n\tuser: {username}\n\tscore: {score}\n\tmode: {mode}"
			write_file("public_files/data.json", json.dumps(data, indent='\t'))
		except Exception as e:
			update += "\nError was:\n\n"
			update += ''.join(traceback.format_exception(type(e), e, e.__traceback__))
		print(update)
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/plain"
			},
			"content": update
		}
	elif path == "/add_application":
		bodydata = body.decode("UTF-8").split("\n")
		c = read_file("public_files/applications.txt")
		c = f"""\n==========\nUsername: {bodydata[0]}\nEmail address: {bodydata[1]}\n==========\n\n\n{c}"""
		write_file("public_files/applications.txt", c)
		return {
			"status": 301,
			"headers": {},
			"content": f""
		}
	elif path == "/createuser":
		bodydata = body.decode("UTF-8").split("\n")
		# Update user list
		c = read_file("public_files/users.json")
		now = datetime.datetime.now()
		date = f"{now.year}-{str(now.month).rjust(2, '0')}-{str(now.day).rjust(2, '0')}"
		c = c[:-2] + f''',
	{{
		"name": {bodydata[0]},
		"date": {date},
		"email": {bodydata[1]},
		"password": {bodydata[0]},
		"admin": false
	}}
]'''
		write_file("public_files/users.json", c)
		# Update applications
		c = read_file("public_files/applications.txt")
		c = c.replace(f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}", f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}\n[Accepted]")
		write_file("public_files/applications.txt", c)
		# Finish
		return {
			"status": 301,
			"headers": {},
			"content": f""
		}
	elif path == "/rejectprofile":
		bodydata = body.decode("UTF-8").split("\n")
		# Update applications
		c = read_file("public_files/applications.txt")
		c = c.replace(f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}", f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}\n[Rejected]")
		write_file("public_files/applications.txt", c)
		# Finish
		return {
			"status": 301,
			"headers": {},
			"content": f""
		}
	elif path == "/setting/pwd":
		bodydata = body.decode("UTF-8").split("\n")
		ou = json.loads(read_file("users.json"))
		for n in ou:
			if str(multiply(n["name"], n["password"])) == bodydata[0]:
				n["password"] = bodydata[1]
		write_file("users.json", json.dumps(ou, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": f""
		}
	elif path == "/setting/desc":
		bodydata = body.decode("UTF-8").split("\n")
		ou = json.loads(read_file("users.json"))
		for n in ou:
			if str(multiply(n["name"], n["password"])) == bodydata[0]:
				n["desc"] = '\n'.join(bodydata[1:])
		write_file("users.json", json.dumps(ou, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": f""
		}
	elif path == "/submit_form":
		bodydata = json.loads(body.decode("UTF-8"))
		forms = json.loads(read_file("public_files/forms.json"))
		forms[bodydata["id"]]["responses"].append({
			"user": getUserFromID(bodydata["user"])["name"],
			"results": bodydata["results"]
		})
		write_file("public_files/forms.json", json.dumps(forms, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": f""
		}
	elif path == "/delete_submission":
		bodydata = body.decode("UTF-8").split("\n")
		if getUserFromID(bodydata[0])["admin"] == False: return {
			"status": 404,
			"headers": {},
			"content": f""
		}
		forms = json.loads(read_file("public_files/forms.json"))
		del forms[int(bodydata[1])]["responses"][int(bodydata[2])]
		write_file("public_files/forms.json", json.dumps(forms, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": f""
		}
	else:
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f""
		}

class MyServer(BaseHTTPRequestHandler):
	def do_GET(self):
		global running
		res = get(self.path)
		self.send_response(res["status"])
		for h in res["headers"]:
			self.send_header(h, res["headers"][h])
		self.end_headers()
		c = res["content"]
		if type(c) == str: c = c.encode("utf-8")
		self.wfile.write(c)
	def do_POST(self):
		res = post(self.path, self.rfile.read(int(self.headers["Content-Length"])))
		self.send_response(res["status"])
		for h in res["headers"]:
			self.send_header(h, res["headers"][h])
		self.end_headers()
		self.wfile.write(res["content"].encode("utf-8"))
	def log_message(self, format: str, *args) -> None:
		return;
		if 400 <= int(args[1]) < 500:
			# Errored request!
			print(u"\u001b[31m", end="")
		print(args[0].split(" ")[0], "request to", args[0].split(" ")[1], "(status code:", args[1] + ")")
		print(u"\u001b[0m", end="")
		# don't output requests

if __name__ == "__main__":
	running = True
	webServer = HTTPServer((hostName, serverPort), MyServer)
	webServer.timeout = 1
	print("Server started http://%s:%s" % (hostName, serverPort))
	while running:
		try:
			webServer.handle_request()
		except KeyboardInterrupt:
			running = False
	webServer.server_close()
	print("Server stopped")
