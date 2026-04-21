FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY . .
RUN mvn -pl inventory -am package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/inventory/target/inventory-*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
