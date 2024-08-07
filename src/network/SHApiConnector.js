import { create } from 'apisauce';
const axios = require('axios');
import AsyncStorage from '@react-native-community/async-storage';
import { AppStrings } from '../shared/AppStrings';
import { AppUtils } from '../utils/AppUtils';
import { encode } from 'base-64';
import config from '../../config';


const api = create({
  baseURL: AppStrings.apiURL.baseURL,
  headers: { 'content-type': 'application/json', apikey: process.env.apiKey },
});

const subApi = create({
  baseURL: AppStrings.apiURL.baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    apikey: process.env.apiKey,
  },
});

const username = config.zoom.CLIENT_ID;
const password = config.zoom.CLIENT_SECRET;

const credentials = `${username}:${password}`;
const credentialsBase64 = encode(credentials);

const zoomApi = create({
  baseURL: 'https://zoom.us/oauth',
  headers: {
    'Authorization': `Basic ${credentialsBase64}`
  }
})
const zoomSignApi = create({
  baseURL: AppStrings.apiURL.baseURL,
  headers: { "Content-Type": "application/json" }, 
});


const instance = axios.create({
  baseURL: AppStrings.apiURL.baseURL,
  headers: { 'content-type': 'application/json', apikey: process.env.apiKey },
});

const apiUpload = create({
  baseURL: AppStrings.apiURL.baseURL,
  headers: { 'content-type': 'application/json', apikey: process.env.apiKey },
});

api.addAsyncRequestTransform(
  (config) => async () => {
    AppUtils.console('addAsyncRequestTransform', config);
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      config.headers['authToken'] = sessionInfo.session;
    }
    return config;
  },
  (error) => {
    AppUtils.console('addAsyncRequestTransformError', error);
    return Promise.reject(error);
  }
);

api.addAsyncResponseTransform(
  (response) => async () => {
    AppUtils.console('addAsyncResponseTransform', response);
    return response.data;
  },
  (error) => {
    AppUtils.console('INTERCEPTRO_ERROR', error);
    return null;
  }
);

apiUpload.addAsyncRequestTransform(
  (config) => async () => {
    AppUtils.console('addAsyncRequestTransform_upload', config);
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      config.headers['authToken'] = sessionInfo.session;
    }
    return config;
  },
  (error) => {
    AppUtils.console('addAsyncRequestTransformError_upload', error);
    return Promise.reject(error);
  }
);

apiUpload.addAsyncResponseTransform(
  (response) => async () => {
    AppUtils.console('addAsyncResponseTransform_upload', response);
    return response.data;
  },
  (error) => {
    AppUtils.console('INTERCEPTRO_ERROR_upload', error);
    return null;
  }
);

function getSession(callback) {
  AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO).then((json) => {
    try {
      if (json != null && json !== undefined) {
        var sessionInfo = JSON.parse(json);
        var sessionId = sessionInfo.session;
        AppUtils.console(sessionInfo);
        callback(sessionId);
      } else {
        callback('');
      }
    } catch (e) {
      console.error('Ses', e);
      callback('');
    }
  });
}

function verifyResponse(response, callback) {
  if (response.success == false || response.error_code != undefined) {
    if (response.errmessage === '10006' || response.error_code === '10006') {
      AppUtils.logout();
    }
  }
  callback();
}

export class SHApiConnector {
  static getServerStatus(callback) {
    api.get('/').then((response) => callback(false, response.data));
  }

  static async getMobileNumber(mobileNumber) {
    return await api.post('/phoneNumberNew', mobileNumber);
  }

  static async userPasswordLogin(data) {
    return await api.post('/user/password/login', data);
  }

  static async getAppleUserDetails(emailId) {
    return await api.get(`apple_login_name/${emailId}`);
  }

  static async generateAadharOTP(data) {
    return await api.post('/abdm/generate/aadhar/otp', data);
  }

  static async verifyAadharOTP(data) {
    return await api.post('/abdm/verify/aadhar/otp', data);
  }
  static async justLogin(data) {
    return await api.post('/just-login/fetch/single/user/from/partner/account', data);
  }

  static async generateMobileOTP(data) {
    return await api.post('/abdm/generate/mobile/otp', data);
  }

