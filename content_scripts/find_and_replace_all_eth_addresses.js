// find and replace all ethereum addreses for all saved labels every time a new label is added
try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.request === 'newLabelAdded') {
            loadLabelsReplaceTextConstructObserver();
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
                // console.log('ethLabels object: ',res.ethLabels);
                const labels = res.ethLabels;

                // Obtain a list of regular expressions from the label keys
                const regexes = Object.keys(labels).map(address => {
                    // Create a regex that matches the full address or its shortened form
                    return `0x[a-fA-F0-9]{1,6}.*${address.substr(-4)}`;
                });

                // Combine all regular expressions into one
                const addressesRegex = new RegExp(regexes.join('|'), 'gi');
                // console.log('global addresses regex',addressesRegex)
    
                replaceText(document.body, labels, addressesRegex);
    
                // Initialize a mutation observer
                const observer = new MutationObserver((mutations)=>{
                    // For each mutation
                    mutations.forEach((mutation)=>{
                        // If nodes were added
                        if (mutation.addedNodes) {
                            // Process each added node
                            mutation.addedNodes.forEach((node)=>{
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    replaceText(node, labels, addressesRegex);
                                }
                            });
                        }
                    });
                });
        
                // Configure the observer to watch for nodes being added to the document, and then run replaceText on all new added nodes
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                // console.log('no labels saved');
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
function replaceText(node, labels, addressesRegex) {
    // If the element is a text node (any piece of text in an html document)
    if (node.nodeType === Node.TEXT_NODE) {
        // if(node.textContent == '27165a'){
        //     console.log('entered text node conditional')
        // }
        replaceTextInTextNode(node, labels, addressesRegex)
    // else if the element is an a tag (an element node) that contains an ethereum address in it, as well as text content that is the end of the address found
    // in a tag's href. this is for dexscreener.com because it doesn't show shortened addresses instead it shows the last 6 chars of the address
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A' && hrefIsEtherscanAddress(node.href) && isLinkTextEndOfAddress(node.textContent, node.href)) {
        // if(node.textContent == '27165a'){
        //     console.log('entered a tag node conditional')
        //     console.log('is the href an etherscan address link?', hrefIsEtherscanAddress(node.href))
        //     console.log('is the a tag text the end of that address?',isLinkTextEndOfAddress(node.textContent, node.href))
        // }
        // if (isLinkTextEndOfAddress(node.textContent, node.href)) {
            // If the text content of the a tag is the end of the Ethereum address found in the href, replace the a tag text content
            replaceTextInTextNode(node, labels, addressesRegex, true);
        // }
    } else {
        // If the node is not a text node, recurse into its child nodes
        for (let child of node.childNodes) {
            replaceText(child, labels, addressesRegex);
        }
    }
}

