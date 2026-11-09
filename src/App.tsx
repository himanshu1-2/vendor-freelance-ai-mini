import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { DailyMenuPage } from './pages/DailyMenuPage'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { VendorListPage } from './pages/VendorListPage'
import { VendorPage } from './pages/VendorPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="auth/:mode" element={<AuthPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="vendors" element={<VendorListPage />} />
        <Route path="menu/:restaurantSlug" element={<MenuPage />} />
        <Route path="vendor/:vendorSlug" element={<VendorPage />} />
        <Route path="vendor/:vendorSlug/menu/:date" element={<DailyMenuPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
