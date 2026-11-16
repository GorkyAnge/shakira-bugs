FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -r shakira && mkdir -p /app/data && chown shakira /app/data
COPY --from=build /app/target/shakira-bugs-backend-*.jar app.jar
USER shakira
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
