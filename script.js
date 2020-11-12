const suites =['S', 'C', 'H', 'D'];
const cardValues =[2, 3, 4 ,5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
let activeDeck = [];
let uiDeck = [];
let playerHand = [];
let dealerHand = [];
let cardBeingDealt = [];
let playerCount = 0;
let dealerCount = 0;
let dealerShownCount = 0;
let uiplayerCount = 0;
let uidealerCount = 0;
let dealerHiddenCard = [];


//Document Finishes loading on webpage Event
$(document).ready(function() {
    uiDeck = document.getElementById("uiDeck");
    uiplayerCount = document.getElementById("player-count");
    uidealerCount = document.getElementById("dealer-count");

    let shuffleSound = document.createElement('audio');
    shuffleSound.setAttribute("src", "sounds/card-shuffle2.wav");

    let staySound = document.createElement('audio');
    staySound.setAttribute("src", "sounds/stay.wav");

    let hitSound = document.createElement('audio');
    hitSound.setAttribute("src", "sounds/hit.wav");

    //Deal Button Click Event
    $("#deal-button").click(function(){
      resetDeck();
      dealCards();
      shuffleSound.play();
    });

    //Hit Button Click Event
    $("#hit-button").click(function(){
      hitPlayer();
      hitSound.play();
    });

    //Stay Button Click Event
    $("#stay-button").click(function(){
      playerStays();
      staySound.play();
    });

     //Continue Button Click Event
     $("#continue-button").click(function(){
      hideCardsOnStart();
      toggleResultImage(false);
      hideButton("continue");
      showButton("deal");
    });
    
    toggleResultImage(false);
    hideCardsOnStart();
    hideButton("hit");
    hideButton("stay");
    hideButton("continue");

});


//Function that resets the active deck as well as the UI copy of the deck
function resetDeck(){
  $("#dealer-card-1").attr("src", "img/red-back.png");
  hideCardsOnStart();
  activeDeck = [];
  for(i=0; i<cardValues.length; i++) {
    activeDeck.push([cardValues[i], suites[0]]);
    activeDeck.push([cardValues[i], suites[1]]);
    activeDeck.push([cardValues[i], suites[2]]);
    activeDeck.push([cardValues[i], suites[3]]);
  }
  //uiDeck.innerHTML = activeDeck;
}


//Function that deals the hand to player and dealer, subtracting cards from active Deck
function dealCards(){
  showIndicatorUI();
  showButton("hit");
  showButton("stay");
  hideButton("deal");
  playerHand = [];
  dealerHand = [];
  //Deals Four Cards, 2 to player and 2 to dealer and removes from active deck
  dealACard();
  playerHand.push(cardBeingDealt);
  showCard("player", 1);
  setCardImage("#player-card-", 1);
  

  dealACard();
  dealerHand.push(cardBeingDealt);
  showCard("dealer", 1);
  dealerHiddenCard = cardBeingDealt;
  

  dealACard();
  playerHand.push(cardBeingDealt);
  showCard("player", 2);
  setCardImage("#player-card-", 2);
  updateCount("player");

  dealACard();
  dealerHand.push(cardBeingDealt);
  showCard("dealer", 2);
  setCardImage("#dealer-card-", 2);
  updateCount("dealer");

  checkForBlackjack();

  //set ui vars to equal backend vars
  //uiDeck.innerHTML = activeDeck;
}


//Function that finds random card in active deck,sets it to cardBeingDealt, and removes it from active deck
function dealACard(){
  let indexInDeck= 0;
  //Find random index in cards array
  indexInDeck= [Math.floor(Math.random() * activeDeck.length)];
  //Set the card to the found array element
  cardBeingDealt = activeDeck[indexInDeck];
  //Remove the found element from the active deck of cards
  activeDeck.splice(indexInDeck, 1);
}

//Function that sets the image of a card
function setCardImage(who, num){
  $(who + num).attr("src", "img/"+cardBeingDealt.join('')+".png");
}

//Function that hits player with additional card
function hitPlayer(){
  dealACard();
  playerHand.push(cardBeingDealt);
  showCard("player", playerHand.length);
  setCardImage("#player-card-", playerHand.length);
  updateCount("player");
  //uiDeck.innerHTML = activeDeck;

  checkForBlackjack();
}

//Function that hits dealer with additional card
function hitDealer(){
  dealACard();
  dealerHand.push(cardBeingDealt);
  showCard("dealer", dealerHand.length);
  setCardImage("#dealer-card-", dealerHand.length);
  updateCount("dealer");
  //uiDeck.innerHTML = activeDeck;
}

//Function that hides all possible cards
function hideCardsOnStart() {
  for (i=1; i<=8; i++){
    $("#player-card-" + i).css("display", "none");
    $("#dealer-card-" + i).css("display", "none");
    $("#you-text").css("visibility", "hidden");
    $("#dealer-text").css("visibility", "hidden");
    $("#dealer-count").css("visibility", "hidden");
    $("#player-count").css("visibility", "hidden");
  }
}

//Function that hides or shows result image
function toggleResultImage(bool) {
  if (bool == true) {
    $("#result-content").css("display", "inline");
  } else {
    $("#result-content").css("display", "none");
  }
}

//Function that shows indicator and count ui elements
function showIndicatorUI() {
  $("#you-text").css("visibility", "visible");
    $("#dealer-text").css("visibility", "visible");
    $("#dealer-count").css("visibility", "visible");
    $("#player-count").css("visibility", "visible");
}

//Function that reveals and individual card
function showCard(who, num) {
  $("#" + who + "-card-" + num).css("display", "inline");
}

//Function that hides and individual button
function hideButton(button) {
  $("#" + button + "-button").css("display", "none");
}

//Function that reveals and individual button
function showButton(button) {
  $("#" + button + "-button").css("display", "inline");
}

//Function that updates the count of either the players or the dealers hand. Uses a helper 
//function to get an accurate count of the hand.
//Also checks if player busts.
function updateCount(who) {
  let sum = 0;
  if (who == "player") {
    for (i=0; i<=playerHand.length-1; i++) {
      sum += getCardValue(who, i);
    }
  } else {
    for (i=0; i<=dealerHand.length-1; i++) {
    sum += getCardValue(who, i);
    }
  }
  if (who == "player"){
  uiplayerCount.innerHTML = sum;
  playerCount = sum;
  } else {
    dealerCount = sum;
    dealerShownCount = dealerCount - getCardValue("dealer", 0);
    calcShownDealerValue(false);
  }
  if (playerCount > 21) {
    checkForAceP();
  }
}

//Helper function for updateCount that gets a value of a card in the playerHand array.
function getCardValue(who, index) {
  let value = 0;
  if( who == "player") {
    value = playerHand[index];
  } else {
    value = dealerHand[index];
  }
  let card = value[0];
  
  if(card > 10 && card <=13) {
    card = 10;
  } else if(card == 14){
    card = 11;
  }
  return card;
}

//Function that runs the dealers turn then decides victor
function playerStays() {
  hideButton("hit");
  hideButton("stay");
  calcShownDealerValue(true);
  $("#dealer-card-1").attr("src", "img/"+ dealerHiddenCard.join('') +".png")
  if (dealerCount <= 17) {
    hitDealer();
    setTimeout(function () {
       playerStays();
    }, 1500);
  } else if (dealerCount > 17) {
    checkBust();
  }
}

//Function that checks for a blackjack so that player doesn't have to click "stay" to win
function checkForBlackjack() {
  if (playerCount === 21) {
    decideVictor("player");
  }
}


//Function that checks if the player or dealer has busted and if so ends the hand, if not 
//changes count of ace to 1 instead of 11.
function checkBust(){
  if (dealerCount > 21) {
    checkForAceD();
  } else if (playerCount > 21) {
    checkForAceP();
  } else if (playerCount === dealerCount) {
    decideVictor("push");
  } else if (playerCount > dealerCount) {
    decideVictor("player");
  } else if (playerCount < dealerCount) {
    decideVictor("dealer");
  }
}

//Function called after checkBust that determines winner of hand and restarts new hand
function decideVictor(victor) {

  let chipsSound = document.createElement('audio');
    chipsSound.setAttribute("src", "sounds/chips.wav");

  calcShownDealerValue(true);
  $("#dealer-card-1").attr("src", "img/"+ dealerHiddenCard.join('') +".png")
  if (victor == "player") {
    $("#result-image").attr("src", "img/winImage.png");
    chipsSound.play();
  } else if (victor == "dealer") {
    $("#result-image").attr("src", "img/loseImage.png");
  } else {
    $("#result-image").attr("src", "img/pushImage.png");
  }
  toggleResultImage(true);
  hideButton("hit");
  hideButton("stay");
  showButton("continue");
}

//Function that checks for ace in player hand before deciding bust
function checkForAceP() {
  let hasAce = false;
  let cardtoCheck = [];

  let ind=0;
  for (ind=0; ind<=playerHand.length-1 && hasAce == false; ind++) {
    cardtoCheck = playerHand[ind];
    hasAce = cardtoCheck.includes(14);
    if (hasAce == true) {
      setAceto1("player", ind);
    }
  }
  if (hasAce == false && playerCount >21) {
    decideVictor("dealer");
  }
}

//Function that checks for ace in dealer hand before deciding bust
function checkForAceD() {
  console.log(dealerCount);
  let hasAce = false;
  let cardtoCheck = [];

  let ind=0;
  for (ind=0; ind<=dealerHand.length-1 && hasAce == false; ind++) {
    cardtoCheck = dealerHand[ind];
    hasAce = cardtoCheck.includes(14);
    if (hasAce == true) {
      setAceto1("dealer", ind);
    }
  }
  if (hasAce == false && dealerCount <= 17) {
    playerStays();
  } else if (hasAce == false && dealerCount >21) {
    decideVictor("player");
  }
}

//Sets an ace from value 11 to 1.
function setAceto1(who, ind) {
  if (who =="player") {
    playerHand[ind] = [1, "C"];
    updateCount("player");
  } else {
    dealerHand[ind] = [1, "C"];
    updateCount("dealer");
    console.log("set an ace to 1");
    playerStays();
  }
}


//Function that calcs dealers shown card value
function calcShownDealerValue(full) {
  if (full == true) {
    uidealerCount.innerHTML = dealerCount;
  } else {
    uidealerCount.innerHTML = dealerShownCount;
  }

}