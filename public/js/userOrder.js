document.addEventListener("DOMContentLoaded", () => {
  const cart = [];
  const cartContainer = document.getElementById("cart-container");
  const cartItemsList = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const menuContainer = document.getElementById("menu-container");

  // Add these variables for the category sections
  const drinksContainer = document.getElementById("drinks-container");
  const foodContainer = document.getElementById("food-container");
  const dessertContainer = document.getElementById("dessert-container");
  const otherContainer = document.getElementById("other-container");

  async function fetchMenu() {
    try {
      const response = await fetch("/api/getMenu");
      if (!response.ok) throw new Error("Network response was not ok");
      const menuItems = await response.json();
      renderMenu(menuItems);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  }

  function renderMenu(menuItems) {
    drinksContainer.innerHTML = "";
    foodContainer.innerHTML = "";
    dessertContainer.innerHTML = "";
    otherContainer.innerHTML = "";

    menuItems.forEach((item) => {
      const menuDiv = document.createElement("div");
      menuDiv.className = "menu-item";
      menuDiv.innerHTML = `
            <img src="${item.img || "./img/recipe-placeholder.jpg"}" alt="${item.stockname}">
            <div class="info">
                <h3>${item.stockname}</h3>
                <p>${item.type}</p>
                <p>VND${item.price.toFixed(2)}</p>
            </div>
            <button data-id="${item.id}" data-name="${item.stockname}" data-price="${item.price}">Add to Cart</button>
          `;
      
      // Filter items by category and append to the respective container
      switch (item.type.toLowerCase()) {
        case "drinks":
          drinksContainer.appendChild(menuDiv);
          break;
        case "food":
          foodContainer.appendChild(menuDiv);
          break;
        case "dessert":
          dessertContainer.appendChild(menuDiv);
          break;
        default:
          otherContainer.appendChild(menuDiv);
          break;
      }
    });
  }

  function renderCart() {
    cartItemsList.innerHTML = "";
    let totalPrice = 0;

    cart.forEach((item) => {
      const cartItem = document.createElement("li");
      cartItem.textContent = `${item.name} - VND${item.price.toFixed(2)} x ${item.quantity}`;
      cartItemsList.appendChild(cartItem);

      // Accumulate total price
      totalPrice += item.price * item.quantity;
    });

    // Display total price
    document.getElementById("total-price").textContent = totalPrice.toFixed(2);

    cartContainer.classList.toggle("hidden", cart.length === 0);
    cartCount.textContent = cart.length;
  }

  function addToCart(event) {
    if (event.target.tagName === "BUTTON") {
      const id = event.target.getAttribute("data-id");
      const name = event.target.getAttribute("data-name");
      const price = parseFloat(event.target.getAttribute("data-price"));

      console.log(`Adding to cart - ID: ${id}, Name: ${name}, Price: ${price}`);

      if (!name) {
        console.error("Name is undefined for item with ID:", id);
        return;
      }

      const existingItem = cart.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      renderCart();
    }
  }

  async function checkout() {
    try {
      const tableNumber = parseInt(document.querySelector("input[type='number']").value, 10);
      if (isNaN(tableNumber)) {
        alert("Please enter a valid table number.");
        return;
      }

      // Calculate total price
      const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
      const payment = false;
      const status = 'processing';
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart, tableN: tableNumber, payment: payment, status: status }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Order placed successfully!");
        cart.length = 0; // Clear cart
        renderCart();
      } else {
        alert(`Error placing order: ${result.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error placing order. Please try again.");
    }
  }

  // Attach event listeners to each category container
  drinksContainer.addEventListener("click", addToCart);
  foodContainer.addEventListener("click", addToCart);
  dessertContainer.addEventListener("click", addToCart);
  otherContainer.addEventListener("click", addToCart);

  document.getElementById("checkout-button").addEventListener("click", checkout);

  fetchMenu();
});
