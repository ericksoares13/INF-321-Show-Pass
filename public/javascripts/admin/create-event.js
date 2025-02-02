document.getElementById('addEventDate').addEventListener('click', function () {
    const dates = document.getElementById('dates');
    const dateIndex = dates.children.length;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'event-date mb-3 border p-3';
    dateDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Data ${dateIndex + 1}</h4>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeEventDate(this)">Remover Data</button>
        </div>
        <div class="row g-3">
            <div class="col-md-4">
                <label for="state${dateIndex}" class="form-label">Estado</label>
                <input type="text" class="form-control" id="state${dateIndex}" name="dates[${dateIndex}][state]" required>
            </div>
            <div class="col-md-5">
                <label for="city${dateIndex}" class="form-label">Cidade</label>
                <input type="text" class="form-control" id="city${dateIndex}" name="dates[${dateIndex}][city]" required>
            </div>
            <div class="col-md-3">
                <label for="date${dateIndex}" class="form-label">Data</label>
                <input type="date" class="form-control" id="date${dateIndex}" name="dates[${dateIndex}][date]" min="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="col-12">
                <label for="locale${dateIndex}" class="form-label">Local</label>
                <input type="text" class="form-control" id="locale${dateIndex}" name="dates[${dateIndex}][locale]" required>
            </div>
            <div class="col-12">
                <label for="address${dateIndex}" class="form-label">Endereço</label>
                <input type="text" class="form-control" id="address${dateIndex}" name="dates[${dateIndex}][address]" required>
            </div>
            <div class="col-12">
                <h5>Ingressos</h5>
                <div id="tickets${dateIndex}">
                    <!-- Aqui serão adicionados os campos para cada ingresso dinamicamente -->
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="addEventTicket(${dateIndex})">Adicionar Ingresso</button>
            </div>
        </div>
    `;
    dates.appendChild(dateDiv);
});

function removeEventDate(button) {
    const dateDiv = button.closest('.event-date');
    dateDiv.remove();
    updateDateTitles();
    updateDateIndices();
}

function updateDateTitles() {
    const dates = document.getElementById('dates');
    const dateDivs = dates.querySelectorAll('.event-date');
    dateDivs.forEach((div, index) => {
        div.querySelector('h4').textContent = `Data ${index + 1}`;
    });
}

function updateDateIndices() {
    const dates = document.getElementById('dates');
    const dateDivs = dates.querySelectorAll('.event-date');
    
    dateDivs.forEach((div, newDateIndex) => {
        div.querySelectorAll('input, textarea, select').forEach(input => {
            const name = input.name.replace(/\[\d+\]/g, `[${newDateIndex}]`);
            input.name = name;
            
            const id = input.id.replace(/\d+/, newDateIndex);
            input.id = id;
        });

        const addTicketBtn = div.querySelector('button[onclick^="addEventTicket"]');
        if (addTicketBtn) {
            addTicketBtn.setAttribute('onclick', `addEventTicket(${newDateIndex})`);
        }

        const ticketsContainer = div.querySelector(`div[id^="tickets"]`);
        if (ticketsContainer) {
            ticketsContainer.id = `tickets${newDateIndex}`;
            
            const tickets = ticketsContainer.querySelectorAll('.event-ticket');
            tickets.forEach((ticket, newTicketIndex) => {
                ticket.querySelectorAll('input').forEach(input => {
                    input.name = input.name
                        .replace(/dates\[\d+\]/g, `dates[${newDateIndex}]`)
                        .replace(/tickets\]\[\d+\]/g, `tickets][${newTicketIndex}]`);
                    
                    input.id = input.id
                        .replace(/_(\d+)_/, `_${newDateIndex}_`)
                        .replace(/\d+$/, newTicketIndex);
                });
            });
        }
    });
}

function addEventTicket(dateIndex) {
    const tickets = document.getElementById(`tickets${dateIndex}`);
    const ticketIndex = tickets.children.length;

    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'event-ticket mb-3 border p-3';
    ticketDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6>Ingresso ${ticketIndex + 1}</h6>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeEventTicket(this)">Remover Ingresso</button>
        </div>
        <div class="row g-3">
            <div class="col-md-6">
                <label for="sector${dateIndex}_${ticketIndex}" class="form-label">Setor</label>
                <input type="text" class="form-control" id="sector${dateIndex}_${ticketIndex}" name="dates[${dateIndex}][tickets][${ticketIndex}][sector]" required>
            </div>
            <div class="col-md-6">
                <label for="category${dateIndex}_${ticketIndex}" class="form-label">Categoria</label>
                <input type="text" class="form-control" id="category${dateIndex}_${ticketIndex}" name="dates[${dateIndex}][tickets][${ticketIndex}][category]" required>
            </div>
            <div class="col-md-6">
                <label for="value${dateIndex}_${ticketIndex}" class="form-label">Valor</label>
                <input type="number" class="form-control" id="value${dateIndex}_${ticketIndex}" name="dates[${dateIndex}][tickets][${ticketIndex}][value]" required>
            </div>
            <div class="col-md-6">
                <label for="totalAmount${dateIndex}_${ticketIndex}" class="form-label">Quantidade Total</label>
                <input type="number" class="form-control" id="totalAmount${dateIndex}_${ticketIndex}" name="dates[${dateIndex}][tickets][${ticketIndex}][totalAmount]" required>
            </div>
        </div>
    `;
    tickets.appendChild(ticketDiv);
}

function removeEventTicket(button) {
    const ticketDiv = button.closest('.event-ticket');
    const ticketsContainer = ticketDiv.parentElement;
    ticketDiv.remove();
    updateTicketTitles(ticketsContainer);
    updateTicketIndices(ticketsContainer);
}

function updateTicketTitles(ticketsContainer) {
    const tickets = ticketsContainer.querySelectorAll('.event-ticket');
    tickets.forEach((ticket, index) => {
        ticket.querySelector('h6').textContent = `Ingresso ${index + 1}`;
    });
}

function updateTicketIndices(ticketsContainer) {
    const tickets = ticketsContainer.querySelectorAll('.event-ticket');
    tickets.forEach((ticket, index) => {
        ticket.querySelectorAll('input, textarea, select').forEach(input => {
            const name = input.getAttribute('name');
            if (name) {
                const newName = name.replace(/\[tickets\]\[\d+\]/, `[tickets][${index}]`);
                input.setAttribute('name', newName);
            }
            const id = input.getAttribute('id');
            if (id) {
                const newId = id.replace(/_(\d+)_/, `_${index}_`);
                input.setAttribute('id', newId);
            }
        });
    });
}