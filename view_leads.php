<?php
include 'db_config.php';

try {
    $stmt = $pdo->query("SELECT * FROM leads ORDER BY created_at DESC");
    $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<div style='font-family: sans-serif; padding: 20px;'>";
    echo "<h1 style='color: #333;'>📋 Registered Leads</h1>";
    
    if (count($leads) > 0) {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%; text-align: left;'>
                <tr style='background: #f4f4f4;'>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Date Joined</th>
                </tr>";
        foreach ($leads as $row) {
            echo "<tr>
                    <td>{$row['id']}</td>
                    <td>{$row['first_name']}</td>
                    <td>{$row['last_name']}</td>
                    <td>{$row['email']}</td>
                    <td>{$row['created_at']}</td>
                  </tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: #666;'>No leads found yet. Go to the website and fill out the form!</p>";
    }
    
    echo "<br><a href='../index.html' style='display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;'>← Back to Website</a>";
    echo "</div>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
