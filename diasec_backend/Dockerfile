# Spring Boot 앱을 빌드하고 실행하는 Dockerfile
FROM openjdk:17
WORKDIR /app
COPY target/my-backend-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-jar", "app.jar"]