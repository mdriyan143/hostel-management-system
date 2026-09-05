import { store } from "./store.js";

const students = store.list('students');
const monthInput = document.getElementById('calcMonth');
monthInput.value = new Date().toISOString().slice(0, 7);
monthInput.onchange = renderLogs;

function studentName(id) {
  const s = students.find(s => s.id === id);
  return s ? s.name : 'Unknown';
}

function fillPersonSelects() {
  const options = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  document.getElementById('gPerson').innerHTML = options;
  document.getElementById('dPerson').innerHTML = options;
}

function currentMonth() { return monthInput.value; }

function renderLogs() {
  const month = currentMonth();

  const groceries = store.list('groceryEntries').filter(g => g.month === month);
  document.getElementById('groceryBody').innerHTML = groceries.length
    ? groceries.map(g => `
        <tr>
          <td>${studentName(g.studentId)}</td>
          <td>${g.note || '\u2014'}</td>
          <td class="num tabular">${Number(g.amount).toFixed(2)}</td>
          <td><button class="danger" onclick="removeEntry('groceryEntries','${g.id}')">Delete</button></td>
        </tr>`).join('')
    : '<tr><td colspan="4">No grocery spending logged for this month yet.</td></tr>';

  const deposits = store.list('deposits').filter(d => d.month === month);
  document.getElementById('depositBody').innerHTML = deposits.length
    ? deposits.map(d => `
        <tr>
          <td>${studentName(d.studentId)}</td>
          <td class="num tabular">${Number(d.amount).toFixed(2)}</td>
          <td><button class="danger" onclick="removeEntry('deposits','${d.id}')">Delete</button></td>
        </tr>`).join('')
    : '<tr><td colspan="3">No deposits logged for this month yet.</td></tr>';

  const bibidh = store.list('bibidhEntries').filter(b => b.month === month);
  document.getElementById('bibidhBody').innerHTML = bibidh.length
    ? bibidh.map(b => `
        <tr>
          <td>${b.description}</td>
          <td class="num tabular">${Number(b.amount).toFixed(2)}</td>
          <td><button class="danger" onclick="removeEntry('bibidhEntries','${b.id}')">Delete</button></td>
        </tr>`).join('')
    : '<tr><td colspan="3">No bibidh expenses logged for this month yet.</td></tr>';

  document.getElementById('settlementPanel').innerHTML = '';
}

window.addGrocery = () => {
  const amount = parseFloat(document.getElementById('gAmount').value);
  const msg = document.getElementById('groceryMsg');
  if (!amount || amount <= 0) { msg.innerHTML = '<div class="msg error">Enter a valid amount.</div>'; return; }
  store.add('groceryEntries', {
    studentId: document.getElementById('gPerson').value,
    amount,
    note: document.getElementById('gNote').value.trim(),
    month: currentMonth(),
  });
  document.getElementById('gAmount').value = '';
  document.getElementById('gNote').value = '';
  msg.innerHTML = '';
  renderLogs();
};

window.addDeposit = () => {
  const amount = parseFloat(document.getElementById('dAmount').value);
  const msg = document.getElementById('depositMsg');
  if (!amount || amount <= 0) { msg.innerHTML = '<div class="msg error">Enter a valid amount.</div>'; return; }
  store.add('deposits', {
    studentId: document.getElementById('dPerson').value,
    amount,
    month: currentMonth(),
  });
  document.getElementById('dAmount').value = '';
  msg.innerHTML = '';
  renderLogs();
};

window.addBibidh = () => {
  const amount = parseFloat(document.getElementById('bAmount').value);
  const description = document.getElementById('bDesc').value.trim();
  const msg = document.getElementById('bibidhMsg');
  if (!description || !amount || amount <= 0) { msg.innerHTML = '<div class="msg error">Enter a description and a valid amount.</div>'; return; }
  store.add('bibidhEntries', { description, amount, month: currentMonth() });
  document.getElementById('bDesc').value = '';
  document.getElementById('bAmount').value = '';
  msg.innerHTML = '';
  renderLogs();
};

window.removeEntry = (collectionName, id) => {
  store.remove(collectionName, id);
  renderLogs();
};

