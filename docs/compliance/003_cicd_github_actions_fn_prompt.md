@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory ~/MISEIA1-4-190-bonus_bondvault. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker.

The app must be accessible through Traefik using the domain bondvault.deviaaps.com, port 30001, use the traefik wildcard *.deviaaps.com.

Use /gh-cli and gcloud for all secrets required.

## Context
- Project: BondVault — Next.js 16 / TypeScript / MongoDB
- GitHub repo: https://github.com/Jorgeaapaz/MISEIA_1-4-190-bonus
- Remote VM: `gcvmuser@34.174.56.186` (GCP Ubuntu VM)
- SSH key: `C:\ubuntuiso\.ssh\vboxuser`
- App deploy dir on VM: `~/MISEIA1-4-190-bonus_bondvault`
- Domain: `bondvault.deviaaps.com` (Traefik wildcard `*.deviaaps.com` already configured)
- Traefik network: `miseia-net`
- MongoDB connection (production): `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`

## Environment File
Use `env.production` file at project root for production environment variables. The CI/CD must copy this file to the VM as `.env.production` and reference it in the Docker container.

```env
MONGODB_URI=mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin
MONGODB_DB=bonos_db
AWS_USERNAME=rustfsadmin
AWS_PASSWORD=RustfsSecret2024!
AWS_REGION=us-east-1
AWS_URL=https://rustfs-api.deviaaps.com
AWS_BUCKET=bonos-bucket
MAILHOG_HOST=mailhog
MAIL_PORT=1025
NEXT_PUBLIC_API_URL=https://bondvault.deviaaps.com
JWT_SECRET=bondvault-prod-secret-2026
NODE_ENV=production
```

### GitHub Actions Pipeline Guidelines

**Workflow file:** `.github/workflows/deploy.yml`

**Triggers:** push to `master` branch

**Jobs:**

1. **test** — Run on `ubuntu-latest`:
   - Checkout code
   - Setup Node 20
   - Install dependencies (`npm ci`)
   - Run linter (`npm run lint`)
   - Run unit tests (`npm run test`)
   - NOTE: Set `NODE_ENV=production` only for `npm run build`, not as a job-level variable

2. **build-and-deploy** — Depends on `test`, runs on `ubuntu-latest`:
   - Checkout code
   - Copy SSH key from GitHub secret `VM_SSH_KEY`
   - Copy `env.production` content from GitHub secret `ENV_PRODUCTION`
   - SSH into VM and:
     - Pull latest code from GitHub
     - Copy `.env.production` file
     - Build Docker image with `docker build`
     - Stop existing container (if any)
     - Start new container connected to `miseia-net` with Traefik labels

**Dockerfile to create:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN NODE_ENV=production npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**`next.config.ts` must enable `output: 'standalone'`**

**Traefik labels for the app container:**
```
traefik.enable=true
traefik.http.routers.bondvault.rule=Host(`bondvault.deviaaps.com`)
traefik.http.routers.bondvault.entrypoints=websecure
traefik.http.routers.bondvault.tls=true
traefik.http.routers.bondvault.tls.certresolver=cloudflare
traefik.http.services.bondvault-svc.loadbalancer.server.port=3000
traefik.docker.network=miseia-net
```

**GitHub Secrets to configure via `/gh-cli`:**
- `VM_SSH_KEY` — contents of `C:\ubuntuiso\.ssh\vboxuser`
- `VM_HOST` — `34.174.56.186`
- `VM_USER` — `gcvmuser`
- `ENV_PRODUCTION` — contents of `env.production`

## Output checklist and Guardrails
- [ ] `Dockerfile` created at project root
- [ ] `next.config.ts` updated with `output: 'standalone'`
- [ ] `.github/workflows/deploy.yml` created
- [ ] `env.production` created (gitignored)
- [ ] GitHub secrets configured via gh CLI
- [ ] `NODE_ENV=production` only on build step, not job-level
- [ ] Pipeline passes on push to master
- [ ] App accessible at `https://bondvault.deviaaps.com`
- [ ] README updated with public URL
