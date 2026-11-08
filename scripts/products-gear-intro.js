'use strict';
// Gear Reducers category page: narrative copy and the strings of the gearbox cutaway figure.
// English is the owner's final copy (gear-reducers-narrative.md). es/pt/nl/fr are translations: native review needed.
// p1 is also the category `intro` in products-data.js. The page renders p1, paras, the figure, the ratio
// block (ratioH, ratioParas, closing), the service factor block (svcH, svcParas) and the sizing list (sizeH, sizeItems).

const NARRATIVE = {
  en: {
    p1: 'Gear reducers are the workhorses of industrial power transmission. Generally, rotating machinery such as mixers and conveyors operate at lower revolutions per minute (rpm) than the motors driving them. Gear reducers (also referred to as gearboxes or speed reducers) are used between the motors and the driven machinery to reduce the rpm. The gear reducer lowers the speed while amplifying the torque (turning force).',
    paras: [
      'Speed and torque trade against each other; reduce the speed to one-tenth and the torque at the output increases by a factor of ten, less losses. This torque multiplication is also one of the factors considered in the selection of a gear reducer for a particular application.',
      'Gear reducers employ a system of interconnecting gears of different sizes to achieve the reduction in rpm and increase in torque. A small gear (pinion) driving a larger gear turns it more slowly and with more torque. Higher ratios are reached by stacking stages, and the ratios of the stages multiply: a 3:1 stage followed by a 4:1 stage gives 12:1. Typically, gear reducers have an input and output shaft. The motor couples to the input shaft while the component being driven couples to the output on the gear reducer. The input shaft is usually referred to as the ‘high speed shaft.’ The output is either a solid shaft joined to the driven machine by a coupling, or a hollow bore that slips over the machine’s own shaft. The hollow-bore, shaft-mounted arrangement is widely used on belt conveyor drives, where a torque arm holds the housing against rotation. When motor and reducer are supplied as one unit, it is called a gearmotor.',
    ],
    ratioH: 'Gear Reducer Reduction Ratio',
    ratioParas: [
      'The reduction ratio is the number of turns of the input shaft needed to produce one turn of the output shaft, written input:output. A 20:1 reducer turns the output once for every 20 turns of the input, so speed falls to one-twentieth and torque rises about twenty-fold, less losses. Ratios need not be whole numbers; 12.5:1 is common.',
      'Higher ratios are often reached in stages, and the stage ratios multiply. A reducer with a 5:1 stage followed by a 4:1 stage has an overall ratio of 5 × 4 = 20:1.',
      'Quoted ratios are nominal: catalogues round them, and the exact value comes from the tooth counts. Losses do not change the speed ratio, but they reduce the torque delivered. Helical gear reducers typically run in the mid-90% efficiency range per unit. Worm gear reducers are lower, roughly 50% to 90% depending on ratio, so they multiply torque by less.',
    ],
    closing: 'The ratio is the first number to settle, but it does not select the reducer on its own. The unit must also carry the torque and power, withstand the load type and running hours (see the service factor below), stay within its thermal limit, and fit the mounting and shaft arrangement.',
    svcH: 'Gear Reducer Service Factor',
    svcParas: [
      'Service factor is a multiplier applied to the power or torque an application needs, to arrive at the rating the gear reducer must have. It allows for how hard the reducer will actually be worked: the nature of the load, the number of starts and stops per hour, and the hours of operation per day. A reducer is suitable when its rated capacity is at least the required load multiplied by the service factor. For example, a 7.5 kW load with a service factor of 1.25 calls for a reducer rated at 9.4 kW or more.',
      'The nature of the load is generally classed as uniform, moderate shock or heavy shock. Peak torque in moderate shock service is about 1.3 times normal running torque, and in heavy shock service about 2 times. Overloads occur when starting under full load, when demand exceeds the calculated load, when braking, and when shocks occur.',
      'Longer duty and more frequent starts call for a higher service factor. Too low a factor leads to premature wear or tooth and bearing failure; too high a factor pays for capacity that is not needed. Factors are published by the manufacturer, based on AGMA practice, and we confirm the right one when sizing your reducer.',
    ],
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
    ratioH: 'Relación de reducción del reductor de engranajes',
    ratioParas: [
      'La relación de reducción es el número de vueltas del eje de entrada necesarias para producir una vuelta del eje de salida, y se escribe entrada:salida. Un reductor de 20:1 da una vuelta de salida por cada 20 vueltas de entrada, de modo que la velocidad baja a una veinteava parte y el par aumenta unas veinte veces, descontando las pérdidas. Las relaciones no tienen que ser números enteros; 12,5:1 es habitual.',
      'Las relaciones altas suelen lograrse por etapas, y las relaciones de cada etapa se multiplican. Un reductor con una etapa de 5:1 seguida de otra de 4:1 tiene una relación total de 5 × 4 = 20:1.',
      'Las relaciones indicadas son nominales: los catálogos las redondean y el valor exacto surge del número de dientes. Las pérdidas no modifican la relación de velocidad, pero reducen el par entregado. Los reductores helicoidales suelen operar en un rango de rendimiento de mediados del 90 % por unidad. Los reductores de tornillo sin fin tienen menos rendimiento, aproximadamente del 50 % al 90 % según la relación, por lo que multiplican menos el par.',
    ],
    closing: 'La relación es el primer número que hay que fijar, pero por sí sola no selecciona el reductor. La unidad también debe soportar el par y la potencia, resistir el tipo de carga y las horas de funcionamiento (véase el factor de servicio más abajo), mantenerse dentro de su límite térmico y ajustarse al montaje y a la disposición de ejes.',
    svcH: 'Factor de servicio del reductor de engranajes',
    svcParas: [
      'El factor de servicio es un multiplicador que se aplica a la potencia o al par que necesita una aplicación para obtener la capacidad nominal que debe tener el reductor. Tiene en cuenta cuánto trabajará realmente el reductor: la naturaleza de la carga, el número de arranques y paradas por hora y las horas de funcionamiento al día. Un reductor es adecuado cuando su capacidad nominal es al menos la carga requerida multiplicada por el factor de servicio. Por ejemplo, una carga de 7,5 kW con un factor de servicio de 1,25 requiere un reductor de 9,4 kW o más.',
      'La naturaleza de la carga se clasifica generalmente como uniforme, con choques moderados o con choques fuertes. El par máximo en servicio con choques moderados es de alrededor de 1,3 veces el par normal de funcionamiento, y con choques fuertes de alrededor de 2 veces. Las sobrecargas se producen al arrancar a plena carga, cuando la demanda supera la carga calculada, al frenar y cuando se producen choques.',
      'Los servicios más prolongados y los arranques más frecuentes exigen un factor de servicio mayor. Un factor demasiado bajo provoca desgaste prematuro o rotura de dientes y rodamientos; uno demasiado alto paga una capacidad que no se necesita. Los factores los publica el fabricante, con base en la práctica AGMA, y confirmamos el adecuado al dimensionar su reductor.',
    ],
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
    ratioH: 'Relação de redução do redutor de engrenagens',
    ratioParas: [
      'A relação de redução é o número de voltas do eixo de entrada necessárias para produzir uma volta do eixo de saída, escrita entrada:saída. Um redutor de 20:1 dá uma volta de saída a cada 20 voltas de entrada, de modo que a velocidade cai para um vigésimo e o torque aumenta cerca de vinte vezes, descontadas as perdas. As relações não precisam ser números inteiros; 12,5:1 é comum.',
      'Relações mais altas são frequentemente obtidas em estágios, e as relações de cada estágio se multiplicam. Um redutor com um estágio de 5:1 seguido de outro de 4:1 tem relação total de 5 × 4 = 20:1.',
      'As relações informadas são nominais: os catálogos as arredondam e o valor exato vem do número de dentes. As perdas não alteram a relação de velocidade, mas reduzem o torque entregue. Os redutores helicoidais costumam operar na faixa de rendimento de meados de 90 % por unidade. Os redutores de rosca sem fim têm rendimento menor, de aproximadamente 50 % a 90 % conforme a relação, e por isso multiplicam menos o torque.',
    ],
    closing: 'A relação é o primeiro número a definir, mas sozinha não seleciona o redutor. A unidade também deve suportar o torque e a potência, resistir ao tipo de carga e às horas de operação (veja o fator de serviço abaixo), permanecer dentro do seu limite térmico e se ajustar à montagem e à disposição dos eixos.',
    svcH: 'Fator de serviço do redutor de engrenagens',
    svcParas: [
      'O fator de serviço é um multiplicador aplicado à potência ou ao torque de que uma aplicação precisa, para chegar à capacidade nominal que o redutor deve ter. Ele leva em conta o quanto o redutor será realmente exigido: a natureza da carga, o número de partidas e paradas por hora e as horas de operação por dia. Um redutor é adequado quando sua capacidade nominal é pelo menos a carga necessária multiplicada pelo fator de serviço. Por exemplo, uma carga de 7,5 kW com fator de serviço de 1,25 exige um redutor de 9,4 kW ou mais.',
      'A natureza da carga é geralmente classificada como uniforme, com choques moderados ou com choques fortes. O torque de pico em serviço com choques moderados é de cerca de 1,3 vez o torque normal de operação, e com choques fortes de cerca de 2 vezes. As sobrecargas ocorrem na partida com carga total, quando a demanda excede a carga calculada, na frenagem e quando ocorrem choques.',
      'Serviços mais longos e partidas mais frequentes exigem um fator de serviço maior. Um fator muito baixo leva a desgaste prematuro ou quebra de dentes e rolamentos; um fator muito alto paga por uma capacidade desnecessária. Os fatores são publicados pelo fabricante, com base na prática AGMA, e confirmamos o adequado ao dimensionar o seu redutor.',
    ],
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
    ratioH: 'Reductieverhouding van tandwielreductoren',
    ratioParas: [
      'De reductieverhouding is het aantal omwentelingen van de ingaande as dat nodig is voor één omwenteling van de uitgaande as, geschreven als in:uit. Een reductor van 20:1 draait de uitgaande as één keer rond per 20 omwentelingen van de ingaande as: het toerental daalt tot een twintigste en het koppel stijgt ongeveer twintigvoudig, minus verliezen. Verhoudingen hoeven geen hele getallen te zijn; 12,5:1 komt veel voor.',
      'Hogere verhoudingen worden vaak in trappen bereikt, en de verhoudingen van de trappen worden met elkaar vermenigvuldigd. Een reductor met een trap van 5:1 gevolgd door een trap van 4:1 heeft een totale verhouding van 5 × 4 = 20:1.',
      'Opgegeven verhoudingen zijn nominaal: catalogi ronden ze af en de exacte waarde volgt uit het aantal tanden. Verliezen veranderen de toerentalverhouding niet, maar verlagen wel het geleverde koppel. Reductoren met schuine vertanding halen doorgaans een rendement in de midden-90%-range per eenheid. Wormwielreductoren zitten lager, grofweg 50% tot 90% afhankelijk van de verhouding, en vermenigvuldigen het koppel dus minder.',
    ],
    closing: 'De verhouding is het eerste getal dat vastligt, maar bepaalt de reductor niet alleen. De unit moet ook het koppel en het vermogen aankunnen, bestand zijn tegen het belastingtype en de draaiuren (zie servicefactor hieronder), binnen zijn thermische grens blijven en passen bij de montage en de asuitvoering.',
    svcH: 'Servicefactor van tandwielreductoren',
    svcParas: [
      'De servicefactor is een vermenigvuldiger die wordt toegepast op het vermogen of koppel dat een toepassing nodig heeft, om te komen tot het vermogen waarvoor de reductor moet zijn gedimensioneerd. Hij houdt rekening met hoe zwaar de reductor in de praktijk wordt belast: de aard van de belasting, het aantal starts en stops per uur en de bedrijfsuren per dag. Een reductor is geschikt wanneer zijn nominale capaciteit minstens gelijk is aan de vereiste belasting maal de servicefactor. Een belasting van 7,5 kW met een servicefactor van 1,25 vraagt bijvoorbeeld om een reductor met een nominaal vermogen van 9,4 kW of meer.',
      'De aard van de belasting wordt doorgaans ingedeeld als gelijkmatig, matige schokbelasting of zware schokbelasting. Het piekkoppel bij matige schokbelasting is ongeveer 1,3 keer het normale bedrijfskoppel, bij zware schokbelasting ongeveer 2 keer. Overbelasting treedt op bij starten onder volle belasting, wanneer de vraag hoger is dan de berekende belasting, bij afremmen en bij schokken.',
      'Langere bedrijfsduur en vaker starten vragen om een hogere servicefactor. Een te lage factor leidt tot voortijdige slijtage of breuk van tanden en lagers; een te hoge factor betaalt voor capaciteit die niet nodig is. De factoren worden gepubliceerd door de fabrikant, op basis van AGMA-praktijk, en wij bevestigen de juiste bij het dimensioneren van uw reductor.',
    ],
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
    ratioH: 'Rapport de réduction du réducteur à engrenages',
    ratioParas: [
      'Le rapport de réduction est le nombre de tours de l’arbre d’entrée nécessaires pour faire tourner l’arbre de sortie d’un tour, écrit entrée:sortie. Un réducteur de 20:1 fait un tour en sortie pour 20 tours en entrée : la vitesse tombe au vingtième et le couple est multiplié par vingt environ, pertes déduites. Les rapports ne sont pas forcément entiers ; 12,5:1 est courant.',
      'Les rapports élevés s’obtiennent souvent par étages, et les rapports de chaque étage se multiplient. Un réducteur avec un étage de 5:1 suivi d’un étage de 4:1 a un rapport total de 5 × 4 = 20:1.',
      'Les rapports annoncés sont nominaux : les catalogues les arrondissent et la valeur exacte découle du nombre de dents. Les pertes ne modifient pas le rapport de vitesse, mais elles réduisent le couple délivré. Les réducteurs à engrenages hélicoïdaux affichent généralement un rendement de l’ordre de 95 % par unité. Les réducteurs à vis sans fin sont moins efficaces, environ 50 % à 90 % selon le rapport, et multiplient donc moins le couple.',
    ],
    closing: 'Le rapport est le premier chiffre à fixer, mais il ne suffit pas à choisir le réducteur. L’unité doit aussi supporter le couple et la puissance, résister au type de charge et aux heures de fonctionnement (voir le facteur de service ci-dessous), rester dans sa limite thermique et convenir au montage et à la disposition des arbres.',
    svcH: 'Facteur de service du réducteur à engrenages',
    svcParas: [
      'Le facteur de service est un multiplicateur appliqué à la puissance ou au couple requis par une application, pour obtenir la capacité nominale que doit avoir le réducteur. Il tient compte de la sollicitation réelle du réducteur : la nature de la charge, le nombre de démarrages et d’arrêts par heure et les heures de fonctionnement par jour. Un réducteur convient lorsque sa capacité nominale est au moins égale à la charge requise multipliée par le facteur de service. Par exemple, une charge de 7,5 kW avec un facteur de service de 1,25 exige un réducteur de 9,4 kW ou plus.',
      'La nature de la charge est généralement classée comme uniforme, à chocs modérés ou à chocs importants. Le couple de pointe en service à chocs modérés est d’environ 1,3 fois le couple normal de fonctionnement, et d’environ 2 fois en service à chocs importants. Les surcharges surviennent au démarrage à pleine charge, lorsque la demande dépasse la charge calculée, au freinage et lors de chocs.',
      'Un service plus long et des démarrages plus fréquents appellent un facteur de service plus élevé. Un facteur trop faible entraîne une usure prématurée ou la rupture des dents et des roulements ; un facteur trop élevé fait payer une capacité inutile. Les facteurs sont publiés par le fabricant, selon la pratique AGMA, et nous confirmons le bon lors du dimensionnement de votre réducteur.',
    ],
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
