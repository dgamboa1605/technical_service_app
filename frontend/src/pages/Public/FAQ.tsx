import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "¿Cuánto tiempo tarda una reparación?",
    answer: "El tiempo de reparación depende del tipo de servicio. En promedio, las reparaciones simples toman de 1 a 3 días hábiles. Para reparaciones más complejas o que requieren repuestos especiales, puede tomar de 5 a 10 días hábiles. Te notificaremos sobre el tiempo estimado al momento de recibir tu equipo."
  },
  {
    question: "¿Cómo puedo rastrear el estado de mi orden?",
    answer: "Puedes rastrear tu orden ingresando el número que te proporcionamos al dejar tu equipo en la sección 'Rastrear Orden' de nuestra página principal. Allí verás el estado actual y el historial de tu servicio."
  },
  {
    question: "¿Ofrecen garantía en las reparaciones?",
    answer: "Sí, todas nuestras reparaciones incluyen garantía de 30 días en mano de obra. Los repuestos originales cuentan con garantía del fabricante. La garantía no cubre daños por mal uso o accidentes después de la entrega."
  },
  {
    question: "¿Qué necesito para dejar mi equipo?",
    answer: "Necesitas traer tu equipo con su cargador (en caso de laptops o celulares), una identificación válida y proporcionar una descripción del problema. Te entregaremos un comprobante con el número de orden para el seguimiento."
  },
  {
    question: "¿Atienden equipos en garantía?",
    answer: "Sí, somos un centro de servicio autorizado. Si tu equipo está en garantía, trae la factura de compra o comprobante de garantía. Los servicios de garantía pueden tener condiciones específicas según el fabricante."
  },
  {
    question: "¿Realizan servicio a domicilio?",
    answer: "Sí, ofrecemos servicio a domicilio para ciertos tipos de equipos y servicios. Consulta disponibilidad y costos adicionales al contactarnos. Este servicio está disponible dentro del área metropolitana."
  },
  {
    question: "¿Qué formas de pago aceptan?",
    answer: "Aceptamos efectivo, tarjetas de crédito/débito, transferencias bancarias y pagos mediante Yape o Plin. El pago se realiza al momento de recoger tu equipo reparado."
  },
  {
    question: "¿Hacen diagnóstico gratuito?",
    answer: "Sí, el diagnóstico inicial es gratuito. Si decides no realizar la reparación, no hay costo. Una vez aprobada la reparación, el costo del diagnóstico está incluido en el precio total del servicio."
  },
  {
    question: "¿Qué pasa si no autorizan la reparación?",
    answer: "Si el diagnóstico revela que la reparación no es viable o el cliente decide no proceder, puedes recoger tu equipo sin ningún costo. Te explicaremos detalladamente el problema encontrado."
  },
  {
    question: "¿Puedo actualizar o mejorar mi equipo?",
    answer: "Sí, ofrecemos servicios de actualización como ampliación de memoria RAM, cambio de disco duro por SSD, y otras mejoras de hardware. Podemos asesorarte sobre las opciones más convenientes para tu equipo."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <PageMeta title="Preguntas Frecuentes" description="Respuestas a las preguntas más comunes sobre nuestros servicios" />
      <div className="max-w-4xl mx-auto">
        {/* Header de la página */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Encuentra respuestas rápidas a las dudas más comunes
          </p>
        </div>

        {/* Lista de FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Aún tienes dudas?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No dudes en contactarnos, estamos aquí para ayudarte
          </p>
          <a
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contáctanos
          </a>
        </div>
      </div>
    </>
  );
}
