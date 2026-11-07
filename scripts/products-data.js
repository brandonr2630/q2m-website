'use strict';
/**
 * Products catalogue data: UI strings, the node tree and the hub text.
 * OCR RP family copy (`copy`) and HUB are migrated VERBATIM from the previous Products build
 * (git show 7440a82^:scripts/product-pages-content.js). Do not reword.
 * New strings written for the catalogue are marked; nl/fr new strings need native review.
 */

const rows = require('./products-data/ocr-rp-rows');

// UI strings used by the catalogue page build. {n}, {total}, {kg}, {model} are placeholders.
// native review: all nl and fr strings in UI are new
const UI = {
  products: { en: 'Products', es: 'Productos', pt: 'Produtos', nl: 'Producten', fr: 'Produits' },
  all_categories: { en: 'All categories', es: 'Todas las categorías', pt: 'Todas as categorias', nl: 'Alle categorieën', fr: 'Toutes les catégories' },
  categories: { en: 'Categories', es: 'Categorías', pt: 'Categorias', nl: 'Categorieën', fr: 'Catégories' },
  crumb_home: { en: 'Home', es: 'Inicio', pt: 'Início', nl: 'Home', fr: 'Accueil' },
  request_quote: { en: 'Request a quote', es: 'Solicitar cotización', pt: 'Solicitar orçamento', nl: 'Offerte aanvragen', fr: 'Demander un devis' },
  filter_models: { en: 'Filter models', es: 'Filtrar modelos', pt: 'Filtrar modelos', nl: 'Modellen filteren', fr: 'Filtrer les modèles' },
  filter_all: { en: 'All', es: 'Todos', pt: 'Todos', nl: 'Alle', fr: 'Tous' },
  filter_clear: { en: 'Clear filters', es: 'Borrar filtros', pt: 'Limpar filtros', nl: 'Filters wissen', fr: 'Effacer les filtres' },
  filter_count: { en: 'Showing {n} of {total} models', es: 'Mostrando {n} de {total} modelos', pt: 'Mostrando {n} de {total} modelos', nl: '{n} van {total} modellen getoond', fr: '{n} modèles sur {total} affichés' },
  filter_none: { en: 'No models match these filters.', es: 'Ningún modelo coincide con estos filtros.', pt: 'Nenhum modelo corresponde a estes filtros.', nl: 'Geen modellen voldoen aan deze filters.', fr: 'Aucun modèle ne correspond à ces filtres.' },
  col_model: { en: 'Model', es: 'Modelo', pt: 'Modelo', nl: 'Model', fr: 'Modèle' },
  col_size: { en: 'Size', es: 'Tamaño', pt: 'Tamanho', nl: 'Maat', fr: 'Taille' },
  col_ratio: { en: 'Ratio', es: 'Relación', pt: 'Relação', nl: 'Overbrenging', fr: 'Rapport' },
  col_n2: { en: 'Output speed n2', es: 'Velocidad de salida n2', pt: 'Rotação de saída n2', nl: 'Uitgaand toerental n2', fr: 'Vitesse de sortie n2' },
  col_n1: { en: 'Input speed n1', es: 'Velocidad de entrada n1', pt: 'Rotação de entrada n1', nl: 'Ingaand toerental n1', fr: "Vitesse d'entrée n1" },
  col_kw: { en: 'Power', es: 'Potencia', pt: 'Potência', nl: 'Vermogen', fr: 'Puissance' },
  col_torque: { en: 'Output torque', es: 'Par de salida', pt: 'Torque de saída', nl: 'Uitgaand koppel', fr: 'Couple de sortie' },
  spec_caption: {
    en: 'Rating table. Catalogue ratings assume a service factor of 1. Contact us to confirm the right model for your duty.',
    es: 'Tabla de capacidades. Los valores del catálogo suponen un factor de servicio de 1. Contáctenos para confirmar el modelo adecuado para su servicio.',
    pt: 'Tabela de capacidades. Os valores do catálogo pressupõem um fator de serviço de 1. Entre em contato para confirmar o modelo adequado à sua aplicação.',
    nl: 'Vermogenstabel. De cataloguswaarden gaan uit van een bedrijfsfactor van 1. Neem contact met ons op om het juiste model voor uw toepassing te bevestigen.',
    fr: 'Tableau des performances. Les valeurs du catalogue supposent un facteur de service de 1. Contactez-nous pour confirmer le modèle adapté à votre service.',
  },
  // new for Task 5: aria-label of the breadcrumb region
  crumbs_label: { en: 'Breadcrumb', es: 'Ruta de navegación', pt: 'Trilha de navegação', nl: 'Kruimelpad', fr: "Fil d'Ariane" },
  // new for Task 5: heading of the spec-table section (#specs)
  specs_heading: { en: 'Specifications', es: 'Especificaciones', pt: 'Especificações', nl: 'Specificaties', fr: 'Caractéristiques techniques' },
  // new for Task 6: visible labels of the min/max number inputs, and the active-filter count in the
  // "Filter models" summary (written as "label: n" to avoid plural forms)
  filter_min: { en: 'Min', es: 'Mín.', pt: 'Mín.', nl: 'Min.', fr: 'Min.' }, // native review (nl, fr)
  filter_max: { en: 'Max', es: 'Máx.', pt: 'Máx.', nl: 'Max.', fr: 'Max.' }, // native review (nl, fr)
  filter_active: { en: 'active: {n}', es: 'activos: {n}', pt: 'ativos: {n}', nl: 'actief: {n}', fr: 'actifs : {n}' }, // native review (nl, fr)
  dims_heading: { en: 'Dimension drawings', es: 'Planos dimensionales', pt: 'Desenhos dimensionais', nl: 'Maattekeningen', fr: 'Plans dimensionnels' },
  dims_weight: { en: 'Weight: {kg} kg', es: 'Peso: {kg} kg', pt: 'Peso: {kg} kg', nl: 'Gewicht: {kg} kg', fr: 'Poids : {kg} kg' },
  dims_enlarge: { en: 'Enlarge drawing', es: 'Ampliar plano', pt: 'Ampliar desenho', nl: 'Tekening vergroten', fr: 'Agrandir le plan' }, // native review (nl, fr)
  lb_close: { en: 'Close', es: 'Cerrar', pt: 'Fechar', nl: 'Sluiten', fr: 'Fermer' },
  lb_prev: { en: 'Previous drawing', es: 'Plano anterior', pt: 'Desenho anterior', nl: 'Vorige tekening', fr: 'Plan précédent' }, // native review (nl, fr)
  lb_next: { en: 'Next drawing', es: 'Plano siguiente', pt: 'Desenho seguinte', nl: 'Volgende tekening', fr: 'Plan suivant' }, // native review (nl, fr)
  quote_prefill: { en: 'Enquiry about {model}: ', es: 'Consulta sobre {model}: ', pt: 'Consulta sobre {model}: ', nl: 'Aanvraag over {model}: ', fr: 'Demande concernant {model} : ' },
  enquire_cta: { en: 'Enquire about this model', es: 'Consultar sobre este modelo', pt: 'Consultar sobre este modelo', nl: 'Informeer naar dit model', fr: 'Se renseigner sur ce modèle' },
  brand_link: { en: 'Visit the manufacturer', es: 'Visite al fabricante', pt: 'Visite o fabricante', nl: 'Bezoek de fabrikant', fr: 'Visiter le fabricant' },
};

