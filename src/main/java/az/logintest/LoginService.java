package az.logintest;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class LoginService {

    private static Map<String, Integer> attempts = new HashMap<>();
    private static Map<String, Long> blockTime = new HashMap<>();
    private static final int MAX_ATTEMPTS = 3;
    private static final long BLOCK_DURATION = 10 * 1000; // 10 saniyə

    public static Map<String, String> login(String username, String password) {

        if (blockTime.containsKey(username)) {
            long elapsed = System.currentTimeMillis() - blockTime.get(username);
            if (elapsed < BLOCK_DURATION) {
                long remaining = (BLOCK_DURATION - elapsed) / 1000;
                return Map.of("message", "BLOCKED:" + remaining);
            } else {
                attempts.remove(username);
                blockTime.remove(username);
            }
        }

        try {
            Connection con = DBConnection.getConnection();
            String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
            PreparedStatement stmt = con.prepareStatement(sql);
            stmt.setString(1, username);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                attempts.remove(username);
                blockTime.remove(username);
                return Map.of("message", "Ugurla daxil oldunuz!");
            } else {
                int current = attempts.getOrDefault(username, 0) + 1;
                attempts.put(username, current);
                int remainingAttempts = MAX_ATTEMPTS - current;

                if (remainingAttempts <= 0) {
                    blockTime.put(username, System.currentTimeMillis());
                    return Map.of("message", "BLOCKED:10");
                } else {
                    return Map.of("message", "Sifre sehvdir! " + remainingAttempts + " cehdiniz qaldi.");
                }
            }

        } catch (Exception e) {
            return Map.of("message", "Xeta: " + e.getMessage());
        }
    }
}
