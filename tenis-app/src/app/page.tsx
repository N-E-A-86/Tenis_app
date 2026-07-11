import AnimatedHero from "@/components/animations/AnimatedHero";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CourtGrid from "@/components/courts/CourtGrid";

export default function Home() {
  return (
    <div>
      <AnimatedHero />

      {/* Sección Canchas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Nuestras Canchas
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                Canchas en perfecto estado, iluminación profesional y todo lo
                necesario para que disfrutes al máximo tu partido.
              </p>
            </div>
          </ScrollReveal>
          <CourtGrid />
        </div>
      </section>

      {/* Sección Características */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                ¿Por qué TenisClub?
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.15}>
                <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div className="p-12 bg-gradient-to-r from-emerald-900/40 to-black border border-emerald-500/20 rounded-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Listo para jugar?
              </h2>
              <p className="mt-4 text-gray-400 max-w-lg mx-auto">
                Registrate gratis y empezá a reservar tu cancha favorita en
                segundos.
              </p>
              <a
                href="/register"
                className="mt-8 inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/25"
              >
                Crear cuenta gratis
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "⚡",
    title: "Reserva Rápida",
    description:
      "Elegí cancha, horario y pagá en minutos. Sin formularios eternos ni llamadas telefónicas.",
  },
  {
    icon: "🔒",
    title: "Pago Seguro",
    description:
      "Procesamos los pagos con Mercado Pago. Tus datos están siempre protegidos.",
  },
  {
    icon: "📱",
    title: "Gestión Online",
    description:
      "Administrá tus reservas desde cualquier dispositivo. Cancelá o reprogramá fácilmente.",
  },
];
