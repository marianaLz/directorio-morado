/**
 * FAQ content — used for the "Preguntas frecuentes" section and FAQPage schema.
 */
export const faqItems = [
  {
    id: 'que-es',
    question: '¿Qué es Directorio Morado?',
    answer:
      'Es un directorio público y gratuito de recursos de apoyo para sobrevivientes de violencia sexual y personas que buscan apoyo en aborto y derechos reproductivos en México y Latinoamérica. No pertenece al gobierno ni a una sola institución, y no se cobra por aparecer en el listado.',
  },
  {
    id: 'para-quien',
    question: '¿Para quién es?',
    answer:
      'Para sobrevivientes de violencia sexual, mujeres y personas que buscan información sobre aborto seguro, acompañamiento emocional o legal, y para cualquiera en México o Latinoamérica que necesite orientación en salud mental, derechos reproductivos o violencia de género. Puedes consultarlo sin registrarte; el uso es anónimo.',
  },
  {
    id: 'sobreviviente',
    question: '¿Qué hacer si soy sobreviviente de violencia sexual?',
    answer:
      'No estás sola. Tus sentimientos son válidos. Puedes buscar apoyo psicológico, asesoría legal o llamar a una línea de crisis (800 911 2000, 24h). Este directorio reúne organizaciones y colectivas que acompañan a sobrevivientes en México.',
  },
  {
    id: 'apoyo-psicologico',
    question: '¿Dónde encontrar apoyo psicológico en México?',
    answer:
      'En este directorio encontrarás psicólogas, organizaciones y colectivas que ofrecen apoyo emocional a sobrevivientes. Muchas ofrecen atención gratuita o de bajo costo. Filtra por "Apoyo psicológico" en el directorio para encontrarlas.',
  },
  {
    id: 'denunciar',
    question: '¿Dónde denunciar violencia sexual en México?',
    answer:
      'Puedes presentar una denuncia en el Ministerio Público o la Fiscalía de tu estado. En CDMX, el programa Abogadas de las Mujeres y la Fiscalía ofrecen atención legal gratuita. Este directorio incluye recursos gubernamentales y organizaciones de apoyo legal.',
  },
  {
    id: 'organizaciones',
    question: '¿Qué organizaciones ayudan a sobrevivientes de violencia sexual?',
    answer:
      'El Directorio Morado reúne ONG, colectivas, psicólogas y servicios gubernamentales que apoyan a sobrevivientes: atención psicológica, asesoría legal, acompañamiento y líneas de crisis. Explora el directorio y filtra por tipo de apoyo o ubicación.',
  },
  {
    id: 'curacion',
    question: '¿Cómo se curan los recursos y cómo sugiero uno?',
    answer:
      'Los administradores mantienen y aprueban las entradas. Si conoces un recurso que debería estar, envíalo desde «Sugerir un recurso»; las solicitudes pasan a una cola de pendientes y solo se publican tras ser aprobadas. Cada ficha indica costo, población a la que se dirige y si el servicio es en línea, presencial o ambos.',
  },
  {
    id: 'contactar',
    question: '¿Cómo contacto a los recursos?',
    answer:
      'Cada ficha muestra los datos de contacto que el recurso comparte: teléfono, WhatsApp, sitio web, Instagram u horarios. El contacto es directo entre tú y cada organización o colectiva; no somos intermediarios.',
  },
  {
    id: 'emergencias',
    question: '¿Es un servicio de emergencias?',
    answer:
      'No. Directorio Morado es un directorio de información, no un servicio de emergencias. Si estás en peligro inminente, llama al 911. Para atención en crisis 24 horas en México, llama al 800 911 2000.',
  },
] as const;

/** Preview on the home page (full list lives at /preguntas-frecuentes). */
const FAQ_HOME_IDS = ['sobreviviente', 'apoyo-psicologico', 'denunciar'] as const;

export const faqItemsHome = FAQ_HOME_IDS.map(
  (id) => faqItems.find((item) => item.id === id)!,
);
