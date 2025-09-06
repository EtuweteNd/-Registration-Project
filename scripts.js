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

 function addEntry(data){
 // Card
 const card = document.createElement("div"); card.className = "card-person";
 card.innerHTML = ‘<img src="${data.photo||"https://placehold.co/128"}" alt="">
 <div><h3>${data.first} ${data.last}</h3>
 <p><span class="badge">${data.prog}</span> <span class="badge">Year ${data.year}</span></p></div>‘;
 document.getElementById("cards").prepend(card);
 // Table
 const tr = document.createElement("tr");
 tr.innerHTML = ‘<td>${data.first} ${data.last}</td><td>${data.prog}</td><td>${data.year}</td><td>${(data.interests||[]).join(", ")}</td>‘;
 document.querySelector("#summary tbody").prepend(tr);
 }
