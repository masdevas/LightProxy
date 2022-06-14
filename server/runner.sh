set -xe \
	&& sed -i -e '/^#BasicAuth /r /home/tinyproxy/users.txt' \
		/etc/tinyproxy/tinyproxy.conf \
	&& tinyproxy -d
