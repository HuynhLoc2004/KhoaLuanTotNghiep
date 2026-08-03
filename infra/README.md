# Local infrastructure

Local-only PostgreSQL + pgvector, MongoDB and Redis for `TASK-INFRA-001`. Application containers, migrations, Nginx and MinIO are outside this task.

## Prerequisites

- Docker Desktop with the Linux engine running.
- Docker Compose v2.
- Host ports `15432`, `27018` and `16379` available, or override them in `infra/.env`.

## Start

From the repository root:

```powershell
Copy-Item infra/.env.example infra/.env
# Edit infra/.env and replace all change-me values.
docker compose --env-file infra/.env -f infra/compose.yaml config
docker compose --env-file infra/.env -f infra/compose.yaml up -d
docker compose --env-file infra/.env -f infra/compose.yaml ps
```

Expected result: `postgres`, `mongo` and `redis` become `healthy`.

## Connection endpoints

From host processes:

```dotenv
DATABASE_URL=postgresql://museum_app:<local-password>@localhost:15432/museum
MONGODB_URI=mongodb://museum_admin:<local-password>@localhost:27018/museum?authSource=admin
REDIS_URL=redis://:<local-password>@localhost:16379
```

Future containers in this Compose network use `postgres:5432`, `mongo:27017` and `redis:6379` instead of `localhost`.

## Operate

```powershell
docker compose --env-file infra/.env -f infra/compose.yaml ps
docker compose --env-file infra/.env -f infra/compose.yaml logs --tail 100 postgres mongo redis
docker compose --env-file infra/.env -f infra/compose.yaml down
```

`down` keeps named volumes. `down --volumes` permanently deletes local database data and must only be run intentionally.

## Smoke checks

```powershell
docker compose --env-file infra/.env -f infra/compose.yaml exec -T postgres pg_isready -U museum_app -d museum
docker compose --env-file infra/.env -f infra/compose.yaml exec -T mongo mongosh --quiet --username museum_admin --password '<local-password>' --authenticationDatabase admin --eval "db.adminCommand('ping')"
docker compose --env-file infra/.env -f infra/compose.yaml exec -T redis redis-cli --no-auth-warning -a '<local-password>' ping
```

Do not paste real credentials into logs, screenshots, issues or committed documentation.
