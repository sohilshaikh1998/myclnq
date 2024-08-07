import { authorize, refresh } from 'react-native-app-auth';
import axios from 'axios';
import { SHApiConnector } from './SHApiConnector';
import { AppStrings } from '../shared/AppStrings';
import AsyncStorage from '@react-native-community/async-storage';
import { encode } from 'base-64';

export const fitbitConfig = {
  clientId: '23R8YH',
  clientSecret: '2c8c1310f1fde61444594a03de0d1fbb',
  redirectUrl: 'myclnq://fit',
  scopes: ['activity', 'heartrate', 'oxygen_saturation', 'sleep', 'temperature', 'respiratory_rate'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
  },
};

export const VITAL_OBJECT_API_MAP = {
  TEMPCORE: 'tempCore',
  BREATHING_RATE: 'br',
  ACTIVITIES: 'activities-heart',
  SPO2: 'spo2',
  HRV: 'hrv',
};

export const fetchFitBitData = async (date) => {
  let tempCore = '';
  let hrv = '';
  let breathingRate = '';
  let spo2 = '';
  let heartRate = '';
  try {
    const result = await authorize(fitbitConfig);

    await AsyncStorage.setItem(AppStrings.fitBitToken.REFRESH_TOKEN, result.refreshToken);
    await AsyncStorage.setItem(AppStrings.fitBitToken.ACCESS_TOKEN, result.accessToken);

    const endpoints = [
      `/temp/core/date/${date}.json`,
      `/br/date/${date}.json`,
      `/spo2/date/${date}.json`,
      `/hrv/date/${date}.json`,
      `/activities/heart/date/${date}/7d.json`,
    ];

    const axiosInstance = axios.create({
      baseURL: 'https://api.fitbit.com/1/user/-',
      headers: {
        Authorization: `Bearer ${result.accessToken}`,
      },
    });

    const promises = endpoints.map((endpoint) => {
      return axiosInstance
        .get(endpoint)
        .then((response) => response.data)
        .catch((error) => {
          console.error(`Error fetching data from ${endpoint}:`, error);
          throw error
          // Handle the error gracefully, returning null or other value
        });
    });

    const responses = await Promise.all(promises);

    responses.forEach((item, index) => {
      if (item[VITAL_OBJECT_API_MAP.TEMPCORE] && item[VITAL_OBJECT_API_MAP.TEMPCORE][0]?.value) {
        tempCore = item[VITAL_OBJECT_API_MAP.TEMPCORE][0].value;
      }
      if (item[VITAL_OBJECT_API_MAP.ACTIVITIES]) {
        const lastRestingHeartRateData = item[VITAL_OBJECT_API_MAP.ACTIVITIES]
          .filter((item) => item.value && item.value.restingHeartRate !== undefined)
          .pop(); // Get the last item with restingHeartRate

        // Extract the restingHeartRate value if available, or provide a default value.
        const lastRestingHeartRate = lastRestingHeartRateData ? lastRestingHeartRateData.value.restingHeartRate : '';

        heartRate = lastRestingHeartRate;
      }

      if (item[VITAL_OBJECT_API_MAP.BREATHING_RATE] && item[VITAL_OBJECT_API_MAP.BREATHING_RATE][0]?.value) {
        breathingRate = item[VITAL_OBJECT_API_MAP.BREATHING_RATE][0]?.value;
      }

      if (item?.value?.avg) {
        spo2 = item?.value?.avg;
      }

      if (item[VITAL_OBJECT_API_MAP.HRV] && item[VITAL_OBJECT_API_MAP.HRV][0]?.value) {
        hrv = item[VITAL_OBJECT_API_MAP.HRV][0].value.dailyRmssd;
      }
    });

    return { tempCore, spo2, hrv, breathingRate, heartRate };
  } catch (error) {
    console.log(error, 'error in fitbit');
    throw error

  }
};

export const sendFitBitDataToDB = async (recordList, relativeId, date) => {
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
      device: AppStrings.vital_devices.FITBIT,
      vitalStatus: vitalStatus,
    });
  });
  let body = { vitalRecordList: updatedList };
  await SHApiConnector.setMultipleRecord(body)
    .then((response) => {
      console.log('Fitbit data sent to db');
    })
    .catch((error) => {
      console.log(error, 'error in sending fitbit to db');
    });
};

export const revokeAccessToken = async (fetchedToken) => {
  const credentials = `${fitbitConfig.clientId}:${fitbitConfig.clientSecret}`;
  const credentialsBase64 = encode(credentials);

  let formBody = [];
  let encodedKey = encodeURIComponent('token');
  let encodedValue = encodeURIComponent(fetchedToken);
  formBody.push(encodedKey + '=' + encodedValue);
  formBody = formBody.join('&');

  fetch('https://api.fitbit.com/oauth2/revoke', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentialsBase64}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  })
    .then((response) => {
      console.log('fitbit token revoked------------');
    })
    .catch((error) => {
      console.log(error, 'errrorrrr----------------------');
    });
};
