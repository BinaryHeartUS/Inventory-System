package org.binaryheart.repositories;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.responses.GetPartyResponse;

public class PartyRepository {

    public List<GetPartyResponse> getAllParties() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Parties");
        ResultSet rs = stmt.executeQuery();
        List<GetPartyResponse> parties = new ArrayList<>();
        while (rs.next()) {
            // TODO: Actually parse the response from getAllParties
        }
        return parties;
    }

    public GetPartyResponse getParty(int id) throws SQLException, PartyNotFoundException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Party(?)");
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            throw new PartyNotFoundException("Given ID did not match a party in database");
        }
        // TODO: Parse the response from GetParty
        GetPartyResponse response = new GetPartyResponse();
        return response;
    }
}
