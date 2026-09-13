# 5 proti 5

Chill living-room game in the spirit of Family Feud. One screen is the big board for players. The other is the host console. Answers stay hidden until the host reveals them, then round points can be given to team A or team B.

Questions and survey scores come from `data/questions.md` (the attached 2018 Vyplňto.cz set). Each question shows its top five answers.

## How to play

1. Start the app.
2. Open **Hracia plocha** (`/play`) on the TV or a laptop.
3. Open **Moderátor** (`/admin`) on a phone or second computer.
4. Read the question. Players guess. Tap an answer on the host console to flip it on the board.
5. Award the round points to one of the two teams, then move to the next question.

Host shortcuts: `1`–`5` reveal an answer, `N` / `P` next or previous question, `X` strike, `A` / `B` award team 1 or 2.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:43127](http://localhost:43127). The server listens on `0.0.0.0`, so other devices on the same Wi-Fi can use your machine’s LAN address.

Production:

```bash
npm run build
npm start
```

Keep one Node process running for the whole party. The live board and host console share in-memory game state on that server.

## Run with Docker

One container, one party. The player board and host console share live game state inside that process.

```bash
docker compose up --build
```

Then open [http://localhost:43127](http://localhost:43127). Leave it running while you play. Other devices on the same Wi-Fi can use your machine’s LAN address on port `43127`.

Run in the background:

```bash
docker compose up --build -d
docker compose down
```

Without Compose:

```bash
docker build -t five-against-five .
docker run --rm -p 43127:43127 five-against-five
```

Compose mounts `data/questions.md` into the container. After you edit the file, restart the container so the new questions load:

```bash
docker compose restart
```

## Questions

The host console can upload a new `.md` pack. Two formats work:

Family Feud (EN prompt, Czech prompt, then EN / CZ / points):

```md
### 1. Name something you fish for.
**CZ:** Jmenuj něco, na co "lovíš".

| EN | CZ | Body |
|---|---|---|
| FISH/SEAFOOD | Ryby / mořské plody | 66 |
| A COMPLIMENT | Komplimenty | 16 |
```

Or the original survey table in `data/questions.md`.

A bundled Family Feud season-26 pack lives in `data/family-feud-sezona26.md`. On the host console you can load it, upload your own file, or restore the original 17-question survey.

Uploaded packs are saved in `.data/pack.json` so they survive a restart.

## Jenkins: pull, publish Docker, run

The repo includes a `Jenkinsfile` that:

1. Pulls the branch from Git
2. Builds the Docker image
3. Pushes it when `DOCKER_REGISTRY` is set
4. Runs the container on **port 43127** (usually free — not 80, 443, 3000, or 8080)

On the Jenkins controller, create a **Pipeline** job:

- Definition: **Pipeline script from SCM**
- SCM: this Git repository, branch `main`
- Script path: `Jenkinsfile`

The Jenkins agent needs **Git**, **Docker**, and **curl**. The job must be allowed to run Docker (agent in the `docker` group, or Docker-outside-of-Docker).

Optional Jenkins credentials:

| ID | Used for |
|---|---|
| `git-credentials` | Private Git clone when you pass `GIT_URL` |
| `docker-registry` | `docker login` when you pass `DOCKER_REGISTRY` |

Build parameters you can set on the job:

- `GIT_URL` — leave empty to use the job SCM
- `GIT_BRANCH` — default `main`
- `DOCKER_REGISTRY` — e.g. `docker.io/myuser` or `ghcr.io/myorg`. Empty means build and run on the agent only
- `HOST_PORT` — default `43127`

After a green build, open `http://<agent-host>:43127`.

You can run the same steps by hand:

```bash
export IMAGE_TAG=$(git rev-parse --short HEAD)
./jenkins/deploy.sh build
# optional:
# export DOCKER_REGISTRY=docker.io/myuser
# export DOCKER_USER=...
# export DOCKER_PASS=...
# ./jenkins/deploy.sh publish
export HOST_PORT=43127
./jenkins/deploy.sh run
```

