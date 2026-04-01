let filmsData = [];

// Load data from JSON file
async function loadFilmsData() {
    try {
        const response = await fetch('films_data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        filmsData = await response.json();
        initializeFilters();
        displayFilms(filmsData);
        updateStats(filmsData);
    } catch (error) {
        console.error('Error loading films data:', error);
        document.getElementById('filmsGrid').innerHTML = 
            '<div class="no-results">❌ Failed to load films data. Please check the JSON file.</div>';
    }
}

// Initialize filter dropdowns with unique values
function initializeFilters() {
    const years = [...new Set(filmsData.map(film => film.release_year))].sort((a,b) => b - a);
    const yearFilter = document.getElementById('yearFilter');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    const countries = [...new Set(filmsData.map(film => film.country))].sort();
    const countryFilter = document.getElementById('countryFilter');
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Display films in grid
function displayFilms(films) {
    const grid = document.getElementById('filmsGrid');
    
    if (films.length === 0) {
        grid.innerHTML = '<div class="no-results">🎬 No films match your filters. Try adjusting your search criteria!</div>';
        return;
    }
    
    grid.innerHTML = films.map(film => `
        <div class="film-card">
            <div class="film-content">
                <div class="film-title">${escapeHtml(film.title)}</div>
                <div class="film-year">📅 ${film.release_year}</div>
                <div class="film-director">🎬 Director: ${escapeHtml(film.director)}</div>
                <div class="film-country">🌍 Country: ${escapeHtml(film.country)}</div>
                <div class="film-revenue">💰 ${formatRevenue(film.box_office)}</div>
            </div>
        </div>
    `).join('');
}

// Format revenue in billions/millions
function formatRevenue(amount) {
    if (amount >= 1e9) {
        return `$${(amount / 1e9).toFixed(2)} Billion`;
    } else if (amount >= 1e6) {
        return `$${(amount / 1e6).toFixed(2)} Million`;
    }
    return `$${amount.toLocaleString()}`;
}

// Update statistics
function updateStats(films) {
    const totalFilms = films.length;
    const totalRevenue = films.reduce((sum, film) => sum + film.box_office, 0);
    const avgRevenue = totalFilms > 0 ? totalRevenue / totalFilms : 0;
    
    document.getElementById('totalFilms').textContent = totalFilms;
    document.getElementById('totalRevenue').textContent = formatRevenue(totalRevenue);
    document.getElementById('avgRevenue').textContent = formatRevenue(avgRevenue);
}

// Filter and sort films based on user input
function filterAndSortFilms() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const yearFilter = document.getElementById('yearFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filtered = filmsData.filter(film => {
        const matchesSearch = film.title.toLowerCase().includes(searchTerm) ||
                             film.director.toLowerCase().includes(searchTerm) ||
                             film.country.toLowerCase().includes(searchTerm);
        const matchesYear = yearFilter === 'all' || film.release_year == yearFilter;
        const matchesCountry = countryFilter === 'all' || film.country === countryFilter;
        
        return matchesSearch && matchesYear && matchesCountry;
    });
    
    // Apply sorting
    switch(sortBy) {
        case 'box_office_desc':
            filtered.sort((a, b) => b.box_office - a.box_office);
            break;
        case 'box_office_asc':
            filtered.sort((a, b) => a.box_office - b.box_office);
            break;
        case 'year_desc':
            filtered.sort((a, b) => b.release_year - a.release_year);
            break;
        case 'year_asc':
            filtered.sort((a, b) => a.release_year - b.release_year);
            break;
        case 'title_asc':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    displayFilms(filtered);
    updateStats(filtered);
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return 'Unknown';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterAndSortFilms);
document.getElementById('yearFilter').addEventListener('change', filterAndSortFilms);
document.getElementById('countryFilter').addEventListener('change', filterAndSortFilms);
document.getElementById('sortBy').addEventListener('change', filterAndSortFilms);

// Load data when page loads
loadFilmsData();