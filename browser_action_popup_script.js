document.addEventListener("DOMContentLoaded", (event)=>{
    const addressesWindow = (document.getElementsByClassName('addresses-window'))[0]

    var selectedSort = null
    
    chrome.storage.local.get('selectedSort', (res)=>{
        selectedSort = res.selectedSort
    })

    // Function to load and display the addresses
    function loadAddresses(editable = false) { 
        addressesWindow.innerHTML = '';

        // Get saved addresses from local storage
        chrome.storage.local.get('ethLabels', (res) => {
            // if there are any labels in storage, populate the window with them
            if (Object.keys(res.ethLabels).length > 0) {
                const addressesListDiv = document.createElement('div')
                addressesListDiv.style.cssText = `
                    background-color: #FAF9F6;
                    overflow-y: auto;
                    height:96%;
                    max-height: 96%;
                    width:97%;
                    display:flex;
                    flex-direction:column;
                    align-items:flex-start;
                `

                addressesWindow.appendChild(addressesListDiv)

                let addresses = Object.keys(res.ethLabels)
                // console.log('addresses', addresses)

                // Sort the addresses based on the selected sort method
                if (selectedSort === 'Newest First' || selectedSort === 'undefined' || selectedSort === null) {
                    addresses.sort((a, b) => res.ethLabels[b].timestamp - res.ethLabels[a].timestamp);
                } else if (selectedSort === 'Oldest First') {
                    addresses.sort((a, b) => res.ethLabels[a].timestamp - res.ethLabels[b].timestamp);
                } else if (selectedSort === 'Alphabetically') {
                    addresses.sort((a, b) => res.ethLabels[a].label.localeCompare(res.ethLabels[b].label));
                }
                
                addresses.forEach((address, i) => {
                    // var wrapperDiv = document.createElement('div');
                    // wrapperDiv.style.cssText = `
                    //     display: flex;
                    //     justify-content: space-between;
                    //     align-items: center;
                    //     position: relative;
                    // `;
                    var outerDiv = document.createElement('div');
                    outerDiv.style.cssText = `
                        border: 2px solid transparent;
                        display: inline-block;
                        margin-top:-2px;
                        width:100%;
                        box-sizing:border-box;
                    `
                    var labelAddressPairDiv = document.createElement('div')
                    labelAddressPairDiv.style.cssText = `
                        display:flex;
                        border-bottom: 1px solid black;
                        justify-content:space-between;
                        align-items:center;
                    `
                    var labelText = document.createElement('h4');
                    labelText.textContent = `${res.ethLabels[address].label}`;
                    labelText.style.cssText = `
                        margin:0;
                        overflow-wrap: break-word;
                        word-break: break-all;
                    `                        
                    var colonText = document.createElement('h4')
                    colonText.textContent = ':'
                    colonText.style.cssText = `
                        margin:0;
                    `
                    var addressText = document.createElement('h4')
                    addressText.textContent = `${address.substr(0, 7)}...${address.substr(-7)}`
                    addressText.style.cssText = `
                        margin:0;
                    `
                    addressesListDiv.appendChild(outerDiv);
                    outerDiv.appendChild(labelAddressPairDiv)
                    labelAddressPairDiv.appendChild(labelText)
                    labelAddressPairDiv.appendChild(colonText)
                    labelAddressPairDiv.appendChild(addressText)
                    
                    if(editable) {
                        labelText.contentEditable = "true";
                        labelText.dataset.originalText = res.ethLabels[address].label;
                        
                        // mouseover and mouseout change the onHover style of each label ,
                        // making it intuitive that the user can do something with each label when in edit mode by thickening the surrounding borders
                        // and changing the cursor to the finger pointer
                        labelAddressPairDiv.addEventListener("mouseover", function(){
                            labelAddressPairDiv.style.cursor = 'pointer'
                            labelAddressPairDiv.style.borderBottomColor = 'transparent';
                            outerDiv.style.borderColor = 'black';                                    
                        });
                        
                        labelAddressPairDiv.addEventListener("mouseout", function(){                            
                            labelAddressPairDiv.style.cursor = 'auto';                        
                            labelAddressPairDiv.style.borderBottomColor = 'black';
                            outerDiv.style.borderColor = 'transparent';
                        });

                        // this makes it so that when you click on the label the cursor will be brough to the end of the label text so the user can start editing it
                        labelAddressPairDiv.addEventListener('click', function() {
                            // Set the caret at the end of the text
                            let range = document.createRange();
                            let sel = window.getSelection();
                            range.setStart(labelText.childNodes[0], labelText.textContent.length);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            // focus on the label
                            labelText.focus();
                        });
                        
                        // and this is the code so that the user can make their changes a reality in the program
                        labelText.addEventListener("input", (event)=>{
                            let newLabel = event.target.textContent
                            if (newLabel !== event.target.dataset.originalText) {
                                // if label has changed, display the checkmark and X icons
                                displayIcons(outerDiv, labelText, address);
                            }

                            function displayIcons(outerDiv, labelText, address) {
                                // create checkmark and x icons
                                const checkIcon = document.createElement("span");
                                checkIcon.textContent = "✓";
                                checkIcon.style.cssText = `
                                    position: absolute;
                                    right: -40px;
                                    top: calc(50% - 18px);
                                    cursor: pointer;
                                    color: lightgrey;
                                    font-size:20px;                                    
                                `;
                            
                                const xIcon = document.createElement("span");
                                xIcon.textContent = "✗";
                                xIcon.style.cssText = `
                                    position: absolute;
                                    right: -20px;
                                    top: calc(50% - 18px);
                                    cursor: pointer;
                                    color: lightgrey;
                                    font-size:20px;                                    
                                `;

                                const trashIcon = document.createElement('img')
                                trashIcon.src = 'trash_bin_icon_lightgrey_512x512px.png'
                                trashIcon.style.cssText = `
                                
                                `
                            
                                // append the icons to the label
                                outerDiv.appendChild(checkIcon);
                                outerDiv.appendChild(xIcon);
                            
                                // set click event listeners for the icons
                                checkIcon.addEventListener("click", (event) => {
                                    // update the label in storage
                                    const newLabel = labelText.textContent
                                    chrome.storage.local.get('ethLabels', (res)=>{
                                        res.ethLabels[address].label = newLabel;
                                        chrome.storage.local.set({ethLabels: res.ethLabels}, ()=>{
                                            console.log('Label updated');
                                        });
                                    });
                                });
                            
                                xIcon.addEventListener("click", ()=>{
                                    // revert the label to the original text
                                    labelText.textContent = `${labelText.dataset.originalText}`;
                                    checkIcon.remove();
                                    xIcon.remove();
                                });
                            }
                        });
                    }
                });
            } else {
                var actionMsg = `
                    <h3>You don't have any saved addresses! Try
                    <a href='https://etherscan.io/address/0x0000000000000000000000000000000000000000' target='_blank'>this</a>
                    one to start.</h3>
                `;
                addressesWindow.innerHTML = actionMsg;
            }
                
            if(editable){
                const sortAddressesDiv = document.createElement('div')
                sortAddressesDiv.style.cssText = `
                    position: absolute;
                    bottom: -18px;
                    width: 100%;
                `
                const sortAddressesDropdown = document.createElement('select')
                sortAddressesDropdown.id = 'sort-addresses-dropdown'
    
                sortAddressesDropdown.addEventListener('change', (event)=>{
                    selectedSort = event.target.options[event.target.selectedIndex].text;
                    chrome.storage.local.set({selectedSort:selectedSort})
                    loadAddresses(true)
                })
    
                const sortAddressesDropdownLabel = document.createElement('label')
                sortAddressesDropdownLabel.for = 'sort-addresses-dropdown'
                sortAddressesDropdownLabel.textContent = ' <- Sort by'
    
                const sortAddressesOptionNewestFirst = document.createElement('option')
                sortAddressesOptionNewestFirst.textContent = 'Newest First'
                
                const sortAddressesOptionOldestFirst = document.createElement('option')
                sortAddressesOptionOldestFirst.textContent = 'Oldest First'
                
                const sortAddressesOptionAlphabetically = document.createElement('option')
                sortAddressesOptionAlphabetically.textContent = 'Alphabetically'

                chrome.storage.local.get('selectedSort', (res)=>{
                    // console.log('selected sort last selected: ', res.selectedSort)
                    // make the selected sort in the dropdown menu be the one that was last selected by the user
                    if(res.selectedSort === 'Newest First'){
                        sortAddressesOptionNewestFirst.selected = true
                    } else if (res.selectedSort === 'Oldest First') {
                        sortAddressesOptionOldestFirst.selected = true
                    } else {
                        sortAddressesOptionAlphabetically.selected = true
                    }

                    // make the selected sort variable be this one as well.
                    selectedSort = res.selectedSort
                })
    
                addressesWindow.appendChild(sortAddressesDiv)
                sortAddressesDiv.appendChild(sortAddressesDropdown)
                sortAddressesDiv.appendChild(sortAddressesDropdownLabel)
                sortAddressesDropdown.appendChild(sortAddressesOptionNewestFirst)
                sortAddressesDropdown.appendChild(sortAddressesOptionOldestFirst)
                sortAddressesDropdown.appendChild(sortAddressesOptionAlphabetically)
            }
        });
    }
    
    // perform actions when the on/off button is clicked
    var onOffButton = (document.getElementsByClassName('on-off-button'))[0]
    var srcBlack = 'ON_off_button_black_360x360px.png'
    var srcGrey = 'on_OFF_button_grey_360x360px.png'

    // get toggle state on action popup load
    chrome.storage.local.get('replaceTextState',(res)=>{
        onOffButton.src = res.replaceTextState ? srcBlack : srcGrey
    })

    onOffButton.addEventListener('click',(event)=>{
        toggleReplaceTextStateView(event.target)
    })

    function toggleReplaceTextStateView(onOffButton){
        addressesWindow.innerHTML = '';

        var confirmationText = document.createElement('p')
        confirmationText.textContent = 'Page will reload, confirm?'
        confirmationText.style.cssText = `
            font-weight: bold;
            word-wrap: break-word;
        `

        var buttonsDiv = document.createElement('div')
        buttonsDiv.style.cssText = `
            display:flex;
            justify-content:space-between;
            gap:10px;
        `
        
        var yesButton = document.createElement('button');
        yesButton.innerText = 'Yes';
    
        var cancelButton = document.createElement('button');
        cancelButton.innerText = 'Cancel';

        addressesWindow.appendChild(confirmationText)
        addressesWindow.appendChild(buttonsDiv);
        buttonsDiv.appendChild(yesButton);
        buttonsDiv.appendChild(cancelButton);

        yesButton.addEventListener('click', () => {
            // console.log('onOffButtonImg', onOffButton)
            chrome.storage.local.get('replaceTextState',(res)=>{
                if(res.replaceTextState){
                    onOffButton.src = srcGrey
                    chrome.storage.local.set({
                        replaceTextState:false
                    },()=>{
                        loadAddresses()
                        chrome.tabs.reload()
                    })
                }else{
                    onOffButton.src = srcBlack
                    chrome.storage.local.set({
                        replaceTextState:true
                    },()=>{
                        loadAddresses()
                        chrome.tabs.reload()
                    })
                }
            })
        })

        cancelButton.addEventListener('click', loadAddresses);
    }

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
        if(msg.request === 'toggleKeyCommandExecuted'){
            location.reload()
        }
    })
    
    // perform actions when the plus button is clicked
    var plusButton = (document.getElementsByClassName('plus-button'))[0]

    plusButton.addEventListener('click',(event)=>{
        const zoesElement = document.createElement('p')
        zoesElement.textContent = 'This is zoes element.'
        addAddressView()
    })

    function addAddressView() {
        addressesWindow.innerHTML = '';
        
        var labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.placeholder = 'Enter a label';

        var labelErrorMessage = document.createElement('p')
        labelErrorMessage.innerText = ''
        labelErrorMessage.style.cssText = `
            color: red;
            word-wrap: break-word;
            margin: 5px;
        `
    
        var addressInput = document.createElement('input');
        addressInput.type = 'text';
        addressInput.placeholder = 'Enter an Ethereum address';

        var addressErrorMessage = document.createElement('p')
        addressErrorMessage.innerText = ''
        addressErrorMessage.style.cssText = `
            color: red;
            word-wrap: break-word;
            margin: 5px;
        `

        var buttonsDiv = document.createElement('div')
        buttonsDiv.style.cssText = `
            display:flex;
            justify-content:space-between;
            gap:10px;
        `
        
        var submitButton = document.createElement('button');
        submitButton.innerText = 'Submit';
    
        var cancelButton = document.createElement('button');
        cancelButton.innerText = 'Cancel';

        var checkboxForm = document.createElement('form')
        
        var reloadPageCheckbox = document.createElement('input')
        reloadPageCheckbox.type = 'checkbox'
        reloadPageCheckbox.id = 'reload-page-checkbox'
        reloadPageCheckbox.checked = true
        
        var reloadPageCheckboxLabel = document.createElement('label')
        reloadPageCheckboxLabel.textContent = 'Reload page? Label will not appear until page is reloaded.'
        reloadPageCheckboxLabel.for = 'reload-page-checkbox'
        reloadPageCheckboxLabel.style.cssText = `
            word-wrap: break-word;
        `

        addressesWindow.appendChild(labelInput);
        addressesWindow.appendChild(labelErrorMessage);
        addressesWindow.appendChild(addressInput);
        addressesWindow.appendChild(addressErrorMessage);
        addressesWindow.appendChild(buttonsDiv);
        buttonsDiv.appendChild(submitButton);
        buttonsDiv.appendChild(cancelButton);
        addressesWindow.appendChild(checkboxForm)
        checkboxForm.appendChild(reloadPageCheckbox)
        checkboxForm.appendChild(reloadPageCheckboxLabel)
    
        submitButton.addEventListener('click', () => {
            labelErrorMessage.textContent = ''
            addressErrorMessage.textContent = ''

            var label = labelInput.value.toLowerCase().trim();
            var address = addressInput.value.toLowerCase().trim();
            // console.log('label inputted: ',label)
            // console.log('address inputted: ',address)
            var validInput = true

            var reloadPage = reloadPageCheckbox.checked
            
            chrome.storage.local.get('ethLabels', (res) => {
                const lowerCaseLabels = Object.values(res.ethLabels).map(labelData => labelData.label.toLowerCase());
                // Check if anything is entered
                if(label === '' && address === ''){
                    addressErrorMessage.innerText = 'You haven\'t entered anything.';
                    validInput = false
                } else {
                    // Validate label
                    if (label === ''){
                        labelErrorMessage.innerText = 'No label entered.';
                        validInput = false
                    } else if (label.length > 256){
                        labelErrorMessage.innerText = 'Label is too long. Labels can be 256 characters max.';
                        validInput = false
                    } else if (lowerCaseLabels.includes(label)){
                        labelErrorMessage.innerText = 'Label is already being used.';
                        validInput = false
                    }

                    // Validate address
                    if (address === ''){
                        addressErrorMessage.innerText = 'No address entered.';
                        validInput = false
                    } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
                        addressErrorMessage.innerText = 'Invalid Ethereum address.';
                        validInput = false
                    } else if (res.ethLabels[address] && res.ethLabels[address].label) {
                        addressErrorMessage.innerText = 'Address is already being used.';
                        validInput = false
                    }
                }
                
                // if the input is valid, save the new label to storage
                if(validInput){
                    // Add the non lowercased label to the label database
                    res.ethLabels[address] = {
                        label: labelInput.value.trim(),
                        timestamp: Date.now(),
                        backgroundColor: 'red'
                    };

                    // console.log('new address and labelData object',res.ethLabels[address])
                    // console.log('res.ethLabels after updating',res.ethLabels)
                    chrome.storage.local.set({ethLabels: res.ethLabels}, () => {
                        // Return to main view
                        loadAddresses();

                        //If the user checked to reload the page, reload it
                        if(reloadPage){
                            chrome.tabs.reload()
                        }
                    });
                }
            });
        });
    
        cancelButton.addEventListener('click', loadAddresses);
    }

    // perform actions when the edit button is clicked
    var editButton = (document.getElementsByClassName('edit-button'))[0];
    var editToggle = false;
    editButton.addEventListener('click', function() {
        if(editToggle){
            editToggle = false
            loadAddresses(editToggle)
        } else {
            editToggle = true
            loadAddresses(editToggle)
        }
    });

    // Main function call
    loadAddresses()
})
