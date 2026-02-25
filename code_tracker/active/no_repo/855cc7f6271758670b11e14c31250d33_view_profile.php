Ž<?php
include '../config.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'recruiter') {
    header("Location: ../auth/login.php");
    exit;
}

if (!isset($_GET['id'])) {
    header("Location: dashboard.php");
    exit;
}

$profile_id = $_GET['id'];

$stmt = $pdo->prepare("SELECT p.*, u.email, u.id as user_id FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.id = ?");
$stmt->execute([$profile_id]);
$candidate = $stmt->fetch();

if (!$candidate) {
    echo "Candidate not found.";
    include '../includes/footer.php';
    exit;
}

// Get Skills
$stmt_skills = $pdo->prepare("SELECT skill_name FROM skills WHERE profile_id = ?");
$stmt_skills->execute([$candidate['id']]);
$skills = $stmt_skills->fetchAll(PDO::FETCH_COLUMN);
?>

<div class="row">
    <div class="col-md-8 mx-auto">
        <div class="card p-4">
            <h2 class="mb-3"><?php echo htmlspecialchars($candidate['full_name']); ?></h2>
            <p class="text-muted">Email: <?php echo htmlspecialchars($candidate['email']); ?></p>
            <p><strong>Phone:</strong> <?php echo htmlspecialchars($candidate['phone']); ?></p>

            <h4 class="mt-4">Skills</h4>
            <div>
                <?php foreach ($skills as $skill): ?>
                    <span class="badge bg-secondary me-1"><?php echo htmlspecialchars($skill); ?></span>
                <?php endforeach; ?>
            </div>

            <h4 class="mt-4">Education</h4>
            <p class="bg-light p-3 rounded"><?php echo nl2br(htmlspecialchars($candidate['education'])); ?></p>

            <h4 class="mt-4">Experience</h4>
            <p class="bg-light p-3 rounded"><?php echo nl2br(htmlspecialchars($candidate['experience'])); ?></p>

            <?php if (!empty($candidate['resume_path'])): ?>
                <div class="mt-4">
                    <a href="../<?php echo htmlspecialchars($candidate['resume_path']); ?>" target="_blank" class="btn btn-secondary">Download Resume</a>
                </div>
            <?php endif; ?>

            <div class="mt-5 border-top pt-4">
                <h4>Contact Candidate</h4>
                <form action="contact_candidate.php" method="POST">
                    <input type="hidden" name="candidate_user_id" value="<?php echo $candidate['user_id']; ?>">
                    <input type="hidden" name="profile_id" value="<?php echo $candidate['id']; ?>">
                    <button type="submit" class="btn btn-success btn-lg w-100">Contact via SMS</button>
                    <small class="text-muted text-center d-block mt-2">This will simulate sending an SMS notification.</small>
                </form>
            </div>
        </div>
        <div class="mt-3 text-center">
            <a href="dashboard.php">Back to Search</a>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
Ž*cascade082Nfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/recruiter/view_profile.php