function optimalPoker()
faces = char([9827, 9824, 9829, 9830]);
money = {@isRoyalFlush, 3000 %handle not used
    @isStraightFlush, 250 %handle not used
    @isFourOfAKind, 125
    @isFullHouse, 40
    @isFlush, 35
    @isStraight, 20
    @isThreeOfAKind, 15
    @isTwoPairs, 10
    @isJacksOrBetter, 5};
    function nk = isNOfAKind(hand)
        nk = sum(repmat(hand(:, 1, :), 1, 1, 1, 13) == repmat(permute(2:14, [1,4,3, 2]), size(hand, 1), 1, size(hand, 3), 1));
        
    end
    function v = isFourOfAKind(~, nk)
        v = any(nk == 4, 4);
        
    end

    function v = isFullHouse(~, nk)
        firstresult = nk >= 3;
        nk(firstresult) = 0;
        secondresult = nk >= 2;
        v = any(firstresult, 4) & any(secondresult, 4);
    end


    function v = isFlush(hand, ~)
        v = any(all(repmat(hand(:, 2, :), 1, 1, 1, 4) == repmat(cat(4, 1, 2, 3, 4), size(hand, 1), 1, size(hand, 3), 1)), 4);
    end
    function v = isStraight(hand, ~)
        straighty = @(x)all(diff(sort(x)) == 1);
        hand_one = hand(:, 1, :);
        s = straighty(hand_one);
        hand_one(hand_one==14) = 1;
        v = s | straighty(hand_one);
    end

    function v = isThreeOfAKind(~, nk)
        v = any(nk == 3, 4);
    end
    function v = isTwoPairs(~, nk)
        v = sum(nk == 2, 4) == 2;
    end

    function v = isJacksOrBetter(~, nk)
        v = any(nk(:, :, :, 10:13) == 2, 4);
        
    end
    function v = payoutFast(hand)
        v = zeros(1, 1, size(hand, 3));
        nk = isNOfAKind(hand);
        isfFlush1 = isFlush(hand);
        isStraight1 = isStraight(hand);
        couldBeRoyal = all(hand(:, 1, :) > 9);
        for idx = size(money, 1) : -1 : 1
            switch idx
                case 1
                    v(isfFlush1&isStraight1&couldBeRoyal) = money{idx, 2};
                case 2
                    v(isfFlush1&isStraight1) = money{idx, 2};
                case 5
                    v(isfFlush1) = money{idx, 2};
                case 6
                    v(isStraight1) = money{idx, 2};
                otherwise
                    v(feval(money{idx,1}, hand, nk)) = money{idx, 2};
            end
        end
    end
    function outputer(hand, payout_value, payout_std)
        stringF = ' 2 3 4 5 6 7 8 910 J Q K A';
        for idx9 = 1 : length(hand)
            fprintf('%s%s ', stringF(2 * round(hand(idx9) / 10) - 3 : 2 * round(hand(idx9) / 10) - 2),faces(5 - mod(hand(idx9), 10)));
        end
        if isempty(hand)
            fprintf('hold none');
        end
        if payout_value >= 0
            fprintf(': %0.2f $ +- %0.2f $', payout_value, payout_std);
        end
        fprintf('\n');
    end
testN = 50000;
rng('shuffle');
cardspool = 10 * round((1:52)/4 +1.25)' + repmat(1:4,1, 13)';
myhand = sort(cardspool(randperm(52,5)));
outputer(myhand, -1)
for idx5 = 1 : 32
    for idx6 = 1 : 5
        whichtohold{idx5}(6 - idx6) = mod(floor((idx5 - 1) / (2 ^ (idx6 - 1))), 2);
    end
    myhand_hold = myhand(logical(whichtohold{idx5}));
    myhand_nohold = myhand(~logical(whichtohold{idx5}));
    
    cards0 = sort([repmat([myhand_hold;myhand_nohold],1,1, testN); randi(4, 5 - length(myhand_hold), 1, testN) + 10 * (randi(13, 5 - length(myhand_hold), 1, testN) + 1)]);
    cards0(:, :, squeeze(any(diff(cards0) == 0))) = [];
    cards1 = cards0(~ismember(cards0, myhand_nohold));
    cards1 = reshape(cards1, 5, 1, []);
    cardsstore = [round(cards1 / 10), mod(cards1, 10)];
    cardsstore = uint8(cardsstore);
    simul_result = payoutFast(cardsstore);
    payout(idx5) = mean(simul_result);
    payout_std(idx5) = std(mean(reshape(simul_result(1 : floor(end/10) * 10), 10, [])'));
end
[~, idx5]  = max(payout);
myhand_hold = myhand(logical(whichtohold{idx5}));
outputer(myhand_hold, payout(idx5), payout_std(idx5));
showall = input('show all? ', 's');
if strcmp(showall, 'y')
    for idx5 = 32 : -1 : 1
        myhand_hold = myhand(logical(whichtohold{idx5}));
        outputer(myhand_hold, payout(idx5), payout_std(idx5));
    end
end
end