import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AsciiPage from './pages/AsciiPage/AsciiPage';
import DotsPage from './pages/DotsPage/DotsPage';

function App() {
    return (
        <BrowserRouter basename="/ascii">
            <Routes>
                <Route path="/" element={<AsciiPage />} />
                <Route path="/dots" element={<DotsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
