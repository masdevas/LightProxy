To build image:

docker build -t lightproxy-server-tinyproxy .

To download image:

docker pull masdevas/lightproxy-server-tinyproxy

To start container:

Please create /home/lightproxy-server directory on your host. Put config.json and users.json files there - examples of these files you can obtain in parent directory of this folder in the repo.

docker-compose -f \<path_to_compose_yaml\> up

Example of yaml file you can find in this directory.