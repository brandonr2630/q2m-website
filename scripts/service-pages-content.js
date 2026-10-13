'use strict';
/**
 * Content for the service pages (one entry per page, one block per language).
 * Built into services/<slug>.html and {es,pt,nl,fr}/services/<slug>.html by build-service-pages.js.
 *
 * Facts come only from the site itself (service cards, llms-full.txt, projects.json).
 * Keep descriptions <= 160 characters. supplyNoteHtml may contain links.
 */

const COMMON = {
  en: { label: 'Services', supplyH: 'What we supply', doH: 'What we do', houseH: 'Built in-house', projectH: 'Related project', projectsLink: 'See all projects →', faqH: 'Frequently asked questions' },
  es: { label: 'Servicios', supplyH: 'Qué suministramos', doH: 'Qué hacemos', houseH: 'Todo en nuestras instalaciones', projectH: 'Proyecto relacionado', projectsLink: 'Ver todos los proyectos →', faqH: 'Preguntas frecuentes' },
  pt: { label: 'Serviços', supplyH: 'O que fornecemos', doH: 'O que fazemos', houseH: 'Tudo em nossas instalações', projectH: 'Projeto relacionado', projectsLink: 'Ver todos os projetos →', faqH: 'Perguntas frequentes' },
  nl: { label: 'Diensten', supplyH: 'Wat wij leveren', doH: 'Wat wij doen', houseH: 'Alles in eigen huis', projectH: 'Gerelateerd project', projectsLink: 'Alle projecten bekijken →', faqH: 'Veelgestelde vragen' },
  fr: { label: 'Services', supplyH: 'Ce que nous fournissons', doH: 'Ce que nous faisons', houseH: 'Tout en interne', projectH: 'Projet associé', projectsLink: 'Voir tous les projets →', faqH: 'Questions fréquentes' },
};

