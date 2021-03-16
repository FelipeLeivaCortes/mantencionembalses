var numPits = 14;

function initReports(){
    document.getElementById("uploadDataBtn").disabled       = true;
    document.getElementById('inputExcel').addEventListener('change', handleExcelDataPiezometria, false);


    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany;

    $.post("backend/getSeasonPiezometrias.php", Variables, function(DATA){
        if( DATA.ERROR ){
            setTimeout(()=>{
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                CloseSpinner();
            }, 500);

        }else{
            var select  = document.getElementById("seassonData");

            for( var i=0; i<DATA.COUNT; i++ ){
                var option  = document.createElement("option");
                option.text = DATA[i].year;
                select.add(option);
            }

            $("select").each(function() {            
                // Keep track of the selected option.
                var selectedValue = $(this).val();     
                // Sort all the options by text. I could easily sort these by val.
                $(this).html($("option", $(this)).sort(function(a, b) {
                    return a.text == b.text ? 0 : a.text > b.text ? -1 : 1
                }));     
                // Select one option.
                $(this).val(selectedValue);
            });
            
            CloseSpinner(); 
        }
    });
};

function getPiezometrias(){
    $('#getPiezometriaForm').modal('toggle');
    ShowSpinner();

    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var season      = document.getElementById("seassonData").value;
    
    var Variables   = "idCompany=" + idCompany + "&season=" + season;

    $.post("backend/getPiezometria.php", Variables, function(DATA){
        if( DATA.ERROR ){
            setTimeout(() => {
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);

        }else{
            console.log(DATA);
            var containerId = "myContainer";

            try{
                document.getElementById(containerId).remove();
            
            }catch(e){
                console.log("The container: " + containerId + " doesn´t exists");

            }

            var container   = document.createElement("div");
            container.setAttribute("id", containerId);
            container.style.overflow    = "scroll";
            container.style.width       = "120%";
            container.style.height      = "350px";

            var arrayDate       = [];
            var arrayPcg0       = [];
            var arrayPcg1       = [];
            var arrayPcg2       = [];
            var arrayPcg3       = [];
            var arrayPcg4       = [];
            var arrayPcg5       = [];
            var arrayPcg6       = [];
            var arrayPcg7       = [];
            var arrayPcg8       = [];
            var arrayPcg9       = [];
            var arrayPcg10      = [];
            var arrayPcg11      = [];
            var arrayPcg12      = [];
            var arrayPcg13      = [];
            var arrayPcg14      = [];

            for( var i=0; i<DATA.COUNT; i++ ){
                arrayDate[i]    = DATA[i].date;
                arrayPcg0[i]    = DATA[i].cota;
                arrayPcg1[i]    = DATA[i].pcg1;
                arrayPcg2[i]    = DATA[i].pcg2;
                arrayPcg3[i]    = DATA[i].pcg3;
                arrayPcg4[i]    = DATA[i].pcg4;
                arrayPcg5[i]    = DATA[i].pcg5;
                arrayPcg6[i]    = DATA[i].pcg6;
                arrayPcg7[i]    = DATA[i].pcg7;
                arrayPcg8[i]    = DATA[i].pcg8;
                arrayPcg9[i]    = DATA[i].pcg9;
                arrayPcg10[i]   = DATA[i].pcg10;
                arrayPcg11[i]   = DATA[i].pcg11;
                arrayPcg12[i]   = DATA[i].pcg12;
                arrayPcg13[i]   = DATA[i].pcg13;
                arrayPcg14[i]   = DATA[i].pcg14;
            }

            var labelsPits  = ["Cota", "Pozo 1", "Pozo 2", "Pozo 3", "Pozo 4", "Pozo 5",
                                "Pozo 6", "Pozo 7", "Pozo 8", "Pozo 9", "Pozo 10", "Pozo 11",
                                "Pozo 12", "Pozo 13", "Pozo 14"];

            for( var i=0; i<DATA.numPits; i++ ){
                var canvas      = document.createElement("canvas");
                canvas.width  = "90";
                canvas.height = "25";

                var ctx         = canvas.getContext('2d');

                var myChart     = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: arrayDate,
                        datasets: [{
                            label: labelsPits[i],
                            data: eval("arrayPcg" + i),
                              backgroundColor: [
                                'rgba(255, 99, 132, 0.2)'
                            /*    'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)' */
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)'
                          /*      'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)' */
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
             
                container.appendChild(canvas);
            }

            document.getElementById("body-container").appendChild(container);
            setTimeout(() => {
                CloseSpinner();
            }, 500);
            
        }
    });
};

function handleExcelDataPiezometria(){

    ShowSpinner();

    //Reference the FileUpload element.
    var fileUpload = document.getElementById("inputExcel");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
            
       if(typeof(FileReader) != "undefined"){
           var reader = new FileReader();

           //For Browsers other than IE.
           if(reader.readAsBinaryString){
              reader.onload = function (e) {
                ProcessExcelPiezometria(e.target.result);
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
                 ProcessExcelPiezometria(data);
               };
               reader.readAsArrayBuffer(fileUpload.files[0]);
            }

            document.getElementById("uploadDataBtn").disabled    = false;
        
        }else{
            ModalReportEvent("Error", 40, "Este navegador no soporta HTML5. Comuníquese con el administrador");
        
        }

    }else{
        ModalReportEvent("Error", 39, "El archivo ingresado no es tipo excel");
        document.getElementById("inputExcel").value    = "";

    }

};

function ProcessExcelPiezometria(data){
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
         type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    sessionStorage.setItem("arrayData", JSON.stringify(excelRows));
    
    setTimeout(function(){
        CloseSpinner();
    }, 500);
    
};

function uploadPiezometriaFromExcel(){
    $('#loadExcelForm').modal('toggle');
    ShowSpinner();

    document.getElementById("uploadDataBtn").disabled    = true;
    
    var data   = JSON.parse(sessionStorage.getItem("arrayData"));
    sessionStorage.removeItem('arrayData');

    document.getElementById("inputExcel").value    = "";

    if( data.length == 0 ){
        setTimeout(function(){
            CloseSpinner();
            ModalReportEvent("Error", 41, "El documento Excel está vacio");
        }, 500);
    
    }else{
        var arrayDate       = [];
        var arrayCota       = [];
        var arrayPcg1       = [];
        var arrayPcg2       = [];
        var arrayPcg3       = [];
        var arrayPcg4       = [];
        var arrayPcg5       = [];
        var arrayPcg6       = [];
        var arrayPcg7       = [];
        var arrayPcg8       = [];
        var arrayPcg9       = [];
        var arrayPcg10      = [];
        var arrayPcg11      = [];
        var arrayPcg12      = [];
        var arrayPcg13      = [];
        var arrayPcg14      = [];

        /*
        Is necessary to asure the struture of the excel data, to avoid any posibility of fail.
        */
        
        var error  = false;

        for( var i=0; i<data.length; i++ ){
            var j = i + 2;

            arrayDate[i]    = isValidDate(data[i].Fecha, j);
            arrayCota[i]    = isValidDoubleValue(data[i].Cota, j, "B");
            arrayPcg1[i]    = isValidDoubleValue(data[i].pcg1, j, "C");
            arrayPcg2[i]    = isValidDoubleValue(data[i].pcg2, j, "D");
            arrayPcg3[i]    = isValidDoubleValue(data[i].pcg3, j, "E");
            arrayPcg4[i]    = isValidDoubleValue(data[i].pcg4, j, "F");
            arrayPcg5[i]    = isValidDoubleValue(data[i].pcg5, j, "G");
            arrayPcg6[i]    = isValidDoubleValue(data[i].pcg6, j, "H");
            arrayPcg7[i]    = isValidDoubleValue(data[i].pcg7, j, "I");
            arrayPcg8[i]    = isValidDoubleValue(data[i].pcg8, j, "J");
            arrayPcg9[i]    = isValidDoubleValue(data[i].pcg9, j, "K");
            arrayPcg10[i]   = isValidDoubleValue(data[i].pcg10, j, "L");
            arrayPcg11[i]   = isValidDoubleValue(data[i].pcg11, j, "M");
            arrayPcg12[i]   = isValidDoubleValue(data[i].pcg12, j, "N");
            arrayPcg13[i]   = isValidDoubleValue(data[i].pcg13, j, "O");
            arrayPcg14[i]   = isValidDoubleValue(data[i].pcg14, j, "P");

            if( arrayDate[i] == false ){ error   = true; break; }
            if( arrayCota[i] == NaN ){ error   = true; break; }
            if( arrayPcg1[i] == NaN ){ error   = true; break; }
            if( arrayPcg2[i] == NaN ){ error   = true; break; }
            if( arrayPcg3[i] == NaN ){ error   = true; break; }
            if( arrayPcg4[i] == NaN ){ error   = true; break; }
            if( arrayPcg5[i] == NaN ){ error   = true; break; }
            if( arrayPcg6[i] == NaN ){ error   = true; break; }
            if( arrayPcg7[i] == NaN ){ error   = true; break; }
            if( arrayPcg8[i] == NaN ){ error   = true; break; }
            if( arrayPcg9[i] == NaN ){ error   = true; break; }
            if( arrayPcg10[i] == NaN ){ error   = true; break; }
            if( arrayPcg11[i] == NaN ){ error   = true; break; }
            if( arrayPcg12[i] == NaN ){ error   = true; break; }
            if( arrayPcg13[i] == NaN ){ error   = true; break; }
            if( arrayPcg14[i] == NaN ){ error   = true; break; }
        
        }

        data    = null;

        if(error){
            setTimeout(function(){
                CloseSpinner();
            }, 1000);

        }else{
            var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
            var Variables   = "idCompany=" + idCompany + "&dates=" + JSON.stringify(arrayDate) + 
                                "&cota=" + JSON.stringify(arrayCota) + "&pcg1=" + JSON.stringify(arrayPcg1) + 
                                "&pcg2=" + JSON.stringify(arrayPcg2) + "&pcg3=" + JSON.stringify(arrayPcg3) + 
                                "&pcg4=" + JSON.stringify(arrayPcg4) + "&pcg5=" + JSON.stringify(arrayPcg5) +
                                "&pcg6=" + JSON.stringify(arrayPcg6) + "&pcg7=" + JSON.stringify(arrayPcg7) + 
                                "&pcg8=" + JSON.stringify(arrayPcg8) + "&pcg9=" + JSON.stringify(arrayPcg9) +
                                "&pcg10=" + JSON.stringify(arrayPcg10) + "&pcg11=" + JSON.stringify(arrayPcg11) + 
                                "&pcg12=" + JSON.stringify(arrayPcg12) + "&pcg13=" + JSON.stringify(arrayPcg13) +
                                "&pcg14=" + JSON.stringify(arrayPcg14);

            $.post("backend/uploadPiezometria.php", Variables, function(DATA){
                console.log(DATA);
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

function isValidDate(date, index){
    var dateSplitted    = date.split("/");

    if( dateSplitted.length == 3 ){
        return dateSplitted[2] + "-" + dateSplitted[1] + "-" + dateSplitted[0];

    }else{
        ModalReportEvent("Error", 64, "La fecha de inicio en la fila " + index + " contiene un error de escritura");
        return false;

    }
};

function isValidDoubleValue(value, index, Column){
    value           = value.replace(/\,/g, ".");
    var auxValue    = value.split(".");

    if( auxValue.length == 2 ){
        value   = parseFloat(value).toFixed(2);

        if( value != NaN ){
            return value;
        
        }else{
            ModalReportEvent("Error", 74, "Existe un error con el valor en la fila " + index + ", columna " + Column);
            return NaN;

        }
    
    }else{
        ModalReportEvent("Error", 74, "Existe un error con el valor en la fila " + index + ", columna " + Column);
        return NaN;

    }
};