start:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.dev.yml up -d --build
stop:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.dev.yml down
run:
	ENV_ID=dev npm run dev

deploy-clean:
	ssh root@gratheon.com 'rm -rf /www/plantnet/app/*;'

deploy-copy:
	scp -r package.json package-lock.json Dockerfile .version docker-compose.yml restart.sh root@gratheon.com:/www/plantnet/
	rsync -av -e ssh --exclude='node_modules' --exclude='.git'  --exclude='.idea' ./ root@gratheon.com:/www/plantnet/

deploy-run:
	ssh root@gratheon.com 'chmod +x /www/plantnet/restart.sh'
	ssh root@gratheon.com 'bash /www/plantnet/restart.sh'

deploy:
	git rev-parse --short HEAD > .version
	# make deploy-clean
	make deploy-copy
	make deploy-run

.PHONY: deploy
