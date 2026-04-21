package org.binaryheart;

import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(8080);

        app.get("/api/health", ctx -> ctx.result("OK"));
    }
}