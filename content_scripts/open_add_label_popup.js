async function createAddLabelPopup(selectedAddress) {
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
        // console.log('promise created')
        function submitHandler() {
            chrome.storage.local.get('ethLabels', (res)=>{
                const lowerCaseLabels = Object.values(res.ethLabels).map(label => label.toLowerCase());
                if(lowerCaseLabels.includes(inputLabel.value.toLowerCase().trim())){
                    createLabelErrorMsg(shadowRoot, 'Label already used. Can only use labels once.')
                } else if (inputLabel.value.length > 256){
                    createLabelErrorMsg(shadowRoot, 'Label is too long. Labels can be 256 characters max.')
                } else if(inputLabel.value !== ''){
                    removePopup(popupMainDiv)
                    resolve(inputLabel.value) // allow with the entered label and close the popup window
                } else {
                    createLabelErrorMsg(shadowRoot, 'No label entered.')
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

function createLabelErrorMsg(shadowRootNode, errorMessage){
    const errorMsgCheck = shadowRootNode.querySelector('.error-msg-text')
    if(errorMsgCheck){
        shadowRootNode.removeChild(errorMsgCheck)
    }
    const errorMessageNode = document.createElement('p')
    errorMessageNode.classList.add('error-msg-text')
    errorMessageNode.textContent = errorMessage
    errorMessageNode.style.cssText = `
        color: red;
    `
    shadowRootNode.append(errorMessageNode)
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
            }
            try{
                var newLabel = await createAddLabelPopup(newAddress)
            }catch(error){
                if(error==='Popup closed'){
                    // Do nothing
                }else{
                    console.error(error)
                }
            }
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