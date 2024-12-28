async function fetchOrders() {
  try {
    const response = await fetch('/api/show-orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const orders = await response.json();

    // Sort orders with the most recent first
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = ''; // Clear any existing content

    orders.forEach(order => {
      const orderElement = document.createElement('div');
      orderElement.classList.add('order');

      const itemsList = order.items.map(item => 
        `<li>${item.name} (Quantity: ${item.quantity}, Price: ${item.price})</li>`
      ).join('');

      // Calculate total price
      const totalPrice = order.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      // Determine the color of the payment status
      const paymentColor = order.payment ? 'green' : 'red';

      // Determine the color of the order status
      const statusColor = order.status === 'done' ? 'green' : 'red';

      // Add the Done and Delete buttons
      orderElement.innerHTML = `
        <h3><a href="/order/${order._id}">Order ID: ${order._id}</a></h3>
        <ul>${itemsList}</ul>
        <li>Table number: ${order.table}</li>
        <li>Payment: <span style="color: ${paymentColor};">${order.payment}</span></li>
        <li>Status: <span style="color: ${statusColor};">${order.status}</span></li>
        <p><strong>Total Price:</strong> ${totalPrice}</p>
        <button class="delete-btn" data-id="${order._id}">Mark as paid</button>
        <button class="done-btn" data-id="${order._id}">Finish order</button>
      `;

      ordersContainer.appendChild(orderElement);
    });

    // Attach event listeners to Done and Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const orderId = this.getAttribute('data-id');
        try {
          const response = await fetch('/api/ordersAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: orderId })
          });

          if (response.ok) {
            alert(`Order ID ${orderId} marked successfully`);
            fetchOrders(); // Refresh the orders list after marking
          } else {
            alert('Failed to mark order');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while marking the order');
        }
      });
    });
    document.querySelectorAll('.done-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const orderId = this.getAttribute('data-id');
        try {
          const response = await fetch('/api/finishAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: orderId })
          });

          if (response.ok) {
            alert(`Order ID ${orderId} marked successfully`);
            fetchOrders(); // Refresh the orders list after marking
          } else {
            alert('Failed to mark order');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while marking the order');
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Call fetchOrders when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchOrders();
  setInterval(fetchOrders, 4000); // Auto-refresh every 4 seconds
});
