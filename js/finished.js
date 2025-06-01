// Function to get current user
const userData = localStorage.getItem('currentUser');
const currentUser = userData ? JSON.parse(userData) : null;

// Populate product name dropdown
function populateProductNames() {
  const selects = document.querySelectorAll('select[name="productName"]');
  selects.forEach(select => {
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select Product</option>';
    
    // Add finished products to dropdown
    finishedProducts.forEach(product => {
      const option = document.createElement('option');
      option.value = product.name;
      option.textContent = `${product.name}`;
      select.appendChild(option);
    });
  });
}

// Update product details when product name is selected
function updateProductDetails(selectElement) {
  const row = selectElement.closest('tr');
  const productName = selectElement.value;
  const productCode = row.querySelector('input[name="productCode"]');
  
  if (productName) {
    const product = finishedProducts.find(p => p.name === productName);
    if (product) {
      productCode.value = product.code;
    }
  } else {
    // Clear fields if no product selected
    productCode.value = '';
  }
}

// Add a new row
function addRow(button) {
  const table = document.getElementById('entryTable').getElementsByTagName('tbody')[0];
  const currentRow = button.closest('tr');
  const newRow = currentRow.cloneNode(true);
  
  // Clear all input values in the new row
  const inputs = newRow.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type !== 'date') {
      input.value = '';
    }
  });
  
  // Insert the new row after the current row
  currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
  
  // Populate product codes in the new row
  populateProductNames();
}

function removeRow(button) {
  const row = button.closest('tr');
  const table = row.closest('tbody');
  
  // Don't remove if it's the last row
  if (table.rows.length > 1) {
    row.remove();
  } else {
    alert('Cannot remove the last row');
  }
}

// Collect all form data
function collectFormData() {
  const table = document.getElementById('entryTable');
  const rows = table.getElementsByTagName('tbody')[0].rows;
  const entries = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const entry = {
      limsNumber: row.querySelector('input[name="limsNumber"]').value,
      productCode: row.querySelector('input[name="productCode"]').value,
      productName: row.querySelector('select[name="productName"]').value,
      batchNumber: row.querySelector('input[name="batchNumber"]').value,
      releaseStatus: row.querySelector('select[name="releaseStatus"]').value,
      assay1: row.querySelector('input[name="assay1"]').value,
      assay2: row.querySelector('input[name="assay2"]').value,
      releaseDate: row.querySelector('input[name="releaseDate"]').value,
      timestamp: new Date().toISOString(),
      status: 'pending_review'
    };
    console.log("hi");
    // Only include rows with at least LIMS number filled
    if (entry.limsNumber.trim()) {
      entries.push(entry);
    }
  }
  
  return {
    submissionDate: new Date().toISOString(),
    submittedBy: currentUser.username,
    entries: entries
  };
}

// Download data as JSON file
function downloadAsFile() {
  const data = collectFormData();
  
  if (data.entries.length === 0) {
    alert('Please fill in at least one row with a LIMS number.');
    return;
  }
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `finished_entries_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert(`Downloaded ${data.entries.length} entries. Move this file to your "review" folder.`);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  populateProductNames();
});