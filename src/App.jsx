import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FamilyTree from './components/FamilyTree';
import AncestorSearch from './components/AncestorSearch';
import Communication from './components/Communication';
import SharedTrees from './components/SharedTrees';
import './styles.css';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentNode, setParentNode] = useState(null);

  const handleAddAncestor = (node) => {
    setParentNode(node);
    setIsModalOpen(true);
  };

  const handleAncestorSelect = (ancestorData) => {
    setIsModalOpen(false);
  };

  return (<Router>
    <header>
      <a>
        <h1>RODOSTROM</h1>
      </a>
    </header>
    <div>
      <nav>
        <a><Link to="/">Môj rodostrom</Link></a>
        <a><Link to="/search">Vyhľadať predka</Link></a>
        <a><Link to="/communication">Komunikácia</Link></a>
        <a><Link to="/shared-trees">Verejné stromy</Link></a>
        <a>Odhlásiť sa</a>
      </nav>

      <Routes>
        <Route path="/" element={<FamilyTree />} />
        <Route path="/search" element={<AncestorSearch />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="/shared-trees" element={<SharedTrees />} />
      </Routes>
    </div>
  </Router>);
}

export default App;
