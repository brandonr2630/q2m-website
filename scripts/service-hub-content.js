'use strict';
/**
 * Content for the /services/ hub page (all languages). The cards are generated from the service
 * pages in service-pages-content.js (name = page heading, text = page meta description), and the
 * "how we work" / "where we work" blocks reuse about.html's strings, so only the intro lives here.
 * Keep descriptions <= 160 characters.
 */

const HUB = {
  heroWord: 'SERVICES',
  en: {
    title: 'Industrial Plant Services — Trinidad & Caribbean | Q² Machines',
    description: 'Conveyor systems, concrete plants, pumps, fabrication, structural steel and geotechnical equipment from Q² Machines in Trinidad for the Caribbean.',
    h1Html: 'Our <span>Services</span>',
    lead: 'Q² Machines designs, manufactures and services industrial plant equipment from our facility in Trinidad, for clients across the Caribbean, Venezuela, Colombia, Guyana and South America. Choose a service for details.',
    more: 'View details →',
  },
  es: {
    title: 'Servicios para Plantas Industriales — Trinidad y el Caribe | Q² Machines',
    description: 'Sistemas de transporte, plantas de concreto, bombas, fabricación, estructuras de acero y equipos geotécnicos de Q² Machines desde Trinidad para el Caribe.',
    h1Html: 'Nuestros <span>Servicios</span>',
    lead: 'Q² Machines diseña, fabrica y da servicio a equipos para plantas industriales desde nuestras instalaciones en Trinidad, para clientes en el Caribe, Venezuela, Colombia, Guyana y Suramérica. Elija un servicio para ver los detalles.',
    more: 'Ver detalles →',
  },
  pt: {
    title: 'Serviços para Plantas Industriais — Trinidad e Caribe | Q² Machines',
    description: 'Sistemas de transporte, usinas de concreto, bombas, fabricação, estruturas de aço e equipamentos geotécnicos da Q² Machines em Trinidad para o Caribe.',
    h1Html: 'Nossos <span>Serviços</span>',
    lead: 'A Q² Machines projeta, fabrica e faz a manutenção de equipamentos para plantas industriais a partir de nossas instalações em Trinidad, para clientes no Caribe, na Venezuela, na Colômbia, na Guiana e na América do Sul. Escolha um serviço para ver os detalhes.',
    more: 'Ver detalhes →',
  },
  nl: {
    title: 'Diensten voor Industriële Installaties — Trinidad | Q² Machines',
    description: 'Transportbanden, betoncentrales, pompen, fabricage, staalconstructies en geotechnische apparatuur van Q² Machines vanuit Trinidad voor het Caribisch gebied.',
    h1Html: 'Onze <span>Diensten</span>',
    lead: 'Q² Machines ontwerpt, fabriceert en onderhoudt apparatuur voor industriële installaties vanuit onze vestiging in Trinidad, voor klanten in het Caribisch gebied, Venezuela, Colombia, Guyana en Zuid-Amerika. Kies een dienst voor details.',
    more: 'Bekijk details →',
  },
  fr: {
    title: 'Services pour Installations Industrielles — Trinidad | Q² Machines',
    description: 'Convoyeurs, centrales à béton, pompes, fabrication, structures en acier et équipements géotechniques de Q² Machines depuis Trinidad pour les Caraïbes.',
    h1Html: 'Nos <span>Services</span>',
    lead: 'Q² Machines conçoit, fabrique et entretient des équipements pour installations industrielles depuis notre site de Trinidad, pour des clients dans les Caraïbes, au Venezuela, en Colombie, au Guyana et en Amérique du Sud. Choisissez un service pour les détails.',
    more: 'Voir les détails →',
  },
};

module.exports = HUB;
