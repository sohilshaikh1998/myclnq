import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { strings } from '../locales/i18n';
import I18n from 'react-native-i18n';

export class AppStrings {
  static isMandatory = strings('string.isMandatory');

  static trackflowId =
    Platform.OS === 'ios'
      ? 'U2FsdGVkX18sHusHuDAc0GyhBkTDBz7aHimugmMaWDnxSWdAg2h6VreSjuymJNjpsS5lYCLtR/HtVeJu61+6ZA=='
      : 'U2FsdGVkX19XUcioHGyOvX3W8l+Fod7llzfswuIr4Tu8MbKuCnqmtCn0q8q6yiFmDftFwlUu5dlqIfdhISUSNg==';

  static errorMessages = {
    mandatory: {
      firstName: strings('string.mandatory.firstName'),
      lastName: strings('string.mandatory.lastName'),
      NRIC: strings('string.mandatory.NRIC'),
      relation: strings('string.mandatory.relation'),
      gender: strings('string.mandatory.gender'),
      insuranceNumber: strings('string.mandatory.insuranceNumber'),
      insuranceCompany: strings('string.mandatory.insuranceCompany'),
      mobNumber: strings('string.mandatory.mobNumber'),
      mobMatching: strings('string.mandatory.mobMatching'),
      name: strings('string.mandatory.name'),
      email: strings('string.mandatory.email'),
      message: strings('string.mandatory.message'),
      ageDifference: strings('string.mandatory.ageDifference'),
      invalidEmail: strings('string.mandatory.invalidEmail'),
    },
  };

  static topTab = {
    upcoming: strings('string.topTab.upcoming'),
    past: strings('string.topTab.past'),
    new: strings('string.topTab.new'),
    pending: strings('string.topTab.pending'),
    history: strings('string.topTab.history'),
  };
  static region = {
    latitude: 1.4538337,
    longitude: 103.8195883,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };
  static age = [
    { ageRange: '21-30', id: 1, isSelected: false },
    { ageRange: '31-40', id: 2, isSelected: false },
    { ageRange: '41-50', id: 3, isSelected: false },
    { ageRange: '>50', id: 4, isSelected: false },
  ];

  static symptoms = [
    {
      name: strings('string.symptoms.allergies'),
      isSelected: false,
      _id: '1A',
    },
    { name: strings('string.symptoms.backpain'), isSelected: false, _id: '1B' },
    {
      name: strings('string.symptoms.blockedNose'),
      isSelected: false,
      _id: '1C',
    },
    {
      name: strings('string.symptoms.contraception'),
      isSelected: false,
      _id: '1D',
    },
    { name: strings('string.symptoms.cough'), isSelected: false, _id: '1E' },
    { name: strings('string.symptoms.diare'), isSelected: false, _id: '1F' },
    { name: strings('string.symptoms.Dizzines'), isSelected: false, _id: '1G' },
    {
      name: strings('string.symptoms.eyeConditions'),
      isSelected: false,
      _id: '1H',
    },
    { name: strings('string.symptoms.fever'), isSelected: false, _id: '1I' },
    {
      name: strings('string.symptoms.fitnessFlu'),
      isSelected: false,
      _id: '1J',
    },
    { name: strings('string.symptoms.fluCold'), isSelected: false, _id: '1K' },
    {
      name: strings('string.symptoms.healthscreening'),
      isSelected: false,
      _id: '1L',
    },
    {
      name: strings('string.symptoms.jointMuscle'),
      isSelected: false,
      _id: '1L',
    },
    {
      name: strings('string.symptoms.covidTest'),
      isSelected: false,
      _id: '1M',
    },
    {
      name: strings('string.symptoms.rtPCRTest'),
      isSelected: false,
      _id: '1N',
    },
    {
      name: strings('string.symptoms.pdtPCRTest'),
      isSelected: false,
      _id: '1O',
    },
    {
      name: strings('string.symptoms.covidVaccination'),
      isSelected: false,
      _id: '1P',
    },
  ];

