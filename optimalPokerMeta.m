for idx = 101:1000
    idx
    zz(idx) = optimalPoker();
    z = max(sum(zz(idx).payout_matrix .* repmat(cell2mat(money(:,2))',32, 1), 2))/50000;
    zzz(idx)= z;
    savejson('solution', zz(idx),['games/solution_' num2str(idx-1) '.json'])
end
