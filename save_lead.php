<?php
include 'db_config.php';

// Allow requests from your website
header("Content-Type: application/json");

// Get the data from the JavaScript fetch request
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $fName = $data['firstName'];
    $lName = $data['lastName'];
    $email = $data['email'];

    try {
        // Check if email already exists
        $checkSql = "SELECT id FROM leads WHERE email = ?";
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->execute([$email]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            // Update existing record
            $sql = "UPDATE leads SET first_name = ?, last_name = ? WHERE email = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$fName, $lName, $email]);
            echo json_encode(["status" => "success", "message" => "Lead updated successfully"]);
        } else {
            // Insert new record
            $sql = "INSERT INTO leads (first_name, last_name, email) VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$fName, $lName, $email]);
            echo json_encode(["status" => "success", "message" => "New lead saved successfully"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No data received"]);
}
?>
