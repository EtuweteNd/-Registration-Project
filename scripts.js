document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("studentForm");
  const photoInput = document.getElementById("photo");
  const photoPreview = document.getElementById("photoPreview");
  let editingId = null;

  const resetPreview = () => photoPreview.innerHTML = '<span class="muted">96×96</span>';

  const getFormData = () => {
    const data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      gender: form.gender.value,
      programme: form.programme.value,
      year: form.querySelector('input[name="year"]:checked')?.value,
      interests: form.interests.value.split(",").map(s => s.trim()),
    };
    return Object.values(data).some(v => !v || (Array.isArray(v) && !v.length)) ? null : data;
  };

  const saveStudent = (id = null) => {
    const values = getFormData();
    if (!values) return alert("Please fill all required fields");

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const reader = new FileReader();

    reader.onload = e => {
      const photo = e.target.result;
      if (id) {
        const i = students.findIndex(s => s.id === id);
        students[i] = { ...students[i], ...values, photo };
      } else {
        students.push({ id: Date.now(), ...values, photo });
      }
      localStorage.setItem("students", JSON.stringify(students));
      loadStudents();
      form.reset();
      resetPreview();
      editingId = null;
      document.getElementById("saveBtn").innerText = "Add Student";
    };

    reader.readAsDataURL(photoInput.files[0] || new Blob());
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    saveStudent(editingId);
  });

  document.getElementById("search").addEventListener("input", filterStudents);

  document.getElementById("resetBtn").addEventListener("click", () => {
    form.reset();
    editingId = null;
    document.getElementById("saveBtn").innerText = "Add Student";
    resetPreview();
  });

  photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return resetPreview();
    const reader = new FileReader();
    reader.onload = e => photoPreview.innerHTML = `<img src="${e.target.result}" />`;
    reader.readAsDataURL(file);
  });

  loadStudents();

  window.editStudent = id => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const st = students.find(s => s.id === id);
    if (!st) return;
    editingId = id;
    Object.entries(st).forEach(([k, v]) => {
      if (form[k]) form[k].value = v;
    });
    form.querySelectorAll('input[name="year"]').forEach(r => r.checked = (r.value === st.year));
    form.interests.value = st.interests.join(", ");
    photoPreview.innerHTML = `<img src="${st.photo}" />`;
    document.getElementById("saveBtn").innerText = "Save Changes";
  };
});

function renderStudentRow(st) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${st.firstName} ${st.lastName}</td>
    <td>${st.email}</td><td>${st.gender}</td>
    <td>${st.programme}</td><td>${st.year}</td>
    <td>${st.interests.join(", ")}</td>
    <td><button onclick="editStudent(${st.id})">Edit</button> 
        <button onclick="deleteStudent(${st.id})">Delete</button></td>`;
  return row;
}

function renderStudentCard(st) {
  const card = document.createElement("div");
  card.className = "student-card";
  card.innerHTML = `
    <div class="head">
      <div class="avatar"><img src="${st.photo}" /></div>
      <div class="meta"><div class="name">${st.firstName} ${st.lastName}</div>
      <div class="prog">${st.gender} - ${st.programme} - Year ${st.year}</div></div>
    </div>
    <div class="tags">${st.interests.map(i => `<span class="tag">${i}</span>`).join('')}</div>
    <div class="card-foot">
      <button onclick="editStudent(${st.id})">Edit</button> 
      <button onclick="deleteStudent(${st.id})">Delete</button>
    </div>`;
  return card;
}

function loadStudents() {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const cards = document.getElementById("cardsContainer");
  const tbody = document.querySelector("#studentsTable tbody");
  cards.innerHTML = tbody.innerHTML = "";
  students.forEach(st => {
    cards.appendChild(renderStudentCard(st));
    tbody.appendChild(renderStudentRow(st));
  });
}

function deleteStudent(id) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.filter(s => s.id !== id);
  localStorage.setItem("students", JSON.stringify(students));
  loadStudents();
}

function filterStudents() {
  const q = document.getElementById("search").value.toLowerCase();
  const students = (JSON.parse(localStorage.getItem("students")) || [])
    .filter(s => (`${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.programme.toLowerCase().includes(q)));
  const cards = document.getElementById("cardsContainer");
  const tbody = document.querySelector("#studentsTable tbody");
  cards.innerHTML = tbody.innerHTML = "";
  students.forEach(st => {
    cards.appendChild(renderStudentCard(st));
    tbody.appendChild(renderStudentRow(st));
  });
}
