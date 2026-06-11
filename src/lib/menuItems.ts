import { 
  LayoutDashboard, 
  MessageSquare, 
  Package, 
  BarChart3, 
  TrendingUp, 
  Settings 
} from 'lucide-react';

export const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Produk', href: '/dashboard/produk', icon: Package },
  { name: 'Laporan', href: '/dashboard/laporan', icon: BarChart3 }, // Pastikan folder 'laporan' ada
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
];