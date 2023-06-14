chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        title: 'Label this ETH Address',
        contexts: ['selection', 'link'],
        id: ethAdressContextMenuId,
        visible:false,
    })
})

var ethAdressContextMenuId = 'label-eth-address-context-menu-item'
const isEthAddress=(text)=>{
    // console.log('here', text)
    // console.log(text[0])
    // console.log(text[1])
    // console.log(text.length)
    if(text[0]==='0'&&text[1]==='x'){
        // these are all the known ways eth addresses show up on the web
        if(text.length===42)return true
        if(text.length===12&&text[5]==='.'&&text[6]==='.'&&text[7]==='.') return true
        if(text.length===11&&text[4]==='.'&&text[5]==='.'&&text[6]==='.') return true
        if(text.length===19&&text[8]==='.'&&text[9]==='.'&&text[10]==='.') return true
    }else return false
}

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
    if(msg.request === 'updateContextMenu'){
        var text=msg.text
        var details = {
            title: 'Label this ETH Address',
            contexts: ['selection', 'link'],
            visible:null       
        }
        if(isEthAddress(text)){
            console.log('it\'s an eth address!')
            details.visible = true
            chrome.contextMenus.update(ethAdressContextMenuId,details)
        }else{
            details.visible = false
            chrome.contextMenus.update(ethAdressContextMenuId,details)
        }
    }
})

chrome.contextMenus.onClicked.addListener((info)=>{
    if(info.menuItemId===ethAdressContextMenuId){
        console.log('clicked!')
    }
})

chrome.commands.onCommand.addListener((command)=>{
    if(command==="toggle labels"){
        console.log(`works: ${command}`)
    }
})

// still have to do something about when something new on a page loads
// chrome.tabs.onUpdated.addListener(
//     async (tabId, changeInfo, tab)=>{
//         // console.log('tab updated')
//         // console.log(`change info status: ${changeInfo.status}`)
//         // console.log(`tab active: ${tab.active}`)
//         // console.log(`tab id: ${tabId}`)
//         if(changeInfo.status === 'complete' && tab.active) {
//             // console.log('now you can execute a script')
//             await chrome.scripting.executeScript(
//                 {
//                     files : ["find_all_eth_addresses.js"],
//                     target: {tabId : tab.id}
//                 }
//             )
//         }
//     }
// )


 