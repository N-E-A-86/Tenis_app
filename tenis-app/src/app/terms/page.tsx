import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | TenisClub",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
        <p className="text-gray-400 text-sm">Última actualización: Julio 2026</p>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">1. Uso del servicio</h2>
          <p>
            TenisClub es una plataforma que permite a los usuarios reservar canchas de tenis
            de forma online. Al utilizar este servicio, aceptás los presentes términos.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">2. Registro de usuarios</h2>
          <p>
            Para realizar reservas, necesitás registrarte con tu correo electrónico o
            mediante tu cuenta de Google. Sos responsable de mantener la confidencialidad
            de tus credenciales.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">3. Reservas y pagos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Las reservas están sujetas a disponibilidad</li>
            <li>Los precios se muestran en la moneda local al momento de reservar</li>
            <li>El pago se procesa a través de Mercado Pago</li>
            <li>Las reservas pueden ser canceladas según la política del club</li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">4. Cancelaciones</h2>
          <p>
            Las cancelaciones pueden realizarse desde la plataforma. El club se reserva
            el derecho de cancelar reservas por mantenimiento o eventos especiales,
            en cuyo caso se notificará al usuario y se reintegrará el pago.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">5. Conducta del usuario</h2>
          <p>
            Los usuarios se comprometen a utilizar la plataforma de forma responsable.
            El club se reserva el derecho de suspender cuentas que hagan un uso
            indebido del sistema.
          </p>
        </section>

        <section className="space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">6. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Los cambios serán notificados a través de la plataforma.
          </p>
        </section>
      </div>
    </main>
  );
}
