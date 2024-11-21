export const constructMetadata = (name, description, imageHash, purchasePrice,color,strength,rarity,powerLevel) => (
    {
        name,
        description,
        image: `https://ipfs.io/ipfs/${imageHash}`,
        purchase_price: purchasePrice,
        attributes: [
            {
                "trait_type": "Color",
                "value": color
            },
            {
                "trait_type": "Strength",
                "value": strength
            },
            {
                "trait_type": "Rarity",
                "value": rarity
            },
            {
                "trait_type": "Power Level",
                "value": powerLevel
            }
        ],
    }
);