node {
stage('CheckOut_Code') {
 git branch: 'main', credentialsId: 'ee54df69-0901-42bf-a2c6-03fc3cc69907', url: 'https://github.com/MadamSusmalatha45/internodejs.git'
}
triggers{
pollSCM('* * * * *')
}
stage('build'){
nodejs(nodeJSInstallationName: 'nodejs18.8.0'){
sh "npm i express"
sh "node index.js"
}
}
stage('Initialize'){
        def dockerHome = tool 'docker'
        env.PATH = "${dockerHome}/bin:${env.PATH}"
    }
stage ('Build-Docker-Image') {
    sh "docker build -t sajjad31122017/node-js-app:${BUILD_NUMBER} ."
}
stage ('Login-Push') {
    withCredentials([string(credentialsId: 'dockerhubpwd', variable: 'dockerhubpwd')]) {
    sh "docker login -u dockerhubpwd -p dockerhubpwd"
    sh "docker push sajjad31122017/node-js-app:${BUILD_NUMBER} "
}
stage ('Deploy-On-Container-On-Server'){
    sshagent(['ssh-agent']) {
    sh "ssh -o STRICTHOSTKEYCHECKING=no ubuntu@172.31.10.233 docker rm -f nodeappcontainer || true"
    sh "ssh -o STRICTHOSTKEYCHECKING=no ubuntu@172.31.10.233 docker run -d -p 9090:9090 --name nodeappcontainer sajjad31122017/node-js-app:${BUILD_NUMBER}"
}
}

}
