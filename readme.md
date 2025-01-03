## Não subir pro servidor pastas do node_modules (frontend e backend), build (frontend) e dist (backend), pois eles não podem ser considerados no build.

# Rodar o backend sem problemas:

Obs.: Rodar abaixo no backend do aplicativo

pm2 stop zaprun-backend
pm2 stop zaprun-frontend
sudo systemctl stop nginx
sudo systemctl stop postgresql


Ativar serviços no backend:

Obs.: Obs.: Rodar abaixo no backend do aplicativo

pm2 start zaprun-backend
pm2 start zaprun-frontend
pm2 start all
sudo systemctl start nginx
sudo systemctl start nginx
sudo systemctl start postgresql

### BUILDAR BACKEND:

> cd /home/deploy/zaprun/backend

> rm -rf dist

> NPM RUN BUILD

### BUILDAR FRONTEND:

> cd /home/deploy/zaprun/frontend

> rm -rf build

> NODE_OPTIONS=--openssl-legacy-provider npm run build


### Restarurar estado antigo para o último commit feito na branch

git reset --hard origin/branch_name
git clean -fd

