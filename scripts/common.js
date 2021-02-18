 
 function RemoveElement(id){
    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
 }

function digits_count(number){
    var chain       = number.toString();
    var splitted    = chain.split("");
    
    return splitted.length;
}

function RecoveryPass(){
    var status      = isValidRut("recoveryUname");
    
    if( status === true ){
        var username    = ParseRut(document.getElementById("recoveryUname").value);
        var Variables   = "username="+username
        
        $.post("backend/recoveryPass.php", Variables, function(DATA){
console.log(DATA);
            if( DATA.ERROR === true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                
            }else{
                ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
                CloseModal("#recoveryPass");
            }
        });
    }
 }
 
 function ShowSpinner(Timeout){
 
    $("#modalSpinner").modal({
        backdrop: "static", //remove ability to close modal with click
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
    });
    
    setTimeout(function() {
      $("#modalSpinner").modal("hide");
    }, Timeout);
    
 }

 function FormatNumber(Value){
    
    var dot     = String(Value).split(".");
    
    if( dot[0] == "0" ){
        Value   = parseFloat(Value).toFixed(2);
        return Value;
       
    }else{
        Value       = parseFloat(Value).toFixed(0);
        Value       = String(Value).split("");
    
        var aux     = "";
        var count   = 0;
                        
        for( var i=Value.length; i>0; i-- ){
            
            if( count == 3 ){
                aux     = Value[i - 1] + "." + aux;
                count   = 1;
            
            }else{
                aux     = Value[i - 1] + aux;
                count++;
            }
        }
        
        return aux;
    }
}

 function SetTitle(Title){
    document.getElementById("titlePage").innerHTML  = Title;
 }

 function FormatDate(date){

    date    = date.split('-');
    date    = date[2] + "/" + date[1] + "/" + date[0];
    
  // let newDate     = new Date(date);
   // let currentDate = newDate.toISOString().slice(0,10);
 return date;
 //   return currentDate;
 }

function CompareTwoDates(dateRequired, index){
    
   var today	= new Date();
   today	= today.toISOString().slice(0,10);

   var date	= new Date(dateRequired);
   date		= date.toISOString().slice(0,10);

    if( date < today ){
        if(index == -1){
            ModalReportEvent("Error", 52, "No es posible iniciar actividades en periodos anteriores a hoy");
        }else{
            ModalReportEvent("Error", 47, "La fecha de inicio en la posición " + index + " es previa al dia de hoy");
        }

        return false;
    }else{
        return true;
    }
     
 }

 function FocusOn(id){
     document.getElementById(id).focus();
 }

 function ClearTable(id){
    var table   = document.getElementById(id);
    
    if( table.rows.length > 1 ){
        var items   = table.rows.length - 1;
        
        for( var i=0; i<items; i++){
            table.deleteRow(1);
        }    
    }

 }
 
 function NormalizeString(parameter1){
    var aux = parameter1.split(" ");
    aux[0]  = aux[0].toLowerCase();
    
    return aux[0].charAt(0).toUpperCase() + aux[0].slice(1);
 }

 function CloseModal(id) {
    $(id).modal('hide');
    $('body').children('div:nth-last-child(1)').fadeOut();
    $('body').children('div:nth-last-child(2)').fadeOut();
 }
 
 function EventToPressEnter(Function, id){
     
    if( id === "" ){
        document.addEventListener("keypress", function(event){
            if (event.which == 13 || event.keyCode == 13){
                window[Function]();
            }
        });
        
    }else{
        document.getElementById(id).addEventListener("keypress", function(event){
            if (event.which == 13 || event.keyCode == 13){
                window[Function]();
            }
        });
    }
 }

 function EventToChangeInput(id){
     
    document.getElementById(id).addEventListener("change", function(event){
        var status  = isValidRut(id);
    });
 }

 function isValidRut(id){
	
	var rut     = document.getElementById(id).value;
	var regex   = /([1-9]{1})([0-9]{0,1})\.([0-9]{3})\.([0-9]{3})\-((K|k|[0-9])){1}$/g;
	
	if( !regex.test(rut) ){ 
        ModalReportEvent("Error", "15", "El rut ingresado no es válido");
	    document.getElementById(id).value   = "";
	    return false;
	}
	
	var cRut    = clearFormat(rut);
	var cDv     = cRut.charAt(cRut.length - 1).toUpperCase();
	var nRut    = parseInt(cRut.substr(0, cRut.length - 1));

    if( computeDv(nRut).toString().toUpperCase() === cDv ){
        return true;
        
    }else{
        ModalReportEvent("Error", 16, "El dígito verificador no coincide");
	    return false;
    }

 }

 function isValidName(Name, index){
    var regex   = /([a-zA-Z\ \u00C0-\u00FF]){1,30}$/;
    
    if( !regex.test(Name) ){
        ModalReportEvent("Error", 17, "El nombre ingresado contiene carácteres inválidos");
        return false;
    }else{
        return true;
    }
 }

