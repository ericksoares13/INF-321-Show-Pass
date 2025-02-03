'use strict';

// APLICAÇÃO DA MÁSCARA

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
    [['#toggle-password-1', '#oldPassword'], ['#toggle-password-2', '#password'], ['#toggle-password-3', '#checkPassword']]
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

const validateOldPassword = (oldPassword) => {
    if (oldPassword == '') {
        errorMessages['oldPassword'] = 'Campo obrigatório.';
        return false;
    }

    return true;
}

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
        'cellphone': validateCellphone,
        'oldPassword': validateOldPassword,
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

// SCRIPT PARA ALTERAÇÃO DA VISUALIZAÇÃO CONFORME A OPÇÃO DE CONTA ESCOLHIDA PELO USUÁRIO

document.addEventListener('DOMContentLoaded', function () {
    const lastTab = getCookie('lastTab') || 'info-tab';
    if (document.getElementById(lastTab)) {
        switchTab(lastTab, lastTab === 'info-tab' ? 'password-tab' : 'info-tab',
            lastTab === 'info-tab' ? 'info-section' : 'password-section',
            lastTab === 'info-tab' ? 'password-section' : 'info-section', false);
    }
});

function switchTab(activeTab, inactiveTab, activeSection, inactiveSection, updateCookie = true) {
    document.getElementById(activeTab).classList.add('active');
    document.getElementById(inactiveTab).classList.remove('active');
    document.getElementById(activeSection).style.display = 'block';
    document.getElementById(inactiveSection).style.display = 'none';

    if (updateCookie) {
        setCookie('lastTab', activeTab, 1);
    }
}

document.getElementById('info-tab').addEventListener('click', function (e) {
    e.preventDefault();
    switchTab('info-tab', 'password-tab', 'info-section', 'password-section');
});

document.getElementById('password-tab').addEventListener('click', function (e) {
    e.preventDefault();
    switchTab('password-tab', 'info-tab', 'password-section', 'info-section');
});

function setCookie(name, value, hours) {
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/meu-perfil`;
}

function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const [key, value] = cookies[i].split('=');
        if (key === name) return value;
    }
    return null;
}

let isSubmitting = false;

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function () {
        isSubmitting = true;
    });
});

window.addEventListener('beforeunload', function () {
    if (!isSubmitting) {
        deleteCookie('lastTab');
    }
});

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/meu-perfil;`;
}
