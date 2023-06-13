chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        title: 'Label this ETH Address',
        contexts: ['selection', 'link'],
        id: 'label-address-context-menu-item'
    })
})

chrome.contextMenus.onClicked.addListener((info)=>{
    if(info.menuItemId==='label-address-context-menu-item'){
        console.log('clicked!')
    }
})

chrome.commands.onCommand.addListener((command)=>{
    if(command==="toggle labels"){
        console.log(`works: ${command}`)
    }
})

chrome.tabs.onActivated.addListener(
    ()=>{
        console.log("new tab made active")
    }
)

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


 