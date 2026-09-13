#!/usr/bin/env bash
# Build, optionally publish, and run the 5 proti 5 Docker image.
# Used by Jenkinsfile; safe to run by hand on a host with Docker.
set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-five-against-five}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-five-against-five}"
# Uncommon host port — avoids 80, 443, 3000, 8080, 5173.
HOST_PORT="${HOST_PORT:-43127}"
CONTAINER_PORT="${CONTAINER_PORT:-43127}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
DATA_VOLUME="${DATA_VOLUME:-five-against-five-data}"

full_image() {
  if [[ -n "${DOCKER_REGISTRY}" ]]; then
    echo "${DOCKER_REGISTRY%/}/${IMAGE_NAME}:${IMAGE_TAG}"
  else
    echo "${IMAGE_NAME}:${IMAGE_TAG}"
  fi
}

cmd="${1:-}"
shift || true

case "${cmd}" in
  build)
    echo "Building $(full_image)"
    docker build \
      --tag "$(full_image)" \
      --tag "${IMAGE_NAME}:latest" \
      .
    ;;
  publish)
    if [[ -z "${DOCKER_REGISTRY}" ]]; then
      echo "DOCKER_REGISTRY is empty — skip publish (image stays on this agent)."
      exit 0
    fi
    if [[ -n "${DOCKER_USER:-}" && -n "${DOCKER_PASS:-}" ]]; then
      login_host="${DOCKER_REGISTRY%%/*}"
      if [[ "${login_host}" == "docker.io" || "${login_host}" == "index.docker.io" ]]; then
        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
      else
        echo "${DOCKER_PASS}" | docker login "${login_host}" -u "${DOCKER_USER}" --password-stdin
      fi
    fi
    docker push "$(full_image)"
    docker tag "$(full_image)" "${DOCKER_REGISTRY%/}/${IMAGE_NAME}:latest"
    docker push "${DOCKER_REGISTRY%/}/${IMAGE_NAME}:latest"
    echo "Published $(full_image)"
    ;;
  run)
    image="$(full_image)"
    echo "Running ${CONTAINER_NAME} from ${image} on host port ${HOST_PORT}"
    docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    docker volume create "${DATA_VOLUME}" >/dev/null
    docker run -d \
      --name "${CONTAINER_NAME}" \
      --restart unless-stopped \
      --init \
      -p "${HOST_PORT}:${CONTAINER_PORT}" \
      -e NODE_ENV=production \
      -e PORT="${CONTAINER_PORT}" \
      -e HOSTNAME=0.0.0.0 \
      -v "${DATA_VOLUME}:/app/.data" \
      "${image}"
    echo "Waiting for health on http://127.0.0.1:${HOST_PORT}/api/game?role=play"
    for _ in $(seq 1 30); do
      if curl -sf "http://127.0.0.1:${HOST_PORT}/api/game?role=play" >/dev/null; then
        echo "Game is up at http://127.0.0.1:${HOST_PORT}"
        exit 0
      fi
      sleep 2
    done
    echo "Container failed to become healthy. Last logs:" >&2
    docker logs "${CONTAINER_NAME}" >&2 || true
    exit 1
    ;;
  *)
    echo "Usage: $0 {build|publish|run}" >&2
    exit 1
    ;;
esac
