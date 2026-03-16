export type ProductCategory = 'bague' | 'collier' | 'bracelet' | 'boucles' | 'montre' | 'all';

export interface ColorVariant {
  id: string;
  name: string;
  hexColor: string;
  label: string;
}

export interface ProductReview {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  location: string;
  photoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  collection: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  material: string;
  weight: string;
  sizes?: number[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  stock?: number;
  colorVariants?: ColorVariant[];
  reviewsList?: ProductReview[];
}

export const IMAGES = {
  ring1: "https://images.unsplash.com/photo-1758297679736-2e6ff92d2021?w=800&q=80",
  ring2: "https://images.unsplash.com/photo-1709150485687-b5ed84fd776c?w=800&q=80",
  ring3: "https://images.unsplash.com/photo-1763256614634-7feb3ff79ff3?w=800&q=80",
  necklace1: "https://images.unsplash.com/photo-1733761013921-89d19f4a2194?w=800&q=80",
  necklace2: "https://images.unsplash.com/photo-1680474690806-4ca5fec44090?w=800&q=80",
  necklace3: "https://images.unsplash.com/photo-1708220084921-07bdb7b47b25?w=800&q=80",
  bracelet: "https://images.unsplash.com/photo-1771012265743-199b156327cb?w=800&q=80",
  earrings: "https://images.unsplash.com/photo-1771173652661-8245a9d94095?w=800&q=80",
  watch: "https://images.unsplash.com/photo-1621341103818-01dada8c6ef8?w=800&q=80",
  hero: "https://images.unsplash.com/photo-1560233144-905d47165782?w=800&q=80",
  profile: "https://images.unsplash.com/photo-1685380809901-4abf282b88c0?w=400&q=80",
  packaging: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
  certificate: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
};

const COLOR_VARIANTS_OR: ColorVariant[] = [
  { id: 'yellow', name: 'or-jaune', hexColor: '#C9A227', label: 'Or Jaune 18K' },
  { id: 'white', name: 'or-blanc', hexColor: '#E8E8E0', label: 'Or Blanc 18K' },
  { id: 'rose', name: 'or-rose', hexColor: '#E8A090', label: 'Or Rose 18K' },
];

const REVIEWS_RING1: ProductReview[] = [
  { id: 'r1-1', author: 'Aminata Koné', initials: 'AK', rating: 5, date: '12 Fév 2026', text: "Absolument magnifique ! La bague a dépassé toutes mes attentes. La finition est parfaite, l'or est d'une pureté exceptionnelle. Je la porte tous les jours et elle ne se ternit pas. Service impeccable.", verified: true, location: 'Cocody, Abidjan' },
  { id: 'r1-2', author: 'Marie-Claire Assi', initials: 'MA', rating: 5, date: '28 Jan 2026', text: "Un bijou de rêve. J'ai offert cette bague à ma femme pour son anniversaire et elle était aux larmes. La qualité de l'or 18K est indiscutable. Livraison en 24h comme promis.", verified: true, location: 'Plateau, Abidjan' },
  { id: 'r1-3', author: 'Fatou Diallo', initials: 'FD', rating: 4, date: '15 Jan 2026', text: "Très belle bague, élégante et raffinée. L'emballage est luxueux, parfait pour un cadeau. Je retire une étoile car ma taille 54 était en rupture et j'ai dû attendre 3 jours.", verified: true, location: 'Yopougon, Abidjan' },
  { id: 'r1-4', author: 'Koffi Brou', initials: 'KB', rating: 5, date: '3 Jan 2026', text: "Maison Marnoa, c'est la référence en Côte d'Ivoire. Cette bague est une œuvre d'art. Les diamants brillent comme jamais.", verified: false, location: 'Marcory, Abidjan' },
];

const REVIEWS_NECKLACE1: ProductReview[] = [
  { id: 'n1-1', author: 'Bintou Sangaré', initials: 'BS', rating: 5, date: '20 Fév 2026', text: "Ce collier est sublime. L'or blanc est d'une pureté exceptionnelle et le pendentif scintille à la lumière. Je le porte avec tout et il sublime chaque tenue.", verified: true, location: 'Cocody, Abidjan' },
  { id: 'n1-2', author: 'Yah Touré', initials: 'YT', rating: 5, date: '5 Fév 2026', text: "Bestseller à juste titre ! La chaîne est fine mais solide, le diamant est parfaitement serti. J'en ai offert un à ma fille pour son bac et elle ne l'enlève plus.", verified: true, location: 'Treichville, Abidjan' },
  { id: 'n1-3', author: 'Adjoua Koffi', initials: 'AK', rating: 5, date: '18 Jan 2026', text: "Livraison rapide, emballage cadeau parfait. Le collier est encore plus beau en vrai qu'en photo.", verified: true, location: 'Riviéra, Abidjan' },
];

const REVIEWS_ALLIANCE: ProductReview[] = [
  { id: 'a1-1', author: 'Jean-Paul Ndri', initials: 'JN', rating: 5, date: '14 Fév 2026', text: "Nous avons choisi Maison Marnoa pour nos alliances de mariage. Résultat parfait ! La qualité de l'or, la finition, le service personnalisé... tout était à la hauteur du grand jour.", verified: true, location: 'Abidjan' },
  { id: 'a1-2', author: 'Christelle Akissi', initials: 'CA', rating: 5, date: '1 Fév 2026', text: "Une alliance digne de ce nom. Symbole parfait pour l'éternité. La finition polie miroir est époustouflante, on peut se voir dedans.", verified: true, location: 'Cocody, Abidjan' },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Bague Lumière d'Assinie",
    collection: "COLLECTION ROYALE",
    category: "bague",
    price: 450000,
    image: IMAGES.ring1,
    images: [IMAGES.ring1, IMAGES.ring2, IMAGES.ring3],
    description: "Une bague en or massif 18 carats d'une élégance absolue. Sertie de 12 diamants brillants soigneusement sélectionnés, elle capte chaque rayon de lumière avec une grâce incomparable.",
    material: "Or Jaune 18K",
    weight: "7.2 Grammes",
    sizes: [50, 52, 54, 56, 58],
    rating: 4.8,
    reviews: 32,
    isNew: true,
    isFeatured: true,
    stock: 4,
    colorVariants: COLOR_VARIANTS_OR,
    reviewsList: REVIEWS_RING1,
  },
  {
    id: "2",
    name: "Collier Étoile d'Abidjan",
    collection: "COLLECTION PRESTIGE",
    category: "collier",
    price: 280000,
    image: IMAGES.necklace1,
    images: [IMAGES.necklace1, IMAGES.necklace2],
    description: "Un collier délicat d'une finesse rare. Une chaîne en or 18 carats sertie d'un diamant solitaire pour sublimer chaque décolleté avec une élégance intemporelle.",
    material: "Or Blanc 18K",
    weight: "5.8 Grammes",
    rating: 4.9,
    reviews: 47,
    isBestseller: true,
    isFeatured: true,
    stock: 8,
    colorVariants: COLOR_VARIANTS_OR,
    reviewsList: REVIEWS_NECKLACE1,
  },
  {
    id: "3",
    name: "Bracelet Or Royal",
    collection: "COLLECTION IVOIRE",
    category: "bracelet",
    price: 195000,
    originalPrice: 240000,
    image: IMAGES.bracelet,
    images: [IMAGES.bracelet],
    description: "Symbole de raffinement absolu, ce bracelet jonc en or 18 carats allie une silhouette pure à une finition haute joaillerie. Une pièce intemporelle qui s'adapte à tous les styles.",
    material: "Or Jaune 18K",
    weight: "12.5 Grammes",
    rating: 4.6,
    reviews: 21,
    isBestseller: true,
    stock: 6,
    colorVariants: COLOR_VARIANTS_OR,
  },
  {
    id: "4",
    name: "Boucles d'Ivoire",
    collection: "COLLECTION PRESTIGE",
    category: "boucles",
    price: 275000,
    image: IMAGES.earrings,
    images: [IMAGES.earrings],
    description: "Pendants en or 18 carats ornés de perles nacrées d'exception provenant des mers du Sud. Ces boucles d'oreilles allient sophistication et douceur pour un rendu lumineux et précieux.",
    material: "Or Jaune 18K",
    weight: "4.2 Grammes",
    rating: 4.7,
    reviews: 18,
    isNew: true,
    stock: 10,
  },
  {
    id: "5",
    name: "Montre Lagune Edition",
    collection: "HAUTE HORLOGERIE",
    category: "montre",
    price: 2500000,
    image: IMAGES.watch,
    images: [IMAGES.watch],
    description: "Une pièce d'exception inspirée de la lagune Ébrié. Boîtier en or 18 carats, bracelet cuir crocodile et cadran nacré. Mouvement automatique Swiss Made, étanche à 50m.",
    material: "Or Jaune 18K",
    weight: "85 Grammes",
    rating: 5.0,
    reviews: 8,
    isNew: true,
    isFeatured: true,
    stock: 2,
  },
  {
    id: "6",
    name: "Alliance Prestige Or Jaune",
    collection: "COLLECTION MARIAGE",
    category: "bague",
    price: 1200000,
    image: IMAGES.ring2,
    images: [IMAGES.ring2, IMAGES.ring1],
    description: "Alliance en or massif 18 carats, symbole de l'union éternelle. Sa forme épurée et sa finition polie miroir en font une pièce intemporelle pour les grands moments de vie.",
    material: "Or Jaune 18K",
    weight: "9.8 Grammes",
    sizes: [50, 52, 54, 56, 58, 60],
    rating: 4.9,
    reviews: 64,
    isBestseller: true,
    isFeatured: true,
    stock: 5,
    colorVariants: COLOR_VARIANTS_OR,
    reviewsList: REVIEWS_ALLIANCE,
  },
  {
    id: "7",
    name: "Jonc Royal Ébrié",
    collection: "COLLECTION IVOIRE",
    category: "bracelet",
    price: 320000,
    image: IMAGES.bracelet,
    images: [IMAGES.bracelet],
    description: "Un jonc massif en or 18 carats d'une présence remarquable. Sa section ronde et sa finition brossée mate lui confèrent un caractère affirmé, pour une allure bold et contemporaine.",
    material: "Or Jaune 18K",
    weight: "18.3 Grammes",
    rating: 4.8,
    reviews: 15,
    stock: 7,
    colorVariants: COLOR_VARIANTS_OR,
  },
  {
    id: "8",
    name: "Collier Émeraude du Plateau",
    collection: "COLLECTION ROYALE",
    category: "collier",
    price: 890000,
    image: IMAGES.necklace3,
    images: [IMAGES.necklace3, IMAGES.necklace2],
    description: "Pendentif exceptionnel serti d'une émeraude de Colombie 2.3 carats, monté sur chaîne veneziana en or 18 carats. La pierre verte symbolise l'espérance et la prospérité.",
    material: "Or Jaune 18K + Émeraude",
    weight: "6.5 Grammes",
    rating: 4.9,
    reviews: 12,
    isNew: true,
    stock: 3,
  },
  {
    id: "9",
    name: "Bague Solitaire Diamant",
    collection: "COLLECTION PRESTIGE",
    category: "bague",
    price: 750000,
    image: IMAGES.ring3,
    images: [IMAGES.ring3, IMAGES.ring1],
    description: "Solitaire classique en or blanc 18 carats serti d'un diamant taille brillant de 0.5 carat, certifié GIA. L'alliance parfaite entre tradition et modernité.",
    material: "Or Blanc 18K",
    weight: "5.1 Grammes",
    sizes: [50, 52, 54, 56, 58],
    rating: 4.7,
    reviews: 29,
    isBestseller: true,
    stock: 9,
    colorVariants: COLOR_VARIANTS_OR,
  },
  {
    id: "10",
    name: "Boucles Royales Baoulé",
    collection: "COLLECTION IVOIRE",
    category: "boucles",
    price: 185000,
    image: IMAGES.earrings,
    images: [IMAGES.earrings],
    description: "Ces créoles en or 18 carats aux motifs géométriques gravés avec précision offrent une présence visuelle forte. Un design audacieux pour une femme qui assume son style.",
    material: "Or Jaune 18K",
    weight: "6.8 Grammes",
    rating: 4.5,
    reviews: 34,
    stock: 12,
  },
  {
    id: "11",
    name: "Collier Chaîne Figaro",
    collection: "COLLECTION ESSENTIELLE",
    category: "collier",
    price: 165000,
    image: IMAGES.necklace2,
    images: [IMAGES.necklace2, IMAGES.necklace1],
    description: "Chaîne Figaro en or jaune 18 carats, longueur 45cm avec fermoir mousqueton. Un classique indémodable de la joaillerie fine.",
    material: "Or Jaune 18K",
    weight: "8.2 Grammes",
    rating: 4.6,
    reviews: 52,
    isBestseller: true,
    stock: 14,
  },
  {
    id: "12",
    name: "Bague Pavé Diamants",
    collection: "COLLECTION ROYALE",
    category: "bague",
    price: 580000,
    image: IMAGES.ring1,
    images: [IMAGES.ring1, IMAGES.ring3],
    description: "Anneau en or rose 18 carats entièrement pavé de 24 diamants brillants. Un éclat permanent qui magnifie chaque geste.",
    material: "Or Rose 18K",
    weight: "6.3 Grammes",
    sizes: [50, 52, 54, 56, 58],
    rating: 4.8,
    reviews: 41,
    isFeatured: true,
    stock: 6,
    colorVariants: COLOR_VARIANTS_OR,
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export const categories: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'bague', label: 'Bagues' },
  { id: 'collier', label: 'Colliers' },
  { id: 'bracelet', label: 'Bracelets' },
  { id: 'boucles', label: 'Boucles' },
  { id: 'montre', label: 'Montres' },
];
