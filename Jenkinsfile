pipeline {
  agent {
    node {
      label 'gatsby'
    }

  }
  stages {
    stage('Install Deps') {
      steps {
        sh 'yarn -s --no-progress --frozen-lockfile'
      }
    }
    stage('') {
      steps {
        sh 'GATSBY_ENV=Development yarn gatsby build'
      }
    }
  }
}