import { useMemo, useState } from 'react';
import { store } from '../lib/store';
import { currentMonthStr, daysInMonth } from '../lib/utils';
import type { Student, AttendanceRecord } from '../types';
import PageHead from '../components/PageHead';

function cellClass(meals: number | null): string {
  if (meals === null) return 'cell-blank';
  if (meals <= 0) return 'cell-0';
  if (meals <= 0.5) return 'cell-1';
  if (meals <= 1) return 'cell-2';
  if (meals <= 1.5) return 'cell-3';
  if (meals <= 2) return 'cell-4';
  return 'cell-5';
}

export default function Overview() {
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [month, setMonth] = useState(currentMonthStr());

  const { days, dayTotals, grandTotal, mealLookup } = useMemo(() => {
    const dayCount = daysInMonth(month);
    const daysArr = Array.from({ length: dayCount }, (_, i) => i + 1);

    const lookup: Record<string, number> = {};
    store
      .list<AttendanceRecord>('attendance')
      .filter((a) => a.month === month)
      .forEach((a) => {
        const day = Number(a.date.split('-')[2]);
        const meals = (a.breakfast ? 0.5 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0);
        lookup[`${day}_${a.studentId}`] = meals;
      });

    const totals = daysArr.map((day) =>
      students.reduce((sum, s) => {
        const val = lookup[`${day}_${s.id}`];
        return sum + (val || 0);
      }, 0)
    );
    const grand = totals.reduce((sum, n) => sum + n, 0);

    return { days: daysArr, dayTotals: totals, grandTotal: grand, mealLookup: lookup };
  }, [month, students]);

  return (
    <>
      <PageHead title="Meal overview">
        <div>
          <label htmlFor="ovMonth" className="m-0 inline">
            Month
          </label>{' '}
          <input
            id="ovMonth"
            type="month"
            className="!w-auto inline-block"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </PageHead>

      <p className="text-[0.9rem] text-ink-soft">
        Each cell is one person's weighted meal total for that day (breakfast 0.5, lunch 1, dinner 1 &mdash; max
        2.5/day). Blank means attendance wasn't marked that day.
      </p>

      <div className="legend">
        <span>Fewer meals</span>
        <span className="swatch" style={{ background: '#F1E9DC' }}></span>
        <span className="swatch" style={{ background: '#DCE8DB' }}></span>
        <span className="swatch" style={{ background: '#C1D9BF' }}></span>
        <span className="swatch" style={{ background: '#A3C8A0' }}></span>
        <span className="swatch" style={{ background: '#83B47F' }}></span>
        <span className="swatch" style={{ background: 'var(--color-sage-dark)' }}></span>
        <span>More meals</span>
        <span className="swatch ml-5" style={{ background: 'var(--color-parchment)', borderStyle: 'dashed' }}></span>
        <span>Not marked</span>
      </div>

      <div className="heatmap-wrap">
        <table className="heatmap">
          {students.length ? (
            <>
              <thead>
                <tr>
                  <th className="name-col">Name</th>
                  {days.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                  <th className="total-col">Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  let rowTotal = 0;
                  return (
                    <tr key={s.id}>
                      <td className="name-col">{s.name}</td>
                      {days.map((day) => {
                        const key = `${day}_${s.id}`;
                        const val = key in mealLookup ? mealLookup[key] : null;
                        if (val !== null) rowTotal += val;
                        return (
                          <td key={day} className={cellClass(val)}>
                            {val !== null ? val : ''}
                          </td>
                        );
                      })}
                      <td className="total-col">{rowTotal.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="name-col total-col">Daily total</td>
                  {dayTotals.map((t, i) => (
                    <td key={i} className="total-col">
                      {t.toFixed(1)}
                    </td>
                  ))}
                  <td className="total-col">{grandTotal.toFixed(1)}</td>
                </tr>
              </tfoot>
            </>
          ) : (
            <tbody>
              <tr>
                <td>Add students first on the Students page.</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}
