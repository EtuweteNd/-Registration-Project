function validateEmail(value){
 const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
 const err = document.getElementById("err-email");
 if(!ok){ err.textContent = "Please enter a valid email."; }
 else { err.textContent = ""; }
 return ok;
 }
