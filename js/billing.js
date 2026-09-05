import { store } from "./store.js";

const students = store.list('students');
const rooms = store.list('rooms');
const monthInput = document.getElementById('billMonth');
monthInput.value = new Date().toISOString().slice(0, 7);
monthInput.onchange = render;

function roomFor(student) {
  return rooms.find(r => r.id === student.roomId) || null;
}

function render() {
  const month = monthInput.value;
  const entries = store.list('utilityEntries').filter(u => u.month === month);

  document.getElementById('utilityBody').innerHTML = entries.length
    ? entries.map(u => `
        <tr>
          <td>${u.category}</td>
          <td>${u.note || '\u2014'}</td>
          <td class="num tabular">${Number(u.amount).toFixed(2)}</td>
          <td><button class="danger" onclick="removeUtility('${u.id}')">Delete</button></td>
        </tr>`).join('')
    : '<tr><td colspan="4">No utility bills logged for this month yet.</td></tr>';

  const total = entries.reduce((sum, u) => sum + Number(u.amount), 0);
  document.getElementById('utilityTotal').textContent = total.toFixed(2);

  const share = students.length > 0 ? total / students.length : 0;
  document.getElementById('breakdownBody').innerHTML = students.length
    ? students.map(s => {
        const room = roomFor(s);
        const rent = room ? Number(room.rent || 0) : 0;
        return `
          <tr>
            <td>${s.name}</td>
            <td>${room ? room.roomNumber : '\u2014'}</td>
            <td class="num tabular">${rent.toFixed(2)}</td>
            <td class="num tabular">${share.toFixed(2)}</td>
            <td class="num tabular">${(rent + share).toFixed(2)}</td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="5">Add students first on the Students page.</td></tr>';
}

window.addUtility = () => {
  const amount = parseFloat(document.getElementById('uAmount').value);
  const msg = document.getElementById('utilityMsg');
  if (!amount || amount <= 0) { msg.innerHTML = '<div class="msg error">Enter a valid amount.</div>'; return; }
  store.add('utilityEntries', {
    category: document.getElementById('uCategory').value,
    amount,
    note: document.getElementById('uNote').value.trim(),
    month: monthInput.value,
  });
  document.getElementById('uAmount').value = '';
  document.getElementById('uNote').value = '';
  msg.innerHTML = '';
  render();
};

window.removeUtility = (id) => {
  store.remove('utilityEntries', id);
  render();
};

window.clearOldUtilities = () => {
  const cutoffMonth = monthInput.value;
  const msg = document.getElementById('clearMsg');
  if (!confirm(`Delete all utility entries before ${cutoffMonth}? This can't be undone.`)) return;
  const removed = store.removeWhere('utilityEntries', (u) => u.month < cutoffMonth);
  msg.innerHTML = `<div class="msg">Cleared ${removed} entr${removed === 1 ? 'y' : 'ies'} from before ${cutoffMonth}.</div>`;
  render();
};

render();
