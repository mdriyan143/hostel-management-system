import { useState } from 'react';
import { store } from '../lib/store';
import { todayISODate, currentMonthStr } from '../lib/utils';
import type { MealFlags } from '../lib/utils';
import type { Student, AttendanceRecord } from '../types';
import PageHead from '../components/PageHead';
import Message from '../components/Message';
import Button from '../components/Button';

type ChecksMap = Record<string, MealFlags>;

function loadChecksForDate(students: Student[], date: string): ChecksMap {
  const checks: ChecksMap = {};
  students.forEach((s) => {
    const existing = store.getByKey<AttendanceRecord>('attendance', `${date}_${s.id}`);
    checks[s.id] = {
      breakfast: !!(existing && existing.breakfast),
      lunch: !!(existing && existing.lunch),
      dinner: !!(existing && existing.dinner),
    };
  });
  return checks;
}

export default function Attendance() {
  const today = todayISODate();
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [date, setDate] = useState(today);
  const [checks, setChecks] = useState<ChecksMap>(() => loadChecksForDate(students, today));
  const [saveMsg, setSaveMsg] = useState('');
  const [cutoffMonth, setCutoffMonth] = useState(currentMonthStr());
  const [clearMsg, setClearMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });

  function handleDateChange(value: string) {
    const clamped = value > today ? today : value;
    setDate(clamped);
    setChecks(loadChecksForDate(students, clamped));
  }

  function toggleMeal(studentId: string, meal: keyof MealFlags) {
    setChecks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [meal]: !prev[studentId][meal] },
    }));
  }

  function saveAttendance() {
    const month = date.slice(0, 7);
    students.forEach((s) => {
      const flags = checks[s.id] || { breakfast: false, lunch: false, dinner: false };
      store.upsertByKey<AttendanceRecord>('attendance', `${date}_${s.id}`, {
        studentId: s.id,
        date,
        month,
        breakfast: flags.breakfast,
        lunch: flags.lunch,
        dinner: flags.dinner,
      });
    });
    setSaveMsg(`Attendance saved for ${date}.`);
  }

  function clearDayCheckboxes() {
    const cleared: ChecksMap = {};
    students.forEach((s) => {
      cleared[s.id] = { breakfast: false, lunch: false, dinner: false };
    });
    setChecks(cleared);
    setSaveMsg('All boxes cleared for this date \u2014 click Save to make it stick.');
  }

  function clearOldAttendance() {
    if (!cutoffMonth) {
      setClearMsg({ text: 'Pick a month first \u2014 everything before it will be cleared.', error: true });
      return;
    }
    if (!confirm(`Delete all attendance records before ${cutoffMonth}? This can't be undone.`)) return;
    const removed = store.removeWhere<AttendanceRecord>('attendance', (a) => a.month < cutoffMonth);
    setClearMsg({
      text: `Cleared ${removed} attendance record${removed === 1 ? '' : 's'} from before ${cutoffMonth}.`,
      error: false,
    });
  }

  return (
    <>
      <PageHead title="Mess attendance">
        <div>
          <label htmlFor="attDate" className="m-0 inline">
            Date
          </label>{' '}
          <input
            id="attDate"
            type="date"
            className="!w-auto inline-block"
            value={date}
            max={today}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </PageHead>

      <p className="-mt-2.5 max-w-[480px] text-[0.9rem] text-ink-soft">
        Any past date can be marked, but future dates are blocked to keep the roll call honest. Breakfast counts as
        0.5 of a meal, lunch and dinner each count as 1.
      </p>

      <Message text={saveMsg} />

      <table className="roll">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th className="center">Breakfast (0.5)</th>
            <th className="center">Lunch (1)</th>
            <th className="center">Dinner (1)</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            students.map((s) => {
              const flags = checks[s.id] || { breakfast: false, lunch: false, dinner: false };
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    <span className="roll-badge">{s.rollNumber}</span>
                  </td>
                  <td className="center">
                    <input
                      type="checkbox"
                      className="meal-check"
                      checked={flags.breakfast}
                      onChange={() => toggleMeal(s.id, 'breakfast')}
                    />
                  </td>
                  <td className="center">
                    <input
                      type="checkbox"
                      className="meal-check"
                      checked={flags.lunch}
                      onChange={() => toggleMeal(s.id, 'lunch')}
                    />
                  </td>
                  <td className="center">
                    <input
                      type="checkbox"
                      className="meal-check"
                      checked={flags.dinner}
                      onChange={() => toggleMeal(s.id, 'dinner')}
                    />
                  </td>
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

      <div className="mt-[18px] flex gap-2.5">
        <Button onClick={saveAttendance}>Save roll call for this date</Button>
        <Button variant="ghost" onClick={clearDayCheckboxes}>
          Clear this day (unchecked, not saved yet)
        </Button>
      </div>

      <h2 className="mt-9">Month-end housekeeping</h2>
      <p className="max-w-[480px] text-[0.9rem] text-ink-soft">
        Once a month's meals are settled on the Mess calculation page, you can clear its attendance records to keep
        things tidy. Students, rooms, and rent are untouched.
      </p>
      <label htmlFor="cutoffMonth" className="max-w-[160px]">
        Clear before month
      </label>
      <input
        id="cutoffMonth"
        type="month"
        className="max-w-[160px]"
        value={cutoffMonth}
        onChange={(e) => setCutoffMonth(e.target.value)}
      />
      <div>
        <Button variant="danger" className="mt-2.5" onClick={clearOldAttendance}>
          Clear attendance older than this month
        </Button>
      </div>
      <Message text={clearMsg.text} error={clearMsg.error} />
    </>
  );
}
