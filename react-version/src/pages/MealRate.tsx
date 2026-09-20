import { useMemo, useState } from 'react';
import { store } from '../lib/store';
import { currentMonthStr } from '../lib/utils';
import type { Student, GroceryEntry, ManagerGroceryEntry, AttendanceRecord } from '../types';
import PageHead from '../components/PageHead';

interface DayCounts {
  breakfast: number;
  lunch: number;
  dinner: number;
}

export default function MealRate() {
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [month, setMonth] = useState(currentMonthStr());

  const data = useMemo(() => {
    const groceries = store.list<GroceryEntry>('groceryEntries').filter((g) => g.month === month);
    const managerGroceries = store
      .list<ManagerGroceryEntry>('managerGroceryEntries')
      .filter((m) => m.month === month);

    const personalByStudent: Record<string, number> = {};
    groceries.forEach((g) => {
      personalByStudent[g.studentId] = (personalByStudent[g.studentId] || 0) + Number(g.amount);
    });

    const totalPersonal = Object.values(personalByStudent).reduce((sum, n) => sum + n, 0);
    const totalManager = managerGroceries.reduce((sum, m) => sum + Number(m.amount), 0);
    const totalGrocery = totalPersonal + totalManager;

    const attendance = store.list<AttendanceRecord>('attendance').filter((a) => a.month === month);
    const daysByStudent: Record<string, DayCounts> = {};
    attendance.forEach((a) => {
      if (!daysByStudent[a.studentId]) daysByStudent[a.studentId] = { breakfast: 0, lunch: 0, dinner: 0 };
      if (a.breakfast) daysByStudent[a.studentId].breakfast += 1;
      if (a.lunch) daysByStudent[a.studentId].lunch += 1;
      if (a.dinner) daysByStudent[a.studentId].dinner += 1;
    });

    let totalMeals = 0;
    const mealRows = students.map((s) => {
      const d = daysByStudent[s.id] || { breakfast: 0, lunch: 0, dinner: 0 };
      const weighted = d.breakfast * 0.5 + d.lunch * 1 + d.dinner * 1;
      totalMeals += weighted;
      return { id: s.id, name: s.name, ...d, weighted };
    });

    const mealRate = totalMeals > 0 ? totalGrocery / totalMeals : 0;

    return { personalByStudent, totalManager, totalGrocery, mealRows, totalMeals, mealRate };
  }, [month, students]);

  return (
    <>
      <PageHead title="Meal rate breakdown">
        <div>
          <label htmlFor="mrMonth" className="m-0 inline">
            Month
          </label>{' '}
          <input
            id="mrMonth"
            type="month"
            className="!w-auto inline-block"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </PageHead>
      <p className="-mt-2.5 max-w-[600px] text-[0.9rem] text-ink-soft">
        A transparent, step-by-step look at how the meal rate on the Mess calculation page is worked out for this
        month &mdash; so everyone can verify it themselves.
      </p>

      <h2 className="mt-7">Step 1 &mdash; Total grocery cost</h2>
      <p className="text-[0.88rem] text-ink-soft">
        Personal grocery spending per person, plus manager purchases made from the deposited pool (not tied to any
        one person).
      </p>
      <table className="roll">
        <thead>
          <tr>
            <th>Person</th>
            <th className="num">Personal grocery spending</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            students.some((s) => (data.personalByStudent[s.id] || 0) !== 0) ? (
              students
                .filter((s) => (data.personalByStudent[s.id] || 0) !== 0)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="num tabular">{(data.personalByStudent[s.id] || 0).toFixed(2)}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={2}>No personal grocery spending logged for this month yet.</td>
              </tr>
            )
          ) : (
            <tr>
              <td colSpan={2}>Add students first on the Students page.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td>Manager (pool) purchases</td>
            <td className="num tabular">{data.totalManager.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <strong>Total grocery cost</strong>
            </td>
            <td className="num tabular">{data.totalGrocery.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 className="mt-8">Step 2 &mdash; Total meals eaten</h2>
      <p className="text-[0.88rem] text-ink-soft">
        For each person: breakfast days &times; 0.5, plus lunch days &times; 1, plus dinner days &times; 1.
      </p>
      <table className="roll">
        <thead>
          <tr>
            <th>Person</th>
            <th className="num">Breakfast days</th>
            <th className="num">Lunch days</th>
            <th className="num">Dinner days</th>
            <th className="num">Weighted total</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            data.mealRows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="num tabular">{r.breakfast} &times; 0.5</td>
                <td className="num tabular">{r.lunch} &times; 1</td>
                <td className="num tabular">{r.dinner} &times; 1</td>
                <td className="num tabular">{r.weighted.toFixed(1)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>Add students first on the Students page.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>
              <strong>Total meals (everyone)</strong>
            </td>
            <td className="num tabular">{data.totalMeals.toFixed(1)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 className="mt-8">Step 3 &mdash; Meal rate</h2>
      <div className="bill-panel max-w-[480px]">
        <div className="bill-line">
          <span>Total grocery cost (own money + pool)</span>
          <span className="tabular">{data.totalGrocery.toFixed(2)}</span>
        </div>
        <div className="bill-line">
          <span>&divide; Total meals (everyone)</span>
          <span className="tabular">{data.totalMeals.toFixed(1)}</span>
        </div>
        <div className="bill-total">
          <span>= Meal rate (per meal)</span>
          <span className="tabular">{data.mealRate.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}
