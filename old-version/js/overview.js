import { store } from "./store.js";

const monthInput = document.getElementById('ovMonth');
monthInput.value = new Date().toISOString().slice(0, 7);
monthInput.onchange = render;

function daysInMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

function cellClass(meals) {
  if (meals === null) return 'cell-blank';
  if (meals <= 0) return 'cell-0';
  if (meals <= 0.5) return 'cell-1';
  if (meals <= 1) return 'cell-2';
  if (meals <= 1.5) return 'cell-3';
  if (meals <= 2) return 'cell-4';
  return 'cell-5';
}

function render() {
  const month = monthInput.value;
  const students = store.list('students');
  const dayCount = daysInMonth(month);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  const mealLookup = {}; // `${day}_${studentId}` -> weighted meal total
  store.list('attendance').filter(a => a.month === month).forEach(a => {
    const day = Number(a.date.split('-')[2]);
    const meals = (a.breakfast ? 0.5 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0);
    mealLookup[`${day}_${a.studentId}`] = meals;
  });

  const dayTotals = days.map(day =>
    students.reduce((sum, s) => {
      const val = mealLookup[`${day}_${s.id}`];
      return sum + (val || 0);
    }, 0)
  );
  const grandTotal = dayTotals.reduce((sum, n) => sum + n, 0);

  const headerCells = days.map(d => `<th>${d}</th>`).join('');
  const bodyRows = students.map(s => {
    let rowTotal = 0;
    const cells = days.map(day => {
      const key = `${day}_${s.id}`;
      const val = key in mealLookup ? mealLookup[key] : null;
      if (val !== null) rowTotal += val;
      return `<td class="${cellClass(val)}">${val !== null ? val : ''}</td>`;
    }).join('');
    return `<tr><td class="name-col">${s.name}</td>${cells}<td class="total-col">${rowTotal.toFixed(1)}</td></tr>`;
  }).join('');

  const footerCells = dayTotals.map(t => `<td class="total-col">${t.toFixed(1)}</td>`).join('');

  const table = document.getElementById('heatmapTable');
  table.innerHTML = students.length
    ? `
      <thead>
        <tr><th class="name-col">Name</th>${headerCells}<th class="total-col">Total</th></tr>
      </thead>
      <tbody>${bodyRows}</tbody>
      <tfoot>
        <tr><td class="name-col total-col">Daily total</td>${footerCells}<td class="total-col">${grandTotal.toFixed(1)}</td></tr>
      </tfoot>`
    : '<tr><td>Add students first on the Students page.</td></tr>';
}

render();
