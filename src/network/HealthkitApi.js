import AppleHealthKit from 'react-native-health';
import moment from 'moment';
import { SHApiConnector } from './SHApiConnector';
import { AppStrings } from '../shared/AppStrings';

const PERMS = AppleHealthKit.Constants.Permissions;
const healthKitOptions = {
  permissions: {
    read: [
      PERMS.BloodPressureDiastolic,
      PERMS.BloodPressureSystolic,
      PERMS.OxygenSaturation,
      PERMS.HeartRate,
      PERMS.BodyTemperature,
      PERMS.BloodGlucose,
      PERMS.RespiratoryRate,
      PERMS.HeartRateVariability
    ],
  },
};

const getOption = (limit, unit, date) => {
  let option = {
    startDate: moment(new Date(Date.parse(date)))
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    endDate: moment(new Date(Date.parse(date)))
      .endOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    ascending: false,
    limit: limit,
  };
  if (unit) {
    option.unit = unit;
  }

  return option;
};

export const initialiseAppleHealthKit = async (date) => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(healthKitOptions, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result) {
        resolve(fetchHealthData(date));
      }
    });
  });
};

const fetchHealthData = async (date) => {
  const bloodPressureData = await fetchBloodPressureData(date);
  const oxygenSaturationData = await fetchOxygenSaturationData(date);
  const bodyTemperatureData = await fetchBodyTemperatureData(date);
  const heartRateData = await fetchHeartRateData(date);
  const bloodSugarData = await fetchBloodSugarData(date);
  const breathingRateData = await fetchBreathingRateData(date)
  const hrvData = await fetchHeartRateVariability(date)


  if (bloodPressureData === '' && oxygenSaturationData === '' && bodyTemperatureData === '' && bloodSugarData ==='' && breathingRateData ==='' && hrvData === '' && heartRateData === '') {
    return ''
  }
  else{
    return {
      ...bloodPressureData,
      ...oxygenSaturationData,
      ...heartRateData,
      ...bodyTemperatureData,
      ...bloodSugarData,
      ...breathingRateData,
      ...hrvData
    };
  }

  
};

const fetchBloodPressureData = async (date) => {
  return new Promise((resolve, reject) => {
    const options = getOption(1, 'mmhg', date);
    AppleHealthKit.getBloodPressureSamples(options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      if (results.length > 0) {
        const bloodPressureDiastolic = results[0]?.bloodPressureDiastolicValue;
        const bloodPressureSystolic = results[0]?.bloodPressureSystolicValue;
        resolve({ bloodPressureDiastolic, bloodPressureSystolic });
      } else {
        resolve('');
      }
    });
  });
};

const fetchOxygenSaturationData = async (date) => {
  return new Promise((resolve, reject) => {
    let options = getOption(1, '%', date);
    AppleHealthKit.getOxygenSaturationSamples(options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length > 0) {
        const oxygenSaturation = results[0]?.value * 100;
        resolve({ oxygenSaturation });
      } else {
        resolve('');
      }
    });
  });
};

const fetchBodyTemperatureData = async (date) => {
  return new Promise((resolve, reject) => {
    let options = getOption(1, 'celsius', date);
    AppleHealthKit.getBodyTemperatureSamples(options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      if (results.length > 0) {
        const bodyTemperature = results[0]?.value?.toFixed(2);
        resolve({ bodyTemperature });
      } else {
        resolve('');
      }
    });
  });
};

const fetchHeartRateData = async (date) => {
  return new Promise((resolve, reject) => {
    let options = getOption(10, 'bpm', date);
    AppleHealthKit.getHeartRateSamples(options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      if (results.length > 0) {
        const heartRate = results[0].value;
        resolve({ heartRate });
      } else {
        resolve('');
      }
    });
  });
};

const fetchBloodSugarData = async (date) => {
  return new Promise((resolve, reject) => {
    let options = getOption(10, 'mmolPerL', date);
    AppleHealthKit.getBloodGlucoseSamples(options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      if (results.length > 0) {
        const bloodSugarBF = results[0].metadata.HKBloodGlucoseMealTime === 1 ? results[0].value * 18 : 0;
        const bloodSugarAF = results[0].metadata.HKBloodGlucoseMealTime === 2 ? results[0].value * 18 : 0;
        resolve({ bloodSugarBF, bloodSugarAF });
      } else {
        resolve('');
      }
    });
  });
};

const fetchHeartRateVariability = (date) => {

  return new Promise((resolve, reject) => {
    let options = getOption(10, 'second', date);
    AppleHealthKit.getHeartRateVariabilitySamples(options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      if (results.length > 0) {
      
        const hrv = results[0]?.value * 1000
        resolve({hrv})
      } else {
        resolve('');
      }
    });
  });
};

const fetchBreathingRateData =async(date)=>{

 return new Promise((resolve, reject) => {
    let options = getOption(10, 'bpm', date);
    AppleHealthKit.getRespiratoryRateSamples(options, (err, results) => {
      if (err) {

        reject(err);
        return;
      }
      if (results.length > 0) {
    
        const breathingRate = results[0]?.value
        resolve({breathingRate})

      } else {
        resolve('');
      }
    });
  });
}

export const sendHealthkitDataToDB = async (recordList, relativeId, date) => {
  let updatedList = [];
  recordList.map((list) => {
    let status = false;
    status = true;

    let vitalStatus;

    if (list.recordQuantity < (list.isOtherVital ? list.minRange : list.vitalRange?.minRange || list.minRange)) {
      vitalStatus = 'Low';
    } else if (list.recordQuantity <= (list.isOtherVital ? list.maxRange : list.vitalRange?.maxRange || list.maxRange)) {
      vitalStatus = 'Normal';
    } else {
      vitalStatus = 'High';
    }

    updatedList.push({
      relativeId: relativeId,
      recordQuantity: list.recordQuantity || '',
      secondRecordQuantity: !list.secondRecordQuantity ? '' : list.secondRecordQuantity,
      recordDate: date,
      userVitalParameterRangeId: list.vitalRange ? list.vitalRange._id : list._id,
      device: AppStrings.vital_devices.APPLE_WATCH,
      vitalStatus: vitalStatus,
    });
  });
  let body = { vitalRecordList: updatedList };
  await SHApiConnector.setMultipleRecord(body)
    .then((response) => {
      console.log('healthkit data sent to db');
    })
    .catch((error) => {
      console.log(error, 'error in sending healthkit data to db');
    });
};
