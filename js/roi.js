document.getElementById('calcRoiBtn').addEventListener('click', () => {
  const stockLoss = Number(document.getElementById('stockLoss').value) || 0;
  const manualHours = Number(document.getElementById('manualHours').value) || 0;
  const hourlyRate = Number(document.getElementById('hourlyRate').value) || 0;
  const penaltyCost = Number(document.getElementById('penaltyCost').value) || 0;

  const stockSavings = stockLoss * 0.90;
  const laborSavings = manualHours * hourlyRate * 0.70;
  const penaltySavings = penaltyCost * 0.80;

  const monthly = stockSavings + laborSavings + penaltySavings;
  const annual = monthly * 12;

  document.getElementById('monthlySavings').textContent = formatCurrency(monthly);
  document.getElementById('annualSavings').textContent = formatCurrency(annual);
  document.getElementById('roiResult').style.display = 'block';
});
