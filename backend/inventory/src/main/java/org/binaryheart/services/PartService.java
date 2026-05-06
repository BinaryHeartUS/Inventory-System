
package org.binaryheart.services;

import java.security.InvalidParameterException;
import java.sql.Date;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.exceptions.PartNotFoundException;
import org.binaryheart.repositories.PartRepository;
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.responses.PartResponse;

public class PartService {
    private final PartRepository repository = new PartRepository();
    private final ChapterService chapterService = new ChapterService();

    public PartResponse[] getAllParts(List<Integer> userChapterIds) throws SQLException {
        if (userChapterIds == null || userChapterIds.isEmpty())
            return new PartResponse[0];
        if (userChapterIds.contains(chapterService.getNationalChapterId()))
            return repository.getAllParts();
        return List.of(repository.getAllParts()).stream().filter(d -> {
            Integer cid = d.chapterId();
            return cid != null && userChapterIds.contains(cid);
        }).collect(Collectors.toList()).toArray(new PartResponse[0]);
    }

    public PartResponse getPart(List<Integer> userChapterIds, Integer partId)
            throws SQLException, MissingRequiredParametersException {
        if (partId == null || partId < 0)
            throw new MissingRequiredParametersException(
                    "Non-numeric or non-positive part ID provided, must be positive integer");
        if (userChapterIds == null || userChapterIds.isEmpty())
            return null;

        PartResponse part = repository.getPart(partId);
        if ((part != null && userChapterIds.contains(part.chapterId()))
                || userChapterIds.contains(chapterService.getNationalChapterId()))
            return part;

        return null;
    }

    public void deletePart(List<Integer> userChapterIds, Integer partId)
            throws SQLException, InvalidParameterException {
        if (partId == null || partId < 0)
            throw new InvalidParameterException(
                    "Non-numeric or non-positive part ID provided, must be positive integer");

        PartResponse part = repository.getPart(partId);
        if ((part != null && userChapterIds.contains(part.chapterId()))
                || userChapterIds.contains(chapterService.getNationalChapterId())) {
            repository.deletePart(partId);
        } else {
            throw new InvalidParameterException("Part not found");
        }
    }

    public void updatePart(InsertPartRequest request)
            throws MissingRequiredParametersException, BadArgumentException, PartNotFoundException, SQLException {
        if (request.chapterId() == 0 || request.description() == null) {

        }
    }

    public void insertPart(InsertPartRequest request)
            throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
        if (request.chapterId() == 0 || request.type() == null || request.type().length() == 0
                || request.wasPurchased() == null || request.description() == null
                || request.description().length() == 0) {
            throw new MissingRequiredParametersException("Missing required parameters");
        }
        if (request.containedIn() != null && request.containedIn() <= 0) {
            throw new BadArgumentException("Contained In ID must be positive or not specified");
        }
        if (request.id() != null && request.id() <= 0) {
            throw new BadArgumentException("Asset ID must be positive or not specified");
        }
        if (request.acquisitionDate() != null
                && Date.valueOf(java.time.LocalDate.now()).before(request.acquisitionDate())) {
            throw new BadArgumentException("Acquisition date cannot be in the future");
        }
        if (request.value() != null && request.value() < 0) {
            throw new BadArgumentException("Value must be non-negative or not specified");
        }
        if (request.donorId() != null && request.donorId() <= 0) {
            throw new BadArgumentException("Donor ID must be positive or not specified");
        }

        try {
            repository.insertPart(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.id());
            } else {
                throw e;
            }
        }
    }
}