package org.binaryheart.repositories;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.DatabaseConnectionService;

public class LookupRepository {

  private List<String> queryNames(String sql) throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    try (PreparedStatement ps = conn.prepareStatement(sql);
        ResultSet rs = ps.executeQuery()) {
      List<String> results = new ArrayList<>();
      while (rs.next()) {
        results.add(rs.getString("Name"));
      }
      return results;
    }
  }

  public List<String> getManufacturers() throws SQLException {
    return queryNames("SELECT Name FROM Manufacturer ORDER BY Name");
  }

  public List<String> getRamGenerations() throws SQLException {
    return queryNames("SELECT Name FROM Ram_Generation ORDER BY Name");
  }

  public List<String> getStorageTypes() throws SQLException {
    return queryNames("SELECT Name FROM Storage_Type ORDER BY Name");
  }

  public List<String> getPartTypes() throws SQLException {
    return queryNames("SELECT Name FROM Part_Type ORDER BY Name");
  }

  public List<String> getOperatingSystems() throws SQLException {
    return queryNames("SELECT Name FROM Operating_System ORDER BY Name");
  }

  public void insertManufacturer(String name) throws SQLException {
    callInsert("Insert_Manufacturer(?, ?)", name);
  }

  public void insertRamGeneration(String name) throws SQLException {
    callInsert("Insert_Ram_Generation(?, ?)", name);
  }

  public void insertStorageType(String name) throws SQLException {
    callInsert("Insert_Storage_Type(?, ?)", name);
  }

  public void insertPartType(String name) throws SQLException {
    callInsert("Insert_Part_Type(?, ?)", name);
  }

  public void insertOperatingSystem(String name) throws SQLException {
    callInsert("Insert_Operating_System(?, ?)", name);
  }

  public void deleteManufacturer(String name) throws SQLException {
    callDelete("Delete_Manufacturer(?)", name);
  }

  public void deleteRamGeneration(String name) throws SQLException {
    callDelete("Delete_Ram_Generation(?)", name);
  }

  public void deleteStorageType(String name) throws SQLException {
    callDelete("Delete_Storage_Type(?)", name);
  }

  public void deletePartType(String name) throws SQLException {
    callDelete("Delete_Part_Type(?)", name);
  }

  public void deleteOperatingSystem(String name) throws SQLException {
    callDelete("Delete_Operating_System(?)", name);
  }

  private void callInsert(String procedure, String name) throws SQLException {
    ensureConnected();
    Connection conn = DatabaseConnectionService.getConnection();
    try (CallableStatement stmt = conn.prepareCall("CALL " + procedure)) {
      stmt.setString(1, name);
      stmt.registerOutParameter(2, Types.INTEGER);
      stmt.execute();
    }
  }

  private void callDelete(String procedure, String name) throws SQLException {
    ensureConnected();
    Connection conn = DatabaseConnectionService.getConnection();
    try (CallableStatement stmt = conn.prepareCall("CALL " + procedure)) {
      stmt.setString(1, name);
      stmt.execute();
    }
  }

  private static void ensureConnected() throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
  }
}
