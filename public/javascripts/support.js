// MUDANÇA DAS ABAS DAS PERGUNTAS

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// EXPANSÃO DAS PERGUNTAS

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
});

// CONTROLE DAS SETAS E DA EXIBIÇÃO DAS RESPOSTAS

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        question.classList.toggle('active');

        const answer = question.nextElementSibling;
        answer.classList.toggle('active');
    });
});

// FUNÇÕES DE VALIDAÇÃO DE DADOS

const validateField = (field, value) => {
    if (value == '') {
        errorMessages[field] = 'Campo obrigatório.';
        return false;
    }

    return true;
};

let errorMessages = {};

(() => {
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            Array.from(form.elements).forEach(input => {
                let valid = true;
                let feedbackElement = input.nextElementSibling;

                const id = input.id;

                const isValid = validateField(id, input.value);

                if (!isValid) {
                    valid = false;
                    input.classList.add('is-invalid');
                    feedbackElement.textContent = errorMessages[id];
                } else {
                    input.classList.remove('is-invalid');
                    feedbackElement.textContent = '';
                }

                if (!form.checkValidity() || !valid) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }, false);
    });
})();