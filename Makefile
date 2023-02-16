
shell:
	docker compose exec app /bin/sh

start:
	docker compose up -d

stop:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

buildup:
	docker compose up -d --build

cleanv:
	docker compose down -v
