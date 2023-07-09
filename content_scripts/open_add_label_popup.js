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

    const whatever = document.createElement('p')
    whatever.textContent = 'Address:'
    
    const addressLabel = document.createElement('p');
    addressLabel.textContent = selectedAddress;
    
    const inputLabel = document.createElement('input');
    inputLabel.type = 'text';
    inputLabel.placeholder = 'Enter label...';
    
    const colorSelector = document.createElement('input');
    colorSelector.type = 'color';
    
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    
    // Append elements to shadow root
    shadowRoot.append(closeButton, title, whatever, addressLabel, inputLabel, colorSelector, submitButton);
    
    // Append everything to the webpage
    document.body.appendChild(popupMainDiv);
    // After appending the popup to the body, start the animation
    setTimeout(() => {
        popupMainDiv.style.top = "0.5rem";  // End position inside of the view
    }, 0);

    return new Promise((resolve, reject) => {
        // Add submitButton event listener to resolve the Promise
        submitButton.addEventListener('click', ()=>{
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
        })
        
        // Add closeButton event listener to reject the Promise
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
            console.log('newLabel',newLabel)
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
        alert(newAddress+' is set to '+newLabel);
        chrome.runtime.sendMessage({request: 'newLabelAdded'})
    })
}