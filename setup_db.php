<?php
// Setup script to create database and table automatically
$host = "localhost";
$username = "root";
$password = "";

try {
    // 1. Connect to MySQL
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS hackaton_db");
    $pdo->exec("USE hackaton_db");

    // 3. Create Table
    $sql = "CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);

    echo "<div style='font-family: sans-serif; padding: 20px; border: 2px solid #28a745; border-radius: 10px; background: #d4edda; color: #155724;'>
            <h1>✅ Database Ready!</h1>
            <p>The <b>hackaton_db</b> and <b>leads</b> table have been created successfully.</p>
            <p>You can now go back to your website and test the chat form.</p>
          </div>";

} catch (PDOException $e) {
    echo "<div style='font-family: sans-serif; padding: 20px; border: 2px solid #dc3545; border-radius: 10px; background: #f8d7da; color: #721c24;'>
            <h1>❌ Error</h1>
            <p>Could not create database: " . $e->getMessage() . "</p>
            <p>Make sure <b>MySQL</b> is turned on in your XAMPP Control Panel!</p>
          </div>";
}
?>
