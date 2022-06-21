FROM alpine

LABEL com.lightproxy.image.authors="mork.andrey.s.dev@gmail.com"

RUN set -xe \
    && apk add --no-cache tinyproxy python3 \
    && mkdir -p /home/lightproxy-server-scripts

COPY configure.py /home/lightproxy-server-scripts
COPY runner.sh /home/lightproxy-server-scripts

ENTRYPOINT ["sh", "/home/lightproxy-server-scripts/runner.sh"]
