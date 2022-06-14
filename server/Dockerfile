FROM alpine

LABEL com.lightproxy.image.authors="mork.andrey.s.dev@gmail.com"

EXPOSE 8888

RUN set -xe \
    && mkdir -p /home/tinyproxy

COPY ./runner.sh /home/tinyproxy

RUN set -xe \
    && apk add --no-cache tinyproxy \
    && sed -i -e '/^Allow /s/^/#/' \
              -e '/^ConnectPort /s/^/#/' \
              /etc/tinyproxy/tinyproxy.conf

ENTRYPOINT ["sh", "/home/tinyproxy/runner.sh"]
