// Reproduces listPage.php / editproperty-details.php auto-generated
// title, location and description — byte-for-byte where possible.
export function buildPropertyText({
  area, type, city, governorate, exactLocation,
  bedrooms, livingrooms, bathrooms, furnished, moreDetails, status, price
}) {
  const title = `${area} (m²) ${type}`;
  const location = `${city}, ${governorate} at ${exactLocation}`;

  let description =
    `A ${title} located in ${location}. Has ${bedrooms} bedrooms, ` +
    `${livingrooms} living rooms, and ${bathrooms} bathrooms.`;
  description += ` It is ${furnished ? 'furnished' : 'not furnished'}.`;
  if (moreDetails) description += ` and also has ${moreDetails}.`;
  if (status === 'rent') {
    description += ` This ${type} is for rent at ${price} USD per month.`;
  } else {
    description += ` This ${type} is for sale at ${price} USD.`;
  }
  return { title, location, description };
}
