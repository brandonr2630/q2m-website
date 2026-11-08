'use strict';
// Gear Reducers category page: narrative copy and the strings of the gearbox cutaway figure.
// English is the owner's final copy (gear-reducers-narrative.md). es/pt/nl/fr are translations: native review needed.
// p1 is also the category `intro` in products-data.js. The page renders p1, paras, the figure, the ratio
// block (ratioH, formula, example, note, closing) and the sizing list (sizeH, sizeItems).

const NARRATIVE = {
  en: {
    p1: 'Gear reducers are the workhorses of industrial power transmission. Generally, rotating machinery such as mixers and conveyors operate at lower revolutions per minute (rpm) than the motors driving them. Gear reducers (also referred to as gearboxes or speed reducers) are used between the motors and the driven machinery to reduce the rpm. The gear reducer lowers the speed while amplifying the torque (turning force).',
    paras: [
      'Speed and torque trade against each other; reduce the speed to one-tenth and the torque at the output increases by a factor of ten, less losses. This torque multiplication is also one of the factors considered in the selection of a gear reducer for a particular application.',
      'Gear reducers employ a system of interconnecting gears of different sizes to achieve the reduction in rpm and increase in torque. A small gear (pinion) driving a larger gear turns it more slowly and with more torque. Higher ratios are reached by stacking stages, and the ratios of the stages multiply: a 3:1 stage followed by a 4:1 stage gives 12:1. Typically, gear reducers have an input and output shaft. The motor couples to the input shaft while the component being driven couples to the output on the gear reducer. The input shaft is usually referred to as the ‘high speed shaft.’ The output is either a solid shaft joined to the driven machine by a coupling, or a hollow bore that slips over the machine’s own shaft. The hollow-bore, shaft-mounted arrangement is widely used on belt conveyor drives, where a torque arm holds the housing against rotation. When motor and reducer are supplied as one unit, it is called a gearmotor.',
    ],
    ratioH: 'Choosing the reduction ratio',
    formula: 'Reduction ratio = input rpm ÷ output rpm',
    example: 'Example: a 7.5 kW (10 hp) motor at 1,750 rpm drives a conveyor that needs about 146 rpm. The ratio is 1,750 ÷ 146 ≈ 12:1. The motor delivers about 41 N·m (30 lb-ft). The reducer output delivers about 12 × 41 × efficiency; at 96% efficiency that is roughly 470 N·m (350 lb-ft).',
    note: 'Helical gear reducers typically run in the mid-90% efficiency range per unit. Worm gear reducers are lower, roughly 50% to 90% depending on ratio, so they multiply torque by less.',
    closing: 'The ratio is the first number to settle, but it does not select the reducer on its own. The unit must also carry the torque and power, withstand the load type and running hours (the service factor, set by AGMA practice, rises with shock loading and long duty), stay within its thermal limit, and fit the mounting and shaft arrangement.',
    sizeH: 'What we need to size your reducer',
    sizeItems: [
      'Motor power and speed (kW or hp, rpm)',
      'Required output speed or reduction ratio',
      'Driven machine and load type (uniform, moderate shock, heavy shock)',
      'Running hours per day and starts per hour',
      'Mounting position, shaft or hollow-bore arrangement, and ambient conditions',
    ],
  },
  es: {
    p1: 'Los reductores de engranajes son los caballos de batalla de la transmisión de potencia industrial. Por lo general, la maquinaria rotativa, como mezcladoras y transportadores, funciona a menos revoluciones por minuto (rpm) que los motores que la accionan. Los reductores (también llamados cajas reductoras o reductores de velocidad) se instalan entre el motor y la máquina accionada para reducir las rpm. El reductor disminuye la velocidad y, al mismo tiempo, amplifica el par (la fuerza de giro).',
    paras: [
      'Velocidad y par se compensan entre sí: si se reduce la velocidad a una décima parte, el par en la salida se multiplica por diez, menos las pérdidas. Esta multiplicación del par es también uno de los factores que se consideran al seleccionar un reductor para una aplicación determinada.',
      'Los reductores emplean un sistema de engranajes interconectados de distintos tamaños para lograr la reducción de rpm y el aumento de par. Un engranaje pequeño (piñón) que acciona uno mayor lo hace girar más despacio y con más par. Las relaciones más altas se consiguen apilando etapas, y las relaciones de cada etapa se multiplican: una etapa de 3:1 seguida de una de 4:1 da 12:1. Normalmente, los reductores tienen un eje de entrada y un eje de salida. El motor se acopla al eje de entrada, mientras que el componente accionado se acopla a la salida del reductor. El eje de entrada suele llamarse ‘eje de alta velocidad’. La salida es un eje macizo unido a la máquina accionada mediante un acople, o un orificio hueco que se desliza sobre el eje de la propia máquina. La disposición montada en eje, con orificio hueco, se usa mucho en accionamientos de transportadores de banda, donde un brazo de reacción sujeta la carcasa para que no gire. Cuando motor y reductor se suministran como una sola unidad, se llama motorreductor.',
    ],
    ratioH: 'Cómo elegir la relación de reducción',
    formula: 'Relación de reducción = rpm de entrada ÷ rpm de salida',
    example: 'Ejemplo: un motor de 7,5 kW (10 hp) a 1.750 rpm acciona un transportador que necesita unas 146 rpm. La relación es 1.750 ÷ 146 ≈ 12:1. El motor entrega unos 41 N·m (30 lb-pie). La salida del reductor entrega unos 12 × 41 × rendimiento; con un rendimiento del 96 %, son aproximadamente 470 N·m (350 lb-pie).',
    note: 'Los reductores helicoidales suelen operar en un rango de rendimiento de mediados del 90 % por unidad. Los reductores de tornillo sin fin tienen menos rendimiento, aproximadamente del 50 % al 90 % según la relación, por lo que multiplican menos el par.',
    closing: 'La relación es el primer número que hay que fijar, pero por sí sola no selecciona el reductor. La unidad también debe soportar el par y la potencia, resistir el tipo de carga y las horas de funcionamiento (el factor de servicio, definido por la práctica AGMA, aumenta con las cargas de choque y los servicios prolongados), mantenerse dentro de su límite térmico y ajustarse al montaje y a la disposición de ejes.',
    sizeH: 'Qué necesitamos para dimensionar su reductor',
    sizeItems: [
      'Potencia y velocidad del motor (kW o hp, rpm)',
      'Velocidad de salida requerida o relación de reducción',
      'Máquina accionada y tipo de carga (uniforme, choque moderado, choque fuerte)',
      'Horas de funcionamiento por día y arranques por hora',
      'Posición de montaje, disposición de eje o de orificio hueco, y condiciones ambientales',
    ],
  },
  pt: {
    p1: 'Os redutores de engrenagens são os cavalos de batalha da transmissão de potência industrial. Em geral, máquinas rotativas, como misturadores e transportadores, operam com menos rotações por minuto (rpm) do que os motores que as acionam. Os redutores (também chamados de caixas de engrenagens ou redutores de velocidade) são instalados entre o motor e a máquina acionada para reduzir as rpm. O redutor diminui a velocidade e, ao mesmo tempo, amplifica o torque (a força de giro).',
    paras: [
      'Velocidade e torque se compensam: reduzindo a velocidade a um décimo, o torque na saída aumenta dez vezes, descontadas as perdas. Essa multiplicação de torque é também um dos fatores considerados na seleção de um redutor para uma aplicação específica.',
      'Os redutores empregam um sistema de engrenagens interligadas de tamanhos diferentes para obter a redução de rpm e o aumento de torque. Uma engrenagem pequena (pinhão) que aciona uma maior a faz girar mais devagar e com mais torque. Relações mais altas são obtidas empilhando estágios, e as relações dos estágios se multiplicam: um estágio de 3:1 seguido de um de 4:1 resulta em 12:1. Normalmente, os redutores têm um eixo de entrada e um de saída. O motor se acopla ao eixo de entrada, enquanto o componente acionado se acopla à saída do redutor. O eixo de entrada costuma ser chamado de ‘eixo de alta rotação’. A saída é um eixo maciço ligado à máquina acionada por um acoplamento, ou um furo oco que desliza sobre o eixo da própria máquina. A disposição de eixo montado, com furo oco, é muito usada em acionamentos de transportadores de correia, em que um braço de reação impede a carcaça de girar. Quando motor e redutor são fornecidos como uma só unidade, chama-se motorredutor.',
    ],
    ratioH: 'Como escolher a relação de redução',
    formula: 'Relação de redução = rpm de entrada ÷ rpm de saída',
    example: 'Exemplo: um motor de 7,5 kW (10 hp) a 1.750 rpm aciona um transportador que precisa de cerca de 146 rpm. A relação é 1.750 ÷ 146 ≈ 12:1. O motor entrega cerca de 41 N·m (30 lb-pé). A saída do redutor entrega cerca de 12 × 41 × rendimento; com rendimento de 96 %, isso dá aproximadamente 470 N·m (350 lb-pé).',
    note: 'Os redutores helicoidais costumam operar na faixa de rendimento de meados de 90 % por unidade. Os redutores de rosca sem fim têm rendimento menor, de aproximadamente 50 % a 90 % conforme a relação, e por isso multiplicam menos o torque.',
    closing: 'A relação é o primeiro número a definir, mas sozinha não seleciona o redutor. A unidade também deve suportar o torque e a potência, resistir ao tipo de carga e às horas de operação (o fator de serviço, definido pela prática AGMA, aumenta com cargas de choque e serviço prolongado), permanecer dentro do seu limite térmico e se ajustar à montagem e à disposição dos eixos.',
    sizeH: 'O que precisamos para dimensionar o seu redutor',
    sizeItems: [
      'Potência e rotação do motor (kW ou hp, rpm)',
      'Rotação de saída necessária ou relação de redução',
      'Máquina acionada e tipo de carga (uniforme, choque moderado, choque forte)',
      'Horas de operação por dia e partidas por hora',
      'Posição de montagem, disposição do eixo ou do furo oco e condições ambientais',
    ],
  },
  nl: {
    p1: 'Tandwielreductoren zijn de werkpaarden van de industriële krachtoverbrenging. Draaiende machines zoals mixers en transportbanden draaien doorgaans met minder toeren per minuut (rpm) dan de motoren die ze aandrijven. Tandwielreductoren (ook wel tandwielkasten of snelheidsreductoren genoemd) worden tussen de motor en de aangedreven machine geplaatst om het toerental te verlagen. De reductor verlaagt de snelheid en vergroot tegelijk het koppel (de draaikracht).',
    paras: [
      'Snelheid en koppel wegen tegen elkaar op: verlaag de snelheid tot een tiende en het koppel op de uitgaande as wordt tien keer zo groot, min de verliezen. Deze koppelvermenigvuldiging is ook een van de factoren bij het kiezen van een reductor voor een bepaalde toepassing.',
      'Tandwielreductoren gebruiken een stelsel van in elkaar grijpende tandwielen van verschillende grootte om het toerental te verlagen en het koppel te verhogen. Een klein tandwiel (rondsel) dat een groter tandwiel aandrijft, laat dit langzamer en met meer koppel draaien. Hogere overbrengingsverhoudingen worden bereikt door trappen te stapelen, en de verhoudingen van de trappen vermenigvuldigen zich: een trap van 3:1 gevolgd door een trap van 4:1 geeft 12:1. Een reductor heeft doorgaans een ingaande en een uitgaande as. De motor wordt gekoppeld aan de ingaande as, terwijl het aan te drijven onderdeel wordt gekoppeld aan de uitgang van de reductor. De ingaande as wordt meestal de ‘snellopende as’ genoemd. De uitgang is ofwel een massieve as die met een koppeling aan de aangedreven machine is verbonden, ofwel een holle boring die over de as van de machine zelf schuift. De opsteekuitvoering met holle boring wordt veel gebruikt bij aandrijvingen van bandtransporteurs, waar een reactiearm de behuizing tegen draaien behoedt. Wanneer motor en reductor als één eenheid worden geleverd, spreekt men van een motorreductor.',
    ],
    ratioH: 'De reductieverhouding kiezen',
    formula: 'Reductieverhouding = ingaand toerental ÷ uitgaand toerental',
    example: 'Voorbeeld: een motor van 7,5 kW (10 pk) op 1.750 rpm drijft een transporteur aan die ongeveer 146 rpm nodig heeft. De verhouding is 1.750 ÷ 146 ≈ 12:1. De motor levert ongeveer 41 N·m (30 lb-ft). De uitgang van de reductor levert ongeveer 12 × 41 × rendement; bij 96% rendement is dat ongeveer 470 N·m (350 lb-ft).',
    note: 'Reductoren met schuine vertanding halen doorgaans een rendement in de midden-90%-range per eenheid. Wormwielreductoren zitten lager, grofweg 50% tot 90% afhankelijk van de verhouding, en vermenigvuldigen het koppel dus minder.',
    closing: 'De verhouding is het eerste getal dat vastligt, maar bepaalt de reductor niet alleen. De unit moet ook het koppel en het vermogen aankunnen, bestand zijn tegen het belastingtype en de draaiuren (de servicefactor, volgens AGMA-praktijk, stijgt bij schokbelasting en lange bedrijfsduur), binnen zijn thermische grens blijven en passen bij de montage en de asuitvoering.',
    sizeH: 'Wat wij nodig hebben om uw reductor te dimensioneren',
    sizeItems: [
      'Motorvermogen en toerental (kW of pk, rpm)',
      'Gewenst uitgaand toerental of reductieverhouding',
      'Aangedreven machine en belastingtype (gelijkmatig, matige schok, zware schok)',
      'Draaiuren per dag en starts per uur',
      'Montagepositie, as- of holle-boringuitvoering en omgevingscondities',
    ],
  },
  fr: {
    p1: 'Les réducteurs sont les piliers de la transmission de puissance industrielle. En général, les machines tournantes comme les mélangeurs et les convoyeurs fonctionnent à un nombre de tours par minute (tr/min) inférieur à celui des moteurs qui les entraînent. Les réducteurs (aussi appelés boîtes d’engrenages ou réducteurs de vitesse) se placent entre le moteur et la machine entraînée pour réduire la vitesse de rotation. Le réducteur abaisse la vitesse tout en amplifiant le couple (la force de rotation).',
    paras: [
      'Vitesse et couple s’échangent : si l’on réduit la vitesse au dixième, le couple en sortie est multiplié par dix, aux pertes près. Cette multiplication du couple est aussi l’un des facteurs pris en compte dans le choix d’un réducteur pour une application donnée.',
      'Les réducteurs utilisent un système d’engrenages de tailles différentes pour réduire la vitesse de rotation et augmenter le couple. Un petit engrenage (pignon) qui entraîne un plus grand le fait tourner plus lentement et avec plus de couple. Les rapports plus élevés s’obtiennent en empilant des étages, et les rapports des étages se multiplient : un étage de 3:1 suivi d’un étage de 4:1 donne 12:1. En général, un réducteur possède un arbre d’entrée et un arbre de sortie. Le moteur se couple à l’arbre d’entrée, tandis que l’organe entraîné se couple à la sortie du réducteur. L’arbre d’entrée est généralement appelé « arbre rapide ». La sortie est soit un arbre plein relié à la machine entraînée par un accouplement, soit un alésage creux qui s’enfile sur l’arbre de la machine elle-même. La disposition pendulaire, à alésage creux, est très répandue sur les entraînements de convoyeurs à bande, où un bras de réaction empêche le carter de tourner. Lorsque le moteur et le réducteur sont fournis en un seul ensemble, on parle de motoréducteur.',
    ],
    ratioH: 'Choisir le rapport de réduction',
    formula: 'Rapport de réduction = vitesse d’entrée ÷ vitesse de sortie',
    example: 'Exemple : un moteur de 7,5 kW (10 ch) à 1 750 tr/min entraîne un convoyeur qui demande environ 146 tr/min. Le rapport est 1 750 ÷ 146 ≈ 12:1. Le moteur fournit environ 41 N·m (30 lb-ft). La sortie du réducteur fournit environ 12 × 41 × rendement ; à 96 % de rendement, cela donne à peu près 470 N·m (350 lb-ft).',
    note: 'Les réducteurs à engrenages hélicoïdaux affichent généralement un rendement de l’ordre de 95 % par unité. Les réducteurs à vis sans fin sont moins efficaces, environ 50 % à 90 % selon le rapport, et multiplient donc moins le couple.',
    closing: 'Le rapport est le premier chiffre à fixer, mais il ne suffit pas à choisir le réducteur. L’unité doit aussi supporter le couple et la puissance, résister au type de charge et aux heures de fonctionnement (le facteur de service, défini par la pratique AGMA, augmente avec les chocs et les services prolongés), rester dans sa limite thermique et convenir au montage et à la disposition des arbres.',
    sizeH: 'Ce qu’il nous faut pour dimensionner votre réducteur',
    sizeItems: [
      'Puissance et vitesse du moteur (kW ou ch, tr/min)',
      'Vitesse de sortie requise ou rapport de réduction',
      'Machine entraînée et type de charge (uniforme, chocs modérés, chocs forts)',
      'Heures de fonctionnement par jour et démarrages par heure',
      'Position de montage, arbre ou alésage creux, et conditions ambiantes',
    ],
  },
};

