To build container:
docker build -t lightproxy:0.1 .

To start container:
docker create --name clp -p3001:8888 lightproxy:0.1
docker cp users.txt clp:/home/tinyproxy
docker start -a -i clp
