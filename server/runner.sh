set -xe \
	&& echo '# LightProxy has just started.' \
	&& sed -i -e '/^#BasicAuth /r /home/tinyproxy/users.txt' \
		/etc/tinyproxy/tinyproxy.conf \
	&& tinyproxy -d
