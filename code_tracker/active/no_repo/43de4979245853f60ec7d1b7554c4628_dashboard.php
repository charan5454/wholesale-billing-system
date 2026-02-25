¶<?php
include '../config.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'recruiter') {
    header("Location: ../auth/login.php");
    exit;
}

$search_skill = '';
$results = [];

if (isset($_GET['skill'])) {
    $search_skill = trim($_GET['skill']);
    if (!empty($search_skill)) {
        // Search candidates associated with the skill
        $stmt = $pdo->prepare("
            SELECT p.id, p.full_name, p.education, p.experience, u.email 
            FROM profiles p 
            JOIN skills s ON p.id = s.profile_id 
            JOIN users u ON p.user_id = u.id 
            WHERE s.skill_name LIKE ? 
            GROUP BY p.id
        ");
        $stmt->execute(["%$search_skill%"]);
        $results = $stmt->fetchAll();
    }
}
?>

<div class="row">
    <div class="col-md-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Recruiter Dashboard</h2>
            <p class="mb-0">Welcome, <?php echo $_SESSION['username']; ?></p>
        </div>

        <div class="card p-4 mb-4">
            <h4 class="mb-3">Find Candidates</h4>
            <form method="GET" class="d-flex">
                <input type="text" name="skill" class="form-control me-2" placeholder="Enter skill (e.g. PHP, Python)" value="<?php echo htmlspecialchars($search_skill); ?>">
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
        </div>

        <?php if ($search_skill): ?>
            <h4>Search Results for "<?php echo htmlspecialchars($search_skill); ?>"</h4>
            <div class="row mt-3">
                <?php if (count($results) > 0): ?>
                    <?php foreach ($results as $candidate): ?>
                        <div class="col-md-6 mb-4">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><?php echo htmlspecialchars($candidate['full_name']); ?></h5>
                                    <p class="card-text"><strong>Education:</strong> <?php echo substr(htmlspecialchars($candidate['education']), 0, 50) . '...'; ?></p>
                                    <p class="card-text"><strong>Experience:</strong> <?php echo substr(htmlspecialchars($candidate['experience']), 0, 50) . '...'; ?></p>
                                    <a href="view_profile.php?id=<?php echo $candidate['id']; ?>" class="btn btn-outline-primary">View Full Profile</a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="col-12"><p class="text-muted">No candidates found with this skill.</p></div>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <p class="text-muted">Enter a skill to start searching for candidates.</p>
        <?php endif; ?>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
¶*cascade082Kfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/recruiter/dashboard.php