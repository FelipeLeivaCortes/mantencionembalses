window.addEventListener("load", function(event){

    var name        = sessionStorage.getItem("NAME");
    var lastname    = sessionStorage.getItem("LASTNAME");

    document.getElementById("user-name").innerHTML = name + " " + lastname;

    var aux         = JSON.parse(sessionStorage.getItem("PERMISSIONS"));
    var permissions = aux.split("");

    if( permissions.length  == "0" ){
        ModalReportEvent("Error", 12, "Su usuario no tiene ningún permiso registrado. Comuníquese con el administrador");
        Logout();
    
    }else{
        
        /*  The permissions are:
            * 1) Adminminstrator
            * 2) Mechanical
            * 3) Electrician
            * 4) Gardener
        */
        if( permissions[0] == "1" ){
            //Setting the role to the user
            document.getElementById("user-role").innerHTML = "Administrador";

        }else if( permissions[0] != "0" ){
            ModalReportEvent("Error", 13, "Su usuario tiene registrado un permiso no válido. Comuníquese con el administrador");
        }

        if( permissions[1] == "1" ){
            //Setting the role to the user
            document.getElementById("user-role").innerHTML = "Mecánico";

        }else if( permissions[1] != "0" ){
            ModalReportEvent("Error", 13, "Su usuario tiene registrado un permiso no válido. Comuníquese con el administrador");
        }

        if( permissions[2] == "1" ){
            //Setting the role to the user
            document.getElementById("user-role").innerHTML = "Electricista";

        }else if( permissions[2] != "0" ){
            ModalReportEvent("Error", 13, "Su usuario tiene registrado un permiso no válido. Comuníquese con el administrador");
        }
    
        if( permissions[3] == "1" ){
            //Setting the role to the user
            document.getElementById("user-role").innerHTML = "Jardinero";

        }else if( permissions[3] != "0" ){
            ModalReportEvent("Error", 13, "Su usuario tiene registrado un permiso no válido. Comuníquese con el administrador");
        }

        var role    = document.getElementById("user-role").innerHTML;
        switch(role){
            case "Administrador":
                var div1    = document.createElement("div");
                var div2    = document.createElement("div");
                var div3    = document.createElement("div");
                var div4    = document.createElement("div");
                var div5    = document.createElement("div");

                var link1   = document.createElement("a");
                var link2   = document.createElement("a");
                var link3   = document.createElement("a");
                var link4   = document.createElement("a");
                var link5   = document.createElement("a");

                var span1   = document.createElement("span");
                var span2   = document.createElement("span");
                var span3   = document.createElement("span");
                var span4   = document.createElement("span");
                var span5   = document.createElement("span");

                var text1   = document.createElement("textNode");
                var text2   = document.createElement("textNode");
                var text3   = document.createElement("textNode");
                var text4   = document.createElement("textNode");
                var text5   = document.createElement("textNode");

                span1.setAttribute("class", "icon-pie-chart icon-space");
                span2.setAttribute("class", "icon-users icon-space");
                span3.setAttribute("class", "icon-pencil icon-space");
                span4.setAttribute("class", "icon-spreadsheet icon-space");
                span5.setAttribute("class", "icon-database icon-space");
        
                text1.textContent   = "Estadísticas";
                text2.textContent   = "Usuarios";
                text3.textContent   = "Actividades";
                text4.textContent   = "Guías de Mantención";
                text5.textContent   = "Reportes";

                link1.setAttribute("href", "javascript:loadStadistics();");
                link2.setAttribute("href", "javascript:loadUsers();");
                link3.setAttribute("href", "javascript:loadActivities();");
                link4.setAttribute("href", "javascript:loadRecords(0);");
                link5.setAttribute("href", "javascript:loadReports();");

                link1.appendChild(span1);
                link2.appendChild(span2);
                link3.appendChild(span3);
                link4.appendChild(span4);
                link5.appendChild(span5);

                link1.appendChild(text1);
                link2.appendChild(text2);
                link3.appendChild(text3);
                link4.appendChild(text4);
                link5.appendChild(text5);

                div1.appendChild(link1);
                div2.appendChild(link2);
                div3.appendChild(link3);
                div4.appendChild(link4);
                div5.appendChild(link5);

                document.getElementById("AdminContainer").appendChild(div1);
                document.getElementById("AdminContainer").appendChild(div2);
                document.getElementById("AdminContainer").appendChild(div3);
                document.getElementById("AdminContainer").appendChild(div4);
                document.getElementById("AdminContainer").appendChild(div5);
        
                break;

            case "Mecánico":
            case "Electricista":
            case "Jardinero":
                var div1    = document.createElement("div");
                var link1   = document.createElement("a");
                var span1   = document.createElement("span");
                var text1   = document.createElement("textNode");

                span1.setAttribute("class", "icon-calendar icon-space");
                text1.textContent    = "Mantenciones";
                link1.setAttribute("href", "javascript:loadMaintances();");
                link1.setAttribute("id", "test");
                link1.appendChild(span1);
                link1.appendChild(text1);
                div1.appendChild(link1);

                document.getElementById("EmployeeContainer").appendChild(div1);

                break;

            default:
                console.log("Permissions Error");
                break;
        }
    }
});