const fs = require('fs')

const read = () => {
    const currect = JSON.parse(fs.readFileSync('./database/address.json').toString())
    return currect
}

const insert = (data) => {
    const isiFile = read()
    const fn = isiFile.find(el=>el.address === data.address)
    if(fn) return "This address is already in your watchlist";
    isiFile.push(data)
    fs.writeFileSync('./database/address.json', JSON.stringify(isiFile, null, '\t'));
    return "🎉 Congratulations! your address has ben saved..";
}

module.exports = {
    insert,read
}