const PAGES = [
  {
    slug: 'conveyor-systems',
    serviceParam: 'conveyors',
    heroWord: 'CONVEYORS',
    en: {
      title: 'Conveyor & Bulk Handling Systems — Trinidad & Caribbean | Q² Machines',
      description: 'Q² Machines designs, manufactures, installs and services belt conveyors and bulk material handling systems from Trinidad for the Caribbean and South America.',
      h1Html: 'Conveyor Systems &amp; <span>Bulk Material Handling</span>',
      lead: 'Q² Machines designs, manufactures, installs and services belt conveyors and bulk material handling systems for quarrying, minerals processing, concrete and cement, asphalt, recycling and manufacturing plants, as well as port loading and unloading facilities and packaging and package handling facilities.',
      supply: ['Belt conveyors and feeders', 'Screw conveyors', 'Bucket elevators', 'Hoppers, silos, tanks and vessels', 'Weighing systems', 'Components, hardware and spares', 'Safety systems and hardware'],
      supplyNote: 'We supply conveying systems for mineral and aggregate processing plants, port loading and unloading facilities, and packaging and package handling facilities.',
      does: ['Process and engineering design', 'Manufacture', 'Installation and commissioning', 'Component repair and rebuilds', 'Plant turnarounds', 'Plant and process improvement and optimisation'],
      house: 'Design and engineering, our fabrication and welding workshop and our machine shop are all in-house, so design, manufacture and commissioning stay with one team. We work from our facility in Trinidad for clients across the Caribbean, Venezuela, Colombia, Guyana and South America.',
      project: 'Sand & Gravel Wet Processing Plant Upgrade, Valencia, Trinidad and Tobago (2016): design of the secondary stage of a 250 TPH plant, with structural steelwork, machinery commissioning, and electrical and controls works.',
      faq: [
        ['What types of conveyors do you build, and for which facilities?', 'We supply belt conveyors and feeders, screw conveyors and bucket elevators, with hoppers, silos, tanks, vessels, weighing systems and safety systems. Our conveying systems serve mineral and aggregate processing plants, port loading and unloading facilities, and packaging and package handling facilities.'],
        ['Can you repair or rebuild existing conveyor equipment?', 'Yes. We offer component repair and rebuilds, plant turnarounds, and components, hardware and spares.'],
        ['Where do you install?', 'From Trinidad, we serve clients across the Caribbean, Venezuela, Colombia, Guyana and South America. Installation and commissioning are part of our scope.'],
      ],
    },
    es: {
      title: 'Transporte y Manejo de Graneles — Trinidad y el Caribe | Q² Machines',
      description: 'Q² Machines diseña, fabrica, instala y mantiene transportadores de banda y sistemas de manejo de graneles desde Trinidad para el Caribe y Suramérica.',
      h1Html: 'Sistemas de Transporte y <span>Manejo de Graneles</span>',
      lead: 'Q² Machines diseña, fabrica, instala y mantiene transportadores de banda y sistemas de manejo de materiales a granel para plantas de canteras, procesamiento de minerales, concreto y cemento, asfalto, reciclaje y manufactura, así como instalaciones portuarias de carga y descarga e instalaciones de empaque y manejo de paquetes.',
      supply: ['Transportadores de banda y alimentadores', 'Transportadores de tornillo', 'Elevadores de cangilones', 'Tolvas, silos, tanques y recipientes', 'Sistemas de pesaje', 'Componentes, herrajes y repuestos', 'Sistemas y herrajes de seguridad'],
      supplyNote: 'Suministramos sistemas de transporte para plantas de procesamiento de minerales y agregados, instalaciones portuarias de carga y descarga, e instalaciones de empaque y manejo de paquetes.',
      does: ['Diseño de procesos e ingeniería', 'Fabricación', 'Instalación y puesta en marcha', 'Reparación y reconstrucción de componentes', 'Paradas de planta', 'Mejora y optimización de plantas y procesos'],
      house: 'El diseño y la ingeniería, nuestro taller de fabricación y soldadura y nuestro taller de mecanizado están en nuestras propias instalaciones, de modo que el diseño, la fabricación y la puesta en marcha quedan en manos de un solo equipo. Trabajamos desde Trinidad para clientes en el Caribe, Venezuela, Colombia, Guyana y Suramérica.',
      project: 'Modernización de Planta de Procesamiento de Arena y Grava, Valencia, Trinidad y Tobago (2016): diseño de la segunda etapa de una planta de 250 TPH, con estructura de acero, puesta en marcha de maquinaria y obras eléctricas y de control.',
      faq: [
        ['¿Qué tipos de transportadores fabrican y para qué instalaciones?', 'Suministramos transportadores de banda y alimentadores, transportadores de tornillo y elevadores de cangilones, con tolvas, silos, tanques, recipientes, sistemas de pesaje y sistemas de seguridad. Nuestros sistemas de transporte sirven a plantas de procesamiento de minerales y agregados, instalaciones portuarias de carga y descarga, e instalaciones de empaque y manejo de paquetes.'],
        ['¿Pueden reparar o reconstruir equipos de transporte existentes?', 'Sí. Ofrecemos reparación y reconstrucción de componentes, paradas de planta, y componentes, herrajes y repuestos.'],
        ['¿Dónde instalan?', 'Desde Trinidad atendemos clientes en el Caribe, Venezuela, Colombia, Guyana y Suramérica. La instalación y la puesta en marcha forman parte de nuestro alcance.'],
      ],
    },
    pt: {
      title: 'Transporte e Manuseio de Granéis — Trinidad e Caribe | Q² Machines',
      description: 'A Q² Machines projeta, fabrica, instala e mantém transportadores de correia e sistemas de granéis desde Trinidad para o Caribe e a América do Sul.',
      h1Html: 'Sistemas de Transporte e <span>Manuseio de Granéis</span>',
      lead: 'A Q² Machines projeta, fabrica, instala e mantém transportadores de correia e sistemas de manuseio de materiais a granel para pedreiras, processamento de minerais, concreto e cimento, asfalto, reciclagem e manufatura, bem como instalações portuárias de carga e descarga e instalações de embalagem e manuseio de pacotes.',
      supply: ['Transportadores de correia e alimentadores', 'Transportadores de rosca', 'Elevadores de canecas', 'Funis, silos, tanques e vasos', 'Sistemas de pesagem', 'Componentes, ferragens e peças de reposição', 'Sistemas e ferragens de segurança'],
      supplyNote: 'Fornecemos sistemas de transporte para plantas de processamento de minerais e agregados, instalações portuárias de carga e descarga e instalações de embalagem e manuseio de pacotes.',
      does: ['Projeto de processos e engenharia', 'Fabricação', 'Instalação e comissionamento', 'Reparo e reconstrução de componentes', 'Paradas de planta', 'Melhoria e otimização de plantas e processos'],
      house: 'O projeto e a engenharia, nossa oficina de fabricação e soldagem e nossa oficina de usinagem ficam em nossas próprias instalações, de modo que projeto, fabricação e comissionamento permanecem com uma única equipe. Atuamos a partir de Trinidad para clientes no Caribe, na Venezuela, na Colômbia, na Guiana e na América do Sul.',
      project: 'Modernização de Planta de Processamento de Areia e Cascalho, Valencia, Trinidad e Tobago (2016): projeto do segundo estágio de uma planta de 250 TPH, com estrutura metálica, comissionamento de maquinário e serviços elétricos e de controle.',
      faq: [
        ['Que tipos de transportadores vocês fabricam e para quais instalações?', 'Fornecemos transportadores de correia e alimentadores, transportadores de rosca e elevadores de canecas, com funis, silos, tanques, vasos, sistemas de pesagem e sistemas de segurança. Nossos sistemas de transporte atendem plantas de processamento de minerais e agregados, instalações portuárias de carga e descarga e instalações de embalagem e manuseio de pacotes.'],
        ['Vocês reparam ou reconstroem equipamentos de transporte existentes?', 'Sim. Oferecemos reparo e reconstrução de componentes, paradas de planta e componentes, ferragens e peças de reposição.'],
        ['Onde vocês instalam?', 'A partir de Trinidad, atendemos clientes no Caribe, na Venezuela, na Colômbia, na Guiana e na América do Sul. A instalação e o comissionamento fazem parte do nosso escopo.'],
      ],
    },
    nl: {
      title: 'Transportbanden & Bulkverwerking — Trinidad | Q² Machines',
      description: 'Q² Machines ontwerpt, fabriceert, installeert en onderhoudt transportbanden en bulkverwerking vanuit Trinidad voor het Caribisch gebied en Zuid-Amerika.',
      h1Html: 'Transportbandsystemen &amp; <span>Bulkverwerking</span>',
      lead: 'Q² Machines ontwerpt, fabriceert, installeert en onderhoudt transportbanden en systemen voor bulkverwerking voor steengroeven, mineralenverwerking, beton en cement, asfalt, recycling en maakindustrie, evenals laad- en losfaciliteiten in havens en faciliteiten voor verpakking en pakkethantering.',
      supply: ['Transportbanden en voeders', 'Schroeftransporteurs', 'Emmerelevatoren', 'Trechters, silo\'s, tanks en vaten', 'Weegsystemen', 'Onderdelen, hardware en reserveonderdelen', 'Veiligheidssystemen en -hardware'],
      supplyNote: 'Wij leveren transportsystemen voor installaties voor mineralen- en aggregaatverwerking, laad- en losfaciliteiten in havens, en faciliteiten voor verpakking en pakkethantering.',
      does: ['Proces- en technisch ontwerp', 'Fabricage', 'Installatie en inbedrijfstelling', 'Reparatie en revisie van onderdelen', 'Revisiestops', 'Verbetering en optimalisatie van installaties en processen'],
      house: 'Ontwerp en techniek, onze constructie- en lasafdeling en onze machinewerkplaats zijn allemaal in eigen huis, zodat ontwerp, fabricage en inbedrijfstelling bij één team blijven. Wij werken vanuit Trinidad voor klanten in het Caribisch gebied, Venezuela, Colombia, Guyana en Zuid-Amerika.',
      project: 'Modernisering Verwerkingsinstallatie Zand & Grind, Valencia, Trinidad en Tobago (2016): ontwerp van de tweede fase van een installatie van 250 TPH, met staalconstructie, inbedrijfstelling van machines en elektrische en besturingswerken.',
      faq: [
        ['Welke soorten transportbanden bouwen jullie, en voor welke faciliteiten?', 'Wij leveren transportbanden en voeders, schroeftransporteurs en emmerelevatoren, met trechters, silo\'s, tanks, vaten, weegsystemen en veiligheidssystemen. Onze transportsystemen bedienen installaties voor mineralen- en aggregaatverwerking, laad- en losfaciliteiten in havens, en faciliteiten voor verpakking en pakkethantering.'],
        ['Kunnen jullie bestaande transportapparatuur repareren of reviseren?', 'Ja. Wij bieden reparatie en revisie van onderdelen, revisiestops, en onderdelen, hardware en reserveonderdelen.'],
        ['Waar installeren jullie?', 'Vanuit Trinidad bedienen wij klanten in het Caribisch gebied, Venezuela, Colombia, Guyana en Zuid-Amerika. Installatie en inbedrijfstelling maken deel uit van ons werkterrein.'],
      ],
    },
    fr: {
      title: 'Convoyage et Manutention de Vrac — Trinidad et Caraïbes | Q² Machines',
      description: 'Q² Machines conçoit, fabrique, installe et entretient convoyeurs à bande et systèmes de vrac depuis Trinidad pour les Caraïbes et l\'Amérique du Sud.',
      h1Html: 'Systèmes de Convoyage et <span>Manutention de Vrac</span>',
      lead: 'Q² Machines conçoit, fabrique, installe et entretient des convoyeurs à bande et des systèmes de manutention de matériaux en vrac pour les carrières, le traitement des minerais, le béton et le ciment, l\'asphalte, le recyclage et l\'industrie manufacturière, ainsi que pour les installations portuaires de chargement et de déchargement et les installations d\'emballage et de manutention de colis.',
      supply: ['Convoyeurs à bande et alimentateurs', 'Convoyeurs à vis', 'Élévateurs à godets', 'Trémies, silos, réservoirs et cuves', 'Systèmes de pesage', 'Composants, quincaillerie et pièces de rechange', 'Systèmes et équipements de sécurité'],
      supplyNote: 'Nous fournissons des systèmes de convoyage pour les usines de traitement de minerais et de granulats, les installations portuaires de chargement et de déchargement, et les installations d\'emballage et de manutention de colis.',
      does: ['Conception de procédés et ingénierie', 'Fabrication', 'Installation et mise en service', 'Réparation et reconstruction de composants', 'Arrêts d\'usine', 'Amélioration et optimisation des installations et des procédés'],
      house: 'La conception et l\'ingénierie, notre atelier de fabrication et de soudage et notre atelier d\'usinage sont tous internes, de sorte que la conception, la fabrication et la mise en service restent entre les mains d\'une seule équipe. Nous travaillons depuis Trinidad pour des clients dans les Caraïbes, au Venezuela, en Colombie, au Guyana et en Amérique du Sud.',
      project: 'Modernisation de l\'Usine de Traitement de Sable et Gravier, Valencia, Trinité-et-Tobago (2016) : conception de la deuxième étape d\'une usine de 250 TPH, avec charpente métallique, mise en service des machines et travaux d\'électricité et de contrôle.',
      faq: [
        ['Quels types de convoyeurs fabriquez-vous, et pour quelles installations ?', 'Nous fournissons des convoyeurs à bande et alimentateurs, des convoyeurs à vis et des élévateurs à godets, avec trémies, silos, réservoirs, cuves, systèmes de pesage et systèmes de sécurité. Nos systèmes de convoyage servent les usines de traitement de minerais et de granulats, les installations portuaires de chargement et de déchargement, et les installations d\'emballage et de manutention de colis.'],
        ['Pouvez-vous réparer ou reconstruire des équipements de convoyage existants ?', 'Oui. Nous proposons la réparation et la reconstruction de composants, les arrêts d\'usine, ainsi que des composants, de la quincaillerie et des pièces de rechange.'],
        ['Où installez-vous ?', 'Depuis Trinidad, nous servons des clients dans les Caraïbes, au Venezuela, en Colombie, au Guyana et en Amérique du Sud. L\'installation et la mise en service font partie de notre périmètre.'],
      ],
    },
  },
  {
    slug: 'concrete-plants',
    serviceParam: 'concrete',
    heroWord: 'CONCRETE',
    en: {
      title: 'Concrete Batching Plants — Trinidad & Caribbean | Q² Machines',
      description: 'Q² Machines designs, builds and commissions stationary and mobile concrete batching plants in-house, for Trinidad, the Caribbean and South America.',
      h1Html: 'Concrete <span>Batching Plants</span>',
      lead: 'Q² Machines designs, builds and commissions stationary and mobile concrete batching plants in-house, for concrete producers and construction projects in Trinidad and across the Caribbean and South America.',
      supply: ['Stationary batching plants', 'Mobile batching plants', 'Concrete mixers', 'Cement silos', 'Weighing systems', 'Moisture control systems', 'Batch control system hardware and software'],
      supplyNoteHtml: 'Check the <a href="/depot.html">Equipment Depot</a> for concrete mixers currently in stock.',
      does: ['Process and engineering design', 'Manufacture and fabrication', 'Installation and commissioning', 'Plant upgrades and modifications'],
      house: 'Our plants are designed, built and commissioned in-house, using our in-house design and engineering, our fabrication and welding workshop and our machine shop. We work from our facility in Trinidad for clients across the Caribbean, Venezuela, Colombia, Guyana and South America.',
      project: 'Ready-Mix Concrete Batching Plant, Port of Spain, Trinidad and Tobago (2020): a semi-mobile plant with a 70 tonne, 2-compartment silo. The scope included design and construction management for the plant foundations, and installation and commissioning of all components: radial loading conveyor, aggregate bins, water supply and distribution, pneumatic systems, electricals and controls.',
      faq: [
        ['Do you build stationary and mobile plants?', 'Yes. We design, build and commission both stationary and mobile concrete batching plants in-house.'],
        ['What does a plant installation include?', 'On our Port of Spain ready-mix project, the scope covered design and construction management for the foundations, plus installation and commissioning of the loading conveyor, aggregate bins, water supply and distribution, pneumatic systems, electricals and controls.'],
        ['Can you upgrade an existing plant?', 'Yes. We carry out plant upgrades and modifications, and supply weighing, moisture control and batch control systems.'],
      ],
    },
    es: {
      title: 'Plantas Dosificadoras de Concreto — Trinidad y el Caribe | Q² Machines',
      description: 'Q² Machines diseña, construye y pone en marcha plantas dosificadoras de concreto fijas y móviles en sus instalaciones, para Trinidad, el Caribe y Suramérica.',
      h1Html: 'Plantas Dosificadoras <span>de Concreto</span>',
      lead: 'Q² Machines diseña, construye y pone en marcha plantas dosificadoras de concreto fijas y móviles en sus propias instalaciones, para productores de concreto y proyectos de construcción en Trinidad, el Caribe y Suramérica.',
      supply: ['Plantas dosificadoras fijas', 'Plantas dosificadoras móviles', 'Mezcladoras de concreto', 'Silos de cemento', 'Sistemas de pesaje', 'Sistemas de control de humedad', 'Hardware y software de control de dosificación'],
      supplyNoteHtml: 'Consulte el <a href="/depot.html">Depósito de Equipos</a> para ver las mezcladoras de concreto disponibles actualmente.',
      does: ['Diseño de procesos e ingeniería', 'Fabricación', 'Instalación y puesta en marcha', 'Mejoras y modificaciones de plantas'],
      house: 'Nuestras plantas se diseñan, construyen y ponen en marcha en nuestras propias instalaciones, con nuestro diseño e ingeniería internos, nuestro taller de fabricación y soldadura y nuestro taller de mecanizado. Trabajamos desde Trinidad para clientes en el Caribe, Venezuela, Colombia, Guyana y Suramérica.',
      project: 'Planta de Concreto Premezclado, Port of Spain, Trinidad y Tobago (2020): una planta semimóvil con un silo de 70 toneladas y 2 compartimentos. El alcance incluyó el diseño y la gestión de construcción de las cimentaciones de la planta, y la instalación y puesta en marcha de todos sus componentes: transportador radial de carga, tolvas de agregados, suministro y distribución de agua, sistemas neumáticos, electricidad y controles.',
      faq: [
        ['¿Construyen plantas fijas y móviles?', 'Sí. Diseñamos, construimos y ponemos en marcha plantas dosificadoras de concreto fijas y móviles en nuestras propias instalaciones.'],
        ['¿Qué incluye la instalación de una planta?', 'En nuestro proyecto de concreto premezclado en Port of Spain, el alcance cubrió el diseño y la gestión de construcción de las cimentaciones, además de la instalación y puesta en marcha del transportador de carga, las tolvas de agregados, el suministro y distribución de agua, los sistemas neumáticos, la electricidad y los controles.'],
        ['¿Pueden modernizar una planta existente?', 'Sí. Realizamos mejoras y modificaciones de plantas, y suministramos sistemas de pesaje, de control de humedad y de control de dosificación.'],
      ],
    },
    pt: {
      title: 'Usinas de Concreto — Trinidad e Caribe | Q² Machines',
      description: 'A Q² Machines projeta, constrói e comissiona usinas de concreto fixas e móveis em suas próprias instalações, para Trinidad, o Caribe e a América do Sul.',
      h1Html: 'Usinas <span>de Concreto</span>',
      lead: 'A Q² Machines projeta, constrói e comissiona usinas de concreto fixas e móveis em suas próprias instalações, para produtores de concreto e projetos de construção em Trinidad, no Caribe e na América do Sul.',
      supply: ['Usinas dosadoras fixas', 'Usinas dosadoras móveis', 'Misturadores de concreto', 'Silos de cimento', 'Sistemas de pesagem', 'Sistemas de controle de umidade', 'Hardware e software de controle de dosagem'],
      supplyNoteHtml: 'Consulte o <a href="/depot.html">Depósito de Equipamentos</a> para ver os misturadores de concreto disponíveis no momento.',
      does: ['Projeto de processos e engenharia', 'Fabricação', 'Instalação e comissionamento', 'Melhorias e modificações de plantas'],
      house: 'Nossas usinas são projetadas, construídas e comissionadas em nossas próprias instalações, com nosso projeto e engenharia internos, nossa oficina de fabricação e soldagem e nossa oficina de usinagem. Atuamos a partir de Trinidad para clientes no Caribe, na Venezuela, na Colômbia, na Guiana e na América do Sul.',
      project: 'Usina de Concreto Usinado, Port of Spain, Trinidad e Tobago (2020): uma usina semimóvel com silo de 70 toneladas e 2 compartimentos. O escopo incluiu o projeto e a gestão da construção das fundações da usina, e a instalação e o comissionamento de todos os componentes: transportador radial de carga, silos de agregados, fornecimento e distribuição de água, sistemas pneumáticos, parte elétrica e controles.',
      faq: [
        ['Vocês constroem usinas fixas e móveis?', 'Sim. Projetamos, construímos e comissionamos usinas de concreto fixas e móveis em nossas próprias instalações.'],
        ['O que inclui a instalação de uma usina?', 'No nosso projeto de concreto usinado em Port of Spain, o escopo abrangeu o projeto e a gestão da construção das fundações, além da instalação e do comissionamento do transportador de carga, dos silos de agregados, do fornecimento e distribuição de água, dos sistemas pneumáticos, da parte elétrica e dos controles.'],
        ['Vocês podem modernizar uma usina existente?', 'Sim. Realizamos melhorias e modificações de plantas e fornecemos sistemas de pesagem, de controle de umidade e de controle de dosagem.'],
      ],
    },
    nl: {
      title: 'Betoncentrales — Trinidad & Caribisch Gebied | Q² Machines',
      description: 'Q² Machines ontwerpt, bouwt en neemt vaste en mobiele betoncentrales in bedrijf, in eigen huis, voor Trinidad, het Caribisch gebied en Zuid-Amerika.',
      h1Html: 'Vaste en Mobiele <span>Betoncentrales</span>',
      lead: 'Q² Machines ontwerpt, bouwt en neemt vaste en mobiele betoncentrales in eigen huis in bedrijf, voor betonproducenten en bouwprojecten in Trinidad en in het hele Caribisch gebied en Zuid-Amerika.',
      supply: ['Vaste betoncentrales', 'Mobiele betoncentrales', 'Betonmengers', 'Cementsilo\'s', 'Weegsystemen', 'Vochtregelsystemen', 'Hardware en software voor batchbesturing'],
      supplyNoteHtml: 'Bekijk het <a href="/depot.html">Uitrustingsdepot</a> voor betonmengers die momenteel op voorraad zijn.',
      does: ['Proces- en technisch ontwerp', 'Fabricage', 'Installatie en inbedrijfstelling', 'Upgrades en aanpassingen van installaties'],
      house: 'Onze centrales worden in eigen huis ontworpen, gebouwd en in bedrijf gesteld, met ons eigen ontwerp en onze eigen techniek, onze constructie- en lasafdeling en onze machinewerkplaats. Wij werken vanuit Trinidad voor klanten in het Caribisch gebied, Venezuela, Colombia, Guyana en Zuid-Amerika.',
      project: 'Kant-en-klaar Betonmengcentrale, Port of Spain, Trinidad en Tobago (2020): een semi-mobiele centrale met een silo van 70 ton met 2 compartimenten. Het werkterrein omvatte ontwerp en bouwbegeleiding van de fundaties van de centrale, en installatie en inbedrijfstelling van alle onderdelen: radiale laadtransporteur, aggregaatbunkers, watervoorziening en -distributie, pneumatische systemen, elektra en besturing.',
      faq: [
        ['Bouwen jullie vaste en mobiele centrales?', 'Ja. Wij ontwerpen, bouwen en nemen zowel vaste als mobiele betoncentrales in eigen huis in bedrijf.'],
        ['Wat omvat de installatie van een centrale?', 'Bij ons betonproject in Port of Spain omvatte het werkterrein ontwerp en bouwbegeleiding van de fundaties, plus installatie en inbedrijfstelling van de laadtransporteur, aggregaatbunkers, watervoorziening en -distributie, pneumatische systemen, elektra en besturing.'],
        ['Kunnen jullie een bestaande centrale upgraden?', 'Ja. Wij voeren upgrades en aanpassingen van installaties uit en leveren weeg-, vochtregel- en batchbesturingssystemen.'],
      ],
    },
    fr: {
      title: 'Centrales à Béton — Trinidad et Caraïbes | Q² Machines',
      description: 'Q² Machines conçoit, construit et met en service des centrales à béton fixes et mobiles en interne, pour Trinidad, les Caraïbes et l\'Amérique du Sud.',
      h1Html: 'Centrales <span>à Béton</span>',
      lead: 'Q² Machines conçoit, construit et met en service des centrales à béton fixes et mobiles en interne, pour les producteurs de béton et les projets de construction à Trinidad, dans les Caraïbes et en Amérique du Sud.',
      supply: ['Centrales à béton fixes', 'Centrales à béton mobiles', 'Malaxeurs à béton', 'Silos à ciment', 'Systèmes de pesage', 'Systèmes de contrôle de l\'humidité', 'Matériel et logiciels de contrôle de dosage'],
      supplyNoteHtml: 'Consultez le <a href="/depot.html">Dépôt d\'Équipements</a> pour les malaxeurs à béton actuellement en stock.',
      does: ['Conception de procédés et ingénierie', 'Fabrication', 'Installation et mise en service', 'Améliorations et modifications d\'installations'],
      house: 'Nos centrales sont conçues, construites et mises en service en interne, avec notre conception et ingénierie internes, notre atelier de fabrication et de soudage et notre atelier d\'usinage. Nous travaillons depuis Trinidad pour des clients dans les Caraïbes, au Venezuela, en Colombie, au Guyana et en Amérique du Sud.',
      project: 'Centrale à Béton Prêt-à-l\'emploi, Port of Spain, Trinité-et-Tobago (2020) : une centrale semi-mobile avec un silo de 70 tonnes à 2 compartiments. Le périmètre comprenait la conception et la gestion de la construction des fondations de la centrale, ainsi que l\'installation et la mise en service de tous les composants : convoyeur radial de chargement, trémies à granulats, alimentation et distribution d\'eau, systèmes pneumatiques, électricité et contrôles.',
      faq: [
        ['Construisez-vous des centrales fixes et mobiles ?', 'Oui. Nous concevons, construisons et mettons en service des centrales à béton fixes et mobiles en interne.'],
        ['Qu\'inclut l\'installation d\'une centrale ?', 'Sur notre projet de béton prêt à l\'emploi à Port of Spain, le périmètre couvrait la conception et la gestion de la construction des fondations, ainsi que l\'installation et la mise en service du convoyeur de chargement, des trémies à granulats, de l\'alimentation et de la distribution d\'eau, des systèmes pneumatiques, de l\'électricité et des contrôles.'],
        ['Pouvez-vous moderniser une centrale existante ?', 'Oui. Nous réalisons des améliorations et modifications d\'installations et fournissons des systèmes de pesage, de contrôle de l\'humidité et de contrôle de dosage.'],
      ],
    },
  },
];

module.exports = { COMMON, PAGES };
