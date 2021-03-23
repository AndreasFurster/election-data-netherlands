
const axios = require('axios').default;
const file = require('fs');

const timestamp = Math.floor(Date.now() / 1000);

const partiesUrl = `https://d2vz64kg7un9ye.cloudfront.net/data/index-t2wmrc.json?v=${timestamp}`;
const nationalUrl = `https://d2vz64kg7un9ye.cloudfront.net/data/500.json?v=${timestamp}`;
const municipalityUrl = (key) => `https://d2vz64kg7un9ye.cloudfront.net/data/${key}.json?v=${timestamp}`

console.log(`Getting parties & municipalities`);
(async function() {
    const { municipalities } = await getPartiesAndMunicipalities();
    console.log(`Getting voting results of ${municipalities.length} municipalities`);

    let result = [];

    for (let i = 0; i < municipalities.length; i++) {
        const municipality = municipalities[i];
        
        // Skip if not municipality (but national or province)
        if(municipality.type !== 0) continue;

        const votes = await getVotes(municipality);

        result = [ ...result, ...votes ]

        console.log(`[${i}/${municipalities.length}]: ${municipality.label}`);
        // break;
    }

    file.writeFile('election-results.json', JSON.stringify(result), () => console.log("Finished"))
})();


async function getPartiesAndMunicipalities() {
    const data = (await axios.get(partiesUrl)).data;
    return {
        municipalities: data.views
    }
}

async function getVotes(municipality) {
    const { key: municipalityKey, parties, cbsCode, ...municipalityData } = (await axios.get(municipalityUrl(municipality.key))).data

    const realCbsCode = `GM${cbsCode}`

    let spreadedData = []
    for (let i = 0; i < parties.length; i++) {
        const { key: partyKey, results } = parties[i];

        spreadedData.push({
            cbsCode: realCbsCode,
            municipalityKey,
            partyKey,
            ...municipalityData,
            ...results,
        })
    }

    return spreadedData
}

