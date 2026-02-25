Ó<?php
include '../config.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'recruiter') {
    header("Location: ../auth/login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $candidate_user_id = $_POST['candidate_user_id'];
    $profile_id = $_POST['profile_id'];
    $recruiter_id = $_SESSION['user_id'];

    // Insert notification
    $message = "You have been shortlisted by a recruiter. Please check your email for details.";
    $stmt = $pdo->prepare("INSERT INTO notifications (sender_id, receiver_id, message) VALUES (?, ?, ?)");
    
    if ($stmt->execute([$recruiter_id, $candidate_user_id, $message])) {
        // Success View
        ?>
        <div class="row justify-content-center mt-5">
            <div class="col-md-6 text-center">
                <div class="alert alert-success p-5">
                    <h1 class="display-1 text-success mb-4">âœ”</h1>
                    <h3>SMS Notification Sent!</h3>
                    <p class="lead">The candidate has been notified of your interest.</p>
                    <a href="view_profile.php?id=<?php echo $profile_id; ?>" class="btn btn-primary mt-3">Back to Profile</a>
                    <a href="dashboard.php" class="btn btn-outline-secondary mt-3">Back to Dashboard</a>
                </div>
            </div>
        </div>
        <?php
    } else {
        echo "<div class='alert alert-danger'>Failed to send notification.</div>";
    }
} else {
    header("Location: dashboard.php");
}

include '../includes/footer.php';
?>
Ó*cascade082Sfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/recruiter/contact_candidate.php