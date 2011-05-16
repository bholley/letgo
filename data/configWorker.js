// Our global array of filtered domains
var gFilteredDomains = [];

// What to do if the filters are updated
function filtersUpdated() {

  // Let the chrome-side script know the filter list has changed
  postMessage(gFilteredDomains);

  // Update the UI
  regenerateFilterList();
}

// Receive messages from the addon
onMessage = function(message) {
  gFilteredDomains = message;
  regenerateFilterList();
};

// Set up the input field
var inField = document.getElementById("inputbox");
inField.onkeydown = function(event) {

  // Only listen for enter
  if (event.keyCode != 13)
    return;

  // Add the filter from the input box, and then clear it
  addFilter(inField.value);
  inField.value = "";
};
inField.onblur = function() {
  inField.value = "Add filtered domains:";
  inField.style.color = "#808080";
}
inField.onblur();
inField.onfocus = function() {
  inField.value = "";
  inField.style.color = "black";
}

// Add a filter
function addFilter(filter) {

  // Sanitize the filter. If we've got nothing left, we're done.
  var saneFilter = sanitizeFilter(filter);
  if (saneFilter.length == 0)
    return;

  // Remove the filter, if it exists, from the existing filterset.
  removeFilter(saneFilter);

  // Add the filter to our set
  gFilteredDomains.push(saneFilter);

  // Notify of updates
  filtersUpdated();
}

// Remove a filter
function removeFilter(filter) {

  // Create a new filter array with all of the non-matching
  // elements from the old array.
  var newFilters = new Array();
  for (f in gFilteredDomains)
    if (gFilteredDomains[f] != filter)
      newFilters.push(gFilteredDomains[f]);

  // Set the global array to the new array
  gFilteredDomains = newFilters;

  // Notify updates
  filtersUpdated();
}

function sanitizeFilter(filter) {

  // Remove any preceding protocol
  filter = filter.replace(/.*\/\//, '');

  // Remove the first slash and everything following
  filter = filter.replace(/\/.*/, '');

  // Lowercase the domain
  filter = filter.toLowerCase();

  // Remove everything that isn't a valid domain character
  filter = filter.replace(/[^a-z0-9\-\.]/g, '');

  // All done!
  return filter;
}

// Regenerates the filter list
function regenerateFilterList() {

  // Get a handle on the list div
  var listElement = document.getElementById("filterlist");

  // Delete all the children
  while (listElement.hasChildNodes())
    listElement.removeChild(listElement.firstChild);

  // Generate the list
  for (filter in gFilteredDomains) {
    var listItem = document.createElement('li');
    var filterName = gFilteredDomains[filter];
    listItem.innerHTML = filterName;
    listItem.onclick = function() {removeFilter(this.innerHTML);};
    listElement.appendChild(listItem);
  }
}
