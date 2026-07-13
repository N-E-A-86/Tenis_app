import { TennisBallIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="bg-black/80 border-t border-white/10 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left flex items-center gap-2">
            <TennisBallIcon size={22} className="text-emerald-400" />
            <span className="text-xl font-bold text-white">
              Tenis<span className="text-emerald-400">Club</span>
            </span>
            <p className="text-sm text-gray-400 mt-1">
              Reservá tu cancha fácil y rápido
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contacto
            </a>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TenisClub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
