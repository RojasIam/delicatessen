import type { Metadata } from "next";
import { ShopChrome } from "./shop-chrome";
import { ShopBody } from "./shop-body";

export const metadata: Metadata = {
  title: "Punto vendita | DELICATESSEN",
  description:
    "Prodotti tipici dell'Alto Adige al ristorante Delicatessen in Viale Tunisia 14, Milano. Orari: lun–sab 10:00–14:00."
};

export default function ShopPage() {
  return (
    <ShopChrome>
      <ShopBody />
    </ShopChrome>
  );
}
