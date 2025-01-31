// SETORES E VALORES DISPONÍVEIS PARA O EVENTO

const sectorPrices = {
    "Pista": {
        "Inteira": 950,
        "Meia-Entrada": 475,
        "Meia-Entrada Idoso": 475,
        "Meia-Entrada PCD": 475
    },
    "Cadeira Inferior": {
        "Inteira": 660,
        "Meia-Entrada": 330,
        "Meia-Entrada Idoso": 330,
        "Meia-Entrada PCD": 330
    },
    "Cadeira Superior": {
        "Inteira": 550,
        "Meia-Entrada": 275,
        "Meia-Entrada Idoso": 275,
        "Meia-Entrada PCD": 275
    }
};

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
    const ticketList = document.querySelectorAll('#ticket-list .list-group-item');

    ticketList.forEach((item, index) => {
        const category = Object.keys(prices)[index];
        if (category) {
            item.querySelector('.info strong').textContent = category;
            item.querySelector('.price').textContent = `R$ ${prices[category].toFixed(2)}`;
            item.querySelector('.quantity-display').setAttribute('data-price', prices[category]);
        }
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

    // Soma os ingressos de todos os setores
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

    Object.keys(selectedTickets).forEach(sector => {
        Object.keys(selectedTickets[sector]).forEach(ticketType => {
            const price = sectorPrices[sector][ticketType];
            total += selectedTickets[sector][ticketType] * price;
            hasSelection = true;
        });
    });

    const checkoutSection = document.getElementById('checkout-section');
    const totalPriceElement = document.getElementById('total-price');

    if (hasSelection) {
        totalPriceElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
        checkoutSection.classList.remove('d-none');
    } else {
        checkoutSection.classList.add('d-none');
    }
}