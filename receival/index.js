
const axios = require('axios').default;
const file = require('fs');

const timestamp = Math.floor(Date.now() / 1000);

const partiesUrl = `https://d2vz64kg7un9ye.cloudfront.net/data/index-t2wmrc.json?v=${timestamp}`;
const nationalUrl = `https://d2vz64kg7un9ye.cloudfront.net/data/500.json?v=${timestamp}`;
const municipalityUrl = (key) => `https://d2vz64kg7un9ye.cloudfront.net/data/${key}.json?v=${timestamp}`

console.log(`Getting parties & municipalities`);
(async function() {
    const { parties, municipalities } = await getPartiesAndMunicipalities();
    console.log(`Getting voting results of ${municipalities.length} municipalities`);

    let result = [];

    for (let i = 0; i < municipalities.length; i++) {
        const municipality = municipalities[i];
        
        const votes = await getVotes(municipality.key, parties);

        result.push({
            ...municipality,
            ...votes
        })

        console.log(`[${i}/${municipalities.length}]: ${municipality.label}`);
        // break;
    }

    file.writeFile('election-results.json', JSON.stringify(result), () => console.log("Finished"))
})();


async function getPartiesAndMunicipalities() {
    const data = (await axios.get(partiesUrl)).data;
    return {
        parties: data.parties,
        municipalities: data.views
    }
}

async function getVotes(key, parties) {
    const data = (await axios.get(municipalityUrl(key))).data

    let spreadedData = []
    for (let i = 0; i < data.parties.length; i++) {
        const { key, results } = data.parties[i];

        const partyData = parties.find(p => p.key === key);

        spreadedData.push({
            key,
            ...results,
            ...partyData
        })
    }

    return {
        ...data,
        parties: spreadedData
    }
}

