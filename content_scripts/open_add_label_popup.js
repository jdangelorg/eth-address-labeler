function createAddLabelPopup(selectedAddress) {
    // create a div because the shadow root cannot append to a body element.
    const popupMainDiv = document.createElement('div');
    popupMainDiv.classList.add('popup-main-div');
    
    // Set the CSS styles
    popupMainDiv.style.cssText = `
        position: fixed !important;
        top: -250px !important;
        right: 0.5rem !important;
        transition: top 0.3s ease;
        z-index: 9999 !important;
        width: 400px;
        height: 500px;
        background: white;
        border-radius: 5px;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    `;
    
    // Attach shadow root
    const shadowRoot = popupMainDiv.attachShadow({ mode: "open" });
    
    // Create content elements
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 10px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Add a label';
    title.style.cssText = `
        font-family: "Gill Sans", sans-serif;
        font-weight: bold;
        font-size: 22px;
        color: black;
        word-wrap: break-word;
    `;

    const subtitle = document.createElement('p')
    subtitle.textContent = 'Address:'
    subtitle.style.cssText = `
        font-family: "Gill Sans", sans-serif;
        font-weight: normal;
        font-size: 14px;
        color: black;
        word-wrap: break-word;
    `;
    
    const address = document.createElement('p');
    address.textContent = selectedAddress;
    address.style.cssText = `
        font-family: "Gill Sans", sans-serif;
        font-weight: normal;
        font-size: 14px;
        color: black;
        word-wrap: break-word;
    `;

    const inputLabel = document.createElement('input');
    inputLabel.type = 'text';
    inputLabel.placeholder = 'Enter label...';
    // inputLabel.style.cssText = ``;

    const colorSelector = document.createElement('input');
    colorSelector.type = 'color';
    // colorSelector.style.cssText = ``;
    
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    // submitButton.style.cssText = ``;
    
    // Append elements to shadow root
    shadowRoot.append(closeButton, title, subtitle, address, inputLabel, colorSelector, submitButton);
    
    // Append everything to the webpage
    document.body.appendChild(popupMainDiv);
    // automatically place the text cursor inside of the enter label input box
    inputLabel.focus()
    // After appending the popup to the body, start the animation
    setTimeout(() => {
        popupMainDiv.style.top = "0.5rem";  // End position inside of the view
    }, 0);

    return new Promise((resolve, reject) => {
        function submitHandler() {
            chrome.storage.local.get('ethLabels', (res)=>{
                const labels = Object.values(res.ethLabels)
                if(labels.includes(inputLabel.value.trim())){
                    reject('label already used') // reject the promise if the label has already been used for another address
                } else if(inputLabel.value !== ''){
                    removePopup(popupMainDiv)
                    resolve(inputLabel.value) // Resolve the Promise with the entered label
                } else {
                    reject('No label entered') // Reject the Promise if no label was entered
                }
            })
        }

        // Add event listeners to resolve the Promise and add the submitted label to the user's labels, click on the submit button and enter as well
        submitButton.addEventListener('click', submitHandler)
        inputLabel.addEventListener('keypress', (e)=>{
            if(e.key == 'Enter'){
                submitHandler()
            }
        })
        
        // Add closeButton event listener to close the popup and reject the Promise
        closeButton.addEventListener('click', () => {
            removePopup(popupMainDiv)
            reject('Popup closed') // Reject the Promise if the popup was closed
        });
    })
}

function removePopup(popupNode){
    document.body.removeChild(popupNode);
}


(async function() {
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    chrome.runtime.onMessage.addListener(async(msg,sender,sendResponse)=>{
        if(msg.request === 'labelAttempt'){
            const newAddress=msg.address.toLowerCase()
            const popupMainDivCheck = document.querySelector('.popup-main-div')
            if(popupMainDivCheck){
                removePopup(popupMainDivCheck)
                // document.body.removeChild(popupMainDivCheck)
            }
            const newLabel = await createAddLabelPopup(newAddress)
            if (newLabel) {
                // Using chrome.storage.sync to store the label
                chrome.storage.local.get('ethLabels', (res)=>{
                    updateEthLabels(res.ethLabels,newLabel,newAddress)
                })
            }
        }
    })
})();


var updateEthLabels=(labelsObj, newLabel, newAddress)=>{
    labelsObj[newAddress] = newLabel
    chrome.storage.local.set({
        ethLabels:labelsObj
    },()=>{
        chrome.runtime.sendMessage({request: 'newLabelAdded'})
    })
}