from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import time
import json
import datetime

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

def get(path):
	if vandalize:
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": "<!DOCTYPE html><html><head></head><body>Hahaha! The website is gone!!!</body></html>"
		}
	if os.path.isfile("public_files" + path.split("?")[0]):
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
					"txt": "text/plain"
				}[path.split("?")[0].split(".")[-1]]
			},
			"content": bin_read_file("public_files" + path.split("?")[0])
		}
	elif path == "/":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<!DOCTYPE html><html><head></head><body><script>location.replace('/home.html');</script></body></html>"
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
		userlist = [x["name"] for x in json.loads(read_file("public_files/users.json"))]
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
	elif path == "/entryeditor":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("entryeditor.html")
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
		data = json.loads(read_file("public_files/data.json"))
		finished = False
		bodydata = body.decode("UTF-8").split("\n")
		eventname = bodydata[0]
		username = bodydata[1]
		score = bodydata[2]
		mode = bodydata[3]
		if eventname in data:
			for d in data[eventname]:
				if d[0] == username:
					# Update existing entry
					print(f"Updated entry for event: {eventname} user: {username} old score: {d[1]} new score: {score} mode: {mode}")
					if mode == "add": d[1] += float(score)
					else: d[1] = max(d[1], float(score))
					finished = True
			if not finished:
				# Create new entry
				print(f"Creating entry for event: {eventname} user: {username} new score: {score}")
				data[eventname].append([username, float(score)])
		else:
			print(f"ERROR: Unknown event: {eventname} (user = {username}; score = {score})")
		write_file("public_files/data.json", json.dumps(data, indent='\t'))
		return {
			"status": 301,
			"headers": {},
			"content": f""
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
		c = c[:-2] + ',\n\t{\n\t\t"name": "' + bodydata[0] + '",\n\t\t"date": "' + date + '",\n\t\t"email": "' + bodydata[1] + '"\n\t}\n]'
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
