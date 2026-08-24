pipeline {
    agent any

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
                        'index.html',
                        'assets/css/style.css',
                        'assets/js/script.js'
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
                    def htmlContent = readFile('index.html')

                    if (!htmlContent.contains('<!DOCTYPE html>')) {
                        error('HTML validation failed: DOCTYPE declaration not found.')
                    }

                    if (!htmlContent.contains('<html')) {
                        error('HTML validation failed: HTML tag not found.')
                    }

                    if (!htmlContent.contains('</html>')) {
                        error('HTML validation failed: Closing HTML tag not found.')
                    }

                    if (!htmlContent.contains('<title>Homeverse</title>')) {
                        error('HTML validation failed: Expected page title "Homeverse" not found.')
                    }

                    echo 'HTML basic validation passed.'
                }
            }
        }

        stage('Validate Website Sections') {
            steps {
                script {
                    def htmlContent = readFile('index.html')

                    def requiredSections = [
                        'id="home"',
                        'id="about"',
                        'id="service"',
                        'id="property"',
                        'id="blog"'
                    ]

                    for (section in requiredSections) {
                        if (!htmlContent.contains(section)) {
                            error("Website section missing: ${section}")
                        }
                        echo "Section found: ${section}"
                    }
                }
            }
        }

        stage('Validate Assets') {
            steps {
                script {
                    def htmlContent = readFile('index.html')

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
                    def htmlContent = readFile('index.html')

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
                    def htmlContent = readFile('index.html')

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

        stage('Build Result') {
            steps {
                echo 'All Jenkins validation tests passed successfully.'
                echo 'Homeverse project is ready for deployment.'
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
