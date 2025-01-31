const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
    static SALT_ROUNDS = 10;
    
    async getAllUsers() {
        return await User.find({});
    }
    
    async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) {
            return;
        }
        return user;
    }

    async getUserByField(fieldAndValue) {
        const user = await User.findOne(fieldAndValue);
        return user;
    }

    async hashPassword(password) {
        const hash = await bcrypt.hash(password, UserService.SALT_ROUNDS);
        return hash;
    }

    async checkPassword(password, hashPassword) {
        const isMatch = await bcrypt.compare(password, hashPassword);
        return isMatch;
    }

    async createUser(user) {
        await this.#validateUser(user);
        user.password = await this.hashPassword(user.password);
        const createdUser = await User.create(user);
        return createdUser;
    }

    async updateUser(userId, params) {
        const user = await this.getUserById(userId);
        const error = {};
        
        if (params.name && Object.entries(params).every(([key, value]) => user[key] === value)) {
            return user;
        } else if (params.name) {
            this.#validateName((user.name = params.name), error);
            await this.#validateUserName((user.user = params.user), error);
            this.#validateCellphone((user.cellphone = params.cellphone), error);
        } else {
            const isMatch = await this.checkPassword(params.oldPassword, user.password);
            if (!isMatch) {
                error.oldPassword = 'Senha incorreta.';
            }
            this.#validatePassword(params.password, error);
            this.#validateCheckPassword(params.password, params.checkPassword, error);
        }
            
        if (Object.keys(error).length > 0) {
            throw error;
        }

        if (params.password) {
            user.password = await this.hashPassword(params.password);
        }

        await User.findOneAndUpdate({ _id: user._id }, { $set: user });
    }

    async loginUser(user) {
        const loggedUser = await this.getUserByField({ $or: [
            { email: user.email },
            { user: user.email }]
        });

        if (!loggedUser) {
            throw { email : 'Usuário/Email não encontrado.' };
        }

        const isMatch = await bcrypt.compare(user.password, loggedUser.password);

        if (!isMatch) {
            throw { password: 'Senha incorreta.' };
        }

        return loggedUser;
    }

    generateToken(user) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return token;
    }

    async getUserInfos(userId) {
        const user = await UserService.getUserById(userId);
        return {
            name: user.name,
            user: user.user,
            cpf: user.cpf,
            birthDate: new Date(user.birthDate).toISOString().split('T')[0],
            cellphone: user.cellphone,
            email: user.email
        };
    }

    async #validateUser(user) {
        const error = {};

        this.#validateName(user.name, error);
        await this.#validateUserName(user.user, error);
        await this.#validateCPF(user.cpf, error);
        this.#validateBirthDate(user.birthDate, error);
        this.#validateCellphone(user.cellphone, error);
        await this.#validateEmail(user.email, error);
        this.#validatePassword(user.password, error);
        this.#validateCheckPassword(user.password, user.checkPassword, error);

        if (Object.keys(error).length > 0) {
            throw error;
        }
    }

    #validateName(name, error) {
        if (name == '') {
            error.name = 'O campo \"Nome Completo\" é obrigatório.';
        }
    }

    async #validateUserName(userName, error) {
        if (userName == '') {
            error.user = 'O campo \"Usuário\" é obrigatório.';
            return;
        }
    
        if (userName.length < 3 || userName.length > 20) {
            error.user = 'O nome de usuário deve ter entre 3 e 20 caracteres.';
            return;
        }
    
        const usernamePattern = /^[a-zA-Z0-9_-]+$/;
        if (!usernamePattern.test(userName) || userName.includes(" ")) {
            error.user = 'O nome de usuário só pode conter letras, números, underlines (_) e hífens (-).';
            return;
        }

        const user = await this.getUserByField({user: userName});
        if (user) {
            error.user = 'O nome de usuário escolhido já está em uso.';
        }
    }

    async #validateCPF(cpf, error) {
        if (cpf == '') {
            error.cpf = 'O campo \"CPF\" é obrigatório.';
            return;
        }
    
        const copiedCpf = cpf.replace(/[^\d]/g, '');
        if (copiedCpf.length !== 11 || /^(\d)\1+$/.test(copiedCpf)) {
            error.cpf = 'CPF inválido.';
            return;
        }
    
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(copiedCpf.charAt(i)) * (10 - i);
        }
    
        let dig1 = (sum * 10) % 11;
        if (dig1 === 10) dig1 = 0;
    
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(copiedCpf.charAt(i)) * (11 - i);
        }
    
        let dig2 = (sum * 10) % 11;
        if (dig2 === 10) dig2 = 0;
    
        if (dig1 === parseInt(copiedCpf.charAt(9)) && dig2 === parseInt(copiedCpf.charAt(10))) {
            const user = await this.getUserByField({cpf: cpf});
            if (user) {
                error.cpf = 'O CPF informado já está em uso.';
                return;
            }

            return;
        }
    
        error.cpf = 'CPF inválido.'
    }

    #validateBirthDate(date, error) {
        if (date == '') {
            error.birthDate = 'O campo \"Data de nascimento\" é obrigatório.';
            return;
        }

        const birthDate = new Date(date);

        if (isNaN(birthDate.getTime())) {
            error.birthDate = 'A data fornecida é inválida.';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (birthDate > today) {
            error.birthDate = 'A data não pode ser no futuro.';
            return;
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        if (age < 18) {
            error.birthDate = 'Idade mínima de 18 anos.';
        }
    }

    #validateCellphone(number, error) {
        if (number == '') {
            error.cellphone = 'O campo \"Celular\" é obrigatório.';
            return;
        }
    
        number = number.replace(/[^\d]/g, '');
        const regex = /^[1-9][0-9]{10}$/;
    
        if (regex.test(number)) {
            return;
        }
    
        error.cellphone = 'Celular inválido.';
    }

    async #validateEmail(email, error) {
        if (email == '') {
            error.email = 'O campo \"Email\" é obrigatório.';
            return;
        }
    
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
        if (regex.test(email)) {
            const user = await this.getUserByField({email: email});
            if (user) {
                error.email = 'O email informado já está em uso.';
                return;
            }

            return;
        }
    
        error.email = 'Email inválido.';
    }

    #validatePassword(password, error) {
        if (password == '') {
            error.password = 'O campo \"Senha\" é obrigatório.';
            return;
        }
    
        this.#passwordStrength(password, error);
    }

    #passwordStrength(password, error) {
        let strength = 0;

        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 20;
        if (/\d/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;

        if (strength < 50) {
            error.password = 'Senha Fraca.';
        } else if (strength < 75) {
            error.password = 'Senha Moderada.';
        }
    }

    #validateCheckPassword(password, checkPassword, error) {
        if (!checkPassword || checkPassword == '') {
            error.checkPassword = 'O campo \"Confirme sua senha\" é obrigatório.';
            return;
        }
    
        if (password == checkPassword) {
            return;
        }
    
        error.checkPassword = 'As senhas não coincidem.';
    }
}

module.exports = new UserService();
