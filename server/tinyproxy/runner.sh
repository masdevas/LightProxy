set -xe
python3 /home/lightproxy-server-scripts/configure.py
cat -n /etc/tinyproxy/tinyproxy.conf
tinyproxy -d
