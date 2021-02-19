function ManualsInit(){
    var role    = document.getElementById("user-role").innerHTML;

    if( role == 'Administrador' ){
        alert("You are an administrator");
    }else{
        alert("You are an employee");
    }
}