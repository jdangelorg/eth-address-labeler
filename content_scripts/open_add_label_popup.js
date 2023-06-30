// create a div because teh shadow root cannot append to a body element.
// const popupMainDiv= document.createElement('div')
// popupMainDiv.classList.add('popup-main-div')
// popupMainDiv.style.cssText = `
//     position: absolute !important; 
//     top: 0px !important;
//     left: 0px !important; 
//     height: 0px !important; 
//     width: 0px !important;
// `
// document.body.appendChild(popupMainDiv)
// const shadowRoot = popupMainDiv.attachShadow({ mode: "open" });

chrome.runtime.onMessage.addListener(async(msg,sender,sendResponse)=>{
    const newAddress=msg.address
    if(msg.request === 'labelAttempt'){
        const newLabel = await window.prompt(`Please enter a label for this address: ${newAddress}`);
        if (newLabel) {
            // Using chrome.storage.sync to store the label
            chrome.storage.local.get('ethLabels', (res)=>{
                updateEthLabels(res.ethLabels,newLabel,newAddress)
            })
        }
    }
})

var updateEthLabels=(labelsObj, newLabel, newAddress)=>{
    labelsObj[newAddress] = newLabel
    chrome.storage.local.set({
        ethLabels:labelsObj
    },()=>{
        alert(newAddress+' is set to '+newLabel);
    })
}




// const object = shadowRoot.appendChild('object')

// object.data='../add_label_popup.html'