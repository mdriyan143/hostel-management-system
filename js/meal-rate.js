import { store } from "./store.js";

const students = store.list('students');
const monthInput = document.getElementById('mrMonth');
monthInput.value = new Date().toISOString().slice(0, 7);
monthInput.onchange = render;

function render() {
  const month = monthInput.value;

  // Step 1: personal grocery spending per person + manager/pool purchases
  const groceries = store.list('groceryEntries').filter(g => g.month === month);
  const managerGroceries = store.list('managerGroceryEntries').filter(m => m.month === month);

  const personalByStudent = {};
  groceries.forEach(g => {
    personalByStudent[g.studentId] = (personalByStudent[g.studentId] || 0) + Number(g.amount);
  });

  const totalPersonal = Object.values(personalByStudent).reduce((sum, n) => sum + n, 0);
  const totalManager = managerGroceries.reduce((sum, m) => sum + Number(m.amount), 0);
  const totalGrocery = totalPersonal + totalManager;

  document.getElementById('groceryStepBody').innerHTML = students.length
    ? students.map(s => {
        const personal = personalByStudent[s.id] || 0;
        if (personal === 0) return '';
        return `<tr><td>${s.name}</td><td class="num tabular">${personal.toFixed(2)}</td></tr>`;
      }).join('') || '<tr><td colspan="2">No personal grocery spending logged for this month yet.</td></tr>'
    : '<tr><td colspan="2">Add students first on the Students page.</td></tr>';
  document.getElementById('managerStepTotal').textContent = totalManager.toFixed(2);
  document.getElementById('groceryStepTotal').textContent = totalGrocery.toFixed(2);

  // Step 2: meal day counts per person
  const attendance = store.list('attendance').filter(a => a.month === month);
  const daysByStudent = {};
  attendance.forEach(a => {
    if (!daysByStudent[a.studentId]) daysByStudent[a.studentId] = { breakfast: 0, lunch: 0, dinner: 0 };
    if (a.breakfast) daysByStudent[a.studentId].breakfast += 1;
    if (a.lunch) daysByStudent[a.studentId].lunch += 1;
    if (a.dinner) daysByStudent[a.studentId].dinner += 1;
  });

  let totalMeals = 0;
  document.getElementById('mealStepBody').innerHTML = students.length
    ? students.map(s => {
        const d = daysByStudent[s.id] || { breakfast: 0, lunch: 0, dinner: 0 };
        const weighted = d.breakfast * 0.5 + d.lunch * 1 + d.dinner * 1;
        totalMeals += weighted;
        return `
          <tr>
            <td>${s.name}</td>
            <td class="num tabular">${d.breakfast} &times; 0.5</td>
            <td class="num tabular">${d.lunch} &times; 1</td>
            <td class="num tabular">${d.dinner} &times; 1</td>
            <td class="num tabular">${weighted.toFixed(1)}</td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="5">Add students first on the Students page.</td></tr>';
  document.getElementById('mealStepTotal').textContent = totalMeals.toFixed(1);

  // Step 3: the rate itself
  const mealRate = totalMeals > 0 ? totalGrocery / totalMeals : 0;
  document.getElementById('mrGrocery').textContent = totalGrocery.toFixed(2);
  document.getElementById('mrMeals').textContent = totalMeals.toFixed(1);
  document.getElementById('mrRate').textContent = mealRate.toFixed(2);
}

render();
