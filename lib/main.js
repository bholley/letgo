// Globals
var tabs;
var pageMod;

// Initializer
exports.main = function() {

  // Grab our tabs
  tabs = require("tabs");

  // Set the pageMod
  pageMod = require("page-mod").PageMod({

    // For which URLs is the pagemod deployed?
    include: require("preferences-service").get("LetGo.filteredSites", "")
                                           .split(';'),

    // Content worker source code
    contentScriptFile: [require("self").data.url("util.js"),
    require("self").data.url("workerScript.js")],

    // Chrome-side handler invoked after the content code is deployed
    onAttach: function(worker) {

      // Set us up to receive a message from the content script
      worker.on('message', function(message) {this.tab.LetGo_Unguarded = true;});

      // Send information to the content script
      worker.postMessage({
        unguarded: worker.tab.hasOwnProperty("LetGo_Unguarded"),
        holdingPageURL: "http://www.stanford.edu/~bh10/letgo/holdingPage.html"
      });
    }
  });
};

// Unload handler
exports.onUnload = function(reason) {

  // Destroy the pagemod
  pageMod.destroy();

  // Remove our flag property from any tab that might have it
  for each (var tab in tabs)
    delete tab.LetGo_Unguarded;
};
