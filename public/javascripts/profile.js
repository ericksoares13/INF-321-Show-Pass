// SCRIPT PARA ALTERAÇÃO DA VISUALIZAÇÃO CONFORME A OPÇÃO DE CONTA ESCOLHIDA PELO USUÁRIO

document.getElementById('info-tab').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('info-section').style.display = 'block';
    document.getElementById('password-section').style.display = 'none';
    this.classList.add('active');
    document.getElementById('password-tab').classList.remove('active');
});

document.getElementById('password-tab').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('info-section').style.display = 'none';
    document.getElementById('password-section').style.display = 'block';
    this.classList.add('active');
    document.getElementById('info-tab').classList.remove('active');
});