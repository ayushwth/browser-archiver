import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ViewerPage from './pages/ViewerPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Breadcrumbs />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/view/:id" element={<ViewerPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