  static async verifyMobileOTP(data) {
    return await api.post('/abdm/verify/mobile/otp', data);
  }

  static async verifyUserHealthId(data) {
    return await api.post('/abdm/verify/user/healthId', data);
  }

  static async getABHADetailsOtpVerfication(data) {
    return await api.post('/abdm/generate/otp/forXToken', data);
  }

  static async generateHealthCard(data) {
    return await instance.post('/abdm/generate/healthCard', data, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
  }

  static async generateQRCard(data) {
    return await instance.post('/abdm/generate/qRCard', data, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
  }

  static async searchAbha(data) {
    return await api.post('/abdm/search/user/byHealthId', data);
  }

  /*********************    ABDM Linking    *********************/

  static async fetchModes(data) {
    return await api.post('abdm/fetch/modes', data);
  }

  static async fetchRelativeModes(data) {
    return await api.post('abdm/fetch/realtive/modes', data);
  }

  static async userAuthInit(data) {
    return await api.post('abdm/user/auth/init', data);
  }

  static async userAuthConfirm(data) {
    return await api.post('abdm/user/auth/confirm', data);
  }

  /**************************************************************/

  static async getOtpMessage(otpDetails) {
    return await api.post('/userOtpVerification', otpDetails);
  }

  static async otpVerifySetPwd(data) {
    //return await api.post('/otp/verification/set/password', data);
    return await api.put('/api/v1/users/patients', data);
  }

  static async forgetOrSetPassword(data) {
    return await api.post('/forget/set/password', data);
  }

  static async getCountryList() {
    return await api.get('/api/v1/sms/countries');
  }

  static async updateRegistrationNumber(mobileNumber) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/update/registration/number', mobileNumber);
    //return await api.post('/api/v1/users/patients/phone', mobileNumber);
  }

  //Delete Profile
  static async deleteUserProfile() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/delete/user/account');
  }

