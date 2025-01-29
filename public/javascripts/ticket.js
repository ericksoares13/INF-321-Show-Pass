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

// FUNÇÃO PARA EXIBIÇÃO DOS TIPOS DE INGRESSOS

function showTickets(element) {
  
    const sector = element.querySelector('strong').textContent;
    document.getElementById('selected-sector').textContent = sector;

    const prices = sectorPrices[sector];

    const ticketList = document.querySelectorAll('#ticket-list .list-group-item');
    const categories = Object.keys(prices);

    categories.forEach((category, index) => {
        if (ticketList[index]) {
            ticketList[index].querySelector('.info strong').textContent = category;
            ticketList[index].querySelector('.price').textContent = `R$ ${prices[category].toFixed(2)}`;
        }
    });

    document.getElementById('sector-list').classList.add('d-none');
    document.getElementById('ticket-list').classList.remove('d-none');
}

// FUNÇÃO PARA RETORNAR À TELA DOS SETORES

function goBack() {
    document.getElementById('sector-list').classList.remove('d-none');
    document.getElementById('ticket-list').classList.add('d-none');
}

function changeQuantity(button, delta) {
    const quantityDisplay = button.parentElement.querySelector('.quantity-display');
    const price = parseFloat(quantityDisplay.getAttribute('data-price'));
    let currentQuantity = parseInt(quantityDisplay.textContent, 10);

    currentQuantity = Math.max(0, currentQuantity + delta);
    quantityDisplay.textContent = currentQuantity;

    updateTotal();
}

function updateTotal() {
    const quantities = document.querySelectorAll('.quantity-display');
    let total = 0;
    let hasSelection = false;

    quantities.forEach(display => {
        const quantity = parseInt(display.textContent, 10);
        const price = parseFloat(display.getAttribute('data-price'));

        if (quantity > 0) {
            total += quantity * price;
            hasSelection = true;
        }
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