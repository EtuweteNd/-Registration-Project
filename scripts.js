 function validateEmail(value){
 const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
 const err = document.getElementById("err-email");
 if(!ok){ err.textContent = "Please enter a valid email."; }
 else { err.textContent = ""; }
 return ok;
 }
 document.getElementById("regForm").addEventListener("submit", (e) => {
 const value = document.getElementById("email").value;
 if(!validateEmail(value)){
 e.preventDefault();
 document.getElementById("live").textContent = "Fix errors before submitting.";
 }
 });
