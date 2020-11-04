$(document).ready(async function(){
  await connect();
  await connectMarket();
  await kittiesToSell();
  await marketplaceOp();
});

var sellingId;


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


async function getInventory(){
  let inventoryArray = await instanceMarket.methods.getAllTokenOnSale().call();

  for (var i = 0; i < inventoryArray.length; i++) {
    if(inventoryArray[i] != 0){
    saleKittyData(inventoryArray[i])
    }
  }
}


async function kittiesToSell(){
  let ownedKitties = await ownersArray();
  let birth = await birthArray();
  let kittyId = await instance.methods.getKittiesIDs(user).call({from: user});

  for (var i = 0; i < ownedKitties.length; i++){
    let imgThumb = kittyThumbnail(i);
    let _dna = await dnaOfKitty(ownedKitties[i]);
    console.log("id: " + i + " data: " + kittyId[i]);

        let kittyCards = `<div class="col-lg-4 catParent">
                            <label class="option_item">
                              <input type="radio" class="checkbox" name="radioKitty" id="kittyParent" value=${kittyId[i]}>
                                <div class="option_inner">
                                        <div class="cards parent-cards">
                                              <div class="card-body parent-card">
                                                <div class="tickmark"></div>
                                                    <div id="parentKitty">${imgThumb}
                                                          <br>
                                                         <div class="catGenes">${"DNA: " + birth[i].genes}</div>
                                                          <br>
                                                         <div class="catGenes">${"Gen: " + birth[i].generation}</div>
                                                    </div>
                                              </div>
                                          </div>
                                  </div>
                              </label>
                            </div>`
            $(".availKitties").append(kittyCards);
            renderKitty(_dna, i);
        }
      }


$('#sell_Kitty').click(async function(){
    let result = $('input[type= "radio"]:checked');
    let _birth = await birthArray();

    if (result.length > 0) {
      await chosenKitty(result.val(), '.kitty-being-sold');
      }
     sellerId = result.val();
     console.log("Modal chosen: " + result.val());
  });


/*async function sellingArray(){
  let alreadyForSell = await instanceMarket.methods.getAllTokenOnSale().call({from: userMarket});
  return alreadyForSell;
  console.log(alreadyForSell);
}*/

async function sellKitty(price, id){
    await instanceMarket.methods.setOffer(price, id).send({from: user}, function(error, txHash){
      if(error){
        console.log(error);
      }else {
        console.log(txHash);
      }
    })
}


async function refresh(){
    location.reload(true);
}


$("#submitPrice").click(async function(){
  let setPrice = $("#price-field").val();
  await sellingKitties(sellerId, ".kitty-for-sale", setPrice);

  await sellKitty(setPrice, sellerId);
  await refresh();

    console.log(sellerId);
})


async function sellingKitties(value, placement, price){
  let _ownedKitties = await ownersArray();
  let _birth = await birthArray();

  let _imgThumb = await kittyThumbnail(value);
  let _dna = await dnaOfKitty(_ownedKitties[value]);

displayParent = `<div id="parentChosen">${_imgThumb}
                    <br>
                   <div class="catGenes">${"DNA: " + _birth[value].genes}</div>
                    <br>
                   <div class="catGenes">${"Gen: " + _birth[value].generation}</div>
                    <br>
                   <div class="catGenes">${"Price: " + price}</div>
                    <br>
                </div>`

      $(placement).append(displayParent);
      renderKitty(_dna, value);
}


async function saleKittyData(id){
  let saleData = await instanceMarket.methods.getOffer(id).call();
  const kittyToSell = await instance.methods.getKitty(id).call();
  console.log("getKitty ID: " + id + " Genes: " + kittyToSell.genes);

  let birth = await birthArray();
  console.log("ID: " + id + " Genes: " + birth[id].genes);
  let ownedKitties = await ownersArray();

    let imgThumb = kittyThumbnail(id);
    let _dna = await dnaOfKitty(kittyToSell.genes);

        let kittyCards = `<div class="col-lg-2">
                            <label class="option_item">
                              <input type="radio" class="checkbox buying-kitty" name="buyRadio" id="kittyParent" value="${id}">
                                <div class="option_inner">
                                        <div class="cards" style="width: 250px;">
                                              <div class="card-body sell-cards">
                                                <div class="tickmark"></div>
                                                    <div>${imgThumb}
                                                          <br>
                                                         <div class="catGenes">${"DNA: " + kittyToSell.genes}</div>
                                                          <br>
                                                         <div class="catGenes">${"Gen: " + kittyToSell.generation}</div>
                                                          <br>
                                                         <div class="catGenes">${"Price: " + saleData.price}</div>
                                                    </div>
                                              </div>
                                          </div>
                                      </div>
                                </label>
                            </div>`
            $(".kitty-inventory").append(kittyCards);
            renderKitty(_dna, id);
}


$("#buyKittyBtn").click(async function(){
  _tokenId = $('input[name= "buyRadio"]:checked').val();

  let buy = await instanceMarket.methods.buyKitty(_tokenId).send({from: user}, function(error, txHash){
    if(error){
      console.log(error);
    }else {
      console.log(txHash);
    }
  });
});
