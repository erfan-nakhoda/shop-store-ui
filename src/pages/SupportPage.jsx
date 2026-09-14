import { RoleGuard } from '../components/RoleGuard'
import { ManagementPage } from './AdminPage'

export function SupportPage() {
  return <RoleGuard roles={['SUPPORT']}><ManagementPage title="پنل پشتیبانی" /></RoleGuard>
}
