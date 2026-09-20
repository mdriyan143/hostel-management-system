import { useMemo, useState } from 'react';
import { store } from '../lib/store';
import { currentMonthStr } from '../lib/utils';
import type { Student, Room, UtilityEntry } from '../types';
import PageHead from '../components/PageHead';
import Message from '../components/Message';
import Button from '../components/Button';

const CATEGORIES: UtilityEntry['category'][] = ['Water', 'Gas', 'Electricity', 'Cooking'];

export default function Billing() {
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [rooms] = useState<Room[]>(() => store.list<Room>('rooms'));
  const [month, setMonth] = useState(currentMonthStr());
  const [entriesVersion, setEntriesVersion] = useState(0);

  const [category, setCategory] = useState<UtilityEntry['category']>('Water');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [utilityMsg, setUtilityMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [clearMsg, setClearMsg] = useState('');

  const roomFor = useMemo(() => {
    const map = new Map(rooms.map((r) => [r.id, r]));
    return (student: Student) => (student.roomId ? map.get(student.roomId) || null : null);
  }, [rooms]);

  const { entries, total, share } = useMemo(() => {
    // entriesVersion forces a refetch after add/remove/clear
    void entriesVersion;
    const list = store.list<UtilityEntry>('utilityEntries').filter((u) => u.month === month);
    const t = list.reduce((sum, u) => sum + Number(u.amount), 0);
    const s = students.length > 0 ? t / students.length : 0;
    return { entries: list, total: t, share: s };
  }, [month, entriesVersion, students]);

  function addUtility() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setUtilityMsg({ text: 'Enter a valid amount.', error: true });
      return;
    }
    store.add<UtilityEntry>('utilityEntries', { category, amount: amt, note: note.trim(), month });
    setAmount('');
    setNote('');
    setUtilityMsg({ text: '', error: false });
    setEntriesVersion((v) => v + 1);
  }

  function removeUtility(id: string) {
    store.remove('utilityEntries', id);
    setEntriesVersion((v) => v + 1);
  }

  function clearOldUtilities() {
    if (!confirm(`Delete all utility entries before ${month}? This can't be undone.`)) return;
    const removed = store.removeWhere<UtilityEntry>('utilityEntries', (u) => u.month < month);
    setClearMsg(`Cleared ${removed} entr${removed === 1 ? 'y' : 'ies'} from before ${month}.`);
    setEntriesVersion((v) => v + 1);
  }

  return (
    <>
      <PageHead title="Household bills">
        <div>
          <label htmlFor="billMonth" className="m-0 inline">
            Month
          </label>{' '}
          <input
            id="billMonth"
            type="month"
            className="!w-auto inline-block"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </PageHead>
      <p className="-mt-2.5 max-w-[560px] text-[0.9rem] text-ink-soft">
        Room rent is billed per-person from their assigned room. Water, gas, electricity, and cooking bills are
        logged here and split equally across everyone &mdash; entirely separate from mess/grocery calculation.
      </p>

      <h2 className="mt-6">Utility &amp; cooking bills</h2>
      <div className="field-row">
        <div>
          <label htmlFor="uCategory">Category</label>
          <select
            id="uCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value as UtilityEntry['category'])}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'Cooking' ? 'Cooking bill' : c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="uAmount">Amount</label>
          <input
            id="uAmount"
            type="number"
            step="0.01"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="uNote">Note</label>
          <input id="uNote" placeholder="optional" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <Button className="mt-2.5" onClick={addUtility}>
        Add bill entry
      </Button>
      <Message text={utilityMsg.text} error={utilityMsg.error} />

      <table className="roll mt-3.5">
        <thead>
          <tr>
            <th>Category</th>
            <th>Note</th>
            <th className="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.length ? (
            entries.map((u) => (
              <tr key={u.id}>
                <td>{u.category}</td>
                <td>{u.note || '\u2014'}</td>
                <td className="num tabular">{Number(u.amount).toFixed(2)}</td>
                <td>
                  <Button variant="danger" onClick={() => removeUtility(u.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No utility bills logged for this month yet.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>
              <strong>Total utilities</strong>
            </td>
            <td className="num tabular">{total.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <h2 className="mt-8">Per-person breakdown</h2>
      <table className="roll">
        <thead>
          <tr>
            <th>Name</th>
            <th>Room</th>
            <th className="num">Room rent</th>
            <th className="num">Utility share</th>
            <th className="num">Total due</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            students.map((s) => {
              const room = roomFor(s);
              const rent = room ? Number(room.rent || 0) : 0;
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{room ? room.roomNumber : '\u2014'}</td>
                  <td className="num tabular">{rent.toFixed(2)}</td>
                  <td className="num tabular">{share.toFixed(2)}</td>
                  <td className="num tabular">{(rent + share).toFixed(2)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5}>Add students first on the Students page.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-9">Month-end housekeeping</h2>
      <p className="max-w-[480px] text-[0.9rem] text-ink-soft">
        Once a month's bills are settled, clear its utility entries to keep the log short. Rooms, rent, and students
        stay untouched.
      </p>
      <Button variant="danger" onClick={clearOldUtilities}>
        Clear utility entries older than selected month
      </Button>
      <Message text={clearMsg} />
    </>
  );
}
