document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('photo').click();
});

document.getElementById('studentForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const programme = document.getElementById('programme').value;
  const interests = document.getElementById('interests').value.trim();
  const photoInput = document.getElementById('photo');

  if (!name || !programme) {
    alert("Please fill in all required fields.");
    return;
  }

  let photoURL = "";
  if (photoInput.files && photoInput.files[0]) {
    photoURL = URL.createObjectURL(photoInput.files[0]);
  }

  const studentCard = document.createElement('div');
  studentCard.className = 'student-card';

  studentCard.innerHTML = `
    <button class="remove-btn">X</button>
    <img src="${photoURL || 'https://via.placeholder.com/100'}" alt="Student Photo">
    <h3>${name}</h3>
    <p><strong>Programme:</strong> ${programme}</p>
    <p><strong>Interests:</strong> ${interests || 'N/A'}</p>
  `;

  // remove button functionalit
  studentCard.querySelector('.remove-btn').addEventListener('click', () => {
    studentCard.remove();
  });

  document.getElementById('studentList').appendChild(studentCard);

  // Reset form
  this.reset();
});
