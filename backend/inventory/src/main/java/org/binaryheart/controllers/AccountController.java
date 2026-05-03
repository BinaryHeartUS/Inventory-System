package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.AddAffiliationRequest;
import org.binaryheart.requests.CreateAccountRequest;
import org.binaryheart.requests.UpdateAffiliationRequest;
import org.binaryheart.responses.AccountSummary;
import org.binaryheart.services.AccountService;

import java.sql.SQLException;
import java.util.List;

import static io.javalin.apibuilder.ApiBuilder.*;

public class AccountController {

    private static final AccountService service = new AccountService();

    public static void registerRoutes() {
        post("", AccountController::createAccount, AppRole.CHAPTER_ADMIN);
        get("", AccountController::getAccounts, AppRole.CHAPTER_ADMIN);
        delete("/{id}", AccountController::deleteAccount, AppRole.CHAPTER_ADMIN);
        post("/{id}/roles", AccountController::addAffiliation, AppRole.CHAPTER_ADMIN);
        put("/{id}/roles/{chapterId}", AccountController::updateAffiliation, AppRole.CHAPTER_ADMIN);
        delete("/{id}/roles/{chapterId}", AccountController::removeAffiliation, AppRole.CHAPTER_ADMIN);
    }

    @OpenApi(
            path = "/api/accounts",
            methods = { HttpMethod.POST },
            tags = { "Accounts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Create a new account",
            description = "Admins can create Chapter Admin / Editor / Viewer accounts for any chapter. "
                    + "Chapter Admins can create Editor / Viewer accounts for their own chapters.",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = CreateAccountRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Account created",
                    content = { @OpenApiContent(
                            from = AccountSummary.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Invalid request or forbidden role"),
                    @OpenApiResponse(
                            status = "409",
                            description = "Username already taken"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void createAccount(Context ctx) {
        CreateAccountRequest request = ctx.bodyAsClass(CreateAccountRequest.class);
        String creatorRole = ctx.attribute("role");
        List<ChapterRole> creatorChapterRoles = ctx.attribute("chapterRoles");

        try {
            AccountSummary created = service.createAccount(request, creatorRole, creatorChapterRoles);
            ctx.status(201).json(created);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (DuplicateKeyException e) {
            ctx.status(409).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }

    @OpenApi(
            path = "/api/accounts",
            methods = { HttpMethod.GET },
            tags = { "Accounts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "List accounts",
            description = "Admins see all accounts. Chapter Admins see only accounts in their chapters.",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Account list returned",
                    content = { @OpenApiContent(
                            from = AccountSummary[].class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getAccounts(Context ctx) {
        String requesterRole = ctx.attribute("role");
        List<Integer> requesterChapterIds = ctx.attribute("chapterIds");

        try {
            List<AccountSummary> accounts = service.getAccounts(requesterRole, requesterChapterIds);
            ctx.status(200).json(accounts);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }

    @OpenApi(
            path = "/api/accounts/{id}",
            methods = { HttpMethod.DELETE },
            tags = { "Accounts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Delete an account (admin only)",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "Volunteer ID to delete") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Account deleted"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Cannot delete own account"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void deleteAccount(Context ctx) {
        int targetId = Integer.parseInt(ctx.pathParam("id"));
        int requesterId = ctx.attribute("volunteerId");
        String requesterRole = ctx.attribute("role");
        List<ChapterRole> requesterChapterRoles = ctx.attribute("chapterRoles");

        try {
            service.deleteAccount(targetId, requesterId, requesterRole, requesterChapterRoles);
            ctx.status(204);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @OpenApi(
            path = "/api/accounts/{id}/roles",
            methods = { HttpMethod.POST },
            tags = { "Accounts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a chapter/role affiliation to an existing account",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "Volunteer ID") },
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = AddAffiliationRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Affiliation added"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Invalid role or missing chapter access"),
                    @OpenApiResponse(
                            status = "409",
                            description = "Affiliation already exists"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void addAffiliation(Context ctx) {
        int targetId = Integer.parseInt(ctx.pathParam("id"));
        AddAffiliationRequest request = ctx.bodyAsClass(AddAffiliationRequest.class);
        String creatorRole = ctx.attribute("role");
        List<ChapterRole> creatorChapterRoles = ctx.attribute("chapterRoles");

        try {
            service.addAffiliation(targetId, request, creatorRole, creatorChapterRoles);
            ctx.status(204);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (DuplicateKeyException e) {
            ctx.status(409).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }

    @OpenApi(
            path = "/api/accounts/{id}/roles/{chapterId}",
            methods = { HttpMethod.PUT },
            tags = { "Accounts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Update the role for a chapter affiliation",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "Volunteer ID"),
                    @OpenApiParam(
                            name = "chapterId",
                            description = "Chapter ID") },
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = UpdateAffiliationRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Role updated"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Invalid role or missing chapter access"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void updateAffiliation(Context ctx) {
        int targetId = Integer.parseInt(ctx.pathParam("id"));
        int chapterId = Integer.parseInt(ctx.pathParam("chapterId"));
        UpdateAffiliationRequest request = ctx.bodyAsClass(UpdateAffiliationRequest.class);
        int requesterId = ctx.attribute("volunteerId");
        String updaterRole = ctx.attribute("role");
        List<ChapterRole> updaterChapterRoles = ctx.attribute("chapterRoles");

        try {
            service.updateAffiliation(targetId, chapterId, request, requesterId, updaterRole, updaterChapterRoles);
            ctx.status(204);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }

    @OpenApi(
            path = "/api/accounts/{id}/roles/{chapterId}",
            methods = { HttpMethod.DELETE },
            tags = { "Accounts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Remove a chapter affiliation from an account",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "Volunteer ID"),
                    @OpenApiParam(
                            name = "chapterId",
                            description = "Chapter ID to remove") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Affiliation removed"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Validation error"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void removeAffiliation(Context ctx) {
        int targetId = Integer.parseInt(ctx.pathParam("id"));
        int chapterId = Integer.parseInt(ctx.pathParam("chapterId"));
        int requesterId = ctx.attribute("volunteerId");
        String removerRole = ctx.attribute("role");
        List<ChapterRole> removerChapterRoles = ctx.attribute("chapterRoles");

        try {
            service.removeAffiliation(targetId, chapterId, requesterId, removerRole, removerChapterRoles);
            ctx.status(204);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }
}
