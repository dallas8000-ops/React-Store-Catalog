import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalProvider from './state/globalProvider';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Catalog from './components/Catalog';
import NotFound from './components/NotFound';
import Adm from './pages/Adm';
import Cart from './pages/Cart';
import Shipping from './pages/Shipping';
import FloatingImagesBackground from './components/FloatingImagesBackground';
import './styles/App.css';

function App() {
  const [mode, setMode] = useState('light');
  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');
  return (
    <GlobalProvider>
      <BrowserRouter>
        <div className={mode === 'dark' ? 'dark-mode' : 'light-mode'}>
          <FloatingImagesBackground />
          <NavBar mode={mode} toggleMode={toggleMode} />
          {/* Example Material UI Button removed */}
          <main className={mode === 'dark' ? 'bg-dark text-light py-4 px-5' : 'bg-light py-4 px-5'}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/catalog' element={<Catalog />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/shipping' element={<Shipping />} />
              <Route path='/admin' element={<Adm />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
