// RECUPERA OS INGRESSOS SELECIONADOS E LISTA-OS NA TELA DE CONFIRMAÇÃO

document.addEventListener("DOMContentLoaded", function () {
    const ticketDetailsContainer = document.getElementById("ticket-details");
    const totalPriceElement = document.getElementById("total-price");

    const selectedTickets = JSON.parse(localStorage.getItem("selectedTickets")) || [];
    const totalPrice = localStorage.getItem("totalPrice") || "0.00";

    ticketDetailsContainer.innerHTML = `<div class="event-title">Guts World Tour - Curitiba (26/03/25)</div>`;

    selectedTickets.forEach(ticket => {
        const ticketElement = document.createElement("div");
        ticketElement.classList.add("ticket-info");
        ticketElement.innerHTML = `
            <span><strong>${ticket.quantity}x</strong> ${ticket.sector} - ${ticket.ticketType}</span>
            <span>R$ ${ticket.subtotal.toFixed(2).replace(".", ",")}</span>
        `;
        ticketDetailsContainer.appendChild(ticketElement);
    });

    totalPriceElement.textContent = `R$ ${parseFloat(totalPrice).toFixed(2).replace(".", ",")}`;
});