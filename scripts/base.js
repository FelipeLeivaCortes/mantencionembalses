/**
 * Only modify these parameters, to avoid any error
 * */

 var dayUpdate       = 15;
 var monthUpdate     = "07";
 var yearUpdate      = "2021";
 var version         = "1.6";


/* By default, the base.js will load the home´s content */
window.addEventListener("load", function(){
   ConfigureSystem();

   var items 	 	= document.getElementById("AdminContainer").children.length;

    if( items > 0 ){
        getNotifications();
        loadStadistics();

    }else{
        loadMaintances();

    }

    setTimeout(()=>{
        ShowNewFeatures();
    }, 3000);
   
});

function ConfigureSystem(){
    var idCompany	= sessionStorage.getItem("ID_COMPANY");
    var path		    = "img/logoCompany" + idCompany + ".png";
 
    document.getElementById("logoCompany").setAttribute("src", path);
 };

function getNotifications(){
    $.ajax({
        url:            "backend/getNotifications.php",
        type:           "POST",
        contentType:    false,
        processData:    false,
        error:          (error)=>{console.log(error)},
        success:        (DATA)=>{
            if(!DATA.ERROR){
                let numNotifications    = DATA.events.length + DATA.records.length + DATA.outstanding.length + DATA.suggests.length;

                if(numNotifications > 0){
                    document.getElementById("notificationsIcon").setAttribute("data-target", "#notificationsForm");
                    document.getElementById("notificationsIcon").setAttribute("data-toggle", "modal");
                    document.getElementById("notificationsIcon").setAttribute("href", "");
                    
                    var spanCount       = document.createElement("span");
                    spanCount.className = "badge badge-pill badge-warning notification";
                    spanCount.innerHTML = numNotifications + " !";
                    document.getElementById("notificationsIcon").appendChild(spanCount);
                    
                    $('#formNotifications').empty();

                    /**
                     * Alert to show the events
                     */
                    for(var i=0; i<DATA.events.length; i++){
                        var container       = document.createElement("div");
                        var commonMessage   = document.createElement("p");
                        var link2Document   = document.createElement("a");
                        
                        container.className       = "form-group";
                        commonMessage.innerHTML   = "Se ha emitido una alerta asociada al documento: " + DATA.events[i].nombre;
                        commonMessage.setAttribute("style", "float: left; margin-right: 1%;");

                        link2Document.textContent    = DATA.events[i].name;
                        link2Document.href           = DATA.events[i].link;
                        
                        container.appendChild(commonMessage);
                        container.appendChild(link2Document);

                        document.getElementById("formNotifications").appendChild(container);
                    } 


                    /**
                     * Alert to show the pending records
                     */
                    for(var i=0; i<DATA.records.length; i++){
                        var div             = document.createElement("div");
                        div.setAttribute("id", "alertRecord:" + DATA.records[i].id);
                        var content         = document.createElement("p");

                        div.className       = "form-group";
                        content.innerHTML   = "La guía N° " + DATA.records[i].id + " aún está pendiente";
                        
                        div.appendChild(content);
                        document.getElementById("formNotifications").appendChild(div);
                    }

                    /**
                     * Alert to show the important records
                     */
                    for(var i=0; i<DATA.outstanding.length; i++){
                        var div             = document.createElement("div");
                        div.setAttribute("id", "alertRecord:" + DATA.outstanding[i].id);
                        var content         = document.createElement("p");
                        var link            = document.createElement("a");

                        link.href           = "javascript:loadRecords(" + DATA.outstanding[i].id + ")";
                        link.textContent    = "Ver Detalles";

                        div.className       = "form-group";
                        content.innerHTML   = "La guía N° " + DATA.outstanding[i].id + " ha sido marcada como importante: ";
                        content.appendChild(link);
                        
                        div.appendChild(content);
                        document.getElementById("formNotifications").appendChild(div);
                    }

                    /**
                     * Alert to show the suggest
                     */
                    for(var i=0; i<DATA.suggests.length; i++){
                        var div             = document.createElement("div");
                        div.setAttribute("id", "alertSuggest:" + DATA.suggests[i].id);
                        var content         = document.createElement("p");
                        var link            = document.createElement("a");

                    //    link.href           = "javascript:loadRecords(" + DATA.outstanding[i].id + ")";
                    //    link.textContent    = "Ver Detalles";

                        div.className       = "form-group";
                        content.innerHTML   = "La guía de mantención N° " + DATA.suggests[i].idRecord + " tiene asociada una sugerencia";
                    //    content.appendChild(link);
                        
                        div.appendChild(content);
                        document.getElementById("formNotifications").appendChild(div);
                    }
                }
            }
        }
    });
}

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

function ShowNewFeatures(){
    var dateUpdate      = dayUpdate + "/" + monthUpdate + "/" + yearUpdate;
    
    var versionSystem   = " Actualización del sistema: Versión " + version;

    var headerFeature   = "Informamos a nuestros usuarios que en la fecha <b>" + dateUpdate + "</b> se ha " + 
        "implementado la nueva versión <b>" + version + "</b>, en la cúal destacan las siguientes " +
        "características:"
    
    var bodyFeature     = "<b>* Optimización:</b> Se ha aplicado optimizaciones al sistema.<br><br>";
                            "<b>* Mantenciones:</b> Se puede sugerir actividades a las guías de mantenciones respectivas.";

    $('#versionSystem').html(versionSystem);
    $('#newFeatureHeader').html(headerFeature);
    $('#newFeatureBody').html(bodyFeature);

    let lastUpdate  = new Date(yearUpdate + "/" + monthUpdate + "/" + dayUpdate);
    let today       = new Date();

    let dayDiff     = Math.round((today.getTime() - lastUpdate.getTime()) / (1000*60*60*24));

    if( dayDiff > 0 && dayDiff <= 2 ){
        $("#ModalNewFeatures").modal("show");
    }

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
        initMaintances();
    }, 500);
}

function loadRecords(idRecord){
    document.getElementById("title-page").innerHTML = "Guías de Mantención";

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

        if( idRecord != 0 ){
            $("#notificationsForm").modal("toggle");
            getRecord(idRecord, true);
        }
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