"use strict"
//==========================================
import { ERROR_SERVER, PRODUCT_INFORMATION_NOT_FOUND } from './constants.js';
import { 
    showErrorMessage,
    checkingRelevanceValueBasket,
    setBasketLocalStorage,
    getBasketLocalStorage,
} from './utils.js';

const wrapper = document.querySelector('.wrapper');
let productsData = [];


getProducts();
wrapper.addEventListener('click', handleCardClick);

async function getProducts() {
    try {

        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText)
            }
            productsData = await res.json();
        }
        
        loadProductDetails(productsData);

    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}


function getParameterFromURL(parameter) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
}


function loadProductDetails(data) {

    if (!data || !data.length) {
        showErrorMessage(ERROR_SERVER)
        return;
    }
    
    checkingRelevanceValueBasket(data);

    const productId = Number(getParameterFromURL('id'));

    if (!productId) {
        showErrorMessage(PRODUCT_INFORMATION_NOT_FOUND)
        return;
    }

    const findProduct = data.find(card => card.id === productId);

    if(!findProduct) {
        showErrorMessage(PRODUCT_INFORMATION_NOT_FOUND)
        return;
    }
    renderInfoProduct(findProduct);
    
    const basket = getBasketLocalStorage();//получаем данные из ls
    checkingActiveButtons(basket);
}

    
    

function handleCardClick(event) {
    const targetButton = event.target.closest('.card__add');//ищем кнопку добавления в корзину
    if (!targetButton) return;

    const card = targetButton.closest('.product');//находим саму карточку
    const id = card.dataset.productId;//ищем атрибут id карточки
    const basket = getBasketLocalStorage();//получаем значение из LS

    if (basket.includes(id)){
        let index = basket.indexOf(id)
        basket.splice(index, 1)
        console.log(basket);
        setBasketLocalStorage(basket);//передаем массив idшек карточек в ls
    checkingActiveButtons(basket);//проходимся по всем кнопкам карточек, активны ли кнопки карточек которые находятся в ls
      //проверяем id карточки в ls, если есть то выходим
    }
    else {

    basket.push(id);//если новая карточка, пушим id карточки в массив
    console.log(basket);
    setBasketLocalStorage(basket);//передаем массив idшек карточек в ls
    checkingActiveButtons(basket);//проходимся по всем кнопкам карточек, активны ли кнопки карточек которые находятся в ls
    }
}

function checkingActiveButtons(basket) {
    const buttons = document.querySelectorAll('.card__add');//находим все кнопки "добавить в корзину"
//TODO
    buttons.forEach(btn => {
        const product = btn.closest('.product');//у каждой кнопки ищем родителя(крточку)
        const id = product.dataset.productId;//получаем ее id
        const isInBasket = basket.includes(id);//есть ли id в basket ls

        // btn.disabled = isInBasket;//делаем кнопку не кликабельной/кликабельной
        btn.classList.toggle('active', isInBasket);//добавляем стили
        btn.textContent = isInBasket ? 'В избранном' : 'В избранное';
    });
}


function renderInfoProduct(product) {
    const { id, img, title, price, discount, descr } = product;
    const priceDiscount = price - ((price * discount) / 100);
    const productItem = 
        `
        <div class="product" data-product-id="${id}">
            <h2 class="product__title">${title}</h2>
            <div class="product__img">
                <img src="./images/${img}" alt="${title}">
            </div>
            <p class="product__descr">${descr}</p>
            <div class="product__inner-price">
                <div class="product__price">
                    <b>Цена:</b>
                    ${price}₽
                </div>
                <div class="product__discount">
                    <b>Цена со скидкой:</b>
                    ${priceDiscount}₽
                </div>
                <button class="card__add">В избранное</button>
            </div>
        </div>
        `
    wrapper.insertAdjacentHTML('beforeend', productItem);
}