// ----------------------------------------------------------
// chart functions
// ----------------------------------------------------------
function creatNewChart(currentData, infoType, continent) {
  const covidChart1 = document.createElement("canvas");
  covidChart1.setAttribute("id", "#covidChart");
  chartContainer.appendChild(covidChart1);
  newChartInstance = new Chart(covidChart1, {
    type: "line",
    data: {
      labels: currentData.dataLabels,
      datasets: [
        {
          label: `${infoType} in ${continent}`,
          data: currentData.dataValues,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
  return covidChart1;
}
function replaceAllData(labelsArray, dataArray, infoType, continent) {
  newChartInstance.data.labels = labelsArray;
  newChartInstance.data.datasets[0].data = dataArray;
  newChartInstance.data.datasets[0].label = `${infoType} in ${continent}`;
  newChartInstance.update();
}
// ----------------------------------------------------------
// create buttons:
// ----------------------------------------------------------
// create a button function
function createButtonElement(name, innerText, btnType) {
  const btn = document.createElement("button");
  btn.classList.add("btn");
  btn.setAttribute("type", "button");
  btn.setAttribute("name", name);
  btn.setAttribute("data-btnType", btnType);
  btn.innerText = innerText;
  btn.addEventListener("click", handleClick);
  document.querySelector(`.${btnType}`).appendChild(btn);
}
// create buttons group function
function creatButtonsGroup(array, btnType) {
  array.forEach((button) => {
    const innerText = button[0].toUpperCase() + button.substring(1);
    createButtonElement(button, innerText, btnType);
  });
}
// ----------------------------------------------------------
// create dropdown country list
// ----------------------------------------------------------
function fillDropdownCountries(countriesArray) {
  countriesList.addEventListener("change", handleCountryChoice);
  countriesList.innerHTML =
    '<option value="SelectOption" selected>-- Select an Country --</option>';
  for (const country of countriesArray) {
    const html = `<option value="${country}">${country}</option>`;
    countriesList.insertAdjacentHTML("beforeend", html);
  }
}
// ----------------------------------------------------------
// event listener functions
// ----------------------------------------------------------
// click a button handler
async function handleClick(event) {
  spinnerContainerElement.classList.remove("hidden");
  const btnName = event.currentTarget.getAttribute("name");
  const btnType = event.currentTarget.getAttribute("data-btnType");
  countryDataContainer.classList.add("hidden");
  if (btnType === "infoType") {
    currentDisplay.infoType = btnName;
  }
  if (btnType === "continent") {
    currentDisplay.continent = btnName;
  }
  const newData = await createChartData(
    currentDisplay.continent,
    currentDisplay.infoType,
  );
  updateChart(newData);
  spinnerContainerElement.classList.add("hidden");
}
function updateChart(newData) {
  replaceAllData(
    newData.dataLabels,
    newData.dataValues,
    currentDisplay.infoType,
    currentDisplay.continent,
  );
}
function handleCountryChoice(event) {
  const chosenCountry = event.target.value;
  spinnerContainerElement.classList.remove("hidden");
  countryDataContainer.classList.remove("hidden");
  displayCountryData(chosenCountry);
  spinnerContainerElement.classList.add("hidden");
}
async function displayCountryData(chosenCountryName) {
  const countryIndex = currentData.dataLabels.findIndex(
    (countryName) => countryName === chosenCountryName,
  );
  const countryCode = currentData.dataCode[countryIndex];
  const countryData = await getCountryData(countryCode);
  const countryObj = createCountryObj(countryData);
  const html = `
  <h2>${countryObj.name}</h2>
  <h3>Total Confirmed Cases: ${countryObj.confirmed}</h3>
  <h3>New Confirmed Cases: ${countryObj.newConfirmed}</h3>
  <h3>Total Critical Cases: ${countryObj.critical}</h3>
  <h3>Total Deaths: ${countryObj.deaths}</h3>
  <h3>New Deaths: ${countryObj.newDeaths}</h3>
  <h3>Total Recovered: ${countryObj.recovered}</h3>`;
  countryDataElement.innerHTML = html;
  console.log(countryObj);
}
// ----------------------------------------------------------
// pull relevant data of a country from the API to an object
// ----------------------------------------------------------
function createCountryObj(countryData) {
  if (countryData) {
    const countryObj = {
      name: countryData.data.name,
      code: countryData.data.code,
      confirmed: countryData.data.latest_data.confirmed,
      newConfirmed: countryData.data.today.confirmed,
      critical: countryData.data.latest_data.critical,
      deaths: countryData.data.latest_data.deaths,
      newDeaths: countryData.data.latest_data.critical,
      recovered: countryData.data.today.deaths,
    };
    return countryObj;
  }
}
// ----------------------------------------------------------
// do on load of window
// ----------------------------------------------------------
async function onLoad() {
  // chart type buttons
  const chartTypesArray = ["confirmed", "critical", "deaths", "recovered"];
  creatButtonsGroup(chartTypesArray, "infoType");
  // continent buttons
  const continentsArray = ["Asia", "Europe", "Africa", "Americas", "world"];
  creatButtonsGroup(continentsArray, "continent");
  // fetch data of default chart display (confirmed world)
  currentData = await createChartData("world", "confirmed");
  // fill chart and country dropdown
  covidChartElement = creatNewChart(currentData, "confirmed", "world");
}
// ----------------------------------------------------------
// pulling data from the APIs
// ----------------------------------------------------------
// generic fetch function
// ----------------------------------------------------------
async function fetchUrl(url) {
  if (parseInt((response = await fetch(url)).status) !== 404) {
    const data = await response.json();
    return data;
  } else return false;
}
async function getCountryData(countryCode) {
  const url = getUrl.byCountryCorona(countryCode);
  // get data from urls
  return await fetchUrl(url);
}
// ----------------------------------------------------------
// create new data object for the chart.
// ----------------------------------------------------------
async function createChartData(continent, infoType) {
  // go over country codes in given continent. for each code fetch relevant info and country name. put each in the relevant array.
  spinnerContainerElement.classList.remove("hidden");
  let dataLabelsArray = [];
  let dataValuesArray = [];
  let dataCodeArray = [];
  // get relevant urls
  if (continent === "world") {
    const worldCoronaUrl = getUrl.allCountriesCorona();
    // get data from urls
    const continentFullCoronaData = await fetchUrl(worldCoronaUrl);
    // save name and value of infoType given
    for (let country of continentFullCoronaData.data) {
      dataCodeArray.push(country.code);
      dataLabelsArray.push(country.name);
      dataValuesArray.push(country.latest_data[infoType]);
    }
  } else {
    const countryCodesUrl = getUrl.byContinentCountries(continent);
    // get data from urls
    const continentAllCodes = await fetchUrl(countryCodesUrl);
    // save name and value of infoType given
    for (let country of continentAllCodes) {
      const code = country.cca2;
      countryCoronaData = await getCountryData(code);
      if (countryCoronaData) {
        dataCodeArray.push(code);
        dataLabelsArray.push(countryCoronaData.data.name);
        dataValuesArray.push(countryCoronaData.data.latest_data[infoType]);
      }
    }
  }
  console.log(dataCodeArray);
  console.log(dataLabelsArray);
  console.log(dataValuesArray);
  // create dropdown of countries

  fillDropdownCountries(dataLabelsArray);

  spinnerContainerElement.classList.add("hidden");

  return {
    dataCode: dataCodeArray,
    dataLabels: dataLabelsArray,
    dataValues: dataValuesArray,
  };
}
// ----------------------------------------------------------

// ----------------------------------------------------------
// ----------------------------------------------------------

// ----------------------------------------------------------
// select DOM elements
// ----------------------------------------------------------
const buttonsInfoTypeContainer = document.querySelector(
  ".buttons-container.infoType",
);
const buttonsContinentContainer = document.querySelector(
  ".buttons-container.continent",
);
const chartContainer = document.querySelector(".chart-container");
const countriesList = document.querySelector("select#countries");
const countryDataContainer = document.querySelector(".countryData-container");
const spinnerContainerElement = document.querySelector(".spinner-container");
const countryDataElement = document.querySelector(".countryData");
// ----------------------------------------------------------
// set current display to default
// ----------------------------------------------------------
let currentDisplay = {
  infoType: "confirmed",
  continent: "world",
};
// ----------------------------------------------------------
// define global chart variables
// ----------------------------------------------------------
let newChartInstance;
let covidChartElement;

let currentData = {
  dataLabels: [],
  dataValues: [],
  dataCode: [],
};
// ----------------------------------------------------------
// urls object
// ----------------------------------------------------------
const getUrl = {
  // proxy url
  proxy: "https://api.allorigins.win/raw?url=",

  // all countries:
  allCountriesCorona() {
    return "https://corona-api.com/countries";
  },
  // Get a specific country:
  byCountryCorona(countryCode) {
    return `https://corona-api.com/countries/${countryCode}`;
  },
  allCountries() {
    return `${this.proxy}https://restcountries.herokuapp.com/api/v1`;
  },
  // Get list of countries by continent
  byContinentCountries(continentName) {
    return `${this.proxy}https://restcountries.herokuapp.com/api/v1/region/${continentName}`;
  },
};
// ----------------------------------------------------------
// on load add buttons and default chart
// ----------------------------------------------------------
window.addEventListener("load", onLoad);
