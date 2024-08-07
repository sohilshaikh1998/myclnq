import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  BackHandler,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableHighlight,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  Keyboard,
  I18nManager
} from 'react-native';

import ProgressLoader from 'rn-progress-loader';
import AsyncStorage from '@react-native-community/async-storage';
import { AppArray } from '../../utils/AppArray';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Actions } from 'react-native-router-flux';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import VitalHomeScreenStyle from './VitalHomeScreenStyle';
import cartStyle from './../medicalEquipment/medicalCart/cartStyle';

import { SHApiConnector } from '../../network/SHApiConnector';
import { AppUtils } from '../../utils/AppUtils';

import { AppStrings } from '../../shared/AppStrings';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

import { CachedImage } from '../../cachedImage';
import Geolocation from '@react-native-community/geolocation';
import FamilyProfile from './../commonFiles/FamilyProfile';
import ElevatedView from 'react-native-elevated-view';

import images from '../../utils/images';
import BottomUp from 'react-native-modal';
import { moderateScale } from '../../utils/Scaling';
import moment from 'moment';
import { strings } from '../../locales/i18n';
import { fetchFitBitData, revokeAccessToken, sendFitBitDataToDB } from '../../network/vitalApi';
import { initialiseAppleHealthKit, sendHealthkitDataToDB } from '../../network/HealthkitApi';
import ToggleIcon from '../../icons/ToggleIcon';
import VitalDevices from './VitalDevices';

var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;

export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position),
      (e) => reject(e)
    );
  });
};

