$(document).ready(async function(){
  await connect();
  await connectMarket();
  //await kittiesToSell();
  await marketplaceOp();
});


//checking operator(person going to the marketplace) is approved to access marketplace contract, if not making them approved via metamask request
async function marketplaceOp(){
  let isApprovedOp = await instance.methods.isApprovedForAll(user, contractAddressMarket).call();

  if (isApprovedOp){
    getInventory();
    console.log("is approved");
  } else {
    await instance.methods.setApprovalForAll(contractAddressMarket, true).send().on('receipt', function(receipt){

      console.log("tx done, now is approved");
      getInventory();
    })
  }
}

//displays kitties that are available to buy
async function getInventory(){
  let inventoryArray = await instanceMarket.methods.getAllTokenOnSale().call();

  for (var i = 0; i < inventoryArray.length; i++) {
    if(inventoryArray[i] != 0){
    saleKittyData(inventoryArray[i])
    }
  }
}

//modal that populates kitties that can be sold
/*async function kittiesToSell(){
  let kitties = await getKittiesForOwner();

  for (var i = 0; i < kitties.length; i++){
    const kitty = kitties[i];

    let imgThumb = kittyThumbnail(kitty.kittyId);
    let _dna = dnaOfKitty(kitty.genes);
    console.log("id: " + i + " data: " + kitty.kittyId);

        let kittyCards = `<div class="col-lg-4 catParent">
                            <label class="option_item">
                              <input type="radio" class="checkbox" name="radioKitty" id="kittyParent" value=${kitty.kittyId}>
                                <div class="option_inner">
                                        <div class="cards parent-cards">
                                              <div class="card-body parent-card">
                                                <div class="tickmark"></div>
                                                    <div id="parentKitty">${imgThumb}
                                                          <br>
                                                         <div class="catGenes">${"DNA: " + kitty.genes}</div>
                                                          <br>
                                                         <div class="catGenes">${"Gen: " + kitty.generation}</div>
                                                    </div>
                                              </div>
                                          </div>
                                  </div>
                              </label>
                            </div>`
            $(".availKitties").append(kittyCards);
            renderKitty(_dna, kitty.kittyId);
        }
      }*/



/*$('#sell_Kitty').click(async function(){
    let result = $('input[type= "radio"]:checked');
    const kittyId = result.val();
    let kitty = await getKittyContractCall(kittyId);
    console.log("Kitty Id: ", kitty.kittyId);
    console.log("Kitty Check: ", kittyCheck);

    if(kittyCheck == kitty.kittyId){
      alert("This Kitty is already for sale, Sorry")
    }else{
    if (result.length > 0) {
      await chosenKitty(kitty.kittyId, '.kitty-being-sold');
      }
     sellerId = kitty.kittyId;
     console.log("Seller ID: ", sellerId);
  }
})*/


async function callGetOffer(_kittyId){
  let already = await instanceMarket.methods.getOffer(_kittyId).call({from: user});
  return already.tokenId;
}


//adds sell or cancel btn to owned kitties on My Kitties page
async function sellOrCancel(_kittyId){
  try{
    let check = await callGetOffer(_kittyId);

    if (check == _kittyId) {
      let cxlBtn = `<button class="cxl-offer" id="cxlKittyOffer${_kittyId}">Remove Offer</div>`
      $(`#sellOrCxl${_kittyId}`).append(cxlBtn);
    }
  } catch(err){
    console.log(err);
    let sellBtn = `<button class="sell-my-kitty" id="sellKittyBtn${_kittyId}" data-toggle="modal" data-target="#sell-modal">Sell</button>`
    $(`#sellOrCxl${_kittyId}`).append(sellBtn);
  }
  //click event to populate modal for setting price of kitty being offered
  $(`#sellKittyBtn${_kittyId}`).click(async function(){
    await modalToSellKitties(_kittyId, ".kitty-for-sale");
  });

  $(`#cxlKittyOffer${_kittyId}`).click(async function(){
    await removeOffer(_kittyId);
  })
}


