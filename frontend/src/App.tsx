import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CreateRequest } from './pages/CreateRequest';
import { RequestDetail } from './pages/RequestDetail';
import { LandingPage } from './pages/LandingPage';
import { UEList } from './pages/UEList';
import { UEDetail } from './pages/UEDetail';
import { NotFound } from './pages/NotFound';
import { Toaster } from 'react-hot-toast'; // On garde l'import

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* 2. Ajoute ce bloc <Toaster> juste ici, au début du JSX */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#333',
                            color: '#fff',
                            borderRadius: '10px',
                        },
                        success: {
                            style: { background: '#10b981' }, // Vert joli
                            iconTheme: { primary: '#fff', secondary: '#10b981' },
                        },
                        error: {
                            style: { background: '#ef4444' }, // Rouge joli
                            iconTheme: { primary: '#fff', secondary: '#ef4444' },
                        },
                    }}
                />
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

                            {/* Fallback 404 */}
                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;