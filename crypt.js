let s = ['7 A B 6 C 8 5 E F 0 9 3 1 4 D 2', 'C 1 0 6 F A B 7 2 D 4 E 3 8 9 5', '0 9 5 8 3 6 4 2 7 F 1 C D B E A', '4 F A 2 7 E 3 0 9 1 C 5 8 B D 6', 'C A 6 5 F 7 0 D 4 E 2 3 1 B 8 9', '7 6 2 3 4 8 1 F 9 B D 0 E C A 5', 'C 9 1 A D 5 6 B 3 4 0 F 8 E 2 7', '9 1 F D 3 2 7 6 4 0 8 C 5 B A E'];
let pt = [14, 29, 11, 4, 24, 18, 5, 1, 2, 31, 3, 32, 16, 27, 22, 9, 23, 17, 13, 15, 26, 6, 12, 30, 21, 19, 28, 7, 20, 8, 10, 25];
let x = abc('5 6 F D 5 1 E 9 A 0 F 3 E 2 4 E');

var keys = ['0b11111100000001010101111100111000', '0b11011100110101001110001000111', '0b1011110110100101001101110111000', '0b11111000100110000101010001000111', '0b11000000000011101010101110111000', '0b111011010011110101010001000111', '0b11011001100100001010101110111000', '0b10010010001011110101010001000111', '0b1001110100001010101110111000', '0b1101110001011110101010001000111', '0b10001110100001010101110111000']
keys = keys.map(function (bin) {
    bin = bin.slice(2);
    while (bin.length < 32) {
        bin = '0' + bin;
    }
    return bin
})


function abc(x) {
    let arr = x.split(' ').map(function (a) {
        let bin = parseInt(a, 16).toString(2);
        while (bin.length < 4) {
            bin = '0' + bin;
        }
        return bin;
    })
    return arr.join('');
}

function roundPlus(a, b) {
    let result = '';
    for (let i = 0; i < a.length; i++) {
        result += (a[i] ^ b[i]);
    }
    return result;
}

function spReshuffle(num, spkey) {
    let a = [];
    let b = spkey.split(' ');
    for (let i = 0; i < 16; i++) {
        a.push(i.toString(16));
    }
    let bin = parseInt(b[a.indexOf(parseInt(num, 2).toString(16))], 16).toString(2);
    while (bin.length < 4) {
        bin = '0' + bin;
    }
    return bin;
}


function sp(word, key) {
    let bin = roundPlus(word, key);
    let temp = ''
    for (let i = 0; i < 8; i++) {
        temp += spReshuffle(bin.slice(4 * i, 4 * (i + 1)), s[i]);
    }
    bin = temp;
    temp = '';
    pt.forEach(function (i) {
        temp += bin[i - 1];
    })
    return temp;
}


keys = keys.reverse();

function nextKey(key) {
    let bin = ((parseInt(key, 2) * parseInt(key, 2) + 7)).toString(2).slice(-32);
    while (bin.length < 32) {
        bin = '0' + bin;
    }
    return bin;
}

function LeiMessy(word, key) {
    var a = roundPlus(word.slice(0, word.length / 2), (word.slice(word.length / 2)));
    a = sp(a, key);
    return roundPlus(word.slice(0, word.length / 2), a) + roundPlus((word.slice(word.length / 2)), a);
}



for (let i = 0; i < 11; i++) {
    x = LeiMessy(x, keys[i]);
}

let temp = ''
for (let i = 0; i < 16; i++) {
    temp += parseInt(x.slice(4 * i, 4 * (i + 1)), 2).toString(16);
}

console.log(temp);