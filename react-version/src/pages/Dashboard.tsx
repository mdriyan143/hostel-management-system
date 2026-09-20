import { useMemo } from 'react';
import { store } from '../lib/store';
import { todayISODate } from '../lib/utils';
import type { Student, Room, AttendanceRecord } from '../types';
import PageHead from '../components/PageHead';
import StatStrip from '../components/StatStrip';

interface NearFullRoom extends Room {
  occupied: number;
}

export default function Dashboard() {
  const { stats, nearFull } = useMemo(() => {
    const students = store.list<Student>('students');
    const rooms = store.list<Room>('rooms');
    const attendance = store.list<AttendanceRecord>('attendance');

    const occupancy: Record<string, number> = {};
    students.forEach((s) => {
      if (s.roomId) occupancy[s.roomId] = (occupancy[s.roomId] || 0) + 1;
    });

    const attendanceToday = attendance.filter((a) => a.date === todayISODate()).length;
    const totalCapacity = rooms.reduce((sum, r) => sum + Number(r.capacity || 0), 0);
    const totalOccupied = Object.values(occupancy).reduce((sum, n) => sum + n, 0);

    const nearFullRooms: NearFullRoom[] = rooms
      .map((r) => ({ ...r, occupied: occupancy[r.id] || 0 }))
      .filter((r) => r.occupied >= Number(r.capacity || 0) - 1)
      .sort((a, b) => b.occupied - a.occupied);

    return {
      stats: [
        { label: 'students', value: String(students.length) },
        { label: 'rooms occupied', value: `${totalOccupied} / ${totalCapacity}` },
        { label: 'marked present today', value: String(attendanceToday), accent: true },
      ],
      nearFull: nearFullRooms,
    };
  }, []);

  return (
    <>
      <PageHead title="Dashboard" />

      <StatStrip stats={stats} />

      <h2>Rooms nearing full</h2>
      <table className="roll">
        <thead>
          <tr>
            <th>Room</th>
            <th className="num">Occupied</th>
            <th className="num">Capacity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {nearFull.length ? (
            nearFull.map((r) => (
              <tr key={r.id}>
                <td>{r.roomNumber}</td>
                <td className="num tabular">{r.occupied}</td>
                <td className="num tabular">{r.capacity}</td>
                <td>
                  {r.occupied >= r.capacity ? (
                    <span className="tag tag-full">full</span>
                  ) : (
                    <span className="tag">1 spot left</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No rooms are near capacity.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