  static btnTxt = {
    cancel: strings('string.btnTxt.cancel'),
    submit: strings('string.btnTxt.submit'),
    extend: strings('string.btnTxt.extend'),
    payNow: strings('string.btnTxt.payNow'),
    viewPay: strings('string.btnTxt.viewPay'),
    paid: strings('string.btnTxt.paid'),
    getInvoive: strings('string.btnTxt.getInvoive'),
    close: strings('string.btnTxt.close'),
    confirm: strings('string.btnTxt.confirm'),
    invoice: strings('string.btnTxt.invoice'),
    send: strings('string.btnTxt.send'),
  };

  static addressModal = {
    selectAdd: strings('string.addressModal.selectAdd'),
  };

  static TRACKING_ID = 'UA-125897569-1';

  static MAP_API_KEY = 'AIzaSyDLM_IO2v3nlqUqWmuPDg6I3H_3-u90J6E';
  static googlePlacesAPIKey = 'AIzaSyAIBljm9DqGHSA6okskZBP_hBq84Iri6Uo';
  static alert = {
    patient_alert: strings('string.alert.patient_alert'),
    add_address: strings('string.alert.add_address'),
    select_adddress: strings('string.alert.select_adddress'),
    alert_language: strings('string.alert.alert_language'),
    looking_msg: strings('string.alert.looking_msg'),
    alert_date: strings('string.alert.alert_date'),
    alert_time: strings('string.alert.alert_time'),
    alert_hour: strings('string.alert.alert_hour'),
    alert_day: strings('string.alert.alert_day'),
    alert_address: strings('string.alert.alert_address'),
    request_limit: strings('string.alert.request_limit'),
    days_limit: strings('string.alert.days_limit'),
    hour_limit: strings('string.alert.hour_limit'),
    select_nationality: strings('string.alert.select_nationality'),
    select_patient: strings('string.alert.select_patient'),
    invoice_success: strings('string.alert.invoice_success'),
    try_again: strings('string.alert.try_again'),
    extend_success: strings('string.alert.extend_success'),
    cancel_alert: strings('string.alert.cancel_alert'),
    alert_notification: strings('string.alert.alert_notification'),
    vital_record: strings('string.alert.vital_record'),
    vital_range: strings('string.alert.vital_range'),
  };
  static label = {
    male: strings('string.label.male'),
    female: strings('string.label.female'),
    card: strings('string.label.experience'),
    experience: strings('string.label.experience'),
    send_experience: strings('string.label.send_experience'),
    send_fresher: strings('string.label.send_fresher'),
    fresher: strings('string.label.fresher'),
    enabled: strings('string.label.enabled'),
    disabled: strings('string.label.disabled'),
    more: strings('string.label.more'),
    night: strings('string.label.night'),
    start_date: strings('string.label.start_date'),
    start_time: strings('string.label.start_time'),
    days: strings('string.label.days'),
    hours: strings('string.label.hours'),
    age: strings('string.label.age'),
    gender: strings('string.label.gender'),
    nationality: strings('string.label.nationality'),
    language: strings('string.label.language'),
    type: strings('string.label.type'),
    services: strings('string.label.services'),
    select_date: strings('string.label.select_date'),
    select_time: strings('string.label.select_time'),
    select_service: strings('string.label.select_service'),
    condition: strings('string.label.condition'),
    patient_detail: strings('string.label.patient_detail'),
    symptoms: strings('string.label.symptoms'),
    userAddress: strings('string.label.userAddress'),
    payment_status: strings('string.label.payment_status'),
    queueNumber: strings('string.label.queueNumber'),
    appointmentStatus: strings('string.label.appointmentStatus'),
    information: strings('string.label.information'),
    add_address: strings('string.label.add_address'),
    cancel: strings('string.label.cancel'),
    please_msg: strings('string.label.please_msg'),
    requirement: strings('string.label.requirement'),
    location: strings('string.label.location'),
    looking_for: strings('string.label.looking_for'),
    date: strings('string.label.date'),
    jobDate: strings('string.label.jobDate'),
    requestDate: strings('string.label.requestDate'),
    appointmentDetails: strings('string.label.appointmentDetails'),

    doctorDetail: strings('string.label.doctorDetail'),
    clinicDetail: strings('string.label.clinicDetail'),
    startDateTime: strings('string.label.startDateTime'),
    cancelAppoinment: strings('string.label.cancelAppoinment'),
    reschduleAppoinment: strings('string.label.reschduleAppoinment'),
    chat: strings('string.label.chat'),
    medicalCertificate: strings('string.label.medicalCertificate'),
    viewPres: strings('string.label.viewPres'),
    viewNotes: strings('string.label.viewNotes'),
    invoice: strings('string.label.invoice'),
    healthPerfect: strings('string.label.healthPerfect'),

    nurse: strings('string.label.nurse'),
    nurse_detail: strings('string.label.nurse_detail'),
    preferences: strings('string.label.preferences'),
    experienced: strings('string.label.experienced'),
    male_age: strings('string.label.male_age'),
    female_age: strings('string.label.female_age'),
    speaks: strings('string.label.speaks'),
    requests: strings('string.label.requests'),
    new: strings('string.label.new'),
    history: strings('string.label.history'),
    pending: strings('string.label.pending'),
    service_charge: strings('string.label.service_charge'),
    additional_info: strings('string.label.additional_info'),
    apply_coupon: strings('string.label.apply_coupon'),
    request_detail: strings('string.label.request_detail'),
    order_id: strings('string.label.order_id'),
    order_total: strings('string.label.order_total'),
    extend_request: strings('string.label.extend_request'),
    send_request: strings('string.label.send_request'),
    service_provider: strings('string.label.service_provider'),
    see_more: strings('string.label.see_more'),
    no_notification: strings('string.label.no_notification'),
    cart_count: strings('string.label.cart_count'),
    notForSale: strings('string.label.notForSale'),
    notForSaleMessage: strings('string.label.notForSaleMessage'),
    REGISTER: strings('string.label.REGISTER'),

    DOCTOR_BOOKING: 'DOCTOR_BOOKING',
    CAREGIVER: 'CAREGIVER',
    MEDICAL_EQUIPMENT: 'MEDICAL_EQUIPMENT',
    MEDICAL_TRANSPORT: 'MEDICAL_TRANSPORT',
    MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
    E_PRESCRIPTION: 'E_PRESCRIPTION',
    VITAL_SUBSCRIPTION: 'VITAL_SUBSCRIPTION',
  };

