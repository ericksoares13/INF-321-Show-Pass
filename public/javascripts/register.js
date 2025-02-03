'use strict';

// APLICAÇÃO DAS MÁSCARAS

$(document).ready(function () {
    $('#cpf').mask('000.000.000-00');
});

$(document).ready(function () {
    $('#cellphone').mask('(00) 00000-0000');
});

// CÁLCULO DA FORÇA DA SENHA

function calculatePasswordStrength(password) {
    let strength = 0;
    let message = '';
    let className = '';

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    if (strength < 50) {
        message = 'Fraca';
        className = 'text-danger';
    } else if (strength < 75) {
        message = 'Moderada';
        className = 'text-warning';
    } else {
        message = 'Forte';
        className = 'text-success';
    }

    return { percent: strength, message: message, class: className };
}

$(document).ready(function () {
    const passwordField = $('#password');
    const strengthMeter = $('#password-strength-meter');
    const strengthMessage = $('#password-strength-msg');
    const progressContainer = $('.progress-container');

    passwordField.on('input', function () {
        const password = passwordField.val();

        progressContainer.css('display', 'flex');

        const strength = calculatePasswordStrength(password);

        strengthMeter.css('width', strength.percent + '%').attr('aria-valuenow', strength.percent);

        strengthMeter.removeClass('progress-bar-danger progress-bar-warning progress-bar-success');
        if (strength.percent < 50) {
            strengthMeter.addClass('progress-bar-danger');
        } else if (strength.percent < 75) {
            strengthMeter.addClass('progress-bar-warning');
        } else {
            strengthMeter.addClass('progress-bar-success');
        }

        strengthMessage.text(strength.message).removeClass('text-danger text-warning text-success').addClass(strength.class);
    });
});

// LIDA COM A OPÇÃO DE EXIBIR A SENHA

$(document).ready(function () {
    [['#toggle-password-1', '#password'], ['#toggle-password-2', '#checkPassword']]
        .forEach(button => {
            $(button[0]).click(function () {
                const passwordField = $(button[1]);
                const passwordType = passwordField.attr('type') === 'password' ? 'text' : 'password';
                const icon = passwordField.attr('type') === 'password' ? 'eye' : 'eye-off';

                passwordField.attr('type', passwordType);
                $(this).find('ion-icon').attr('name', icon);
            });
        });
});

// EXIBE INFORMAÇÕES SOBRE A SENHA

document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// FUNÇÕES DE VALIDAÇÃO DE DADOS

const validateName = (name) => {
    if (name == '') {
        errorMessages['name'] = 'Campo obrigatório.';
        return false;
    }

    return true;
};

const validateUser = (userName) => {
    if (userName == '') {
        errorMessages['user'] = 'Campo obrigatório.';
        return false;
    }

    if (userName.length < 3 || userName.length > 20) {
        errorMessages['user'] = 'O nome de usuário deve ter entre 3 e 20 caracteres.';
        return false;
    }

    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    if (!usernamePattern.test(userName) || userName.includes(" ")) {
        errorMessages['user'] = 'O nome de usuário só pode conter letras, números, underlines (_) e hífens (-).';
        return false
    }

    return true;
};

const validateCPF = (cpf) => {
    if (cpf == '') {
        errorMessages['cpf'] = 'Campo obrigatório.';
        return false;
    }

    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        errorMessages['cpf'] = 'CPF inválido.';
        return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let dig1 = (sum * 10) % 11;
    if (dig1 === 10) dig1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }

    let dig2 = (sum * 10) % 11;
    if (dig2 === 10) dig2 = 0;

    if (dig1 === parseInt(cpf.charAt(9)) && dig2 === parseInt(cpf.charAt(10))) {
        return true;
    }

    errorMessages['cpf'] = 'CPF inválido.';
    return false;
};

const validateBirthDate = (date) => {
    if (date == '') {
        errorMessages['birthDate'] = 'Campo obrigatório.';
        return false;
    }

    const birthDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
        errorMessages['birthDate'] = 'A data não pode ser no futuro.';
        return false;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    if (age < 18) {
        errorMessages['birthDate'] = 'Idade mínima de 18 anos.';
        return false;
    }

    return true;
};

const validateCellphone = (number) => {
    if (number == '') {
        errorMessages['cellphone'] = 'Campo obrigatório.';
        return false;
    }

    number = number.replace(/[^\d]/g, '');
    const regex = /^[1-9][0-9]{10}$/;

    if (regex.test(number)) {
        return true;
    }

    errorMessages['cellphone'] = 'Celular inválido.';
    return false;
};

const validarEmail = (email) => {
    if (email == '') {
        errorMessages['email'] = 'Campo obrigatório.';
        return false;
    }

    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (regex.test(email)) {
        return true;
    }

    errorMessages['email'] = 'Email inválido.';
    return false;
};

const validatePassword = (password) => {
    if (password == '') {
        errorMessages['password'] = 'Campo obrigatório.';
        return false;
    }

    const strength = calculatePasswordStrength(password);
    if (strength.class.includes('text-success')) {
        return true;
    }

    errorMessages['password'] = 'A senha precisa ser forte.';
    return false;
};

const validateCheckPassword = (checkPassword) => {
    if (checkPassword == '') {
        errorMessages['checkPassword'] = 'Campo obrigatório.';
        return false;
    }

    const password = $('#password').val();

    if (password == checkPassword) {
        return true;
    }

    errorMessages['checkPassword'] = 'As senhas não coincidem.';
    return false;
};

let errorMessages = {};

(() => {
    const validators = {
        'name': validateName,
        'user': validateUser,
        'cpf': validateCPF,
        'birthDate': validateBirthDate,
        'cellphone': validateCellphone,
        'email': validarEmail,
        'password': validatePassword,
        'checkPassword': validateCheckPassword
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

                    if (id == 'birthDate' && input.validity.badInput) {
                        errorMessages[id] = 'Data inválida.'
                    }

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