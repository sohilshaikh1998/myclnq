import { Alert, Dimensions, PermissionsAndroid, Platform } from 'react-native';
import { AppStrings } from '../shared/AppStrings';
import NetInfo from '@react-native-community/netinfo';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { verticalScale } from './Scaling';
import Geolocation from '@react-native-community/geolocation';
import { AppColors } from '../shared/AppColors';
import analytics from '@react-native-firebase/analytics';
import countryList from '../../assets/jsonFiles/coutryList.json';
const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-community/async-storage';
import { strings } from '../locales/i18n';
let RNFS = require('react-native-fs');
import { getDeviceId } from 'react-native-device-info';

const iPhonesWithDynamicIsland = ['iPhone15,2', 'iPhone15,3'];
const isIphoneWithDynamicIsland = iPhonesWithDynamicIsland.includes(getDeviceId());

//const insets = useSafeAreaInsets();

export class AppUtils {
  static heightWindow = height;
  static widthWindow = width;
  static screenHeight = Dimensions.get('screen').height;
  static screenWidth = Dimensions.get('screen').width;
  static isX = isIphoneX();
  static headerHeight = isIphoneWithDynamicIsland ? 105 : isIphoneX() ? 105 : Platform.OS === 'ios' ? 68 : 50;
  static tabHeight = AppUtils.isX ? verticalScale(50) : verticalScale(60);
  static isIphone = Platform.OS === 'ios';
  static isLarge = height >= 736;
  static isLowResiPhone = AppUtils.isIphone ? height <= 480 : false;
  static isLowResAndroidPhone = height <= 480;
  static isMedResAndroidPhone = height <= 600;
  static upcomingAppointment = false;
  static insuranceAccepted = 2;
  static filter = false;
  static location = '';
  static maxDistance = 5;
  static insuranceId = '';
  static timerInterval = null;
  static latitude = 12;
  static longitude = 77;

