@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a GitLab CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in GitLab CI/CD and Google Cloud Services.

## Task
Create a GitLab CI/CD pipeline (`.gitlab-ci.yml`) that compiles, tests, and deploys the BondVault app to the GCP Ubuntu VM. Use `/glab` for all GitLab CLI operations. Always set `NODE_ENV=production` only for the `npm run build` command, not as a job-level variable.

## Context
- Project: BondVault — Next.js 16 / TypeScript / MongoDB
- GitLab repo: `gitlab.codecrypto.academy/jorgeaapaz/MISEIA_1-4-190-bonus` (create if not exists)
- Remote VM: `gcvmuser@34.174.56.186` (GCP Ubuntu VM)
- SSH key: `C:\ubuntuiso\.ssh\vboxuser`
- App deploy dir on VM: `~/MISEIA1-4-190-bonus_bondvault`
- Domain: `bondvault.deviaaps.com` (Traefik wildcard `*.deviaaps.com` already configured)
- Traefik network: `miseia-net`
- MongoDB (production): `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`

## Environment File
Use `env.production` file at project root. Reference it as a GitLab CI/CD File variable named `ENV_PRODUCTION`.

### GitLab CI/CD Pipeline Guidelines

**File:** `.gitlab-ci.yml`

**Stages:** `test`, `build`, `deploy`

**Important:** Do NOT set `NODE_ENV` as a job-level or global variable. Only pass it inline to the build command.

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DEPLOY_DIR: ~/MISEIA1-4-190-bonus_bondvault
  IMAGE_NAME: bondvault

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm run test
  cache:
    paths:
      - node_modules/

build:
  stage: build
  image: docker:24
  services:
    - docker:dind
  script:
    - docker build --build-arg NODE_ENV=production -t $IMAGE_NAME:$CI_COMMIT_SHORT_SHA .
    - docker save $IMAGE_NAME:$CI_COMMIT_SHORT_SHA | gzip > bondvault.tar.gz
  artifacts:
    paths:
      - bondvault.tar.gz
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$VM_SSH_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan -H 34.174.56.186 >> ~/.ssh/known_hosts
  script:
    - scp bondvault.tar.gz gcvmuser@34.174.56.186:$DEPLOY_DIR/
    - echo "$ENV_PRODUCTION" > .env.production
    - scp .env.production gcvmuser@34.174.56.186:$DEPLOY_DIR/.env.production
    - |
      ssh gcvmuser@34.174.56.186 "
        cd $DEPLOY_DIR &&
        docker load < bondvault.tar.gz &&
        docker stop bondvault || true &&
        docker rm bondvault || true &&
        docker run -d --name bondvault \
          --network miseia-net \
          --env-file .env.production \
          --label 'traefik.enable=true' \
          --label 'traefik.http.routers.bondvault.rule=Host(\`bondvault.deviaaps.com\`)' \
          --label 'traefik.http.routers.bondvault.entrypoints=websecure' \
          --label 'traefik.http.routers.bondvault.tls=true' \
          --label 'traefik.http.routers.bondvault.tls.certresolver=cloudflare' \
          --label 'traefik.http.services.bondvault-svc.loadbalancer.server.port=3000' \
          bondvault:$CI_COMMIT_SHORT_SHA
      "
  only:
    - master
```

**GitLab CI/CD Variables to configure via `/glab`:**
- `VM_SSH_KEY` — (type: File) contents of `C:\ubuntuiso\.ssh\vboxuser` — masked
- `ENV_PRODUCTION` — (type: File) contents of `env.production` — masked

```bash
# Configure via glab
glab variable set VM_SSH_KEY --value "$(cat C:\ubuntuiso\.ssh\vboxuser)" --masked
glab variable set ENV_PRODUCTION --value "$(cat env.production)" --masked
```

**Dockerfile** must be present at project root (see `003_cicd_github_actions_fn_prompt.md` for Dockerfile content). The `Dockerfile` uses `ARG NODE_ENV` so that `--build-arg NODE_ENV=production` works correctly.

## Output checklist and Guardrails
- [ ] `.gitlab-ci.yml` created with stages: test, build, deploy
- [ ] `NODE_ENV=production` set ONLY on build command, not as job-level variable
- [ ] GitLab CI/CD variables set via `glab variable set`
- [ ] `env.production` file exists and is gitignored
- [ ] Pipeline passes all stages on push to master
- [ ] App deployed and accessible at `https://bondvault.deviaaps.com`
- [ ] No secrets hardcoded in `.gitlab-ci.yml`
