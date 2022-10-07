function commonSetFn(){

    var l_flag = false;
    $('.open').bind('click',function(e){
        e.preventDefault();

        if(l_flag === false)
        {
            TweenMax.to(".mobile-nav",0.3,{left:0,display:'block'});
            TweenMax.to(".cover",0.3,{left:0,opacity:0.5,display:'block'});
            TweenMax.to(".l_top",0.2,{y:9,rotation:45,background:"#fff"});
            TweenMax.to(".l_middle",0.2,{y:-0,rotation:45,background:'#fff'});
            TweenMax.to(".l_low",0.2,{y:-9,rotation:-45,background:'#fff'});
            $('body').addClass('body-overHidden');

            l_flag = true;
        }else{

            TweenMax.to(".mobile-nav",0.3,{left:'-100%',display:'none'});
            TweenMax.to(".cover",0.3,{opacity:0,display:'none',left:0});
            TweenMax.to(".l_top",0.2,{x:0,y:0,rotation:0,background:'#000'});
            TweenMax.to(".l_middle",0.2,{x:0,y:0,rotation:0,background:'#000'});
            TweenMax.to(".l_low",0.2,{x:0,y:0,rotation:0,background:'#000'});
            $('body').removeClass('body-overHidden');

            l_flag = false;
        }

    });

    $('.cover').bind('click',function(e){
        e.preventDefault();
        l_flag = false;
        TweenMax.to(".mobile-nav",0.3,{left:'-100%',display:'none'});
        TweenMax.to(".cover",0.3,{opacity:0,display:'none',left:0});
        TweenMax.to(".l_top",0.2,{x:0,y:0,rotation:0,background:'#000'});
        TweenMax.to(".l_middle",0.2,{x:0,y:0,rotation:0,background:'#000'});
        TweenMax.to(".l_low",0.2,{x:0,y:0,rotation:0,background:'#000'});
        $('body').removeClass('body-overHidden');

    })


    var menu_flag = false;
    $('.mobile-nav-ul li .menu_plus').bind('click',function(e){
        e.preventDefault();

        if(menu_flag === false)
        {
            TweenMax.to(".depth-two",0.3,{opacity:1,display:'block'});
            $(this).find('span').html("-")
            menu_flag = true;
        }else{

            TweenMax.to(".depth-two",0.3,{opacity:0,display:'none'});
            $(this).find('span').html("+")
            menu_flag = false;
        }

    });


    var m_search_flag = false;

    $('.m-serach-btn').bind('click',function(e){
        e.preventDefault();
        TweenMax.to(".mobile-search",0.5,{opacity:1});
        TweenMax.to(".m-serach-btn",0.5,{opacity:0,display:'none'});
        TweenMax.to(".logo.mobile_br",0.5,{opacity:0,display:'none'});
    });

    $(".mfield").focusout(function (){
        TweenMax.to(".mobile-search",0.5,{opacity:0});
        TweenMax.to(".m-serach-btn",0.5,{opacity:1,display:'block'});
        TweenMax.to(".logo.mobile_br",0.5,{opacity:1,display:'block'});
    })

}

function subMainReady(){
    TweenMax.to($(".sub-title"),0.8,{'opacity':'1','transform': 'translateY(0)'});
    TweenMax.to($(".sub-right-title .sub-title-border"),0.8,{delay:0.6,'width':'35px'});
}

$(window).on('load', function () {
    $('.footer-logo-client-marquee','.footer').marquee({
        speed: 100,
        gap: 0,
        delayBeforeStart: 0,
        direction: 'left',
        duplicated: true,
        pauseOnHover: false
    });
});

$(document).ready(function(){
    //공통
    commonSetFn();
    subMainReady();


    $("html, body").waypoint(function(direction){

        if(direction === 'down'){
            TweenMax.to(".scroll-top",0.5,{opacity:1,display:'block'});

        }else if(direction === 'up'){
            TweenMax.to(".scroll-top",0.5,{opacity:0,display:'none'});
        }

    },{ offset: '-20%'});


    $(".scroll-top-icon").bind('click',function(){
        $("html, body").animate({
            scrollTop:0
        },800);
    })


    $(".menu ul.menu-ul li").hover(function (){
        TweenMax.to($(this).find(".menu-line"),0.8,{width:$(this).find("a").width() + 2});
        TweenMax.to($(this).find(".sub-menu-list-wrap"),0.8,{opacity:1,display:'block'});
    },function (){
        TweenMax.to($(this).find(".menu-line"),0.5,{width:'0'});
        TweenMax.to($(this).find(".sub-menu-list-wrap"),0.8,{opacity:0,display:'none'});
    });

    $(".sub-ul li").hover(function (){
        TweenMax.to($(this).find(".menu-line"),0.8,{width:$(this).find("a").width() + 2});
    },function (){
        TweenMax.to($(this).find(".menu-line"),0.5,{width:'0'});
    });

});







