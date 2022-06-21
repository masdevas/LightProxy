To build container:

docker build -t lightproxy-server-tinyproxy .

To start container:

docker create --name clp -p3001:8888 lightproxy-server-tinyproxy

docker cp users.txt clp:/home/tinyproxy

docker start -a -i clp
