import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ViewerPage from './pages/ViewerPage.jsx';

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/view/:id" element={<ViewerPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
