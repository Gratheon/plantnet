sudo -H -u www bash -c 'cd /www/plantnet/ && npm i' 
cd /www/plantnet/
COMPOSE_PROJECT_NAME=gratheon docker-compose down
COMPOSE_PROJECT_NAME=gratheon docker-compose up --build -d