import { store } from "./store.js";

const students = store.list('students');
const monthInput = document.getElementById('coMonth');
monthInput.value = new Date().toISOString().slice(0, 7);
monthInput.onchange = render;

function render() {
  const month = monthInput.value;
  const deposits = store.list('deposits').filter(d => d.month === month);
  const groceries = store.list('groceryEntries').filter(g => g.month === month);
  const managerGroceries = store.list('managerGroceryEntries').filter(m => m.month === month);

  const rows = students.map(s => {
    const deposited = deposits.filter(d => d.studentId === s.id).reduce((sum, d) => sum + Number(d.amount), 0);
    const grocerySpent = groceries.filter(g => g.studentId === s.id).reduce((sum, g) => sum + Number(g.amount), 0);
    return { name: s.name, deposited, grocerySpent, total: deposited + grocerySpent };
  });

  const totalDeposited = rows.reduce((sum, r) => sum + r.deposited, 0);
  const totalGrocery = rows.reduce((sum, r) => sum + r.grocerySpent, 0);
  const totalManagerGrocery = managerGroceries.reduce((sum, m) => sum + Number(m.amount), 0);
  const avgDeposit = students.length > 0 ? totalDeposited / students.length : 0;

  document.getElementById('coStats').innerHTML = `
    <div class="stat"><div class="label">total deposited</div><div class="value tabular">${totalDeposited.toFixed(2)}</div></div>
    <div class="stat"><div class="label">total personal grocery spending</div><div class="value tabular">${totalGrocery.toFixed(2)}</div></div>
    <div class="stat"><div class="label">manager (pool) spending</div><div class="value tabular">${totalManagerGrocery.toFixed(2)}</div></div>
    <div class="stat"><div class="label">average deposit / person</div><div class="value accent tabular">${avgDeposit.toFixed(2)}</div></div>
  `;

  document.getElementById('coBody').innerHTML = students.length
    ? rows.map(r => {
        const behind = r.deposited < avgDeposit * 0.5 && avgDeposit > 0;
        return `
          <tr>
            <td>${r.name}</td>
            <td class="num tabular">${r.deposited.toFixed(2)}</td>
            <td class="num tabular">${r.grocerySpent.toFixed(2)}</td>
            <td class="num tabular">${r.total.toFixed(2)}</td>
            <td>${behind ? '<span class="tag full">deposit behind</span>' : '<span class="tag">on track</span>'}</td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="5">Add students first on the Students page.</td></tr>';
}

render();
