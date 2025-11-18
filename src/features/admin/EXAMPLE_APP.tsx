/**
 * EXAMPLE APP.TSX - How to integrate Admin Dashboard
 * 
 * This file shows 3 different ways to use the Admin Dashboard
 */

// ============================================
// OPTION 1: Simple - Just use AdminDashboard
// ============================================

import { AdminDashboard } from '@/features/admin/AdminDashboard';

export function AppSimple() {
  return (
    <div className="w-full h-screen">
      <AdminDashboard />
    </div>
  );
}

// Usage: <AppSimple />

// ============================================
// OPTION 2: With React Router
// ============================================

// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AdminDashboard } from '@/features/admin/AdminDashboard';
// import { HomePage } from './pages/HomePage';
// import { ProfilePage } from './pages/ProfilePage';

// export function AppWithRouter() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/profile" element={<ProfilePage />} />
//         <Route path="/admin/*" element={<AdminDashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// Usage in main.tsx:
// createRoot(document.getElementById('root')!).render(
//   <AppWithRouter />
// );

// ============================================
// OPTION 3: Lazy Load Admin Dashboard
// ============================================

// import { lazy, Suspense } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// const AdminDashboard = lazy(() =>
//   import('@/features/admin/AdminDashboard').then(m => ({
//     default: m.AdminDashboard,
//   }))
// );

// export function AppWithLazyLoad() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/admin/*"
//           element={
//             <Suspense fallback={<div className="p-8">Loading Admin Dashboard...</div>}>
//               <AdminDashboard />
//             </Suspense>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// ============================================
// OPTION 4: Navbar with Admin Link
// ============================================

// import { Link } from 'react-router-dom';
// import { AdminDashboard } from '@/features/admin/AdminDashboard';
// import { LayoutDashboard } from 'lucide-react';

// export function AppWithNavbar() {
//   return (
//     <div>
//       {/* Navbar */}
//       <nav className="bg-white border-b border-gray-200 px-4 py-3">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <h1 className="text-2xl font-bold">MyApp</h1>
//           <div className="flex items-center gap-4">
//             <Link to="/">Home</Link>
//             <Link to="/profile">Profile</Link>
//             <Link 
//               to="/admin" 
//               className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded"
//             >
//               <LayoutDashboard className="w-5 h-5" />
//               Admin
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="w-full">
//         <AdminDashboard />
//       </main>
//     </div>
//   );
// }

// ============================================
// JUST USE THIS - SIMPLEST OPTION
// ============================================

/*
In your main.tsx or App.tsx:

import { AdminDashboard } from '@/features/admin/AdminDashboard';

function App() {
  return <AdminDashboard />;
}

export default App;

Then render it:

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
*/

export default AppSimple;
