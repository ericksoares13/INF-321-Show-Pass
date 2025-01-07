function resizeMargin() {
    const header = document.getElementById('header');
    const content = document.getElementById('content');
    const heightHeader = header.offsetHeight;
    content.style.marginTop = heightHeader - 1 + 'px';
}

window.addEventListener('load', resizeMargin);
window.addEventListener('resize', resizeMargin);