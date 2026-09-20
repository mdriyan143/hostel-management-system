import { store } from "./store.js";

function loadRooms() {
  const body = document.getElementById('roomBody');
  const rooms = store.list('rooms');
  const students = store.list('students');

  const occupancy = {};
  students.forEach(s => { if (s.roomId) occupancy[s.roomId] = (occupancy[s.roomId] || 0) + 1; });

  body.innerHTML = rooms.length
    ? rooms.map(r => {
        const occupied = occupancy[r.id] || 0;
        return `
          <tr>
            <td>${r.roomNumber}</td>
            <td class="num tabular">${occupied} ${occupied >= r.capacity ? '<span class="tag full">full</span>' : ''}</td>
            <td class="num tabular">${r.capacity}</td>
            <td class="num tabular">${Number(r.rent || 0).toFixed(2)}</td>
            <td>
              <button class="ghost" onclick='editRoom(${JSON.stringify(r)})'>Edit</button>
              <button class="danger" onclick="deleteRoom('${r.id}')">Delete</button>
            </td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="5">No rooms yet. Add your first one.</td></tr>';
}

window.openForm = () => {
  document.getElementById('formTitle').textContent = 'Add room';
  document.getElementById('roomId').value = '';
  ['roomNumber', 'roomCapacity', 'roomRent'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('formMsg').innerHTML = '';
  document.getElementById('formPanel').style.display = 'block';
};

window.closeForm = () => { document.getElementById('formPanel').style.display = 'none'; };

window.editRoom = (room) => {
  document.getElementById('formTitle').textContent = 'Edit room';
  document.getElementById('roomId').value = room.id;
  document.getElementById('roomNumber').value = room.roomNumber;
  document.getElementById('roomCapacity').value = room.capacity;
  document.getElementById('roomRent').value = room.rent || 0;
  document.getElementById('formPanel').style.display = 'block';
};

window.saveRoom = () => {
  const id = document.getElementById('roomId').value;
  const payload = {
    roomNumber: document.getElementById('roomNumber').value.trim(),
    capacity: parseInt(document.getElementById('roomCapacity').value, 10),
    rent: parseFloat(document.getElementById('roomRent').value || 0),
  };
  const msg = document.getElementById('formMsg');
  try {
    if (id) store.update('rooms', id, payload);
    else store.add('rooms', payload);
    window.closeForm();
    loadRooms();
  } catch (error) {
    msg.innerHTML = `<div class="msg error">${error.message}</div>`;
  }
};

window.deleteRoom = (id) => {
  if (!confirm('Remove this room?')) return;
  store.remove('rooms', id);
  loadRooms();
};

loadRooms();
