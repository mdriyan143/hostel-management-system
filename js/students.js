import { store } from "./store.js";

let rooms = [];

function loadRoomOptions() {
  rooms = store.list('rooms');
  const select = document.getElementById('sRoom');
  select.innerHTML = '<option value="">Unassigned</option>' +
    rooms.map(r => `<option value="${r.id}">${r.roomNumber}</option>`).join('');
}

function roomLabel(roomId) {
  const room = rooms.find(r => r.id === roomId);
  return room ? room.roomNumber : '\u2014';
}

function loadStudents() {
  const body = document.getElementById('studentBody');
  const students = store.list('students');
  body.innerHTML = students.length
    ? students.map(s => `
        <tr>
          <td>${s.name}</td>
          <td><span class="roll-badge">${s.rollNumber}</span></td>
          <td>${roomLabel(s.roomId)}</td>
          <td>${s.contact || '\u2014'}</td>
          <td>
            <button class="ghost" onclick='editStudent(${JSON.stringify(s)})'>Edit</button>
            <button class="danger" onclick="deleteStudent('${s.id}')">Delete</button>
          </td>
        </tr>`).join('')
    : '<tr><td colspan="5">No students yet. Add your first one.</td></tr>';
}

window.openForm = () => {
  document.getElementById('formTitle').textContent = 'Add student';
  document.getElementById('studentId').value = '';
  ['sName', 'sRoll', 'sContact', 'sGuardian'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('sRoom').value = '';
  document.getElementById('formMsg').innerHTML = '';
  document.getElementById('formPanel').style.display = 'block';
};

window.closeForm = () => { document.getElementById('formPanel').style.display = 'none'; };

window.editStudent = (student) => {
  document.getElementById('formTitle').textContent = 'Edit student';
  document.getElementById('studentId').value = student.id;
  document.getElementById('sName').value = student.name;
  document.getElementById('sRoll').value = student.rollNumber;
  document.getElementById('sRoom').value = student.roomId || '';
  document.getElementById('sContact').value = student.contact || '';
  document.getElementById('sGuardian').value = student.guardianContact || '';
  document.getElementById('formPanel').style.display = 'block';
};

window.saveStudent = () => {
  const id = document.getElementById('studentId').value;
  const payload = {
    name: document.getElementById('sName').value.trim(),
    rollNumber: document.getElementById('sRoll').value.trim(),
    roomId: document.getElementById('sRoom').value || null,
    contact: document.getElementById('sContact').value.trim(),
    guardianContact: document.getElementById('sGuardian').value.trim(),
  };
  const msg = document.getElementById('formMsg');
  try {
    if (id) store.update('students', id, payload);
    else store.add('students', payload);
    window.closeForm();
    loadStudents();
  } catch (error) {
    msg.innerHTML = `<div class="msg error">${error.message}</div>`;
  }
};

window.deleteStudent = (id) => {
  if (!confirm('Remove this student?')) return;
  store.remove('students', id);
  loadStudents();
};

loadRoomOptions();
loadStudents();