function replaceTextInTextNode(node, labels, addressesRegex, isLinkTextEndOfAddress = false) {
    let newContent = node.textContent;
    let address = ''
    // if(node.textContent == '27165a'){
    //     console.log('arguments passed to replaceTextInTextNode', node, labels, addressesRegex)
    //     console.log('isLinkTextEndOfAddress variable',isLinkTextEndOfAddress)
    // }
   
    if(isLinkTextEndOfAddress){
        // const endOfAddressRegex = /0x[a-fA-F0-9]{34}([a-fA-F0-9]{6})$/i;
        const hrefAddress = node.href.split('/').pop().toLowerCase();
        // if(node.textContent == '27165a'){
        //     console.log('inside isLinkTextEndOfAddress conditional')
        //     console.log('hrefAddress variable', hrefAddress)
        //     console.log('object.keys(labels)', Object.keys(labels))
        //     console.log('does label object include hrefAddress?: ', labels.hasOwnProperty(hrefAddress))
        // }
        if(labels.hasOwnProperty(hrefAddress)){
            newContent = labels[hrefAddress].label
            // console.log('labels[hrefAddress]: ', labels[hrefAddress])
        }
    } else {
        // Replace each match in the text content with the corresponding label, saves into a new variable because that's how the .replace function works,
        // looks into the text content of the particular node we're on, and for every instance of text ('matched substring') that matches our global address regex,
        // it runs a replacer function on it. if text content = 'when the dog named 0xAD74e1ca54b4289AD65E4897B8336289F2ac55Cd went to talk to his friend named 0x4Cc3cc...945F7633, they were very happy.'
        // the replacer function would run on both the first ethereum address and the again on the second, shortened one as well.
        newContent = node.textContent.replace(addressesRegex, (match) => {
            const matchedSubstr = match.toLowerCase()
            // if(node.textContent == '27165a'){
            //     console.log('variable matchedSubstr', matchedSubstr)
            // }
            // Retrieve the full address corresponding to the match, .find retrieves the first item in an array that satisfies the testing condition,
            // it loops through the array and tests each array item against a testing condition, in this case our could match function
            const fullAddress = Object.keys(labels).find(address => couldMatch(address, matchedSubstr));
            // If a full address was found, return the label, otherwise return the match unchanged
            // if(node.textContent == '27165a'){
            //     console.log('fullAddress variable',fullAddress)
            // }
            return fullAddress ? labels[fullAddress].label : matchedSubstr;
        });
    }
    // If the text content was changed, update it
    if (node.textContent !== newContent) {

        // Create a new mark element
        const mark = document.createElement('mark');

        // Set the mark element's text content
        mark.textContent = newContent;
        mark.style.cssText = `
            background-color: red;
            border-radius: 5px;  /* round corners */
            color: white;  /* change text color to white */
        `

        // Check if the parent node is an "a" tag
        if (node.parentNode.nodeName.toLowerCase() === 'a' || isLinkTextEndOfAddress) {
            // If it is, add additional styles
            mark.style.cssText += `
                text-decoration: underline;
                color: light grey;
            `;
        }

        // Replace the original text node with the new mark element
        if(isLinkTextEndOfAddress){
            node.childNodes[0].replaceWith(mark)
        }else{
            node.parentNode.replaceChild(mark, node);
        }
    }
}

function couldMatch(fullAddress, partialOrFullAddress) {
    // console.log(`inside could match function:, trying to see if full address: ${fullAddress} matches partialOrFullAddress: ${partialOrFullAddress}`);
    var partialStart = '';
    var partialEnd = '';

    const ellipsisRegex = /(\.\.\.)|(…)/;  // Matches either ... (3 dots, 3 chars) or … (an ellipsis, 1 char)

    const ellipsisIndex = partialOrFullAddress.search(ellipsisRegex);
    // console.log('partialOrFullAddress.length',partialOrFullAddress.length)
    if (ellipsisIndex === -1){
        // console.log('inside first conditional')
        partialStart = partialOrFullAddress.slice(0,21)
        partialEnd = partialOrFullAddress.slice(-21)
    } else {
        // console.log('inside second conditional')
        // console.log('Before split:', partialOrFullAddress);
        // [partialStart, partialEnd] = partialOrFullAddress.split('...');
        // const ellipsisIndex = partialOrFullAddress.indexOf('...');
        // console.log('ellipsisIndex', ellipsisIndex)
        partialStart = partialOrFullAddress.slice(0, ellipsisIndex);
        if(partialOrFullAddress.includes('...')){
            partialEnd = partialOrFullAddress.slice(ellipsisIndex + 3);
        }else {
            partialEnd = partialOrFullAddress.slice(ellipsisIndex + 1);
        }
    }
    // console.log('partialStart, partialEnd: ', partialStart, partialEnd)
    // const partialStart = partialOrFullAddress.substr(0, 4);  // Get the first 4 and last 4 characters of the address we're testing against
    // const partialEnd = partialOrFullAddress.substr(-4);
    const fullStart = fullAddress.substr(0, partialStart.length);  // Get the first 4 and last 4 characters of the full address gotten from the ethLabels database in storage
    const fullEnd = fullAddress.substr(-partialEnd.length);

    // Check if the partial address could match the full one
    // console.log('address is a match?:, partialStart, partialEnd, fullStart, fullEnd', partialStart === fullStart && partialEnd === fullEnd, partialStart, partialEnd, fullStart, fullEnd)
    return partialStart === fullStart && partialEnd === fullEnd;
}

function hrefIsEtherscanAddress(href) {
    // Check if the href contains the pattern found at the end of etherscan links
    const regex = /\/address\/0x[a-fA-F0-9]{40}$/i;
    return href && regex.test(href);
}

function isLinkTextEndOfAddress(text, href) {
    // Extract the address from the href
    const hrefAddress = href.split('/').pop();
    // Check if the link text is the last 6 characters of the href address
    return hrefAddress.endsWith(text);
}



