FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY backend/ .
RUN mvn -pl import -am package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/import/target/import-*.jar app.jar
COPY data/ /data/
ENTRYPOINT ["java", "-jar", "app.jar"]