// Same tile image for category and family tiles (owner decision).
const TILE = 'assets/products/ocr-rp/tile.webp';

const tileAlt = {
  en: 'OCR RP Series shaft-mounted gear reducer',
  es: 'Reductor montado en eje OCR Serie RP',
  pt: 'Redutor de eixo montado OCR Série RP',
  nl: 'OCR RP-serie opsteekreductor', // native review
  fr: 'Réducteur pendulaire OCR Série RP', // native review
};

// Family hero (P1101652): describes only what the photo shows.
const heroAlt = {
  en: 'Blue OCR RP Series shaft-mounted gear reducer on a workshop bench, showing the hollow output shaft and the capped input shaft',
  es: 'Reductor montado en eje OCR Serie RP de color azul sobre un banco de taller, con el eje de salida hueco y el eje de entrada protegido',
  pt: 'Redutor de eixo montado OCR Série RP azul sobre uma bancada de oficina, mostrando o eixo de saída oco e o eixo de entrada protegido',
  nl: 'Blauwe OCR RP-serie opsteekreductor op een werkbank, met de holle uitgaande as en de afgedekte ingaande as', // native review
  fr: "Réducteur pendulaire OCR Série RP bleu posé sur un établi d'atelier, montrant l'arbre de sortie creux et l'arbre d'entrée protégé", // native review
};

function dimAlt(size) {
  return {
    en: `OCR RP ${size} shaft-mounted gear reducer dimensions drawing`,
    es: `Plano dimensional del reductor montado en eje OCR RP ${size}`,
    pt: `Desenho dimensional do redutor de eixo montado OCR RP ${size}`,
    nl: `Maattekening van de OCR RP ${size} opsteekreductor`, // native review
    fr: `Plan dimensionnel du réducteur pendulaire OCR RP ${size}`, // native review
  };
}

// [size, weightKg, width px, height px] (pixel sizes read from the files)
const DIMS = [
  [85, 18, 1400, 838],
  [105, 27, 1400, 836],
  [125, 41, 1400, 838],
  [150, 62, 1400, 836],
  [165, 87, 1400, 836],
  [180, 107, 1400, 839],
  [210, 188, 1400, 838],
  [250, 315, 1400, 837],
];

