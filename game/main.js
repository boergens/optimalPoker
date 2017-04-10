"use strict";

var current = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]];
var shuffling = [-1, -1, -1, -1, -1];
var money = 1000;
var actual_JSON;
function loadJSON(filename, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState === 4) {// && xobj.status === "200") {
            // Required use of an anonymous callback 
            // as .open() will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function init(filename) {
    var card_idx;
    do {
        for (card_idx = 0; card_idx < 5; card_idx += 1) {
            shuffling[card_idx] = Math.floor(Math.random() * 5);
        }
    } while (Array.from(new Set(shuffling)).length < 5)    
    var filename = "games/solution_" + Math.floor(Math.random() * 100) + ".json";
    loadJSON(filename, function(response) {
        // Parse JSON string into object
        actual_JSON = JSON.parse(response);
        initialize();
    });
}
function clickButton(this_id) {
    if (!document.getElementById("btnDeal").disabled) {
        if (document.getElementById(this_id).className === "card") {
            document.getElementById(this_id).className = "carddark";
        } else {
            document.getElementById(this_id).className = "card";
        }
    }
}
function checkBad(randC, compareTo) {
    var card_idx;
    for (card_idx = 0; card_idx < compareTo.length; card_idx += 1) {
        if (compareTo[card_idx][0] === randC[0] && compareTo[card_idx][1] === randC[1]) {
            return true;
        }
    }
    return false;
}

function randomCard(compareTo) {
    var randC;
    do {
        randC = [Math.floor(Math.random() * 13) + 2, Math.floor(Math.random() * 4) + 1];
    } while (checkBad(randC, compareTo));
    return randC;
}

function numberToImage(num) {
    var names = ["diamonds", "hearts", "spades", "clubs"];
    var numbers = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
    return "PNG-cards-1.3/" + numbers[num[0] - 2] + "_of_" + names[num[1] - 1] + ".png";
}

function updateView(cards) {
    var card_idx;
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        document.getElementById("card" + idx).src = numberToImage(cards[idx]);
    }
    document.getElementById("money").innerHTML = "money " + money;
}

function isFlush(cards) {
    var card_idx;
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        if (cards[card_idx][1] !== cards[0][1]) {
            return false;
        }
    }
    return true;
}

function extractNumbers(cards) {
    var first = function (x) {
        return x[0];
    };
    return cards.map(first);
}

function isStraightSub(cards, flip) {
    var numbers = extractNumbers(cards);
    var card_idx;
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        if (flip && numbers[card_idx] === 14) {
            numbers[card_idx] = 1;
        }
    }
    for (card_idx = 1; card_idx < 5; card_idx += 1) {
        if (numbers.sort()[card_idx] - numbers.sort()[card_idx - 1] !== 1) {
            return false;
        }
    }
    return true;
}

function isStraight(cards) {
    return isStraightSub(cards, true) || isStraightSub(cards, false);
}

function isStraightFlush(cards) {
    return isStraight(cards) && isFlush(cards);
}

function isRoyalFlush(cards) {
    if (!isStraightFlush(cards)) {
        return false;
    }
    var card_idx;
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        if (cards[card_idx][0] === 14) {
            return true;
        }
    }
    return false;
}

function isFourOfAKind(cards) {
    var numbers = extractNumbers(cards);
    if (Array.from(new Set(numbers)).length !== 2) {
        return false;
    }
    var temp;
    var card_idx;
    for (card_idx = 0; card_idx < cards.length; card_idx += 1) {
        temp = numbers[card_idx];
        if (Array.from(new Set(numbers)).length !== 2) {
            return true;
        }
        numbers[card_idx] = temp;
    }
    return false;
}

function isFullHouse(cards) {
    return Array.from(new Set(extractNumbers(cards))).length === 2;
}

function isThreeOfAKind(cards) {
    var card_idx;
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        if (isFourOfAKind(cards.slice(0, idx).concat(cards.slice(idx + 1)))) {
            return true;
        }
    }
    return false;
}

