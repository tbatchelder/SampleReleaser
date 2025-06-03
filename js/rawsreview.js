let currentReviewData = null;

// Function to get current user
const userData = localStorage.getItem('currentUser');
const currentUser = userData ? JSON.parse(userData) : null;

// Load file based on selected date
async function loadFileByDate() {
  const dateInput = document.getElementById('reviewDate');
  const selectedDate = dateInput.value;
  
  if (!selectedDate) {
    alert('Please select a date first.');
    return;
  }
  
  // Construct expected filename based on date
  const filename = `raw_material_entries_${selectedDate}.json`; // or finished_product_entries_
  
  try {
    // For file:// protocol, we'll use a file input instead
    // But first let's try to see if we can access it directly
    showMessage('Please select the corresponding JSON file for this date.', 'info');
    
    // Show file picker
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
    
  } catch (error) {
    console.error('Error loading file:', error);
    showMessage('Error loading file. Please check if the file exists.', 'error');
  }
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      currentReviewData = jsonData;
      
      // Validate the JSON structure
      if (!jsonData.entries || !Array.isArray(jsonData.entries)) {
        throw new Error('Invalid JSON structure: missing entries array');
      }
      
      displayDataForReview(jsonData);
      showMessage(`Loaded ${jsonData.entries.length} entries for review.`, 'success');
      
    } catch (error) {
      console.error('Error parsing JSON:', error);
      showMessage('Error parsing JSON file. Please check the file format.', 'error');
    }
  };
  
  reader.readAsText(file);
}

// Display loaded data in the review table
function displayDataForReview(data) {
  const tableBody = document.getElementById('reviewTableBody');
  tableBody.innerHTML = ''; // Clear existing data
  
  // Show file info
  const fileInfo = document.getElementById('fileInfo');
  if (fileInfo) {
    fileInfo.innerHTML = `
      <h3>Review Information</h3>
      <p><strong>Submission Date:</strong> ${new Date(data.submissionDate).toLocaleString()}</p>
      <p><strong>Submitted By:</strong> ${data.submittedBy}</p>
      <p><strong>Total Entries:</strong> ${data.entries.length}</p>
    `;
  }
  
  // Populate table with entries
  data.entries.forEach((entry, index) => {
    const row = createReviewRow(entry, index);
    tableBody.appendChild(row);
  });
  
  // Show review actions
  const reviewActions = document.getElementById('reviewActions');
  if (reviewActions) {
    reviewActions.style.display = 'block';
  }
}

// Create a review table row (simplified - no individual actions)
function createReviewRow(entry, index) {
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

// Approve entire batch and download reviewed data
function approveBatch() {
  if (!currentReviewData) {
    alert('No data loaded for review.');
    return;
  }

  if (!currentUser) {
    alert('User session expired. Please log in again.');
    return;
  }
  
  // Mark all entries as approved
  const approvedEntries = currentReviewData.entries.map(entry => ({
    ...entry,
    reviewStatus: 'APPROVED',
    reviewedBy: currentUser.username,
    reviewedDate: new Date().toISOString(),
    reviewComments: 'Batch approved'
  }));
  
  // Create reviewed data structure
  const reviewedData = {
    ...currentReviewData,
    entries: approvedEntries,
    reviewInfo: {
      reviewedBy: currentUser.username,
      reviewDate: new Date().toISOString(),
      originalSubmissionDate: currentReviewData.submissionDate,
      originalSubmittedBy: currentReviewData.submittedBy,
      reviewDecision: 'APPROVED',
      totalEntries: approvedEntries.length
    }
  };
  
  // Download approved data
  const jsonString = JSON.stringify(reviewedData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `APPROVED_Raw_Material_${currentReviewData.submittedBy}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showMessage(`Batch approved! Downloaded ${approvedEntries.length} entries.`, 'success');
  
  // Hide review actions after approval
  const reviewActions = document.getElementById('reviewActions');
  if (reviewActions) {
    reviewActions.style.display = 'none';
  }
}

// Reject entire batch and send email
function rejectBatch() {
  if (!currentReviewData) {
    alert('No data loaded for review.');
    return;
  }

  if (!currentUser) {
    alert('User session expired. Please log in again.');
    return;
  }
  
  // Get rejection reason from user
  const rejectionReason = prompt('Please provide a reason for rejecting this batch:');
  if (!rejectionReason || rejectionReason.trim() === '') {
    alert('Rejection reason is required.');
    return;
  }
  
  // Create email content
  const emailSubject = `Data Review Rejection - ${currentReviewData.submittedBy} - ${new Date().toLocaleDateString()}`;
  const emailBody = `
Dear ${currentReviewData.submittedBy},

Your data submission from ${new Date(currentReviewData.submissionDate).toLocaleString()} has been reviewed and rejected.

SUBMISSION DETAILS:
- Total Entries: ${currentReviewData.entries.length}
- Submission Date: ${new Date(currentReviewData.submissionDate).toLocaleString()}

REJECTION REASON:
${rejectionReason}

ENTRIES IN THIS BATCH:
${currentReviewData.entries.map((entry, index) => `
${index + 1}. LIMS #: ${entry.limsNumber || 'N/A'}
   Product: ${entry.productName || 'N/A'} (${entry.productCode || 'N/A'})
   Batch: ${entry.batchNumber || 'N/A'}
`).join('')}

Please review the rejection reason, make the necessary corrections to all entries in this batch, and resubmit.

Reviewed by: ${currentUser.username} (${currentUser.role || 'Reviewer'})
Review Date: ${new Date().toLocaleString()}

Best regards,
Quality Review Team
  `.trim();
  
  // Create mailto link
  const recipientEmail = currentReviewData.submittedBy.includes('@') 
    ? currentReviewData.submittedBy 
    : `${currentReviewData.submittedBy}@company.com`;
    
  const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  
  // Open email client
  window.open(mailtoLink, '_blank');
  
  showMessage(`Batch rejected. Email prepared for ${currentReviewData.submittedBy}.`, 'info');
  
  // Hide review actions after rejection
  const reviewActions = document.getElementById('reviewActions');
  if (reviewActions) {
    reviewActions.style.display = 'none';
  }
}

// Add comments to the batch (optional feature)
function addBatchComments() {
  if (!currentReviewData) {
    alert('No data loaded for review.');
    return;
  }
  
  const comments = prompt('Add comments for this batch (optional):');
  if (comments) {
    currentReviewData.batchComments = comments;
    showMessage('Comments added to batch.', 'info');
  }
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
  div.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: bold;
    z-index: 1000;
    max-width: 300px;
  `;
  
  // Add styles for different message types
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      .message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      .message.info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
  `);
  
  document.body.appendChild(div);
  return div;
}

// Initialize page
function initializePage() {
  // Set up file input handler
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Set default date to today
  const dateInput = document.getElementById('reviewDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  
  // Check if user is logged in
  if (!currentUser) {
    showMessage('Warning: No user session found. Please ensure you are logged in.', 'error');
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initializePage);