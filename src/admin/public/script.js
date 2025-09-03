// Global configuration object
let currentConfig = {};

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadConfiguration();
    updateStatusCards();
});

// Load configuration from the API
async function loadConfiguration() {
    try {
        const response = await fetch('/api/config');
        currentConfig = await response.json();
        
        // Populate form fields
        document.getElementById('reminderTimeInput').value = currentConfig.reminderTime || '09:00';
        document.getElementById('defaultChannelInput').value = currentConfig.defaultChannel || '#general';
        
        // Populate countries list
        renderCountriesList();
        
        // Populate test country dropdown
        populateTestCountryDropdown();
        
    } catch (error) {
        console.error('Error loading configuration:', error);
        showNotification('Error loading configuration', 'error');
    }
}

// Render the countries list
function renderCountriesList() {
    const countriesList = document.getElementById('countriesList');
    countriesList.innerHTML = '';
    
    if (!currentConfig.countries || currentConfig.countries.length === 0) {
        countriesList.innerHTML = '<p class="text-gray-500 text-center py-8">No countries configured yet.</p>';
        return;
    }
    
    currentConfig.countries.forEach(country => {
        const countryCard = createCountryCard(country);
        countriesList.appendChild(countryCard);
    });
}

// Create a country card element
function createCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'country-card bg-gray-50 rounded-lg p-4 border border-gray-200';
    
    const statusClass = country.enabled ? 'status-active' : 'status-inactive';
    const statusText = country.enabled ? 'Active' : 'Inactive';
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="flex items-center">
                <span class="status-indicator ${statusClass}"></span>
                <h3 class="text-lg font-semibold text-gray-800">${country.countryName}</h3>
                <span class="ml-2 text-sm text-gray-500">(${country.countryCode})</span>
            </div>
            <div class="flex space-x-2">
                <button onclick="toggleCountryStatus('${country.countryCode}')" 
                        class="px-3 py-1 text-sm rounded-md ${country.enabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}">
                    ${country.enabled ? 'Disable' : 'Enable'}
                </button>
                <button onclick="editCountry('${country.countryCode}')" 
                        class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                    Edit
                </button>
                <button onclick="deleteCountry('${country.countryCode}')" 
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                    Delete
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                <p class="text-gray-600"><strong>Channels:</strong></p>
                <p class="text-gray-800">${country.channels.join(', ') || 'None'}</p>
            </div>
            <div>
                <p class="text-gray-600"><strong>Timezone:</strong></p>
                <p class="text-gray-800">${country.timezone}</p>
            </div>
        </div>
        
        <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-xs text-gray-500">
                Status: <span class="font-medium">${statusText}</span>
            </p>
        </div>
    `;
    
    return card;
}

// Toggle country status (enable/disable)
async function toggleCountryStatus(countryCode) {
    try {
        const country = currentConfig.countries.find(c => c.countryCode === countryCode);
        if (!country) return;
        
        country.enabled = !country.enabled;
        
        const response = await fetch(`/api/countries/${countryCode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(country)
        });
        
        if (response.ok) {
            showNotification(`Country ${country.enabled ? 'enabled' : 'disabled'} successfully`, 'success');
            renderCountriesList();
            updateStatusCards();
        } else {
            throw new Error('Failed to update country');
        }
    } catch (error) {
        console.error('Error toggling country status:', error);
        showNotification('Error updating country status', 'error');
    }
}

// Edit country (placeholder for future enhancement)
function editCountry(countryCode) {
    showNotification('Edit functionality coming soon!', 'info');
}

// Delete country
async function deleteCountry(countryCode) {
    if (!confirm('Are you sure you want to delete this country?')) return;
    
    try {
        const response = await fetch(`/api/countries/${countryCode}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Country deleted successfully', 'success');
            loadConfiguration();
            updateStatusCards();
        } else {
            throw new Error('Failed to delete country');
        }
    } catch (error) {
        console.error('Error deleting country:', error);
        showNotification('Error deleting country', 'error');
    }
}

// Save configuration
async function saveConfig() {
    try {
        const reminderTime = document.getElementById('reminderTimeInput').value;
        const defaultChannel = document.getElementById('defaultChannelInput').value;
        
        const updatedConfig = {
            ...currentConfig,
            reminderTime,
            defaultChannel
        };
        
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedConfig)
        });
        
        if (response.ok) {
            currentConfig = updatedConfig;
            showNotification('Configuration saved successfully', 'success');
            updateStatusCards();
        } else {
            throw new Error('Failed to save configuration');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
        showNotification('Error saving configuration', 'error');
    }
}

// Add new country
async function addCountry() {
    const countryCode = document.getElementById('newCountryCode').value.trim();
    const countryName = document.getElementById('newCountryName').value.trim();
    const channels = document.getElementById('newCountryChannels').value.trim();
    const timezone = document.getElementById('newCountryTimezone').value;
    
    if (!countryCode || !countryName) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const newCountry = {
        countryCode: countryCode.toUpperCase(),
        countryName,
        channels: channels ? channels.split(',').map(c => c.trim()) : [],
        enabled: true,
        timezone
    };
    
    try {
        const response = await fetch('/api/countries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCountry)
        });
        
        if (response.ok) {
            showNotification('Country added successfully', 'success');
            hideAddCountryModal();
            loadConfiguration();
            updateStatusCards();
        } else {
            throw new Error('Failed to add country');
        }
    } catch (error) {
        console.error('Error adding country:', error);
        showNotification('Error adding country', 'error');
    }
}

// Show add country modal
function showAddCountryModal() {
    document.getElementById('addCountryModal').classList.remove('hidden');
    // Clear form fields
    document.getElementById('newCountryCode').value = '';
    document.getElementById('newCountryName').value = '';
    document.getElementById('newCountryChannels').value = '';
    document.getElementById('newCountryTimezone').value = 'UTC';
}

// Hide add country modal
function hideAddCountryModal() {
    document.getElementById('addCountryModal').classList.add('hidden');
}

// Test holiday API
async function testHolidayAPI() {
    const countryCode = document.getElementById('testCountry').value;
    if (!countryCode) {
        showNotification('Please select a country to test', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/test-holiday/${countryCode}`);
        const result = await response.json();
        
        const testResults = document.getElementById('testResults');
        testResults.innerHTML = `
            <h4 class="font-medium text-gray-800 mb-2">Test Results for ${countryCode}:</h4>
            <p class="text-gray-700">${result.message}</p>
            <p class="text-sm text-gray-500 mt-2">Status: ${result.success ? 'Success' : 'Failed'}</p>
        `;
        testResults.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error testing holiday API:', error);
        showNotification('Error testing holiday API', 'error');
    }
}

// Update status cards
function updateStatusCards() {
    if (!currentConfig.countries) return;
    
    const activeCountries = currentConfig.countries.filter(c => c.enabled).length;
    const totalChannels = currentConfig.countries.reduce((total, country) => total + country.channels.length, 0);
    
    document.getElementById('activeCountries').textContent = activeCountries;
    document.getElementById('reminderTime').textContent = currentConfig.reminderTime || '09:00';
    document.getElementById('totalChannels').textContent = totalChannels;
}

// Populate test country dropdown
function populateTestCountryDropdown() {
    const testCountrySelect = document.getElementById('testCountry');
    testCountrySelect.innerHTML = '<option value="">Select a country</option>';
    
    if (currentConfig.countries) {
        currentConfig.countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.countryCode;
            option.textContent = `${country.countryName} (${country.countryCode})`;
            testCountrySelect.appendChild(option);
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('addCountryModal');
    if (event.target === modal) {
        hideAddCountryModal();
    }
}); 