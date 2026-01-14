var menu = document.getElementById('menu_list');
var altura = menu.offsetTop;
window.addEventListener('scroll', function(){
    if(window.pageYOffset > altura){
        menu.classList.add('menu_fixed');
    }else{
        menu.classList.remove('menu_fixed');
    }
});