class VitalHomeScreen extends Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Medical Equipment Home Screen');
    this.state = {
      dateToday: AppUtils.currentDateTime(),
      appState: AppState.currentState,
      selectedRelative: [],
      maxDate: AppUtils.currentDateTime(),
      showDateSelector: false,
      healthMessage: 'Your Health is Perfect ! ',
      healthImage: images.like,
      sDate: moment(AppUtils.currentDateTime()).format('YYYY-MM-DD'),
      categoryList: [],
      otherModal: false,
      name: '',
      measurement: '',
      maxRange: '',
      minRange: '',
      parameterUnit: '',
      parameterName: '',
      showDeviceList: false,
      deviceList: Platform.OS === 'android' ? AppArray.androidDeviceList() : AppArray.iosDeviceList(),
      heartRate: '',
      spo2: '',
      hrv: '',
      breathingRate: '',
      isFetching: false,
      relativeProfile: '',
      fitbitConnected: false,
      healkitConnected: false,
    };
  }

  async sendHealthkitData(healthkitData) {
    let body = {
      recordDate: this.state.sDate,
    };

    let response = await SHApiConnector.getVitalDashboard(this.state.relativeProfile._id, body);

    let oldstate = response.data.response;
    oldstate.map((item) => {
      let minRange = !item.vitalRange ? '' : item.vitalRange.minRange ? '' + item.vitalRange.minRange : '';
      let maxRange = !item.vitalRange ? '' : item.vitalRange.maxRange ? '' + item.vitalRange.maxRange : '';
      minRange = !item.isOtherVital ? minRange : '' + item.minRange;
      maxRange = !item.isOtherVital ? maxRange : '' + item.maxRange;
      let hasRange = maxRange && minRange ? true : false;

      if (item.parameterName === 'Heart Rate') {
        item.recordQuantity = healthkitData.heartRate;
        item.device = AppStrings.vital_devices.APPLE_WATCH;
      } else if (item.parameterName === 'Body Temperature') {
        item.recordQuantity = healthkitData.bodyTemperature;
        item.device = AppStrings.vital_devices.APPLE_WATCH;
      } else if (item.parameterName === 'Blood Oxygen') {
        item.recordQuantity = healthkitData.oxygenSaturation;
        item.device = AppStrings.vital_devices.APPLE_WATCH;
      } else if (item.parameterName === 'Heart Rate Variability') {
        item.recordQuantity = healthkitData.hrv;
        item.device = AppStrings.vital_devices.APPLE_WATCH;
      } else if (item.parameterName === 'Respiratory Rate') {
        item.recordQuantity = healthkitData.breathingRate;
        item.device = AppStrings.vital_devices.APPLE_WATCH;
      } else if (item.parameterName === 'Blood Pressure') {
        item.recordQuantity = healthkitData.bloodPressureSystolic;
        item.secondRecordQuantity = healthkitData.bloodPressureDiastolic;
        item.device = AppStrings.vital_devices.APPLE_WATCH;
      } else {
        return;
      }
    });

    await sendHealthkitDataToDB(oldstate, this.state.relativeProfile._id, this.state.sDate)
      .then(() => {
        Alert.alert(
          '',
          'Vitals Fetched Successfully.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await this.getVitalDashboard(this.state.relativeProfile._id);
              },
            },
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        console.log(error, 'error in sending data to db');
        Alert.alert('', 'Something went wrong!!');
      });
  }

  async sendFitBitData(fitBitResponse) {
    let body = {
      recordDate: this.state.sDate,
    };

    let response = await SHApiConnector.getVitalDashboard(this.state.relativeProfile._id, body);

    let oldstate = response.data.response;

    oldstate.map((item) => {
      let minRange = !item.vitalRange ? '' : item.vitalRange.minRange ? '' + item.vitalRange.minRange : '';
      let maxRange = !item.vitalRange ? '' : item.vitalRange.maxRange ? '' + item.vitalRange.maxRange : '';
      minRange = !item.isOtherVital ? minRange : '' + item.minRange;
      maxRange = !item.isOtherVital ? maxRange : '' + item.maxRange;
      let hasRange = maxRange && minRange ? true : false;

      if (item.parameterName === 'Heart Rate') {
        item.recordQuantity = fitBitResponse.heartRate;
        item.device = AppStrings.vital_devices.FITBIT;
      } else if (item.parameterName === 'Body Temperature') {
        item.recordQuantity = fitBitResponse.tempCore;
        item.device = AppStrings.vital_devices.FITBIT;
      } else if (item.parameterName === 'Blood Oxygen') {
        item.recordQuantity = fitBitResponse.spo2;
        item.device = AppStrings.vital_devices.FITBIT;
      } else if (item.parameterName === 'Heart Rate Variability') {
        item.recordQuantity = fitBitResponse.hrv;
        item.device = AppStrings.vital_devices.FITBIT;
      } else if (item.parameterName === 'Respiratory Rate') {
        item.recordQuantity = fitBitResponse.breathingRate.breathingRate;
        item.device = AppStrings.vital_devices.FITBIT;
      } else if (item.parameterName === 'Blood Pressure') {
        item.recordQuantity = this.state.bloodPressureSystolic;
        item.secondRecordQuantity = this.state.bloodPressureDiastolic;
        item.device = AppStrings.vital_devices.MANUAL;
      }
    });

    await sendFitBitDataToDB(oldstate, this.state.relativeProfile._id, this.state.sDate)
      .then(() => {
        Alert.alert(
          '',
          'Vitals fetched successfully.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await this.getVitalDashboard(this.state.relativeProfile._id);
              },
            },
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        console.log(error, 'error in sending data to db');
        Alert.alert('', 'Something went wrong!!');
      });
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.callVitalDashboard(this.state.relativeProfile._id);
    }

    this.setState({ appState: nextAppState });
  };

  async getVitalDeviceConnectionStatus() {
    try {
      const healthKitConnectionStatus = await AsyncStorage.getItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED);
      const fitbitConnectedStatus = await AsyncStorage.getItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED);
      this.setState({
        healkitConnected: healthKitConnectionStatus === 'true',
        fitbitConnected: fitbitConnectedStatus === 'true',
      });
    } catch (error) {
      console.error('Error loading health kit connection status:', error);
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.getVitalDeviceConnectionStatus();
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        this.goBack();
        return true;
      });
    }
  }

  componentWillReceiveProps(props) {
    AppUtils.console('MyAppProps', props);
    if (props.update) {
      if (!props.sDate) {
        this.callVitalDashboard(this.state.relativeProfile._id);
      } else {
        this.setState({ sDate: props.sDate }, () => {
          this.callVitalDashboard(this.state.relativeProfile._id);
        });
      }
    }
  }

  async setMultipleRange() {
    this.setState({
      isLoading: true,
    });
    let body = {
      relativeId: this.state.relativeProfile._id,
      relativeName: this.state.relativeProfile.firstName + ' ' + this.state.relativeProfile.lastName,
      minRange: '' + this.state.minRange,
      maxRange: '' + this.state.maxRange,
      parameterName: this.state.parameterName.trim(),
      parameterUnit: this.state.parameterUnit.trim(),
    };
    AppUtils.console('body', body);

    try {
      let response = await SHApiConnector.setOtherVital(body);

      AppUtils.console('vitalmultipleResponse', response);
      if (response.data.status) {
        this.setState({
          isLoading: false,
          minRange: '',
          maxRange: '',
          parameterName: '',
          parameterUnit: '',
        });

        setTimeout(() => {
          Alert.alert('', strings('vital.vital.otherParamAddSuccess'), [
            { cancelable: false },
            {
              text: strings('doctor.button.ok'),
              onPress: () => this.callVitalDashboard(this.state.relativeProfile._id),
            },
          ]);
        }, 300);
      } else {
        this.setState({
          isLoading: false,
          minRange: '',
          maxRange: '',
          parameterName: '',
          parameterUnit: '',
        });
        setTimeout(() => {
          Alert.alert('', response.data.error_message);
        }, 300);
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      });

      AppUtils.console('Vital', e);
    }
  }

  async getVitalDashboard(id) {
    try {
      this.setState({ isLoading: true });

      let body = { recordDate: this.state.sDate };

      let response = await SHApiConnector.getVitalDashboard(id, body);

      this.setState({ isFetching: false });

      AppUtils.console('vitaldashboardResponse', response);
      if (response.data.status) {
        let data = response.data.response.concat([{ showAddOther: true }]);
        this.setState({ categoryList: data, isLoading: false });
        this.setHealthMessage(response.data.response);
      } else {
        this.setState({ isLoading: false });
      }
    } catch (e) {
      this.setState({ isLoading: false, isFetching: false });
      AppUtils.console('Article', e);
    }
  }

  setHealthMessage(Data) {
    let checkRecords;
    let recordCount = 0;
    let normalRecordCount = 0;
    let lowRecordCount = 0;
    let vitalName = '';
    let message;
    let vitalStatus;
    let status;
    let vitalStatusSecond;
    let multiParamItem = [];
    Data.map((item, i) => {
      // console.log(item.vitalRecord.recordQuantity,'recordQty')
      if (!item.vitalRecord) {
      } else {
        recordCount++;
        AppUtils.console('fwerfdcvxfwerfd', item.vitalRecord.recordQuantity);

        if (item.vitalRecord.recordQuantity !== null) {
          vitalStatus =
            item.vitalRecord.recordQuantity < (!item.isOtherVital ? item.vitalRange.minRange : item.minRange)
              ? 'Low'
              : item.vitalRecord.recordQuantity >= (!item.isOtherVital ? item.vitalRange.minRange : item.minRange) &&
                item.vitalRecord.recordQuantity <= (!item.isOtherVital ? item.vitalRange.maxRange : item.maxRange)
              ? 'Normal'
              : 'High';
        }
        AppUtils.console('DashStatus', vitalStatus, item);
        if (vitalStatus == 'Normal') {
          normalRecordCount++;
        } else if (vitalStatus == 'Low' || vitalStatus == 'High') {
          lowRecordCount++;
          vitalName = item.parameterName;
          status = vitalStatus;
          if (!item.isMultiParam) {
          } else {
            multiParamItem = item;
          }
        }
      }
    });
    if (recordCount <= 4) {
      message = strings('vital.vital.notEnoughDataForReport');
      this.setState({ healthMessage: message, healthImage: images.sad });
    } else if (normalRecordCount == recordCount) {
      message = strings('vital.vital.reportNormal');
      this.setState({ healthMessage: message, healthImage: images.like });
    } else if (lowRecordCount == 1) {
      AppUtils.console('DashData', vitalName, vitalStatus);
      if (multiParamItem.length === 0) {
        message = strings('vital.vital.consultDoctor', {
          name: vitalName,
          status: status == 'Low' ? 'low' : status == 'High' ? 'high' : '',
        });
        this.setState({ healthMessage: message, healthImage: images.low });
      } else {
        AppUtils.console('DashDataMulti', multiParamItem);
        vitalStatus =
          multiParamItem.vitalRecord.recordQuantity <= (!multiParamItem.isOtherVital ? multiParamItem.vitalRange.maxRange : multiParamItem.maxRange)
            ? 'Normal'
            : 'High';
        vitalStatusSecond =
          multiParamItem.vitalRecord.secondAverageRecord <
          (!multiParamItem.isOtherVital ? multiParamItem.vitalRange.minRange : multiParamItem.minRange)
            ? 'Low'
            : 'Normal';
        if (multiParamItem.parameterName === 'BP') {
          vitalStatusSecond =
            multiParamItem.vitalRecord.secondAverageRecord >
            (!multiParamItem.isOtherVital ? multiParamItem.vitalRange.minRange : multiParamItem.minRange)
              ? 'High'
              : 'Normal';
        }
        AppUtils.console('DashDataMulti', vitalStatus, 'second', vitalStatusSecond);

        if (vitalStatus == 'Low' && vitalStatusSecond == 'Low') {
          vitalName = multiParamItem.parameterName;
          status = vitalStatus;
        } else if (vitalStatus == 'High' && vitalStatusSecond == 'High') {
          vitalName = multiParamItem.parameterName;
          status = vitalStatus;
        } else if (vitalStatus == 'Low' || vitalStatus == 'High') {
          vitalName = multiParamItem.parameterName + ' (' + multiParamItem.firstSubParameterName + ')';
          status = vitalStatus;
        } else if (vitalStatusSecond == 'Low' || vitalStatusSecond == 'High') {
          vitalName = multiParamItem.parameterName + '(' + multiParamItem.secondSubParameterName + ')';
          status = vitalStatusSecond;
        }
        // message = strings('vital.vital.notNormalConsultDoc', {
        //   name: vitalName,
        // });
        message = strings('vital.vital.notNormalConsultDoc');
        this.setState({ healthMessage: message, healthImage: images.low });
      }
    } else if (lowRecordCount > 1) {
      AppUtils.console('Dashitem18');
      message = strings('vital.vital.countLowConsultDoc');
      // message = strings('vital.vital.countLowConsultDoc', {
      //   count: lowRecordCount,
      // });
      this.setState({ healthMessage: message, healthImage: images.low });
    } else if (lowRecordCount == 0) {
      message = strings('vital.vital.notEnoughDataForReport');
      this.setState({ healthMessage: message, healthImage: images.sad });
    }
    AppUtils.console('Message', message);
  }

  goBack() {
    Actions.MainScreen();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);

    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        Actions.MainScreen();
      });
    }
  }

  addVital() {
    if (!this.state.parameterName.trim()) {
      Alert.alert('', strings('vital.vital.enterParamName'));
    } else if (!this.state.parameterUnit.trim()) {
      Alert.alert('', strings('vital.vital.enterParamUnit'));
    } else if (!this.state.maxRange) {
      Alert.alert('', strings('vital.vital.enterMaxRange'));
    } else if (!this.state.minRange) {
      Alert.alert('', strings('vital.vital.enterMinRange'));
    } else if (!(parseInt(this.state.minRange) <= parseInt(this.state.maxRange))) {
      Alert.alert('', strings('vital.vital.checkMinMaxRange'));
    } else {
      this.setState({ otherModal: false });
      this.setMultipleRange();
    }
  }

  async fetchVitalsData(item) {
    if (item._id === 1) {
      if (this.state.fitbitConnected) {
        const accessToken = await AsyncStorage.getItem(AppStrings.fitBitToken.ACCESS_TOKEN);
        await revokeAccessToken(accessToken).then(() => {
          AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'false');
          this.setState({ showDeviceList: false, isFetching: false, fitbitConnected: false });
          Alert.alert('', 'Fitbit Disconnected!!');
        });
      } else {
        await fetchFitBitData(this.state.sDate)
          .then(async (result) => {
            this.setState({ showDeviceList: false, isFetching: false });
            if ((result.breathingRate && result.breathingRate.breathingRate) || result.heartRate || result.hrv || result.spo2 || result.tempCore) {
              await this.sendFitBitData(result);
              if (Platform.OS === 'ios') {
                await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'false');
                await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
                this.setState({ fitbitConnected: true, healkitConnected: false });
              } else {
                await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
                this.setState({ fitbitConnected: true });
              }
            }
            if (result.breathingRate === '' && result.tempCore === '' && result.heartRate === '' && result.hrv === '' && result.spo2 === '') {
              if (Platform.OS === 'ios') {
                await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'false');
                await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
                this.setState({ fitbitConnected: true, healkitConnected: false });
              } else {
                await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
                this.setState({ fitbitConnected: true });
              }
              Alert.alert('', 'No new data found from Fitbit');
            }
          })
          .catch((err) => {
            console.log(err, err?.response, 'error while fetching fitbit data');
            this.setState({ isFetching: false, showDeviceList: false });

            if (err?.response?.status === 429) {
              Alert.alert('Too many Requests', 'Try again');
            } else if (err === '[Error: The user denied the request.]' || err?.response?.status === 403) {
              Alert.alert('Permission denied!!', 'Please grant permission');
            } else {
              Alert.alert('', 'Sign In Cancelled!!');
            }
          });
      }
    }
    if (item._id === 2 && Platform.OS === 'ios') {
      let healthkitData = await initialiseAppleHealthKit(this.state.sDate);
      this.setState({ showDeviceList: false, isFetching: false });
      if (this.state.healkitConnected) {
        await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'false');

        this.setState({ healkitConnected: false });
        Alert.alert('', 'Apple Health Disconnected !!');
      } else {
        if (healthkitData === '') {
          await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'true');
          await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'false');
          this.setState({ healkitConnected: true, fitbitConnected: false });
          Alert.alert('', 'No new data found from Apple Health');
        }
        if (
          healthkitData.heartRate ||
          healthkitData.breathingRate ||
          healthkitData.bodyTemperature ||
          healthkitData.oxygenSaturation ||
          healthkitData.bloodPressureDiastolic ||
          healthkitData.bloodPressureSystolic ||
          healthkitData.hrv
        ) {
          await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'true');
          await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'false');
          this.setState({ healkitConnected: true, fitbitConnected: false });
          this.sendHealthkitData(healthkitData);
        }
      }
    }
  }

  async refreshVitalsData() {
    if (this.state.fitbitConnected) {
      await fetchFitBitData(this.state.sDate)
        .then(async (result) => {
          this.setState({ isFetching: false, showDeviceList: false });
          if ((result.breathingRate && result.breathingRate.breathingRate) || result.heartRate || result.hrv || result.spo2 || result.tempCore) {
            await this.sendFitBitData(result);
            if (Platform.OS === 'ios') {
              await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'false');
              await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
              this.setState({ fitbitConnected: true, healkitConnected: false });
            } else {
              await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
              this.setState({ fitbitConnected: true });
            }
          }
          if (result.breathingRate === '' && result.tempCore === '' && result.heartRate === '' && result.hrv === '' && result.spo2 === '') {
            if (Platform.OS === 'ios') {
              await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'false');
              await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
              this.setState({ fitbitConnected: true, healkitConnected: false });
            } else {
              await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'true');
              this.setState({ fitbitConnected: true });
            }

            Alert.alert('', 'No new data found from Fitbit');
          }
        })
        .catch((err) => {
          console.log(err, 'fetching fitbit data error');
          this.setState({ isFetching: false, showDeviceList: false });

          if (err?.response?.status === 429) {
            Alert.alert('Too many Requests', 'Try again');
          } else if (err === '[Error: The user denied the request.]' || err?.response?.status === 403) {
            Alert.alert('Permission denied!!', 'Please grant permission');
          } else {
            Alert.alert('', 'Sign In Cancelled!!');
          }
        });
    }
    if (this.state.healkitConnected && Platform.OS === 'ios') {
      this.setState({ isFetching: false, showDeviceList: false });
      let healthkitData = await initialiseAppleHealthKit(this.state.sDate);
      if (healthkitData === '') {
        await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'true');
        await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'false');
        this.setState({ healkitConnected: true, fitbitConnected: false });
        // Alert.alert('', 'No new data found from Apple Health');
        Alert.alert(
          '',
          'No new data found from Apple Health',
          [
            {
              text: 'OK',
              onPress: async () => {
                await this.getVitalDashboard(this.state.relativeProfile._id);
              },
            },
          ],
          { cancelable: false }
        );
      }
      if (
        healthkitData.heartRate ||
        healthkitData.breathingRate ||
        healthkitData.bodyTemperature ||
        healthkitData.oxygenSaturation ||
        healthkitData.bloodPressureDiastolic ||
        healthkitData.bloodPressureSystolic ||
        healthkitData.hrv
      ) {
        await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.HEALTHKIT_CONNECTED, 'true');
        await AsyncStorage.setItem(AppStrings.vitalDeviceConnected.FITBIT_CONNECTED, 'false');
        this.setState({ healkitConnected: true, fitbitConnected: false });
        this.sendHealthkitData(healthkitData);
      }
    }
  }

  async onRefresh() {
    this.setState({ isFetching: true });
    if (this.state.fitbitConnected || this.state.healkitConnected) {
      await this.refreshVitalsData();
    } else {
      this.setState({ isFetching: false });
    }
  }

  renderOtherParameter = () => (
    <BottomUp
      avoidKeyboard={false}
      isVisible={this.state.otherModal}
      onBackdropPress={() => this.modalPress()}
      onBackButtonPress={() => this.modalPress()}
      //isVisible={this.state.otherModal}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
      key={this.state.otherModal ? 1 : 2}
    >
      <KeyboardAvoidingView behavior={AppUtils.isIphone ? 'padding' : null}>
        <View
          style={{
            backgroundColor: AppColors.whiteColor,
            paddingTop: wp('5'),
            justifyContent: 'center',
            alignItems: 'center',
            borderTopRightRadius: wp(8),
            borderTopLeftRadius: wp(8),
            borderColor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <View
            style={{
              width: wp(90),
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: AppColors.whiteColor,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                this.setState({ otherModal: false });
              }}
              style={{ width: wp(15) }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  {
                    fontSize: 16,
                    color: AppColors.blackColor,
                  },
                ]}
              >
                {strings('doctor.button.cancel')}
              </Text>
            </TouchableOpacity>
            <Text
              allowFontScaling={false}
              style={[
                {
                  width: wp(65),
                  textAlign: 'center',
                  fontSize: 16,
                  color: AppColors.blackColor,
                },
              ]}
            >
              {strings('vital.vital.addOtherParam')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.addVital();
              }}
              style={[{ width: wp(10) }]}
            >
              <Text
                allowFontScaling={false}
                style={[
                  {
                    textAlign: 'right',
                    color: AppColors.colorHeadings,
                    fontSize: 16,
                  },
                ]}
              >
                {strings('doctor.button.camelAdd')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={VitalHomeScreenStyle.dividerVital} />
          <View
            style={{
              backgroundColor: AppColors.backgroundGray,
              width: wp(100),
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: hp(3),
                marginBottom: hp(8),
                backgroundColor: AppColors.whiteColor,
              }}
            >
              <TextInput
                allowFontScaling={false}
                placeholder={strings('vital.vital.paramName')}
                value={this.state.parameterName}
                // autoFocus={true}
                placeholderTextColor={AppColors.textGray}
                onChangeText={(input) => this.setState({ parameterName: input })}
                style={VitalHomeScreenStyle.modalListContentViewTxt}
              />

              <TextInput
                allowFontScaling={false}
                placeholder={strings('vital.vital.paramUnit')}
                value={this.state.parameterUnit}
                placeholderTextColor={AppColors.textGray}
                onChangeText={(input) => this.setState({ parameterUnit: input })}
                style={VitalHomeScreenStyle.modalListContentViewTxt}
              />

              <TextInput
                allowFontScaling={false}
                placeholder={strings('vital.vital.minRange')}
                keyboardType="decimal-pad"
                value={`${this.state.minRange}`}
                placeholderTextColor={AppColors.textGray}
                onChangeText={(value) =>
                  this.setState({
                    minRange: isNaN(`${value}`) ? '' : `${value}`,
                  })
                }
                style={VitalHomeScreenStyle.modalListContentViewTxt}
              />
              <TextInput
                allowFontScaling={false}
                placeholder={strings('vital.vital.maxRange')}
                value={`${this.state.maxRange}`}
                keyboardType="decimal-pad"
                placeholderTextColor={AppColors.textGray}
                onChangeText={(value) =>
                  this.setState({
                    maxRange: isNaN(`${value}`) ? '' : `${value}`,
                  })
                }
                style={VitalHomeScreenStyle.modalListContentViewTxt}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomUp>
  );
  modalPress = () => {
    this.setState({
      otherModal: !this.state.otherModal,
    });
  };

  renderCategory(item) {
    let recordQt = '--';
    recordQt = AppUtils.getRecord(item.item);
    recordQt = recordQt !== null && recordQt !== undefined && !isNaN(parseFloat(recordQt)) ? recordQt : '--';
    let image = !item.item.isOtherVital
      ? { uri: AppUtils.handleNullImg(item.item.parameterImage) }
      : require('../../../assets/images/healthcare.png');

    return (
      <View>
        {!item.item.showAddOther ? (
          <TouchableOpacity
            onPress={() => {
              this.categoryClick(item);
            }}
            activeOpacity={0.7}
            style={VitalHomeScreenStyle.categoryIndividualAlignment}
          >
            <View style={VitalHomeScreenStyle.categorySub}>
              <Text numberOfLines={2} style={VitalHomeScreenStyle.categoryTitleTxt}>
                {item.item.parameterName}
              </Text>
              <CachedImage resizeMode={'contain'} style={VitalHomeScreenStyle.categoryImageStyle} source={image} />
            </View>
            <View style={VitalHomeScreenStyle.categoryTxt}>
              <Text numberOfLines={1} style={[VitalHomeScreenStyle.categoryVital, { width: wp(22) }]}>
                {recordQt}
              </Text>
              <Text numberOfLines={1} style={VitalHomeScreenStyle.categoryVitalTxt}>
                {item.item.parameterUnit}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              this.setState({ otherModal: true });
            }}
            activeOpacity={0.7}
            style={[VitalHomeScreenStyle.categoryIndividualAlignment]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                marginTop: hp(1),
                marginRight: hp(0.5),
                marginLeft: hp(0.5),
              }}
            >
              <CachedImage
                resizeMode={'contain'}
                style={{
                  width: hp(4),
                  height: hp(4),
                  justifyContent: 'flex-end',
                }}
                source={images.add_new}
              />
            </View>
            <Text
              numberOfLines={2}
              style={[
                {
                  fontSize: wp(3),
                  width: wp(28),
                  textAlign: 'center',
                  alignItems: 'center',
                  fontFamily: AppStyles.fontFamilyRegular,
                  paddingTop: hp(2),
                  color: AppColors.blackColor,
                  height: hp(5.8),
                },
              ]}
            >
              {strings('vital.vital.addOther')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  categoryClick(item) {
    AppUtils.console('VitalRecord', item);
    if (!item.item.vitalRange && !item.item.isOtherVital) {
      Alert.alert('', strings('string.alert.vital_range'), [
        {
          text: strings('doctor.button.cancel'),
          style: 'cancel',
        },
        {
          text: strings('vital.vital.setRange'),
          onPress: () =>
            Actions.SetVitalRange({
              relativeProfile: this.state.relativeProfile,
            }),
        },
      ]);
    } else if (!item.item.vitalRecord) {
      Alert.alert('', strings('string.alert.vital_record'), [
        {
          text: strings('doctor.button.cancel'),
          style: 'cancel',
        },
        {
          text: 'Add Record',
          onPress: () =>
            Actions.AddRecords({
              sDate: this.state.sDate,
              relativeProfile: this.state.relativeProfile,
            }),
        },
      ]);
    } else {
      Actions.VitalCategory({
        vital: item.item,
        relativeProfile: this.state.relativeProfile,
      });
    }
  }

  async selectedProfile(profile) {
    AppUtils.console('ProfileData', profile);
    this.setState({ relativeProfile: profile });

    this.callVitalDashboard(profile._id);
  }

  openCalender() {
    var self = this;
    var selectedDate = moment(self.state.dateToday)._d;
    var maxDate = _dt;
    Keyboard.dismiss();
    self.setState({
      showDateSelector: true,
      date: selectedDate,
      mode: 'default',
      maxDate: maxDate,
    });
  }

  openiOSCalender() {
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDateSelector}
        onRequestClose={this.close}
        animationType="fade"
        key={this.state.showDateSelector ? 1 : 2}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: hp(30),
              alignSelf: 'center',
              backgroundColor: AppColors.whiteColor,
              justifyContent: 'center',
              width: width - 30,
            }}
          >
            <View
              style={{
                height: 40,
                width: width - 30,
                backgroundColor: AppColors.whiteColor,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    showDateSelector: false,
                    dateToday: this.state.sDate,
                  })
                }
              >
                <Image
                  resizeMode={'contain'}
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: 10,
                  }}
                  source={require('../../../assets/images/cancel.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <DateTimePicker
                mode="date"
                value={new Date(this.state.dateToday)}
                display="spinner"
                maximumDate={AppUtils.currentDateTime()}
                style={{ backgroundColor: AppColors.whiteColor }}
                onChange={(event, selectDate) => {
                  AppUtils.console('eventIs', selectDate);
                  this.setState({ dateToday: selectDate });
                }}
              />
            </View>
            <TouchableHighlight
              onPress={() => {
                this.setDate(this.state.dateToday);
              }}
              underlayColor="transparent"
            >
              <View
                style={{
                  backgroundColor: AppColors.colorHeadings,
                  height: 50,
                  width: width - 30,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {moment(this.state.dateToday).format('DD MMM Y')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  openAndroidCalender() {
    return (
      <View>
        {this.state.showDateSelector ? (
          <DateTimePicker
            value={new Date(this.state.dateToday)}
            style={{ backgroundColor: AppColors.whiteColor }}
            maximumDate={AppUtils.currentDateTime()}
            display="spinner"
            mode="date"
            onChange={(selectDate) => {
              if (selectDate.nativeEvent.timestamp != undefined) {
                this.setDate(selectDate.nativeEvent.timestamp);
              }
            }}
          />
        ) : null}
      </View>
    );
  }

  setDate(date) {
    try {
      this.setState(
        {
          showDateSelector: false,
          sDate: moment(date).format('YYYY-MM-DD'),
          dateToday: date,
        },
        () => {
          setTimeout(() => {
            this.callVitalDashboard(this.state.relativeProfile._id);
          }, 500);
        }
      );
    } catch (e) {
      AppUtils.console('DiffError', e);
    }
  }

  callVitalDashboard(relativeId) {
    setTimeout(() => {
      this.getVitalDashboard(relativeId);
    }, 500);
  }

  vitalDeviceList() {
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDeviceList}
        onRequestClose={this.close}
        animationType={this.props.animationType}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', width: width - 30 }}>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <View style={{ justifyContent: 'center', marginLeft: wp(2.5), marginTop: hp(1.5) }}>
                <View underlayColor="transparent" style={{ height: hp(4), justifyContent: 'center' }}>
                  <Text
                    style={{
                      color: AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      fontSize: 14,
                      marginLeft: wp(4),
                      textAlign: isRTL ? 'left' : 'auto'

                    }}
                  >
                    {'Select Device'}
                    {/* Translation req */}
                  </Text>
                </View>

                <FlatList
                  data={this.state.deviceList}
                  keyExtractor={(item, index) => item._id}
                  renderItem={({ item }) => (
                    <VitalDevices
                      item={item}
                      onPress={() => this.fetchVitalsData(item)}
                      fitbitConnected={this.state.fitbitConnected}
                      healkitConnected={this.state.healkitConnected}
                    />
                  )}
                  extraData={this.state}
                />
              </View>
            </View>
            <TouchableHighlight onPress={() => this.setState({ showDeviceList: false })} underlayColor="transparent">
              <View
                style={{
                  backgroundColor: AppColors.primaryColor,
                  height: 45,
                  width: width - 30,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {'Close'}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>
        <FamilyProfile selectedProfile={(profile) => this.selectedProfile(profile)} selectedRelative={this.state.selectedRelative} />
        {this.state.isLoading ? null : this.state.categoryList.length > 0 ? (
          <View>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  width: wp(100),
                  backgroundColor: AppColors.whiteColor,
                  paddingBottom: hp(2),
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', marginLeft: wp(5) }}
                  onPress={() => {
                    Actions.AddRecords({
                      sDate: this.state.sDate,
                      relativeProfile: this.state.relativeProfile,
                    });
                  }}
                >
                  <CachedImage
                    resizeMode={'contain'}
                    style={{
                      width: hp(3),
                      height: hp(3),
                    }}
                    source={images.add_new}
                  />

                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: AppStyles.fontFamilyMedium,
                      paddingTop: AppUtils.isIphone ? hp(0.8) : hp(0.4),
                      fontSize: hp(1.9),
                      width: wp(40),
                      marginLeft: wp(1),
                      color: AppColors.colorHeadings,
                      textAlign: isRTL ? 'left' : 'auto',
                    }}
                  >
                    {strings('vital.vital.addRecords')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => this.openCalender()}
                  allowFontScaling={false}
                  style={{
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    fontFamily: AppStyles.fontFamilyMedium,
                    marginLeft: wp(2),
                    width: wp(40),
                    color: AppColors.colorHeadings,
                  }}
                >
                  <Image
                    source={images.activeCalender}
                    resizeMode="contain"
                    style={{
                      height: wp(5),
                      width: wp(5),
                      marginRight: wp(2),
                      alignSelf: 'center',
                    }}
                  />
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: hp(1.9),
                      fontFamily: AppStyles.fontFamilyRegular,
                      paddingTop: AppUtils.isIphone ? hp(0.8) : hp(0.4),
                      color: AppColors.blackColor,
                    }}
                  >
                    {moment(this.state.sDate).format('DD MMM Y')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: wp(100),
                  backgroundColor: AppColors.whiteColor,
                  paddingBottom: hp(2),
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', marginLeft: wp(5) }}
                  underlayColor="transparent"
                  onPress={() => this.setState({ showDeviceList: true })} //this.setVitalRecordsWithAppleHealthData}
                >
                  <CachedImage
                    resizeMode={'contain'}
                    style={{
                      width: hp(3),
                      height: hp(3),
                    }}
                    source={images.add_new}
                  />

                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: AppStyles.fontFamilyMedium,
                      paddingTop: AppUtils.isIphone ? hp(0.8) : hp(0.4),
                      fontSize: hp(1.9),
                      width: wp(40),
                      marginLeft: wp(1),
                      color: AppColors.colorHeadings,
                    }}
                  >
                    {'Fetch Vital Records'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  width: wp(100),
                  height: Platform.OS === 'ios' ? hp(45) : hp(55),
                  marginLeft: wp(5),
                  marginTop: hp(1),
                  marginBottom: hp(1),
                }}
              >
                <FlatList
                  data={this.state.categoryList}
                  showsHorizontalScrollIndicator={false}
                  renderItem={(item) => this.renderCategory(item)}
                  numColumns={3}
                  keyExtractor={(item, index) => item._id}
                  // extraData={this.state}
                  onRefresh={() => {
                    this.onRefresh();
                  }}
                  refreshing={this.state.isFetching}
                />
              </View>

              <ElevatedView
                elevation={5}
                style={{
                  width: wp(85),
                  height: hp(10),
                  backgroundColor: AppColors.whiteColor,
                  borderRadius: wp(1),
                  marginLeft: wp(8),
                  marginTop: hp(0.5),
                  marginBottom: hp(1),
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    alignSelf: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      alignSelf: 'center',
                    }}
                  >
                    <CachedImage
                      style={{
                        width: wp(12),
                        height: wp(12),
                        marginLeft: wp(2),
                        marginRight: wp(2),
                        alignSelf: 'center',
                      }}
                      source={this.state.healthImage}
                    />
                    <View
                      style={{
                        alignItems: 'flex-start',
                        alignSelf: 'center',
                        marginLeft: wp(6),
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: AppStyles.fontFamilyBold,
                          fontSize: wp(3),
                          color: AppColors.blackColor,
                          width: wp(60),
                          textAlign: isRTL ? 'left' : 'auto',
                        }}
                        numberOfLines={2}
                      >
                        {this.state.healthMessage}{' '}
                      </Text>
                    </View>
                  </View>
                </View>
              </ElevatedView>
            </View>
            <View style={{ height: hp(8) }} />
          </View>
        ) : (
          <View style={{ height: hp(80), justifyContent: 'center' }}>
            <Text style={cartStyle.emptyText}>{''}</Text>
          </View>
        )}

        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />

        {this.renderOtherParameter()}
        {this.vitalDeviceList()}
        {Platform.OS == 'ios' ? this.openiOSCalender() : this.openAndroidCalender()}
      </View>
    );
  }
}

export default VitalHomeScreen;
