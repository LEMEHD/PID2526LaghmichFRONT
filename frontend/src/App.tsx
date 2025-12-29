import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CreateRequest } from './pages/CreateRequest';
import { RequestDetail } from './pages/RequestDetail';
import { LandingPage } from './pages/LandingPage';
import { UEList } from './pages/UEList';
import { UEDetail } from './pages/UEDetail';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                    <Navbar />
                    <main className="flex-grow w-full">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />

                            {/* Section Étudiant */}
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/create" element={<CreateRequest />} />
                            <Route path="/request/:id" element={<RequestDetail />} />

                            {/* Catalogue des UE */}
                            <Route path="/ues" element={<UEList />} />
                            <Route path="/ues/:code" element={<UEDetail />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;