const NODES = [
  {
    id: 'gear-reducers',
    parent: null,
    slug: 'gear-reducers',
    order: 10,
    name: {
      en: 'Gear Reducers',
      es: 'Reductores',
      pt: 'Redutores',
      nl: 'Reductoren', // native review
      fr: 'Réducteurs', // native review
    },
    description: {
      en: 'Shaft-mounted gear reducers supplied by Q² Machines from Trinidad, backed by our repair and servicing capability.',
      es: 'Reductores montados en eje que suministra Q² Machines desde Trinidad, con el respaldo de nuestra capacidad de reparación y mantenimiento.',
      pt: 'Redutores de eixo montado fornecidos pela Q² Machines a partir de Trinidad, com o apoio da nossa capacidade de reparo e manutenção.',
      nl: 'Opsteekreductoren geleverd door Q² Machines vanuit Trinidad, ondersteund door onze reparatie- en onderhoudscapaciteit.', // native review
      fr: "Réducteurs pendulaires fournis par Q² Machines depuis Trinidad, avec l'appui de nos capacités de réparation et d'entretien.", // native review
    },
    intro: {
      en: 'Shaft-mounted gear reducers are the workhorses of industrial power transmission. They mount directly onto the driven machine’s shaft through a hollow bore, with a torque arm to maintain the gear reducer in a stable position during operation. With no foot mounting or base plate needed, they install quickly and easily. They are widely used on conveyors, bucket elevators, mixers, fine and coarse material washers and similar equipment. Q² Machines supplies, services and supports OCR shaft-mounted gear reducers from Modena, Italy.',
      es: 'Los reductores montados en eje son los caballos de batalla de la transmisión de potencia industrial. Se montan directamente sobre el eje de la máquina accionada mediante un orificio hueco, con un brazo de reacción que mantiene el reductor en una posición estable durante el funcionamiento. Al no requerir patas de fijación ni bancada, se instalan de forma rápida y sencilla. Se utilizan ampliamente en transportadores, elevadores de cangilones, mezcladoras, lavadoras de materiales finos y gruesos y equipos similares. Q² Machines suministra, mantiene y respalda reductores montados en eje OCR de Módena, Italia.',
      pt: 'Os redutores de eixo montado são os cavalos de batalha da transmissão de potência industrial. Montam-se diretamente no eixo da máquina acionada por meio de um furo oco, com um braço de reação que mantém o redutor em posição estável durante a operação. Como não precisam de fixação por pés nem de base, são instalados de forma rápida e simples. São muito utilizados em transportadores, elevadores de caçambas, misturadores, lavadores de materiais finos e grossos e equipamentos semelhantes. A Q² Machines fornece, faz a manutenção e dá suporte a redutores de eixo montado OCR de Módena, Itália.',
      nl: 'Opsteekreductoren zijn de werkpaarden van de industriële krachtoverbrenging. Ze worden met een holle boring direct op de as van de aangedreven machine geplaatst, met een reactiearm die de reductor tijdens het bedrijf in een stabiele positie houdt. Omdat er geen voetbevestiging of basisplaat nodig is, zijn ze snel en eenvoudig te installeren. Ze worden veel gebruikt op transporteurs, emmerelevators, mengers, wassers voor fijn en grof materiaal en vergelijkbare apparatuur. Q² Machines levert, onderhoudt en ondersteunt OCR-opsteekreductoren uit Modena, Italië.', // native review
      fr: "Les réducteurs pendulaires sont les piliers de la transmission de puissance industrielle. Ils se montent directement sur l’arbre de la machine entraînée par un alésage creux, avec un bras de réaction qui maintient le réducteur dans une position stable pendant le fonctionnement. Sans pattes de fixation ni châssis, ils s’installent rapidement et facilement. Ils sont largement utilisés sur les convoyeurs, les élévateurs à godets, les malaxeurs, les laveurs de matériaux fins et grossiers et les équipements similaires. Q² Machines fournit, entretient et soutient les réducteurs pendulaires OCR de Modène, en Italie.", // native review
    },
    tileImage: { file: TILE, w: 600, h: 600, alt: tileAlt },
  },
  {
    id: 'ocr-rp-series',
    parent: 'gear-reducers',
    slug: 'ocr-rp-series',
    order: 10,
    live: true,
    serviceParam: 'reducers',
    brand: { name: 'O.C.R. Riduttori', url: 'https://www.ocr-riduttori.com' },
    name: {
    "en": "OCR RP Series Shaft-Mounted Gear Reducers",
    "es": "Reductores Montados en Eje OCR Serie RP",
    "pt": "Redutores de Eixo Montado OCR Série RP",
    "nl": "OCR RP-serie Opsteekreductoren",
    "fr": "Réducteurs Pendulaires OCR Série RP"
  },
    description: {
    "en": "Q² Machines is the authorised agent for OCR RP Series shaft-mounted gear reducers: 8 sizes, 0.6–155 kW, up to 11,280 Nm. Supplied from Trinidad.",
    "es": "Q² Machines es el agente autorizado de los reductores montados en eje OCR Serie RP: 8 tamaños, 0,6–155 kW, hasta 11.280 Nm. Suministro desde Trinidad.",
    "pt": "A Q² Machines é a agente autorizada dos redutores de eixo montado OCR Série RP: 8 tamanhos, 0,6–155 kW, até 11.280 Nm. Fornecimento a partir de Trinidad.",
    "nl": "Q² Machines is de erkende agent voor OCR RP-serie opsteekreductoren: 8 maten, 0,6–155 kW, tot 11.280 Nm. Geleverd vanuit Trinidad.",
    "fr": "Q² Machines est l'agent agréé des réducteurs pendulaires OCR Série RP : 8 tailles, 0,6–155 kW, jusqu'à 11 280 Nm. Fourniture depuis Trinidad."
  },
    tileImage: { file: TILE, w: 600, h: 600, alt: tileAlt },
    images: [
      {
        file: 'assets/products/ocr-rp/hero.webp',
        jpg: 'assets/products/ocr-rp/hero.jpg',
        w: 1200,
        h: 674,
        alt: heroAlt,
      },
    ],
    dimensions: DIMS.map(([size, weightKg, w, h]) => ({
      size,
      file: `assets/products/ocr-rp/dim-${size}.webp`,
      w,
      h,
      weightKg,
      alt: dimAlt(size),
    })),
    specs: {
      columns: [
        { key: 'model', type: 'text', sticky: true },
        { key: 'size', type: 'enum', filter: 'select' },
        { key: 'ratio', type: 'number', filter: 'range' },
        { key: 'n2', type: 'number', unit: 'rpm' },
        { key: 'n1', type: 'number', unit: 'rpm' },
        { key: 'kw', type: 'number', unit: 'kW', filter: 'range' },
        { key: 'torque', type: 'number', unit: 'Nm', filter: 'range' },
      ],
      rows,
    },
    // Migrated verbatim from PAGES[0] of the previous build; do not reword.
    copy: {
    "en": {
      "label": "Products",
      "title": "OCR RP Series Shaft-Mounted Gear Reducers — Trinidad | Q² Machines",
      "description": "Q² Machines is the authorised agent for OCR RP Series shaft-mounted gear reducers: 8 sizes, 0.6–155 kW, up to 11,280 Nm. Supplied from Trinidad.",
      "h1Html": "OCR RP Series <span>Shaft-Mounted Gear Reducers</span>",
      "lead": "The RP Series shaft-mounted reducers are built for conveyors, screw conveyors, elevators, mixers and crushers, and are supplied and supported by our team.",
      "facts": [
        [
          "8",
          "sizes (85 to 250)"
        ],
        [
          "0.6–155 kW",
          "rated power"
        ],
        [
          "up to 11,280 Nm",
          "output torque"
        ],
        [
          "0.98",
          "efficiency, single stage"
        ],
        [
          "Modena, Italy",
          "made by OCR"
        ]
      ],
      "howH": "How a shaft-mounted reducer works",
      "how": "A shaft-mounted reducer fits directly onto the shaft of the driven machine, so no coupling or base plate is needed. The motor drives the reducer through a belt, and a torque arm anchors the reducer and keeps the belts at the correct tension. Changing the motor and reducer pulleys gives a range of output speeds.",
      "buildH": "Construction and options",
      "build": [
        "Grey cast-iron housing with reinforcing and cooling ribs",
        "Case-hardened helical steel gears with a controlled or ground tooth profile",
        "Ball and/or taper-roller bearings",
        "Hollow output shaft in Fe510 steel, with keyway and circlip groove",
        "Oil-bath lubrication with filler, level and drain plugs",
        "Double-lip seals and blue RAL 5010 finish",
        "Torque arm with brackets",
        "Backstop available on request for all sizes, plus special executions and accessories"
      ],
      "buildNote": "Gear capacity is calculated to ISO 6336, DIN 3990 and AGMA 2001-B88. Efficiency is about 0.98 for single-stage and 0.96 for double-stage units.",
      "appH": "Applications",
      "apps": [
        "Conveyors and screw conveyors",
        "Elevators",
        "Mixers",
        "Crushers",
        "Feeders, screens and stackers"
      ],
      "supportH": "Support from Q² Machines",
      "supportHtml": "We supply the RP Series with spares and drawings (DXF, PDF, STEP) on request, and help you select the right size for your duty. Repair, rewinding and servicing of gear reducers is covered on our <a href=\"/services/pumps-and-drives.html\">Pumps, Motors &amp; Gear Reducers</a> page.",
      "faqH": "Frequently asked questions",
      "faq": [
        [
          "Which sizes and ratings does the RP Series cover?",
          "There are eight sizes, from 85 to 250, covering 0.6 to 155 kW and output torques from 160 to 11,280 Nm. Send us your power, speed and duty details and we will recommend a size."
        ],
        [
          "Is a backstop available?",
          "Yes. A backstop that prevents rotation in one direction is available on request for all sizes."
        ],
        [
          "Can you supply drawings and spare parts?",
          "Yes. Dimensional drawings in DXF, PDF and STEP formats, and spare parts, are available on request."
        ]
      ]
    },
    "es": {
      "label": "Productos",
      "title": "Reductores Montados en Eje OCR Serie RP — Trinidad | Q² Machines",
      "description": "Q² Machines es el agente autorizado de los reductores montados en eje OCR Serie RP: 8 tamaños, 0,6–155 kW, hasta 11.280 Nm. Suministro desde Trinidad.",
      "h1Html": "Reductores Montados en Eje <span>OCR Serie RP</span>",
      "lead": "Los reductores montados en eje de la Serie RP están pensados para transportadores, transportadores de tornillo, elevadores, mezcladoras y trituradoras, y los suministra y respalda nuestro equipo.",
      "facts": [
        [
          "8",
          "tamaños (de 85 a 250)"
        ],
        [
          "0,6–155 kW",
          "potencia nominal"
        ],
        [
          "hasta 11.280 Nm",
          "par de salida"
        ],
        [
          "0,98",
          "rendimiento, una etapa"
        ],
        [
          "Módena, Italia",
          "fabricado por OCR"
        ]
      ],
      "howH": "Cómo funciona un reductor montado en eje",
      "how": "Un reductor montado en eje se instala directamente sobre el eje de la máquina accionada, por lo que no se necesitan acoplamiento ni bancada. El motor acciona el reductor mediante correas, y un brazo de reacción fija el reductor y mantiene la tensión correcta de las correas. Al cambiar las poleas del motor y del reductor se obtiene un rango de velocidades de salida.",
      "buildH": "Construcción y opciones",
      "build": [
        "Carcasa de hierro fundido gris con nervaduras de refuerzo y refrigeración",
        "Engranajes helicoidales de acero cementado y templado, con perfil de diente controlado o rectificado",
        "Rodamientos de bolas y/o de rodillos cónicos",
        "Eje de salida hueco de acero Fe510, con chavetero y ranura para anillo elástico",
        "Lubricación por baño de aceite, con tapones de llenado, nivel y drenaje",
        "Retenes de doble labio y acabado azul RAL 5010",
        "Brazo de reacción con soportes",
        "Dispositivo antirretorno disponible bajo pedido en todos los tamaños, además de ejecuciones especiales y accesorios"
      ],
      "buildNote": "La capacidad de carga de los engranajes se calcula según ISO 6336, DIN 3990 y AGMA 2001-B88. El rendimiento es de aproximadamente 0,98 en unidades de una etapa y 0,96 en unidades de dos etapas.",
      "appH": "Aplicaciones",
      "apps": [
        "Transportadores y transportadores de tornillo",
        "Elevadores",
        "Mezcladoras",
        "Trituradoras",
        "Alimentadores, cribas y apiladores"
      ],
      "supportH": "Respaldo de Q² Machines",
      "supportHtml": "Suministramos la Serie RP con repuestos y planos (DXF, PDF, STEP) bajo pedido, y le ayudamos a elegir el tamaño adecuado para su servicio. La reparación, el rebobinado y el mantenimiento de reductores se describen en nuestra página de <a href=\"/services/pumps-and-drives.html\">Bombas, Motores y Reductores</a>.",
      "faqH": "Preguntas frecuentes",
      "faq": [
        [
          "¿Qué tamaños y capacidades cubre la Serie RP?",
          "Hay ocho tamaños, del 85 al 250, que cubren de 0,6 a 155 kW y pares de salida de 160 a 11.280 Nm. Envíenos los datos de potencia, velocidad y servicio y le recomendaremos un tamaño."
        ],
        [
          "¿Hay dispositivo antirretorno disponible?",
          "Sí. Hay un dispositivo antirretorno, que impide el giro en un sentido, disponible bajo pedido para todos los tamaños."
        ],
        [
          "¿Pueden suministrar planos y repuestos?",
          "Sí. Los planos dimensionales en formatos DXF, PDF y STEP, así como los repuestos, están disponibles bajo pedido."
        ]
      ]
    },
    "pt": {
      "label": "Produtos",
      "title": "Redutores de Eixo Montado OCR Série RP — Trinidad | Q² Machines",
      "description": "A Q² Machines é a agente autorizada dos redutores de eixo montado OCR Série RP: 8 tamanhos, 0,6–155 kW, até 11.280 Nm. Fornecimento a partir de Trinidad.",
      "h1Html": "Redutores de Eixo Montado <span>OCR Série RP</span>",
      "lead": "Os redutores de eixo montado da Série RP são projetados para transportadores, transportadores helicoidais, elevadores, misturadores e britadores, e são fornecidos e apoiados pela nossa equipe.",
      "facts": [
        [
          "8",
          "tamanhos (de 85 a 250)"
        ],
        [
          "0,6–155 kW",
          "potência nominal"
        ],
        [
          "até 11.280 Nm",
          "torque de saída"
        ],
        [
          "0,98",
          "rendimento, um estágio"
        ],
        [
          "Módena, Itália",
          "fabricado pela OCR"
        ]
      ],
      "howH": "Como funciona um redutor de eixo montado",
      "how": "Um redutor de eixo montado é instalado diretamente no eixo da máquina acionada, dispensando acoplamento e base. O motor aciona o redutor por correias, e um braço de reação fixa o redutor e mantém a tensão correta das correias. Trocando as polias do motor e do redutor obtém-se uma faixa de velocidades de saída.",
      "buildH": "Construção e opcionais",
      "build": [
        "Carcaça de ferro fundido cinzento com nervuras de reforço e de refrigeração",
        "Engrenagens helicoidais de aço cementado e temperado, com perfil de dente controlado ou retificado",
        "Rolamentos de esferas e/ou de rolos cônicos",
        "Eixo de saída oco em aço Fe510, com rasgo de chaveta e ranhura para anel elástico",
        "Lubrificação por banho de óleo, com bujões de enchimento, nível e dreno",
        "Retentores de duplo lábio e acabamento azul RAL 5010",
        "Braço de reação com suportes",
        "Dispositivo antirretorno disponível sob consulta em todos os tamanhos, além de execuções especiais e acessórios"
      ],
      "buildNote": "A capacidade de carga das engrenagens é calculada conforme ISO 6336, DIN 3990 e AGMA 2001-B88. O rendimento é de cerca de 0,98 nas unidades de um estágio e 0,96 nas de dois estágios.",
      "appH": "Aplicações",
      "apps": [
        "Transportadores e transportadores helicoidais",
        "Elevadores",
        "Misturadores",
        "Britadores",
        "Alimentadores, peneiras e stackers"
      ],
      "supportH": "Suporte da Q² Machines",
      "supportHtml": "Fornecemos a Série RP com peças de reposição e desenhos (DXF, PDF, STEP) sob consulta, e ajudamos você a escolher o tamanho adequado para a sua aplicação. O reparo, o rebobinamento e a manutenção de redutores estão descritos na nossa página de <a href=\"/services/pumps-and-drives.html\">Bombas, Motores e Redutores</a>.",
      "faqH": "Perguntas frequentes",
      "faq": [
        [
          "Que tamanhos e capacidades a Série RP abrange?",
          "São oito tamanhos, do 85 ao 250, cobrindo de 0,6 a 155 kW e torques de saída de 160 a 11.280 Nm. Envie-nos os dados de potência, rotação e regime de trabalho e recomendaremos um tamanho."
        ],
        [
          "Há dispositivo antirretorno disponível?",
          "Sim. Um dispositivo antirretorno, que impede a rotação em um sentido, está disponível sob consulta para todos os tamanhos."
        ],
        [
          "Vocês fornecem desenhos e peças de reposição?",
          "Sim. Desenhos dimensionais nos formatos DXF, PDF e STEP, bem como peças de reposição, estão disponíveis sob consulta."
        ]
      ]
    },
    "nl": {
      "label": "Producten",
      "title": "OCR RP-serie Opsteekreductoren — Trinidad | Q² Machines",
      "description": "Q² Machines is de erkende agent voor OCR RP-serie opsteekreductoren: 8 maten, 0,6–155 kW, tot 11.280 Nm. Geleverd vanuit Trinidad.",
      "h1Html": "OCR RP-serie <span>Opsteekreductoren</span>",
      "lead": "De opsteekreductoren van de RP-serie zijn gebouwd voor transporteurs, schroeftransporteurs, elevators, mengers en brekers en worden door ons team geleverd en ondersteund.",
      "facts": [
        [
          "8",
          "maten (85 tot 250)"
        ],
        [
          "0,6–155 kW",
          "nominaal vermogen"
        ],
        [
          "tot 11.280 Nm",
          "uitgaand koppel"
        ],
        [
          "0,98",
          "rendement, enkele trap"
        ],
        [
          "Modena, Italië",
          "gemaakt door OCR"
        ]
      ],
      "howH": "Hoe een opsteekreductor werkt",
      "how": "Een opsteekreductor wordt direct op de as van de aangedreven machine gemonteerd, zodat geen koppeling of grondplaat nodig is. De motor drijft de reductor aan via riemen en een reactiearm zet de reductor vast en houdt de riemen op de juiste spanning. Door de riemschijven van motor en reductor te wisselen krijgt u een bereik aan uitgaande toerentallen.",
      "buildH": "Constructie en opties",
      "build": [
        "Behuizing van grijs gietijzer met versterkings- en koelribben",
        "Schuin vertande tandwielen van gecementeerd en gehard staal, met gecontroleerd of geslepen tandprofiel",
        "Kogellagers en/of kegelrollagers",
        "Holle uitgaande as van Fe510-staal, met spiebaan en groef voor borgring",
        "Oliebadsmering met vul-, peil- en aftapplug",
        "Afdichtingen met dubbele lip en blauwe afwerking RAL 5010",
        "Reactiearm met beugels",
        "Terugloopbeveiliging op aanvraag leverbaar voor alle maten, plus speciale uitvoeringen en accessoires"
      ],
      "buildNote": "De belastbaarheid van de tandwielen is berekend volgens ISO 6336, DIN 3990 en AGMA 2001-B88. Het rendement bedraagt circa 0,98 bij enkeltraps- en 0,96 bij tweetrapsuitvoeringen.",
      "appH": "Toepassingen",
      "apps": [
        "Transporteurs en schroeftransporteurs",
        "Elevators",
        "Mengers",
        "Brekers",
        "Voeders, zeven en stackers"
      ],
      "supportH": "Ondersteuning door Q² Machines",
      "supportHtml": "Wij leveren de RP-serie met reserveonderdelen en tekeningen (DXF, PDF, STEP) op aanvraag en helpen u de juiste maat voor uw toepassing te kiezen. Reparatie, herwikkeling en onderhoud van reductoren vindt u op onze pagina <a href=\"/services/pumps-and-drives.html\">Pompen, Motoren &amp; Reductoren</a>.",
      "faqH": "Veelgestelde vragen",
      "faq": [
        [
          "Welke maten en vermogens omvat de RP-serie?",
          "Er zijn acht maten, van 85 tot 250, voor 0,6 tot 155 kW en uitgaande koppels van 160 tot 11.280 Nm. Stuur ons uw vermogen, toerental en bedrijfsomstandigheden en wij adviseren een maat."
        ],
        [
          "Is een terugloopbeveiliging leverbaar?",
          "Ja. Een terugloopbeveiliging, die rotatie in één richting voorkomt, is op aanvraag leverbaar voor alle maten."
        ],
        [
          "Kunt u tekeningen en reserveonderdelen leveren?",
          "Ja. Maattekeningen in DXF-, PDF- en STEP-formaat en reserveonderdelen zijn op aanvraag beschikbaar."
        ]
      ]
    },
    "fr": {
      "label": "Produits",
      "title": "Réducteurs Pendulaires OCR Série RP — Trinidad | Q² Machines",
      "description": "Q² Machines est l'agent agréé des réducteurs pendulaires OCR Série RP : 8 tailles, 0,6–155 kW, jusqu'à 11 280 Nm. Fourniture depuis Trinidad.",
      "h1Html": "Réducteurs Pendulaires <span>OCR Série RP</span>",
      "lead": "Les réducteurs pendulaires de la Série RP sont conçus pour les convoyeurs, les convoyeurs à vis, les élévateurs, les malaxeurs et les concasseurs, et sont fournis et soutenus par notre équipe.",
      "facts": [
        [
          "8",
          "tailles (de 85 à 250)"
        ],
        [
          "0,6–155 kW",
          "puissance nominale"
        ],
        [
          "jusqu'à 11 280 Nm",
          "couple de sortie"
        ],
        [
          "0,98",
          "rendement, un étage"
        ],
        [
          "Modène, Italie",
          "fabriqué par OCR"
        ]
      ],
      "howH": "Comment fonctionne un réducteur pendulaire",
      "how": "Un réducteur pendulaire se monte directement sur l'arbre de la machine entraînée, sans accouplement ni socle. Le moteur entraîne le réducteur par courroies, et un bras de réaction fixe le réducteur et maintient la bonne tension des courroies. En changeant les poulies du moteur et du réducteur, on obtient une plage de vitesses de sortie.",
      "buildH": "Construction et options",
      "build": [
        "Carter en fonte grise avec nervures de renfort et de refroidissement",
        "Engrenages hélicoïdaux en acier cémenté et trempé, à profil de denture contrôlé ou rectifié",
        "Roulements à billes et/ou à rouleaux coniques",
        "Arbre de sortie creux en acier Fe510, avec rainure de clavette et gorge pour circlip",
        "Lubrification par bain d'huile, avec bouchons de remplissage, de niveau et de vidange",
        "Joints à double lèvre et finition bleue RAL 5010",
        "Bras de réaction avec étriers",
        "Dispositif antidévireur disponible sur demande pour toutes les tailles, ainsi que des exécutions spéciales et des accessoires"
      ],
      "buildNote": "La capacité de charge des engrenages est calculée selon ISO 6336, DIN 3990 et AGMA 2001-B88. Le rendement est d'environ 0,98 pour les unités à un étage et de 0,96 pour celles à deux étages.",
      "appH": "Applications",
      "apps": [
        "Convoyeurs et convoyeurs à vis",
        "Élévateurs",
        "Malaxeurs",
        "Concasseurs",
        "Alimentateurs, cribles et stackers"
      ],
      "supportH": "Le soutien de Q² Machines",
      "supportHtml": "Nous fournissons la Série RP avec pièces de rechange et plans (DXF, PDF, STEP) sur demande, et nous vous aidons à choisir la taille adaptée à votre service. La réparation, le rebobinage et l'entretien des réducteurs sont décrits sur notre page <a href=\"/services/pumps-and-drives.html\">Pompes, Moteurs et Réducteurs</a>.",
      "faqH": "Questions fréquentes",
      "faq": [
        [
          "Quelles tailles et capacités couvre la Série RP ?",
          "Huit tailles, de 85 à 250, couvrent de 0,6 à 155 kW et des couples de sortie de 160 à 11 280 Nm. Envoyez-nous vos données de puissance, de vitesse et de service et nous vous recommanderons une taille."
        ],
        [
          "Un dispositif antidévireur est-il disponible ?",
          "Oui. Un dispositif antidévireur, qui empêche la rotation dans un sens, est disponible sur demande pour toutes les tailles."
        ],
        [
          "Pouvez-vous fournir des plans et des pièces de rechange ?",
          "Oui. Les plans dimensionnels aux formats DXF, PDF et STEP, ainsi que les pièces de rechange, sont disponibles sur demande."
        ]
      ]
    }
  },
  },
];