// Strings for the 3D figure (animated cutaway of a two-stage helical reducer, 12:1 = 3:1 x 4:1).
// lIn / lOut carry the speeds of the worked example (1,750 rpm in, 146 rpm out).
const GEARBOX = {
  en: {
    aria: 'Animated 3D cutaway of a two-stage helical gear reducer, 12:1 overall: input shaft, intermediate shaft and output shaft inside a housing with an oil sump.',
    nogl: 'This 3D model needs WebGL, which is not available in this browser.',
    caption: 'Two-stage helical gear reducer, 12:1 overall (3:1 × 4:1).',
    lIn: 'Input shaft · 1,750 rpm', lMid: 'Intermediate shaft', lOut: 'Output shaft · 146 rpm',
    lS1: 'Stage 1 · 3:1', lS2: 'Stage 2 · 4:1', lSump: 'Oil sump',
  },
  es: {
    aria: 'Corte 3D animado de un reductor helicoidal de dos etapas, 12:1 en total: eje de entrada, eje intermedio y eje de salida dentro de una carcasa con depósito de aceite.',
    nogl: 'Este modelo 3D necesita WebGL, que no está disponible en este navegador.',
    caption: 'Reductor helicoidal de dos etapas, 12:1 en total (3:1 × 4:1).',
    lIn: 'Eje de entrada · 1.750 rpm', lMid: 'Eje intermedio', lOut: 'Eje de salida · 146 rpm',
    lS1: 'Etapa 1 · 3:1', lS2: 'Etapa 2 · 4:1', lSump: 'Cárter de aceite',
  },
  pt: {
    aria: 'Corte 3D animado de um redutor helicoidal de dois estágios, 12:1 no total: eixo de entrada, eixo intermediário e eixo de saída dentro de uma carcaça com cárter de óleo.',
    nogl: 'Este modelo 3D precisa de WebGL, que não está disponível neste navegador.',
    caption: 'Redutor helicoidal de dois estágios, 12:1 no total (3:1 × 4:1).',
    lIn: 'Eixo de entrada · 1.750 rpm', lMid: 'Eixo intermediário', lOut: 'Eixo de saída · 146 rpm',
    lS1: 'Estágio 1 · 3:1', lS2: 'Estágio 2 · 4:1', lSump: 'Cárter de óleo',
  },
  nl: {
    aria: 'Geanimeerde 3D-doorsnede van een tweetraps tandwielreductor met schuine vertanding, 12:1 in totaal: ingaande, tussen- en uitgaande as in een behuizing met oliesump.',
    nogl: 'Dit 3D-model heeft WebGL nodig, dat in deze browser niet beschikbaar is.',
    caption: 'Tweetraps tandwielreductor met schuine vertanding, 12:1 in totaal (3:1 × 4:1).',
    lIn: 'Ingaande as · 1.750 rpm', lMid: 'Tussenas', lOut: 'Uitgaande as · 146 rpm',
    lS1: 'Trap 1 · 3:1', lS2: 'Trap 2 · 4:1', lSump: 'Oliesump',
  },
  fr: {
    aria: 'Coupe 3D animée d’un réducteur hélicoïdal à deux étages, 12:1 au total : arbre d’entrée, arbre intermédiaire et arbre de sortie dans un carter avec bain d’huile.',
    nogl: 'Ce modèle 3D nécessite WebGL, qui n’est pas disponible dans ce navigateur.',
    caption: 'Réducteur hélicoïdal à deux étages, 12:1 au total (3:1 × 4:1).',
    lIn: 'Arbre d’entrée · 1 750 tr/min', lMid: 'Arbre intermédiaire', lOut: 'Arbre de sortie · 146 tr/min',
    lS1: 'Étage 1 · 3:1', lS2: 'Étage 2 · 4:1', lSump: 'Bain d’huile',
  },
};

module.exports = { NARRATIVE, GEARBOX };
