document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    headerContainer.innerHTML = `
        <a class="pets-link" href="/parfumes/index.html">Парфюмы</a>
        <a class="pets-link" href="/">Главная</a>
        <a class="nutrition-link" href="/orders/index.html">Заказы</a>
    `;
    document.body.insertBefore(headerContainer, document.body.firstChild);
});