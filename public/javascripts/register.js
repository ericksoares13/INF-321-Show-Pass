'use strict';

const validateName = (name) => {
    return name != '';
};

const validateUser = (userName) => {
    return userName != '';
};

const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

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

    return dig1 === parseInt(cpf.charAt(9)) && dig2 === parseInt(cpf.charAt(10));
};

//const validateBirthDate;

const validateCellphone = (number) => {
    number = number.replace(/[^\d]/g, '');
    const regex = /^[1-9][0-9]{10}$/;
    return regex.test(number);
};

const validarEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
};

//const validatePassword;

//const validateCheckPassword;


(() => {
    const validators = {
        'name': validateName,
        'user': validateUser,
        'cpf': validateCPF,
        //'birth-date': validateBirthDate,
        'cellphone': validateCellphone,
        'email': validarEmail,
        //'password': validatePassword,
        //'check-password': validateCheckPassword
    };
  
    const forms = document.querySelectorAll('.needs-validation');
  
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            Array.from(form.elements).forEach(input => {
                let valid = true;

                const id = input.id;

                if (validators[id]) {
                    const isValid = validators[id](input.value);
            
                    if (!isValid) {
                        valid = false;
                        input.classList.add('is-invalid');
                    } else {
                        input.classList.remove('is-invalid');
                    }
                }

                if (!form.checkValidity() || !valid) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    form.classList.add('was-validated');
                }
            });
        }, false);
    });
})();