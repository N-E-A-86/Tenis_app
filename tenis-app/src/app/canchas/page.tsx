import PageTransition from "@/components/animations/PageTransition";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CourtGrid from "@/components/courts/CourtGrid";

export default function CanchasPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Nuestras Canchas
            </h1>
            <p className="mt-3 text-gray-400 max-w-xl">
              Seleccioná la cancha que quieras y reservá tu horario.
              Todas nuestras canchas cuentan con iluminación profesional y
              mantenimiento diario.
            </p>
          </div>
        </ScrollReveal>

        <CourtGrid />
      </div>
    </PageTransition>
  );
}