function isValidActivityName(parameter1, index){
    var regex   = /([a-zA-Z0-9\ \u00C0-\u00FF]){1,50}$/;
    
    if(!regex.test(parameter1)){
        if(index == -1){
            ModalReportEvent("Error", 17, "El nombre ingresado contiene carácteres inválidos");
        }else{
            ModalReportEvent("Error", 46, "El nombre en la posición " + index + " contiene carácteres inválidos");
        }
        return false;
        
    }else{
        return true;
    }
 }

 function isValidEmail(Email){
    var regex       = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
     
    if( !regex.test(Email) ){
        ModalReportEvent("Error", 18, "El correo ingresado no es válido");
        return false;
    }else{
        return true;
    }
 }

 /*
This function was designed to verify the permissions assigned to a new user.
Here we only have four permissions, these are:
 * 1 = Administrador
 * 2 = Mecánico
 * 3 = Eléctrico
 * 4 = Jardinero
*/
 function areValidPermissions(option){
    var permissions = "";
    var error       = true;
    
    if ( option == "add" || option == "edit" ){
        var administrator   = document.getElementById(option + "Administrator").checked;
        var mechanic        = document.getElementById(option + "Mechanic").checked;
        var electrician     = document.getElementById(option + "Electrician").checked;
        var gardener        = document.getElementById(option + "Gardener").checked;
        
        // Verifying if a person is administrator
        if( administrator === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        // Verifying if a person is mechanic
        if( mechanic === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        // Verifying if a person is electrician
        if( electrician === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        // Verifying if a person is a gardener
        if( gardener === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        if( error ){
            ModalReportEvent("Error", 19, "No se ha seleccionado ningún permiso");
            return "0";
        }else{
            return permissions;
        }

    }else{
        ModalReportEvent("Error", 20, "La opción " + option + " no es válida dentro de los permisos");
        return 0;
    }
    
 }

 function isValidIntegerNumber(value){
    var regex   = /^([1-9]+([0-9]*))$/;
    
    if( regex.test(value) ){
        return value;
    }else{
        ModalReportEvent("Error", 29, "El N° ingresado contiene carácteres incorrectos");
        return 0;
    }
 }

 function isValidPhoneNumber(value, id){
    var regex   = /^[3-9][0-9]{7}$/;
    
    if( regex.test(value) ){
        return true;
    }else{
        ModalReportEvent("Error", 35, "El número ingresado es incorrecto");
        
        var delay   = 1000;
        
        setTimeout(function(){
            document.getElementById(id).focus();
            return false;
        }, delay);
    }
 }
 
 
// Functions relationated with the username

function ParseRut(rut){
   var spliterRut	= rut.split("-");
   var username		= spliterRut[0].replace(/\./g,"");
   var arrayUsername	= username.split("");
   
   if( arrayUsername[0] == '0' ){
      arrayUsername.shift();
      var stringUsername	= arrayUsername.toString();
      username			= stringUsername.replace(/,/g,"");
   }

   return username;
}

function FormatRut(id){
   
  document.getElementById(id).addEventListener("keypress", function(event){
      var x       = event.which || event.keyCode;
      
      if (event.which != 13 || event.keyCode != 13){
          var char        = String.fromCharCode(x);
          var input       = document.getElementById(id).value;
          
          if( input === "" ){
              
          }else if( input.length == 1 ){
              document.getElementById(id).value = input + "-";
              
          }else{
              var valPrevious     = input.split("-");
                  valPrevious[0]  = clearFormat(valPrevious[0]);
              
              if( valPrevious[1] === undefined ){
                  var digits      = valPrevious[0].split("");
                  var DV          = digits[digits.length - 1];
                  
                  var rut             = "";
                  var count           = 0;
                  
                  for( var i=digits.length; i>0; i--){
                      
                      if( count == 3 ){
                          rut     = digits[i -1] + "." + rut;
                          count   = 1;
                      
                      }else{
                          rut     = digits[i - 1] + rut;
                          count++;
                      }
                  }
                  
                  document.getElementById(id).value = rut + "-" + DV;                   
              }else{
                  var value           = valPrevious[0] + "" + valPrevious[1];
                  var valueArray      = value.split("");
                  var rut             = "";
                  var count           = 0;
                  
                  for( var i=valueArray.length; i>0; i--){
                      
                      if( count == 3 ){
                          rut     = valueArray[i -1] + "." + rut;
                          count   = 1;
                      
                      }else{
                          rut     = valueArray[i - 1] + rut;
                          count++;
                      }
                  }
                  
                  document.getElementById(id).value = rut + "-" ;
              }
              
          }
      }
  });
}

function GenerateRut(Value){
  var dv      = computeDv(Value);
  Value       = Value.toString();
  var aux     = Value.split("");
  var digit1, digit2, digit3;
  
  if( aux.length == 7 ){
      digit1  = aux[0];
      digit2  = aux[1] + aux[2] + aux[3];
      digit3  = aux[4] + aux[5] + aux[6];
  
      return digit1 + "." + digit2 + "." + digit3 + "-" + dv;
  
  }else if( aux.length == 8 ){
      digit1  = aux[0] + aux[1];
      digit2  = aux[2] + aux[3] + aux[4];
      digit3  = aux[5] + aux[6] + aux[7];
  
      return digit1 + "." + digit2 + "." + digit3 + "-" + dv;
  
  }else{
      return "ERROR";
  } 
}

function clearFormat(value){
  return value.replace(/[\.\-]/g, "");
}

 function computeDv(rut) {
	var suma	= 0;
	var mul		= 2;
	
	if(typeof(rut) !== 'number') { return; }
	
	rut = rut.toString();
	
	for(var i=rut.length -1;i >= 0;i--) {
		suma = suma + rut.charAt(i) * mul;
		mul = ( mul + 1 ) % 8 || 2;
	}
	
	switch(suma % 11) {
		case 1	: return 'k';
		case 0	: return 0;
		default	: return 11 - (suma % 11);
	}
 }

function isValidExcel(Filename, id){
    var regex   = /([a-zA-Z0-9\ \u00C0-\u00FF]){1,30}\.(xlsx|xls)/g;
    
    if( !regex.test(Filename) ){
        ModalReportEvent("Error", 39, "El archivo ingresado no es tipo excel");
        document.getElementById(id).value  = "";
        return false;
        
    }else{
        return true;
    }
}
