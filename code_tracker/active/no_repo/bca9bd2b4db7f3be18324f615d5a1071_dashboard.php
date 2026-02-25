¶<?php
include '../config.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'seeker') {
    header("Location: ../auth/login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
$stmt->execute([$user_id]);
$profile = $stmt->fetch();

// Get Skills
$stmt_skills = $pdo->prepare("SELECT skill_name FROM skills WHERE profile_id = ?");
$stmt_skills->execute([$profile['id']]);
$skills = $stmt_skills->fetchAll(PDO::FETCH_COLUMN);
?>

<div class="row">
    <div class="col-md-12">
        <h2 class="mb-4">My Dashboard</h2>
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="card-title"><?php echo htmlspecialchars($profile['full_name']); ?></h4>
                    <a href="profile_edit.php" class="btn btn-primary">Edit Profile</a>
                </div>
                
                <div class="row">
                    <div class="col-md-8">
                        <h5>About</h5>
                        <p><strong>Email:</strong> <?php echo $_SESSION['username']; ?> (<?php echo htmlspecialchars($_SESSION['role']); ?>)</p>
                        <p><strong>Phone:</strong> <?php echo htmlspecialchars($profile['phone'] ?? 'Not set'); ?></p>
                        
                        <h5 class="mt-4">Education</h5>
                        <p><?php echo nl2br(htmlspecialchars($profile['education'] ?? 'Add education details')); ?></p>
                        
                        <h5 class="mt-4">Experience</h5>
                        <p><?php echo nl2br(htmlspecialchars($profile['experience'] ?? 'Add experience details')); ?></p>
                    </div>
                    
                    <div class="col-md-4">
                        <h5>Skills</h5>
                        <?php if (count($skills) > 0): ?>
                            <div>
                                <?php foreach ($skills as $skill): ?>
                                    <span class="badge bg-info text-dark me-1 mb-1"><?php echo htmlspecialchars($skill); ?></span>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <p class="text-muted">No skills added yet.</p>
                        <?php endif; ?>

                        <h5 class="mt-4">Resume</h5>
                        <?php if (!empty($profile['resume_path'])): ?>
                            <a href="../<?php echo htmlspecialchars($profile['resume_path']); ?>" target="_blank" class="btn btn-outline-secondary btn-sm">View Resume</a>
                        <?php else: ?>
                            <p class="text-muted">No resume uploaded.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
¶*cascade082Hfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/seeker/dashboard.php