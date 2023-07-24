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

                // Sort the addresses based on the selected sort method
                if (selectedSort === 'Newest First' || selectedSort === 'undefined' || selectedSort === null) {
                    addresses.sort((a, b) => res.ethLabels[b].timestamp - res.ethLabels[a].timestamp);
                } else if (selectedSort === 'Oldest First') {
                    addresses.sort((a, b) => res.ethLabels[a].timestamp - res.ethLabels[b].timestamp);
                } else if (selectedSort === 'Alphabetically') {
                    addresses.sort((a, b) => res.ethLabels[a].label.localeCompare(res.ethLabels[b].label));
                }
                
                addresses.forEach((address, i) => {
                    var label = document.createElement('h4');
                    label.textContent = `${res.ethLabels[address].label} : ${address.substr(0, 7)}...${address.substr(-7)}`;
                    label.style.cssText = `
                        margin-top:0;
                        margin-bottom:0;
                        border-bottom-style:solid;
                        border-width:1px;
                    `
                    addressesListDiv.appendChild(label);
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
                    // console.log('selected sort: ', selectedSort)
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
            console.log('onOffButtonImg', onOffButton)
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
                    console.log('res.ethLabels after updating',res.ethLabels)
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
