pipeline {
    agent any

    triggers {
        githubPush()
    }

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Validate Project Structure') {
            steps {
                script {
                    def requiredFiles = [
                        'frontend/index.html',
                        'frontend/assets/css/style.css',
                        'frontend/assets/js/script.js',
                        'server.js',
                        'db.js',
                        'package.json',
                        'test/api.test.js'
                    ]

                    for (file in requiredFiles) {
                        if (!fileExists(file)) {
                            error("Required file missing: ${file}")
                        }
                        echo "Found: ${file}"
                    }
                }
            }
        }

        stage('Validate HTML') {
            steps {
                script {
                    def htmlContent = readFile('frontend/index.html')

                    if (!htmlContent.contains('<!DOCTYPE html>')) {
                        error('HTML validation failed: DOCTYPE declaration not found.')
                    }

                    if (!htmlContent.contains('<html')) {
                        error('HTML validation failed: HTML tag not found.')
                    }

                    if (!htmlContent.contains('</html>')) {
                        error('HTML validation failed: Closing HTML tag not found.')
                    }

                    if (!htmlContent.contains('<title>EstateX</title>')) {
                        error('HTML validation failed: Expected page title "EstateX" not found.')
                    }

                    echo 'HTML basic validation passed.'
                }
            }
        }

        stage('Validate Website Sections & Data Forms') {
            steps {
                script {
                    def htmlContent = readFile('frontend/index.html')

                    def requiredSections = [
                        'id="home"',
                        'id="about"',
                        'id="service"',
                        'id="property"',
                        'id="blog"',
                        'id="contact-form"'
                    ]

                    for (section in requiredSections) {
                        if (!htmlContent.contains(section)) {
                            error("Website section or form missing: ${section}")
                        }
                        echo "Section/Form found: ${section}"
                    }
                }
            }
        }

        stage('Validate Assets') {
            steps {
                script {
                    def htmlContent = readFile('frontend/index.html')

                    if (!htmlContent.contains('./assets/css/style.css')) {
                        error('CSS stylesheet link not found in index.html.')
                    }

                    if (!htmlContent.contains('./assets/js/script.js')) {
                        error('JavaScript file link not found in index.html.')
                    }

                    echo 'CSS and JavaScript links validated successfully.'
                }
            }
        }

        stage('Test Property Listings') {
            steps {
                script {
                    def htmlContent = readFile('frontend/index.html')

                    def requiredProperties = [
                        'New Apartment Nice View',
                        'Modern Apartments',
                        'Luxury villa in Rego Park'
                    ]

                    for (property in requiredProperties) {
                        if (!htmlContent.contains(property)) {
                            error("Property listing missing: ${property}")
                        }
                        echo "Property found: ${property}"
                    }
                }
            }
        }

        stage('Test Services') {
            steps {
                script {
                    def htmlContent = readFile('frontend/index.html')

                    def requiredServices = [
                        'Buy a home',
                        'Rent a home',
                        'Sell a home'
                    ]

                    for (service in requiredServices) {
                        if (!htmlContent.contains(service)) {
                            error("Service missing: ${service}")
                        }
                        echo "Service found: ${service}"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies for backend and database...'
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Test Data Entry API & Database') {
            steps {
                echo 'Running automated data entry backend and MongoDB database tests...'
                script {
                    if (isUnix()) {
                        sh 'npm test'
                    } else {
                        bat 'npm test'
                    }
                }
            }
        }

        stage('Build Result') {
            steps {
                echo 'All Jenkins validation and data entry tests passed successfully.'
                echo 'EstateX project with Backend & Database is ready for deployment.'
            }
        }
    }

    post {
        success {
            echo 'BUILD SUCCESS: All tests passed!'
        }

        failure {
            echo 'BUILD FAILED: Please check the Jenkins console output.'
        }

        always {
            echo 'Jenkins pipeline execution completed.'
        }
    }
}
