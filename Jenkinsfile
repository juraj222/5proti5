pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    string(
      name: 'GIT_URL',
      defaultValue: '',
      description: 'Git remote to clone. Leave empty to use the job SCM (Pipeline from SCM).'
    )
    string(
      name: 'GIT_BRANCH',
      defaultValue: 'main',
      description: 'Branch to pull when GIT_URL is set, or when forcing a branch name.'
    )
    string(
      name: 'GIT_CREDENTIALS_ID',
      defaultValue: 'git-credentials',
      description: 'Jenkins credentials ID for private Git (username/password or token).'
    )
    string(
      name: 'DOCKER_REGISTRY',
      defaultValue: '',
      description: 'Registry to publish to, e.g. docker.io/myuser or ghcr.io/myorg. Empty = build and run only, no push.'
    )
    string(
      name: 'DOCKER_CREDENTIALS_ID',
      defaultValue: 'docker-registry',
      description: 'Jenkins username/password credentials ID for docker login. Used only when DOCKER_REGISTRY is set.'
    )
    string(
      name: 'IMAGE_NAME',
      defaultValue: 'five-against-five',
      description: 'Docker image name without registry.'
    )
    string(
      name: 'HOST_PORT',
      defaultValue: '43127',
      description: 'Host port to publish. 43127 is unused by common stacks (not 80/443/3000/8080).'
    )
    booleanParam(
      name: 'DEPLOY',
      defaultValue: true,
      description: 'Stop the old container and run the new image on this Jenkins agent.'
    )
  }

  environment {
    IMAGE_NAME = "${params.IMAGE_NAME}"
    HOST_PORT = "${params.HOST_PORT}"
    DOCKER_REGISTRY = "${params.DOCKER_REGISTRY}"
    CONTAINER_NAME = 'five-against-five'
    CONTAINER_PORT = '43127'
  }

  stages {
    stage('Pull from Git') {
      steps {
        script {
          def branch = params.GIT_BRANCH?.trim() ?: 'main'
          if (params.GIT_URL?.trim()) {
            checkout([
              $class: 'GitSCM',
              branches: [[name: "*/${branch}"]],
              userRemoteConfigs: [[
                url: params.GIT_URL.trim(),
                credentialsId: params.GIT_CREDENTIALS_ID
              ]]
            ])
          } else {
            checkout scm
          }
          env.IMAGE_TAG = sh(
            script: 'git rev-parse --short HEAD',
            returnStdout: true
          ).trim() + "-${env.BUILD_NUMBER}"
        }
        sh 'git log -1 --oneline'
      }
    }

    stage('Build Docker image') {
      steps {
        sh 'chmod +x jenkins/deploy.sh'
        sh 'IMAGE_TAG="$IMAGE_TAG" ./jenkins/deploy.sh build'
      }
    }

    stage('Publish Docker image') {
      when {
        expression { return params.DOCKER_REGISTRY?.trim() }
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: params.DOCKER_CREDENTIALS_ID,
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
          )
        ]) {
          sh '''
            export DOCKER_REGISTRY="$DOCKER_REGISTRY"
            export IMAGE_TAG="$IMAGE_TAG"
            ./jenkins/deploy.sh publish
          '''
        }
      }
    }

    stage('Run container') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        sh '''
          export IMAGE_TAG="$IMAGE_TAG"
          export DOCKER_REGISTRY="$DOCKER_REGISTRY"
          ./jenkins/deploy.sh run
        '''
      }
    }
  }

  post {
    success {
      echo "5 proti 5 is at http://<jenkins-agent>:${params.HOST_PORT}  (play /play, host /admin)"
    }
    failure {
      sh "docker logs ${CONTAINER_NAME} || true"
    }
  }
}
