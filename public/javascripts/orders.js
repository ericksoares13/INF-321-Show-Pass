// REDIRECIONAMENTO DO CARD 

function redirectToPage(url) {
    window.location.href = url;
}

// FUNÇÃO DE FILTRO POR DATA E ANÁLISE DO RETORNO FILTRADO

function applyDateFilter() {
    const filter = document.getElementById("date-filter").value;
    const cards = document.querySelectorAll(".card");
    const noResultsMessage = document.querySelector(".no-results-message");

    cards.forEach(card => {
        const dateText = card.querySelector("small").textContent;
        const dateParts = dateText.split(" - ")[1].split(" de ");
        const eventDate = new Date(`${dateParts[2]}-${monthToNumber(dateParts[1])}-${dateParts[0]}`);
    
        const now = new Date();
        let showCard = true;

        switch (filter) {
            case "this-month":
                showCard = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
                break;
            case "last-3-months":
                showCard = now - eventDate <= 3 * 30 * 24 * 60 * 60 * 1000;
                break;
            case "last-6-months":
                showCard = now - eventDate <= 6 * 30 * 24 * 60 * 60 * 1000;
                break;
            case "last-year":
                showCard = now - eventDate <= 12 * 30 * 24 * 60 * 60 * 1000;
                break;
            default:
                showCard = true;
        }

        card.style.display = showCard ? "block" : "none";
    });

    const visibleCards = Array.from(cards).filter(card => card.style.display !== "none");

    noResultsMessage.style.display = visibleCards.length === 0 ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", applyDateFilter);
document.getElementById("date-filter").addEventListener("change", applyDateFilter);

// FUNÇÃO AUXILIAR QUE RETORNA O NUMERO DO MÊS EM FUNÇÃO DO NOME
  
function monthToNumber(month) {
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return months.indexOf(month.toLowerCase()) + 1;
}