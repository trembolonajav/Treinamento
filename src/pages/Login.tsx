import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoAbr from '@/assets/logo-abr.png';
import { useAppState } from '@/lib/app-state';

const PORTABLE_MODE = import.meta.env.VITE_PORTABLE_MODE === 'true';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppState();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('ricardo.oliveira@abradvogados.com.br');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/');
  };

  if (PORTABLE_MODE) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="card-premium w-full max-w-xl p-10 text-center">
          <img src={logoAbr} alt="ABR Advogados" className="mx-auto mb-6 h-12" />
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Modo portatil local</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground">Acesso liberado para teste local</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Esta versao abre direto o portal do colaborador com dados mockados e arquivos locais da pasta
            <span className="font-medium text-foreground"> `public/storage`</span>.
          </p>
          <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/')}>
            Entrar no portal local
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-[45%] dark-gradient relative items-center justify-center p-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center max-w-md"
        >
          <img src={logoAbr} alt="ABR Advogados" className="h-16 mx-auto mb-10 brightness-0 invert" />
          <div className="w-12 h-px bg-accent mx-auto mb-8" />
          <h1 className="font-heading text-3xl font-semibold text-white/95 leading-tight mb-4">
            Portal Interno de Integração
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Plataforma exclusiva de treinamento, procedimentos e comunicados internos do escritório ABR Advogados.
          </p>
        </motion.div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-10 text-center">
            <img src={logoAbr} alt="ABR Advogados" className="h-12 mx-auto mb-4" />
          </div>

          <h2 className="font-heading text-2xl font-semibold text-foreground mb-1">
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Acesse sua área de integração e treinamento.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.nome@abradvogados.com.br"
                className="w-full px-3.5 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/30" />
                <span className="text-xs text-muted-foreground">Lembrar acesso</span>
              </label>
              <button type="button" className="text-xs text-accent hover:text-accent/80 transition-colors">
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 text-sm"
            >
              Entrar no Portal
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground/60 text-center mt-10">
            Acesso restrito a colaboradores do escritório ABR Advogados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
