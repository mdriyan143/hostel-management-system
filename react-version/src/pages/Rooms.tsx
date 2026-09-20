import { useMemo, useState } from 'react';
import { store } from '../lib/store';
import type { Room, Student } from '../types';
import PageHead from '../components/PageHead';
import Message from '../components/Message';
import Button from '../components/Button';

interface FormState {
  id: string;
  roomNumber: string;
  capacity: string;
  rent: string;
}

const emptyForm: FormState = { id: '', roomNumber: '', capacity: '', rent: '' };

export default function Rooms() {
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [rooms, setRooms] = useState<Room[]>(() => store.list<Room>('rooms'));
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formMsg, setFormMsg] = useState('');

  const occupancy = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      if (s.roomId) map[s.roomId] = (map[s.roomId] || 0) + 1;
    });
    return map;
  }, [students]);

  function refresh() {
    setRooms(store.list<Room>('rooms'));
  }

  function openForm() {
    setForm(emptyForm);
    setFormMsg('');
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  function editRoom(room: Room) {
    setForm({
      id: room.id,
      roomNumber: room.roomNumber,
      capacity: String(room.capacity),
      rent: String(room.rent || 0),
    });
    setFormMsg('');
    setFormOpen(true);
  }

  function saveRoom() {
    const payload = {
      roomNumber: form.roomNumber.trim(),
      capacity: parseInt(form.capacity, 10),
      rent: parseFloat(form.rent || '0'),
    };
    try {
      if (form.id) store.update<Room>('rooms', form.id, payload);
      else store.add<Room>('rooms', payload);
      closeForm();
      refresh();
    } catch (error) {
      setFormMsg(error instanceof Error ? error.message : String(error));
    }
  }

  function deleteRoom(id: string) {
    if (!confirm('Remove this room?')) return;
    store.remove('rooms', id);
    refresh();
  }

  return (
    <>
      <PageHead title="Rooms">
        <Button onClick={openForm}>Add room</Button>
      </PageHead>

      {formOpen && (
        <div className="mb-6 border border-dotted border-line p-5">
          <h3>{form.id ? 'Edit room' : 'Add room'}</h3>
          <div className="field-row">
            <div>
              <label htmlFor="roomNumber">Room number</label>
              <input
                id="roomNumber"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="roomCapacity">Capacity</label>
              <input
                id="roomCapacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="roomRent">Monthly rent</label>
              <input
                id="roomRent"
                type="number"
                min={0}
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
              />
            </div>
          </div>
          <Message text={formMsg} error />
          <div className="mt-4 flex gap-2.5">
            <Button onClick={saveRoom}>Save</Button>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <table className="roll">
        <thead>
          <tr>
            <th>Room</th>
            <th className="num">Occupied</th>
            <th className="num">Capacity</th>
            <th className="num">Rent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.length ? (
            rooms.map((r) => {
              const occupied = occupancy[r.id] || 0;
              return (
                <tr key={r.id}>
                  <td>{r.roomNumber}</td>
                  <td className="num tabular">
                    {occupied} {occupied >= r.capacity ? <span className="tag tag-full">full</span> : null}
                  </td>
                  <td className="num tabular">{r.capacity}</td>
                  <td className="num tabular">{Number(r.rent || 0).toFixed(2)}</td>
                  <td className="flex gap-2">
                    <Button variant="ghost" onClick={() => editRoom(r)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => deleteRoom(r.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5}>No rooms yet. Add your first one.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
