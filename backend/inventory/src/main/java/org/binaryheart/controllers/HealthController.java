package org.binaryheart.controllers;

import io.javalin.http.Context;

import static io.javalin.apibuilder.ApiBuilder.get;

public class HealthController {

    public static void registerRoutes() {
        get("/health", HealthController::health);
        get("/ping", HealthController::ping);
    }

    public static void health(Context ctx) {
        ctx.result("OK");
    }

    public static void ping(Context ctx) {
        System.out.println("Ping received from frontend!");
        ctx.result("pong");
    }
}
