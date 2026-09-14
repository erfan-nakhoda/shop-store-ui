import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppProvider } from './context/AppContext'
import { AuthPage } from './pages/AuthPage'
import { BasketPage } from './pages/BasketPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { HomePage } from './pages/HomePage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { SupportPage } from './pages/SupportPage'

export default function App() {
  return <BrowserRouter><AppProvider><Layout><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products/:id" element={<ProductDetailsPage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/categories" element={<CategoriesPage />} />
    <Route path="/basket" element={<BasketPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/auth/login" element={<AuthPage />} />
    <Route path="/auth/signup" element={<AuthPage />} />
    <Route path="*" element={<HomePage />} />
  </Routes></Layout></AppProvider></BrowserRouter>
}
