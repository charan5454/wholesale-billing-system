Ú<?php
include '../config.php';
include '../includes/header.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $role = $_POST['role'];

    if (empty($username) || empty($email) || empty($password) || empty($role)) {
        $error = "All fields are required.";
    } else {
        // Check if email or username exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$email, $username]);
        
        if ($stmt->rowCount() > 0) {
            $error = "Username or Email already exists.";
        } else {
            // Hash password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$username, $email, $hashed_password, $role])) {
                $user_id = $pdo->lastInsertId();
                
                // Initialize profile based on role
                if ($role == 'seeker') {
                    $stmt = $pdo->prepare("INSERT INTO profiles (user_id, full_name) VALUES (?, ?)");
                    $stmt->execute([$user_id, $username]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO recruiter_profiles (user_id) VALUES (?)");
                    $stmt->execute([$user_id]);
                }

                $success = "Registration successful! You can now <a href='login.php'>Login</a>.";
            } else {
                $error = "Something went wrong. Please try again.";
            }
        }
    }
}
?>

<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card p-4">
            <h2 class="text-center mb-4">Register</h2>
            <?php if($error): ?>
                <div class="alert alert-danger"><?php echo $error; ?></div>
            <?php endif; ?>
            <?php if($success): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="mb-3">
                    <label>Username</label>
                    <input type="text" name="username" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Email</label>
                    <input type="email" name="email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Password</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>I am a:</label>
                    <select name="role" class="form-select">
                        <option value="seeker" <?php echo (isset($_GET['role']) && $_GET['role'] == 'seeker') ? 'selected' : ''; ?>>Job Seeker</option>
                        <option value="recruiter" <?php echo (isset($_GET['role']) && $_GET['role'] == 'recruiter') ? 'selected' : ''; ?>>Recruiter</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-100">Register</button>
            </form>
            <p class="mt-3 text-center">Already have an account? <a href="login.php">Login here</a></p>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
Ú*cascade082Efile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/auth/register.php