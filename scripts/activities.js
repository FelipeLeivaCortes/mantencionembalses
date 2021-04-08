// Parameters
var carMaintance    = [];

var iconbtn             = document.createElement("span");
var textMaintanceBtn    = document.createTextNode("Previsualizar guía");
var maintancesBtn       = document.createElement("button");

$('body').on("click", ".downloadFile", downloadFile);

iconbtn.setAttribute("class", "icon-cog icon-space");
maintancesBtn.setAttribute("class", "btn btn-primary");
maintancesBtn.setAttribute("id", "maintancesBtn");
maintancesBtn.setAttribute("onclick", "previewGuide();");

maintancesBtn.appendChild(iconbtn);
maintancesBtn.appendChild(textMaintanceBtn);

function initActivity(){
    $("#ModalImagesRecord").on('hidden.bs.modal', function (){
        removeAllChildNodes(document.getElementById("containerImagesRecord"));
    });

    document.getElementById('activitiesExcel').addEventListener('change', handleExcelProject, false);

    document.getElementById("loadActivitiesBtn").disabled       = true;
    document.getElementById("addActivityFrecuency").value       = "";
    document.getElementById("addActivityPriority").value	    = "";
    document.getElementById("addActivityArea").value            = "";

    getSeasons();
    getLocations();
};

function getSeasons(){
    $.post("backend/getSeasonActivities.php", "", function(DATA){
        if( DATA.ERROR ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        
        }else{
            var select  = document.getElementById("filterDateCalendar");

            for( var i=0; i<DATA.COUNT; i++ ){
                var option  = document.createElement("option");
                option.text = DATA[i].seasons;
                select.add(option);
            }

            SortSelect(select);
            select.value    = "";
        }
    });
};

function getLocations(){
    $.post("backend/getLocations.php", "", function(DATA){
        if(DATA.ERROR){
            CloseSpinner();
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            var selectAdd       = document.getElementById("addActivityLocation");
            var selectEdit      = document.getElementById("editActivityLocation");

            for(var i=0; i<DATA.count; i++){
                var option1  = document.createElement("option");
                option1.text = DATA[i].location;

                var option2  = document.createElement("option");
                option2.text = DATA[i].location;

                selectAdd.add(option1);
                selectEdit.add(option2);
            }

            selectAdd.value     = "";

            CloseSpinner();
        }
    });
}

function handleExcelProject(){

    ShowSpinner();

    //Reference the FileUpload element.
    var fileUpload = document.getElementById("activitiesExcel");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
            
       if(typeof(FileReader) != "undefined"){
           var reader = new FileReader();

           //For Browsers other than IE.
           if(reader.readAsBinaryString){
              reader.onload = function (e) {
                  ProcessExcel(e.target.result);
              };
              
	      reader.readAsBinaryString(fileUpload.files[0]);

	   //For IE Browser.
           }else{
              reader.onload = function (e) {
                 var data = "";
                 var bytes = new Uint8Array(e.target.result);
                 for (var i = 0; i < bytes.byteLength; i++) {
                   data += String.fromCharCode(bytes[i]);
                 }
                 ProcessExcel(data);
               };
               reader.readAsArrayBuffer(fileUpload.files[0]);
            }

                document.getElementById("loadActivitiesBtn").disabled    = false;
            }else{
                ModalReportEvent("Error", 40, "Este navegador no soporta HTML5. Comuníquese con el administrador");
            }

        }else{
            ModalReportEvent("Error", 39, "El archivo ingresado no es tipo excel");
            document.getElementById("activitiesExcel").value    = "";
        }
};

function ProcessExcel(data){
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
         type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    sessionStorage.setItem("ACTIVITIES", JSON.stringify(excelRows));
    
    setTimeout(function(){
        CloseSpinner();
    }, 500);
    
};

function LoadActivitiesFromExcel(){
    $('#loadExcelForm').modal('toggle');
    ShowSpinner();

    document.getElementById("loadActivitiesBtn").disabled    = true;
    var data   = JSON.parse(sessionStorage.getItem("ACTIVITIES"));
    sessionStorage.removeItem('ACTIVITIES');
    document.getElementById("activitiesExcel").value    = "";

    if(data.length == 0){
        
        setTimeout(function(){
            CloseSpinner();
            ModalReportEvent("Error", 41, "No hay actividades en el documento Excel");
        }, 500);
    
    }else{
        var arrayNames      = [];
        var arrayDateStart  = [];
        var arrayFrecuency  = [];
        var arrayLocation   = [];
        var arrayPriority   = [];
        var arrayArea       = [];
        var arrayComments   = [];

        /*
        Is necessary to asure the struture of the excel data, to avoid any posibility of fail.
        */
        
        var error  = false;

        for(var i=0; i<data.length; i++){
            var j = i + 2;
            if(isValidActivityName(data[i].Nombre, j )){
             //   if(CompareTwoDates(data[i].FechaInicio, j )){
                    if(parseStringToDate(data[i].Frecuencia, j) != 0 ){
                        if(isValidLocation(data[i].Ubicacion, j)){
                            if(isValidPriority(data[i].Prioridad, j)){
                                if(isValidArea(data[i].Area, j)){
                                    arrayNames.push( data[i].Nombre.toLowerCase() );
                                    arrayDateStart.push( data[i].FechaInicio );
                                    arrayFrecuency.push( parseStringToDate(data[i].Frecuencia, -1 ));
                                    arrayLocation.push( data[i].Ubicacion );
					
                                    var aux1 	= data[i].Prioridad.split(" ");
                                    aux1[0]	= aux1[0].toLowerCase();
                                    var aux2	= aux1[0].charAt(0).toUpperCase() + aux1[0].slice(1);

                                    arrayPriority.push( aux2 );
                                    arrayArea.push( data[i].Area );
                                    arrayComments.push( data[i].Comentarios );

                                }else{
                                    error   = true;
                                    break;
                                }
                            }else{
                                error   = true;
                                break;
                            }
                        }else{
                            error   = true;
                            break;
                        }
                    }else{
                        error   = true;
                        break;
                    }
           /*     }else{
                    error = true;
                    break;    
                } */
            }else{
                error  = true;
                break;
            }
        }

        data    = null;

        if(error){
            setTimeout(function(){
                CloseSpinner();
            }, 500);

        }else{
            var Variables   = "names=" + JSON.stringify(arrayNames) + "&dates=" + 
                                JSON.stringify(arrayDateStart) + "&frecuencies=" + 
                                JSON.stringify(arrayFrecuency) + "&locations=" + 
                                JSON.stringify(arrayLocation) + "&priorities=" + 
                                JSON.stringify(arrayPriority) + "&areas=" + 
                                JSON.stringify(arrayArea) + "&comments=" + 
                                JSON.stringify(arrayComments);

            $.post("backend/pushActivities.php", Variables, function(DATA){
                CloseSpinner();

                if(DATA.ERROR){
                    setTimeout(function(){
                        ModalReportEvent("Precausión", DATA.ERRNO, DATA.MESSAGE);
                    }, 500);
                    
                }else{
                    setTimeout(function(){
                        ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                    }, 500);
                    
                }
            });
        }
    }
};

function AddActivity(){
    var name        = document.getElementById("addActivityName").value.toLowerCase();
    var date        = document.getElementById("addActivityDate").value;
    var frecuency   = parseStringToDate(document.getElementById("addActivityFrecuency").value);
    var location    = document.getElementById("addActivityLocation").value;
    var priority    = document.getElementById("addActivityPriority").value;
    var area        = document.getElementById("addActivityArea").value;
    var comments    = document.getElementById("addActivityComments").value;

    // Verifying if is a valid name
    if(isValidActivityName(name)){
	if(CompareTwoDates(date, -1)){
    	   if(frecuency != 0){

                var Variables   = "name=" + name + "&date=" + date + "&frecuency=" + frecuency + "&location=" + location + "&priority=" + priority + "&area=" + area + "&comments=" + comments;

                $.post("backend/addActivity.php", Variables, function(DATA){
                    if( DATA.ERROR  === true ){
                        ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

                    }else{
                        ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                        CloseModal('#addActivityForm');
                    }

                    //Deleting the data putted in the inputs
                    document.getElementById("addActivityName").value        = "";
                    document.getElementById("addActivityFrecuency").value   = "";
                    document.getElementById("addActivityLocation").value    = "";
                    document.getElementById("addActivityPriority").value    = "";
                    document.getElementById("addActivityArea").value        = "";
                    document.getElementById("addActivityComments").value    = "";
                });
            }
        }
    }
};

function isValidArea(parameter1, index){

    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 44, "El área en la posición " + index + " es incorrecta. Sólo se acepta 'Mecánica', 'Eléctrica' o 'Jardinería'");
        return 0;
    }

    var parameter2  = NormalizeString(parameter1);
    switch(parameter2){
        case "Mecánica":
            return 1;
        case "Eléctrica":
            return 1;
        case "Jardinería":
            return 1;
        default:
            ModalReportEvent("Error", 44, "El área en la posición " + index + " es incorrecta. Sólo se acepta 'Mecánica', 'Eléctrica' o 'Jardinería'");
            return 0;
    }
};

function isValidLocation(parameter1, index){

    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 43, "La ubicación en la posición " + index + " no está registrada");
        return 0;
    }

    var parameter2      = NormalizeString(parameter1);
    var founded         = true;
    var selectLocation  = document.getElementById("addActivityLocation"); 

    for(var i=0; i<selectLocation.length; i++){
        if(parameter2 == selectLocation.children[i].value){
            founded     = true;
            break;
        }
    }

    if(founded){
        return 1;
    }else{
        ModalReportEvent("Error", 43, "La ubicación en la posición " + index + " no está registrada");
        return 0;
    }

};

function isValidPriority(parameter1, index){
    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 42, "La prioridad en la posición " + index + " es incorrecta. Sólo se acepta 'Alta', 'Media' o 'Baja'");
        return 0;
    }

    switch(NormalizeString(parameter1)){
        case "Baja":
            return 1;
        case "Media":
            return 1;
        case "Alta":
            return 1;
        default:
            ModalReportEvent("Error", 42, "La prioridad en la posición " + index + " es incorrecta. Sólo se acepta 'Alta', 'Media' o 'Baja'");
            return 0;
    }
};

