// CARREGAR DADOS DOS COOKIES

document.addEventListener('DOMContentLoaded', () => {
    const savedTickets = getEventCookie('selectedTickets');
    const savedTotal = getEventCookie('totalPrice');

    if (savedTickets) {
        const parsedTickets = JSON.parse(savedTickets);
        parsedTickets.forEach(ticket => {
            if (!selectedTickets[ticket.sector]) {
                selectedTickets[ticket.sector] = {};
            }
            selectedTickets[ticket.sector][ticket.ticketType] = ticket.quantity;
        });
    }

    if (savedTotal) {
        document.getElementById('total-price').textContent = `Total: R$ ${parseFloat(savedTotal).toFixed(2).replace('.', ',')}`;
    }
});

// SETORES E VALORES DISPONÍVEIS PARA O EVENTO

let selectedTickets = {};  
let currentSector = "";

// FUNÇÃO PARA EXIBIR OS TIPOS DE INGRESSOS DO SETOR SELECIONADO

function showTickets(element) {
    const sector = element.querySelector('strong').textContent;
    currentSector = sector;
    document.getElementById('selected-sector').textContent = sector;

    if (!selectedTickets[sector]) {
        selectedTickets[sector] = {};
    }

    const prices = sectorPrices[sector];
    const ticketListContainer = document.getElementById('ticket-items');
    ticketListContainer.innerHTML = "";

    Object.entries(prices).forEach(([category, ticket]) => {
        const price = ticket.value;
        const totalAmount = ticket.totalAmount;
        const soldAmount = ticket.soldAmount;
        const available = totalAmount - soldAmount;
    
        const ticketItem = document.createElement('li');
        ticketItem.classList.add('list-group-item');
    
        ticketItem.innerHTML = `
            <div class="info">
                <strong>${category}</strong>
                <span class="price">R$ ${price.toFixed(2).replace('.', ',')}</span>
                <span class="text-muted small">(${available} disponíveis)</span>
            </div>
            <div class="quantity-selector">
                <button class="btn btn-minus" onclick="changeQuantity(this, -1)">-</button>
                <span class="quantity-display" 
                      data-price="${price}" 
                      data-max="${available}">0</span>
                <button class="btn btn-plus" onclick="changeQuantity(this, 1)">+</button>
            </div>
        `;

        if (available <= 0) {
            ticketItem.classList.add('disabled');
            ticketItem.querySelector('.btn-plus').disabled = true;
            ticketItem.querySelector('.text-muted').textContent = '(ESGOTADO)';
            ticketItem.querySelector('.text-muted').classList.add('sold-out');
        }
    
        ticketListContainer.appendChild(ticketItem);
    });

    restoreSelection(sector);

    document.getElementById('sector-list').classList.add('d-none');
    document.getElementById('ticket-list').classList.remove('d-none');
}

// FUNÇÃO PARA SALVAR A SELEÇÃO DO SETOR ATUAL

function saveCurrentSelection() {
    if (!currentSector) return;

    let sectorSelection = {}; 

    document.querySelectorAll('.quantity-display').forEach(display => {
        const quantity = parseInt(display.textContent, 10);
        const ticketType = display.parentElement.parentElement.querySelector('.info strong').textContent;

        if (quantity > 0) {
            sectorSelection[ticketType] = quantity;
        }
    });

    selectedTickets[currentSector] = sectorSelection;
}

// FUNÇÃO PARA RESTAURAR A SELEÇÃO ANTERIOR DO SETOR ATUAL

function restoreSelection(sector) {
    const selections = selectedTickets[sector] || {};

    document.querySelectorAll('.quantity-display').forEach(display => {
        const ticketType = display.parentElement.parentElement.querySelector('.info strong').textContent;
        display.textContent = selections[ticketType] || 0;
    });

    updateTotal();
}

// FUNÇÃO PARA VOLTAR À SELEÇÃO DE SETORES

function goBack() {
    saveCurrentSelection();
    document.getElementById('sector-list').classList.remove('d-none');
    document.getElementById('ticket-list').classList.add('d-none');

    updateTotal();
}

// FUNÇÃO PARA ALTERAR A QUANTIDADE DE INGRESSOS

function changeQuantity(button, delta) {
    const quantityDisplay = button.parentElement.querySelector('.quantity-display');
    let currentQuantity = parseInt(quantityDisplay.textContent, 10);
    const maxAvailable = parseInt(quantityDisplay.dataset.max, 10);

    if (delta > 0 && currentQuantity + delta > maxAvailable) return;

    if (currentQuantity + delta < 0) return;

    const totalTickets = getTotalTickets() + delta;

    if (totalTickets > 4) return;

    quantityDisplay.textContent = currentQuantity + delta;

    saveCurrentSelection();
    updateTotal();
}

// FUNÇÃO PARA OBTER O TOTAL DE INGRESSOS SELECIONADOS

function getTotalTickets() {
    let total = 0;

    Object.values(selectedTickets).forEach(sector => {
        Object.values(sector).forEach(quantity => {
            total += quantity;
        });
    });

    return total;
}

// FUNÇÃO PARA ATUALIZAR O TOTAL E O BOTÃO DE CONTINUAR

function updateTotal() {
    let total = 0;
    let hasSelection = false;
    let selectedSummary = [];

    Object.keys(selectedTickets).forEach(sector => {
        Object.keys(selectedTickets[sector]).forEach(ticketType => {
            const quantity = selectedTickets[sector][ticketType];
            const price = sectorPrices[sector][ticketType].value;
            const subtotal = quantity * price;
            total += subtotal;
            hasSelection = true;

            if (quantity > 0) {
                selectedSummary.push({
                    sector,
                    ticketType,
                    quantity,
                    subtotal
                });
            }
        });
    });

    document.getElementById('selectedTicketsInput').value = JSON.stringify(selectedSummary);
    document.getElementById('totalPriceInput').value = total.toFixed(2).replace('.', ',');

    const checkoutSection = document.getElementById('checkout-section');
    const totalPriceElement = document.getElementById('total-price');

    if (hasSelection) {
        totalPriceElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
        checkoutSection.classList.remove('d-none');
    } else {
        checkoutSection.classList.add('d-none');
    }
}

function saveSelectionToStorage() {
    localStorage.setItem('selectedTickets', JSON.stringify(selectedTickets));
}

// FUNÇÃO PARA SALVAR OS COOKIES

function getEventCookie(name) {
    return getCookie(`${name}_${eventLink}_${eventDate}`);
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(nameEQ)) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
}