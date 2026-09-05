import { store } from "./store.js";

const dateInput = document.getElementById('attDate');
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const toISODate = (d) => d.toISOString().slice(0, 10);

dateInput.value = toISODate(today);
dateInput.min = toISODate(yesterday);
dateInput.max = toISODate(today);
dateInput.onchange = () => {
  if (dateInput.value < dateInput.min) dateInput.value = dateInput.min;
  if (dateInput.value > dateInput.max) dateInput.value = dateInput.max;
  renderTable();
};
document.getElementById('cutoffMonth').value = new Date().toISOString().slice(0, 7);

function renderTable() {
  const students = store.list('students');
  const body = document.getElementById('attBody');
  const date = dateInput.value;

  body.innerHTML = students.length
    ? students.map(s => {
        const existing = store.getByKey('attendance', `${date}_${s.id}`);
        const checked = (meal) => existing && existing[meal] ? 'checked' : '';
        return `
          <tr data-student="${s.id}">
            <td>${s.name}</td>
            <td><span class="roll-badge">${s.rollNumber}</span></td>
            <td class="center"><input type="checkbox" class="meal-check" data-meal="breakfast" ${checked('breakfast')}></td>
            <td class="center"><input type="checkbox" class="meal-check" data-meal="lunch" ${checked('lunch')}></td>
            <td class="center"><input type="checkbox" class="meal-check" data-meal="dinner" ${checked('dinner')}></td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="5">Add students first on the Students page.</td></tr>';
}

window.saveAttendance = () => {
  const date = dateInput.value;
  const month = date.slice(0, 7);
  const students = store.list('students');
  const msg = document.getElementById('saveMsg');

  students.forEach(s => {
    const row = document.querySelector(`tr[data-student="${s.id}"]`);
    if (!row) return;
    const payload = {
      studentId: s.id,
      date,
      month,
      breakfast: row.querySelector('[data-meal="breakfast"]').checked,
      lunch: row.querySelector('[data-meal="lunch"]').checked,
      dinner: row.querySelector('[data-meal="dinner"]').checked,
    };
    store.upsertByKey('attendance', `${date}_${s.id}`, payload);
  });

  msg.innerHTML = `<div class="msg">Attendance saved for ${date}.</div>`;
};

window.clearDayCheckboxes = () => {
  document.querySelectorAll('.meal-check').forEach(cb => { cb.checked = false; });
  document.getElementById('saveMsg').innerHTML = '<div class="msg">All boxes cleared for this date &mdash; click Save to make it stick.</div>';
};

window.clearOldAttendance = () => {
  const cutoffMonth = document.getElementById('cutoffMonth').value;
  const msg = document.getElementById('clearMsg');
  if (!cutoffMonth) {
    msg.innerHTML = '<div class="msg error">Pick a month first \u2014 everything before it will be cleared.</div>';
    return;
  }
  if (!confirm(`Delete all attendance records before ${cutoffMonth}? This can't be undone.`)) return;

  const removed = store.removeWhere('attendance', (a) => a.month < cutoffMonth);
  msg.innerHTML = `<div class="msg">Cleared ${removed} attendance record${removed === 1 ? '' : 's'} from before ${cutoffMonth}.</div>`;
};

renderTable();
