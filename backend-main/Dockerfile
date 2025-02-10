# Build stage
FROM gradle:8-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon

# Production stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
COPY data data
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]