function parseStringToDate(parameter1, index){
       
    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 45, "La frecuencia en la posición " + index + " es incorrecta");
        return 0;
    }

    switch(NormalizeString(parameter1)){
        case "Diaria":
            return 1;
        case "Semanal":
            return 7;
        case "Quincenal":
            return 15;
        case "Mensual":
            return 30;
        case "Bimensual":
            return 60;
        case "Trimestral":
            return 120;
        case "Semestral":
            return 180;
        case "Anual":
            return 360;
        case "Bianual":
            return 720;
        case "Trianual":
            return 1080;
        default:
            if(index == -1){
                ModalReportEvent("Error", 20, "La frecuencia ingresada no es válida");
            }else{
                ModalReportEvent("Error", 45, "La frecuencia en la posición " + index + " es incorrecta");
            }
            return 0;
    }
};

function parseDateToString(variable){
    switch(variable){
        case 1:
            return "Diaria";
        case 7:
            return "Semanal";
        case 15:
            return "Quincenal";
        case 30:
            return "Mensual";
        case 60:
            return "Bimensual";
        case 120:
            return "Trimestral";
        case 180:
            return "Semestral";
        case 360:
            return "Anual";
        case 720:
            return "Bianual";
        case 1080:
            return "Trianual";
        default:
            ModalReportEvent("Error", 20, "La frecuencia ingresada no es válida");
            return 0;
    }
};

function aboutActivity(id){
    $.post("backend/getDetailsActivity.php", "id=" + id, function(DATA){
        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            document.getElementById("aboutActivityName").value      = DATA.name;
            document.getElementById("aboutActivityDateStart").value = FormatDate(DATA.dateStart);
            document.getElementById("aboutActivityFrecuency").value = parseDateToString(DATA.frecuency);
            document.getElementById("aboutActivityLocation").value  = DATA.location;
            document.getElementById("aboutActivityPriority").value  = DATA.priority;
            document.getElementById("aboutActivityArea").value      = DATA.area;
            document.getElementById("aboutActivityComments").value  = DATA.comments;

            document.getElementById("historyActivityBtn").setAttribute("onclick", "openModalHistoryActivity(" + id + ")");
            document.getElementById("editActivityBtn").setAttribute("onclick", "openModalEditActivity(" + id + ")");
            document.getElementById("deleteActivityBtn").setAttribute("onclick", "openModalDelActivity(" + id + ")");

            $('#aboutActivityForm').modal('show');
        }
    });
};

function openModalEditActivity(id){
    $.post("backend/getDetailsActivity.php", "id=" + id, function(DATA){
        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            document.getElementById("headerEvent").innerHTML    = " Actualización de datos";
            document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea editar estos datos?";
            document.getElementById("btnConfirm").setAttribute("onclick", "editActivity(" + id + ");");

            document.getElementById("editActivityName").value      = DATA.name;
            document.getElementById("editActivityDateStart").value = DATA.dateStart;
            document.getElementById("editActivityFrecuency").value = parseDateToString(DATA.frecuency);
            document.getElementById("editActivityLocation").value  = DATA.location;
            document.getElementById("editActivityPriority").value  = DATA.priority;
            document.getElementById("editActivityArea").value      = DATA.area;
            document.getElementById("editActivityComments").value  = DATA.comments;

            $('#editActivityForm').modal('show');
        }
    });
};

function editActivity(id){
    $('#ModalConfirmEvent').modal('toggle');

    var name        = document.getElementById("editActivityName").value;
    var dateStart   = document.getElementById("editActivityDateStart").value;
    var frecuency   = parseStringToDate(document.getElementById("editActivityFrecuency").value);
    var location    = document.getElementById("editActivityLocation").value;
    var priority    = document.getElementById("editActivityPriority").value;
    var area        = document.getElementById("editActivityArea").value;
    var comments    = document.getElementById("editActivityComments").value;

    if(id == "" || name == "" || dateStart == "" || frecuency == "" || location == "" || priority == "" || area == ""){
        ModalReportEvent("Error", 28, "Debe rellenar todos los campos");

  //  }else if(CompareTwoDates(dateStart, -1)){
    }else if(true){
        var Variables   = "id=" + id + "&name=" + name + "&dateStart=" + dateStart + "&frecuency=" + frecuency + "&location=" + location + "&priority=" + priority + "&area=" + area + "&comments=" + comments;

        $.post("backend/updateActivity.php", Variables, function(DATA){
            if( DATA.ERROR  === true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

            }else{
                document.getElementById("aboutActivityName").value      = name;
                document.getElementById("aboutActivityDateStart").value = dateStart;
                document.getElementById("aboutActivityFrecuency").value = frecuency;
                document.getElementById("aboutActivityLocation").value  = location;
                document.getElementById("aboutActivityPriority").value  = priority;
                document.getElementById("aboutActivityArea").value      = area;
                document.getElementById("aboutActivityComments").value  = comments;

                document.getElementById("container:" + id).children[2].textContent  = location + ": " + name;
                
                $('#editActivityForm').modal('toggle');    
    
                ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
            }
        });
    }

};

function openModalDelActivity(id){
    document.getElementById("headerEvent").innerHTML    = " Eliminar Actividad";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea eliminar esta actividad?";
    document.getElementById("btnConfirm").setAttribute("onclick", "delActivity(" + id + ");");
    
    $('#ModalConfirmEvent').modal('show');
};

function delActivity(id){
    $('#ModalConfirmEvent').modal('toggle');

    $.post("backend/deleteActivity.php", "id=" + id, function(DATA){
        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        
        }else{
            $('#aboutActivityForm').modal('toggle');
            document.getElementById("container:" + id).remove();

            ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
        }
    });
};

