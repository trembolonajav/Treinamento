import { Search, Bell, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import logoAbr from '@/assets/logo-abr.png';

interface HeaderProps {
  progress?: number;
  userName?: string;
}

export function AppHeader({ progress = 35, userName = 'Ricardo Oliveira' }: HeaderProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const roleLabel = isAdmin ? 'Administrador' : 'Colaborador';

  const breadcrumbs = isAdmin
    ? [{ label: 'Painel Administrativo', href: '/admin' }]
    : [
        { label: 'Minha Trilha', href: '/' },
        ...(location.pathname.includes('/aula')
          ? [{ label: 'Aula', href: location.pathname }]
          : []),
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAbr} alt="ABR Advogados" className="h-8" />
            <div className="h-6 w-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground hidden sm:block tracking-wide">
              Portal Interno
            </span>
          </Link>
        </div>

        {/* Breadcrumb center */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              <Link to={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:border-accent/50 transition-colors">
            <Search className="w-4 h-4" />
            <span className="hidden lg:block">Buscar...</span>
          </button>

          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="text-xs text-muted-foreground">{progress}%</span>
              <Progress value={progress} className="w-24 h-1.5 bg-muted [&>[role=progressbar]]:bg-accent" />
            </div>
          )}

          <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full gold-accent-bg" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
              <p className="text-xs text-muted-foreground leading-tight">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
