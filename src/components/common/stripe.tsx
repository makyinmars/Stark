import Head from "next/head";

const ProductDisplay = () => {
  return (
    <div>
      <Head>
        <title>Upgrade</title>
      </Head>
      <section>
        <div className="product">
          <div className="description">
            <h3>Starter plan</h3>
            <h5>$20.00 / month</h5>
          </div>
        </div>
        <form action="/api/create-checkout-session" method="POST">
          {/* Add a hidden field with the lookup_key of your Price */}
          <input type="hidden" name="lookup_key" value="stark-premiun" />
          <button id="checkout-and-portal-button" type="submit">
            Checkout
          </button>
        </form>
      </section>
    </div>
  );
};

export default ProductDisplay;