function loadCalendar(){
    $('#loadCalendarForm').modal('toggle');    

    ShowSpinner();

    // Parameters to get the calendar
    var year        = document.getElementById("filterDateCalendar").value;
    var area        = document.getElementById("filterAreaCalendar").value;
    var priority    = document.getElementById("filterPriorityCalendar").value;

    if( year == "" ){
        setTimeout(() => {
            CloseSpinner();
            ModalReportEvent("Error", 75, "No se ha seleccionado ningún periodo para la busqueda de actividades");
        }, 500);
    
    }else{
        if( priority == "Todas" ){
            priority = "All";
        }

        var Variables   = "year=" + year + "&area=" + area + "&priority=" + priority;

        $.post("backend/getCalendarActivities.php", Variables, function(DATA){
            if( DATA.ERROR ){
                setTimeout(function(){
                    CloseSpinner();
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);
                
            }else{

            //  In case that there´s nobody tecnician in the area, the system must inform it.
                if( DATA.WARNING != "" ){
                    ModalReportEvent("Precaución", "", DATA.WARNING);

                }

                var workersList     = document.getElementById("areaGuide");
                var profession      = "";

                $('#areaGuide').empty();

                for( var i=0; i<DATA.workers.length; i++ ){

                    if( DATA.workers[i].permission == '0100' ){
                        profession  = 'Mecánico';
                    
                    }else if( DATA.workers[i].permission == '0010' ){
                        profession  = 'Electricista';
                    
                    }else if( DATA.workers[i].permission == '0001' ){
                        profession  = 'Jardinero';

                    }

                    var option  = document.createElement("option");

                    option.text = DATA.workers[i].nameUser + " " + DATA.workers[i].lastnameUser + " : " + GenerateRut(DATA.workers[i].username) + " : " + profession;
                    workersList.add(option);

                }

                workersList.value   = "";

                workersList.addEventListener("change", function(){
                    document.getElementById("mandatedGuide").value  = this.value;
                });


                var form, formContainer, idForm, idContainer;
        
                idForm      = "activitiesForm";
                idContainer = "containerActivities";

                if( document.getElementById(idContainer) != null ){
                    document.getElementById(idContainer).remove();
                }

                formContainer   = document.createElement("div");
                formContainer.setAttribute("id", idContainer);

                formContainer.style.width       = "120%";
                formContainer.style.height      = "300px";
                formContainer.style.paddingLeft = "5px";
                formContainer.style.overflow    = "scroll";
                formContainer.style.background  = "white";
        
                form            = document.createElement("form");
                form.setAttribute("id", idForm);
                
                months  = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                            "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

                // Create the month´s container
                for( var i=0; i<12; i++ ){
                    var containerWeek1      = document.createElement("div");          
                    var containerWeek2_3    = document.createElement("div");
                    var containerWeek4      = document.createElement("div");

                    containerWeek1.setAttribute("style", "margin-left: 5%;");
                    containerWeek2_3.setAttribute("style", "margin-left: 5%;");
                    containerWeek4.setAttribute("style", "margin-left: 5%;");

                    var week1               = document.createTextNode("Semana 1");
                    var week2_3             = document.createTextNode("Semana 2 y 3");
                    var week4               = document.createTextNode("Semana 4");

                    containerWeek1.appendChild(week1);
                    containerWeek2_3.appendChild(week2_3);
                    containerWeek4.appendChild(week4);

                    var month   = document.createTextNode(months[i]);

                    // Here is added every activity belong each month
                    var monthContainer= document.createElement("div");
                    monthContainer.setAttribute("id", "monthContainer:" + i);
                    monthContainer.setAttribute("class", "form-group");

                    monthContainer.appendChild(month);

                    if( DATA[i].elements == 0 ){
                        var container       = document.createElement("div");
                        container.style.marginLeft  = "5%";

                        var textName        = document.createTextNode("No hay actividades en este periodo");
                        
                        container.appendChild(textName);
                        monthContainer.appendChild(container);

                    }else{
                        var items   = DATA[i].elements;

                        for(j=0; j<items; j++){
                            var containerRow        = document.createElement("div");
                            var check               = document.createElement("input");
                            var containerPriority   = document.createElement("div");
                            var textPriority        = document.createTextNode("");
                            var iconPriority        = document.createElement("i");
                            var activityName        = document.createElement("a");
                            var activityLink        = document.createTextNode( DATA[i].names[j] );

                            containerRow.setAttribute("class", "row");
                            containerRow.setAttribute("id", "container:" + DATA[i].ids[j]);
                            containerRow.style.marginLeft  = "5%";

                            check.setAttribute("type", "checkbox");
                            check.setAttribute("id", "idCheck:" + DATA[i].ids[j]);
                            check.setAttribute("class", "col-1");
                            check.setAttribute("onchange", "modifyCar(" + DATA[i].ids[j] + ")")

                            containerPriority.setAttribute("class", "col-1");
                            containerPriority.style.marginRight   = "2%";
                            iconPriority.setAttribute("class", "icon-circle");

                            activityName.setAttribute("class", "col-9");
                            activityName.appendChild( activityLink );
                            activityName.href   = "javascript:aboutActivity('" + DATA[i].ids[j] + "')";

                            containerPriority.appendChild(iconPriority);
                            containerPriority.appendChild(textPriority);

                            if( DATA[i].priorities[j] == 'Alta' ){
                                textPriority.textContent    = "Alta  ";
                                iconPriority.style  = "border-radius: 7px; background: red; color: red;";

                            }else if( DATA[i].priorities[j] == 'Media' ){
                                textPriority.textContent    = "Media ";
                                iconPriority.style  = "border-radius: 7px; background: orange; color: orange;";
                            
                            }else if( DATA[i].priorities[j] == 'Baja' ){
                                textPriority.textContent    = "Baja  ";
                                iconPriority.style  = "border-radius: 7px; background: green; color: green;";

                            }

                            containerRow.appendChild(check);
                            containerRow.appendChild(containerPriority);
                            containerRow.appendChild(activityName);

                            if( priority == 'All' ){
                                if( DATA[i].priorities[j] == 'Alta' ){
                                    containerWeek1.appendChild(containerRow);

                                }else if( DATA[i].priorities[j] == 'Media' ){
                                    containerWeek2_3.appendChild(containerRow);

                                }else if( DATA[i].priorities[j] == 'Baja' ){
                                    containerWeek4.appendChild(containerRow);

                                }
                            
                            }else{
                                monthContainer.appendChild(containerRow);
                            }
                            
                        }
                    }

                    if( priority == 'All' ){
                        
                        if( containerWeek1.children.length < 1 ){
                            var containerEmpty  = document.createElement("div");
                            var messageEmpty    = document.createTextNode("No hay actividades en esta semana");
                            
                            containerEmpty.appendChild(messageEmpty);
                            containerEmpty.setAttribute("style", "margin-left: 8%;");
                            containerWeek1.appendChild(containerEmpty);

                        }

                        if( containerWeek2_3.children.length < 1 ){
                            var containerEmpty  = document.createElement("div");
                            var messageEmpty    = document.createTextNode("No hay actividades en esta semana");
                            
                            containerEmpty.appendChild(messageEmpty);
                            containerEmpty.setAttribute("style", "margin-left: 8%;");
                            containerWeek2_3.appendChild(containerEmpty);

                        }

                        if( containerWeek4.children.length < 1 ){
                            var containerEmpty  = document.createElement("div");
                            var messageEmpty    = document.createTextNode("No hay actividades en esta semana");
                            
                            containerEmpty.appendChild(messageEmpty);
                            containerEmpty.setAttribute("style", "margin-left: 8%;");
                            containerWeek4.appendChild(containerEmpty);

                        }

                        monthContainer.appendChild(containerWeek1);
                        monthContainer.appendChild(containerWeek2_3);
                        monthContainer.appendChild(containerWeek4);
                    }

                    form.appendChild(monthContainer);
                }

                formContainer.appendChild(form);
                document.getElementById("body-container").appendChild(formContainer);
                
                setTimeout(() => {
                    CloseSpinner();    
                }, 500);
                
            }
        });
    }
};

function modifyCar(idActivity){
    var check   = document.getElementById("idCheck:" + idActivity);

    if( check.checked ){
        carMaintance.push(idActivity);

    }else{
        for(var i=0; i<carMaintance.length; i++){
            if( carMaintance[i] == idActivity ){
                carMaintance.splice(i, 1);
                break;
            }
        }
    }

    if( carMaintance.length > 0 ){
        document.getElementById("containerBtnMaintances").appendChild(maintancesBtn);
    
    }else{
        document.getElementById("maintancesBtn").remove();

    }
};

function previewGuide(){
    document.getElementById("areaGuide").value      = "";
    document.getElementById("mandatedGuide").value  = "";

    $.post("backend/getActivities.php", "arrayIdActivities=" + carMaintance, function(DATA){
        carMaintance    = [];

        if( DATA.ERROR ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        
        }else{
            var table, idTable;
    
            idTable     = "tableActivities";
            table       = document.getElementById(idTable);

            ClearTable(idTable);
            
            var bodyTable   = document.createElement("tbody");
        
            // Create the rows
            for (var i=0; i<DATA.COUNT; i++){

                // Here is created every row
                var row         = document.createElement("tr");
                row.setAttribute("id", "row:" + DATA[i].id);
        
                // Here is created every cell
                var indexCell           = document.createElement("td");
                var nameCell            = document.createElement("td");
                var locationCell        = document.createElement("td");
                var priorityCell        = document.createElement("td");
                var commentsCell        = document.createElement("td");

                // Here is storaged the content into a node
                var index           = document.createTextNode( i + 1 );
                var name            = document.createTextNode( DATA[i].name );
                var location        = document.createTextNode( DATA[i].location );
                var priority        = document.createTextNode( DATA[i].priority );
                var comments        = document.createTextNode("");

                if( DATA[i].comments == null ){
                    comments.textContent = "No registra";
                }else{
                    comments.textContent = DATA[i].comments;
                }
                
                // Here is inserted the content into the cells
                indexCell.appendChild(index);
                nameCell.appendChild(name);
                locationCell.appendChild(location);
                priorityCell.appendChild(priority);
                commentsCell.appendChild(comments);

                // Here is inserted the cells into a row
                row.appendChild(indexCell);
                row.appendChild(nameCell);
                row.appendChild(locationCell);
                row.appendChild(priorityCell);
                row.appendChild(commentsCell);
        
                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }

            // Here is inserted the body´s table into the table
            table.appendChild(bodyTable);

            $('#guideMaintanceForm').modal('show');
        }

    });
};

function printGuideMaintance(){

    var mandated    = document.getElementById("mandatedGuide").value;

    if( mandated == "" ){
        ModalReportEvent("Error", 69, "No se ha seleccionado ningún encargado para la guía de mantención");
    
    }else{
        document.getElementById("printPdfBtn").disabled = true;

        var table       = document.getElementById("tableActivities");
        var activities  = [];

        for(var i=0; i<table.children[1].children.length; i++){
            var idSplited   = table.children[1].children[i].id.split(":"); 
            activities.push(idSplited[1]);
        }

        var arrayMandated   = mandated.split(" : ");
        var username        = ParseRut(arrayMandated[1]);
        
        var Variables       = "username=" + username + "&activities=" + activities;
        
        $.post("backend/addRecord.php", Variables, function(DATA){
            if(DATA.ERROR){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

            }else{
                margins = {
                    top:          70,
                    bottom:       40,
                    left:         50,
                    width:        550
                };

                let finalY      = margins.top;

                var doc     = new jsPDF('p', 'pt', 'letter');  // optional parameters
                var imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARYAAAB7CAYAAAHGV5/pAAAACXBIWXMAAAsSAAALEgHS3X78AAAgAElEQVR4nO19C3wU1fX/ubOvvMANEF6JsFGoL4TloYgvNhWbah8k/tr6qiVRTLD9tYRf//76s62G+Ku2am2grUBQm4CK9vEzsbW2aG2CWhRRE/AJBbOg4RnIQiDJPmbu/3MfMzuzO7M7m2wgwHw/n9mZnbl35s6de88995xzzwELpzwmXPzdRs/k2zHBSX2XCVfdjT0z76KFOBaMnLzCjC57Eo/91q+VAsz57evawuQXmyuc2XSp4Pz7/hxbmKXKZq5QzXzvUZ3zJMgBcNXKVfjyVWvw7FV/1Dz8jvq4wvh0HujTHMtb9FwJ33s1aVQQ5MO5K36FO96U/BsXLUDk/6y6F/GMulcb6cVgBM5ZsLJZla8Z8otrVQ+qhY71Laq3bab/yZ5db4WO9U38s9UqaeTrHHb54ONNw2HU8M2em1fPW/psxTeRfH7a6jex1LsbfDNH+D5do6mLKgBYohznF2+BjvUNcTXGoM75gkEaUB46qeZaPDkXw+QRGMZkY8iyS5Bpx5Bpl/w/W5jnueK7pdDwo9uQ0Y2SIr+4CwDc0LHe8B5KzZwVdMH7j58NbTYn7G1brmQY512Ms4U9IPWGylN8eDutkY71rJF3rM9NlkVpM7v2/IdfCocAQQTyzq/EdLvixzgDeuHSG78Ia5feEf0EsV02v7hecy6/mHxCDz92K3m0acj/RvVtNFWWd+dT2ObfATg7B6ThbsjctQOEnmPg3/xY/z/PQDH2W79uHv+1n5/cIcCChYFi4gUVJ5SXEYwuTLxsMbY5RLhizXtwecO75kbndCNv4dquMbeuUmrjlqdfxr9o3m6Wf9EvdH5xmZm0cTVz8Inv5O5/ZpFC5EY4xIs2ftShvolXc0O2VfEzAeUhUVZBnd4Tc02/8Fev/A2+YuUT+LJV6+JqYfIPnlaT8SgfEt0vVV13G/AzS2PyxPEzFL4VD7sv+tFv6AMvW7XOe+mqRjyzbr1SgNvrnteOKaAaa9T/1Q+LTQsx41PsWCV/pg/fHdt1vKMDipfPWzoj60n/24tK0buVxci7+jWaGPeFtaUn1ZyAFTCJZbHJ6A1H3nMtnpSLYVIuAOFpshwSZDFeBu4ofg2VPfQUHhAvI9cEeQH2Im16SSg/k5cFDbvXXVS2J9wL/3RkKvzMuGk/KBs/bSqWeoOpPLQeOtbH8z7RmiRsZ5FeVvqZPrn3lfJIXx9IhJvp61P4mcill9RnRI6BGAzrs5Psu9dqzsUWhHB4UZ5mqYpVhdi8mqoffdtqLBw6CHjYcMBZOZC5bSs4wn2wY/PKk8fPjLvhUVzw5ZpGE0ktWLCQJjTvPIBlnE512i9KVnDFPRhFwiD0HgdbsAeufvhuqP/6RYAQOnmUMc2wm73duG8uK0GhUCMKhwDIfDyEG3ZtWknHoOzPK/Ebuw7DjX/Ygn//rWmnTeWYwqi7nvPlVTyj210qnvvbyxc++Hf80xe36ncnIrQirG8sA6gVSJTpCChkLrU55n5Yhw1v1qRjz4wVlDQr+dV7Heh+3atX/saLwdEaCrkg8Hn29G2PfEuXJ1Nj4doX8esf9MK2h79pvsUQFgygLA3Ma9oRVyAi7sTIARgcIIEdyLEE7D8GO0jIAe9UfjUu3x1PNOEj3WFo+6S7aEfd7S0xFRD/ZRgjjJW93vVofl+sSNQgXex92ugkDsCnpItNY/BRNDSmaMXD+KM3cyAr1AMAIrT/viou06y6Fz1kLiVXUlvF1TQNDkZguBMg1xZu7idRL4SO9X6l8KR7yELJeBTFVZT8wtEKaKYVAtBicI+E0FTM+zvawTlxB2RnAozIwOCdOw+P4MfDXQB2AYNDeBQcAm5a/NWWUmCyaveWijmBtqY3YeqXZ8KUScNgs9ETjVoHwHQAaIf8Yvl/IEGlgKZS4ulI9L+6lcSeT6Jb0XzZgnuvxSMzMZDKOLixEAI7XSA5MwN73nokoRiZTGzOeu3vcPmdX6d3XPOTspNPM2T6BcbdJRHiMoz2VWO0fz/YxSAgmwBhcCS8gXTlFTD8jZfhLHc2XPjF6fD0A5X6hSCjktxVQBGXV0PH+iWabiDTHW3edipm19Il1tVY3iKuyiHHTdCxvpQfN9BpLelWHeuLuPCoTZW2UFMmFXRfYlTlOiy8txlsAgCy2wE7nABOF2CXC3BGBmBXJuDMTMh6/x0QQiEgvM3s0ivg2ftvP214mIQvMvr2hqUoEq5G4TCgCKmAMK0E9SaEw0X+Tb/uF4GzYMGCBQsWLKQVlT9Zq0jq/rD1s3iV3pmGiRctwhPPW4gfeG0HrZRdgZ7TRoSZMjeaf9VP3CgS6SLiS0f3YZh4zRz4528r2M1OE/GloepeDwXzqlvtUm+XXTwO9vAxAAHn5l45peiv/+4E8TSSdZuX55Y+inE4BKJNoGz+Z/98gLaKT29e0/LvxzbCuOzEE8lTCaZayujbG7CUMwzEYcPpJleIDKkvCFv3BIxvwIzN3AbXjJuYnqmDVt67NOaaJ07u2w+YqpQDvytDYvYwELOHle/905I4umELB+HlD/fChQ/8Tf/FmfFjLRdCGwnBsYHpqZ7gqJ3/q+bCbTmfR5NPnV8tENe7rwqmaUrnqpvRwSe+o6uuv7RAgtZPD4LUF6o2yC7bEdToCIFk+4Eabt4qF5rJT1j6WBuEGlWepVwkSeBXWaLWqPY11GhC27LKjQRSuievWvkYJoLs3mOZTe/efVupwYsqkKX9AkLw8UPfSEXiT75ULnSsT9D3TjziCO3clcuxxI8zciIlc1Y9TQXYvV2oYcs9N+pbzIoSzDrXCW9/2G308tFuIbcGdq5IqRBmz+XRldnGdismSfNxqVogJu1SKsjWPifAW4qHP0PO79eTxGm6z4z7HjO0S3fl2ssuqfsznlX3UhznikVck2HDgIMho+zNysb6sltj6c1aTD2nEfGWM+r8UWE22asVZzKNqFaeE00n368sJr8uF66plOFjeykBa28R4Y27KtC/7ipHby76NqJy0CjqZ9S9oiFQTy6cv5S0li8UuIwqhRHIaB+OGs+o5bXR61U6d4hNo4c2TRo9a0IT0HSfwEEn7N3ugCzQGmO9tegmha7MqnuJWrBPr2vBGNmnt1VcSTWMOCLB2BEJKkU7ghT1a1lHrN4nHjUxZ+an/Ax1Syla8Qv3Hv8wyDh2FGw5fph5z63NJSvmLb2jfp6mP79TeX3ue5XXIqaAQq1TV79FmzCOiHQzhPGLGK1niEfylsJaoDz8Eik/g/wORqOjBkpL+WDLBK80th7sEwFymT7Il2UHX6YdV9/3p2vAZSMKMrbZBZj+/a/46FA6dfWm9rOL719OKiTpzEdWWaibNVNJlMXxInqIbynNKsUa0Vd16bRAooBTK+Wnm64UaUQ9ZNgBshwA2XyTjx0CgA2xTaB73Pr436+mmsTyL81GBUX3YiAtJVFlxB836F5Plj/RufziUhW9ks0WPabzc2gufOH+azFRnRKtYdsz0wGJEejYXJuwwOMvu7ve3nO0rOhbcwAjgLVDQWMIpuiPITSjT5YDw651F0HrkxeBrfsISGGJruoh1rB6NyDXwudfUObsOQI4EgEIR9L7YjK0851avk9sdK8dheKnDwmgqZTPdy8EKRgE3NdLXxIH++h/KRSqH3PBIhy7RS6eAhlvbwQsCCCFRbLp27owOtJq+KLa87Ux/32cXsgvu0QnT7OSVmva7otJ16iaE7WDATSV0rnyJiRNnAgSBsA2AQQ7onRCwjh+m30pVac67BhAsAGWJKJX1idi7KsZEzhtBcXyKM2Ua41ZnqXJS4Z4Oa3+aCYzbF7VsG3IqMb1t1F3PefG2z7pcnZ3cZ0yobROplN2ZQBkZIKUkQk4IxNy3nmDylYyHAg+3lx32uiU42bJnStvCgiTJk+PTJ0B0rBhgLOy2JbJNlIhrs8+pYp20m1AEODi+VcmXQV4KiGxor3sd1irYA+DoFG0h2HXm4lHp9OuUmSMvfmxMhQO16sqo+jzV2osiwMLFixYsGDBggULFiwkw2s797d294WpEdC+oz34H9v31luVZkHBxPMW+jyTyrHnnAV42uzF+Hfv7sZqNH/aaTnSGYIwbduUDpw9a0kXSJKbCDPJBpIEge4++NeWXZDpdMBNU8bSp/gKR54RlX+qISXrwP5g/Lz7q86++h7smfU9bA8fcztC3eAIHQFHMADOvi5w9h5aciBreM26Dw9oNGxfe25LSroKC4OPQZG75n/1QTeIYhcSRUCSCKDe0+NIwL/pNxoh+NS6TTjbIcDa+RdClsMG1z27pWVr5WxdlzIWTg7SSlnGfLuuecwtK7CYM7xLymGWp6JqL+UMm04UA7ENBag3x17o7u6Fl7cfgC17AlA8YXj/KEsyB6LpgpEvrdTKapyfWJpEXSANfEnEQMuaTp5l1F3PlokS9lEKIkmcktB92/6nDZStKpx3VhA2Bmyw4rWd8J1ZBVCQnWLRmLZ5DT8OcGcA1YpNldYpgF+1ALhZMflh/33c9MdnYAxSxa8H+PNauNY6QJW2+nnIDG8LN6JrVTkYZX4CWKPo4ueWQMf6ZdyKr4av3V+gKIujptWxjg78GqMUdo7k3cBNL6M+CZi31QA3kzRNvdPWWDpX3tyQki1XDAQs/eS8XPGBj/dhaPjXTrh6Uh5cUPPXko+rv9Jk8hY+3jAaqQk4c8zbrNujOtYXqgxcZAM9tRa/lFY8yau2iGaYCwDLiSsEXuHAtfnGBsnMnIs5CdY3qPHyj72cG/LF+bnTvCcra6ydbaGOqUeskaAMN7foTsnd2ZDSFS986q/4/V1hONIjUQtvEWP/tgdvKBwCRRt8RD/0kLNSl2GKssx44AlPzojedkxZHBuQvXKMyLENgseEwLEOVLS99uakDn4MIWKYUmCHNz88BtxIdXD4D2Z5ygywhorDoCHouCgWSRvLFcuWd9ldx904CS/szAH3iPNQ6+xVf+QNSSANqWFz5XzTDsQRlt4GCS6dc34WbHivy0QOFZLbehephpRW3RSJ77FM1zIvmtfY2ZKMeHc4RTrDnHy/Lj5c6KFJMbFW81xsSUeR6h5LNabX8c+vSeL+R4OELcC34pfY7hT1CtzCx9gkQGUkSMCsupeoc90ZdS8bvTyFFBZ/hEU2xZ47bTjgviCce8fq1J03y7al2t7abLjujjCt2kqcrsovU8rYNObLkNzWXl0WH3+OXFelqvwyT1gyKPEtksCQsvhWPEyZn+BxAfytDhAkCVw2spxKgvZnvp+Ug750VWN9/Pob1DWj7lU6bLVW+uIq78mK0pbbV/6f8n/urJHQ/MYe0jP65+07dp1h9MPHQm3rW6TxX0xMY2MjFrDZSrJnx35MYyqihbpBl1NGPVqWcv5Osk/u2HVUgwrDxhLssZfs/MBNp8Cu8DHaWDB3cO254Zdu//P/LyET9vai0vLYNZQz6l5plV+Uec2m/E/5loo50VmUZkUNgqtm5UH7MylWQfyHalKtjEkGbxJXc2Z5stgOZTZfQEVV5urMMNUd4IjJe4Jq5tZv6JLGvIpnfCBJzYCOAuQ1sYUydoBMB/FGDmxzsH3seZKWLZzBDTYEy39U8k/DSvKu/hdhmj2Ex9laMZuW5epbH8DnzjoH1EuO6qtuSk7C9V3otauY5IAi3zByt5ccfjpF1X9+f3iWgUD/fRI9Oz5tSjyLLmXBmdvdOGsj/ehyo6AheBy8cdj1z7tstJHwFVZQJiBc9qu/FKnOsb2AcMCGYMnC4is0FZ//tYfwnk2tcK7XA1jWFJn30BFPDZjsoUpZhCh709NPK1dmFReCyT24iQvKkvFoAZPOL5OnkZlUJrmVTTbk+8eXJVp28uEXqyiTHlOufr4JvjMKwy8x5ifXYrlRsPgG6gbCjqHHDiNGhJdl2mGLywb++/7j1biKWPaizysgcNsQpnsB4bk2BD7eaEijarht3uvl465/sEs42u3O+mwbXL6IRN3CSvHW3POdM8vrsh60s554nICptyHPki03DAcGl2QD//PngxiysUyhXvoxI84skNc87X3nV7qFrfpqizwM6faocbP+q3Xsl4oxmflk7v0UgMht1Kv20MDH2pMOs0xxIqQglh8sJGyNM39+Pe5Ypx2i7ZE+lg0hiNic+hkxaRi4Zt8HK5QGMnbKd30AyEfJJIrKD8SZMwF1BWDYtveoRhokEebcMo+XDMFT999pdsrJ9CtGDmG1aePXsqqdV+s5oU7Wc6O6mDVKSD41H6MdKkDhFaLP9Sm6LHa+RBHHGznFTlbOaNpyVZmi/qJTbIAJ5Sy7W64qjFx5FfE4QzfU28t8AIjMeMkmhpRrmi0Y8knBcPPoyXdieSP/pWCoWgqG3CSNOG0aiLMvA/TZZ5Dz6QeAyQpPwQYTvV+gy19xSDTfUFglBeh4Lnv0TZwW8dBRyTWxLK0/iYYYqyhnvSpvi+oexmAN3RMzY2nkon8U5/+J3a8mpkwtmhkY43caeFq1fq1cV7dkAqY+xqhFz2LYsgWgpwecOESHCuCLM6nLZMEGYLNBJBgBSW/htyCAMGY0wKhRgO12AIcDsN0BOZtfU6iJbPsyu/RKWqx1D6TQUKIVhFPl8C2Yh+kPMmrROi+ScCsE+wDt3AaUe+ENBttsvMHYaeOhDYIckyXSdO9g5+wOEIK9kLHzE6WByIZR5HjadbPAleXKfa66/NTnU05D9IuDzlu4FjOKICkWcGT1M8YSYECAZKpDzgf76KY0DhUVUVnQBfzvrjytlo+fjhjwdGv0gidqkSRVKR+eNgYp3pxS2Utyoynd/fojZm1VLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwcKbglW17ve2HuqmDsLAo4Y3tB/HL2/YmXIhm4eRh0D0/GeHrtz1Se7jzSKvDzu16BQRzPKPA6bCluG7VwmkNz+TbuzznllEHhKve9uO+iKhxQLhykz92JaGFIYATSlkmTP1P94Qpd2HscLixg1nPPf9YIzy2aZcm3eFgpMRqHEMPJ6yxnH3JD8uww95F7W/5Ro63vf0x7DmmjaF4uDcyd8jX3BmIE+LatODKH7diSfKCJFBTTGKHSxbY2yK9ABjDob4I7D7SBxPOyqDp87JdlqfKIYjBd216TQ0WIr1eR89hcPYcBsfxQ2APdoM9eBSESB98un0tOtQrwqr3OpQ8E9yZp1YtniEYNMoy/ssPeO293a0Q7KYrR0jwM8xtcbEYIXa4LTs/qKfrXAhl2bD7CAT6IpDlEOC8kVln+ncZkhgUypJ//c/qBYi0Sk4nYKcLJL6RiHl073SVfsobCkEG9MKxYAT2dvfB3mNBOHtYgui+Fk4a0k5Zxv3Hr7qwKLoxX/KBVUtAMHOanLvrteWadUF5zmDLweOCb9Xmz+GWqWOp02QLQw9poyxjvvO4e8ytqzB2utycenAqkkE3yZkR+Kz552j3aw/HLSAbbhc3kAiv/9xxEPYf7YN93X0wZflrQ91p8sBWPaqdIutf96mOB/osTzrqJS2NJa/i6TLJ4ezCTqc8zGg2yelc1vHST40XkWHcIsdR39/dRxsMjoipNxa2fNUw7K5BnqX9/BimYqrzcOaNccfM/0si1Yb6/c09yxiedHj+TEtjwTZ7E3Y4/djhAuxwqqiKCySHc/re539o7OURAB6/sbhlXFaYugj7ywd74cDRPnJsXtbCemmjJuZzNGZztDGwmNJdfC9XXrXmY7Dr7YaxnlneZp1zXbo+3pj3AlnIWK9yV7ZA+YDRMqm9Muk3EBITm6X16bxTCT9Xq5yPQk7v486kU/ZAlZbGQqIdd666ufDg6lsRdjhbJNJgHE7Y/1QF2r/uLlO+1ArdbJa088BRONjdC6MybalQllb+EZIHtmKutWpUzhFrYjxRu5P2RK370CruQalNJz63DL+OM0Q13Kac8bBhS76P2mVpLveMsJifqeIeLvWoubc/HhRgMBjczpU39cvpDJaADkMEOw90Q7YtpZW1bfxjlKt6sezjZEFCV+kME2P+FyX0Dxfv6mIxb3AbDHIU8eHR2CewTBUSo4q7z0jmOCDAG3GbjofMWl4fKUeMO2la5zhgDONyMG0w7+8+TNdEmwaLzF/NnSGz3sR6qpe74JCpm0xBWhR/Ksw9h1o5Vc57nhGPVai5zu5dw8/pe3diPuBqFIc6DGsUn26yvxgt1NSuRlXWLbS8xM2p9p38SqALRlHUVMivel+5XhKyBnoYMr7aKp7+6wEJQ94bHwfp/wkjs+HlHxafGb7kBuCN6UTC9Me4auVvuwBsbtlvf/C4KxDus9ds+ektA/OVxrFw7YvUyfLm7X3QF8I00IOEceG2h7+ZkkdF04gyeG2cMllIAlPD0BW/fizOj7wrO+LOHhmqnbNqLb5sxTN42gPPDihqqh3BKyABTC900aFIDEcARwbJVCE6S2iwGop5JGVwL//Vb+ttDjFhoAei+8kcCWWzV/2+TAoLgWBAmr713htTogiRCH6JeC4kXseIgI5jbpLYOwxsGqw3ewloXKuDktaY4WWMstxI/TF8RqIyJJthBDjvEJ0VJXPPri1LgDfuQEya6HNj76d3LVH6JEg4DE36boM7f0qgi4WJ0QkfwyJ/6J8njsQQyt1c+XXTLr/uePIFTIrUFxJh0wdHCdMb2LGiLLlHqNjoF/GIesbWi5Rh5h7mvFUmQgtnRqOzLKN7qj1V6iMak8jIe6XRtUTpkyDhMDT+gsMDtIdFXbPq/mr+HhjTOXSGAzEf/qKULuNtT4yASovkjc2su/aBg/X8ZBHGToqdsmFj8a14xCPYdOvHrNtxGe6ZdX/HM+teTh7BQsLKNm1yjno4Sg3RkCtquUaihqduKG2q/FoXqSzWoRkU6YSQMTvLUct3AqqyaCkskeSeYCTiWZTCSBGA9o0iOB0CtK+t1B0WLlv1rBxo0uijVM2o+0cVBiG3tfKL+kOTxBonRgDuHLsipOs3CL9h/gMzqBleIh/JL16iCjFTllCwlm6oJbBk2MkvVgsLT7hRe6JhiH70ne+4YMdGGzi498nCW3+jKwZ/a9HNyzYtujF306JvIM5AGvAqqGt63QZdxR0mCkXMKAvZT5owQCMoo2BU2jSJGdP+uVFvVnQ98Tqf/iNFhjTd0G0sRSseonqTj94aDuGQAE4sAiK9nG1JYwy/veiGps2L5udurvwaMojIWu1d/Xqcou7wod4AG4YkuhWMzYbCG5f1T/vMPpA674mjCKcpjCjL4o82j2JzYoRACIdBNiHAETEldfk7lV8pf7fyy7H8A4Fn2up/aRi1Qwd7/KyhkAYDtMH0y1QhHoUJpsCJp/jmdDaxWML1Qept4DhRtjoG0OVZDuzN8dI4PwiBs+cYZTSFYV3gPKsLHALAF2vnLVWFk2nLcuBA3YL48DFqvFv5JRr3eXpdsyqIE3JPW/1W15aKy+jYvNvf5Z10zlk8F6ZFuOj83Lkpi3Djg0AtNtSFML4k+j8+god6ZmLWb6+eAi91EH4rqgOCmECg8cO8Og51Yi13v6DfWPadBYBEwCNfhUjBAVWMIUyDUDkEqCaNRt7sAsDdz15D0zhYgCq/gGD5PSX/jBvvWyuLyMsg7+rXZVmCe+rqt31bKy5twaLoo5SFRh1hM+nhOY7+UpZc1RSTBMOsSRAvuUU1ZNUaxh40HzqvWdMAo8/QBuXW52WWqUwdynjABj3IjHiDytxC77mQ4uzVEPrDENHLjH4akOsAaxA2AKcNg5Mf003nPJG+IuqQHTwCQO0jLxThR/9chJf9xdf16xd9GluPtoqrmrZUXE6jW5CGQs7RYY4wt2T44ZFHMlz9tMdlDUNNCYxlE2xam4yAnRi1AIs8lswGqFyJZsYoTyLBZyBdykldyiKNZMO70iCE6LFDMD4vsJGL7zE/pns3QlC74qW5tTyCWZOAoHxh8WuBLRWX0ZlRwTXVbiByFUnubPI02pSQ0W8Qyq5UMyNiwjejtIXcuKheJWJv4/GDzMyIkvXeNtMyKnn6ro3xSPK9oFsWMsVm/Ey9JsYzC5EX2/D6TWV0v8TIe67FhEpkqYYfdbg7vfNyfEQaTFNQHcfHR+TnleOi2+a93jKu9Fftjj2feWZffS5kjzpLU56GH912Zoa9YzKi2GEoPmZjNPbjoMJQKKdHTZwx1CTweVZg+Dk9yx0CtCAEgZ/eEB9pdfmLPp/AWiUJ5DxXAPAgujFNEmko+Vf+j0eKRDyOw/sh0nc2HYqUGIkoPePtKQk2xJTHRHYt4UHA1W90QmxgdBuLwwZNDhuUsIaCWSOxARxpHwFtGydSztMW7AExI9sNGDft2fRLwzF28Vdb5I9t+NGlzKx2dPAgCJEQ5VNAlBiDy/ifNel40VMabIaD+FDTGiMlLz9Rwjpd8j7hvmu9GXZozeJheI99NAY63x/DMmAJbOE+kGwOuskF3vvOr8yp8lUYN3OJBxBqFy+6EJxbWiHj6AGYUnwpDB83UinZ2ntvP7WHIHkKG887nHLQnQ3tvv+VNief9ez+4/nQ2TpKlt6Cra+H9nwJC8o5iIj147w/SEkTOs77g3YQpXapoADQgYOQcfww5Y5d2RlMgkuoi3hiFL1pAZMa6025tQq/wdJenwCtuCHP4hCwf3fr9R7Uu5OYJtFzNjEMGIuMIJEhA2namnvsxd/jUxgiT8AN+z5YQZmwsVO+62ZcOiKRVym3TpayQmYWSCNHgnPTm/ReZAblzHTRaTOPvmqeWjEThOmcITxLJ/i1nK6VK+FaVJFOm7lBdYsm+mqUwUxsG8ss6Ru4fGSJ6rz8AWsN+YpkUV+15VQHBW9QBHbRNVLNqrRR5rg/0WR1YKhI7Hl/RJGYO14t5geIhJkcBGMQRI0KQLuJYjUWpfYxFyzCZMOi1IVFqZEI3ZR0TheIU6YAdB4Cl9SrzLuxiNkzREyir6aizyniQr5qw4bC4OXTWDMCtrwHhNwAABnjSURBVBI+1U5WjlpF3qEWycsfpP8zldgoqR7eqJFmlqT/nDKlgcYrS/tlN23YWLat+wOppADOGRZtLLK9CcY8s0FjSbbljgBp2jTADjtkf/ohyKoFIlORBXIgSqkxbYwnMCPiLuS9Xz1sBijTyD50ICZtacIlsfJ6ZUad2uKGnYGAMa79jx1J8jN7mBbVOcQlwylLxhNaynWuvClXmjUDiNBF2Yh3STsLzSs4HWDLcmqvJ9ngkpmAzz+PNpSMzRtZ8E0kKEpLCgTw9C/u6k9vbDFBBer5NDTau5gYv5E3CrXBk7wWKVFPbOUzkiLes1O17mtRQgzrn09mNScjEGOSUaqzhFUehtz9mUElHbdGfeuxWhg+vAo2bwY7jlBBGovrjHh4XhbXWQIEYl+Iy0hiHpKTDaigAMDlYv7k7A7I2L0DHAf2siCb3CXHuHPGwsSp59IXXffAnakF25TX3vRjLLZgDuaCgN/5VDuSsEf6YCu4xBCL5SyoA4Hb+MbjOJNjEtNZjutMnA3S/6yhuD5vB8fBfXHhe2ffQAKAQ9Oz999hVmFn4QTC1LqhzsdvK8R2e0CYOg36Ro5WPE3SvdPJj53cC6Vd8UZJGga9zhsJ2TI/2QL2rk6m84nZsM3WZjWUoYuUSHbewrVUsUUjvHcdBtR9hFMWezRqvD1KYQhlQZyi2A93gv3wAVUAcG3s5ynXzmj5y8OVQ3bppoV+rHXOW/hULWCxSgn0TYJ6h0P0o7M7ImWYEkJBEHqO8QYiaYOBawOEl7a/t8oKCD7E0S9mMO+ONW4kSV2U11A3Ah4NXhMlnkeQl/mSmAjy/l1vLS808UgLQwADmjmMLnvSgySpFUTRrW4srBFFhxo1E8v3Tbtfe9jiTU4xpG2aOfaWFV4QpQVIIqaRojdm2GlDkvgCiNKyz/9xv+nlrBYsWLBgwYIFCxYsWLBgwYIFCxYsWLBgwYIFCxYsWLBgwYIFCxYsWLBgwYIFCxYsWLBgwcJpDWvxOAD869P9ZQjBAkRddSA3BkzdnmIMa644Z8yZ6/jQggULqeHPH3aUvNF+sCssitgI5NqWPV34xY86zLpGsWDhjAecaRyL59wy4q23UfbOlpGdAbfX3AFjC8fCnAkjYNKIbN18x0MR+L8P9/oXzJhgrca2YMEEzgjCMvHCyiqQcC0J58rCumJAfE+2ry65Ec6deT7MLnDDnLP1nfy17j0KG/yHipZcfo41NbJgIQmSRok/VXH2jMVeJOF6wNiLVUREJipYRWTWP/lXuPGiSfDSjk5wZzjggrycuLcuzM2E5z+OzE9XcCcLFk5nmPI5eCqhYM5/1xbMvhuD3dGKHQ6v4v9Q9pGoHDsVP4nBsAhbX38fDvVGYN0H+3TflhAcu01IRzxPCxZOe5wWHEt+UTUJvdkIGLtZJIEIoEgQUCREoxYJ4T7GqUicSyEOzFQcC/G2a584Hg73iSWH+0T408cH4BsXjI57zugcl/cbf9rq+dM3pqYcAtaChTMJpyxhGXfdz91IFOuFUG+JECL+UiNRwoEldkxi5dlIxIgMeg4rRIVOhQJIkkp3bF9HpzYT7feWQW+ERs6se28P+CbmgjvDDjaElBgCY7Jd0NUb8RmEvbdgwQLHKUdYCr58fxlEIrUodNxNiQiSmHt3m40SDkZc4ohIlGORpGWftq2Oiz80bdj+jW8ddkOPyOJG/2LjLqi6tAAcAgKHTQC7gGDSiEw43BeZaxEWCxYS45TQCo0v/aUHJLERJOxVpjCcaIDefwmrpjqEe8FtIInlu95cljCG5deeatnuP+aaLP+vmVtIhbYOQQCHDVEic+vzHwbeXHhp/+NDWbBwBmBIcyxjb35sKUhStYQ5oZAY9yETEBr2Sv6vcw1J4pLPXv2Z6eh/4zNCLZ8dtU0WJUZvl230w4+vLqSExU4JiwCT3S73sd+84X3/+1ee8oF2LVgYLAw5wjL69gYvF8R6sIrroIRCPo5yIvS6QlAkeq2FxJ/pePHHKQcEQIBfKMgM3uk/wiKZH+4W4bm2PfClyaPAzrmWcdkOeC8ilvBImYMLFu+3lgY77Fg/eFwSi/e7AEgo/o71gzvNyy9eygNNkpCxS9N0TznWcrmm/CyyqRwQshA61vv5+WZuJFmUcmBIo7xDIcbiYNRtPzFkCMuoRc+WAOB6jLFb1tZgtSZHTUCiRESe8gSwJJXv+8MPBhTMaky21EKiD+85giDIYpzD5l2HYUyWA852Z1Di4nbaAEeonGVwwcLmTuPyHBZGlwUk93Ji06bEqjYiDOz8fB772cOJ4XLoWN+kSlPLY1WzNPnFCzSxoFmo4np+Hfg9liid1AxYg5/LO78+wWfvVc07LUnTxDuImQGiiEfJrYf84hZV2eTIs+Ux5ZUHBe29o2Xw8tjdG3Q6qH5eI2jfPb7+2XNLVN/JOB3o3q9GReCa+DV/TB71NwyovuGgReMZMnYsnatubupcdUvuwbpb0cHV30bY7ijFdkeL5HQCVjYXSLL9idNFzjdIDmfuvuf+M3egRIWg5vrrjgPGLZ7hEU3M8r9/tBc6unrgwNFeGo/cgfHg2LOQUY+FXca8U/gosWCQn+nmx+rY5h5+zhNzx3pKNDrWT+ccj5+GhGaNk4ERJ/kZa+IC2bMOWcpDY5fz57TzTmjmnVpVo2iu6lnqND4eCtvN05DnVcXEZDcG6yByXLNGfs+lvI6W6XBhXv4e0XDbjAjLZSikHZuUWxsWWz9v4rIt5fHlS1X1XxuTqpEOHiwMOHn/F3i6+ph6wrwul9B07FupOWe3bjvQfsMa+iyzddtPDFkZS+fKm5o4BaYYdddzPlqpdIqESzvrbhmcqQiGDSMyJV9eFsCBbnYqJAK8+sl+mO0ZQbVDbpcAF/zsb76Pf3pduq1wfdSyN55jIJhoIn8yLmJXyiViseXdCuufX+znnctsDHw1p2OEKJGKEr3YWPmJwcq2hHJz0elKlKszX84NfD/w0Tw6NVnG38fNO3UyoizXVZRARNuBHzrWR+vSDNfBCFJA9Q3bTJRhQDhl1M2dK29qOSHm9Fgiz6iePArgSLeoTIm6IxFo9R+Cc0ZlQwaZRUcivkEoTxHlVFhDaOMNy807SDlNwRrGMjqis3QyGgYgH2nhHYCM0NUxcoIGzj2Qcsnn2lKQTRRx7qtLlT/AOxvwd1oG+cVz+ZRMzQ2mVr/a+8jPNpt3KeQXT1TqID0gA+NiXn9VqjumRjSBcx35xeV8uqf+7mbkKQ2coLWqvsGg9iXLH4sOFj79Ev1wwTCGzTvDmgTuTAcMz3TC7sPHWz75WYkVyf50ApuiuDnhk+VOSyjBspASBoVjufTRJ4jDpAUAyBsJ2/0AaJcYEaCv20WopH/bQ98Y2ibxEibl9LlsAJNHC7B9T5S4dHWLVM6CRNFaN3S6gUybmOzInYLg2IIO0sqxXL3y14SgNGNAbnZrgSlx6XF0rz4vRQSIhAW/GBKajh8UNmx/9KYBC2EHijvWvEjnxnLl7DoQgl37w3p3Ldr+yxtPndXOTEBZH3O2jc+9rU5kIW1IC2GZvPgZ95jJh5oFG3XtqEtADM8j+XxMWglBuBf8oaN4TTAgLfv38ltPWMNfWP8XHyBoBj6TJbvtn/XB/sNxxKVm+7JbTqq9gGkwNl8tsEtFsGnBQkoYMGG55IGVJVm5wcYogUgPYYkeR89jERETlgbBLtS8vahkUKdTd/zuz5SsqCvok109sP+Qhri0/Pu3t6VPzhLVIqSKJqqiNBLeJrqvkUEX00JUc1lDMg2Q2u5kYN+FqZ5jVbypgmnWEt8rdeM4UIzuqrjdUKx6Xw9N3CZF/1lRDVYsWuJU/9p85r6pVtCrxqAa0Q1IxnLl8tpam6O36kSZwyAb6eioDAMqu6Tuz+RUAIOwHAAte6fyK+nlaIicBYEPqz7LeWdnQiQkQmcgJJ8aKnKWErpF7R5KdY2rzIDdoyzFXLIatYxrHRJ3ilMR+tNIM5C/DZxJ085+Exbfil/WA0hl+KQqlogsh6lJZ9W9RLiaNgC05N3KLw9c7oHxBsDxhOOic7Kh7eMIBLoZ53LunU/4dj6+8ETIWWJVlPMT2CI0UpuOVLQZbCRuT8KdtHE15RFu4WlEWH18pCwcMAejRYNJW5z0crP5xe1JuBM/r5dd3FrayIDOy9Xu5YO+dOIko1+Exbfikdpko1r3Xgl6OkWI9NpaPq3/nu7odfnKBvkDeFVmymYNr3SAqPB4Zt3LhMgEAFD5e5Xz+jVyu+zo5WBIqiYSFplpkUnotPOGQdtHAQgcDZHLJ8ZdZTzbyv7nFzeq7DbUmK+xFUmOZoO6D3ACYWSK7+YWq3odj5xP5xqnNf2avgwEjIMzIiqJp1PG05zYpQenHVImLL4VD5fFGPuAFAE4vEeArs8RSGEMdoTB6VCmR4bThY13lanXOOhi9qo/yusozMz11SBpG2fUvSoTmdLWyiLTjXJF+fyNd6z8P9KZ3IygIC7GZYfeC86Ct945CH19J1HtzDr1wC0omSzC6D7lCVl3co0ZbunJMtzKGqf0gFjVJptGLNFYpg4cRgNoTdL3YnIeIxlHmTI4nIZIibAUrXiINOR6uaYCBx2wd0cGXRBIpKoCliBDkFgXJKv5OApvXl7S/uzifnEOmxZ9UzbtL5fPXbLqBTcnNAvMyTmo+rt5eh2Z3aAWQKi0reKqpPPcUFBsczgEH2NVVO2DH86aOgJef3Oft/Cm5e725xYP7rzZuIEaoTzF9PowI6th1sBGV9NpoWyGiA6A400JZt+pxaCNDv5C1pOIVDkWungq0OmCPZ9mM69sCFPNDiEqrkiQJtLpAYsTcSWpYvOi+QE+31bmqbPq/iYLEBcnnA8j+pG7vKvfCGBARVsqrjAc3Y4fC21wu10+vRciIOuGppzvhvc/6CwZIl7lAnzETl9ZzHAc0XUsejhd/daYJZhGxHCDwfnTAqkSlrLt74+CcFBgLiE5EbFLIjh6jxv1PwLfxNJHSnY13j1oxm/vVF4nrz9R5Aoz6l71qZbix4ByMa3TVr9JTpduqZgTV7ZPPumcO/vS8fxf9O0Ql7aQM6NyM2Dc6My5/sEnLLLw1kho20ZXMfcHjOMIGIz21SY6kLGKvL/aKX30T0U8MBhxHIvpmq1E00SmEjbioOT3MJKzJFNlT0ty35MK04Tl4v+p9X28dSSIZFEeIrogIkORAGyHAWV8DOLZB8GW0QdEtEI2O9nbMNuzrXHy3Hnsmk2VxiC9XQC/g2w22CAgaEEAbffe8GpK0433Kq/RLFycXrfBgNCgxqmrNxE5TOHWikuVZxw70us+dqQPcoY51Wm5ODdKaCYW5PjeHOyvGBXeLjWwYfDy6VJ/O1+pgZxE1vC0cFcC8r29fCqaSIifnunY4MCbYPqmxhoDwuLmGh4/J/ptnEiQepkfK4eMQYPqG9UY1KGHryxfztP7OWfo4zMHI4KV+gLHQYBpwrLv8GjWmRAGnPkxSDnv0POEECAVkYgSDRxDNHQISeL0HrsAHgHAh4h5PcLwYOMXqcd8aj5HiRsEONHZghC0/NfXmhN2qNbKuRpCM231xjLVR3KrFqDBhOt+5gVR9O58bStMu26m6i6MU1Nc9wNAZobdjKFU+sBW4rYpvke0IKuQm6BjfWlKz2NcS6HikyQevhTsduQl+umeBjWbJAZm7GhifaIkQi4nunqcoidF+xatqpkRjFwDVb9bteo82X0Hq877BdOEBSPkg8w2wJms3IgTFX2igTVEQ0NITKSXr8lEREDcHldFVAT2n2hsShCCEgS4etmLPvk8s9VF4EcALQjBC3ddtyGOJd9ScXmDkWxEdDirhb5eOPL5AbroUAPyAEnWEKUqU00TyBTDmBCU8NFuekoqTZY2l2ubqpOMunpoGGzPZCcF7H3YNJNxi4tTFBK3JNRWsfvL9Z7UlCOle58kmLZuG3nPtYp5NOlXutwHIRBJOBMz6e2cqAhRziQBkWFERIj5H02v4XDk8wGEoEkAvKbsS6/HcTnjSh+tEnp6alE4DJk7P4ArvneDfqWoaq/h7m9bLijOJCS2UJYN5l7g3NMZt8DTPGH5fxVecLS3CiiG+1CIBjbBmSRPb0MyMcAa4qFHZNh5HEdkoul1iYqWOLFzhbfNe52O7PlF9y0V80ZV2/btA0egExxHOmHK16+E4eNHGdaWTRC2/e6/v31++j6LhVMKzNx/sUl1eEBHU+ZTXTM2RjyFYHoqdOiXq9tG//jaNrsAXpkIRAkDTsKZABw/MAyO7s+BI/uGwbH9dhB7JRBdWaR7l3ZsfOiEuEr43ctXexBgD0LgQQBkPw0BLCFEZfyc/3YjhJojo0d7hcOHAQX7wHH0EMvInXer5SpqiJL4txNRfgtDFExmonZi7ksg2HYbyKpOKzP/lNj3gnuvrbIJUKs3nZHPCREbBLbnQecneSCGbNEHYQmEUB//g0B0ZqrujAOAoWjP5kdP+Dxx/CU/dAMi81pUJp5TCBAKge3zDsjs2kPjPhOictH1c+CscSN182NWg9PX/rTcijNkQR9MdiJHTFATFdnL/kn3QZRupCwXmFRzbZdDADeb5rDpjHQkAw6+VQDBrgydHBjs4aAcfJ1CdLgAI8MV0U2Acfne1uWDyg6Om764ChCqpiOIzQbieecRATXYP/wQMnq6wBbpUyIqXlQ8G4aPHcEyqmuMcTBNa++7PTUNjAVjsNFeVqXHhu2Ih3bVcbw2aAjF2jEF9j4eRcV8iiLltUIuG5TbBGgk0x9CUD57ZQJIYZkzETVpSae0RUJawzmiUBGlRNoUusx87LTvE5rkB8BUj79v62/7TWjGTv1PHwCaT0cNxKT5sqYH5+WBVFAAhLjYtm4FV28ABCnMdOhIImJhGDbazdITQqIpNpXnpNdWg9kqlPEgZctizvn7zS5HGyzznaLXaPUatew136hTRvPAgDsDG9nVtjTGixijdSIToZp+rWqOfT8zdc3cV8oLPxN/k6jtSTRagRGHwsoi+3mZCPnFGxKUQV3vTQm1Qma+fZqRMmH58KevNM16aF7Noc651d2BQrD3bowjKDIEbuKvjPK8Ywo4DBKy6eaJgYer32rHXvTd/r+5KMWdwpmZIF1wPoDDSaSvILz7HmT2dYGARe58iuwQuLIzWPhWbhqngL1T0dr/rUgvZ8XsGiYqtguMuDRywWDqlrWsYbfzRlXO9z4DNfsClam63PjkjhtPWKLrl8p5eqP7mkUrT1fKZRH1dIWwvk1KQBVdAPhxf75F7Pt5VNbG8e8SdaGwhL9zPdcQxfvAiXJLTdzQzcPTN3JTgFhi0MKnSwRbdJdDMKLWqvqeXu59Xz9aZvQblSb59mlFvzw0vfOjfyw9tndsA9jtIF58MYkMGLehcIiwJmyk51ELgYdEJZ2XcAV6+QZ9czpBnD4dpKlTAVwZVEZif3MjZIcCbGZD1USyvluAEfl5gEWREicsbxLdlz/1vxWDYz7NQn34+Wpe2aVk/2wV2Ogkc1WNnCNIV3iLUqVzsfvWcq4jdWjdEzSqpjc+nQBfzPZDbWFMjk+MLYdcxlpeTvl9E2mEtvDyNXACA7p2MOx9ZOLYZvA+Mqfk5s+vVv6zaWQsypVAaQP9Rimg367fDj59Zznq6qrBubkgzpoV7XSqzqf2GUt+mCE8czOJBAR2OyJ9Nz5vujfyzMJCkOZcBtJ0L0BGBmCHHaD7GGRtegMyhLCie8YCih4TC7zxI2ncaEpMJIWoFD394KLBpvryKF3F2deBhKCoVzlpAm4urtcR5CiFjTwqYzv/b/Sui1U2GwGVb53UwGJUl3EZCdJsrNxVnJ0fDLB3I+/K/KfI1szxERsZ1Gt8mlTvnq5BRiYstboEVfst2vj/Nl53emWo1/lGg24pPmCjrrzrH/Lh/PxmIqNAre8BHD+uXHMQRy3chS3ivm0R77CEsGDOHcjnJBGDFI4w7mYgEGwAZw0HNG4cIyKEepFzNgEw2QsCZLz/Ljh6upWg8yzAvKSolkmM6KzhWXDxNdHZB6IfBhc+8+CiwbcziPprPW1sGyycOUibteiobz/eCjk5XoiEybJgwL29tHM6cViRV1CCotoTohJLZJh1XHQqgvl6PykSUVm0RTkK5HJR4gFOJyAhSjhoXpvqmJ937doBjs59fFomB5mXFA2QYrOCMSUqWe5s2cnTsmf/984T49U+Ov3RC0puwcKQR1rN0Ede93MvKihoRoLgJh0T798P0sEDYJciYMNSVH4hKGwMJyRqYoKYKhoJnChwAkMJECcSyjUb50ai/2l+hbiw64RguPw7wNZ9JI6YKP85MUH8fP6FEyD/QhouuQ0wLnqu5naLY7BgwSQGZX3LqMp1XoRxM2DslqcauLcHUKALbMe7mXIohmuRORQ1t8JkHmoiEz3WEBTNOU5UxAg4Du0He9ch3ekOUhEW+p8TFvI/b+IYKJz1BepR/ff3LbAIigULKWJQF87lVTztBgyNgCUf68xY6bxUOxTsAwgGgU6fqJ0IULsRhYvREA5OhNRTGyKfEdgrkHsJPcdBIIQLqwlGvOxEj5jIXMuI/FHL3n3xASuQlwULA8AJW5Gbt3AtIS71CGOP0tFjO74yTVETAT1CEC8Pif5PIDsxENICxk2ApXL/Oyss7sSChTTgpCz1H11e7wGMqwHjMg1RSEQg+DkUS4QMpje6cpQoMfEDlmp2baw9rWO7WLBwsjBkfIiMuW11CWA8n0ybKFejIRgGRCKWA1H+a6Y3LYDxC4Qr+azl56dtHBcLFoYSTjnnRONueNTDplMKQfHv+fP/WATDggULFixYsGDBggULFixYsGDBggULpw8A4P8D46UAXq2hDvkAAAAASUVORK5CYII=';
                
                doc.addImage(imgData, 'JPEG', margins.left, finalY - 40, 100, 50);
                
                doc.text("Actividades", margins.left + 230, finalY);
                doc.setFontSize(12);

                switch (digits_count(DATA.idRecord)){
                    case 1:
                        doc.text("N° 00000"+DATA.idRecord, margins.left + 400, finalY);
                        break;
                    case 2:
                        doc.text("N° 0000"+DATA.idRecord, margins.left + 400, finalY);
                        break;
                    case 3:
                        doc.text("N° 000"+DATA.idRecord, margins.left + 400, finalY);
                        break;
                    case 4:
                        doc.text("N° 00"+DATA.idRecord, margins.left + 400, finalY);
                        break;
                    case 5:
                        doc.text("N° 0"+DATA.idRecord, margins.left + 400, finalY);
                        break;
                    case 6:
                        doc.text("N° "+DATA.idRecord, margins.left + 400, finalY);
                        break;
                    default:
                        doc.text("ERROR", margins.left + 400, finalY);
                        break;
                }
                
                finalY          = finalY + 50;
                
                var today       = new Date();
                var date        = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear();
                var time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime    = date + ' ' + time;
                
                doc.text("Fecha: ", margins.left, finalY);
                doc.text(dateTime , margins.left + 70, finalY);

                finalY = finalY + 30;
                doc.text("Encargado: ", margins.left, finalY);
                doc.text(arrayMandated[0] ,margins.left + 70, finalY);

                finalY = finalY + 30;
                doc.autoTable({
                    startY: finalY,
                    html: '#tableActivities',
                });
                
                doc.save("Manteción_" + arrayMandated[2] + "_" + date + ".pdf");
                ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
            }

            var containerRow;
            for( var i=0; i<activities.length; i++ ){
                containerRow    = document.getElementById("container:" + activities[i]);
                containerRow.remove();

            }

            for( var i=0; i<12; i++ ){
                if( document.getElementById("monthContainer:" + i).children.length == 0 ){
                    var divAux      = document.createElement("div");
                    var textAux     = document.createTextNode("No hay actividades en este periodo");

                    divAux.setAttribute("style", "margin-left: 5%");
                    
                    divAux.appendChild(textAux);
                    document.getElementById("monthContainer:" + i).appendChild(divAux);
                }
            }

            carMaintance    = [];
            maintancesBtn.remove();

            $("#guideMaintanceForm").modal('toggle');
            ClearTable('tableActivities');

            document.getElementById("printPdfBtn").disabled = false;
        });
    }
};

function openModalHistoryActivity(idActivity){
    $('#aboutActivityForm').modal('toggle');
    ShowSpinner();

    $.post("backend/getRecordsPerActivity.php", "idActivity=" + idActivity, function(DATA){
        if( DATA.ERROR ){
            setTimeout(() => {
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 1000);

        }else{
            var idTable     = "maintanceHistoryTable";
            var table       = document.getElementById(idTable);

            document.getElementById("activityNameToPrint").value    = DATA.nameActivity;
            document.getElementById("areaToPrint").value            = DATA.areaActivity;

            try{
                table.children[1].remove();

            }catch(e){
                console.log(e);
            }
            
            var bodyTable   = document.createElement("tbody");
        
            // Create the rows
            for (var i=0; i<DATA.COUNT; i++){

                // Here is created every row
                var row         = document.createElement("tr");
        
                // Here is created every cell
                var indexCell       = document.createElement("td");
                var nameCell        = document.createElement("td");
                var idRecordCell    = document.createElement("td");
                var endDateCell     = document.createElement("td");
                var stateCell       = document.createElement("td");
                var annexesCell     = document.createElement("td");

                // Here is storaged the content into a node
                var index           = document.createTextNode( i + 1 );
                var name            = document.createTextNode( DATA[i].name + " " + DATA[i].lastname );
                var idRecord        = document.createTextNode( DATA[i].idRecord );
                var endDate = DATA[i].lastMaintance == 'Pendiente' ? document.createTextNode("Pendiente") : document.createTextNode( FormatDate(DATA[i].lastMaintance) );
                
                var state           = document.createTextNode( DATA[i].statusActivity );
                var annexeLink     = document.createElement("a");
                var annexeText     = document.createTextNode("Ver Anexos");

                if( DATA[i].annexes ){
                    // The function GetAnnexes is in records.js file
                    annexeLink.href     = "javascript:showImages(" + idActivity + ", " + DATA[i].idRecord + ")";
                    annexeLink.appendChild(annexeText);
                    
                }else{
                    annexeText.textContent  = "No Presenta";
                    annexeLink.appendChild(annexeText);

                }


                document.getElementById("printHistoryMaintanceBtn").setAttribute("onclick", "printHistoryMaintances();");

                // Here is inserted the content into the cells
                indexCell.appendChild(index);
                nameCell.appendChild(name);
                idRecordCell.appendChild(idRecord);
                endDateCell.appendChild(endDate);
                stateCell.appendChild(state);
                annexesCell.appendChild(annexeLink);

                // Here is inserted the cells into a row
                row.appendChild(indexCell);
                row.appendChild(nameCell);
                row.appendChild(idRecordCell);
                row.appendChild(endDateCell);
                row.appendChild(stateCell);
                row.appendChild(annexesCell);

                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }

            // Here is inserted the body´s table into the table
            table.appendChild(bodyTable);

            setTimeout(() => {
                CloseSpinner();
                $('#maintancesHistoryForm').modal('show');    
            }, 500);

        }

    });
};

function printHistoryMaintances(){
    $('#maintancesHistoryForm').modal('toggle');

    document.getElementById("printHistoryMaintanceBtn").disabled = true;

    margins = {
        top:          70,
        bottom:       40,
        left:         50,
        width:        550
    };

    let finalY      = margins.top;

    var doc     = new jsPDF('p', 'pt', 'letter');  // optional parameters
    var imgData = 'data:image/png;base64,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';
    
    doc.addImage(imgData, 'JPEG', margins.left, finalY - 40, 100, 50);
    
    doc.text("Historial de Mantención", margins.left + 200, finalY);
    doc.setFontSize(12);
    
    finalY          = finalY + 50;
    var today       = new Date();
    var date        = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear();
    var time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime    = date + ' ' + time;
    
    doc.text("Fecha: ", margins.left, finalY);
    doc.text(dateTime , margins.left + 70, finalY);

    finalY              = finalY + 20;
    var activityName    = document.getElementById("activityNameToPrint").value;
    doc.text("Actividad: ", margins.left, finalY);
    doc.text(activityName , margins.left + 70, finalY);

    finalY              = finalY + 20;
    var activityArea    = document.getElementById("areaToPrint").value;
    doc.text("Área: ", margins.left, finalY);
    doc.text(activityArea , margins.left + 70, finalY);

    finalY = finalY + 30;
    
    var cloneTable  = document.getElementById("maintanceHistoryTable").cloneNode(true);
    cloneTable.rows[0].cells[5].remove();
    
    for( var i=0; i<cloneTable.children[1].children.length; i++ ){
        cloneTable.children[1].rows[i].cells[5].remove();
    }

    doc.autoTable({
        startY: finalY,
        html: cloneTable,
    });

    doc.save("Mantenciones_" + activityName + "_" + date + ".pdf");

    ClearTable('maintanceHistoryTable');
    document.getElementById("printHistoryMaintanceBtn").disabled = false;
};

function showImages(idActivity, idRecord){
    ShowSpinner();
    var formData    = new FormData();
    formData.append("idActivity", idActivity);
    formData.append("idRecord", idRecord);

    $.ajax({
        url:            "backend/getAnnexes.php",
        type:           "POST",
        data:           formData,
        contentType:    false,
        processData:    false,
        success:        function(DATA){
            if( DATA.ERROR ){
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);
            
            }else{

                if( DATA.length < 1 ){
                    setTimeout(()=>{
                        CloseSpinner();
                        ModalReportEvent("Advertencia", "", "No se han encontrado imagenes asociadas a la guia de mantención");
                    }, 500);
                
                }else{
                    var containerImages = document.getElementById("containerImagesRecord");
                    
                    removeAllChildNodes(containerImages);

                    var subContainer    = document.createElement("div");
                    subContainer.setAttribute("class", "row");

                    for( var i=0; i<DATA.length; i++ ){
                        var container   = document.createElement("div");
                        container.setAttribute("class", "col-12");
                        container.setAttribute("style", "margin-bottom: 5%;");

                        var img = document.createElement("img");

                        if( DATA[i].type == "pdf" ){
                            img.setAttribute("style", "height: 100; width: 100; display: block; margin:auto;");
                            img.setAttribute("class", "downloadFile");
                            img.setAttribute("name", DATA[i].data);
                            img.setAttribute("title", "Haga click para descargar");
                            img.src = "img/logo_pdf.svg";

                        }else{
                            img.setAttribute("style", "height: 300; width: 250; display: block; margin:auto;");
                            img.src = DATA[i].data;

                        }

                        container.appendChild(img);
                        subContainer.appendChild(container);
                    }

                    containerImages.appendChild(subContainer);
                    
                    setTimeout(()=>{
                        CloseSpinner();
                        $("#ModalImagesRecord").modal("show");
                    }, 500);
                }
                
            }

            DATA    = "";      
        },
        error: function(DATA){
            console.log(DATA);
        }

    });
};

function downloadFile(e){
    location.href   = "mantencionembalses/" + this.name;
}