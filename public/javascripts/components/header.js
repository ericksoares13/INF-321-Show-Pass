function resizeMargin() {
    const header = document.getElementById('header');
    const content = document.getElementById('content');
    const heightHeader = header.offsetHeight;
    content.style.marginTop = heightHeader - 1 + 'px';
}

async function checkAuth() {
    try {
        const response = await fetch('/authenticate', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

async function displayLinks() {
    const authenticate = await checkAuth();

    if (authenticate) {
        document.getElementById('orders').style.display = 'block';
        document.getElementById('profile').style.display = 'block';
        document.getElementById('support').style.display = 'block';
        document.getElementById('register').style.display = 'none';
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'block';
    } else {
        document.getElementById('orders').style.display = 'none';
        document.getElementById('profile').style.display = 'none';
        document.getElementById('support').style.display = 'block';
        document.getElementById('register').style.display = 'block';
        document.getElementById('login').style.display = 'block';
        document.getElementById('logout').style.display = 'none';
    }
}

async function checkAdminAuth() {
    try {
        const response = await fetch('/admin/authenticate', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

async function displayAdminLink() {
    const authenticate = await checkAdminAuth();

    if (authenticate) {
        document.getElementById('admin').style.display = 'block';
    } else {
        document.getElementById('admin').style.display = 'none';
    }
}

window.addEventListener('load', resizeMargin);
window.addEventListener('resize', resizeMargin);
window.addEventListener('load', displayLinks);
window.addEventListener('load', displayAdminLink);
