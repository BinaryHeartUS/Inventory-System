package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.requests.InsertOrganizationRequest;
import org.binaryheart.requests.InsertPersonRequest;
import org.binaryheart.requests.UpdateOrganizationRequest;
import org.binaryheart.requests.UpdatePersonRequest;
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
      Integer partyID = rs.getInt("ID");
      String name = rs.getString("Name");
      String location = rs.getString("Location");
      String individualEmail = rs.getString("IndividualEmail");
      String contactName = rs.getString("ContactName");
      String contactEmail = rs.getString("ContactEmail");
      parties.add(
          new GetPartyResponse(
              partyID, name, location, individualEmail, contactName, contactEmail));
    }
    return parties;
  }

  public List<GetPartyResponse> getAllPersons() throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Persons");
    ResultSet rs = stmt.executeQuery();
    List<GetPartyResponse> persons = new ArrayList<>();
    while (rs.next()) {
      Integer partyID = rs.getInt("ID");
      String name = rs.getString("Name");
      String location = rs.getString("Location");
      String individualEmail = rs.getString("IndividualEmail");
      persons.add(new GetPartyResponse(partyID, name, location, individualEmail, null, null));
    }
    return persons;
  }

  public List<GetPartyResponse> getAllOrganizations() throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Organizations");
    ResultSet rs = stmt.executeQuery();
    List<GetPartyResponse> orgs = new ArrayList<>();
    while (rs.next()) {
      Integer partyID = rs.getInt("ID");
      String name = rs.getString("Name");
      String location = rs.getString("Location");
      String contactName = rs.getString("ContactName");
      String contactEmail = rs.getString("ContactEmail");
      orgs.add(new GetPartyResponse(partyID, name, location, null, contactName, contactEmail));
    }
    return orgs;
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
    Integer partyID = rs.getInt("ID");
    String name = rs.getString("Name");
    String location = rs.getString("Location");
    String individualEmail = rs.getString("IndividualEmail");
    String contactName = rs.getString("ContactName");
    String contactEmail = rs.getString("ContactEmail");
    GetPartyResponse response =
        new GetPartyResponse(partyID, name, location, individualEmail, contactName, contactEmail);
    return response;
  }

  public void addOrganization(InsertOrganizationRequest request) throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    CallableStatement stmt =
        conn.prepareCall(
            "call Insert_Organization(?, ?::Name_Type, ?::Address, ?::Name_Type, ?::Email_Type)");
    stmt.registerOutParameter(1, java.sql.Types.INTEGER);
    stmt.setString(2, request.name());
    if (request.location() != null) {
      stmt.setString(3, request.location());
    } else {
      stmt.setNull(3, java.sql.Types.VARCHAR);
    }
    if (request.contactName() != null) {
      stmt.setString(4, request.contactName());
    } else {
      stmt.setNull(4, java.sql.Types.VARCHAR);
    }
    if (request.contactEmail() != null) {
      stmt.setString(5, request.contactEmail());
    } else {
      stmt.setNull(5, java.sql.Types.VARCHAR);
    }
    stmt.execute();
  }

  public void addPerson(InsertPersonRequest request) throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    CallableStatement stmt =
        conn.prepareCall("call Insert_Person(?, ?::Name_Type, ?::Address, ?::Email_Type)");
    stmt.registerOutParameter(1, java.sql.Types.INTEGER);
    stmt.setString(2, request.name());
    if (request.location() != null) {
      stmt.setString(3, request.location());
    } else {
      stmt.setNull(3, java.sql.Types.VARCHAR);
    }
    if (request.email() != null) {
      stmt.setString(4, request.email());
    } else {
      stmt.setNull(4, java.sql.Types.VARCHAR);
    }
    stmt.execute();
  }

  public void updatePerson(int id, UpdatePersonRequest request) throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    CallableStatement stmt =
        conn.prepareCall("call Update_Person(?, ?::Name_Type, ?::Address, ?::Email_Type)");
    stmt.setInt(1, id);
    stmt.setString(2, request.name());
    if (request.location() != null) {
      stmt.setString(3, request.location());
    } else {
      stmt.setNull(3, java.sql.Types.VARCHAR);
    }
    if (request.email() != null) {
      stmt.setString(4, request.email());
    } else {
      stmt.setNull(4, java.sql.Types.VARCHAR);
    }
    stmt.execute();
  }

  public void updateOrganization(int id, UpdateOrganizationRequest request) throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    CallableStatement stmt =
        conn.prepareCall(
            "call Update_Organization(?, ?::Name_Type, ?::Address, ?::Name_Type, ?::Email_Type)");
    stmt.setInt(1, id);
    stmt.setString(2, request.name());
    if (request.location() != null) {
      stmt.setString(3, request.location());
    } else {
      stmt.setNull(3, java.sql.Types.VARCHAR);
    }
    if (request.contactName() != null) {
      stmt.setString(4, request.contactName());
    } else {
      stmt.setNull(4, java.sql.Types.VARCHAR);
    }
    if (request.contactEmail() != null) {
      stmt.setString(5, request.contactEmail());
    } else {
      stmt.setNull(5, java.sql.Types.VARCHAR);
    }
    stmt.execute();
  }
}
