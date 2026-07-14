import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | TenisClub",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="text-gray-400 text-sm">Última actualización: Julio 2026</p>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">1. Información que recopilamos</h2>
          <p>
            Al registrarte en TenisClub, recopilamos tu nombre, dirección de correo electrónico
            y número de teléfono. Si iniciás sesión con Google, también recopilamos tu
            nombre y correo de tu perfil de Google.
          </p>
          <p>
            Cuando realizás una reserva, registramos la cancha seleccionada, fecha, horario
            y el monto abonado.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">2. Uso de la información</h2>
          <p>Usamos tu información para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestionar tus reservas de canchas</li>
            <li>Procesar pagos a través de Mercado Pago</li>
            <li>Enviarte confirmaciones y recordatorios de tus reservas</li>
            <li>Mejorar nuestros servicios</li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">3. Almacenamiento de datos</h2>
          <p>
            Tus datos se almacenan en Supabase, un servicio de base de datos en la nube
            con sede en Estados Unidos. Tomamos medidas de seguridad estándar para
            proteger tu información.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">4. Pagos</h2>
          <p>
            Los pagos se procesan a través de Mercado Pago. No almacenamos información
            de tarjetas de crédito ni datos bancarios en nuestros servidores.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">5. Tus derechos</h2>
          <p>
            Podés solicitar la eliminación de tus datos personales en cualquier momento
            contactándonos al correo electrónico del club. También podés modificar tus
            datos desde tu perfil en la aplicación.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">6. Contacto</h2>
          <p>
            Si tenés preguntas sobre esta política, contactanos por correo electrónico
            a la dirección del club.
          </p>
        </section>
      </div>
    </main>
  );
}
