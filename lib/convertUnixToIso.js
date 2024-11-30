export const convertToIsoDate = (unixTimestamp) =>{
    return new Date(Number(unixTimestamp) * 1000).toISOString();
}

export const convertTime = (originalTime) =>{
    const date = new Date(originalTime);
    return date.toISOString();
}
