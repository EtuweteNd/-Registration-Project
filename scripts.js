// script.js — validation, DOM, localStorage, file handling
const form = document.getElementById('regForm');
const live = document.getElementById('live');
const cardsEl = document.getElementById('cards');
const tbody = document.querySelector('#summary tbody');
const preview = document.getElementById('preview');
const photoInput = document.getElementById('photo');
const searchInput = document.getElementById('search');

let students = []; // array of {id, first,last,email,prog,year,interests,photo}

function uid(){ return 'id-' + Date.now() + '-' + Math.floor(Math.random()*9999) }

function showError(id, msg){
  const el = document.getElementById('err-' + id);
  if(el) el.textContent = msg || '';
}

function validateEmail(v){
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  showError('email', ok ? '' : 'Please enter a valid email.');
  return ok;
}

function validateRequired(id){
  const el = document.getElementById(id);
  const val = (el && el.value || '').trim();
  const ok = Boolean(val);
  showError(id, ok ? '' : 'This field is required.');
  return ok;
}

function validateYear(){
  const year = form.year.value;
  const ok = !!year;
  showError('year', ok ? '' : 'Please select a year.');
  return ok;
}

photoInput.addEventListener('change', (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f){ preview.innerHTML=''; preview.setAttribute('aria-hidden','true'); return; }
  if(!f.type.startsWith('image/')) { showError('photo','File must be an image.'); return; }
  showError('photo','');
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="preview">`;
    preview.setAttribute('data-src', reader.result);
    preview.setAttribute('aria-hidden','false');
  };
  reader.readAsDataURL(f);
});

function gatherForm(){
  const interests = form.interests.value.split(',').map(s=>s.trim()).filter(Boolean);
  const photo = preview.getAttribute('data-src') || '';
  return {
    id: uid(),
    first: form.first.value.trim(),
    last: form.last.value.trim(),
    email: form.email.value.trim(),
    prog: form.prog.value,
    year: form.year.value,
    interests,
    photo
  };
}

function clearForm(){
  form.reset();
  preview.innerHTML='';
  preview.removeAttribute('data-src');
  preview.setAttribute('aria-hidden','true');
  document.querySelectorAll('.error').forEach(e=>e.textContent='');
  live.textContent = 'Add when you are Ready.';
}

// render single card
function renderCard(student){
  const card = document.createElement('article');
  card.className = 'card-person';
  card.dataset.id = student.id;
  const img = student.photo ? `<img src="${student.photo}" alt="${student.first} ${student.last}">` : `<img src="https://placehold.co/128x128/0b1220/9aa7b2?text=No+Image" alt="placeholder">`;
  card.innerHTML = `
    ${img}
    <div class="card-body">
      <h3>${student.first} ${student.last}</h3>
      <ul class="card-details">
        <li><strong>Email:</strong> ${student.email}</li>
        <li><strong>Programme:</strong> ${student.prog}</li>
        <li><strong>Year:</strong> ${student.year}</li>
        <li><strong>Interests:</strong> ${student.interests.join(', ') || 'None'}</li>
      </ul>
    </div>
  `;
  return card;
}


function renderTableRow(student){
  const tr = document.createElement('tr');
  tr.dataset.id = student.id;
  const interests = student.interests.join(', ');
  tr.innerHTML = `<td>${student.first} ${student.last}</td><td>${student.prog}</td><td>${student.year}</td><td>${interests}</td>
    <td><button class="action-btn edit" data-id="${student.id}">Edit</button> <button class="action-btn remove" data-id="${student.id}">Remove</button></td>`;
  tr.querySelector('.remove').addEventListener('click', ()=> removeStudent(student.id));
  tr.querySelector('.edit').addEventListener('click', ()=> editStudent(student.id));
  return tr;
}

function addToDOM(student, atTop=true){
  const node = renderCard(student);
  if(atTop && cardsEl.firstChild) cardsEl.prepend(node); else cardsEl.appendChild(node);
  const row = renderTableRow(student);
  if(atTop && tbody.firstChild) tbody.prepend(row); else tbody.appendChild(row);
}

function syncAll(){
  // clear all the forms
  cardsEl.innerHTML=''; tbody.innerHTML='';
  students.forEach(s => addToDOM(s, false));
  save();
}

function save(){
  try{
    localStorage.setItem('wad621_students', JSON.stringify(students));
  }catch(e){ console.warn('Could not save to localStorage', e) }
}

function load(){
  try{
    const raw = localStorage.getItem('wad621_students');
    if(raw) students = JSON.parse(raw);
  }catch(e){ console.warn('Could not load localStorage', e) }
}

function removeStudent(id){
  if(!confirm('Remove this student?')) return;
  students = students.filter(s=>s.id!==id);
  const c = cardsEl.querySelector(`[data-id="${id}"]`); if(c) c.remove();
  const r = tbody.querySelector(`tr[data-id="${id}"]`); if(r) r.remove();
  live.textContent = 'Student removed.';
  save();
}

function editStudent(id){
  const s = students.find(x=>x.id===id);
  if(!s) return;
  // populate form
  form.first.value = s.first; form.last.value = s.last; form.email.value = s.email;
  form.prog.value = s.prog;
  Array.from(form.querySelectorAll('input[name="year"]')).forEach(i=> i.checked = (i.value === s.year));
  Array.from(form.querySelectorAll('input[name="interests"]')).forEach(i=> i.checked = s.interests.includes(i.value));
  if(s.photo){ preview.innerHTML = `<img src="${s.photo}" alt="preview">`; preview.setAttribute('data-src', s.photo); preview.setAttribute('aria-hidden','false'); } else { preview.innerHTML=''; preview.setAttribute('aria-hidden','true') }
  // switch submit to update mode
  form.dataset.editId = id;
  document.getElementById('submitBtn').textContent = 'Update Student';
  live.textContent = 'Editing mode — update the fields and click Update Student.';
  window.scrollTo({top:0,behavior:'smooth'});
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  // basic validation
  const okFirst = validateRequired('first');
  const okLast = validateRequired('last');
  const okEmail = validateEmail(form.email.value.trim());
  const okProg = validateRequired('prog');
  const okYear = validateYear();
  if(!(okFirst && okLast && okEmail && okProg && okYear)){
    live.textContent = 'Fix errors before submitting.';
    return;
  }
  const data = gatherForm();
  if(form.dataset.editId){
    // update existing
    const id = form.dataset.editId;
    const idx = students.findIndex(s=>s.id===id);
    if(idx>-1){
      data.id = id; 
      students[idx] = data;
      // update DOM
      const oldCard = cardsEl.querySelector(`[data-id="${id}"]`); if(oldCard) oldCard.replaceWith(renderCard(data));
      const oldRow = tbody.querySelector(`tr[data-id="${id}"]`); if(oldRow) oldRow.replaceWith(renderTableRow(data));
      delete form.dataset.editId;
      document.getElementById('submitBtn').textContent = 'Add Student';
      live.textContent = 'Student updated.';
    }
  } else {
    students.unshift(data);
    addToDOM(data, true);
    live.textContent = 'Student added.';
  }
  save();
  clearForm();
});

// reset behavior
form.addEventListener('reset', ()=>{
  setTimeout(()=>{ clearForm(); delete form.dataset.editId; document.getElementById('submitBtn').textContent='Add Student'; },50);
});

// search
searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim().toLowerCase();
  Array.from(cardsEl.children).forEach(card=>{
    const id = card.dataset.id;
    const s = students.find(x=>x.id===id);
    const text = (s.first + ' ' + s.last + ' ' + s.prog).toLowerCase();
    card.style.display = text.includes(q) ? '' : 'none';
  });
  Array.from(tbody.querySelectorAll('tr')).forEach(tr=>{
    const id = tr.dataset.id;
    const s = students.find(x=>x.id===id);
    const text = (s.first + ' ' + s.last + ' ' + s.prog).toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
});

// load previously saved data from local storage
load();
syncAll();
