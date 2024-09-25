import React, { useEffect } from 'react';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import AsyncStorage from '@react-native-community/async-storage';
import { SHApiConnector } from '../network/SHApiConnector';

const postData = async (data) => {
  await SHApiConnector.postSteps(data)
    .then((res) => {
      console.log('posted steps to backend', JSON.stringify(res));
    })
    .catch((e) => {
      console.log(e);
    });
};

export const fetchStepsData = async (opt) => {
  return;
  console.log('herere');
  try {
    await GoogleFit.getDailyStepCountSamples(opt)
      .then(async (res) => {
        console.log('herere1');
        console.log('@@@@@@@', JSON.stringify(res));
        console.log('>>>>>>>', res);
        if (res.length !== 0) {
          for (var i = 0; i < res.length; i++) {
            if (res[i].source === 'com.google.android.gms:estimated_steps') {
              let data = res[i].steps.reverse();
              dailyStepCount = res[i].steps;
              console.log('data for steps>>>>', data[0].value);
              await AsyncStorage.setItem('stepCount', data[0].value?.toString());
              await postData({
                data: [
                  {
                    activityType: 'steps',
                    withDevice: true,
                    activityCount: data[0]?.value,
                  },
                ],
              });
              setInterval(async () => {
                const res = await AsyncStorage.getItem('stepCount');
                await postData({
                  data: [
                    {
                      activityType: 'steps',
                      withDevice: true,
                      activityCount: res,
                    },
                  ],
                });
              }, 180000);
            }
          }
        } else {
          console.log('Not Found');
        }
      })
      .catch((err) => {
        console.log('herere2');
        console.log(err);
      });
  } catch (error) {
    console.log('hererer error', error);
  }
};

export const googleFitCode = async () => {
  return;
  console.log('Beat Body call');
  const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_ACTIVITY_WRITE,
      Scopes.FITNESS_BODY_READ,
      Scopes.FITNESS_BODY_WRITE,
      Scopes.FITNESS_BLOOD_PRESSURE_READ,
      Scopes.FITNESS_BLOOD_PRESSURE_WRITE,
      Scopes.FITNESS_BLOOD_GLUCOSE_READ,
      Scopes.FITNESS_BLOOD_GLUCOSE_WRITE,
      Scopes.FITNESS_NUTRITION_WRITE,
      Scopes.FITNESS_SLEEP_READ,
    ],
  };
  GoogleFit.checkIsAuthorized().then(async () => {
    var authorized = GoogleFit?.isAuthorized;
    console.log(authorized);
    if (authorized) {
      var today = new Date();
      var lastWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      try {
        console.log('NOWWWW');
        const opt = {
          startDate: lastWeekDate?.toISOString(), // required ISO8601Timestamp
          endDate: today?.toISOString(), // required ISO8601Timestamp
          bucketUnit: 'DAY', // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
          bucketInterval: 1, // optional - default 1.
        };
        console.log('calling steps counter');
        await AskPermissionForActivity(opt);
      } catch (e) {
        console.log('error', e);
      }
    } else {
      // Authentication if already not authorized for a particular device
      GoogleFit.authorize(options)
        .then(async (authResult) => {
          if (authResult.success) {
            console.log('AUTH_SUCCESS');
            const opt = {
              startDate: lastWeekDate?.toISOString(), // required ISO8601Timestamp
              endDate: today?.toISOString(), // required ISO8601Timestamp
              bucketUnit: 'DAY', // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
              bucketInterval: 1, // optional - default 1.
            };
            await AskPermissionForActivity(opt);

            // if successfully authorized, fetch data
          } else {
            console.log('AUTH_DENIED ' + authResult.message);
          }
        })
        .catch((e) => {
          console.log('AUTH_ERROR', e);
        });
    }
  });
};

export const AskPermissionForActivity = async (opt) => {
  return;
  check(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION).then(async (result) => {
    console.log('?????', result);
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available (on this device / in this context)');
        break;
      case RESULTS.DENIED:
        console.log('The permission has not been requested / is denied');
        await request(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION).then(async () => {
          await GoogleFit.startRecording(async (callback) => {
            console.log('>>>>>>>>', callback);
            await fetchStepsData(opt);
          });
        });
        break;
      case RESULTS.GRANTED:
        try {
          await GoogleFit.startRecording(async (callback) => {
            console.log('>>>>>>>>', callback);
            await fetchStepsData(opt);
          });
        } catch (e) {
          console.log('QQQQQ', e);
        }

        break;
    }
  });
};
