<!DOCTYPE html>
<html lang="en">
<head>
    <title>Tender 24x7 - User Portal</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        .search-section { background: #f8f9fa; padding: 40px 0; border-bottom: 1px solid #dee2e6; }
        .tender-card { transition: transform 0.2s; }
        .tender-card:hover { transform: translateY(-5px); }
    </style>
</head>
<body>

<nav class="navbar navbar-dark bg-dark">
    <div class="container"><span class="navbar-brand">Tender 24x7</span></div>
</nav>

<section class="search-section mb-4">
    <div class="container text-center">
        <h2 class="mb-3">Find Your Next Opportunity</h2>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <input type="text" id="searchInput" class="form-control form-control-lg" 
                       placeholder="Search by Title, Department, or Keywords..." onkeyup="filterTenders()">
            </div>
        </div>
    </div>
</section>

<div class="container">
    <div id="tender-list" class="row">
        </div>
</div>

<script>
    const _supabase = supabase.createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');
    let allTenders = []; // Local copy for fast filtering

    async function loadTenders() {
        const { data, error } = await _supabase
            .from('tenders')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            allTenders = data;
            renderTenders(allTenders);
        }
    }

    function renderTenders(tenders) {
        const listContainer = document.getElementById('tender-list');
        listContainer.innerHTML = tenders.length > 0 ? '' : '<p class="text-center">No tenders found.</p>';

        tenders.forEach(tender => {
            listContainer.innerHTML += `
                <div class="col-md-6 mb-4 tender-item">
                    <div class="card h-100 shadow-sm tender-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <span class="badge bg-info text-dark mb-2">${tender.department}</span>
                                <small class="text-muted">ID: #${tender.id}</small>
                            </div>
                            <h5 class="card-title">${tender.title}</h5>
                            <p class="card-text text-secondary">${tender.details.substring(0, 120)}...</p>
                        </div>
                        <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                            <span class="text-danger fw-bold">Due: ${tender.closing_date}</span>
                            <button class="btn btn-primary btn-sm">View Details</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    // This function filters the list instantly as you type
    function filterTenders() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filtered = allTenders.filter(t => 
            t.title.toLowerCase().includes(searchTerm) || 
            t.department.toLowerCase().includes(searchTerm) ||
            t.details.toLowerCase().includes(searchTerm)
        );
        renderTenders(filtered);
    }

    loadTenders();
</script>
</body>
</html>
