// find and replace all ethereum addreses for all saved labels every time a new label is added
try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.request === 'newLabelAdded') {
            loadLabelsReplaceTextConstructObserver();
            alert('replacing new label!')
        }
    });
} catch (err) {
    console.error(err);
    console.log('error in receiving newLabelAdded message and replacing text');
}

// This is a new function to load labels and run replaceText on the document.
// This function is called when the page initially loads and whenever a new label is added.
function loadLabelsReplaceTextConstructObserver() {
    chrome.storage.local.get(['ethLabels','replaceTextState'], (res) => {
        if(res.replaceTextState){
            if (res.ethLabels && Object.keys(res.ethLabels).length > 0) {
                console.log(res.ethLabels);
                const labels = res.ethLabels;
    
                replaceText(document.body, labels);
    
                // Initialize a mutation observer
                const observer = new MutationObserver((mutations)=>{
                    // For each mutation
                    mutations.forEach((mutation)=>{
                        // If nodes were added
                        if (mutation.addedNodes) {
                            // Process each added node
                            mutation.addedNodes.forEach((node)=>{
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    replaceText(node, labels);
                                }
                            });
                        }
                    });
                });
        
                // Configure the observer to watch for nodes being added to the document, and then run replaceText on all new added nodes
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                console.log('no labels saved');
            }
        }
    });
}

// find and replace all ethereum addreses for all saved labels on page load
try{
    window.addEventListener("load", (event)=>{
        loadLabelsReplaceTextConstructObserver()
    })
}catch(err){
    console.error(err)
    console.log('error on load and replacing text')
}

// the replace text functions
function replaceText(node, labels) {
    if (node.nodeType === Node.TEXT_NODE) {
        // Obtain a list of regular expressions from the label keys
        const regexes = Object.keys(labels).map(address => {
            // Create a regex that matches the full address or its shortened form
            return `0x[a-fA-F0-9]{4,6}.*${address.substr(-4)}`;
        });

        // Combine all regular expressions into one
        const regex = new RegExp(regexes.join('|'), 'gi');
        /* console.log('regex',regex)

        // now, use this regex to test a string:
        let testStr = 'Some text with your eth address 0xabcd...1234 somewhere in between 0x5c6403...0f72E99D yjhghh 0x5c64031C62061865E5FD0F53d3CDaeF80f72E99D';
        let result = testStr.match(regex);

        console.log('regex test: ',result);  // will print the matching parts of the string */

        // Replace each match in the text content with the corresponding label
        const newContent = node.textContent.replace(regex, match => {
            // Retrieve the full address corresponding to the match
            const fullAddress = Object.keys(labels).find(address => couldMatch(address, match));
            // If a full address was found, return the label, otherwise return the match unchanged
            return fullAddress ? labels[fullAddress] : match;
        });

        // If the text content was changed, update it
        if (node.textContent !== newContent) {
            node.textContent = newContent;
        }
    } else {
        // If the node is not a text node, recurse into its child nodes
        for (let child of node.childNodes) {
            replaceText(child, labels);
        }
    }
}

function couldMatch(fullAddress, partialAddress) {
    const partialStart = partialAddress.substr(0, 4);  // Get the first 4 characters
    const partialEnd = partialAddress.substr(-4);  // Get the last 4 characters
    const fullStart = fullAddress.substr(0, 4);  // Get the first 4 characters of the full address
    const fullEnd = fullAddress.substr(-4);  // Get the last 4 characters of the full address

    // Check if the partial address could match the full one
    return partialStart === fullStart && partialEnd === fullEnd;
}



