/**
 * Car brands and models data for searchable dropdowns.
 * Curated list of popular brands available in India.
 */

export const CAR_BRANDS_DATA: Record<string, string[]> = {
  'Maruti Suzuki': [
    'Alto', 'Alto K10', 'S-Presso', 'Celerio', 'WagonR', 'Swift', 'Dzire',
    'Baleno', 'Ignis', 'Ciaz', 'Ertiga', 'XL6', 'Brezza', 'Grand Vitara',
    'Fronx', 'Invicto', 'Jimny', 'Eeco', 'Vitara Brezza',
    // Older/discontinued but still common on Indian roads
    '800', 'Zen', 'Zen Estilo', 'Esteem', 'SX4', 'A-Star', 'Ritz',
    'Omni', 'Gypsy', 'Versa', 'Kizashi', 'S-Cross',
  ],
  'Hyundai': [
    'i10 Grand', 'i20', 'i20 N Line', 'Aura', 'Verna', 'Venue', 'Venue N Line',
    'Creta', 'Creta N Line', 'Alcazar', 'Tucson', 'Exter', 'Ioniq 5',
    'Creta EV', 'Creta Grand',
    // Older/discontinued but still common
    'Santro', 'Santro Xing', 'i10', 'Accent', 'Getz', 'Eon', 'Xcent',
    'Elite i20', 'Verna Fluidic', 'ix25',
  ],
  'Tata': [
    'Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari',
    'Curvv', 'Curvv EV', 'Tiago EV', 'Tigor EV', 'Punch EV', 'Nexon EV',
    'Sierra EV', 'Avinya',
    // Older/discontinued but still common
    'Indica', 'Indica Vista', 'Indigo', 'Indigo eCS', 'Indigo Manza',
    'Nano', 'GenX Nano', 'Bolt', 'Zest', 'Hexa', 'Aria', 'Sumo',
    'Sumo Gold', 'Sumo Grande', 'Xenon', 'Yodha', 'Safari Storme',
    'Safari Dicor', 'Estate', 'Sierra',
  ],
  'Mahindra': [
    'KUV100', 'XUV300', 'XUV400', 'XUV700', 'Scorpio N', 'Scorpio Classic',
    'Thar', 'Thar Roxx', 'Bolero', 'Bolero Neo', 'Marazzo', 'XUV3XO', 'BE 6',
    'XUV.e8', 'XUV.e9',
    // Older/discontinued but still common
    'Xylo', 'Quanto', 'Verito', 'Verito Vibe', 'Logan', 'Scorpio S10',
    'TUV300', 'TUV300 Plus', 'NuvoSport', 'e2o', 'e2o Plus', 'e-Verito',
    'Reva', 'Armada', 'Marshal', 'Commander', 'Classic',
  ],
  'Kia': [
    'Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival', 'Syros', 'EV9',
    'EV5', 'Clavis',
  ],
  'Honda': [
    'Amaze', 'City', 'City Hybrid', 'Elevate', 'WR-V',
    // Older/discontinued but still common
    'Civic', 'CR-V', 'BR-V', 'Jazz', 'Brio', 'Accord', 'Mobilio',
  ],
  'Toyota': [
    'Glanza', 'Urban Cruiser Hyryder', 'Innova Crysta', 'Innova Hycross',
    'Fortuner', 'Fortuner Legender', 'Hilux', 'Camry', 'Vellfire',
    'Land Cruiser', 'LC300', 'Urban Cruiser Taisor', 'Rumion',
    // Older/discontinued but still common
    'Etios', 'Etios Liva', 'Etios Cross', 'Corolla', 'Corolla Altis',
    'Qualis', 'Prado',
  ],
  'MG': [
    'Hector', 'Hector Plus', 'Astor', 'ZS EV', 'Gloster', 'Comet EV',
    'Windsor EV', 'Cloud EV', 'Cyberster',
  ],
  'Volkswagen': [
    'Polo', 'Virtus', 'Taigun', 'Tiguan',
    // Older/discontinued but still common
    'Vento', 'Ameo', 'Jetta', 'Passat', 'Beetle', 'CrossPolo',
    'T-Roc',
  ],
  'Skoda': [
    'Slavia', 'Kushaq', 'Kodiaq', 'Superb', 'Octavia', 'Kylaq',
    // Older/discontinued but still common
    'Rapid', 'Fabia', 'Laura', 'Yeti',
  ],
  'BMW': [
    '2 Series Gran Coupe', '3 Series', '5 Series', '7 Series', 'X1', 'X3',
    'X5', 'X7', 'iX1', 'i4', 'i5', 'i7', 'iX', 'Z4', 'M340i', 'XM',
    'M2', 'M4', 'X3 M40i',
  ],
  'Mercedes-Benz': [
    'A-Class Limousine', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB',
    'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLS', 'EQA', 'EQB', 'EQE',
    'EQE SUV', 'EQS', 'EQS SUV', 'AMG GT', 'AMG C 63', 'AMG GLE 53',
    'Maybach S-Class', 'Maybach GLS', 'Maybach EQS', 'V-Class',
    'CLA',
  ],
  'Audi': [
    'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'e-tron GT',
    'RS5', 'RS Q8', 'Q8 e-tron', 'Q8 Sportback e-tron', 'S5 Sportback',
    // Older/discontinued but still common
    'A3', 'A5', 'Q2',
  ],
  'Renault': [
    'Kwid', 'Triber', 'Kiger',
    // Older/discontinued but still common
    'Duster', 'Captur', 'Lodgy', 'Scala', 'Pulse', 'Fluence', 'Koleos',
  ],
  'Nissan': [
    'Magnite', 'X-Trail',
    // Older/discontinued but still common
    'Kicks', 'Terrano', 'Sunny', 'Micra', 'Micra Active', 'Evalia',
    'GT-R',
  ],
  'Jeep': [
    'Compass', 'Meridian', 'Grand Cherokee', 'Wrangler',
  ],
  'Citroën': [
    'C3', 'C3 Aircross', 'eC3', 'C5 Aircross', 'Basalt',
  ],
  'Lexus': [
    'ES', 'NX', 'RX', 'LX', 'LS', 'LC', 'LM', 'GX', 'IS',
  ],
  'Volvo': [
    'XC40', 'XC40 Recharge', 'XC60', 'XC90', 'S90', 'C40 Recharge',
  ],
  'Porsche': [
    'Macan', 'Macan Electric', 'Cayenne', 'Taycan', '911', 'Panamera',
    'Cayenne Coupe',
  ],
  'Jaguar': [
    'F-Pace', 'I-Pace', 'XF',
    // Older/discontinued but still common
    'XE', 'XJ', 'F-Type',
  ],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Range Rover Evoque',
    'Range Rover Velar', 'Range Rover Sport', 'Range Rover',
    'Freelander 2',
  ],
  'Mini': [
    'Cooper', 'Cooper S', 'Countryman', 'Countryman Electric', 'Aceman',
    'John Cooper Works',
  ],
  'BYD': [
    'Atto 3', 'Seal', 'e6', 'Seal U',
  ],
  'Ford': [
    'EcoSport', 'Endeavour', 'Figo',
    // Older/discontinued but still common
    'Aspire', 'Freestyle', 'Ikon', 'Fiesta', 'Fusion', 'Classic',
    'Mondeo',
  ],
  // ── Additional Indian & India-market brands ──
  'Force Motors': [
    'Gurkha', 'Gurkha 5-door', 'Trax', 'Trax Cruiser', 'Trax Toofan',
    'Traveller', 'Urbania', 'Force One',
  ],
  'Isuzu': [
    'D-Max V-Cross', 'D-Max Hi-Lander', 'D-Max Regular Cab', 'MU-X', 'S-CAB Z',
  ],
  'Hindustan Motors': [
    'Ambassador', 'Contessa',
  ],
  'Premier': [
    'Padmini', 'Rio', 'Stag',
  ],
  'Fiat': [
    'Punto', 'Punto Evo', 'Linea', 'Linea Classic', 'Avventura',
    'Abarth Punto', 'Abarth Avventura', 'Palio', 'Palio Stile',
    'Uno', 'Petra', 'Siena',
  ],
  'Chevrolet': [
    'Beat', 'Spark', 'Sail', 'Cruze', 'Enjoy', 'Tavera', 'Aveo',
    'Aveo U-VA', 'Captiva', 'Optra', 'Trailblazer', 'Forester',
  ],
  'Datsun': [
    'GO', 'GO Plus', 'redi-GO',
  ],

  'Pravaig': [
    'Defy',
  ],
  'PMV Electric': [
    'EaS-E',
  ],
  'Genesis': [
    'GV60', 'GV70', 'GV80', 'G80', 'G70',
  ],
  'Maserati': [
    'Ghibli', 'Levante', 'Quattroporte', 'MC20', 'Grecale', 'GranTurismo',
  ],
  'Lamborghini': [
    'Urus', 'Urus SE', 'Huracán', 'Revuelto',
  ],
  'Ferrari': [
    'Roma', 'Portofino M', 'F8 Tributo', 'SF90 Stradale', '296 GTB',
    '812 Competizione', 'Purosangue',
  ],
  'Bentley': [
    'Continental GT', 'Flying Spur', 'Bentayga',
  ],
  'Rolls-Royce': [
    'Ghost', 'Phantom', 'Cullinan', 'Spectre', 'Wraith', 'Dawn',
  ],
  'Aston Martin': [
    'Vantage', 'DB12', 'DBX', 'DBX707', 'DBS',
  ],
  'McLaren': [
    'GT', '720S', '765LT', 'Artura',
  ],
};

/** Sorted list of all brand names */
export const CAR_BRANDS: string[] = Object.keys(CAR_BRANDS_DATA).sort();

/** Get models for a given brand, returns empty array if brand not found */
export const getModelsForBrand = (brand: string): string[] => {
  return CAR_BRANDS_DATA[brand] || [];
};