  static async positiveEventCount() {
    let eventCount = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.POSITIVE_EVENT_COUNT));
    let count = eventCount ? eventCount.eventCount : 0;
    if (count > 0) {
      count = count + 1;
    } else {
      count = 1;
    }
    await AsyncStorage.setItem(AppStrings.contracts.POSITIVE_EVENT_COUNT, JSON.stringify({ eventCount: count }));
  }

  static async showRating() {
    let eventCount = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.POSITIVE_EVENT_COUNT));
    let count = eventCount ? eventCount.eventCount : 0;
    AppUtils.console('sdbwerdfg23455', count);
    if (count > 0) {
      AppUtils.console('sdbwerdfg23455gyr', count % 10);
      return count % 10 === 0;
    } else {
      return false;
    }
  }

  static async analyticsTracker(screenName) {
    await analytics().setAnalyticsCollectionEnabled(true);
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }
  static getAllDepartmentListInString(departmentList) {
    let departmentName = [];
    try {
      departmentList.map((department, i) => {
        let departName = department.departmentName;
        if (i > 0) {
          departName = ' ' + department.departmentName;
        }
        departmentName.push(departName);
      });
      return departmentName.toString();
    } catch (e) {
      AppUtils.console('sdf3eds', e);
      return null;
    }
  }
  static getNumberInString(numberList) {
    let numbers = '';

    try {
      numberList.map((a, i) => {
        if (i === 0) {
          numbers = '+' + a.countryCode + ' ' + a.contactNumber;
        } else {
          numbers = numbers + ', +' + a.countryCode + ' ' + a.contactNumber;
        }
      });
      return numbers.toString();
    } catch (e) {
      AppUtils.console('sdf3eds', e);
      return null;
    }
  }

  static getCountryDetails(countryCode) {
    let index = countryList.findIndex((item) => item.dial_code === countryCode);
    return countryList[index];
  }

  static getCountryCallingCode(countryCode) {
    let index = countryList.findIndex((item) => item.code === countryCode);
    return countryList[index].dial_code;
  }

  static getCountryCode(countryCode) {
    let index = countryList.findIndex((item) => item.dial_code === countryCode);
    return countryList[index].code;
  }

  static console(data1, data2, data3, data4, data5, data6, data7, data8, data9, data10) {
    //console.log(data1, data2, data3, data4, data5, data6, data7, data8, data9, data10);
  }

  static isNumber(input) {
    const re = /^[0-9\b]+$/;
    return re.test(input);
  }

  static hasString(input) {
    const re = /[a-zA-Z]/;
    return re.test(input);
  }

  static nullChecker(value) {
    return value !== undefined && value !== null ? value : '';
  }
  static getRecord(item) {
    const expParameter = ['Heart Rate', 'Heart Rate Variability', 'Blood Pressure'];

    if (!item.vitalRecord) {
      return '--';
    } else {
      const rdQty =
        Number.isInteger(parseFloat(item.vitalRecord.recordQuantity)) || expParameter.includes(item.parameterName)
          ? parseFloat(item.vitalRecord.recordQuantity).toFixed()
          : parseFloat(item.vitalRecord.recordQuantity).toFixed(2);

      console.log(rdQty);

      if (item.vitalRecord.secondAverageRecord === null) {
        return rdQty;
      } else {
        const sAvgRd =
          Number.isInteger(parseFloat(item.vitalRecord.secondAverageRecord)) || expParameter.includes(item.parameterName)
            ? parseFloat(item.vitalRecord.secondAverageRecord).toFixed()
            : parseFloat(item.vitalRecord.secondAverageRecord).toFixed(2);
        return rdQty + '/' + sAvgRd;
      }
    }

    // if (!item.isMultiParam) {
    //   return parseFloat(item.vitalRecord.recordQuantity) % 1 === 0
    //     ? parseFloat(item.vitalRecord.recordQuantity)
    //     : parseFloat(item.vitalRecord.recordQuantity).toFixed(2);
    // }
    //  if (item.recordQuantity) {
    //   return parseFloat(item.recordQuantity).toFixed();
    // }

    // return parseFloat(item.vitalRecord.recordQuantity).toFixed() + '/' + parseFloat(item.vitalRecord.secondAverageRecord).toFixed();
  }
  static getVital(val, val2, isMulti) {
    if (isMulti) {
      return Math.round(val) + '/' + Math.round(val2);
    } else {
      return parseFloat(val) % 1 === 0 ? parseFloat(val) : parseFloat(val).toFixed(1);
    }
  }

  static getVitalValue(val) {
    return parseFloat(val) % 1 === 0 ? parseFloat(val) : parseFloat(val).toFixed(1);
  }

  static getCategoryAverage(item, isMulti) {
    if (item.recordAverage) {
      if (!isMulti) {
        return parseFloat(item.recordAverage.averageRecord) % 1 === 0
          ? parseFloat(item.recordAverage.averageRecord)
          : parseFloat(item.recordAverage.averageRecord).toFixed(2);
      } else {
        return parseFloat(item.recordAverage.averageRecord).toFixed() + '/' + parseFloat(item.recordAverage.secondAverageRecord).toFixed();
      }
    } else {
      return '--';
    }
  }

  static getEditAverage(item) {
    if (!item.secondAverageRecord) {
      return parseFloat(item.averageRecordQuantity) % 1 === 0
        ? parseFloat(item.averageRecordQuantity)
        : parseFloat(item.averageRecordQuantity).toFixed(2);
    } else {
      return parseFloat(item.averageRecordQuantity).toFixed() + '/' + parseFloat(item.secondAverageRecord).toFixed();
    }
  }
  static isProduction() {
    return AppStrings.apiURL.baseURL === AppStrings.apiURL.productionURL;
  }
  static isCountryCode(code) {
    return code === '91' || code === '65';
  }
  static getDefaultLatLong(code) {
    let region = [];
    if (code === '91') {
      region = {
        latitude: 12.97194,
        longitude: 77.59369,
      };
    } else {
      region = {
        latitude: 1.28967,
        longitude: 103.85007,
      };
    }
    return region;
  }

  static userSessionValidation(callback) {
    AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN).then((json) => {
      AppUtils.console('JSON:', json);
      try {
        var userDetail = JSON.parse(json);
        AppUtils.console('ussdvdfg', userDetail);
        if (userDetail != null || (userDetail.isLoggedIn !== undefined && userDetail.isLoggedIn === true)) {
          callback(true);
        } else {
          callback(false);
        }
      } catch (e) {
        AppUtils.console('ISUSERLOGGEDIN: ', e);
        callback(false);
      }
    });
  }

  static firstTimeUser(callback) {
    AsyncStorage.getItem(AppStrings.contracts.firstTimeUser).then((json) => {
        try {
            var userDetail = JSON.parse(json);
            if (userDetail == undefined || userDetail == null || userDetail == 'true') {
                callback(true);

            } else {
                callback(false)
            }
        }
        catch (e) {
            callback(true);
        }
    })
}

  static checkInterNetConnection() {
    NetInfo.fetch().then((isConnected) => {
      if (isConnected) {
        return true;
      } else {
        return false;
      }
    });
  }

  static getAddress(addressData) {
    let userName = !addressData.userName || addressData.userName.trim().length === 0 ? '' : addressData.userName + ', ';
    let landmark = !addressData.landmark || addressData.landmark.trim().length === 0 ? '' : addressData.landmark + ', ';
    let state = !addressData.state || addressData.state.trim().length === 0 ? '' : addressData.state + ', ';
    let city = !addressData.city || addressData.city.trim().length === 0 ? '' : addressData.city + ', ';

    return (
      userName +
      addressData.unitNumber +
      ', ' +
      addressData.address +
      ', ' +
      landmark +
      city +
      state +
      addressData.country +
      ', ' +
      addressData.zipCode
    );
  }

  static getOrderStatus(orderStatus) {
    let status =
      orderStatus === 'PAYMENT_PENDING'
        ? strings('common.caregiver.paymentPending')
        : orderStatus === 'CONFIRMED'
        ? 'Confirmed'
        : orderStatus === 'PROCESSED'
        ? 'Processing'
        : orderStatus === 'PROCESSING'
        ? 'Processing'
        : orderStatus === 'PACKED'
        ? 'Packed'
        : orderStatus === 'SHIPPED'
        ? 'Shipped'
        : orderStatus === 'DELIVERED'
        ? 'Delivered'
        : 'Cancelled';

    let color = orderStatus === 'PAYMENT_PENDING' || orderStatus === 'CANCELLED' ? AppColors.primaryColor : AppColors.textGray;
    return { orderStatus: status, statusColor: color };
  }

  static getAgeFromDateOfBirth(dateOfBirth) {
    var yearOfBirth = moment(dateOfBirth).format('YYYY');
    var yearToday = moment(new Date()).format('YYYY');
    return parseInt(yearToday - yearOfBirth);
  }

  static getTimeDifferenceFromTodayForTransport(serverTime, callback) {
    try {
      var days = 0;
      let format = 'YYYY-MM-DDTHH:mm:ss a';
      var endTimeString = moment(serverTime).format(format);
      var todayString = moment(new Date()).format(format);
      var startTime = moment(todayString, format);
      var endTime = moment(endTimeString, format);

      var duration = moment.duration(endTime.diff(startTime));
      var hours = parseInt(duration.asHours());
      var minutes = parseInt(duration.asMinutes()) - hours * 60;
      var seconds = parseInt((duration.asMilliseconds() / 1000) % 60);
      var hrs = '' + hours;
      var mns = '' + minutes;
      var secs = '' + seconds;
      if (hours > 0) {
        if (hrs.length === 1) {
          hrs = '0' + hrs;
        }
      } else {
        hrs = '00';
      }
      if (minutes > 0) {
        if (mns.length === 1) {
          mns = '0' + mns;
        }
      } else {
        mns = '00';
      }
      if (seconds > 0) {
        if (secs.length === 1) {
          secs = '0' + secs;
        }
      } else {
        secs = '00';
      }

      var _h = '' + hours;
      if (_h.length >= 2) {
        days = endTime.diff(startTime, 'days');
        hrs = endTime.subtract(days, 'days').diff(startTime, 'hours');
        var dys = '' + days;
        if (dys.length === 1) {
          days = '0' + dys;
        }

        if (hrs > 0) {
          if (hrs < 10) {
            hrs = '0' + hrs;
          }
        } else {
          hrs = '00';
        }
      }

      var isOver = false;
      if (hrs == '00' && mns == '00' && secs == '00') {
        isOver = true;
      }

      callback(hrs, mns, secs, days, isOver);
    } catch (err) {
      AppUtils.console(err);
    }
  }

  static getTimeDifferenceFromToday(serverTime, callback) {
    try {
      var days = 0;
      let format = 'YYYY-MM-DDTHH:mm:ss a';
      var endTimeString = moment(serverTime).format(format);
      var todayString = moment(new Date()).format(format);
      var startTime = moment(todayString, format);
      var endTime = moment(endTimeString, format);

      var duration = moment.duration(endTime.diff(startTime));
      var hours = parseInt(duration.asHours());
      var minutes = parseInt(duration.asMinutes()) - hours * 60;
      var seconds = parseInt((duration.asMilliseconds() / 1000) % 60);
      var hrs = '' + hours;
      var mns = '' + minutes;
      var secs = '' + seconds;

      if (hours > 0) {
        if (hrs.length === 1) {
          hrs = '0' + hrs;
        }
      } else {
        hrs = '00';
      }
      if (minutes > 0) {
        if (mns.length === 1) {
          mns = '0' + mns;
        }
      } else {
        mns = '00';
      }
      if (seconds > 0) {
        if (secs.length === 1) {
          secs = '0' + secs;
        }
      } else {
        secs = '00';
      }

      var _h = '' + hours;

      if (_h.length >= 2) {
        days = endTime.diff(startTime, 'days');
        hrs = endTime.subtract(days, 'days').diff(startTime, 'hours');
        var dys = '' + days;
        if (dys.length === 1) {
          days = '0' + dys;
        }

        if (hrs > 0) {
          if (hrs < 10) {
            hrs = '0' + hrs;
          }
        } else {
          hrs = '00';
        }
      }

      var isOver = false;
      if (hrs == '00' && mns == '00' && secs == '00') {
        isOver = true;
      }

      callback(hrs, mns, secs, days, isOver);
    } catch (err) {
      AppUtils.console(err);
    }
  }

  static handleNullImg(img) {
    try {
      let mImg = img != null && img != undefined && img != '' && img != 'null' ? img : AppStrings.placeholderImg;
      return mImg;
    } catch (err) {
      return AppStrings.placeholderImg;
    }
  }

  static isTimeDiffMoreThenThreeHours(bookingTime) {
    var days = 0;
    var endTimeString = moment(bookingTime).format('YYYY-MM-DDTHH:mm:ss a');
    var todayString = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss a');
    var startTime = moment(todayString, 'YYYY-MM-DDTHH:mm:ss a');
    var endTime = moment(endTimeString, 'YYYY-MM-DDTHH:mm:ss a');

    var duration = moment.duration(endTime.diff(startTime));

    var hours = parseInt(duration.asHours());
    var minutes = parseInt(duration.asMinutes()) - hours * 60;
    var seconds = parseInt((duration.asMilliseconds() / 1000) % 60);

    AppUtils.console('Sdfzxsdx', hours, minutes, seconds);

    if (hours == 3 && minutes == 0) {
      return true;
    } else if (hours < 3) {
      return true;
    } else {
      return false;
    }
  }

  static handleNullClinicImg(img) {
    try {
      let mImg = img != null && img != undefined && img != '' && img != 'null' ? img : AppStrings.placeholderClinicImg;
      return mImg;
    } catch (err) {
      return AppStrings.placeholderClinicImg;
    }
  }

  static timeConversion(hour, minutes) {
    var TimeType = 'AM';
    if (hour <= 11) {
      TimeType = 'AM';
    } else {
      TimeType = 'PM';
    }
    if (hour > 12) {
      hour = hour - 12;
    }
    if (hour === 0) {
      hour = 12;
    }

    if (minutes < 10) {
      minutes = '0' + minutes.toString();
    }
    return hour.toString() + ':' + minutes.toString() + ' ' + TimeType.toString();
  }

  static logout() {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        if (keys != 'lang') {
          AsyncStorage.multiRemove(keys);
        }
      })
      .then(() => Actions.LoginOptions());
  }

  static clearAllData() {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        if (keys != 'lang') {
          AsyncStorage.multiRemove(keys);
        }
      })
      .then(() => {
        return true;
      });
  }

  static async getRealPath(url, fileName) {
    let options = (RNFS.DownloadFileOptions = {
      fromUrl: url,
      toFile: `${RNFS.DownloadDirectoryPath}/${fileName}`,
      connectionTimeout: 60000,
      cacheable: false,
    });

    RNFS.downloadFile(options).then((result) => {
      this.console('sfdr4wsdzwesdvdxvxcvwr4', result);
    });
  }

  static logoutNoNav() {
    let keys = [
      AppStrings.contracts.LOGGED_IN_USER,
      AppStrings.contracts.SESSION_INFO,
      AppStrings.contracts.NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED,
      AppStrings.contracts.IS_LOGGED_IN,
      AppStrings.contracts.LOGGED_IN_USER_DETAILS,
      AppStrings.contracts.IS_PROFILE_AVAILABLE,
      AppStrings.contracts.GOOGLE_USER_DATA,
      AppStrings.contracts.APPLE_USER_DATA
    ];
    // AsyncStorage.getAllKeys().then((keys) => {
    //   console.log(keys,'localkeys')
    //    if (keys != 'lang' || keys !== 'isFirstTimeUser') {
    //      console.log('wenee')
    //    AsyncStorage.multiRemove(keys);
    //   }
    // });
     AsyncStorage.multiRemove(keys).then(response=>{
      console.log(response,'removed')
    }).catch(err=>{
      console.log(err,"err in asyncStorage")
    })
  }

  static niceBytes(size) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let l = 0,
      n = parseInt(size, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
  }

  static isClinicStarted(startHour, startMin) {
    var dateToBookApps = moment(new Date()).format('YYYY-MM-DDTHH:mm:00');
    let currentHour = parseInt(moment(dateToBookApps).format('HH'));
    let currentMinute = parseInt(moment(dateToBookApps).format('mm'));

    if (currentHour >= startHour) {
      return !(currentHour == startHour && currentMinute < startMin);
    } else {
      return false;
    }
  }

  static isClinicOpen(startHour, startMin, endHour, endMin) {
    var dateToBookApps = moment(new Date()).format('YYYY-MM-DDTHH:mm:00');
    let currentHour = parseInt(moment(dateToBookApps).format('HH'));
    let currentMinute = parseInt(moment(dateToBookApps).format('mm'));

    if (endMin < 4) {
      endMin = 59;
      endHour = endHour - 1;
    }

    if (currentHour >= startHour && currentHour < endHour) {
      return !(currentHour === startHour && currentMinute < startMin);
    } else if (currentHour === endHour) {
      return currentMinute < endMin - 5;
    } else {
      return false;
    }
  }

  static isUserLoggedIn = () =>
    new Promise((resolve) => {
      AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER).then((json) => {
        try {
          var userDetail = JSON.parse(json);
          if (userDetail != null && userDetail != undefined) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          AppUtils.console('ISUSERLOGGEDIN: ', e);
          resolve(false);
        }
      });
    });

  static getRelationLabel(pickedVal) {
    switch (pickedVal) {
      case 'self':
        return 'Self';
      case 'spouse':
        return 'Spouse';
      case 'son':
        return 'Son';
      case 'daughter':
        return 'Daughter';
      case 'other':
        return 'Others';
      default:
        return '';
    }
  }

  static getRelationVal(pickedVal) {
    switch (pickedVal) {
      case 'Self':
        return 'self';
      case 'Spouse':
        return 'spouse';
      case 'Son':
        return 'son';
      case 'Daughter':
        return 'daughter';
      case 'Others':
        return 'other';
      default:
        return '';
    }
  }
  static daysCalculation(date) {
    if (moment(new Date()).diff(moment(date), 'days') > 30) {
      if (moment(new Date()).diff(moment(date), 'month') > 12) {
        let year = moment(new Date()).diff(moment(date), 'year');
        return year > 1 ? year + ' Years ago' : year + ' Year ago';
      } else {
        let month = moment(new Date()).diff(moment(date), 'month');
        return month > 1 ? month + ' Months ago' : month + ' Month ago';
      }
    } else {
      if (moment(new Date()).diff(moment(date), 'days')) {
        let day = moment(new Date()).diff(moment(date), 'days') + ' Days ago';
        return day > 1 ? day + ' Days ago' : day + ' Day ago';
      } else {
        return 'Today';
      }
    }
  }

  static getInsuranceVal(pickedVal) {
    switch (pickedVal) {
      case 'LIC':
        return 'lic';
      case 'Reliance':
        return 'reliance';
      case 'Bajaj':
        return 'bajaj';
      case 'HDFC Life':
        return 'hdfcLife';
      case 'Birla Group':
        return 'birlaGroup';
      default:
        return '';
    }
  }

  static getInsuranceLabel(pickedVal) {
    switch (pickedVal) {
      case 'lic':
        return 'LIC';
      case 'reliance':
        return 'Reliance';
      case 'bajaj':
        return 'Bajaj';
      case 'hdfcLife':
        return 'HDFC Life';
      case 'birlaGroup':
        return 'Birla Group';
      default:
        return '';
    }
  }

  static showMessage(self, title, message, btn, callback) {
    Alert.alert(title, message, [
      {
        text: btn,
        onPress: () => {
          self.setState({ isLoading: false });
          callback();
        },
      },
    ]);
  }

  static retrieveLocal = async (key) => await AsyncStorage.getItem(key);
  static localStore = async (key, value) => {
    await AsyncStorage.setItem(key, value);
  };

  static validateTime(startTime, endTime, callback) {
    try {
      AppUtils.console('JHJHGJGHJGH', startTime, endTime);
      var startTime = startTime;
      var endTime = endTime;
      var diff = moment(endTime).diff(startTime);
      if (diff > 0) {
        var isValid = true;
      } else {
        isValid = false;
      }
      callback(isValid, diff);
    } catch (err) {
      AppUtils.console(err);
    }
  }

  static parseVehicleType() {
    const vehicleType = [
      { key: 'Medical Transport', value: 'AMBULANCE' },
      {
        key: 'Wheelchair fleet',
        value: 'OTHER_VEHICLE',
      },
    ];
    return vehicleType.map((d, i) => {
      return { label: d.key, value: d.value };
    });
  }

  static parseTripType() {
    const tripType = [
      { key: 'One Way', value: 'SINGLE' },
      { key: 'Two Way', value: 'ROUND' },
    ];
    return tripType.map((d, i) => {
      return { label: d.key, value: d.value };
    });
  }

  static parsePaymentType() {
    //const tripType = [{key: 'Cash', value: 'CASH'}, {key: 'Card', value: 'CARD'}];
    const tripType = [
      { key: 'Cash', value: 'CASH' },
      { key: 'Card', value: 'CARD' },
    ];
    return tripType.map((d, i) => {
      return { label: d.key, value: d.value };
    });
  }

  static async locationPermissionsAccess() {
    return await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }

  static getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (e) => reject(e)
      );
    });
  };

  static currentDateTime() {
    let dt = new Date();
    dt.setDate(dt.getDate());
    return dt;
  }

  static convertWeightToKgs(weight, weightType) {
    var mWeight = parseInt(weight);

    if (mWeight === undefined || weightType === undefined) return null;

    if (weightType !== 'kgs') {
      return mWeight * 0.453592;
    }
    return mWeight;
  }

  static convertHeightToCms(height, heightType) {
    if (height === 'undefined' || heightType === 'undefined') return null;

    if (heightType !== 'cms') {
      if (height.length === 2) {
        var feet = parseInt(height);
        var centimeters = feet * 30.48;

        return centimeters;
      }

      var parts = height.split("'");
      var feet = parseInt(parts[0]);
      var inches = parseInt(parts[1].replace('"', ''));

      // Convert feet and inches to centimeters
      var totalInches = feet * 12 + inches;
      var centimeters = totalInches * 2.54;

      return centimeters;
    }
    return parseInt(height);
  }

  static calculateBmi(weight, height) {
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  }
}
