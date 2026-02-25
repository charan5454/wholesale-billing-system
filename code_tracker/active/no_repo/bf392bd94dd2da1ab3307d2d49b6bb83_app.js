Âædocument.addEventListener('DOMContentLoaded', () => {
    // Initialize Animations
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: true
    });

    VanillaTilt.init(document.querySelectorAll(".glass-card"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });

    // Create Background Floating Elements
    createFloatingOrbs();

    function createFloatingOrbs() {
        const bg = document.querySelector('.bg-gradient-custom');
        const colors = ['rgba(14, 165, 233, 0.2)', 'rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)'];
        for (let i = 0; i < 4; i++) {
            const orb = document.createElement('div');
            orb.className = 'floating-orb';
            orb.style.width = Math.random() * 300 + 200 + 'px';
            orb.style.height = orb.style.width;
            orb.style.background = colors[i % colors.length];
            orb.style.top = Math.random() * 80 + '%';
            orb.style.left = Math.random() * 80 + '%';
            orb.style.animationDelay = (Math.random() * 10) + 's';
            orb.style.animationDuration = (Math.random() * 20 + 20) + 's';
            bg.appendChild(orb);
        }
    }

    // Modal Objects
    const form = document.getElementById('calcForm');
    const typeSelect = document.getElementById('type');
    const compoundingGroup = document.getElementById('compoundingGroup');
    const resetBtn = document.getElementById('resetBtn');

    // Results Elements
    const resultsContent = document.getElementById('resultsContent');
    const initialState = document.getElementById('initialState');
    const resInterest = document.getElementById('resInterest');
    const resTotal = document.getElementById('resTotal');
    const resEMI = document.getElementById('resEMI');
    const emiResultBox = document.getElementById('emiResultBox');

    // Auth Elements
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const downloadPdf = document.getElementById('downloadPdf');
    const downloadBorrowerPdf = document.getElementById('downloadBorrowerPdf');
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');
    const authTitle = document.getElementById('authTitle');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');

    const navHistory = document.getElementById('nav-history');
    const navBorrowers = document.getElementById('nav-borrowers');
    let currentStatusFilter = 'all';

    const bId = document.getElementById('bId');
    const bSubmitBtn = document.getElementById('bSubmitBtn');
    const bCancelBtn = document.getElementById('bCancelBtn');

    // Borrower Elements
    const borrowerModal = new bootstrap.Modal(document.getElementById('borrowerModal'));
    const addBorrowerForm = document.getElementById('addBorrowerForm');
    const borrowerTable = document.querySelector('#borrowerTable tbody');

    // Chart Instance
    let currentBorrower = null;
    let growthChart = null;
    let currentUser = null; // Store JWT or User Object if logged in
    let isLoginMode = true;

    downloadBorrowerPdf.addEventListener('click', () => {
        if (!currentBorrower) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const diff = getPreciseDateDiff(currentBorrower.given_at, new Date());
        let totalMonths = diff.totalDays / 30;
        let pAmount = parseFloat(currentBorrower.amount);
        let rVal = parseFloat(currentBorrower.rate);
        if (currentBorrower.rate_unit === 'year') {
            rVal = rVal / 12;
        }
        let interest = (pAmount * rVal * totalMonths) / 100;
        let total = pAmount + interest;

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const bDateStr = new Date(currentBorrower.given_at).toDateString();
        const todayStr = new Date().toDateString();

        doc.setFontSize(22);
        doc.setTextColor(40, 44, 52);
        doc.text("Kanamoni's Interest Calculator", 20, 20);

        doc.setFontSize(16);
        doc.text("Borrower Settlement Report", 20, 35);

        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Borrower Name: ${currentBorrower.name}`, 20, 50);
        doc.text(`Village: ${currentBorrower.village || '-'}`, 20, 60);
        doc.text(`Age: ${currentBorrower.age || '-'}`, 20, 70);
        doc.text(`Date Range: ${bDateStr} to ${todayStr}`, 20, 80);
        doc.text(`Time Period: ${diff.years}y ${diff.months}m ${diff.days}d (${diff.totalDays} Days)`, 20, 90);

        doc.setFontSize(14);
        doc.text("Calculation Summary:", 20, 110);
        doc.setFontSize(12);
        doc.text(`Principal Amount: Rs. ${pAmount.toLocaleString()}`, 30, 120);
        doc.text(`Interest Rate: ${currentBorrower.rate} (${currentBorrower.rate_unit === 'month' ? 'Rs./Mo' : '%/Yr'})`, 30, 130);
        doc.text(`Total Interest: Rs. ${interest.toFixed(2)}`, 30, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text(`Net Total: Rs. ${total.toFixed(2)}`, 20, 160);

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Report generated on: ${new Date().toDateString()}`, 20, 280);

        const safeFilename = `${currentBorrower.name.replace(/[^a-zA-Z0-9 ]/g, "_")}_settlement.pdf`;
        doc.save(safeFilename);
    });

    // --- Calculator Logic ---

    // Toggle Compounding Frequency visibility based on type
    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'compound') {
            compoundingGroup.style.display = 'block';
        } else {
            compoundingGroup.style.display = 'none';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculate();
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        typeSelect.dispatchEvent(new Event('change'));
        showResults(false);
    });

    async function calculate() {
        // Inputs
        const type = typeSelect.value;
        const P = document.getElementById('principal').value;
        const R = document.getElementById('rate').value;
        const T = document.getElementById('time').value;
        const timeUnit = document.getElementById('timeUnit').value;
        const frequency = document.getElementById('frequency').value;
        const currencyKey = document.getElementById('currency').value;
        const rateUnit = document.getElementById('rateUnit').value;

        try {
            const res = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, principal: P, rate: R, time: T, timeUnit, frequency, currency: currencyKey, rateUnit })
            });

            if (!res.ok) throw new Error('Calculation failed');

            const data = await res.json();
            const { interest, total, emi, labels, chartData } = data;

            // Display Results
            resInterest.textContent = `${currencyKey}${interest.toFixed(2)}`;
            resTotal.textContent = `${currencyKey}${total.toFixed(2)}`;

            // Add Pulse Animation
            [resInterest, resTotal].forEach(el => {
                el.classList.remove('pulse-animation');
                void el.offsetWidth; // Trigger reflow
                el.classList.add('pulse-animation');
            });

            if (type === 'emi') {
                emiResultBox.style.display = 'block';
                resEMI.textContent = `${currencyKey}${emi.toFixed(2)}`;
            } else {
                emiResultBox.style.display = 'none';
            }

            showResults(true);
            renderChart(labels, chartData, type);
            saveHistory(type, P, R, T, { total, interest, emi }); // Save if logged in

        } catch (err) {
            console.error(err);
            alert('Error performing calculation. Please try again.');
        }
    }

    function showResults(show) {
        if (show) {
            initialState.classList.add('d-none');
            resultsContent.classList.remove('d-none');
        } else {
            initialState.classList.remove('d-none');
            resultsContent.classList.add('d-none');
        }
    }

    function renderChart(labels, data, type) {
        const ctx = document.getElementById('growthChart').getContext('2d');

        if (growthChart) {
            growthChart.destroy();
        }

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: type === 'emi' ? 'Loan Balance' : 'Investment Value',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: 'white' } }
                },
                scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });
    }

    // --- PDF Download ---
    document.getElementById('downloadPdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Interest Calculation Report", 20, 20);

        doc.setFontSize(12);
        doc.text(`Type: ${typeSelect.options[typeSelect.selectedIndex].text}`, 20, 40);
        doc.text(`Principal: ${document.getElementById('principal').value}`, 20, 50);
        const rateUnit = document.getElementById('rateUnit').value;
        const rateLabel = rateUnit === 'month' ? 'Rupees / Month' : '% / Yr';
        doc.text(`Rate: ${document.getElementById('rate').value} (${rateLabel})`, 20, 60);
        doc.text(`Time: ${document.getElementById('time').value} ${document.getElementById('timeUnit').value}`, 20, 70);

        doc.text("------------------------------------------------", 20, 80);
        doc.text(`Total Interest: ${resInterest.textContent.replace('â‚¹', 'Rs.')}`, 20, 90);
        doc.text(`Total Amount: ${resTotal.textContent.replace('â‚¹', 'Rs.')}`, 20, 100);
        if (typeSelect.value === 'emi') {
            doc.text(`Monthly EMI: ${resEMI.textContent.replace('â‚¹', 'Rs.')}`, 20, 110);
        }

        doc.save("calculation-report.pdf");
    });

    // --- Auth & API (Mock / Real) ---

    // Check if user is already logged in (check localStorage)
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        currentUser = true;
        updateAuthUI();
    }

    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        authTitle.textContent = isLoginMode ? 'Login' : 'Register';
        authForm.querySelector('button').textContent = isLoginMode ? 'Login' : 'Register';
        toggleAuth.textContent = isLoginMode ? "Don't have an account? Register" : "Already have an account? Login";
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('authUsername').value;
        const password = document.getElementById('authPassword').value;
        const endpoint = isLoginMode ? '/api/login' : '/api/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                if (isLoginMode) {
                    localStorage.setItem('token', data.token);
                    currentUser = true;
                    updateAuthUI();
                    loginModal.hide();
                } else {
                    alert('Registration successful! Please login.');
                    // Switch to login
                    toggleAuth.click();
                }
            } else {
                alert(data.error || 'Authentication failed');
            }
        } catch (err) {
            console.error(err);
            alert('Server error. Ensure backend is running.');
        }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        currentUser = null;
        updateAuthUI();
    });

    function updateAuthUI() {
        if (currentUser) {
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'block';
            if (navHistory) navHistory.style.display = 'block';
            navBorrowers.style.display = 'block';
        } else {
            btnLogin.style.display = 'block';
            btnLogout.style.display = 'none';
            if (navHistory) navHistory.style.display = 'none';
            navBorrowers.style.display = 'none';
        }
    }

    async function saveHistory(type, principal, rate, time, result) {
        if (!currentUser) return;

        try {
            await fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type, principal, rate, time, result })
            });
        } catch (err) {
            console.error('Failed to save history', err);
        }
    }

    // Fetch History
    if (navHistory) {
        navHistory.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
            historyModal.show();

            const tbody = document.querySelector('#historyTable tbody');
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

            try {
                const res = await fetch('/api/history', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();

                tbody.innerHTML = '';
                if (data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No history found</td></tr>';
                    return;
                }

                data.forEach(item => {
                    const row = `<tr>
                    <td>${new Date(item.created_at).toLocaleDateString()}</td>
                    <td>${item.type}</td>
                    <td>${item.principal}</td>
                    <td>${JSON.parse(item.result).total.toFixed(2)}</td>
                </tr>`;
                    tbody.innerHTML += row;
                });

            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load history</td></tr>';
            }
        });
    }

    // --- Borrower Logic ---

    navBorrowers.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        if (!currentUser) return;

        borrowerModal.show();
        loadBorrowers();
    });

    bCancelBtn.addEventListener('click', () => {
        cancelEdit();
    });

    function cancelEdit() {
        addBorrowerForm.reset();
        bId.value = '';
        bSubmitBtn.textContent = 'Add';
        bCancelBtn.classList.add('d-none');
        document.querySelector('#borrowerModal h6').innerHTML = '<i class="fas fa-user-plus me-2"></i>Add New Borrower';
    }

    window.editBorrower = (id, name, village, age, amount, rate, rateUnit, givenAt) => {
        bId.value = id;
        document.getElementById('bName').value = name;
        document.getElementById('bVillage').value = (village !== 'undefined' && village !== 'null') ? village : '';
        document.getElementById('bAge').value = (age !== 'undefined' && age !== 'null') ? age : '';
        document.getElementById('bAmount').value = amount;
        document.getElementById('bRate').value = rate;
        document.getElementById('bRateUnit').value = rateUnit;

        const date = new Date(givenAt);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('bDate').value = formattedDate;

        bSubmitBtn.textContent = 'Update';
        bCancelBtn.classList.remove('d-none');
        document.querySelector('#borrowerModal h6').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Borrower';
    };

    addBorrowerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addBorrowerForm);
        const id = bId.value;
        const url = id ? `/api/borrowers/${id}` : '/api/borrowers';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (res.ok) {
                alert(id ? 'Borrower updated!' : 'Borrower added!');
                cancelEdit();
                loadBorrowers();
            } else {
                const data = await res.json();
                alert(data.error || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
        }
    });

    function getPreciseDateDiff(startDate, endDate) {
        let start = new Date(startDate);
        let end = new Date(endDate);

        // 30/360 Day Count Convention (Standard for Local Finance/Vaddi)
        // Treats every month as 30 days.
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        // Calculate total days using the convention
        const totalDays = (years * 360) + (months * 30) + days;

        // For display purposes (Years, Months, Days)
        let displayYears = years;
        let displayMonths = months;
        let displayDays = days;

        if (displayDays < 0) {
            displayMonths -= 1;
            displayDays += 30; // Standard 30 days
        }
        if (displayMonths < 0) {
            displayYears -= 1;
            displayMonths += 12;
        }

        return { years: displayYears, months: displayMonths, days: displayDays, totalDays };
    }

    // Status Filtering Logic
    document.querySelectorAll('.status-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const status = e.target.getAttribute('data-status');
            currentStatusFilter = status;

            // Update the filter button text to show current selection
            const btnText = status === 'all' ? 'ALL' : (status === 'repaid' ? 'YES (Repaid)' : 'NO (Not Repaid)');
            document.getElementById('statusFilterBtn').innerHTML = `<i class="fas fa-filter me-1"></i>Status: ${btnText}`;

            loadBorrowers();
        });
    });

    window.toggleBorrowerStatus = async (id, isRepaid) => {
        try {
            const res = await fetch(`/api/borrowers/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ isRepaid })
            });
            if (res.ok) {
                loadBorrowers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    async function loadBorrowers() {
        borrowerTable.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
        try {
            const res = await fetch('/api/borrowers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                currentUser = null;
                updateAuthUI();
                borrowerTable.innerHTML = '<tr><td colspan="7" class="text-center text-warning">Session expired. Please login again.</td></tr>';
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Server error');
            }

            const data = await res.json();
            borrowerTable.innerHTML = '';
            if (data.length === 0) {
                borrowerTable.innerHTML = '<tr><td colspan="8" class="text-center">No borrowers found</td></tr>';
                return;
            }

            if (data.error) throw new Error(data.error);

            // Apply filtering
            const filteredData = data.filter(b => {
                if (currentStatusFilter === 'all') return true;
                if (currentStatusFilter === 'repaid') return b.is_repaid === true;
                if (currentStatusFilter === 'unpaid') return b.is_repaid === false;
                return true;
            });

            if (filteredData.length === 0) {
                borrowerTable.innerHTML = '<tr><td colspan="8" class="text-center">No borrowers match this filter</td></tr>';
                return;
            }

            filteredData.forEach(b => {
                // Use a more verbose date to avoid confusion
                const dateObj = new Date(b.given_at);
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                const displayDate = dateObj.toLocaleDateString(undefined, options);

                const row = document.createElement('tr');
                row.style.cursor = 'pointer';
                row.innerHTML = `
                    <td>${b.name}</td>
                    <td>${b.village || '-'}</td>
                    <td>${b.age || '-'}</td>
                    <td>â‚¹${parseFloat(b.amount).toLocaleString()}</td>
                    <td>${b.rate} (${b.rate_unit === 'month' ? 'â‚¹/Mo' : '%/Yr'})</td>
                    <td>${displayDate}</td>
                    <td class="text-center d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-info calc-btn" title="Calculate"><i class="fas fa-calculator"></i></button>
                        <button class="btn btn-sm btn-warning edit-btn" title="Edit" onclick="event.stopPropagation(); editBorrower('${b.id}', '${(b.name || '').replace(/'/g, "\\'")}', '${(b.village || '').replace(/'/g, "\\'")}', '${b.age || ''}', '${b.amount}', '${b.rate}', '${b.rate_unit}', '${b.given_at}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                    <td>
                        <select class="form-select form-select-sm bg-dark-input text-white border-0" 
                                onclick="event.stopPropagation();" 
                                onchange="toggleBorrowerStatus('${b.id}', this.value === 'yes')">
                            <option value="no" ${!b.is_repaid ? 'selected' : ''}>NO</option>
                            <option value="yes" ${b.is_repaid ? 'selected' : ''}>YES</option>
                        </select>
                    </td>
                `;
                row.addEventListener('click', () => populateCalculator(b));
                borrowerTable.appendChild(row);
            });

        } catch (err) {
            console.error('Load Borrowers Error:', err);
            borrowerTable.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load: ${err.message}</td></tr>`;
        }
    }

    function populateCalculator(borrower) {
        currentBorrower = borrower;
        const resArea = document.getElementById('borrowerCalcResult');
        const bResTime = document.getElementById('bResTime');
        const bResPrincipal = document.getElementById('bResPrincipal');
        const bResInterest = document.getElementById('bResInterest');
        const bResTotal = document.getElementById('bResTotal');
        const bEvidencePreview = document.getElementById('bEvidencePreview');
        const bEvidenceImg = document.getElementById('bEvidenceImg');

        // Results Area
        resArea.classList.remove('d-none');

        // Handle Evidence Display
        if (borrower.evidence_path) {
            bEvidencePreview.classList.remove('d-none');
            bEvidenceImg.src = '/' + borrower.evidence_path;
            bEvidenceImg.onclick = () => window.open('/' + borrower.evidence_path, '_blank');
        } else {
            bEvidencePreview.classList.add('d-none');
        }

        // Fill Main Form (Optional but helpful)
        document.getElementById('principal').value = borrower.amount;
        document.getElementById('rate').value = borrower.rate;
        document.getElementById('rateUnit').value = borrower.rate_unit;
        document.getElementById('currency').value = 'â‚¹';

        // Result Label
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const bDateStr = new Date(borrower.given_at).toLocaleDateString(undefined, options);
        const todayStr = new Date().toLocaleDateString(undefined, options);

        document.querySelector('#borrowerCalcResult h5').innerHTML =
            `<i class="fas fa-file-invoice-dollar me-2"></i>Settlement for ${borrower.name} <br>
             <span style="font-size: 0.8rem; opacity: 0.8;">(${bDateStr} to ${todayStr})</span>`;

        // Calculate Precise Time Difference
        const diff = getPreciseDateDiff(borrower.given_at, new Date());
        let timeStr = "";
        if (diff.years > 0) timeStr += `${diff.years}y `;
        if (diff.months > 0) timeStr += `${diff.months}m `;
        timeStr += `${diff.days}d (${diff.totalDays} days)`;
        bResTime.textContent = timeStr;

        // Interest Calculation Logic
        // Local standard: Interest = (Principal * Rate * totalMonths) / 100
        // We use totalDays / 30 for the most consistent "monthly" calculation
        let P = parseFloat(borrower.amount);
        let R = parseFloat(borrower.rate);
        let totalMonths = diff.totalDays / 30;

        // If rate is per year, convert to monthly for the formula
        if (borrower.rate_unit === 'year') {
            R = R / 12;
        }

        let interest = (P * R * totalMonths) / 100;
        let total = P + interest;

        // Update UI
        bResPrincipal.textContent = `â‚¹${P.toLocaleString()}`;
        bResInterest.textContent = `â‚¹${interest.toFixed(2)}`;
        bResTotal.textContent = `â‚¹${total.toFixed(2)}`;

        // Also update the main calculator inputs just in case they want to play with it
        document.getElementById('time').value = totalMonths.toFixed(2);
        document.getElementById('timeUnit').value = 'months';
        typeSelect.value = 'simple';
        typeSelect.dispatchEvent(new Event('change'));

        // Scroll to the result
        resArea.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.error('Service Worker registration failed', err));
        });
    }

    // Auto-close bootstrap navbar on mobile when a link is clicked
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const menuToggle = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });

    navLinks.forEach((l) => {
        l.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                bsCollapse.hide();
            }
        });
    });

});
> *cascade08>Z*cascade08Z[ *cascade08[…*cascade08…Œ *cascade08Œ„
*cascade08„
 *cascade08¡*cascade08¡È *cascade08ÈÔ *cascade08Ô„ *cascade08„Î *cascade08Îô *cascade08ôú *cascade08ú«*cascade08«© *cascade08©È *cascade08Èé*cascade08éæ *cascade08æ+ *cascade08++*cascade08+Ÿ+ *cascade08Ÿ+ +*cascade08 +Â+ *cascade08Â+Ã+*cascade08Ã+Ä+ *cascade08Ä+È+*cascade08È+Ê+ *cascade08Ê+Ë+*cascade08Ë+Ì+ *cascade08Ì+×+*cascade08×+î+ *cascade08î+,*cascade08,, *cascade08,¾,*cascade08¾,È, *cascade08È,½1 *cascade08½1Ã1*cascade08Ã1—3 *cascade08—3›3*cascade08›3œ4 *cascade08œ44*cascade084Ÿ4 *cascade08Ÿ4¢4*cascade08¢4Á4 *cascade08Á4Â4*cascade08Â4Ã4 *cascade08Ã4Æ4*cascade08Æ4ë4 *cascade08ë4ì4*cascade08ì4Š5 *cascade08Š55*cascade0855 *cascade085â5*cascade08â5ä5*cascade08ä5í5 *cascade08í5ï5*cascade08ï5ğ5 *cascade08ğ5ñ5*cascade08ñ5ÿ5 *cascade08ÿ56*cascade086‚6 *cascade08‚6ƒ6*cascade08ƒ6„6 *cascade08„6…6*cascade08…6Œ6 *cascade08Œ66*cascade0866 *cascade0866*cascade086•6 *cascade08•6–6*cascade08–6—6 *cascade08—6™6*cascade08™6œ6 *cascade08œ66*cascade086Ÿ6 *cascade08Ÿ6¡6*cascade08¡6¢6 *cascade08¢6£6*cascade08£6¥6 *cascade08¥6§6*cascade08§6©6 *cascade08©6ª6*cascade08ª6¼6 *cascade08¼6½6*cascade08½6¿6 *cascade08¿6Ã6*cascade08Ã6Å6 *cascade08Å6É6*cascade08É6Ê6 *cascade08Ê6Ë6*cascade08Ë6ß6 *cascade08ß6á6*cascade08á6ä6 *cascade08ä6å6*cascade08å6æ6 *cascade08æ6ç6*cascade08ç6è6 *cascade08è6ê6*cascade08ê6í6 *cascade08í6î6*cascade08î6ğ6 *cascade08ğ6ò6*cascade08ò6ó6 *cascade08ó6ô6*cascade08ô6õ6 *cascade08õ6÷6*cascade08÷6ø6 *cascade08ø6ş6*cascade08ş6ÿ6 *cascade08ÿ6‚7*cascade08‚7„7 *cascade08„7†7*cascade08†7‰7 *cascade08‰7Š7*cascade08Š7‹7 *cascade08‹77*cascade087Ÿ7 *cascade08Ÿ7 7*cascade08 7¡7 *cascade08¡7¢7*cascade08¢7£7 *cascade08£7¤7*cascade08¤7¥7 *cascade08¥7©7*cascade08©7ª7 *cascade08ª7³7*cascade08³7´7 *cascade08´7µ7*cascade08µ7¸7 *cascade08¸7¹7*cascade08¹7¼7 *cascade08¼7¿7*cascade08¿7À7 *cascade08À7Â7*cascade08Â7Ã7 *cascade08Ã7Æ7*cascade08Æ7Ç7 *cascade08Ç7É7*cascade08É7Ê7 *cascade08Ê7Ë7*cascade08Ë7Î7 *cascade08Î7Ñ7*cascade08Ñ7Ô7 *cascade08Ô7Ø7*cascade08Ø7Ù7 *cascade08Ù7Û7*cascade08Û7ß7 *cascade08ß7á7*cascade08á7ä7 *cascade08ä7ç7*cascade08ç7é7 *cascade08é7ë7*cascade08ë7í7 *cascade08í7ğ7*cascade08ğ7ò7 *cascade08ò7ó7*cascade08ó7ô7 *cascade08ô7ö7*cascade08ö7ø7 *cascade08ø7ú7*cascade08ú7ü7 *cascade08ü7ı7*cascade08ı7ş7 *cascade08ş7ÿ7*cascade08ÿ7‚8 *cascade08‚8„8*cascade08„8…8 *cascade08…8†8*cascade08†88*cascade088‘8 *cascade08‘8“8*cascade08“8¡8 *cascade08¡8¢8*cascade08¢8´8 *cascade08´8¶8*cascade08¶8·8 *cascade08·8º8*cascade08º8¼8 *cascade08¼8½8*cascade08½8¾8 *cascade08¾8À8*cascade08À8Â8 *cascade08Â8Ã8*cascade08Ã8É8 *cascade08É8Ê8*cascade08Ê8Ë8 *cascade08Ë8Í8*cascade08Í8Ñ8 *cascade08Ñ8Ô8*cascade08Ô8Õ8 *cascade08Õ8Ù8*cascade08Ù8Ş8 *cascade08Ş8à8*cascade08à8á8 *cascade08á8å8*cascade08å8æ8 *cascade08æ8ç8*cascade08ç8ı8 *cascade08ı8ÿ8*cascade08ÿ8€9 *cascade08€99*cascade089…9 *cascade08…9†9*cascade08†9‡9 *cascade08‡9‰9*cascade08‰9Š9 *cascade08Š99*cascade089’9 *cascade08’9”9*cascade08”9©9 *cascade08©9ª9*cascade08ª9³9 *cascade08³9¶9*cascade08¶9º9 *cascade08º9»9*cascade08»9¾9 *cascade08¾9À9*cascade08À9Ç9 *cascade08Ç9È9*cascade08È9Ó9 *cascade08Ó9Ø9*cascade08Ø9Ù9 *cascade08Ù9Ú9*cascade08Ú9ˆ: *cascade08ˆ:Œ:*cascade08Œ:×: *cascade08×:Û:*cascade08Û:•; *cascade08•;¨=*cascade08¨=­= *cascade08­=®=*cascade08®=¶= *cascade08¶=¹=*cascade08¹=Ğ= *cascade08Ğ=Ô=*cascade08Ô=‡> *cascade08‡>‰>*cascade08‰>•> *cascade08•>—>*cascade08—>Ø> *cascade08Ø>Ü>*cascade08Ü>æ> *cascade08æ>é>*cascade08é>õ> *cascade08õ>ö>*cascade08ö>¤? *cascade08¤?¨?*cascade08¨?­? *cascade08­?±?*cascade08±?Õ? *cascade08Õ?Ù?*cascade08Ù?€@ *cascade08€@„@*cascade08„@Ö@ *cascade08Ö@äA*cascade08äA¿Q *cascade08¿QÓR*cascade08ÓR‹S *cascade08‹SšS*cascade08šS­U *cascade08­UÃU*cascade08ÃU‡V *cascade08‡VV*cascade08VW *cascade08W¤W*cascade08¤WÉi *cascade08ÉiÙi*cascade08Ùi†j *cascade08†j¹j*cascade08¹j­k *cascade08­k½k*cascade08½kÇk *cascade08Çkùk*cascade08ùk‰q *cascade08‰q¤q*cascade08¤qáq *cascade08áqåq*cascade08åqúq *cascade08úqüq*cascade08üq„r *cascade08„r†r*cascade08†r£r *cascade08£r§r*cascade08§r‹s *cascade08‹ss*cascade08s§s *cascade08§sªs*cascade08ªs²s *cascade08²s³s*cascade08³sñs *cascade08ñsõs*cascade08õsÒt *cascade08ÒtÓt*cascade08ÓtÛt *cascade08ÛtŞt*cascade08Ştåt *cascade08åtét*cascade08ét u *cascade08 u¤u*cascade08¤uıu *cascade08ıuÿu*cascade08ÿu‹v *cascade08‹vv*cascade08v’v *cascade08’v–v*cascade08–vĞv *cascade08ĞvÔv*cascade08Ôvëv *cascade08ëvîv*cascade08îvúv *cascade08úvûv*cascade08ûv•w *cascade08•w™w*cascade08™w’x *cascade08’x–x*cascade08–xŸx *cascade08Ÿx£x*cascade08£xÀx *cascade08ÀxÄx*cascade08ÄxÜx *cascade08Üxàx*cascade08àx‘{ *cascade08‘{•{*cascade08•{Ê{ *cascade08Ê{Î{*cascade08Î{Õ{ *cascade08Õ{Ù{*cascade08Ù{ò{ *cascade08ò{ö{*cascade08ö{õ| *cascade08õ|ù|*cascade08ù|ü| *cascade08ü|ş|*cascade08ş|‚} *cascade08‚}„}*cascade08„}‰} *cascade08‰}}*cascade08}’}*cascade08’}µ} *cascade08µ}·}*cascade08·}~ *cascade08~“~*cascade08“~¶~ *cascade08¶~Û~ *cascade08Û~Œ *cascade08Œ *cascade08› *cascade08›É *cascade08ÉÉ*cascade08É×‰ *cascade08×‰ç*cascade08çğ *cascade08ğ©‘ *cascade08©‘«‘*cascade08«‘Õ‘ *cascade08Õ‘ï‘ *cascade08ï‘€’ *cascade08€’ˆ’*cascade08ˆ’‰’ *cascade08‰’’*cascade08’’ *cascade08’’*cascade08’‘’ *cascade08‘’’’*cascade08’’“’ *cascade08“’—’*cascade08—’˜’ *cascade08˜’™’*cascade08™’š’ *cascade08š’’*cascade08’ ’ *cascade08 ’¡’*cascade08¡’£’ *cascade08£’¥’*cascade08¥’¦’ *cascade08¦’¬’*cascade08¬’¯’ *cascade08¯’³’*cascade08³’·’ *cascade08·’¹’*cascade08¹’º’ *cascade08º’¾’*cascade08¾’À’ *cascade08À’Ã’*cascade08Ã’È’ *cascade08È’Ê’*cascade08Ê’Ë’ *cascade08Ë’Ï’*cascade08Ï’Ò’ *cascade08Ò’×’*cascade08×’Ø’ *cascade08Ø’Ù’*cascade08Ù’ß’ *cascade08ß’à’*cascade08à’á’ *cascade08á’ã’*cascade08ã’ä’ *cascade08ä’å’*cascade08å’ç’ *cascade08ç’é’*cascade08é’©“ *cascade08©“«“*cascade08«“â“ *cascade08â“ä“ *cascade08ä“” *cascade08”¡” *cascade08¡”£”*cascade08£”¤” *cascade08¤”´”*cascade08´”¹” *cascade08¹”¾”*cascade08¾”¿” *cascade08¿”Â”*cascade08Â”Ã” *cascade08Ã”Í”*cascade08Í”×” *cascade08×”Ü”*cascade08Ü”İ” *cascade08İ”æ”*cascade08æ”ç” *cascade08ç”è”*cascade08è”é” *cascade08é”ï”*cascade08ï”ğ” *cascade08ğ”ú”*cascade08ú”• *cascade08•‚•*cascade08‚•ƒ• *cascade08ƒ••*cascade08•• *cascade08••*cascade08•’• *cascade08’••• *cascade08••š• *cascade08š•œ•*cascade08œ•• *cascade08• •*cascade08 •¡• *cascade08¡•¨•*cascade08¨•©• *cascade08©•±•*cascade08±•²• *cascade08²•´•*cascade08´•µ• *cascade08µ•½•*cascade08½•¾• *cascade08¾•Á•*cascade08Á•Â• *cascade08Â•Ã•*cascade08Ã•Ä• *cascade08Ä•Å•*cascade08Å•Æ• *cascade08Æ•Ï• *cascade08Ï•Ñ• *cascade08Ñ•Ó• *cascade08Ó•Ô• *cascade08Ô•Ú•*cascade08Ú•Ü• *cascade08Ü•ß•*cascade08ß•à• *cascade08à•å•*cascade08å•æ• *cascade08æ•ó• *cascade08ó•ô•*cascade08ô•ÿ• *cascade08ÿ•„– *cascade08„–…–*cascade08…–ˆ– *cascade08ˆ–Š–*cascade08Š–‹– *cascade08‹–š– *cascade08š–›– *cascade08›–œ–*cascade08œ–– *cascade08–¤–*cascade08¤–¦– *cascade08¦–¿– *cascade08¿–Á– *cascade08Á–Ä–*cascade08Ä–Æ– *cascade08Æ–Ï–*cascade08Ï–Ğ– *cascade08Ğ–Ô– *cascade08Ô–Ø–*cascade08Ø–à– *cascade08à–á– *cascade08á–ç–*cascade08ç–ì– *cascade08ì–í–*cascade08í–î– *cascade08î–ò–*cascade08ò–ı– *cascade08ı–—*cascade08—‚— *cascade08‚—‰—*cascade08‰—— *cascade08—œ—*cascade08œ—— *cascade08—¤—*cascade08¤—¦— *cascade08¦—§—*cascade08§—©— *cascade08©—«—*cascade08«—À— *cascade08À—È—*cascade08È—ß— *cascade08ß—â— *cascade08â—è—*cascade08è—é— *cascade08é—ê—*cascade08ê—˜ *cascade08˜‚˜*cascade08‚˜Š˜*cascade08Š˜¥˜ *cascade08¥˜§˜ *cascade08§˜»˜ *cascade08»˜É˜*cascade08É˜Ñ˜ *cascade08Ñ˜à˜*cascade08à˜ã˜ *cascade08ã˜ğ˜*cascade08ğ˜û˜*cascade08û˜ƒ™ *cascade08ƒ™†™*cascade08†™™ *cascade08™Ëš *cascade08Ëš›*cascade08›¢› *cascade08¢›Á›*cascade08Á›Â› *cascade08Â›Ã›*cascade08Ã›Ä› *cascade08Ä›Å›*cascade08Å›Æ› *cascade08Æ›Ê›*cascade08Ê›Ì› *cascade08Ì›Ğ›*cascade08Ğ›Ò› *cascade08Ò›Õ›*cascade08Õ›Ö› *cascade08Ö›ä›*cascade08ä›å› *cascade08å›ğ›*cascade08ğ›ñ› *cascade08ñ›‡œ*cascade08‡œ‰œ *cascade08‰œ‹œ*cascade08‹œŒœ *cascade08Œœ¬œ*cascade08¬œ­œ *cascade08­œ¸œ*cascade08¸œ¹œ *cascade08¹œ¾œ*cascade08¾œ¿œ *cascade08¿œÌœ*cascade08ÌœÍœ *cascade08ÍœÛœ*cascade08ÛœÜœ *cascade08Üœàœ*cascade08àœáœ *cascade08áœ*cascade08” *cascade08”*cascade08Ÿ *cascade08Ÿâ*cascade08âã *cascade08ãå*cascade08åõ£ *cascade08õ£—¤ *cascade08—¤š¤ *cascade08š¤¤*cascade08¤Ë¤ *cascade08Ë¤Ì¤*cascade08Ì¤ú¤ *cascade08ú¤ş¤*cascade08ş¤‚¥ *cascade08‚¥‰¥ *cascade08‰¥‘¥ *cascade08‘¥•¥*cascade08•¥Â¥ *cascade08Â¥Æ¥*cascade08Æ¥Ò¥ *cascade08Ò¥£¦ *cascade08£¦§¦*cascade08§¦¬¦ *cascade08¬¦¸¦ *cascade08¸¦º¦ *cascade08º¦ë¦ *cascade08ë¦ï¦*cascade08ï¦­§ *cascade08­§®§ *cascade08®§š© *cascade08š©›©*cascade08›© © *cascade08 ©¤©*cascade08¤©¼© *cascade08¼©½© *cascade08½©·ª *cascade08·ª¹ª *cascade08¹ªºª*cascade08ºªÂª *cascade08ÂªÃª *cascade08Ãªçª *cascade08çªëª*cascade08ëªïª*cascade08ïª« *cascade08««*cascade08««*cascade08«˜« *cascade08˜«š« *cascade08š«´« *cascade08´«·« *cascade08·«»«*cascade08»«ğ« *cascade08ğ«ñ«*cascade08ñ«³¬ *cascade08³¬·¬*cascade08·¬Æ¬ *cascade08Æ¬Ê¬*cascade08Ê¬Ì¬*cascade08Ì¬Ñ¬ *cascade08Ñ¬Õ¬*cascade08Õ¬­ *cascade08­­*cascade08­—­ *cascade08—­™­*cascade08™­Æ­*cascade08Æ­Ç­ *cascade08Ç­é±*cascade08é±ı± *cascade08ı±€² *cascade08€²Œ² *cascade08Œ²² *cascade08²±²*cascade08±²´² *cascade08´²¶²*cascade08¶²·² *cascade08·²Ê²*cascade08Ê²Ë² *cascade08Ë²Î² *cascade08Î²Ï² *cascade08Ï²Ó²*cascade08Ó²Ö² *cascade08Ö²Ù²*cascade08Ù²ğ² *cascade08ğ²É³ *cascade08É³Ê³ *cascade08Ê³ô³ *cascade08ô³ˆ´ *cascade08ˆ´š´*cascade08š´´ *cascade08´ ´*cascade08 ´«´ *cascade08«´¬´*cascade08¬´°´*cascade08°´Û´ *cascade08Û´İ´*cascade08İ´é´ *cascade08é´ë´ *cascade08ë´Šµ *cascade08Šµµ *cascade08µ‘µ*cascade08‘µÍ¶ *cascade08Í¶Ğ¶*cascade08Ğ¶Ò¶ *cascade08Ò¶İ¶*cascade08İ¶å¶ *cascade08å¶÷¶*cascade08÷¶ò· *cascade08ò·ó·*cascade08ó·ô· *cascade08ô·ù·*cascade08ù·œ¸ *cascade08œ¸¯¸ *cascade08¯¸Ó¸*cascade08Ó¸Ô¸ *cascade08Ô¸Õ¸ *cascade08Õ¸ï¸*cascade08ï¸›¹ *cascade08›¹­¹*cascade08­¹Ø¹ *cascade08Ø¹ìº *cascade08ìºíº*cascade08íºóº *cascade08óºúº*cascade08úºÈ» *cascade08È»Î»*cascade08Î»í¼ *cascade08í¼‘Á*cascade08‘Á¨Á *cascade08¨ÁÁÁ *cascade08ÁÁœÂ *cascade08œÂÇÂ *cascade08ÇÂËÂ*cascade08ËÂÍÂ *cascade08ÍÂÔÂ *cascade08ÔÂÖÂ *cascade08ÖÂÙÂ*cascade08ÙÂÜÂ*cascade08ÜÂíÂ *cascade08íÂîÂ *cascade08îÂòÂ*cascade08òÂùÂ *cascade08ùÂ³Ã *cascade08³ÃÍÃ *cascade08ÍÃÎÃ*cascade08ÎÃÄ *cascade08Ä‘Ä*cascade08‘Ä’Ä *cascade08’Ä”Ä*cascade08”Ä•Ä *cascade08•ÄœÄ*cascade08œÄÄ *cascade08ÄÄ*cascade08ÄŸÄ *cascade08ŸÄ Ä*cascade08 ÄªÄ *cascade08ªÄ«Ä*cascade08«Ä®Ä *cascade08®Ä¯Ä*cascade08¯Ä³Ä*cascade08³Ä¹Ä *cascade08¹ÄºÄ *cascade08ºÄ½Ä *cascade08½ÄÂÄ *cascade08ÂÄÆÄ*cascade08ÆÄïÄ *cascade08ïÄñÄ*cascade08ñÄòÄ*cascade08òÄöÄ *cascade08öÄ÷Ä *cascade08÷ÄøÄ*cascade08øÄùÄ *cascade08ùÄıÄ*cascade08ıÄşÄ *cascade08şÄ†Å*cascade08†Å‡Å *cascade08‡Å‹Å*cascade08‹ÅŒÅ *cascade08ŒÅÅ*cascade08ÅÅ *cascade08Å’Å*cascade08’Å”Å *cascade08”Å—Å *cascade08—ÅÅ *cascade08ÅÅ *cascade08ÅŸÅ*cascade08ŸÅ Å *cascade08 Å£Å*cascade08£Å¤Å *cascade08¤Å«Å*cascade08«Å¬Å *cascade08¬Å°Å*cascade08°Å±Å *cascade08±ÅÆÅ*cascade08ÆÅÇÅ *cascade08ÇÅÎÅ*cascade08ÎÅĞÅ *cascade08ĞÅÚÅ*cascade08ÚÅÜÅ *cascade08ÜÅİÅ*cascade08İÅáÅ*cascade08áÅäÅ *cascade08äÅêÅ*cascade08êÅëÅ *cascade08ëÅöÅ*cascade08öÅ÷Å *cascade08÷Å¢Æ *cascade08¢Æ£Æ*cascade08£Æ®Æ *cascade08®Æ¯Æ *cascade08¯Æ×Æ*cascade08×ÆØÆ *cascade08ØÆíÆ *cascade08íÆîÆ *cascade08îÆùÆ*cascade08ùÆûÆ *cascade08ûÆ‚Ç*cascade08‚ÇƒÇ *cascade08ƒÇ—Ç*cascade08—Ç˜Ç *cascade08˜Ç«Ç *cascade08«Ç­Ç*cascade08­ÇÀÇ *cascade08ÀÇÂÇ *cascade08ÂÇÍÇ*cascade08ÍÇÎÇ *cascade08ÎÇìÇ *cascade08ìÇíÇ *cascade08íÇ‹É *cascade08‹ÉŒÉ *cascade08ŒÉ›É *cascade08›ÉÉ *cascade08ÉŸÉ *cascade08ŸÉ³É *cascade08³É´É *cascade08´É¼É*cascade08¼É¾É *cascade08¾ÉÆÉ*cascade08ÆÉÈÉ *cascade08ÈÉĞÉ *cascade08ĞÉÔÉ*cascade08ÔÉğÉ *cascade08ğÉóÉ*cascade08óÉ—Ê *cascade08—ÊšÊ *cascade08šÊÚÊ *cascade08ÚÊİÊ*cascade08İÊŠÌ *cascade08ŠÌŒÌ*cascade08ŒÌ½Ì *cascade08½Ì¿Ì *cascade08¿ÌÀÌ *cascade08ÀÌÄÌ *cascade08ÄÌÇÌ *cascade08ÇÌÉÌ*cascade08ÉÌÌÌ*cascade08ÌÌÔÌ *cascade08ÔÌÙÌ*cascade08ÙÌİÌ *cascade08İÌôÌ*cascade08ôÌöÌ *cascade08öÌùÌ *cascade08ùÌıÌ *cascade08ıÌşÌ*cascade08şÌ½Í *cascade08½Í¿Í *cascade08¿ÍÃÍ *cascade08ÃÍÄÍ*cascade08ÄÍÅÍ *cascade08ÅÍıÍ *cascade08ıÍşÍ *cascade08şÍ‚Î *cascade08‚Î…Î*cascade08…ÎÆÎ *cascade08ÆÎÍÎ *cascade08ÍÎÎÎ*cascade08ÎÎÿÎ *cascade08ÿÎ£Ï *cascade08£Ï¥Ï*cascade08¥ÏëÏ *cascade08ëÏìÏ *cascade08ìÏŸÑ *cascade08ŸÑ Ñ *cascade08 ÑŞÑ *cascade08ŞÑàÑ *cascade08àÑ Ó *cascade08 Ó£Ó *cascade08£Ó¥Ó *cascade08¥Ó¦Ó*cascade08¦Ó©Ó*cascade08©Ó­Ó *cascade08­ÓºÓ *cascade08ºÓÂÓ*cascade08ÂÓÓÓ *cascade08ÓÓ×Ó*cascade08×ÓáÓ *cascade08áÓâÓ*cascade08âÓãÓ *cascade08ãÓåÓ*cascade08åÓèÓ *cascade08èÓíÓ*cascade08íÓîÓ *cascade08îÓòÓ*cascade08òÓöÓ *cascade08öÓúÓ*cascade08úÓŒÔ *cascade08ŒÔ˜Ô*cascade08˜ÔœÔ *cascade08œÔŸÔ *cascade08ŸÔ£Ô *cascade08£Ô¤Ô *cascade08¤Ô¦Ô*cascade08¦Ô©Ô *cascade08©Ô½Ô *cascade08½Ô¿Ô*cascade08¿ÔÃÔ *cascade08ÃÔÄÔ *cascade08ÄÔÊÔ*cascade08ÊÔËÔ *cascade08ËÔÏÔ*cascade08ÏÔĞÔ *cascade08ĞÔÜÔ*cascade08ÜÔŞÔ *cascade08ŞÔçÔ*cascade08çÔèÔ *cascade08èÔíÔ*cascade08íÔîÔ *cascade08îÔïÔ*cascade08ïÔöÔ *cascade08öÔúÔ*cascade08úÔ„Õ*cascade08„Õ†Õ *cascade08†ÕˆÕ*cascade08ˆÕ‰Õ *cascade08‰ÕÕ*cascade08ÕÕ *cascade08Õ–Õ*cascade08–Õ—Õ *cascade08—ÕÕ*cascade08Õ¡Õ *cascade08¡Õ¸Õ *cascade08¸Õ»Õ *cascade08»Õ¾Õ*cascade08¾Õ¿Õ *cascade08¿ÕÀÕ*cascade08ÀÕÂÕ *cascade08ÂÕÉÕ*cascade08ÉÕÊÕ *cascade08ÊÕËÕ*cascade08ËÕÌÕ *cascade08ÌÕĞÕ *cascade08ĞÕéÕ*cascade08éÕíÕ *cascade08íÕïÕ*cascade08ïÕõÕ *cascade08õÕöÕ *cascade08öÕøÕ*cascade08øÕùÕ *cascade08ùÕşÕ*cascade08şÕÿÕ *cascade08ÿÕƒÖ*cascade08ƒÖ„Ö *cascade08„Ö˜Ö *cascade08˜ÖÖ *cascade08Ö Ö *cascade08 ÖºÖ *cascade08ºÖ¼Ö *cascade08¼Ö½Ö *cascade08½ÖÄÖ *cascade08ÄÖÇÖ*cascade08ÇÖÊÖ *cascade08ÊÖÑÖ*cascade08ÑÖÓÖ *cascade08ÓÖÔÖ *cascade08ÔÖÕÖ*cascade08ÕÖÖÖ *cascade08ÖÖØÖ *cascade08ØÖÙÖ*cascade08ÙÖÚÖ *cascade08ÚÖÜÖ*cascade08ÜÖŞÖ *cascade08ŞÖßÖ *cascade08ßÖâÖ*cascade08âÖãÖ *cascade08ãÖäÖ*cascade08äÖåÖ *cascade08åÖèÖ*cascade08èÖêÖ *cascade08êÖíÖ*cascade08íÖîÖ *cascade08îÖïÖ*cascade08ïÖóÖ *cascade08óÖöÖ*cascade08öÖùÖ *cascade08ùÖÿÖ*cascade08ÿÖ„× *cascade08„×…× *cascade08…×‹×*cascade08‹×× *cascade08××*cascade08×”×*cascade08”×•× *cascade08•×˜× *cascade08˜× ×*cascade08 ×¡× *cascade08¡×¢× *cascade08¢×§×*cascade08§×¨× *cascade08¨×©× *cascade08©×ª×*cascade08ª×«× *cascade08«×°×*cascade08°×²× *cascade08²×µ×*cascade08µ×¶× *cascade08¶×º×*cascade08º×»× *cascade08»×Å×*cascade08Å×Æ× *cascade08Æ×È×*cascade08È×Ê× *cascade08Ê×Ë× *cascade08Ë×Ì× *cascade08Ì×Ï×*cascade08Ï×Ğ× *cascade08Ğ×Ö×*cascade08Ö××× *cascade08××Û×*cascade08Û×ä× *cascade08ä×å× *cascade08å×ë× *cascade08ë×í× *cascade08í×õ×*cascade08õ×÷× *cascade08÷×€Ø*cascade08€ØØ *cascade08Ø’Ø *cascade08’Ø“Ø *cascade08“ØŸØ *cascade08ŸØ Ø *cascade08 Ø¡Ø*cascade08¡Ø¢Ø *cascade08¢ØÑØ *cascade08ÑØÕØ *cascade08ÕØÖØ *cascade08ÖØ×Ø*cascade08×ØÙØ *cascade08ÙØÜØ*cascade08ÜØßØ *cascade08ßØàØ *cascade08àØáØ*cascade08áØâØ *cascade08âØäØ*cascade08äØéØ *cascade08éØêØ*cascade08êØîØ *cascade08îØñØ*cascade08ñØôØ *cascade08ôØùØ*cascade08ùØúØ *cascade08úØûØ*cascade08ûØıØ *cascade08ıØ”Ù*cascade08”Ù•Ù *cascade08•Ù¢Ù*cascade08¢Ù£Ù *cascade08£Ù«Ù*cascade08«Ù­Ù *cascade08­Ù°Ù*cascade08°Ù´Ù*cascade08´ÙµÙ *cascade08µÙºÙ*cascade08ºÙ»Ù *cascade08»ÙÈÙ*cascade08ÈÙÉÙ *cascade08ÉÙäÙ *cascade08äÙçÙ *cascade08çÙôÙ *cascade08ôÙõÙ*cascade08õÙ“Ú *cascade08“Ú–Ú *cascade08–Ú§Ú*cascade08§Ú¬Ú *cascade08¬Ú¼Ú *cascade08¼Ú¾Ú *cascade08¾ÚÇÚ *cascade08ÇÚÊÚ *cascade08ÊÚÛÚ *cascade08ÛÚÜÚ*cascade08ÜÚèÚ *cascade08èÚéÚ *cascade08éÚ‚Û *cascade08‚ÛƒÛ *cascade08ƒÛ„Û*cascade08„Û…Û *cascade08…Û¹Û *cascade08¹ÛºÛ *cascade08ºÛÄÛ *cascade08ÄÛÅÛ *cascade08ÅÛÒÛ*cascade08ÒÛÓÛ *cascade08ÓÛÔÛ*cascade08ÔÛÕÛ *cascade08ÕÛãÛ*cascade08ãÛäÛ *cascade08äÛíÛ*cascade08íÛîÛ *cascade08îÛóÛ *cascade08óÛõÛ*cascade08õÛÜ *cascade08Ü§Ü *cascade08§Ü¨Ü*cascade08¨Ü©Ü *cascade08©Ü«Ü*cascade08«Ü¬Ü *cascade08¬Üˆİ *cascade08ˆİŠİ *cascade08Šİ‹İ*cascade08‹İİ*cascade08İ‘İ *cascade08‘İ’İ *cascade08’İºİ *cascade08ºİÀİ*cascade08ÀİÅİ *cascade08ÅİĞİ*cascade08ĞİÓİ *cascade08ÓİÖİ*cascade08ÖİÚİ*cascade08Úİ’Ş *cascade08’Ş–Ş *cascade08–Ş—Ş*cascade08—ŞšŞ *cascade08šŞ¸Ş *cascade08¸Ş¹Ş *cascade08¹Ş½Ş *cascade08½Ş¾Ş*cascade08¾ŞÀŞ*cascade08ÀŞòŞ *cascade08òŞöŞ*cascade08öŞúŞ *cascade08úŞıŞ *cascade08ıŞÿŞ*cascade08ÿŞ€ß *cascade08€ßß*cascade08ßƒß *cascade08ƒß„ß*cascade08„ß†ß *cascade08†ß‡ß *cascade08‡ßŠß*cascade08Šß‹ß *cascade08‹ßß*cascade08ßß *cascade08ßß*cascade08ß“ß *cascade08“ß•ß *cascade08•ß™ß *cascade08™ß›ß *cascade08›ßœß *cascade08œßß*cascade08ßß *cascade08ß¡ß*cascade08¡ß¢ß *cascade08¢ß¤ß*cascade08¤ß¥ß *cascade08¥ßªß*cascade08ªß¬ß *cascade08¬ß¯ß*cascade08¯ß±ß *cascade08±ß³ß*cascade08³ß´ß *cascade08´ß¸ß*cascade08¸ß¹ß *cascade08¹ß¾ß*cascade08¾ßÁß *cascade08ÁßÃß*cascade08ÃßÄß *cascade08ÄßÅß*cascade08ÅßÆß *cascade08ÆßÇß *cascade08ÇßÌß *cascade08ÌßĞß*cascade08ĞßÑß *cascade08ÑßÕß *cascade08ÕßØâ *cascade08Øâ¹æ*cascade08¹æ½æ *cascade08½æÂæ *cascade082Xfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/js/app.js