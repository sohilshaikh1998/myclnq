export const CalculateFitbitData = (fetchedFitbitData, categoryList) => {
  let tempArray = categoryList;
  console.log(tempArray, 'arrray');

  for (const items of tempArray) {
    if (fetchedFitbitData.heartRate && items.parameterName === 'Heart Rate') {
      items.recordQuantity = fetchedFitbitData.heartRate;
    } else if (fetchedFitbitData.breathingRate.breathingRate && items.parameterName === 'Respiratory Rate') {
      items.recordQuantity = fetchedFitbitData.breathingRate.breathingRate;
    } else if (fetchedFitbitData.hrv && items.parameterName === 'Heart Rate Variability') {
      items.recordQuantity = fetchedFitbitData.hrv;
    } else if (fetchedFitbitData.spo2 && items.parameterName === 'Blood Oxygen') {
      items.recordQuantity = fetchedFitbitData.spo2[0]?.value;
    } else if (fetchedFitbitData.tempCore && items.parameterName === 'Body Temperature') {
      items.recordQuantity = fetchedFitbitData.tempCore;
    } else {
      return;
    }
  }

  console.log(tempArray, 'tempArray');

  return tempArray;
};