  static contracts = {
    SESSION_INFO: 'logged_session',
    LOGGED_IN_USER: 'logged_in_user',
    LOGGED_IN_USER_DETAILS: 'logged_in_user_details',
    IS_LOGGED_IN: 'is_logged_in',
    IS_PROFILE_AVAILABLE: 'is_profile_available',
    LOGGED_IN_USER_ID: 'session_id_available',
    firstTimeUser: 'isFirstTimeUser',
    LAST_PAYMENT_BOOKING_ID: 'LAST_PAYMENT_BOOKING_ID',
    NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED: 'NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED',
    APPLICATION: 'application',
    POSITIVE_EVENT_COUNT: 'POSITIVE_EVENT_COUNT',
    LOCALE: 'LOCALE',
    GOOGLE_USER_DATA: 'googleUserData',
    APPLE_USER_DATA : 'appleUserData'
  };

  static deepLinkedData ={
      PRODUCT_URL : 'product_url'
  }

  static medicineDose = [
    {
      value: '0-0-1',
      session: {
        morning: false,
        afterNoon: false,
        night: true,
      },
    },
    {
      value: '0-1-0',
      session: {
        morning: false,
        afterNoon: true,
        night: false,
      },
    },
    {
      value: '0-1-1',
      session: {
        morning: false,
        afterNoon: true,
        night: true,
      },
    },
    {
      value: '1-0-0',
      session: {
        morning: false,
        afterNoon: false,
        night: true,
      },
    },
    {
      value: '1-0-1',
      session: {
        morning: true,
        afterNoon: false,
        night: true,
      },
    },
    {
      value: '1-1-0',
      session: {
        morning: true,
        afterNoon: true,
        night: false,
      },
    },
    {
      value: '1-1-1',
      session: {
        morning: true,
        afterNoon: true,
        night: true,
      },
    },
  ];

