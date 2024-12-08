start:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.dev.yml up plantnet --build
stop:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.dev.yml down
run:
	ENV_ID=dev npm run dev