import { useMemo, useState } from 'react';
import { store } from '../lib/store';
import { currentMonthStr } from '../lib/utils';
import type { Student, Deposit, GroceryEntry, ManagerGroceryEntry } from '../types';
import PageHead from '../components/PageHead';
import StatStrip from '../components/StatStrip';

export default function Contribution() {
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [month, setMonth] = useState(currentMonthStr());

  const { stats, rows, avgDeposit } = useMemo(() => {
    const deposits = store.list<Deposit>('deposits').filter((d) => d.month === month);
    const groceries = store.list<GroceryEntry>('groceryEntries').filter((g) => g.month === month);
    const managerGroceries = store
      .list<ManagerGroceryEntry>('managerGroceryEntries')
      .filter((m) => m.month === month);

    const computedRows = students.map((s) => {
      const deposited = deposits.filter((d) => d.studentId === s.id).reduce((sum, d) => sum + Number(d.amount), 0);
      const grocerySpent = groceries
        .filter((g) => g.studentId === s.id)
        .reduce((sum, g) => sum + Number(g.amount), 0);
      return { id: s.id, name: s.name, deposited, grocerySpent, total: deposited + grocerySpent };
    });

    const totalDeposited = computedRows.reduce((sum, r) => sum + r.deposited, 0);
    const totalGrocery = computedRows.reduce((sum, r) => sum + r.grocerySpent, 0);
    const totalManagerGrocery = managerGroceries.reduce((sum, m) => sum + Number(m.amount), 0);
    const avg = students.length > 0 ? totalDeposited / students.length : 0;

    return {
      stats: [
        { label: 'total deposited', value: totalDeposited.toFixed(2) },
        { label: 'total personal grocery spending', value: totalGrocery.toFixed(2) },
        { label: 'manager (pool) spending', value: totalManagerGrocery.toFixed(2) },
        { label: 'average deposit / person', value: avg.toFixed(2), accent: true },
      ],
      rows: computedRows,
      avgDeposit: avg,
    };
  }, [month, students]);

  return (
    <>
      <PageHead title="Contribution overview">
        <div>
          <label htmlFor="coMonth" className="m-0 inline">
            Month
          </label>{' '}
          <input
            id="coMonth"
            type="month"
            className="!w-auto inline-block"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </PageHead>
      <p className="-mt-2.5 max-w-[560px] text-[0.9rem] text-ink-soft">
        Live view of deposits and grocery spending logged on the Mess calculation page &mdash; updates automatically
        as entries are added there. Rows below the group average deposit are flagged.
      </p>

      <StatStrip stats={stats} />

      <table className="roll">
        <thead>
          <tr>
            <th>Name</th>
            <th className="num">Deposited</th>
            <th className="num">Grocery spent</th>
            <th className="num">Total contribution</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            rows.map((r) => {
              const behind = r.deposited < avgDeposit * 0.5 && avgDeposit > 0;
              return (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="num tabular">{r.deposited.toFixed(2)}</td>
                  <td className="num tabular">{r.grocerySpent.toFixed(2)}</td>
                  <td className="num tabular">{r.total.toFixed(2)}</td>
                  <td>
                    {behind ? (
                      <span className="tag tag-full">deposit behind</span>
                    ) : (
                      <span className="tag">on track</span>
                    )}
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
    </>
  );
}
