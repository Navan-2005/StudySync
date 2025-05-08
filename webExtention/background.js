chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    const url = new URL(details.url);
    const domain = url.hostname.replace(/^www\./, ''); // Normalize
  
    chrome.storage.sync.get(['blockedSites'], (data) => {
      const blocked = data.blockedSites || [];
  
      if (blocked.includes(domain)) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL("block.html")
        });
      }
    });
  }, {
    url: [{ schemes: ["http", "https"] }]
  });
//   chrome.webNavigation.onBeforeNavigate.addListener((details) => {
//     const url = new URL(details.url);
//     const domain = url.hostname.replace(/^www\./, ''); // Normalize domain
  
//     chrome.storage.sync.get(['blockedSites'], (data) => {
//       const blocked = data.blockedSites || [];
  
//       if (blocked.includes(domain)) {
//         // Redirect to a specific website (e.g., a "focus mode" page)
//         const redirectUrl = "https://www.focusmode.com"; // Change this URL to your desired redirect URL
//         chrome.tabs.update(details.tabId, {
//           url: redirectUrl
//         });
//       }
//     });
//   }, {
//     url: [{ schemes: ["http", "https"] }]
//   });
  
  