function isTwoPairs(cards) {
    var numbers = extractNumbers(cards);
    return Array.from(new Set(numbers)).length === 3;
}


function isJacksOrBetter(cards) {
    var card_idx;
    var numbers = extractNumbers(cards).sort();
    for (card_idx = 1; card_idx < 5; card_idx += 1) {
        if (numbers[card_idx] > 10 && numbers[card_idx] === numbers[card_idx - 1]) {
            return true;
        }
    }
    return false;
}

function initialize() {
    var card_idx;
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        current[card_idx] = [Math.floor(actual_JSON.solution.hand[shuffling[card_idx]] / 10), actual_JSON.solution.hand[shuffling[card_idx]] % 10];
    }
    money = money - 1;
    document.getElementById("logo").innerHTML = "";
    document.getElementById("btnDeal").disabled = false;
    
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        document.getElementById("card" + card_idx).className = "card"
    }
    updateView(current);
    document.getElementById("output").innerHTML = "";
}

function clickPayout(hold_idx, text_to_paste) {
    document.getElementById("payout" + hold_idx).innerHTML += text_to_paste;
}

function deal() {
    document.getElementById("btnDeal").disabled = true;
    var card_idx;
    var currentOld = current.slice();
    for (card_idx = 0; card_idx < 5; card_idx += 1) {
        if (document.getElementById("card" + card_idx).className === "carddark") {
            current[card_idx] = randomCard(current.concat(currentOld));
            document.getElementById("card" + card_idx).className = "cardmediumdark";
            document.getElementById("card" + card_idx).src = "PNG-cards-1.3/empty.png";
        }
    }
    var payoutnames = ["RoyalFlush", "StraightFlush", "FourOfAKind", "FullHouse", "Flush", "Straight", "Threeofkind", "TwoPairs", "JacksOrBetter"];
    var payout = [3000, 250, 125, 40, 35, 20, 15, 10, 5];
    for (card_idx = 0; card_idx < 10; card_idx += 1) {
        if (card_idx === 9) {
            document.getElementById("logo").innerHTML = "nothing";
            break;
        }
        if (eval('is' + payoutnames[idx] + '(current)')) {
            document.getElementById("logo").innerHTML = payoutnames[idx];
            money += payout[card_idx];
            break;
        }
    }
    var outputStrings = new Array(32);
    var hold_idx;
    for (hold_idx = 0; hold_idx < 32; hold_idx += 1) {
        var total = 0;
        var card_idx;
        var hold_idx_meta = 0;
        var tempstring = "";
        for (card_idx = 0; card_idx < 5; card_idx += 1) {
            var bit_here = Math.floor(2 * idx / (2 << card_idx)) % 2;
            hold_idx_meta += bit_here << 4 - shuffling[card_idx];
            var labelsdark = ["", "dark"];
            tempstring += '<img class="cardsmall' + labelsdark[bit_here] + '" src="' + numberToImage(currentOld[card_idx]) + '">';
        }
        var splitup = [];
        var reporting = "";
        var payout_idx;
        for (payout_idx = 0; payout_idx < 9; payout_idx += 1) {
            var subtotal = actual_JSON.solution.payout_matrix[hold_idx_meta][payout_idx] * payout[payout_idx] / actual_JSON.solution.numberOfTests[hold_idx_meta];
            total += subtotal;
            reporting += payoutnames[payout_idx] + ' ' + subtotal '<br>'
            
        }
        tempstring += '<div id=payout"' + hold_idx + ' onClick=clickPayout(' + hold_idx + ',' + reporting + ')">' + total.toFixed(2) + "</div><br>";
        outputStrings[hold_idx] = [tempstring, total];
    }
    var sortedStrings = outputStrings.sort(function (a, b) {return b[1] - a[1]});
    for (hold_idx = 0; hold_idx < 32; hold_idx += 1) {
        document.getElementById("output").innerHTML += sortedStrings[hold_idx][0];
    }
    updateView(current);
}

init();