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