//click event to remove kitty offer from marketplace
async function removeOffer(_kittyId){
  await instanceMarket.methods.removeOffer(_kittyId).send({from: user}, function(error, txHash){
    if(error){
      console.log(error);
    }else {
      console.log(txHash);
    }
  });
}


//loop for sellOrCancel() function
async function addSellOrCxlBtn(){
    let kitties = await getKittiesForOwner();

    for (var i = 0; i < kitties.length; i++) {
      const kitty = kitties[i];
      await sellOrCancel(kitty.kittyId);
    }
}


//sends price being set for kitty being sold to contract
async function sellKitty(price, id){
    await instanceMarket.methods.setOffer(web3.utils.toWei(price, "ether"), id).send({from: user}, function(error, txHash){
      if(error){
        console.log(error);
      }else {
        console.log(txHash);
      }
    })
}

//refreshs page
async function refresh(){
    location.reload(true);
}


//button that sets price user wants to sell their kitties for
$("#submitPrice").click(async function(){
  console.log("seller ID: " + sellerId);
  let setPrice = $("#price-field").val();

  await sellKitty(setPrice, sellerId);
  await refresh();
})


//submits price to contract
/*async function submitPriceForKitty(_setPrice, _kittyId){
  await sellKitty(_setPrice, _kittyId);
  await refresh();
}*/


//populates modal to set price of kitty you want to sell
async function modalToSellKitties(value, placement){
  const kittyID = await getKittyContractCall(value);

  let _imgThumb = await kittyThumbnail(value);
  let _dna = await dnaOfKitty(kittyID.genes);

      let displayKitty = `<div id="parentChosen">${_imgThumb}
                          <br>
                         <div class="catGenes">${"DNA: " + kittyID.genes}</div>
                          <br>
                         <div class="catGenes">${"Gen: " + kittyID.generation}</div>
                          <br>
                         <label for="currency-field" id="priceTitle">Price:</label>
                          <br>
                         <input type="text" id="price-field" value="" data-type="number" placeholder="1,000,000.00">
                         <button type="submit" class="set-kitty-price" id="submitPrice${kitty.kittyId}" data-toggle="modal" data-target="#confirm-modal">
                            <div class="sell-btn-text">Sell</div>
                         </button>
                      </div>`

      $(placement).append(displayKitty);
      $(`#submitPrice${kitty.kittyId}`).click(function(){
        sellKitty($("#price-field").val(), kitty.kittyId);
        refresh();
      })

      renderKitty(_dna, value);
}


async function saleKittyData(_kittyid){
  let saleData = await instanceMarket.methods.getOffer(_kittyid).call();
  const kittyToSell = await instance.methods.getKitty(saleData.tokenId).call();

    let imgThumb = kittyThumbnail(saleData.tokenId);
    let _dna = await dnaOfKitty(kittyToSell.genes);

        let kittyCards = `<div class="col-lg-4">
                            <div class="sell-cards" style="width: 250px;">
                                  <div class="card-body">
                                        <div>${imgThumb}
                                              <br>
                                              <div class="catGenes">${"DNA: " + kittyToSell.genes}</div>
                                               <br>
                                              <div class="catGenes">${"Gen: " + kittyToSell.generation}</div>
                                               <br>
                                              <div class="catGenes">${"Price: " + saleData.price + " Eth"}</div>
                                               <br>
                                              <button type="button" name="button" class="buyKittyBtn" id="buyKitty${saleData.tokenId}">Buy</button>
                                        </div>
                                  </div>
                              </div>
                            </div>`
            $(".kitty-inventory").append(kittyCards);
            buyAKitty(saleData.tokenId, saleData.price);
            renderKitty(_dna, saleData.tokenId);
}

//function for click event to buy kitty and call contract
async function buyAKitty(_kittyId, price){
  $(`#buyKitty${_kittyId}`).click(async function(){
    let buy = await instanceMarket.methods.buyKitty(_kittyId).send({from: user, value: web3.utils.toWei(price, "ether")}, function(error, txHash){
      if(error){
        console.log(error);
      }else {
        console.log(txHash);
      }
    });
    refresh();
  })
}
