import { HashRouter, Routes, Route } from 'react-router-dom';
import { NavProvider } from './context/NavContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Rooms from './pages/Rooms';
import Attendance from './pages/Attendance';
import Overview from './pages/Overview';
import Contribution from './pages/Contribution';
import Billing from './pages/Billing';
import Calculation from './pages/Calculation';
import MealRate from './pages/MealRate';

function App() {
  return (
    <HashRouter>
      <NavProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/contribution" element={<Contribution />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/calculation" element={<Calculation />} />
            <Route path="/meal-rate" element={<MealRate />} />
          </Route>
        </Routes>
      </NavProvider>
    </HashRouter>
  );
}

export default App;
