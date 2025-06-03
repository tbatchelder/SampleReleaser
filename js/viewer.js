let currentRMData = null;
    let currentFPData = null;

    // Function to get current user
    const userData = localStorage.getItem('currentUser');
    const currentUser = userData ? JSON.parse(userData) : null;

    // Load Raw Material file based on selected date
    async function loadRMFileByDate() {
      const dateInput = document.getElementById('reviewRMDate');
      const selectedDate = dateInput.value;
      
      if (!selectedDate) {
        alert('Please select a date first.');
        return;
      }
      
      showMessage('Please select the Raw Material JSON file for this date.', 'info');
      
      // Show file picker for raw materials
      const fileInput = document.getElementById('rmFileInput');
      fileInput.click();
    }

    // Load Finished Product file based on selected date
    async function loadFPFileByDate() {
      const dateInput = document.getElementById('reviewFPDate');
      const selectedDate = dateInput.value;
      
      if (!selectedDate) {
        alert('Please select a date first.');
        return;
      }
      
      showMessage('Please select the Finished Product JSON file for this date.', 'info');
      
      // Show file picker for finished products
      const fileInput = document.getElementById('fpFileInput');
      fileInput.click();
    }

    // Handle Raw Material file selection
    function handleRMFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          currentRMData = jsonData;
          
          // Validate the JSON structure
          if (!jsonData.entries || !Array.isArray(jsonData.entries)) {
            throw new Error('Invalid JSON structure: missing entries array');
          }
          
          displayRMDataForReview(jsonData);
          showMessage(`Loaded ${jsonData.entries.length} raw material entries.`, 'success');
          
        } catch (error) {
          console.error('Error parsing Raw Material JSON:', error);
          showMessage('Error parsing Raw Material JSON file. Please check the file format.', 'error');
        }
      };
      
      reader.readAsText(file);
    }

    // Handle Finished Product file selection
    function handleFPFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          currentFPData = jsonData;
          
          // Validate the JSON structure
          if (!jsonData.entries || !Array.isArray(jsonData.entries)) {
            throw new Error('Invalid JSON structure: missing entries array');
          }
          
          displayFPDataForReview(jsonData);
          showMessage(`Loaded ${jsonData.entries.length} finished product entries.`, 'success');
          
        } catch (error) {
          console.error('Error parsing Finished Product JSON:', error);
          showMessage('Error parsing Finished Product JSON file. Please check the file format.', 'error');
        }
      };
      
      reader.readAsText(file);
    }

    // Display Raw Material data in the review table
    function displayRMDataForReview(data) {
      const tableBody = document.getElementById('rmReviewTableBody');
      tableBody.innerHTML = ''; // Clear existing data
      
      // Show file info
      const fileInfo = document.getElementById('rmFileInfo');
      if (fileInfo) {
        fileInfo.innerHTML = `
          <h3>Raw Material Review Information</h3>
          <p><strong>Submission Date:</strong> ${new Date(data.submissionDate).toLocaleString()}</p>
          <p><strong>Submitted By:</strong> ${data.submittedBy}</p>
          <p><strong>Reviewed By:</strong> ${data.reviewInfo?.reviewedBy || 'N/A'}</p>
          <p><strong>Review Date:</strong> ${data.reviewInfo?.reviewDate ? new Date(data.reviewInfo.reviewDate).toLocaleString() : 'N/A'}</p>
          <p><strong>Total Entries:</strong> ${data.entries.length}</p>
        `;
        fileInfo.style.display = 'block';
      }
      
      // Populate table with entries
      data.entries.forEach((entry, index) => {
        const row = createRMReviewRow(entry, index);
        tableBody.appendChild(row);
      });
    }

    // Display Finished Product data in the review table
    function displayFPDataForReview(data) {
      const tableBody = document.getElementById('fpReviewTableBody');
      tableBody.innerHTML = ''; // Clear existing data
      
      // Show file info
      const fileInfo = document.getElementById('fpFileInfo');
      if (fileInfo) {
        fileInfo.innerHTML = `
          <h3>Finished Product Review Information</h3>
          <p><strong>Submission Date:</strong> ${new Date(data.submissionDate).toLocaleString()}</p>
          <p><strong>Submitted By:</strong> ${data.submittedBy}</p>
          <p><strong>Reviewed By:</strong> ${data.reviewInfo?.reviewedBy || 'N/A'}</p>
          <p><strong>Review Date:</strong> ${data.reviewInfo?.reviewDate ? new Date(data.reviewInfo.reviewDate).toLocaleString() : 'N/A'}</p>
          <p><strong>Total Entries:</strong> ${data.entries.length}</p>
        `;
        fileInfo.style.display = 'block';
      }
      
      // Populate table with entries
      data.entries.forEach((entry, index) => {
        const row = createFPReviewRow(entry, index);
        tableBody.appendChild(row);
      });
    }

    // Create a Raw Material review table row
    function createRMReviewRow(entry, index) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.limsNumber || ''}</td>
        <td>${entry.productCode || ''}</td>
        <td>${entry.productName || ''}</td>
        <td>${entry.atpStatus || ''}</td>
        <td>${entry.atpExpiration || ''}</td>
        <td>${entry.batchNumber || ''}</td>
        <td>${entry.releaseStatus || ''}</td>
        <td>${entry.assayAsIs || ''}</td>
        <td>${entry.assayDried || ''}</td>
        <td>${entry.releaseDate || ''}</td>
        <td>${entry.potency1 || ''}</td>
        <td>${entry.potency2 || ''}</td>
      `;
      return row;
    }

    // Create a Finished Product review table row
    function createFPReviewRow(entry, index) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.limsNumber || ''}</td>
        <td>${entry.productCode || ''}</td>
        <td>${entry.productName || ''}</td>
        <td>${entry.batchNumber || ''}</td>
        <td>${entry.releaseStatus || ''}</td>
        <td>${entry.assay1 || ''}</td>
        <td>${entry.assay2 || ''}</td>
        <td>${entry.releaseDate || ''}</td>
      `;
      return row;
    }

    // Helper function to show messages
    function showMessage(text, type) {
      const messageDiv = document.getElementById('message') || createMessageDiv();
      messageDiv.textContent = text;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }

    function createMessageDiv() {
      const div = document.createElement('div');
      div.id = 'message';
      div.className = 'message';
      document.body.appendChild(div);
      return div;
    }

    // Initialize page
    function initializePage() {
      // Set up file input handlers
      const rmFileInput = document.getElementById('rmFileInput');
      if (rmFileInput) {
        rmFileInput.addEventListener('change', handleRMFileSelect);
      }

      const fpFileInput = document.getElementById('fpFileInput');
      if (fpFileInput) {
        fpFileInput.addEventListener('change', handleFPFileSelect);
      }
      
      // Set default dates to today
      const rmDateInput = document.getElementById('reviewRMDate');
      const fpDateInput = document.getElementById('reviewFPDate');
      const today = new Date().toISOString().split('T')[0];
      
      if (rmDateInput) {
        rmDateInput.value = today;
      }
      if (fpDateInput) {
        fpDateInput.value = today;
      }
      
      // Check if user is logged in
      if (!currentUser) {
        showMessage('Warning: No user session found. Viewing in read-only mode.', 'info');
      }
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', initializePage);