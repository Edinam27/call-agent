import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Leads from './pages/Leads';
import Conversations from './pages/Conversations';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/conversations" element={<Conversations />} />
        </Routes>
      </Layout>
    </Router>
  );
}