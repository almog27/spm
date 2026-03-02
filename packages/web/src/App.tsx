import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { SkillDetail } from './pages/SkillDetail';
import { AuthorProfile } from './pages/AuthorProfile';
import { Dashboard } from './pages/Dashboard';
import { Docs } from './pages/Docs';
import { CLI } from './pages/CLI';
import { Publish } from './pages/Publish';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/skills/:name" element={<SkillDetail />} />
          <Route path="/authors/:username" element={<AuthorProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/cli" element={<CLI />} />
          <Route path="/publish" element={<Publish />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
