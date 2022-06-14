FROM alpine

LABEL com.lightproxy.image.authors="mork.andrey.s.dev@gmail.com"

EXPOSE 8888

ARG path_to_users

RUN mkdir -p /home/tinyproxy

COPY $path_to_users /home/tinyproxy/users.txt

RUN set -xe \
    && apk add --no-cache tinyproxy \
    && sed -i -e 's/^/BasicAuth /' /home/tinyproxy/users.txt \
    && sed -i -e '/^Allow /s/^/#/' \
              -e '/^ConnectPort /s/^/#/' \
              -e '/^#BasicAuth /r users.txt' \
              /etc/tinyproxy/tinyproxy.conf

CMD ["tinyproxy", "-d"]
