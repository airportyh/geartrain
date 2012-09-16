//= require dollar

function hello(){
    return 'hello world'
}

function setToHello(id){
    $(id).html(hello())
}
