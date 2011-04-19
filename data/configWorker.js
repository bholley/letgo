// Our global array of filtered sites
var gFilteredSites = [];

// Receive messages from the addon
onMessage = function(message) {
  gFilteredSites = message;
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
  regenerateFilterList();
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
    listItem.innerHTML = filter;
    listElement.appendChild(listItem);
  }
}
