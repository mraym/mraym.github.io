function showTab( tabId ) {
  if (tabId === "enter-data") {
    document.getElementById( "enter-data" ).style.display = "block";
    document.getElementById( "list-entries" ).style.display = "none";
    document.getElementById( "analyze" ).style.display = "none";
    document.getElementById( "enter-data-list-item" ).classList.add("is-active");
    document.getElementById( "list-entries-list-item" ).classList.remove("is-active");
    document.getElementById( "analyze-list-item" ).classList.remove("is-active");
  }
  else if (tabId === "list-entries") {
    document.getElementById( "enter-data" ).style.display = "none";
    document.getElementById( "list-entries" ).style.display = "block";
    document.getElementById( "analyze" ).style.display = "none";
    document.getElementById( "enter-data-list-item" ).classList.remove("is-active");
    document.getElementById( "list-entries-list-item" ).classList.add("is-active");
    document.getElementById( "analyze-list-item" ).classList.remove("is-active");
    showLast10Entries();
  }
  else if (tabId === "analyze") {
    document.getElementById( "enter-data" ).style.display = "none";
    document.getElementById( "list-entries" ).style.display = "none";
    document.getElementById( "analyze" ).style.display = "block";
    document.getElementById( "enter-data-list-item" ).classList.remove("is-active");
    document.getElementById( "list-entries-list-item" ).classList.remove("is-active");
    document.getElementById( "analyze-list-item" ).classList.add("is-active");
    analyze();
  }
  document.getElementById( tabId ).style.display = "block";
}

function addToLocalDB() {

  today = new Date();
  // Get input
  let entry = {};
  entry["timestamp"] = today.toISOString();
  entry["amount"] = document.getElementById("amount").value;
  entry["store-name"] = document.getElementById("store-name").value;
  entry["description"] = document.getElementById("description").value;
  entry["category"] = document.getElementById("category").value;

  // insert data into local DB
  localforage.setItem(today.getTime().toString(), entry).then(function () {
    return localforage.getItem('key');
  }).then(function (value) {
    // we got our value
    showTab('list-entries');
  }).catch(function (err) {
    // we got an error
    alert("adding item failed");
  });  
}

function showLast10Entries() {
  listEntriesDiv.items = [];

  localforage.iterate(function(value, key, iterationNumber) {
    // Resulting key/value pair -- this callback
    // will be executed for every item in the
    // database.
    console.log([key, JSON.stringify(value)], iterationNumber);
    //add it to the array
    listEntriesDiv.items.push(value);
  }).then(function() {
    console.log('Iteration has completed');
  }).catch(function(err) {
    // This code runs if there were any errors
    console.log(err);
  });  
}

function analyze() {
  let totalToday = 0;
  let totalMonth = 0;
  let totalYTD = 0;

  localforage.iterate(function(value, key, iterationNumber) {
    // Resulting key/value pair -- this callback
    // will be executed for every item in the
    // database.
    today = new Date();
    todayMonth = today.getMonth();
    todayYear = today.getFullYear();
    currentItemDate = new Date(value["timestamp"]);
    currentItemMonth = currentItemDate.getMonth();
    currentItemYear = today.getFullYear();

    let amount = Number(value["amount"]);
    if (today >= currentItemDate) {
      totalToday += amount;
    }

    if (todayMonth === currentItemMonth) {
      totalMonth += amount;
    }

    if (todayYear === currentItemYear) {
      totalYTD += amount;
    }
  }).then(function() {
    console.log('Iteration has completed');
    analysisEntriesDiv.totalToday = totalToday;
    analysisEntriesDiv.totalMonth = totalMonth;
    analysisEntriesDiv.totalYTD = totalYTD;
  }).catch(function(err) {
    // This code runs if there were any errors
    console.log(err);
  });   
}

// populate #entry items
var listEntriesDiv = new Vue({
  el: '#entry-items',
  data: {
    items: []
  }
})

var analysisEntriesDiv = new Vue({
  el: '#analysis-items',
  data: {
    totalToday: 0,
    totalMonth: 0,
    totalYTD: 0
  }
})

// Everything below this line gets executed onload
window.indexedDB = window.indexedDB ||
                    window.mozIndexedDB ||
                    window.webkitIndexedDB ||
                    window.msIndexedDB;
if (window.indexedDB) {
  console.log("IndexedDB is supported.");
} else {
  console.log("IndexedDB is not supported.");
}

// Set up localforage to use IndexedDB
localforage.config({
  driver      : localforage.INDEXEDDB, // Force INDEXEDDB; same as using setDriver()
  name        : 'myApp',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'spending', // Should be alphanumeric, with underscores.
  description : 'track spending'
});