window.calculateSettlement = () => {
  const month = currentMonth();
  const panel = document.getElementById('settlementPanel');

  const groceries = store.list('groceryEntries').filter(g => g.month === month);
  const deposits = store.list('deposits').filter(d => d.month === month);
  const bibidh = store.list('bibidhEntries').filter(b => b.month === month);
  const attendance = store.list('attendance').filter(a => a.month === month);

  const totalGrocery = groceries.reduce((sum, g) => sum + Number(g.amount), 0);
  const totalBibidh = bibidh.reduce((sum, b) => sum + Number(b.amount), 0);

  const mealsByStudent = {};
  attendance.forEach(a => {
    const meals = (a.breakfast ? 0.5 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0);
    mealsByStudent[a.studentId] = (mealsByStudent[a.studentId] || 0) + meals;
  });
  const totalMeals = Object.values(mealsByStudent).reduce((sum, n) => sum + n, 0);
  const mealRate = totalMeals > 0 ? totalGrocery / totalMeals : 0;
  const bibidhShare = students.length > 0 ? totalBibidh / students.length : 0;

  const rows = students.map(s => {
    const meals = mealsByStudent[s.id] || 0;
    const mealCost = meals * mealRate;
    const finalCost = mealCost + bibidhShare;

    const depositTotal = deposits.filter(d => d.studentId === s.id).reduce((sum, d) => sum + Number(d.amount), 0);
    const grocerySpent = groceries.filter(g => g.studentId === s.id).reduce((sum, g) => sum + Number(g.amount), 0);
    const contribution = depositTotal + grocerySpent;

    const balance = contribution - finalCost;
    return { name: s.name, meals, mealCost, bibidhShare, finalCost, contribution, balance };
  });

  panel.innerHTML = `
    <div class="stat-strip" style="margin-top:20px;">
      <div class="stat"><div class="label">total grocery cost</div><div class="value tabular">${totalGrocery.toFixed(2)}</div></div>
      <div class="stat"><div class="label">total meals (all people)</div><div class="value tabular">${totalMeals.toFixed(1)}</div></div>
      <div class="stat"><div class="label">meal rate</div><div class="value accent tabular">${mealRate.toFixed(2)}</div></div>
      <div class="stat"><div class="label">bibidh / person</div><div class="value tabular">${bibidhShare.toFixed(2)}</div></div>
    </div>
    <table class="roll">
      <thead><tr><th>Name</th><th class="num">Meals</th><th class="num">Meal cost</th><th class="num">Bibidh share</th><th class="num">Final cost</th><th class="num">Contribution</th><th class="num">Balance</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.name}</td>
            <td class="num tabular">${r.meals.toFixed(1)}</td>
            <td class="num tabular">${r.mealCost.toFixed(2)}</td>
            <td class="num tabular">${r.bibidhShare.toFixed(2)}</td>
            <td class="num tabular">${r.finalCost.toFixed(2)}</td>
            <td class="num tabular">${r.contribution.toFixed(2)}</td>
            <td class="num tabular ${r.balance >= 0 ? 'amt-positive' : 'amt-negative'}">
              ${r.balance >= 0 ? `+${r.balance.toFixed(2)} (gets back)` : `${r.balance.toFixed(2)} (owes)`}
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
};

window.clearOldEntries = () => {
  const cutoffMonth = currentMonth();
  const msg = document.getElementById('clearMsg');
  if (!cutoffMonth) { msg.innerHTML = '<div class="msg error">Pick a month first.</div>'; return; }
  if (!confirm(`Delete all grocery, deposit, and bibidh entries before ${cutoffMonth}? This can't be undone.`)) return;

  const removed =
    store.removeWhere('groceryEntries', (g) => g.month < cutoffMonth) +
    store.removeWhere('deposits', (d) => d.month < cutoffMonth) +
    store.removeWhere('bibidhEntries', (b) => b.month < cutoffMonth);

  msg.innerHTML = `<div class="msg">Cleared ${removed} entr${removed === 1 ? 'y' : 'ies'} from before ${cutoffMonth}.</div>`;
  renderLogs();
};

fillPersonSelects();
renderLogs();
