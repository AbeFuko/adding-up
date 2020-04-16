'use strict';
const fs = require('fs') //"FileSystem"：ファイルを扱うモジュール
const readline = require('readline') //ファイルを1行ずつ読み込むためのモジュール

const rs = fs.ReadStream('./popu-pref.csv') //指定ファイルからStream生成
const rl = readline.createInterface({ 'input': rs, 'output': {} }); //Streamインターフェイス

//Map生成(key,valueはコメントで記す)
const map = new Map(); //key: 都道府県, value: 修正データのオブジェクト

//"line"イベントが発生したら関数を呼ぶ
rl.on('line', (lineString) => {
    const columns = lineString.split(','); //"split":分けて配列にする
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);

    if (year === 2010 || year === 2015) {
        let value = map.get(prefecture);
        
        if (!value) {
            value = {
                popu10: 0,　//2010年人口
                popu15: 0, //2015年人口
                change: null //変化率
            };
        }
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
});
//Streamに情報を流し始める処理
rl.resume();
rl.on('close', () => {
    for (let pair of map) {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + ':' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率:' + pair[1].change;
    });
    console.log(rankingStrings);
});
