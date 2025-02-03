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

    const paymentTypeSelect = document.getElementById("payment-type");
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
    const cardNumberInput = document.getElementById("card-number");
    IMask(cardNumberInput, {
        mask: "0000 0000 0000 0000"
    });
});