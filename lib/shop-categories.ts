export type ShopCategory = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

/** Immagini referenziali da /public; testi lasciati come da brief cliente. */
export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    title: "IN CONSERVA",
    description: "Senape dolce, crauti, farine tipiche, succhi di frutta e gurken",
    image: "/f3.jpg",
    imageAlt: "Conserve e vasetti tipici"
  },
  {
    title: "MIELE",
    description: "Miele Alper Pragas in tantissimi gusti e grammature",
    image: "/f5.jpg",
    imageAlt: "Miele artigianale"
  },
  {
    title: "STOLLEN ALTO ADIGE",
    description:
      "Stollen - Pasta dolce lievitata, particolarmente ricca di burro e frutta secca e canditi",
    image: "/FOTO_4.webp",
    imageAlt: "Stollen dolce tirolese"
  },
  {
    title: "PANE TIPICO",
    description: "Pane classico e crackers ai semi rustici e croccanti per tutti i gusti",
    image: "/f1.jpg",
    imageAlt: "Pane e crackers rustici"
  },
  {
    title: "PANE CLASSICO",
    description: "Pane: tipico, brezel, di segale, Laugen o Schüttelbrot",
    image: "/f2.jpg",
    imageAlt: "Pane tipico e brezel"
  },
  {
    title: "SUCCHI DI MELA",
    description: "Introvabili succhi di mela Kohl ottenuti dai frutti del Renon",
    image: "/f6.jpg",
    imageAlt: "Succhi di mela"
  },
  {
    title: "CONSERVE",
    description: "Le inimitabili composte di frutta Alpe Pragas in tanti gusti (bio)",
    image: "/f7.jpg",
    imageAlt: "Composte di frutta"
  },
  {
    title: "ZIMTSTERNE",
    description: "Zimtsterne o Stelle alla cannella di Natale con mandorle e cannella",
    image: "/f8.jpg",
    imageAlt: "Biscotti Zimtsterne"
  },
  {
    title: "BREZEL",
    description: "I nostri inimitabili Brezel, grandi, piccoli o grissinati",
    image: "/FOTO_2.webp",
    imageAlt: "Brezel"
  },
  {
    title: "STRUDEL",
    description: "Il nostro inimitabile strudel alle mele disponibile a peso",
    image: "/FOTO_3.webp",
    imageAlt: "Strudel alle mele"
  }
];