  static fitBitToken = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  };

  static vitalDeviceConnected = {
    FITBIT_CONNECTED: 'fitbit_connected',
    HEALTHKIT_CONNECTED: 'healthkit_connected',
  };

  static wagonSearch = {
    IS_SEARCH_ACTIVE: 'isWagonSearchActive',
    BOOKING_DATA: 'bookingData',
  };

  static payUDetails = {
    MERCHANT_KEY: 'hmjBxTm2',
    MERCHANT_SALT: 'VR0dzDau6i',
    AUTH_HEADER: 'rBDTm8YABNrWPQiMgPXrWOFnf5COO2/m+mYy1vqxP/o=',
    MERCHANT_ID: '7116562',
  };

  static stripeDetails = {
    SUCCESS_CALLBACK_ENDPOINT: 'stripe/payment/success',
    CANCEL_CALLBACK_ENDPOINT: 'stripe/payment/cancel',
    SUCCESS_WEBHOOK_ENDPOINT: 'stripe/callback?status=success',
    CANCEL_WEBHOOK_ENDPOINT: 'stripe/callback?status=cancel',
    SUCCESS_PAYNOW_ENDPOINT: 'payment_attempt_state=succeeded',
  };

  static xenditDetails = {
    SUCCESS_CALLBACK_ENDPOINT: 'xendit/payment/success',
    CANCEL_CALLBACK_ENDPOINT: 'xendit/payment/cancel',
    SUCCESS_WEBHOOK_ENDPOINT: 'xendit/callback?status=success',
    CANCEL_WEBHOOK_ENDPOINT: 'xendit/callback?status=cancel',
  };

  static vital_devices = {
    APPLE_WATCH: 'Apple Watch',
    MANUAL: 'Manual',
    SAMSUNG_WATCH: 'Samsung Watch',
    DYNOSENSE: 'Dynosense',
    FITBIT: 'FitBit',
  };

  static apiURL = {
    // baseURL: 'http://localhost:3000', //Localhost
    // baseURL: 'https://testapi.e-healthmyclnq.com', // TEST Domain
    // baseURL: 'http://54.251.192.85:3000', // STAGING Domain
    baseURL: "https://stagingapi.myclnqhealth.com", 
    baseWS :"wss://stagingapi.myclnqhealth.com", // Staging
    // baseURL: 'https://myclnqapi.ssivixlab.com', //PRODUCTION
    //baseURL: 'https://backend.bokehmall.com',
    // baseURL: 'http://192.168.0.108:4000',
    // baseURL: 'http://54.179.173.204:3000',
    /// baseWS : "wss://myclnqapi.ssivixlab.com"; // Production
    productionURL: 'https://myclnqapi.ssivixlab.com', //PRODUCTION
  };

  static myClnqVersionName = Platform.OS === 'ios' ? '2.10.0(1)' : DeviceInfo.getVersion();

  static key = {
    key: 'key',
    request: 'request',
    medicalEquipment: 'medical_equipment',
    vitalSubscription: 'vital_subscription',
    caregiver: 'caregiver',
    appointment: 'appointment',
    equipment: 'equipment',
    vital: 'vital',
    trip: 'trip',
    medicine: 'medicine',
    ePrescription: 'ePrescription',
    transport: 'transport',
    membership: 'membership',
  };

  static storeLink =
    Platform.OS === 'ios' ? 'https://apps.apple.com/us/app/id1436460772' : 'https://play.google.com/store/apps/details?id=com.ssivixlab.MYCLNQ';

  static aboutUs = {
    aboutus_1: strings('string.aboutUs.aboutus_1'),
    aboutus_2: strings('string.aboutUs.aboutus_2'),
    aboutus_3: strings('string.aboutUs.aboutus_3'),
    aboutus_4: strings('string.aboutUs.aboutus_4'),
    helpSupport: strings('string.aboutUs.helpSupport'),
  };

  static quickRequest = {
    consent: strings('string.quickRequest.consent'),

    videoCallTCForAll: strings('string.quickRequest.videoCallTCForAll'),

    videoCallTCForSG: strings('string.quickRequest.videoCallTCForSG'),

    videoCallTCForIN: strings('string.quickRequest.videoCallTCForIN'),
  };

  static bookingDetails = {
    tripStartInfo: strings('string.bookingDetails.tripStartInfo'),
    cardPay: strings('string.bookingDetails.cardPay'),
    tripStartInfoForCardPay: strings('string.bookingDetails.tripStartInfoForCardPay'),
  };

  static error_code = {
    error_10001: strings('string.error_code.error_10001'),
    error_10002: strings('string.error_code.error_10002'),
    error_10003: strings('string.error_code.error_10003'),
    error_10004: strings('string.error_code.error_10004'),
    error_10005: strings('string.error_code.error_10005'),
    error_10006: strings('string.error_code.error_10006'),
    error_10007: strings('string.error_code.error_10007'),
    error_10008: strings('string.error_code.error_10008'),
    error_10009: strings('string.error_code.error_10009'),
    error_10010: strings('string.error_code.error_10010'),
    error_10011: strings('string.error_code.error_10011'),
    error_10012: strings('string.error_code.error_10012'),
    error_10013: strings('string.error_code.error_10013'),
    error_10014: strings('string.error_code.error_10014'),
    error_10015: strings('string.error_code.error_10015'),
    error_10016: strings('string.error_code.error_10016'),
    error_10017: strings('string.error_code.error_10017'),
    error_10018: strings('string.error_code.error_10018'),
    error_10019: strings('string.error_code.error_10019'),
    error_10019_calendar: strings('string.error_code.error_10019_calendar'),

    error_10020: strings('string.error_code.error_10020'),
    error_10020_calendar: strings('string.error_code.error_10020_calendar'),

    error_10021: strings('string.error_code.error_10021'),
    error_10024: strings('string.error_code.error_10024'),
    error_10025: strings('string.error_code.error_10025'),
    error_10025_calendar: strings('string.error_code.error_10025_calendar'),

    error_10028: strings('string.error_code.error_10028'),
    error_10029: strings('string.error_code.error_10029'),
    error_10030: strings('string.error_code.error_10030'),
    error_Other: strings('string.error_code.error_Other'),
  };

  static placeholderImg = 'https://s3.us-east-2.amazonaws.com/smarthelpbucket/logos/patient_default.png';
  //static placeholderImg = "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
  static placeholderClinicImg = 'https://s3.us-east-2.amazonaws.com/smarthelpbucket/logos/clinic_default_logo.png';
  static placeHolderSystemMsg = 'https://s3.us-east-2.amazonaws.com/smarthelpbucket/logos/1155091-200.png';
  static placeHolderUserMsg = 'https://s3.us-east-2.amazonaws.com/smarthelpbucket/logos/support.png';
  static iOS = 'ios';
  static android = 'android';
  static appSchema = 'myclnq';

  static contactNumbers = {
    singapore: '+65 81893129',
    malaysia: '+60 362012677',
    arabic: '+971 553458 542'

  };
  static contactEmails = {
    singapore: 'support@myclnq.co',
    malaysia: 'support@rmamyclnq.co',
  };

  static doctorBookingId = '6458c147c9cf06140d4bb9b2';
}
