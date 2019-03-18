import subprocess
results = subprocess.check_output(["netsh", "wlan", "show", "network"])


results = results.decode("ascii") # needed in python 3
results = results.replace("\r","")
ls = results.split("\n")


ls = ls[4:]
ssids = []
x = 0
while x < len(ls):
    if x % 5 == 0:
        if(ls[x] != ''):
            str = ls[x].split(":")
            str[1] = str[1].replace("\r","")
            print(str[1])
            ssids.append(ls[x])
    x += 1