// Migrated verbatim from the previous Products hub text.
const HUB = {
  "en": {
    "label": "Products",
    "cardsH": "Product lines",
    "title": "Products — Equipment We Supply | Q² Machines",
    "description": "Industrial equipment supplied by Q² Machines from manufacturers it represents, backed by repair, fabrication and commissioning in Trinidad.",
    "h1Html": "Equipment We <span>Supply</span>",
    "lead": "Q² Machines supplies industrial equipment from manufacturers it represents, backed by our own repair, rewinding, fabrication and commissioning capability in Trinidad.",
    "more": "View product →",
    "moreLine": "More product lines are being added.",
    "linksHtml": "See our <a href=\"/services/\">services</a> or the <a href=\"/depot.html\">Equipment Depot</a> for units in stock."
  },
  "es": {
    "label": "Productos",
    "cardsH": "Líneas de productos",
    "title": "Productos — Equipos que Suministramos | Q² Machines",
    "description": "Equipos industriales que suministra Q² Machines de fabricantes que representa, con reparación, fabricación y puesta en marcha en Trinidad.",
    "h1Html": "Equipos que <span>Suministramos</span>",
    "lead": "Q² Machines suministra equipos industriales de fabricantes a los que representa, respaldados por nuestra propia capacidad de reparación, rebobinado, fabricación y puesta en marcha en Trinidad.",
    "more": "Ver producto →",
    "moreLine": "Estamos incorporando más líneas de productos.",
    "linksHtml": "Consulte nuestros <a href=\"/services/\">servicios</a> o el <a href=\"/depot.html\">Depósito de Equipos</a> para ver unidades en existencia."
  },
  "pt": {
    "label": "Produtos",
    "cardsH": "Linhas de produtos",
    "title": "Produtos — Equipamentos que Fornecemos | Q² Machines",
    "description": "Equipamentos industriais fornecidos pela Q² Machines de fabricantes que representa, com reparo, fabricação e comissionamento em Trinidad.",
    "h1Html": "Equipamentos que <span>Fornecemos</span>",
    "lead": "A Q² Machines fornece equipamentos industriais de fabricantes que representa, apoiados pela nossa própria capacidade de reparo, rebobinamento, fabricação e comissionamento em Trinidad.",
    "more": "Ver produto →",
    "moreLine": "Estamos adicionando mais linhas de produtos.",
    "linksHtml": "Veja nossos <a href=\"/services/\">serviços</a> ou o <a href=\"/depot.html\">Depósito de Equipamentos</a> para unidades em estoque."
  },
  "nl": {
    "label": "Producten",
    "cardsH": "Productlijnen",
    "title": "Producten — Apparatuur die Wij Leveren | Q² Machines",
    "description": "Industriële apparatuur die Q² Machines levert van fabrikanten die het vertegenwoordigt, met reparatie, fabricage en inbedrijfstelling in Trinidad.",
    "h1Html": "Apparatuur die wij <span>leveren</span>",
    "lead": "Q² Machines levert industriële apparatuur van fabrikanten die het vertegenwoordigt, ondersteund door onze eigen reparatie-, herwikkel-, fabricage- en inbedrijfstellingscapaciteit in Trinidad.",
    "more": "Product bekijken →",
    "moreLine": "Er worden meer productlijnen toegevoegd.",
    "linksHtml": "Bekijk onze <a href=\"/services/\">diensten</a> of het <a href=\"/depot.html\">Apparatuurdepot</a> voor machines op voorraad."
  },
  "fr": {
    "label": "Produits",
    "cardsH": "Gammes de produits",
    "title": "Produits — Équipements que Nous Fournissons | Q² Machines",
    "description": "Équipements industriels fournis par Q² Machines pour des fabricants qu'elle représente, avec réparation, fabrication et mise en service à Trinidad.",
    "h1Html": "Équipements que nous <span>fournissons</span>",
    "lead": "Q² Machines fournit des équipements industriels de fabricants qu'elle représente, avec l'appui de sa propre capacité de réparation, de rebobinage, de fabrication et de mise en service à Trinidad.",
    "more": "Voir le produit →",
    "moreLine": "D'autres gammes de produits seront ajoutées.",
    "linksHtml": "Consultez nos <a href=\"/services/\">services</a> ou le <a href=\"/depot.html\">Dépôt d'Équipements</a> pour les unités en stock."
  }
};

module.exports = { UI, NODES, HUB };
