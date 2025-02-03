document.addEventListener("DOMContentLoaded", function () {
    const paymentCards = document.querySelectorAll(".payment-card");
    const rotateIcons = document.querySelectorAll(".rotate-icon");
    const forms = document.querySelectorAll(".form-input");

    paymentCards.forEach((card, index) => {
        const icon = rotateIcons[index];
        const form = forms[index];

        card.addEventListener("click", function () {
            const isFormVisible = form.style.display === "block";

            forms.forEach(f => (f.style.display = "none"));
            rotateIcons.forEach(i => i.classList.remove("open"));

            if (!isFormVisible) {
                form.style.display = "block";
                icon.classList.add("open");

                if (form.id === "pix-section") {
                    updateQrExpiry();
                }
            }
        });

        form.addEventListener("click", function (event) {
            event.stopPropagation();
        });
    });

    const paymentTypeSelect = document.getElementById("paymentType");
    const installmentsSection = document.getElementById("installments");

    paymentTypeSelect.addEventListener("change", function () {
        if (this.value === "Crédito") {
            installmentsSection.style.display = "block";
        } else {
            installmentsSection.style.display = "none";
        }
    });

});

// ATUALIZA O TEMPO DE EXPIRAÇÃO DO QR-CODE AO ABRIR A ABA "PIX"

function updateQrExpiry() {
    const qrExpiryTime = document.getElementById("qr-expiry-time");
    const now = new Date();
    const expiry = new Date(now.getTime() + 5 * 60000);

    const hours = expiry.getHours().toString().padStart(2, "0");
    const minutes = expiry.getMinutes().toString().padStart(2, "0");

    qrExpiryTime.textContent = `${hours}:${minutes}`;
}

// APLICA MASCARA PARA O CAMPO "NUMERO DO CARTÃO"

document.addEventListener("DOMContentLoaded", function () {
    const cardNumberInput = document.getElementById("cardNumber");
    IMask(cardNumberInput, {
        mask: "0000 0000 0000 0000"
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const expiryDateInput = document.getElementById("expiryDate");
    IMask(expiryDateInput, {
        mask: "00/00"
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const cvvInput = document.getElementById("cvv");
    IMask(cvvInput, {
        mask: "000"
    });
});

// FUNÇÕES DE VALIDAÇÃO DE DADOS

const validateName = (name) => {
    if (name == '') {
        errorMessages['cardHolder'] = 'Campo obrigatório.';
        return false;
    }

    return true;
};

const validateCardNumber = (cardNumber) => {
    if (cardNumber == '') {
        errorMessages['cardNumber'] = 'Campo obrigatório.';
        return false;
    }

    cardNumber = cardNumber.replace(/\D/g, '');

    if (cardNumber.length != 16) {
        errorMessages['cardNumber'] = 'Número do cartão inválido.';
        return false;
    }

    return true;
};

const validateExpiryDate = (expiryDate) => {
    if (expiryDate == '') {
        errorMessages['expiryDate'] = 'Campo obrigatório.';
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errorMessages['expiryDate'] = 'Formato inválido (MM/AA).';
        return false;
    }

    const [month, year] = expiryDate.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
        errorMessages['expiryDate'] = 'Mês inválido.';
        return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errorMessages['expiryDate'] = 'Cartão expirado.';
        return false;
    }

    return true;
};

const validateCVV = (cvv) => {
    if (cvv == '') {
        errorMessages['cvv'] = 'Campo obrigatório.';
        return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        errorMessages['cvv'] = 'CVV inválido.';
        return false;
    }

    return true;
};

let errorMessages = {};

(() => {
    const validators = {
        'cardHolder': validateName,
        'cardNumber': validateCardNumber,
        'expiryDate': validateExpiryDate,
        'cvv': validateCVV
    };

    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            Array.from(form.elements).forEach(input => {
                let valid = true;
                let feedbackElement = input.nextElementSibling;

                const id = input.id;

                if (validators[id]) {
                    const isValid = validators[id](input.value);

                    if (!isValid) {
                        valid = false;
                        input.classList.add('is-invalid');
                        feedbackElement.textContent = errorMessages[id];
                    } else {
                        input.classList.remove('is-invalid');
                        feedbackElement.textContent = '';
                    }
                }

                if (!form.checkValidity() || !valid) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }, false);
    });
})();
