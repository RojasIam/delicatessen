import { SHOP_CATEGORIES } from "@/lib/shop-categories";



export function ShopBody() {

  return (

    <main id="shop" className="shop-page">

      <section className="shop-catalog" aria-labelledby="shop-intro-heading">

        <div className="container shop-catalog-inner">

          <h1 id="shop-intro-heading" className="visually-hidden">

            Punto vendita Delicatessen

          </h1>

          <div className="shop-intro-inner">

            <p className="shop-intro-line">

              Da oggi puoi trovare e comprare tantissimi prodotti tipici dell&apos;Alto Adige nel nostro nuovo punto

              vendita

            </p>

            <p className="shop-intro-line">

              all&apos;interno del ristorante <strong>Delicatessen</strong> in Viale Tunisia 14

            </p>

            <p className="shop-intro-hours">

              <strong>Orari: dal Lunedì al Sabato dalle 10:00 alle 14:00</strong>

            </p>

          </div>



          <ul className="shop-grid" aria-label="Prodotti in negozio">

            {SHOP_CATEGORIES.map((cat) => (

              <li key={cat.title} className="shop-card">

                <article>

                  <div className="shop-card-visual">

                    <img src={cat.image} alt={cat.imageAlt} loading="lazy" />

                  </div>

                  <p className="shop-card-desc">
                    <strong className="shop-card-desc-title">{cat.title}</strong>
                    <span className="shop-card-desc-detail">{cat.description}</span>
                  </p>

                </article>

              </li>

            ))}

          </ul>



          <div className="shop-footnote-inner shop-catalog-footnote">

            <p>

              E molto altro! Come Sacher, Linzer, tisane, succhi di frutta Plose, affettati al peso come speck,

              prosciutto in crosta, bresaola, carne salada

            </p>

            <p className="shop-footnote-highlight">

              ...e inoltre la più grande selezione di <strong>Vini dell&apos;alto Adige</strong>

            </p>

            <p className="shop-footnote-contact">Viale Tunisia 14, Milano Tel 0229529555</p>

          </div>

        </div>

      </section>

    </main>

  );

}

