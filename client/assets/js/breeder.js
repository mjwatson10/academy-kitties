
$(document).ready(async function(){
  await connect();
  await parentData();
  instance.events.Birth().on('data', function(event){

    let owner = event.returnValues.owner;
    let kittenId = event.returnValues.kittenId;
    let momId = event.returnValues.momId;
    let dadId = event.returnValues.dadId;
    let genes = event.returnValues.genes;

    $(".childData").text("Owner: " + owner
                            + " || Kitten Id: " + kittenId
                            + " || Mom Id: " + momId
                            + " || Dad Id: " + dadId);

    alert("Congratulations!!! You own a new Kitty")
  })
  .on('error', console.error)
})

//State variables
var dadGenes, dadId, momGenes, momId;


//Parents Buttons
$('#saveDad').click(async function(){
    let result = $('input[type= "radio"]:checked');
    let _birth = await birthArray();

    if (result.length > 0) {
      await chosenKitty(result.val(), '.dadDisplay');

      $('#dadId').removeAttr('data-target');
      $('#clearDad').attr('disabled', false);
      $('#breed').attr('disabled', false);
    } else {
      alert("Please choose one Daddy");
    }
    dadGenes = _birth[result.val()].genes;
    dadId = result.val();
  });


$('#saveMom').click(async function(){
    let result = $('input[type= "radio"]:checked');
    let _birth = await birthArray();

    if (result.length > 0) {
      await chosenKitty(result.val(), '.momDisplay');

      $('#momId').removeAttr('data-target');
      $('#clearMom').attr('disabled', false);
      $('#breed').attr('disabled', false);
    } else {
      alert("Please choose one Daddy");
    }
    momGenes = _birth[result.val()].genes;
    momId = result.val();
  });

//clear buttons
  $('#clearDad').click(function(){
    $('.dadDisplay').children().remove();
    $('#newChild').remove();
    $('#dadId').attr('data-target', '#dadModal');
    $('#clearDad').attr('disabled', true);
  });


  $('#clearMom').click(function(){
    $('.momDisplay').children().remove();
    $('#newChild').remove();
    $('#momId').attr('data-target', '#momModal');
    $('#clearMom').attr('disabled', true);
  });


async function parentData(){
  let ownedKitties = await ownersArray();
  let birth = await birthArray();

  for (var i = 0; i < ownedKitties.length; i++){
    if(ownedKitties[i] != 0){
      let imgThumb = kittyThumbnail(i);
      let _dna = await dnaOfKitty(ownedKitties[i]);

        let kittyCards = `<div class="col-lg-4 catParent">
                            <label class="option_item">
                              <input type="radio" class="checkbox" name="radioKitty" id="kittyParent" value=${i}>
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
            $(".parents").append(kittyCards);
            renderKitty(_dna, i);
        }
      }
    }

  async function breedParents(_daddy, _mommy){

    if (dadGenes != momGenes) {
      await instance.methods.breed(_daddy, _mommy).send({from: user}, function(error, txHash){
        if(error){
          console.log(error);
        }else {
          console.log(txHash);
        }
      });
      let array = await ownersArray();
      childId = await array.length - 1;
      console.log(childId);
      $('#breed').attr('disabled', true);
    }else {
      alert("You need two different Kitties to make a Kitten, silly!")
    }
    return childId;
  }

  $('#breed').click(async function(){
    console.log("dad " + dadGenes);
    console.log("mom " + momGenes);
    let _childId = await breedParents(dadId, momId);
    console.log(_childId);

    let _ownedKitties = await ownersArray();
    let _birth = await birthArray();
    console.log("child " + _ownedKitties[_childId]);

    let _imgThumb = await kittyThumbnail(_childId);
    let _dna = await dnaOfKitty(_ownedKitties[_childId]);

    displayChild = `<div id="newChild">${_imgThumb}
                        <br>
                       <div class="childGenes">${"DNA: " + _birth[_childId].genes}</div>
                        <br>
                       <div class="childGenes">${"Gen: " + _birth[_childId].generation}</div>
                    </div>`
              $('.childImg').append(displayChild);
              await renderKitty(_dna, _childId);
  });
