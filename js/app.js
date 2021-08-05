// variables
let nav = document.querySelector("nav");
let container = document.querySelector(".container");
// cart
let cartDOM = document.querySelector(".cart");
let cartBtn = document.querySelector(".cart-btn");
let closeCart = document.querySelector(".close-cart");
let cartContent = document.querySelector(".cart-content");
let cartTotal = document.querySelector(".cart-total");
let cartItemCount = document.querySelector(".cart-item-count");
let clearCart = document.querySelector(".clear-cart");
// products
let productsDOM = document.querySelector(".products-center");
let filterContainer = document.querySelector(".filter-container");

let cart = [];
let buttonsDOM = [];

class Products {
  // GET PRODUCTS
  async getProducts() {
    try {
      let result = await fetch("./data/db.json");
      let data = await result.json();
      let items = data.items;
      return items;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  // SHOW PRODUCTS
  showProducts(products) {
    // ADDING PRODUCTS TO THE DOM
    let phones = products
      .map((product) => {
        return `
        <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src='${product.image}'
              alt="xiaomi-poco-f3"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end of single product -->
      `;
      })
      .join("");
    productsDOM.innerHTML = phones;
  }
  // filter products
  filterButtons() {
    let products = JSON.parse(localStorage.getItem("products"));
    const brands = products.reduce(
      (values, item) => {
        if (!values.includes(item.brand)) {
          values.push(item.brand);
        }
        return values;
      },
      ["all"]
    );

    const brandBtns = brands
      .map((brand) => {
        return `<button class="filter-btn" type="button" data-id="${brand}">${brand}</button>`;
      })
      .join("");
    filterContainer.innerHTML = brandBtns;
    const filterBtns = filterContainer.querySelectorAll(".filter-btn");

    // filter button for each item
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const brand = e.target.dataset.id;
        filterBtns.forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");
        const phoneBrand = products.filter((item) => item.brand === brand);
        if (brand === "all") {
          this.showProducts(products);
          this.addToCart();
        } else {
          this.showProducts(phoneBrand);
          this.addToCart();
        }
      });
    });
  }

  // NAVIGATION SHADOW
  navShadow() {
    window.addEventListener("scroll", () => {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    });
  }

  showCart() {
    cartDOM.classList.add("show-cart");
  }

  hideCart() {
    cartDOM.classList.remove("show-cart");
  }

  addCartItem(item) {
    let html = `
      <!-- cart item -->
      <div class="cart-item">
        <img src=${item.image} alt='product' />
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id="${item.id}">remove</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id="${item.id}"></i>
          <p class=${item.amount}>1</p>
          <i class="fas fa-chevron-down" data-id="${item.id}"></i>
        </div>
      </div>
      <!-- end of cart item -->
    `;
    cartContent.innerHTML += html;
  }

  addToCart() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
        button.classList.add("disabled");
      }
      button.addEventListener("click", (e) => {
        button.innerText = "In Cart";
        e.target.disabled = true;
        e.target.classList.add("disabled");
        // get the item from the Storage
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add item to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // add the cartItem
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let total = 0;
    let itemCountTotal = 0;
    cart.map((item) => {
      total += item.price * item.amount;
      itemCountTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(total.toFixed(2));
    cartItemCount.innerText = itemCountTotal;
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCart.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.classList.remove("disabled");
    button.innerHTML = '<i class="fas fa-shopping-cart"></i>add to cart';
    if (cartContent.children.length <= 0) {
      this.hideCart();
    }
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }

  cartLogic() {
    // clear cart
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });

    // cart functionality
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let products = new Products();
  let ui = new UI();
  // cart functions
  ui.setupApp();
  // navigation shadow
  ui.navShadow();
  products
    .getProducts()
    .then((items) => {
      ui.showProducts(items);
      ui.filterButtons();
      Storage.saveProducts(items);
    })
    .then(() => {
      ui.addToCart();
      ui.cartLogic();
    });
});