  static async getFeedbackOptions() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/feedback/option');
  }

  static async deleteUserWithFeedback(feedbacks) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/delete/user', feedbacks);
  }

  static async getIdList(countryName){
    return await api.post('/api/v1/users/patients/id-types',countryName);
  }


  static async patientPreCheck(userDetails) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    //return await api.post('/otp/verification/for/update/number', otpDetails);
    return await api.post('/api/v1/users/patients/prechecks', userDetails);
  }

  static async forgetPasswordPreCheck(userDetails) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    console.log('/api/v1/users/patients/prechecks', userDetails);
    //return await api.post('/otp/verification/for/update/number', otpDetails);
    return await api.put('/api/v1/users/patients/prechecks', userDetails);
  }

  static async getOtpMessageForUpdateNumbers(otpDetails) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    //return await api.post('/otp/verification/for/update/number', otpDetails);
    return await api.post('/api/v1/users/patients/phone', otpDetails);
  }

  static async fetchMedicalRecords(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('clinic/fetch/medical/category/records', data);
  }

  static async uploadMedicalRecords(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      apiUpload.setHeader('authToken', sessionInfo.session);
    }
    AppUtils.console('shapiconnector', data, apiUpload);
    return await apiUpload.post('/clinic/upload/medical/records', data);
  }

  static async deleteMedicalRecords(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/clinic/delete/medical/records', data);
  }

  static getUserNameDetails(userDetails, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/appointment/doctor/book', userDetails).then((response) => callback(false, response.data));
    });
  }

  static getClinicDetails(clinicID, callback) {
    api.post('user/clinic/profile', clinicID).then((response) => callback(false, response.data));
  }

  static getNearByClinic(userLocation, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/near/clinics', userLocation).then((response) => callback(false, response.data));
    });
  }

  static async getInsuranceList() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/insurance/list');
  }

  static async getTransportProviders(countryCode) {
    AppUtils.console('countryCodeeeeeeeeeeeeees', countryCode);
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    AppUtils.console('innnnnnnnnnn');
    return await api.get('/transport/provider/list/' + countryCode);
  }

  static getDoctorSlots(clinicDetails, callback) {
    api.post('/appointment/doctor/slots', clinicDetails).then((response) => callback(false, response.data));
  }

  static getDoctorTimings(clinicDetails, callback) {
    api.post('/user/clinic/doctor/profile', clinicDetails).then((response) => callback(false, response.data));
  }

  static uploadProfileImage(image, callback) {
    AppUtils.console('sgdfcnwertr', image);
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/update/user/profile/pic', image).then((response) => callback(false, response.data));
    });
  }

  static uploadRelativeProfileImage(image, relativeID, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/update/user/relative/profile/pic?relativeId=' + relativeID, image).then((response) => callback(false, response.data));
    });
  }

  static getDoctorNextWorkingDay(clinicDetails, callback) {
    api.post('/doctor/next/workingDay', clinicDetails).then((response) => callback(false, response.data));
  }

  static getMyAppointments(field, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/user/appointments/list', field).then((response) => {
        verifyResponse(response.data, function () {
          callback(false, response.data);
        });
      });
    });
  }

  static updateCalenderAppointments(data, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/update/user/request/appointment', data).then((response) => {
        verifyResponse(response.data, function () {
          callback(false, response.data);
        });
      });
    });
  }

  static changeDistance(distance, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/setting/maximumDistance', distance).then((response) => callback(false, response.data));
    });
  }

  static cancelAppointment(appointmentId, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/user/appointment/cancel', appointmentId).then((response) => callback(false, response.data));
    });
  }

  static getBookingSuggestion(details, callback) {
    api.post('/appointment/doctor/suggestion', details).then((response) => callback(false, response.data));
  }

  static getNameSuggestions(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/fetch/user/name', details).then((response) => callback(false, response.data));
    });
  }

  static rescheduleAppointment(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/appointment/doctor/slots', details).then((response) => callback(false, response.data));
    });
  }

  static bookReshedule(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/appointment/reschedule/doctor/book/future', details).then((response) => callback(false, response.data));
    });
  }

  static logout(callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/user/logOut').then((response) => callback(false, response.data));
    });
  }

  static fetchProfile(callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/fetch/user/profile').then((response) => callback(false, response.data));
    });
  }

  static fetchProfileUsingId(relativeId, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('fetch/family/member/details', relativeId).then((response) => callback(false, response.data));
    });
  }

  static firstTimeRegistration(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/userRelativeDetails').then((response) => callback(false, response.data));
    });
  }

  static updateProfile(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/edit/userRelativeDetails', details).then((response) => callback(false, response.data));
    });
  }

  static getNotifications(page, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/notification/list', page).then((response) => callback(false, response.data));
    });
  }

  static getInsuranceProviders(callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.get('/insurance/provider').then((response) => {
        verifyResponse(response.data, function () {
          callback(false, response.data);
        });
      });
    });
  }

  static getUserDetailsAlways(callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/fetch/user/family/members').then((response) => callback(false, response.data));
    });
  }

  static updateNotifications(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/notification/update', details).then((response) => callback(false, response.data));
    });
  }

  static addNewDependent(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/add/relative', details).then((response) => callback(false, response.data));
    });
  }

  static feedback(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('user/feedbackForm', details).then((response) => callback(false, response.data));
    });
  }

  static resendOTP(details, callback) {
    api.post('/user/resend/otp', details).then((response) => callback(false, response.data));
  }

  static addNewRelativeInAppointment(details, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/add/relative/return/relative/list', details).then((response) => callback(false, response.data));
    });
  }

  static toGetMsgList(userInfo, callback) {
    getSession(function (sess) {
      AppUtils.console('Adfsdfxsd', sess);
      api.setHeader('authToken', sess);
      api.post('/requester/receive/appointment/messages/', userInfo).then((responce) => callback(false, responce.data));
    });
  }

  static toSendMsg(userInfo, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/requester/save/appointment/messages', userInfo).then((responce) => callback(false, responce.data));
    });
  }

  static toReadMsg(userInfo, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/requester/read/appointment/messages', userInfo).then((responce) => callback(false, responce.data));
    });
  }

  static toGetDoctorSessionCalendar(userInfo, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/user/clinic/doctor/profile', userInfo).then((responce) => callback(false, responce.data));
    });
  }

  static async getDepartmentList() {
    return await api.get('/clinic/departments');
  }

  static async getUserSubscriptStatus() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      subApi.setHeader('authtoken', sessionInfo.session);
    }
    return await subApi.get('api/v1/subscription/orders/users/status');
  }

  static async getUserSubscriptions() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      subApi.setHeader('authtoken', sessionInfo.session);
    }
    return await subApi.get('/api/v1/subscription/orders/users');
  }

  static async getUserCorporatePlanStatus() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      subApi.setHeader('authtoken', sessionInfo.session);
    }
    return await subApi.get('/api/v1/hr/company_packages_status');
  }

  static async availUserSubscription(featureId, body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      subApi.setHeader('authtoken', sessionInfo.session);
    }
    return await subApi.patch('/api/v1/subscription/orders/features/' + featureId, body);
  }

  static async getUserCorporatePlan() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      subApi.setHeader('authtoken', sessionInfo.session);
    }
    return await subApi.get('/api/v1/hr/company_packages');
  }

  static async getDoctorList(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('clinic/doctor/filter/' + data.page + '/' + data.limit, data);
  }

  static async relativeList() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('user/profile/with/relative');
  }

  static async appointmentPay(appointmentId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/appointment/pay/' + appointmentId + '/');
  }

  static async appointmentPayWithRefferal(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/pay/consult/charge', data);
  }

  static async generateInvoice(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('clinic/appointment/invoice', data);
  }

  static async newUserProfilePic(data) {
    return await api.post('/new/user/profile/pic', data);
  }

  static async storeToken(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/store/token', data);
  }

  static async storeOnBoardRequest(clinicId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/store/onBoarding/request/' + clinicId);
  }

  static async sendPrescriptionDeliveryMail(appointmentId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/clinic/medicine/get/' + appointmentId);
  }

  static async getEPrescriptionDetails(appointmentId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/medicine/ePrescription/detail/for/user/' + appointmentId);
  }

  static async medicinePayment(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/medicine/pay', data);
  }

  static async downloadCertificateOrEPrescription(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/medicine/file/download', data);
  }

  static async getDistanceBetweenLatLong(data) {
    let url =
      'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' +
      data.pickUplat +
      ',' +
      data.pickUplong +
      '&destinations=' +
      data.droplat +
      ',' +
      data.droplong +
      '&mode=driving&language=en-EN&sensor=false&' +
      'key=' +
      AppStrings.MAP_API_KEY;
    return await axios.get(url);
  }

  static async getVehicleType() {
    return await api.get('/vehicle/type');
  }

  static async getFare(tripType) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/fare', tripType);
  }

  static async getFareAndHospital(trip) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/fare/hospital', trip);
  }

  static async additionalItems(additionalItemData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('additional/item', additionalItemData);
  }

  static async bookVehicle(bookingData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/book/vehicle', bookingData);
  }

  static async cancelAllVehicleRequests() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/api/v1/transport/user/cancel_rqstd_trips');
  }

  static async getUpcomingDetails(page_num) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/scheduled/trip', page_num);
  }

  static async getPastDetails(page_past) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/completed/trip', page_past);
  }

  static async cancelTrip(cancelDetails) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/cancel/trip', cancelDetails);
  }

  static getNotificationList(page, callback) {
    getSession(function (sess) {
      api.setHeader('authToken', sess);
      api.post('/user/notification/list', page).then((response) => callback(false, response.data));
    });
  }

  static async payment(bookingId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/payment/request', bookingId);
  }

  static async invoice(bookingId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/generate/invoice', bookingId);
  }

  static async getTripDetails(bookingId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/trip/detail', bookingId);
  }

  static async getPaymentStatus(paymentStatusData) {
    AppUtils.console('Sdzxcvbesfd', paymentStatusData);
    const rdp_api = create({
      baseURL: 'https://secure.reddotpayment.com/service/Merchant_processor/query_redirection',
      headers: { Accept: 'application/json' },
    });
    return await rdp_api.post('/payment_redirect', paymentStatusData);
  }

  static async getSandBoxPaymentStatus(paymentStatusData) {
    AppUtils.console('Sdzxcvbesfd', paymentStatusData);
    const rdp_api = create({
      baseURL: 'https://secure-dev.reddotpayment.com/service/Merchant_processor/query_redirection',
      headers: { Accept: 'application/json' },
    });
    return await rdp_api.post('/payment_redirect', paymentStatusData);
  }

  static async xenditPaymentCallback(moduleName, xenditInvoiceId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get(`${moduleName}/payment/webhook/xendit/callback?status=cancel&invoice_id=${xenditInvoiceId}`);
  }

  static async stripePaymentCallback(moduleName, stripeCheckoutSessionId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get(`${moduleName}/payment/webhook/stripe/callback?status=cancel&session_id=${stripeCheckoutSessionId}`);
  }

  // rms callback for appoinment
  static async razorAppointmentCallback(paymentData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post(`/api/v1/razer/appointment/notify`, paymentData);
  }

  // rms callback for caregiver
  static async razorCaregiverCallback(paymentData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post(`/api/v1/razer/caregiver/notify`, paymentData);
  }

  static async getAddress() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    AppUtils.console('zsfdxghcvh', sessionInfo.session);
    return await api.get('/user/address');
  }
  static async getUserAddress() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/user/address/get');
  }

  static async addAddress(addressData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/address/add', addressData);
  }

  static async getWaitingRoomDepartments() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/api/v1/wr/departments');
  }

  static async getWaitingRoomDoctorDetails(department) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/api/v1/wr/doctor/languages', department);
  }

  static async xenditPaymentInstantVc(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('api/v1/wr/request/appointment', data);
  }

  static async getWaitingRoomPaymentIntent(payment) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    console.log("CheckAuthToken", sessionInfo.session);
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/api/v1/wr/request/appointment', payment);
  }

  static async notifyWaitingRoomPaymentSuccess(requestId) {
    return await api.put('/api/v1/wr/request/appointment/' + requestId);
  }

  static async cancelWaitingRoomPaymentRequest(requestId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    console.log("CheckAuthToken", sessionInfo.session);
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.delete('/api/v1/wr/request/appointment/' + requestId);
  }


  static async cancelWaitingRoomAppointmentRequest(requestId, feedback) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    console.log("CheckAuthToken", sessionInfo.session);
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/api/v1/wr/request/appointment/cancel/' + requestId, feedback);
  }

  static async getZoomSignature(data){
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      zoomSignApi.setHeader('Authorization', `Bearer ${sessionInfo.session}`);
    }
    
    return await zoomSignApi.post("/api/v1/hp/get_zoom_signature" , data);
  }
  
  
  static async getZoomAccessToken(accountId) {
    return await zoomApi.post('/token?grant_type=account_credentials&account_id='+ accountId);
  }

  static async updateAddress(addressData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/address/update', addressData);
  }

  static async deleteAddress(addressId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/address/remove', addressId);
  }

  static async setDefaultAddress(addressId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/set/default/address', addressId);
  }

  static async updateUserSelfProfile(details) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/update/self/info', details);
  }

  static async updateEmail(email) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/user/email/update', email);
  }

  static async checkUserProfileAvailability() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/user/profile/available');
  }

  static async registerFromDeepLink(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/deeplink/url', data);
  }

  static async registerNewUser(userDetails) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    //return await api.post('/registerNewUser', userDetails);
    return await api.post('/api/v1/users/patients', userDetails);
  }

  static async getAppointmentDetailsById(appointmentId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/requester/appointment/detail/' + appointmentId);
  }

  static async applyConsultaionVoucher(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/apply/consultation/payment/voucher', data);
  }

  static async getService() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/caregiver/get/form/data');
  }

  static async getSubService(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/caregiver/services', data);
  }

  static async bookCaregiver(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/caregiver/book', data);
  }

  static async getCompletedJob(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/caregiver/completed/job', data);
  }

  static async getUpcomingJob(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/caregiver/upcoming/job', data);
  }

  static async getRequestedJob(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/caregiver/requested/job/' + data);
  }

  static async caregiverJobPay(jobId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/caregiver/job/pay', jobId);
  }

  static async getCaregiverNotifications(page) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/caregiver/user/notification/' + page);
  }

  static async cancelRequest(id) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.put('/caregiver/cancel/job/' + id);
  }

  static async extendRequest(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/caregiver/extend/job', data);
  }

  static async invoiceRequest(requestId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/caregiver/job/invoice/' + requestId);
  }

  static async caregiverGetPayUPaymentData() {
    return await api.get('/caregiver/get/payU/payment/data');
  }

  /*-------------------------------------------MEDICAL-EQUIPMENTS----------------------------------*/

  static async getDashboardData(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/mobile/dashboard');
  }
  static async getViewedData() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/equipment/best/viewed/product');
  }

  static async getDrawerData() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/equipment/drawer');
  }

  static async placeOrder(orderDetails) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/order', orderDetails);
  }

  static async makePayment(purchaseId) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/pay/amount', purchaseId);
  }

  static async verifyOffer(offerCode) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/offer/verify', offerCode);
  }

  static async verifyCoupon(offerCode) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    //return await api.post('/company/referral/verify', offerCode);
    return await api.post('/api/v1/coupons/validate', offerCode);
  }

  static async useCoupon(postData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    // return await api.post("/company/referral/verify", offerCode);
    return await api.patch('/api/v1/coupons/use', postData);
  }

  static async getMedicalEquipmentNotifications(page) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/equipment/user/notification/' + page);
  }

  static async getMyOrder(filterData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/my/order/' + filterData.page, filterData.filterBy);
  }
  static async getMyReview(Data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/user/review/get', Data);
  }

  static async getOrder(id) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }

    return await api.get('/equipment/product/ordered/detail/' + id);
  }
  static async getProductDetail(id) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }

    return await api.get('/equipment/product/detail/' + id);
  }

  static async getMyWishList(filterData) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('equipment/wish/list/product/' + filterData.page);
  }

  static async addToWishList(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/wish/store', data);
  }

  static async removeFromWishList(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/wish/remove', data);
  }

  static async addToCart(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/cart/add', data);
  }

  static async removeToCart(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/cart/remove', data);
  }

  static async getReview(id) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/equipment/rating/by/product/' + id);
  }

  static async getNearBy(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/near/by/product', data);
  }

  static async trackOrder(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/track', data);
  }

  static async getCategory() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/equipment/category');
  }

  static async getProductList(data, page) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/view/all/product/' + page, data);
  }

  static async getCartList() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/equipment/cart/item');
  }

  static async sendReview(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/rating/store', data);
  }
  static async storeProduct(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/equipment/product/viewed/store', data);
  }
  static async getArticle(page, limit, data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/clinic/article/list/' + page + '/' + limit, data);
  }

  static async getArticleSuggestion(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/clinic/article/search/suggestion/', data);
  }

  static async updateArticleView(id) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.put('/clinic/article/view/update/' + id);
  }
  static async updateArticleBookMark(id, data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.put('/clinic/article/book/mark/update/' + id, data);
  }

  static async getWellnessStatus() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/api/v1/wellness/status');
  }

  static async getvitalSubscriptionPlan() {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('/vital/subscription/list/for/user');
  }

  static async startSubscriptionPlan(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/start/subscription/plan', data);
  }

  static async payForVitalSubscription(data) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/subscription/pay/', data);
  }

  static async getVitalDashboard(id, body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/user/dashboard/v2/' + id, body);
  }

  static async setMultipleRange(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/set/multiple/params/range', body);
  }
  static async setMultipleRecord(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/multiple/record/add', body);
  }
  static async getRelativeRecord(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/get/relative/record', body);
  }
  static async updateVitalRange(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/update/multiple/params/range', body);
  }
  static async updateVitalRecord(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.put('/vital/multiple/record/update', body);
  }
  static async recordDelete(id) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.delete('/vital/single/record/delete/' + id);
  }
  static async deleteAllRecord(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.put('/vital/relative/all/record/delete', body);
  }
  static async getRelativeDoctorList(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/doctor/list/for/relative', body);
  }
  static async mapDoctor(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/map/doctor/for/relative', body);
  }

  static async setOtherVital(body) {
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('/vital/other/params/set/range', body);
  }

  static async addDigitalCardToWallet (){
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.post('api/v1/hr/dc/generate');
  }

  static async getDigitalCardData (){
    const sessionInfo = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.SESSION_INFO));
    if (sessionInfo) {
      api.setHeader('authToken', sessionInfo.session);
    }
    return await api.get('api/v1/hr/dc');
  }
}
