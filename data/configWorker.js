// Our global array of filtered sites
var gFilteredSites = [];

// What to do if the filters are updated
function filtersUpdated() {

  // Let the chrome-side script know the filter list has changed
  postMessage(gFilteredSites);

  // Update the UI
  regenerateFilterList();
}

// Receive messages from the addon
onMessage = function(message) {
  gFilteredSites = message;
  regenerateFilterList();
};

// Register our button handler
document.getElementById("inputbutton").onclick = function() {

  // Add the filter from the input box, and then clear it
  var inputBox = document.getElementById("inputbox");
  addFilter(inputBox.value);
  inputBox.value = "";
};

// Add a filter
function addFilter(filter) {
  gFilteredSites.push(filter);
  filtersUpdated();
}

// Remove a filter
function removeFilter(filter) {

  // Create a new filter array with all of the non-matching
  // elements from the old array.
  var newFilters = new Array();
  for (f in gFilteredSites)
    if (gFilteredSites[f] != filter)
      newFilters.push(gFilteredSites[f]);

  // Set the global array to the new array
  gFilteredSites = newFilters;

  // Notify updates
  filtersUpdated();
}

// Regenerates the filter list
function regenerateFilterList() {

  // Get a handle on the list div
  var listElement = document.getElementById("filterlist");

  // Delete all the children
  while (listElement.hasChildNodes())
    listElement.removeChild(listElement.firstChild);

  // Generate the list
  for (filter in gFilteredSites) {
    var listItem = document.createElement('li');
    var filterName = gFilteredSites[filter];
    listItem.innerHTML = filterName;
    listItem.onclick = function() {removeFilter(filterName);};
    listElement.appendChild(listItem);
  }
}
