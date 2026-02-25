‚<?php
require 'config.php';

try {
    $sql = file_get_contents('database.sql');
    $pdo->exec($sql);
    echo "Database and tables created successfully.";
} catch (PDOException $e) {
    echo "Error creating database: " . $e->getMessage();
}
?>
‚*cascade082@file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/setup_db.php