document.addEventListener("DOMContentLoaded", function () {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const favicon = document.querySelector('link[rel="icon"]');

    function updateFavicon() {
        if (darkModeQuery.matches) {
            favicon.href = '/images/logo-light.svg';
        } else {
            favicon.href = '/images/logo-dark.svg';
        }
    }

    updateFavicon();

    darkModeQuery.addEventListener('change', updateFavicon);
});