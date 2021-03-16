/* By default, the base.js will load the home´s content */
window.addEventListener("load", function(){
   ConfigureSystem();

   var items 	 	= document.getElementById("AdminContainer").children.length;

   if( items > 0 ){
      var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
      var Variables   = "idCompany=" + idCompany;

      $.post("backend/getNotifications.php", Variables, function(DATA){
         if( !DATA.ERROR && DATA.count > 0 ){
            document.getElementById("notificationsIcon").setAttribute("data-target", "#notificationsForm");
            document.getElementById("notificationsIcon").setAttribute("data-toggle", "modal");
            document.getElementById("notificationsIcon").setAttribute("href", "");

            var spanCount       = document.createElement("span");
            spanCount.className = "badge badge-pill badge-warning notification";
            spanCount.innerHTML = DATA.count;

            document.getElementById("notificationsIcon").appendChild(spanCount);
            refillNotifications(DATA);
          }
       });

       loadStadistics();
   }else{
      loadMaintances();
   }
});

function ConfigureSystem(){
   var idCompany	= sessionStorage.getItem("ID_COMPANY");
   var path		= "img/logoCompany" + idCompany + ".png";

   document.getElementById("logoCompany").setAttribute("src", path);

   /*
    IN THE NEWEST VERSION, IS NECCESARY CHANGE THE USER THAT CONNECT WITH THE DATABASE
   */

};

function refillNotifications(data){

    $('#formNotifications').empty();

    for(var i=0; i<data.count; i++){
        var div             = document.createElement("div");
        div.setAttribute("id", data[i].id);
        var content         = document.createElement("p");

        div.className       = "form-group";
        content.innerHTML   = "La guía N° " + data[i].id + " aún está pendiente";
        
        div.appendChild(content);
        document.getElementById("formNotifications").appendChild(div);
    }   
}

/*  Depending what button was pressed by the user, this script going to load the content relationated with that file
    At this time, we have the follow contents:
        
        * Home          --> Any user
        * Users         --> Administrator
        * Activities    --> Administrator
        * Maintances    --> Mechanical, Electrician, Gardener
        * Configuration --> Any user
        * Contacts      --> Any user
*/

function loadStadistics(){
    document.getElementById("title-page").innerHTML = "Estadisticas Generales";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-stadistics.html');
    navbar.send();
   // navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText}

    var qr = new XMLHttpRequest();
    qr.open('get', 'stadistics.html');
    qr.send();
    qr.onload = function(){
        document.getElementById('navbar-container').innerHTML   = "<div></div>";
        document.getElementById('body-container').innerHTML     = qr.responseText;
    }

    ShowSpinner();

    setTimeout(function(){
        initStadistics();
    }, 1000);
}

function loadUsers(){
    document.getElementById("title-page").innerHTML = "Usuarios del sistema";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-usercontrol.html');
    navbar.send();
    navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText}

    var qr = new XMLHttpRequest();
    qr.open('get', 'userControl.html');
    qr.send();
    qr.onload = function(){document.getElementById('body-container').innerHTML = qr.responseText}

    ShowSpinner();

    setTimeout(function(){
        initAdministration();
    }, 1000);
}

function loadActivities(){
    document.getElementById("title-page").innerHTML = "Actividades";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-activities.html');
    navbar.send();
    navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText}

    var qr = new XMLHttpRequest();
    qr.open('get', 'activities.html');
    qr.send();
    qr.onload = function(){document.getElementById('body-container').innerHTML = qr.responseText}

    ShowSpinner();

    setTimeout(function(){
        initActivity();
    }, 2000);
    
}

function loadMaintances(){
    document.getElementById("title-page").innerHTML = "Mantenciones";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-maintances.html');
    navbar.send();
    navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText}

    var qr = new XMLHttpRequest();
    qr.open('get', 'maintances.html');
    qr.send();
    qr.onload = function(){document.getElementById('body-container').innerHTML = qr.responseText}

    ShowSpinner();
    
    setTimeout(function(){
        document.getElementById("idRecord").focus();
        CloseSpinner();
    }, 1000);
}

