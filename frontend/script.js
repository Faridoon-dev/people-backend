// IMPORTANT: after deploying the backend on Render, put its URL here (no trailing slash).
// Example: "https://people-backend.onrender.com"
const API_URL = "http://localhost:3000";

const form = document.getElementById("person-form");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");
const list = document.getElementById("people-list");

function setMessage(text, type) {
  message.textContent = text;
  message.className = type || "";
}

function renderPeople(people) {
  list.innerHTML = "";
  if (!people.length) {
    list.innerHTML = '<li class="empty">Nothing saved yet. Your first entry will show up here.</li>';
    return;
  }
  for (const p of people) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = `${p.first_name} ${p.last_name}`;
    const phone = document.createElement("span");
    phone.textContent = p.phone;
    const gender = document.createElement("span");
    gender.className = "muted";
    gender.textContent = p.gender;
    const age = document.createElement("span");
    age.className = "muted";
    age.textContent = `${p.age} yrs`;
    li.append(name, phone, gender, age);
    list.appendChild(li);
  }
}

async function loadPeople() {
  try {
    const res = await fetch(`${API_URL}/api/people`);
    if (!res.ok) throw new Error();
    renderPeople(await res.json());
  } catch {
    setMessage("Could not load saved people. Check that the backend is running.", "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form));
  submitBtn.disabled = true;
  setMessage("Saving…");

  try {
    const res = await fetch(`${API_URL}/api/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Could not save.");

    form.reset();
    setMessage("Saved.", "ok");
    loadPeople();
  } catch (err) {
    setMessage(err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

loadPeople();
