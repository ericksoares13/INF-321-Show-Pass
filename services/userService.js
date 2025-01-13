const User = require('../models/User');

class UserService {
    async getAllUsers() {
        return await User.find({});
    }

    async createUser(user) {
        this.#validateUser(user);
        const createdUser = await User.create(user);
        return createdUser;
    }

    #validateUser(user) {
        this.#validateName(user.name);
        this.#validateUserName(user.user);
        this.#validateCPF(user.cpf);
        this.#validateBirthDate(user.birthDate);
        this.#validateCellphone(user.cellphone);
        this.#validateEmail(user.email);
        this.#validatePassword(user.password);
        this.#validateCheckPassword(user.password, user.checkPassword);
    }

    #validateName(name) {
        if (name == '') {
            throw 'O campo \"Nome Completo\" é obrigatório.';
        }
    }

    #validateUserName(userName) {
        if (userName == '') {
            throw 'O campo \"Usuário\" é obrigatório.';
        }
    
        if (userName.length < 3 || userName.length > 20) {
            throw 'O nome de usuário deve ter entre 3 e 20 caracteres.';
        }
    
        const usernamePattern = /^[a-zA-Z0-9_-]+$/;
        if (!usernamePattern.test(userName) || userName.includes(" ")) {
            throw 'O nome de usuário só pode conter letras, números, underlines (_) e hífens (-).';
        }
    }

    #validateCPF(cpf) {
        if (cpf == '') {
            throw 'O campo \"CPF\" é obrigatório.';
        }
    
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            throw 'CPF inválido.';
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
            return;
        }
    
        throw 'CPF inválido.';
    }

    #validateBirthDate(date) {
        if (date == '') {
            throw 'O campo \"Data de nascimento\" é obrigatório.';
        }

        const birthDate = new Date(date);

        if (isNaN(birthDate.getTime())) {
            throw 'A data fornecida é inválida.';
        }

        const today = new Date();
        if (birthDate > today) {
            throw 'A data de nascimento não pode ser no futuro.';
        }
    }

    #validateCellphone(number) {
        if (number == '') {
            throw 'O campo \"Celular\" é obrigatório.';
        }
    
        number = number.replace(/[^\d]/g, '');
        const regex = /^[1-9][0-9]{10}$/;
    
        if (regex.test(number)) {
            return;
        }
    
        throw 'Celular inválido.';
    }

    #validateEmail(email) {
        if (email == '') {
            throw 'O campo \"Email\" é obrigatório.';
        }
    
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
        if (regex.test(email)) {
            return;
        }
    
        throw 'Email inválido.';
    }

    #validatePassword(password) {
        if (password == '') {
            throw 'O campo \"Senha\" é obrigatório.';
        }
    
        this.#passwordStrength(password);
    }

    #passwordStrength(password) {
        let strength = 0;

        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 20;
        if (/\d/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;

        if (strength < 50) {
            throw 'Senha Fraca.';
        } else if (strength < 75) {
            throw 'Senha Moderada.';
        }
    }

    #validateCheckPassword(password, checkPassword) {
        if (!checkPassword || checkPassword == '') {
            throw 'O campo \"Confirme sua senha\" é obrigatório.';
        }
    
        if (password == checkPassword) {
            return;
        }
    
        throw 'As senhas não coincidem.';
    }
}

module.exports = new UserService();
