// ----------------------------------------------------------
// chart functions
// ----------------------------------------------------------
function creatNewChart(currentData, infoType, continent) {
  console.log(currentData);
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
function addData(label, data) {
  newChartInstance.data.labels.push(label);
  newChartInstance.data.datasets[0].data.push(data);
  newChartInstance.update();
  console.log(newChartInstance.data.labels);
  console.log(newChartInstance.data.datasets[0].data);
}
function replaceAllData(labelsArray, dataArray, infoType, continent) {
  console.log(labelsArray);
  console.log(dataArray);
  newChartInstance.data.labels = labelsArray;
  newChartInstance.data.datasets[0].data = dataArray;
  newChartInstance.data.datasets[0].label = `${infoType} in ${continent}`;
  newChartInstance.update();
  console.log(newChartInstance);
}
function removeAllData() {
  newChartInstance.data.labels = [];
  newChartInstance.data.datasets[0].data = [];
  newChartInstance.update();
  console.log(newChartInstance.data.labels);
  console.log(newChartInstance.data.datasets[0].data);
}
function removeChart() {
  covidChartElement.remove();
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
// ----------------------------------------------------------
// create buttons group function
function creatButtonsGroup(array, btnType) {
  array.forEach((button) => {
    const innerText = button[0].toUpperCase() + button.substring(1);
    createButtonElement(button, innerText, btnType);
  });
}
// ----------------------------------------------------------
// create dropdown country list
function fillDropdownCountries(countriesArray) {
  const countriesList = document.querySelector("#countries");
  for (const country of countriesArray) {
    const html = `<option value="${country}">${country}</option>`;
    countriesList.insertAdjacentHTML("beforeend", html);
  }
}
// ----------------------------------------------------------
// event listener function
// click a button handler
function handleClick(event) {
  const btnName = event.currentTarget.getAttribute("name");
  const btnType = event.currentTarget.getAttribute("data-btnType");
  if (btnType === "infoType") {
    changeInfoType(btnName);
  }
  if (btnType === "continent") {
    changeContinent(btnName);
  }
  // console.log(btnName);
  // console.log(btnType);
}
async function changeInfoType(btnName) {
  currentDisplay.infoType = btnName;
  const newData = await createChartData(
    currentDisplay.continent,
    currentDisplay.infoType,
  );
  console.log(newData);
  replaceAllData(
    newData.dataLabels,
    newData.dataValues,
    currentDisplay.infoType,
    currentDisplay.continent,
  );
}
async function changeContinent(continent) {
  currentDisplay.continent = continent;
  const newData = await createChartData(
    currentDisplay.continent,
    currentDisplay.infoType,
  );
  console.log(newData);
  replaceAllData(
    newData.dataLabels,
    newData.dataValues,
    currentDisplay.infoType,
    currentDisplay.continent,
  );
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
  // create dropdown of countries
  fillDropdownCountries(currentData.dataLabels);
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
// ----------------------------------------------------------
// create new data object for the chart.
// ----------------------------------------------------------
// returns:
// let currentData = {
//   dataLabels: dataLabelsArray,
//   dataValues: dataValuesArray,
// };
async function createChartData(continent, infoType) {
  // go over country codes in given continent. for each code fetch relevant info and country name. put each in the relevant array.
  let dataLabelsArray = [];
  let dataValuesArray = [];
  // get relevant urls
  if (continent === "world") {
    const worldCoronaUrl = getUrl.allCountriesCorona();
    // get data from urls
    const continentFullCoronaData = await fetchUrl(worldCoronaUrl);
    // save name and value of infoType given
    for (let country of continentFullCoronaData.data) {
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
      const url = getUrl.byCountryCorona(code);
      // get data from urls
      const countryCoronaData = await fetchUrl(url);
      if (countryCoronaData) {
        dataLabelsArray.push(countryCoronaData.data.name);
        dataValuesArray.push(countryCoronaData.data.latest_data[infoType]);
      }
    }
  }
  console.log(dataLabelsArray);
  console.log(dataValuesArray);
  return {
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
// ----------------------------------------------------------
// set current display to default
// ----------------------------------------------------------
let currentDisplay = { infoType: "confirmed", continent: "world" };
// ----------------------------------------------------------
// define global chart variables
// ----------------------------------------------------------
let newChartInstance;
let covidChartElement;
// ----------------------------------------------------------
// data for testing the chart:
// ----------------------------------------------------------

let dataLabels = [];
let dataValues = [];

let currentData = {
  dataLabels,
  dataValues,
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