function loadRecords(){
    document.getElementById("title-page").innerHTML = "Registros";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-records.html');
    navbar.send();
    navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText}

    var qr = new XMLHttpRequest();
    qr.open('get', 'records.html');
    qr.send();
    qr.onload = function(){document.getElementById('body-container').innerHTML = qr.responseText}

    ShowSpinner();

    setTimeout(() => {
        initRecords();
    }, 500);
}

function loadReports(){
    document.getElementById("title-page").innerHTML = "Reportes";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-reports.html');
    navbar.send();
    navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText}

    var qr = new XMLHttpRequest();
    qr.open('get', 'reports.html');
    qr.send();
    qr.onload = function(){document.getElementById('body-container').innerHTML = qr.responseText}

    ShowSpinner();

    setTimeout(() => {
        initReports();
    }, 500);
}

function loadConfiguration(){
    document.getElementById("title-page").innerHTML = "Configuraciones";
    
    var qr = new XMLHttpRequest();
    qr.open('get', 'configuration.html');
    qr.send();
    qr.onload = function(){
        document.getElementById('body-container').innerHTML = qr.responseText;
        document.getElementById('navbar-container').innerHTML = "<div></div>";
    }

    ShowSpinner();
    
    setTimeout(function(){
        initConfiguration();
    }, 500);
}

function loadContacts(){
    document.getElementById("title-page").innerHTML = "Memoranda";

    var navbar = new XMLHttpRequest();
    navbar.open('get', 'nav-contacts.html');
    navbar.send();
    navbar.onload = function(){
        document.getElementById('navbar-container').innerHTML = navbar.responseText
    }

    var qr = new XMLHttpRequest();
    qr.open('get', 'contacts.html');
    qr.send();
    qr.onload = function(){
        document.getElementById('body-container').innerHTML = qr.responseText;
    }

    ShowSpinner();
    
    setTimeout(() => {
        initContacts();
    }, 1000);
}

function loadManuals(){
    var role    = document.getElementById("user-role").innerHTML;
    document.getElementById("title-page").innerHTML = "Manuales";

    if( role == 'Administrador' ){
        var navbar = new XMLHttpRequest();
        navbar.open('get', 'nav-manuals.html');
        navbar.send();
        navbar.onload = function(){document.getElementById('navbar-container').innerHTML = navbar.responseText};

    }else{
        document.getElementById('navbar-container').innerHTML = '<div></div>';
    }

    var qr = new XMLHttpRequest();
    qr.open('get', 'manuals.html');
    qr.send();
    qr.onload = function(){document.getElementById('body-container').innerHTML = qr.responseText;};

    ShowSpinner();

    setTimeout(function(){
        initManuals();
    }, 500);
}

/*
function validateNotifications(){
    var form    = document.getElementById("formNotifications");
    var idArray = [];

    for(var i=0; i<form.children.length; i++){
        idArray.push(form.children[i].id);
    }
    
    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany + "&idArray=" + idArray;

    $.post("backend/validateNotifications.php", Variables, function(DATA){
        $('#notificationsForm').modal("toggle");

        // To prevent load againt the notifications, we remove the event
        document.getElementById("validateNotifications").setAttribute("onclick", "");
        document.getElementById("validateNotifications").setAttribute("data-toggle", "modal");
        document.getElementById("validateNotifications").setAttribute("data-dismiss", "modal");
        document.getElementById("validateNotifications").className  = "btn btn-danger";
        document.getElementById("validateNotifications").children[0].className  = "icon-circle-with-cross";

        document.getElementById("notificationsIcon").children[1].className  = "";
        document.getElementById("notificationsIcon").children[1].innerHTML  = "";

    });
}
*/