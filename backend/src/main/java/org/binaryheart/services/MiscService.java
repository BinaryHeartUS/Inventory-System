package org.binaryheart.services;

import com.google.inject.Inject;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MiscNotFoundException;
import org.binaryheart.repositories.MiscRepository;
import org.binaryheart.requests.InsertMiscRequest;
import org.binaryheart.responses.GetMiscResponse;
import org.binaryheart.responses.MiscChangelogResponse;

public class MiscService {

	private final MiscRepository repository;

	@Inject
	public MiscService(MiscRepository repository) {
		this.repository = repository;
	}

	public List<GetMiscResponse> getMiscByDonor(int donorId, Integer limit, int offset) throws SQLException {
		return repository.getMiscByDonor(donorId, limit, offset);
	}

	public GetMiscResponse getMisc(int id) throws SQLException {
		return repository.getMisc(id);
	}

	public int insertMisc(InsertMiscRequest request, String username) throws SQLException, DuplicateKeyException {
		try {
			return repository.insertMisc(request, username);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("An asset with identical ID already exists: " + request.assetId());
			}
			throw e;
		}
	}

	public void updateMisc(InsertMiscRequest request, String username) throws SQLException, MiscNotFoundException {
		try {
			repository.updateMisc(request, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new MiscNotFoundException("Could not find misc asset with specified ID: " + request.assetId());
			}
			throw e;
		}
	}

	public void deleteMisc(int id) throws SQLException, MiscNotFoundException {
		try {
			repository.deleteMisc(id);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new MiscNotFoundException("Could not find misc asset with specified ID: " + id);
			}
			throw e;
		}
	}

	public MiscChangelogResponse[] getMiscChangelog(int id) throws SQLException, MiscNotFoundException {
		if (repository.getMisc(id) == null) {
			throw new MiscNotFoundException("Misc asset not found");
		}
		return repository.getMiscChangelog(id);
	}
}