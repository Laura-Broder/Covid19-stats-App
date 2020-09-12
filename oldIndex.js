// ----------------------------------------------------------
const chartContainer = document.querySelector(".chart-container");
// ----------------------------------------------------------
let theChartObj;
// ----------------------------------------------------------
// on load add buttons and default chart
window.addEventListener("load", onLoad);

// ----------------------------------------------------------
async function onLoad() {
  // chart type buttons
  const chartTypesArray = ["confirmed", "critical", "deaths", "recovered"];
  creatButtonsGroup(chartTypesArray, "chartType");

  // continent buttons
  const continentsArray = ["Asia", "Europe", "Africa", "Americas", "world"];
  creatButtonsGroup(continentsArray, "continent");

  // countries choice
  // createCountryListElement(["a", "b", "c"]);
  displayData("asia", "confirmed");
  // create chart
}

// ----------------------------------------------------------
async function displayData(continent, dataType) {
  let dataObj = [];

  dataObj = await createChartData(continent, dataType);
  createCountryListElement(dataObj[1]);
  theChartObj = await chartFunctions.createChart(dataObj, dataType);
  console.log(theChartObj);
}
// ----------------------------------------------------------
// create a button function
function createButtonElement(name, innerText, dataType) {
  const btn = document.createElement("button");
  btn.classList.add("btn");
  btn.setAttribute("type", "button");
  btn.setAttribute("name", name);
  btn.setAttribute("data-type", dataType);
  btn.innerText = innerText;
  btn.addEventListener("click", changeInfoType);
  document.querySelector(`.${dataType}`).appendChild(btn);
}
// ----------------------------------------------------------
let currentDisplay = {
  continent: "world",
  dataType: "confirmed",
};

// ----------------------------------------------------------
// click a button handler
function changeInfoType(event) {
  // const myChart = document.querySelector("#myChart");
  chartFunctions.removeData(theChartObj);
  const btnName = event.currentTarget.getAttribute("name");
  const btnType = event.currentTarget.getAttribute("data-type");
  if (btnType === "chartType") {
    currentDisplay.dataType = btnName;
  }
  if (btnType === "continent") {
    currentDisplay.continent = btnName;
  }

  displayData(currentDisplay.continent, currentDisplay.dataType);
  console.log(btnName);
  console.log(btnType);
}
// ----------------------------------------------------------
// create buttons group function
function creatButtonsGroup(array, dataType) {
  array.forEach((button) => {
    const innerText = button[0].toUpperCase() + button.substring(1);
    createButtonElement(button, innerText, dataType);
  });
}

// ----------------------------------------------------------

// ----------------------------------------------------------
// pulling data from the APIs
// generic fetch function
async function fetchUrl(url) {
  if (parseInt((response = await fetch(url)).status) !== 404) {
    const data = await response.json();
    // console.log("data from:", url);
    // console.log("response:", response);
    // console.log("data:", data);
    return data;
  } else return false;
}
// urls object
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
// countries choice
async function createCountryListElement(countriesArray) {
  // console.log("from createCountryListElement", countriesArray);
  const countriesList = document.querySelector("#countries");
  countriesArray.forEach((country) => {
    // console.log("from countriesArray.forEach((country)", country);
    const html = `<option value="${country}">${country}</option>`;
    countriesList.insertAdjacentHTML("beforeend", html);
  });
}
// ----------------------------------------------------------

// create data array for chart
let dataForChart = new Array();
let labelsForChart = new Array();
async function createChartData(continent, dataType) {
  const countriesCodes = await creatContinentCountriesArray(continent);
  for (let countryCode of countriesCodes) {
    const countryUrl = getUrl.byCountryCorona(countryCode);
    const countryData = await fetchUrl(countryUrl);
    // if (countryData) console.log(countryData.data.latest_data[dataType]);

    if (countryData) {
      // const countryObj = createCountryObj(countryData);
      dataForChart.push(countryData.data.latest_data[dataType]);
      // console.log(dataForChart);
      labelsForChart.push(countryData.data.name);
    }
  }
  // console.log("from createChartData", await dataForChart);
  // console.log("from createChartData", await labelsForChart);
  return [dataForChart, labelsForChart];
}
// ----------------------------------------------------------
const chartFunctions = {
  async createChart(data1, dataType) {
    const myChart = document.createElement("canvas");
    myChart.setAttribute("id", "myChart");
    chartContainer.appendChild(myChart);
    console.log(myChart);
    let ctx = myChart.getContext("2d");
    let dataObj = [];
    dataObj = await data1;
    let newData = {
      // The type of chart we want to create
      type: "line",

      // The data for our dataset
      data: {
        labels: dataObj[1],
        datasets: [
          {
            label: dataType,
            data: dataObj[0],
          },
        ],
      },
      // Configuration options go here
      options: {},
    };
    let theChart = new Chart(ctx, newData);
    console.log(theChart);
    return theChart;
  },
  removeData(chart) {
    console.log(chart);
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
    });
    chart.update();
  },
};

// ----------------------------------------------------------
function createCountryObj(countryData) {
  if (countryData) {
    // console.log(countryData);
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
async function creatContinentCountriesArray(continent) {
  let countriesList;
  if (continent === "world") {
    countriesList = await fetchUrl(getUrl.allCountries());
  } else {
    countriesList = await fetchUrl(getUrl.byContinentCountries(continent));
  }
  // console.log(countriesList);
  const countriesArray1 = countriesList.map((country) => country.cca2);
  // console.log(countriesArray1);
  return countriesArray1;
}
