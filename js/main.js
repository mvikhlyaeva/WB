const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cartTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');

const getGoods = async function (){
	console.log('getGoods');
	const result =   await fetch('db/db.json');  //адресс сервера
	if (!result.ok){
		throw "Ошибка" + result.status;
	}
	console.log(result);
	return result.json();
}

const cart = {
	cartGoods: [],
	renderCart(){
		cartTableGoods.textContent="";
		cart.cartGoods.forEach(({id, name, price, count})=>{
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;
			trGood.innerHTML=`
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price*count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
				`;
			cartTableGoods.append(trGood);	
		})
		const totalPrice = this.cartGoods.reduce((sum, {price, count})=>{
			return sum + price*count;
		}, 0);
		console.log(cartTableTotal);
		cartTableTotal.textContent=totalPrice + '$';
	},
	deleteGoods (id){
		var countForDelite;
		this.cartGoods = this.cartGoods.filter((arr) =>  {
			if (arr.id==id) {
				this.cartCount(-arr.count);
				console.log(-arr.count);
			}
			else return true;
	})
		cart.renderCart();
	},
	minusGood(id){for(const item of this.cartGoods){
			if (item.id == id) item.count --;
			if(item.count==0) this.deleteGoods(id);
		}
		this.cartCount(-1);
		cart.renderCart()
	},
	plusGood (id){
		for(const item of this.cartGoods){
			if (item.id == id) item.count ++;
		}
		cart.renderCart();
		this.cartCount(1);
	},
	addCartGoods (id){
		const goodItem = this.cartGoods.find(item => item.id ==id);
		if (goodItem) this.plusGood(id)
		else {getGoods()
			.then(data => data.find(item => item.id == id))
			.then(({id, name,price}) => this.cartGoods.push({
				id,
				name,
				price,
				count: 1,
			})  )
			this.cartCount(1);
		}
	},
	cartCount(n){
		//if (cartCount.textContent=="") {cartCount.textContent=n; console.log("ff");}
		//else {
			var count = cartCount.textContent;
			console.log(count);
			cartCount.textContent = +count + n;
		//}
	},
	cartClear(){
		cart.cartGoods.length = 0;
		cartCount.textContent = '';
	}

}


document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
	const viewAllAccessories = event.target.closest('.view-all-accessories');
	const viewAllShoes = event.target.closest('.view-all-shoes');

	if (addToCart){
		cart.addCartGoods(addToCart.dataset.id);
	}
	if (viewAllAccessories){
		filterCadrs('category', 'Accessories');
		document.querySelector('body').scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}
	if (viewAllShoes){
		filterCadrs('category', 'Shoes');
		document.querySelector('body').scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

})

const openModal = function(){
	modalCart.classList.add('show');
	cart.renderCart();
}

const closeModal = function(){
	modalCart.classList.remove('show');
}

cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	const parent = target.closest('.cart-item');
	if (target.classList.contains('cart-btn-delete')) {
		//const parent = target.closest('.cart-item');
		cart.deleteGoods(parent.dataset.id);
	}
	if (target.classList.contains('cart-btn-minus')) {
		//const parent = target.closest('.cart-item');
		cart.minusGood(parent.dataset.id);
	}
	if (target.classList.contains('cart-btn-plus')) {
		//const parent = target.closest('.cart-item');
		cart.plusGood(parent.dataset.id);
	}
})

buttonCart.addEventListener('click', openModal);

modalCart.addEventListener('click', (event) => {
	if(event.target.classList.contains('overlay') || event.target.classList.contains('modal-close')) {
		closeModal();
	}
})

//scrool smooth плавный скрол

{
const scroollLinks = document.querySelectorAll('a.scroll-link');

for(let i=0;i< scroollLinks.length;i++){
	scroollLinks[i].addEventListener('click', (event) => {
		event.preventDefault();
		const id = scroollLinks[i].getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	})
}
}


//goods товары

const createCard = function(objCadr){
	const card = document.createElement('div');
	card.className ='col-lg-3 col-sm-6';
	card.innerHTML = `<div class="goods-card">
	${objCadr.label ? `<span class="label">${objCadr.label}</span>` : ''}
	<img src="db/${objCadr.img}" alt="${objCadr.name}" class="goods-image">
	<h3 class="goods-title">${objCadr.name}</h3>
	<p class="goods-description">${objCadr.description}</p>
	<button class="button goods-card-btn add-to-cart" data-id="${objCadr.id}">
		<span class="button-price">$${objCadr.price}</span>
	</button>
</div>`;
return card;
}

const renderCards = function(data){
	longGoodsList.textContent = '';
	const cards = data.map(createCard);    //data перебирается через map
	longGoodsList.append(...cards);        //...перечисляет массив через запятую
	document.body.classList.add('show-goods');
}

more.addEventListener('click', function(event) {
	event.preventDefault();

	getGoods().then(renderCards);

	document.querySelector('body').scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	});
});


const filterCadrs = function(field, value){
	console.log('filterCards')
	getGoods()
		.then((data) => {	
			return data.filter((good) => good[field] === value)//Если вернется истина, товар запишется
		})
		.then(renderCards);
}


navigationLink.forEach(function(link){
	link.addEventListener('click', function(event){
		event.preventDefault();
		const field = link.dataset.field;
		//console.log(field);
		const value = link.textContent;
		if (value == 'All') {
			getGoods().then(renderCards);
		}
		else filterCadrs(field, value);
	})
})

const modalForm = document.querySelector('.modal-form');

const postData = async function(datauser) {
	//console.log(datauser);
	result = await fetch('server.php',{
		method: 'POST',
		body: datauser,
	})
	return result;
}

modalForm.addEventListener('submit', event =>{
    event.preventDefault();
	const formData = new FormData(modalForm);
	formData.append('cart', JSON.stringify(cart.cartGoods));
	postData(formData)
		.then( response => {
			if (!response.ok){
				throw new Error(response.status);
			}
			else alert('Ваш заказ успешно отправлен');
		})
		.catch( error => alert("Произошла ошибка"))
		.finally(()=>{
			closeModal();
			modalForm.reset();
			cart.cartClear();
		})
})

