export const convertToUnix = (isoDate) =>{
    return new Date(isoDate).getTime() / 1000;
}
