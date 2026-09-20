import { useMemo, useState } from 'react';
import { store } from '../lib/store';
import type { Student, Room } from '../types';
import PageHead from '../components/PageHead';
import Message from '../components/Message';
import Button from '../components/Button';

interface FormState {
  id: string;
  name: string;
  rollNumber: string;
  roomId: string;
  contact: string;
  guardianContact: string;
}

const emptyForm: FormState = { id: '', name: '', rollNumber: '', roomId: '', contact: '', guardianContact: '' };

export default function Students() {
  const [rooms] = useState<Room[]>(() => store.list<Room>('rooms'));
  const [students, setStudents] = useState<Student[]>(() => store.list<Student>('students'));
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formMsg, setFormMsg] = useState('');

  const roomLabel = useMemo(() => {
    const map = new Map(rooms.map((r) => [r.id, r.roomNumber]));
    return (roomId: string | null) => (roomId && map.get(roomId)) || '\u2014';
  }, [rooms]);

  function refresh() {
    setStudents(store.list<Student>('students'));
  }

  function openForm() {
    setForm(emptyForm);
    setFormMsg('');
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  function editStudent(student: Student) {
    setForm({
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      roomId: student.roomId || '',
      contact: student.contact || '',
      guardianContact: student.guardianContact || '',
    });
    setFormMsg('');
    setFormOpen(true);
  }

  function saveStudent() {
    const payload = {
      name: form.name.trim(),
      rollNumber: form.rollNumber.trim(),
      roomId: form.roomId || null,
      contact: form.contact.trim(),
      guardianContact: form.guardianContact.trim(),
    };
    try {
      if (form.id) store.update<Student>('students', form.id, payload);
      else store.add<Student>('students', payload);
      closeForm();
      refresh();
    } catch (error) {
      setFormMsg(error instanceof Error ? error.message : String(error));
    }
  }

  function deleteStudent(id: string) {
    if (!confirm('Remove this student?')) return;
    store.remove('students', id);
    refresh();
  }

  return (
    <>
      <PageHead title="Students">
        <Button onClick={openForm}>Add student</Button>
      </PageHead>

      {formOpen && (
        <div className="mb-6 border border-dotted border-line p-5">
          <h3>{form.id ? 'Edit student' : 'Add student'}</h3>
          <div className="field-row">
            <div>
              <label htmlFor="sName">Name</label>
              <input id="sName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sRoll">Roll / ID number</label>
              <input
                id="sRoll"
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="field-row">
            <div>
              <label htmlFor="sRoom">Room</label>
              <select id="sRoom" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
                <option value="">Unassigned</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sContact">Contact number</label>
              <input
                id="sContact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="sGuardian">Guardian contact</label>
              <input
                id="sGuardian"
                value={form.guardianContact}
                onChange={(e) => setForm({ ...form, guardianContact: e.target.value })}
              />
            </div>
          </div>
          <Message text={formMsg} error />
          <div className="mt-4 flex gap-2.5">
            <Button onClick={saveStudent}>Save</Button>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <table className="roll">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Room</th>
            <th>Contact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  <span className="roll-badge">{s.rollNumber}</span>
                </td>
                <td>{roomLabel(s.roomId)}</td>
                <td>{s.contact || '\u2014'}</td>
                <td className="flex gap-2">
                  <Button variant="ghost" onClick={() => editStudent(s)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => deleteStudent(s.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No students yet. Add your first one.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
