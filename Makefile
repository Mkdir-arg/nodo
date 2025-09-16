.PHONY: help build up down restart logs clean test migrate superuser

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Construir imágenes
	docker-compose build

up: ## Levantar servicios en desarrollo
	docker-compose up -d

up-prod: ## Levantar servicios en producción
	docker-compose -f docker-compose.prod.yml up -d

down: ## Bajar servicios
	docker-compose down

down-prod: ## Bajar servicios de producción
	docker-compose -f docker-compose.prod.yml down

restart: ## Reiniciar servicios
	docker-compose restart

logs: ## Ver logs
	docker-compose logs -f

logs-backend: ## Ver logs del backend
	docker-compose logs -f backend

logs-frontend: ## Ver logs del frontend
	docker-compose logs -f frontend

clean: ## Limpiar contenedores, imágenes y volúmenes
	docker-compose down -v --remove-orphans
	docker system prune -f

migrate: ## Ejecutar migraciones
	docker-compose exec backend python manage.py migrate

makemigrations: ## Crear migraciones
	docker-compose exec backend python manage.py makemigrations

superuser: ## Crear superusuario
	docker-compose exec backend python manage.py createsuperuser

shell: ## Abrir shell de Django
	docker-compose exec backend python manage.py shell

dbshell: ## Abrir shell de base de datos
	docker-compose exec backend python manage.py dbshell

test: ## Ejecutar tests
	docker-compose exec backend python manage.py test
	docker-compose exec frontend npm test

collectstatic: ## Recopilar archivos estáticos
	docker-compose exec backend python manage.py collectstatic --no-input

backup-db: ## Hacer backup de la base de datos
	docker-compose exec mysql mysqldump -u root -proot nodo > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restaurar base de datos (usar: make restore-db FILE=backup.sql)
	docker-compose exec -T mysql mysql -u root -proot nodo < $(FILE)