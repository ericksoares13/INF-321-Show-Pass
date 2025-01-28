// FUNÇÃO PARA EXIBIÇÃO DOS TIPOS DE INGRESSOS

function showTickets() {
    document.getElementById('sector-list').classList.add('d-none');
    document.getElementById('ticket-list').classList.remove('d-none');
}

// FUNÇÃO PARA RETORNAR À TELA DOS SETORES

function goBack() {
    document.getElementById('sector-list').classList.remove('d-none');
    document.getElementById('ticket-list').classList.add('d-none');
}