let random = 1;
// prettier-ignore
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
class App {
  #map;
  arr = [];
  #x;
  #distance;
  #duration;
  #speed;
  #date;
  #coords;
  #random;
  #type;
  #cadence;
  #elevation;
  constructor() {
    this.#location();
    this.#getLocalstorage();
    form.addEventListener("submit", this.#formList.bind(this));
    containerWorkouts.addEventListener("click", this.#clickForm.bind(this));
    inputType.addEventListener("change", this.#change.bind(this));
  }
  #location() {
    navigator.geolocation.getCurrentPosition(
      this.#geolocation.bind(this),
      function () {
        alert("error!");
      }
    );
  }
  #geolocation(e) {
    const { latitude, longitude } = e.coords;
    this.#map = L.map("map").setView([latitude, longitude], 13);
    L.tileLayer(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on("click", this.#mapClick.bind(this));
    this.arr.forEach((el) => {
      this.#addMarker(el.coords, el);
    });
  }
  #mapClick(e) {
    let { lat, lng } = e.latlng;
    this.#coords = [lat, lng];

    //form open
    this.#formRender();
    //form validate and add to list
  }
  #addMarker(coords, y) {
    if (!this.#map) return;
    let popup = `${y.type == "running" ? "🏃‍♀️" : "🚴"} ${y.type} on ${
      months[this.#date.getMonth()]
    } ${this.#date.getDate()}`;
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          className: `${y.type}-popup`,
          closeOnClick: false,
          autoClose: false,
        })
      )
      .setPopupContent(popup)
      .openPopup();
  }
  #formRender() {
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  #formList(e) {
    e.preventDefault();
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);
    this.#random = random + 1000;
    this.#type = inputType.value;
    this.#distance = +inputDistance.value;
    this.#duration = +inputDuration.value;
    this.#cadence = +inputCadence.value;
    this.#elevation = +inputElevation.value;
    this.#date = new Date();
    if (inputType.value == "running") {
      if (
        !validInputs(this.#distance, this.#duration, this.#cadence) ||
        !allPositive(this.#distance, this.#duration, this.#cadence)
      ) {
        return alert`wrong value`;
      }
      //prettier-ignore
      this.#x = new Running(this.#coords,this.#distance,this.#duration,this.#date,this.#cadence,this.#random);
    }
    if (inputType.value == "cycling") {
      if (
        !validInputs(this.#distance, this.#duration, this.#elevation) ||
        !allPositive(this.#distance, this.#duration, this.#elevation)
      ) {
        return alert`wrong value`;
      }
      //prettier-ignore
      this.#x = new Cycling(this.#coords,this.#distance,this.#duration,this.#date,this.#elevation,this.#random);
    }
    form.classList.add("hidden");
    this.#renderList(this.#x);
    this.arr.push(this.#x);
    random++;
    this.#addMarker(this.#coords, this.#x);
    inputElevation.value =
      inputCadence.value =
      inputDuration.value =
      inputDistance.value =
      inputElevation.value =
        "";
    this.#setLocalstorage();
  }
  #renderList(x) {
    this.#date = new Date();
    let html = `
                  <li class="workout workout--${x.type}" data-id=${x.random}>
                  <h2 class="workout__title">${x.type} on ${
      months[this.#date.getMonth()]
    } ${this.#date.getDate()}</h2>
                  <div class="workout__details">
                    <span class="workout__icon">${
                      x.type == "running" ? "🏃‍♀️" : "🚴"
                    }</span>
                    <span class="workout__value">${x.distance}</span>
                    <span class="workout__unit">km</span>
                  </div>
                  <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${x.duration}</span>
                    <span class="workout__unit">${
                      x.type == "running" ? "min" : "hr"
                    }</span>
                  </div>
                  <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${x.speed}</span>
                    <span class="workout__unit">${
                      x.type == "running" ? "min/km" : "km/hr"
                    }</span>
                  </div>
                  <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${
                      x.type == "running" ? x.cadence : x.elevation
                    }</span>
                    <span class="workout__unit">${
                      x.type == "running" ? "spm" : "m"
                    }</span>
                  </div>
                </li>`;
    containerWorkouts.insertAdjacentHTML("beforeend", html);
  }

  #clickForm(e) {
    if (!this.#map) return;
    let targetEl = e.target.closest(".workout");
    if (!targetEl) return;
    let workout = this.arr.find((work) => work.random == targetEl.dataset.id);
    this.#map.setView(workout.coords, 14, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  #setLocalstorage() {
    localStorage.setItem("workout", JSON.stringify(this.arr));
  }
  #getLocalstorage() {
    let contain = JSON.parse(localStorage.getItem("workout"));
    if (!contain) return;
    this.arr = contain;
    this.arr.forEach((el) => {
      this.#renderList(el);
    });
  }
  #change(e) {
    e.preventDefault();
    inputCadence.parentElement.classList.toggle("form__row--hidden");
    inputElevation.parentElement.classList.toggle("form__row--hidden");
  }
  reset() {
    localStorage.clear();
    location.reload();
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
class Workout {
  constructor(type, coords, distance, duration, date, data) {
    this.type = type;
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.date = date;
    this.random = data;
  }
}
class Running extends Workout {
  constructor(coords, distance, duration, date, cadence, data) {
    super("running", coords, distance, duration, date, data);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.speed = this.duration / this.distance;
    return this.speed;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, date, elevation, data) {
    super("cycling", coords, distance, duration, date, data);
    this.elevation = elevation;
    this.calcPace();
  }
  calcPace() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}
let app = new App();
