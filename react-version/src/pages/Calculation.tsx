import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { store } from '../lib/store';
import { currentMonthStr } from '../lib/utils';
import type {
  Student,
  GroceryEntry,
  ManagerGroceryEntry,
  Deposit,
  BibidhEntry,
  AttendanceRecord,
  Settlement,
  CollectionName,
} from '../types';
import PageHead from '../components/PageHead';
import Message from '../components/Message';
import Button from '../components/Button';

function studentName(students: Student[], id: string): string {
  const s = students.find((s) => s.id === id);
  return s ? s.name : 'Unknown';
}

function SettlementPanel({ data }: { data: Settlement }) {
  const totalDeposits = data.totalDeposits || 0;
  const managerBalance = totalDeposits - data.totalManagerGrocery;
  let managerLine: ReactNode;
  if (managerBalance > 0) {
    managerLine = (
      <>
        Manager is holding <strong className="amt-positive">{managerBalance.toFixed(2)} extra</strong> (deposits
        collected minus what was spent on groceries).
      </>
    );
  } else if (managerBalance < 0) {
    managerLine = (
      <>
        Manager spent <strong className="amt-negative">{Math.abs(managerBalance).toFixed(2)} more</strong> than was
        deposited &mdash; needs reimbursing from the group.
      </>
    );
  } else {
    managerLine = <>Manager's pool is exactly balanced &mdash; nothing extra, nothing owed.</>;
  }

  return (
    <>
      <div className="stat-strip mt-5 flex-wrap">
        <div className="stat">
          <div className="label">total deposits collected</div>
          <div className="value tabular">{totalDeposits.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="label">manager (pool) spending</div>
          <div className="value tabular">{data.totalManagerGrocery.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="label">personal grocery spending</div>
          <div className="value tabular">{data.totalPersonalGrocery.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="label">total meals (all people)</div>
          <div className="value tabular">{data.totalMeals.toFixed(1)}</div>
        </div>
        <div className="stat">
          <div className="label">meal rate</div>
          <div className="value accent tabular">{data.mealRate.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="label">bibidh / person</div>
          <div className="value tabular">{data.bibidhShare.toFixed(2)}</div>
        </div>
      </div>
      <p className="msg mt-0">{managerLine}</p>
      <table className="roll">
        <thead>
          <tr>
            <th>Name</th>
            <th className="num">Meals</th>
            <th className="num">Meal cost</th>
            <th className="num">Bibidh share</th>
            <th className="num">Final cost</th>
            <th className="num">Contribution</th>
            <th className="num">Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td className="num tabular">{r.meals.toFixed(1)}</td>
              <td className="num tabular">{r.mealCost.toFixed(2)}</td>
              <td className="num tabular">{r.bibidhShare.toFixed(2)}</td>
              <td className="num tabular">{r.finalCost.toFixed(2)}</td>
              <td className="num tabular">{r.contribution.toFixed(2)}</td>
              <td className={`num tabular ${r.balance >= 0 ? 'amt-positive' : 'amt-negative'}`}>
                {r.balance >= 0 ? `+${r.balance.toFixed(2)} (gets back)` : `${r.balance.toFixed(2)} (owes)`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function Calculation() {
  const [students] = useState<Student[]>(() => store.list<Student>('students'));
  const [month, setMonth] = useState(currentMonthStr());
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const [gPerson, setGPerson] = useState(students[0]?.id || '');
  const [gAmount, setGAmount] = useState('');
  const [gNote, setGNote] = useState('');
  const [groceryMsg, setGroceryMsg] = useState('');

  const [mgAmount, setMgAmount] = useState('');
  const [mgNote, setMgNote] = useState('');
  const [managerGroceryMsg, setManagerGroceryMsg] = useState('');

  const [dPerson, setDPerson] = useState(students[0]?.id || '');
  const [dAmount, setDAmount] = useState('');
  const [depositMsg, setDepositMsg] = useState('');

  const [bDesc, setBDesc] = useState('');
  const [bAmount, setBAmount] = useState('');
  const [bibidhMsg, setBibidhMsg] = useState('');

  const [clearMsg, setClearMsg] = useState('');
  const [settlement, setSettlement] = useState<Settlement | null>(null);

  useEffect(() => {
    setSettlement(store.getByKey<Settlement>('settlements', month));
  }, [month]);

  const groceries = useMemo(
    () => store.list<GroceryEntry>('groceryEntries').filter((g) => g.month === month),
    [month, version]
  );
  const managerGroceries = useMemo(
    () => store.list<ManagerGroceryEntry>('managerGroceryEntries').filter((m) => m.month === month),
    [month, version]
  );
  const deposits = useMemo(
    () => store.list<Deposit>('deposits').filter((d) => d.month === month),
    [month, version]
  );
  const bibidh = useMemo(
    () => store.list<BibidhEntry>('bibidhEntries').filter((b) => b.month === month),
    [month, version]
  );

  function addGrocery() {
    const amount = parseFloat(gAmount);
    if (!amount || amount <= 0) {
      setGroceryMsg('Enter a valid amount.');
      return;
    }
    store.add<GroceryEntry>('groceryEntries', { studentId: gPerson, amount, note: gNote.trim(), month });
    setGAmount('');
    setGNote('');
    setGroceryMsg('');
    bump();
  }

  function addManagerGrocery() {
    const amount = parseFloat(mgAmount);
    if (!amount || amount <= 0) {
      setManagerGroceryMsg('Enter a valid amount.');
      return;
    }
    store.add<ManagerGroceryEntry>('managerGroceryEntries', { amount, note: mgNote.trim(), month });
    setMgAmount('');
    setMgNote('');
    setManagerGroceryMsg('');
    bump();
  }

  function addDeposit() {
    const amount = parseFloat(dAmount);
    if (!amount || amount <= 0) {
      setDepositMsg('Enter a valid amount.');
      return;
    }
    store.add<Deposit>('deposits', { studentId: dPerson, amount, month });
    setDAmount('');
    setDepositMsg('');
    bump();
  }

  function addBibidh() {
    const amount = parseFloat(bAmount);
    const description = bDesc.trim();
    if (!description || !amount || amount <= 0) {
      setBibidhMsg('Enter a description and a valid amount.');
      return;
    }
    store.add<BibidhEntry>('bibidhEntries', { description, amount, month });
    setBDesc('');
    setBAmount('');
    setBibidhMsg('');
    bump();
  }

  function removeEntry(collectionName: CollectionName, id: string) {
    store.remove(collectionName, id);
    bump();
  }

  function calculateSettlement() {
    const groceriesAll = store.list<GroceryEntry>('groceryEntries').filter((g) => g.month === month);
    const managerGroceriesAll = store
      .list<ManagerGroceryEntry>('managerGroceryEntries')
      .filter((m) => m.month === month);
    const depositsAll = store.list<Deposit>('deposits').filter((d) => d.month === month);
    const bibidhAll = store.list<BibidhEntry>('bibidhEntries').filter((b) => b.month === month);
    const attendance = store.list<AttendanceRecord>('attendance').filter((a) => a.month === month);

    const totalPersonalGrocery = groceriesAll.reduce((sum, g) => sum + Number(g.amount), 0);
    const totalManagerGrocery = managerGroceriesAll.reduce((sum, m) => sum + Number(m.amount), 0);
    const totalGrocery = totalPersonalGrocery + totalManagerGrocery;
    const totalDeposits = depositsAll.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalBibidh = bibidhAll.reduce((sum, b) => sum + Number(b.amount), 0);

    const mealsByStudent: Record<string, number> = {};
    attendance.forEach((a) => {
      const meals = (a.breakfast ? 0.5 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0);
      mealsByStudent[a.studentId] = (mealsByStudent[a.studentId] || 0) + meals;
    });
    const totalMeals = Object.values(mealsByStudent).reduce((sum, n) => sum + n, 0);
    const mealRate = totalMeals > 0 ? totalGrocery / totalMeals : 0;
    const bibidhShare = students.length > 0 ? totalBibidh / students.length : 0;

    const rows = students.map((s) => {
      const meals = mealsByStudent[s.id] || 0;
      const mealCost = meals * mealRate;
      const finalCost = mealCost + bibidhShare;

      const depositTotal = depositsAll
        .filter((d) => d.studentId === s.id)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      // Manager/pool purchases are never attributed to a person, so they never
      // need excluding here - every entry in groceryEntries is personal money.
      const grocerySpent = groceriesAll
        .filter((g) => g.studentId === s.id)
        .reduce((sum, g) => sum + Number(g.amount), 0);
      const contribution = depositTotal + grocerySpent;

      const balance = contribution - finalCost;
      return { name: s.name, meals, mealCost, bibidhShare, finalCost, contribution, balance };
    });

    const data = {
      month,
      totalGrocery,
      totalPersonalGrocery,
      totalManagerGrocery,
      totalDeposits,
      totalBibidh,
      totalMeals,
      mealRate,
      bibidhShare,
      rows,
    };
    store.upsertByKey<Settlement>('settlements', month, data);
    setSettlement(store.getByKey<Settlement>('settlements', month));
  }

  function clearOldEntries() {
    if (!month) {
      setClearMsg('Pick a month first.');
      return;
    }
    if (!confirm(`Delete all grocery, deposit, and bibidh entries before ${month}? This can't be undone.`)) return;

    const removed =
      store.removeWhere<GroceryEntry>('groceryEntries', (g) => g.month < month) +
      store.removeWhere<ManagerGroceryEntry>('managerGroceryEntries', (m) => m.month < month) +
      store.removeWhere<Deposit>('deposits', (d) => d.month < month) +
      store.removeWhere<BibidhEntry>('bibidhEntries', (b) => b.month < month);

    setClearMsg(`Cleared ${removed} entr${removed === 1 ? 'y' : 'ies'} from before ${month}.`);
    bump();
  }

  return (
    <>
      <PageHead title="Mess calculation">
        <div>
          <label htmlFor="calcMonth" className="m-0 inline">
            Month
          </label>{' '}
          <input
            id="calcMonth"
            type="month"
            className="!w-auto inline-block"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </PageHead>

      <h2>Personal grocery spending</h2>
      <p className="-mt-1.5 max-w-[600px] text-[0.88rem] text-ink-soft">
        Money someone spent from their own pocket on groceries. This adds to that person's individual contribution.
      </p>
      <div className="field-row">
        <div>
          <label htmlFor="gPerson">Spent by</label>
          <select id="gPerson" value={gPerson} onChange={(e) => setGPerson(e.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gAmount">Amount</label>
          <input
            id="gAmount"
            type="number"
            step="0.01"
            min={0}
            value={gAmount}
            onChange={(e) => setGAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="gNote">Note</label>
          <input
            id="gNote"
            placeholder="rice, oil, veggies&hellip;"
            value={gNote}
            onChange={(e) => setGNote(e.target.value)}
          />
        </div>
      </div>
      <Button className="mt-2.5" onClick={addGrocery}>
        Add grocery entry
      </Button>
      <Message text={groceryMsg} error />
      <table className="roll mt-3.5">
        <thead>
          <tr>
            <th>Person</th>
            <th>Note</th>
            <th className="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groceries.length ? (
            groceries.map((g) => (
              <tr key={g.id}>
                <td>{studentName(students, g.studentId)}</td>
                <td>{g.note || '\u2014'}</td>
                <td className="num tabular">{Number(g.amount).toFixed(2)}</td>
                <td>
                  <Button variant="danger" onClick={() => removeEntry('groceryEntries', g.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No personal grocery spending logged for this month yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-8">Manager grocery spending (from deposited pool)</h2>
      <p className="-mt-1.5 max-w-[600px] text-[0.88rem] text-ink-soft">
        Groceries bought using the common deposit fund &mdash; not tied to any one person, and doesn't add to
        anyone's individual contribution (that money is already covered by deposits). Still counts toward the total
        grocery cost for the meal rate.
      </p>
      <div className="field-row">
        <div>
          <label htmlFor="mgAmount">Amount</label>
          <input
            id="mgAmount"
            type="number"
            step="0.01"
            min={0}
            value={mgAmount}
            onChange={(e) => setMgAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="mgNote">Note</label>
          <input
            id="mgNote"
            placeholder="rice, oil, veggies&hellip;"
            value={mgNote}
            onChange={(e) => setMgNote(e.target.value)}
          />
        </div>
      </div>
      <Button className="mt-2.5" onClick={addManagerGrocery}>
        Add pool spending entry
      </Button>
      <Message text={managerGroceryMsg} error />
      <table className="roll mt-3.5">
        <thead>
          <tr>
            <th>Note</th>
            <th className="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {managerGroceries.length ? (
            managerGroceries.map((m) => (
              <tr key={m.id}>
                <td>{m.note || '\u2014'}</td>
                <td className="num tabular">{Number(m.amount).toFixed(2)}</td>
                <td>
                  <Button variant="danger" onClick={() => removeEntry('managerGroceryEntries', m.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No pool spending logged for this month yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-8">Deposits</h2>
      <div className="field-row">
        <div>
          <label htmlFor="dPerson">Deposited by</label>
          <select id="dPerson" value={dPerson} onChange={(e) => setDPerson(e.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dAmount">Amount</label>
          <input
            id="dAmount"
            type="number"
            step="0.01"
            min={0}
            value={dAmount}
            onChange={(e) => setDAmount(e.target.value)}
          />
        </div>
      </div>
      <Button className="mt-2.5" onClick={addDeposit}>
        Add deposit
      </Button>
      <Message text={depositMsg} error />
      <table className="roll mt-3.5">
        <thead>
          <tr>
            <th>Person</th>
            <th className="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {deposits.length ? (
            deposits.map((d) => (
              <tr key={d.id}>
                <td>{studentName(students, d.studentId)}</td>
                <td className="num tabular">{Number(d.amount).toFixed(2)}</td>
                <td>
                  <Button variant="danger" onClick={() => removeEntry('deposits', d.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No deposits logged for this month yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-8">Bibidh (miscellaneous) expenses</h2>
      <div className="field-row">
        <div>
          <label htmlFor="bDesc">Description</label>
          <input
            id="bDesc"
            placeholder="cleaning supplies, repairs&hellip;"
            value={bDesc}
            onChange={(e) => setBDesc(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="bAmount">Amount</label>
          <input
            id="bAmount"
            type="number"
            step="0.01"
            min={0}
            value={bAmount}
            onChange={(e) => setBAmount(e.target.value)}
          />
        </div>
      </div>
      <Button className="mt-2.5" onClick={addBibidh}>
        Add bibidh entry
      </Button>
      <Message text={bibidhMsg} error />
      <table className="roll mt-3.5">
        <thead>
          <tr>
            <th>Description</th>
            <th className="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bibidh.length ? (
            bibidh.map((b) => (
              <tr key={b.id}>
                <td>{b.description}</td>
                <td className="num tabular">{Number(b.amount).toFixed(2)}</td>
                <td>
                  <Button variant="danger" onClick={() => removeEntry('bibidhEntries', b.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No bibidh expenses logged for this month yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-8">Settlement</h2>
      <p className="-mt-2.5 max-w-[560px] text-[0.9rem] text-ink-soft">
        Each time you calculate, the result is saved under that month. Just pick any past month above to see its
        saved settlement again &mdash; even after its grocery/deposit/bibidh entries have been cleared.
      </p>
      <Button onClick={calculateSettlement}>Calculate settlement for this month</Button>
      <div>
        {settlement ? (
          <SettlementPanel data={settlement} />
        ) : (
          <p className="mt-4 text-[0.9rem] text-ink-soft">
            No settlement saved for this month yet &mdash; click Calculate settlement below.
          </p>
        )}
      </div>

      <h2 className="mt-9">Month-end housekeeping</h2>
      <p className="max-w-[480px] text-[0.9rem] text-ink-soft">
        Once a month is settled, you can clear its grocery, deposit, and bibidh entries to keep the logs short.
        Students, rooms, and attendance history are untouched.
      </p>
      <Button variant="danger" onClick={clearOldEntries}>
        Clear grocery/deposit/bibidh entries older than selected month
      </Button>
      <Message text={clearMsg} />
    </>
  );
}
