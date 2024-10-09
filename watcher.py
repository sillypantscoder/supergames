import subprocess
import time
import sys

url = input("Enter the url\n")
server = subprocess.Popen(["python3", "main.py"])

while True:
	p = subprocess.Popen(["curl", url], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	time.sleep(1)
	if p.poll() == None:
		p.kill()
		print("\nServer is not responding!")
		server.kill()
		print("Killed the server!")
		time.sleep(3)
		server = subprocess.Popen(["python3", "main.py"])
		print("Restarted the server.")
	else:
		print("fine...", end="")
		sys.stdout.flush()
