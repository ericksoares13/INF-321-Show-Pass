// LIDA COM A OPÇÃO DE EXIBIR A SENHA

$(document).ready(function() {
    $('#toggle-password').click(function() {
        const passwordField = $('#password');
        const passwordType = passwordField.attr('type') === 'password' ? 'text' : 'password';
        const icon = passwordField.attr('type') === 'password' ? 'eye' : 'eye-off';

        passwordField.attr('type', passwordType);
        $(this).find('ion-icon').attr('name', icon);
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