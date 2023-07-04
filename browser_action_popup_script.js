document.addEventListener("DOMContentLoaded",(event)=>{
    // Get saved addresses from local storage
    chrome.storage.local.get('ethLabels', (res)=>{
        const addressesWindow = (document.getElementsByClassName('addresses-window'))[0]
        // if there are any labels in storage, populate the window with them
        if(Object.keys(res.ethLabels).length > 0){
            Object.keys(res.ethLabels).forEach((address,i)=>{
                if(i<3){
                    var label = document.createElement('h4')
                    label.innerText = `${res.ethLabels[address]} : ${address.substr(0,9)}...${address.substr(-9)}`
                    addressesWindow.appendChild(label)
                }
            })
            /* var labels = result.labels;
        
            // Populate the table with saved addresses
            var table = document.getElementById('address-table');
            for (var i = 0; i < labels.length; i++) {
                var row = table.insertRow(-1);
                var cell = row.insertCell(-1);
                cell.innerHTML = labels[i].address + ' - ' + labels[i].label;
            } */
        // if not then display the 'go find a label message'
        }else{
            var actionMsg = `
                <h3>You don't have any saved addresses! Try
                <a href='https://etherscan.io/address/0x0000000000000000000000000000000000000000' target='_blank'>this</a>
                one to start.</h3>
            `
            addressesWindow.innerHTML = actionMsg
            // const actionMsg = document.createElement('h3')
            // actionMsg.innerHTML = "You don't have any saved addresses! Try <a href='https://etherscan.io/address/0x0000000000000000000000000000000000000000' target='_blank'>this</a> one to start."
            // addressesWindow[0].appendChild(actionMsg)
        }
    });
    
    // perform actions when the on/off button is clicked
    var onOffButton = (document.getElementsByClassName('on-off-button'))[0]
    var toggleState = null
    var srcBlack = 'ON_off_button_black_360x360px.png'
    var srcGrey = 'on_OFF_button_grey_360x360px.png'
    // get toggle state on action popup load
    chrome.storage.local.get('replaceTextState',(res)=>{
        toggleState = res.replaceTextState
        onOffButton.src = res.replaceTextState ? srcBlack : srcGrey
    })

    onOffButton.addEventListener('click',(event)=>{
        chrome.storage.local.get('replaceTextState',(res)=>{
            if(res.replaceTextState){
                event.target.src = srcGrey
                chrome.storage.local.set({
                    replaceTextState:false
                },()=>{chrome.tabs.reload()})
            }else{
                event.target.src = srcBlack
                chrome.storage.local.set({
                    replaceTextState:true
                },()=>{chrome.tabs.reload()})
            }
        })
    })

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
        if(msg.request === 'toggleKeyCommandExecuted'){
            location.reload()
        }
    })
    
    // perform actions when the plus button is clicked

    /* // perform actions when the edit button is clicked
    var editButton = document.getElementById('edit-button');
    editButton.addEventListener('click', function() {
        // When the edit button is clicked, make the addresses editable and show the delete buttons
        var table = document.getElementById('address-table');
        for (var i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            var cell = row.cells[0];
    
            // Make the cell editable
            cell.contentEditable = 'true';
    
            // Add a delete button to the cell
            var deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Delete';
            deleteButton.addEventListener('click', function() {
                // When the delete button is clicked, remove the address from local storage and delete the row
                // (You'll need to implement the deleteAddress function to remove the address from local storage)
                deleteAddress(cell.innerHTML.split(' - ')[0]);
                row.parentNode.removeChild(row);
            });
            cell.appendChild(deleteButton);
        }
    }); */
})
