import subprocess
import time
import sys

f = open("watcher.txt", "a")
f.write("\n\n\n\n\n\n\n\n")
f.flush()
f.close()

if len(sys.argv) >= 2:
	codespace = sys.argv[1]
	def printf(*data: object, end: str = "\n"):
		f = open("watcher.txt", "a")
		f.write(" ".join([str(x) for x in data]))
		f.write(end)
		f.flush()
		f.close()
else:
	codespace = input("Enter the codespace name\n")
	def printf(*data: object, end: str = "\n"):
		print(*data, end=end)

def start_server():
	global server
	try:
		server.send_signal(2)
		server.wait()
	except NameError: pass
	server = subprocess.Popen(["python3", "main.py"])
	time.sleep(1)
	subprocess.run(["gh", "codespace", "ports", "visibility", "12344:public", "--codespace", codespace])
	return server

server = start_server()

while True:
	p = subprocess.Popen(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", f"https://{codespace}-12344.app.github.dev/home.html"], stdout=subprocess.PIPE)
	time.sleep(1)
	if p.poll() == None or server.poll() != None:
		p.kill()
		printf("\nServer is not responding!")
		server.send_signal(2)
		server.wait()
		printf("Killed the server!")
		time.sleep(3)
		start_server()
		printf("Restarted the server.")
	elif p.stdout == None:
		printf("DANGER! Process is not reporting standard out!")
	else:
		out = int(p.stdout.read().decode("UTF-8"))
		if out == 200:
			printf(f"[fine 200]", end="")
		else:
			printf(f"\npossible problem! status code: {out}")
		sys.stdout.flush()
