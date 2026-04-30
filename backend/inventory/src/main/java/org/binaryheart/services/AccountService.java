package org.binaryheart.services;

import at.favre.lib.crypto.bcrypt.BCrypt;

import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.repositories.AccountRepository;
import org.binaryheart.requests.AddAffiliationRequest;
import org.binaryheart.requests.CreateAccountRequest;
import org.binaryheart.requests.UpdateAffiliationRequest;
import org.binaryheart.responses.AccountSummary;

import java.sql.SQLException;
import java.util.List;
import java.util.Set;

public class AccountService {

    private static final Set<String> ADMIN_CREATABLE_ROLES = Set.of("Chapter Admin", "Editor", "Viewer");
    private static final Set<String> CHAPTER_ADMIN_CREATABLE_ROLES = Set.of("Editor", "Viewer");

    private final AccountRepository repository = new AccountRepository();

    /**
     * Creates a new account.
     *
     * @param request             the new account details
     * @param creatorRole         the effective role of the volunteer performing the
     *                            creation
     * @param creatorChapterRoles the per-chapter roles of the creator
     * @throws IllegalArgumentException if the role is not permitted or chapter
     *                                  access is missing
     * @throws DuplicateKeyException    if the username is already taken
     */
    public AccountSummary createAccount(CreateAccountRequest request, String creatorRole,
            List<ChapterRole> creatorChapterRoles) throws SQLException {
        Set<String> allowed = "Admin".equals(creatorRole) ? ADMIN_CREATABLE_ROLES : CHAPTER_ADMIN_CREATABLE_ROLES;

        if (!allowed.contains(request.role())) {
            throw new IllegalArgumentException("Role '" + request.role() + "' is not permitted for a " + creatorRole);
        }

        if (!"Admin".equals(creatorRole)) {
            // Chapter Admin must have Chapter Admin role specifically for the target
            // chapter
            boolean hasAccess = creatorChapterRoles.stream()
                    .anyMatch(cr -> cr.chapterId() == request.chapterId() && "Chapter Admin".equals(cr.role()));
            if (!hasAccess) {
                throw new IllegalArgumentException(
                        "You may only create accounts for chapters where you are a Chapter Admin");
            }
        }

        if (request.name() == null || request.name().isBlank() || request.username() == null
                || request.username().isBlank() || request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Name, username, and password are required");
        }

        String passwordHash = BCrypt.withDefaults().hashToString(12, request.password().toCharArray());

        try {
            int id = repository.createVolunteer(request.name(), request.username(), passwordHash, request.chapterId(),
                    request.role());
            return new AccountSummary(id, request.username(), request.name(),
                    List.of(new ChapterRole(request.chapterId(), request.role())));
        } catch (SQLException e) {
            // PostgreSQL unique_violation (23505) → username already taken
            if (e.getSQLState() != null && e.getSQLState().equals("23505")) {
                throw new DuplicateKeyException("Username '" + request.username() + "' is already taken");
            }
            throw e;
        }
    }

    /**
     * Returns accounts visible to the requesting volunteer. Admins see all; Chapter
     * Admins see only accounts in their chapters, excluding accounts whose
     * effective role is higher than Editor.
     */
    public List<AccountSummary> getAccounts(String requesterRole, List<Integer> requesterChapterIds)
            throws SQLException {
        if ("Admin".equals(requesterRole)) {
            return repository.getAllVolunteers();
        }
        // Chapter Admins only see Editor/Viewer accounts in their chapters
        return repository.getVolunteersForChapters(requesterChapterIds).stream().filter(
                a -> a.chapterRoles().stream().allMatch(cr -> "Editor".equals(cr.role()) || "Viewer".equals(cr.role())))
                .toList();
    }

    /**
     * Deletes an account. Admins may delete any account except their own. Chapter
     * Admins may delete Editor/Viewer accounts in chapters they admin.
     */
    public void deleteAccount(int targetId, int requesterId, String requesterRole,
            List<ChapterRole> requesterChapterRoles) throws SQLException {
        if (targetId == requesterId) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }
        if (!"Admin".equals(requesterRole)) {
            // Chapter Admin: target must only have Editor/Viewer roles, all within chapters
            // the requester admins
            AccountSummary target = repository.getAllVolunteers().stream().filter(a -> a.id() == targetId).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));
            for (ChapterRole cr : target.chapterRoles()) {
                if ("Chapter Admin".equals(cr.role()) || "Admin".equals(cr.role())) {
                    throw new IllegalArgumentException("You cannot delete accounts with Chapter Admin or Admin roles");
                }
                boolean adminsChapter = requesterChapterRoles.stream()
                        .anyMatch(r -> r.chapterId() == cr.chapterId() && "Chapter Admin".equals(r.role()));
                if (!adminsChapter) {
                    throw new IllegalArgumentException("You can only delete accounts within your own chapters");
                }
            }
        }
        repository.deleteVolunteer(targetId);
    }

    /**
     * Updates the role for an existing chapter affiliation. Applies the same
     * chapter/role permission checks as addAffiliation.
     */
    public void updateAffiliation(int targetId, int chapterId, UpdateAffiliationRequest request, String updaterRole,
            List<ChapterRole> updaterChapterRoles) throws SQLException {
        Set<String> allowed = "Admin".equals(updaterRole) ? ADMIN_CREATABLE_ROLES : CHAPTER_ADMIN_CREATABLE_ROLES;

        if (!allowed.contains(request.role())) {
            throw new IllegalArgumentException("Role '" + request.role() + "' is not permitted for a " + updaterRole);
        }

        if (!"Admin".equals(updaterRole)) {
            boolean hasAccess = updaterChapterRoles.stream()
                    .anyMatch(cr -> cr.chapterId() == chapterId && "Chapter Admin".equals(cr.role()));
            if (!hasAccess) {
                throw new IllegalArgumentException(
                        "You may only update roles for chapters where you are a Chapter Admin");
            }
        }

        repository.updateAffiliation(targetId, chapterId, request.role());
    }

    /**
     * Adds a chapter+role affiliation to an existing account. Applies the same
     * role/chapter permission checks as createAccount.
     */
    public void addAffiliation(int targetId, AddAffiliationRequest request, String creatorRole,
            List<ChapterRole> creatorChapterRoles) throws SQLException {
        Set<String> allowed = "Admin".equals(creatorRole) ? ADMIN_CREATABLE_ROLES : CHAPTER_ADMIN_CREATABLE_ROLES;

        if (!allowed.contains(request.role())) {
            throw new IllegalArgumentException("Role '" + request.role() + "' is not permitted for a " + creatorRole);
        }

        if (!"Admin".equals(creatorRole)) {
            boolean hasAccess = creatorChapterRoles.stream()
                    .anyMatch(cr -> cr.chapterId() == request.chapterId() && "Chapter Admin".equals(cr.role()));
            if (!hasAccess) {
                throw new IllegalArgumentException(
                        "You may only assign roles for chapters where you are a Chapter Admin");
            }
        }

        try {
            repository.addAffiliation(targetId, request.chapterId(), request.role());
        } catch (SQLException e) {
            if (e.getSQLState() != null && e.getSQLState().equals("23505")) {
                throw new DuplicateKeyException("This account already has a role in that chapter");
            }
            throw e;
        }
    }
}
