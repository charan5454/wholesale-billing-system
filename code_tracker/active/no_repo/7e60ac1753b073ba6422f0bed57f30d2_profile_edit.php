î%<?php
include '../config.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'seeker') {
    header("Location: ../auth/login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$message = '';

// Fetch existing data
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
$stmt->execute([$user_id]);
$profile = $stmt->fetch();
$profile_id = $profile['id'];

// Fetch skills
$stmt_skills = $pdo->prepare("SELECT skill_name FROM skills WHERE profile_id = ?");
$stmt_skills->execute([$profile_id]);
$current_skills = $stmt_skills->fetchAll(PDO::FETCH_COLUMN);
$skills_str = implode(', ', $current_skills);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $full_name = trim($_POST['full_name']);
    $phone = trim($_POST['phone']);
    $education = trim($_POST['education']);
    $experience = trim($_POST['experience']);
    $skills_input = trim($_POST['skills']);
    
    // Resume upload
    $resume_path = $profile['resume_path'];
    if (isset($_FILES['resume']) && $_FILES['resume']['error'] == 0) {
        $upload_dir = '../uploads/';
        $filename = time() . '_' . basename($_FILES['resume']['name']);
        $target_file = $upload_dir . $filename;
        if (move_uploaded_file($_FILES['resume']['tmp_name'], $target_file)) {
            $resume_path = 'uploads/' . $filename;
        }
    }

    // Update Profile
    $stmt = $pdo->prepare("UPDATE profiles SET full_name=?, phone=?, education=?, experience=?, resume_path=? WHERE id=?");
    if ($stmt->execute([$full_name, $phone, $education, $experience, $resume_path, $profile_id])) {
        
        // Update Skills (Delete all and re-insert)
        $pdo->prepare("DELETE FROM skills WHERE profile_id = ?")->execute([$profile_id]);
        
        $skill_array = explode(',', $skills_input);
        $skill_stmt = $pdo->prepare("INSERT INTO skills (profile_id, skill_name) VALUES (?, ?)");
        
        foreach ($skill_array as $skill) {
            $s = trim($skill);
            if (!empty($s)) {
                $skill_stmt->execute([$profile_id, $s]);
            }
        }
        
        $message = "Profile updated successfully!";
        // Refresh data
        $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $profile = $stmt->fetch();
        $skills_str = $skills_input;
    } else {
        $message = "Error updating profile.";
    }
}
?>

<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card p-4">
            <h2 class="mb-4">Edit Profile</h2>
            <?php if($message): ?>
                <div class="alert alert-success"><?php echo $message; ?></div>
            <?php endif; ?>

            <form method="POST" enctype="multipart/form-data">
                <div class="mb-3">
                    <label>Full Name</label>
                    <input type="text" name="full_name" class="form-control" value="<?php echo htmlspecialchars($profile['full_name']); ?>" required>
                </div>
                <div class="mb-3">
                    <label>Phone</label>
                    <input type="text" name="phone" class="form-control" value="<?php echo htmlspecialchars($profile['phone']); ?>">
                </div>
                <div class="mb-3">
                    <label>Education</label>
                    <textarea name="education" class="form-control" rows="3"><?php echo htmlspecialchars($profile['education']); ?></textarea>
                </div>
                <div class="mb-3">
                    <label>Experience</label>
                    <textarea name="experience" class="form-control" rows="3"><?php echo htmlspecialchars($profile['experience']); ?></textarea>
                </div>
                <div class="mb-3">
                    <label>Skills (comma separated, e.g. PHP, Java, SQL)</label>
                    <input type="text" name="skills" class="form-control" value="<?php echo htmlspecialchars($skills_str); ?>">
                </div>
                <div class="mb-3">
                    <label>Resume (PDF/Doc)</label>
                    <input type="file" name="resume" class="form-control">
                    <?php if (!empty($profile['resume_path'])): ?>
                        <small>Current: <a href="../<?php echo $profile['resume_path']; ?>" target="_blank">View Resume</a></small>
                    <?php endif; ?>
                </div>
                <button type="submit" class="btn btn-primary">Save Changes</button>
                <a href="dashboard.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
î%*cascade082Kfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/seeker/profile_edit.php