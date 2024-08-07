import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
import { strings } from '../locales/i18n';

export class AppArray {
  static heightWindow = height;
  static widthWindow = width;
  static screenHeight = Dimensions.get('screen').height;
  static screenWidth = Dimensions.get('screen').width;

  static language() {
    return [
      { name: 'Arabic (ar)', subTitle: 'العربية', short: 'AR', value: 'ar' },
      { name: 'English (en)', subTitle: 'English', short: 'EN', value: 'en' },
      { name: 'Bahasa (id)', subTitle: 'Bahasa', short: 'ID', value: 'id' },
      { name: 'Bangla (bn)', subTitle: 'বাংলা', short: 'BN', value: 'bn' },
      { name: 'Kazakh (kz)', subTitle: 'қазақ', short: 'KZ', value: 'kk' },
      { name: 'Khmer (km)', subTitle: 'ខ្មែរ', short: 'KM', value: 'km' },
      { name: 'Malay (ms)', subTitle: 'Malay', short: 'MS', value: 'ms' },
      {
        name: 'Mandarin (zh-Hans)',
        subTitle: '普通话',
        short: '普通话',
        value: 'zh',
      },
      { name: 'Tamil (ta)', subTitle: 'தமிழ்', short: 'TA', value: 'ta' },
      {
        name: 'Vietnamese (vi)',
        subTitle: 'Vietnamese',
        short: 'VI',
        value: 'vi',
      },
    ];
  }

  static searchSuggestionDoctor() {
    return [
      {
        name: 'General Physician',
        translation: strings('doctor.doctorSuggestion.generalPhy'),
      },
      {
        name: 'Cancer',
        translation: strings('doctor.doctorSuggestion.cancer'),
      },
      { name: 'Ortho', translation: strings('doctor.doctorSuggestion.ortho') },
      {
        name: 'Dental',
        translation: strings('doctor.doctorSuggestion.dental'),
      },
      {
        name: 'Cardio',
        translation: strings('doctor.doctorSuggestion.cardio'),
      },
      { name: 'Gynae', translation: strings('doctor.doctorSuggestion.gynae') },
      { name: 'Pain', translation: strings('doctor.doctorSuggestion.pain') },
    ];
  }

  static symptoms() {
    return [
      {
        name: strings('string.symptoms.allergies'),
        isSelected: false,
        _id: '1A',
      },
      {
        name: strings('string.symptoms.backpain'),
        isSelected: false,
        _id: '1B',
      },
      {
        name: strings('string.symptoms.blockedNose'),
        isSelected: false,
        _id: '1C',
      },
      {
        name: strings('string.symptoms.pneumonia'),
        isSelected: false,
        _id: '1D',
      },
      { name: strings('string.symptoms.cough'), isSelected: false, _id: '1E' },
      { name: strings('string.symptoms.diare'), isSelected: false, _id: '1F' },
      {
        name: strings('string.symptoms.headache'),
        isSelected: false,
        _id: '1G',
      },
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
      {
        name: strings('string.symptoms.fluCold'),
        isSelected: false,
        _id: '1K',
      },
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
        name: strings('string.symptoms.eyeInfection'),
        isSelected: false,
        _id: '1M',
      },
      {
        name: strings('string.symptoms.thyroid'),
        isSelected: false,
        _id: '1N',
      },
      {
        name: strings('string.symptoms.soreThroat'),
        isSelected: false,
        _id: '1O',
      },
      {
        name: strings('string.symptoms.nasalCongestion'),
        isSelected: false,
        _id: '1P',
      },
    ];
  }

  static getMainCategory(countryCode) {
    countryCode = countryCode ? countryCode : '91';
    return [
      {
        title: countryCode == '65' ? strings('shared.homeScreen.videoTitle') : strings('shared.homeScreen.videoTitle'),
        subTitle: countryCode == '65' ? strings('shared.homeScreen.videoSubTitleSingapore') : strings('shared.homeScreen.videoSubTitle'),
        icon: require('../../assets/images/video_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/video.png'),
        colors: '#FCEDFF',
        backgroundColor: '#F2C0FC',
        location: [0, 1],
        angel: 159,
        id: 'videoConsult',
      },
      {
        title: strings('shared.bookAppoint'),
        subTitle: strings('shared.findNearBySpecialist'),
        icon: require('../../assets/images/appointment_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/appointment.png'),
        colors: '#FFF3ED',
        backgroundColor: '#FFD0B8',
        location: [0, 1],
        angel: 0,
        id: 'doctorBooking',
      },
      {
        title: strings('shared.homeScreen.houseTitle'),
        subTitle: strings('shared.homeScreen.houseSubTitle'),
        icon: require('../../assets/images/home_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/housecall.png'),
        colors: '#FFF7EB',
        backgroundColor: '#FFE5BE',
        location: [0, 1],
        angel: 154,
        id: 'houseCall',
      },

      {
        title: strings('shared.homeScreen.MTTitle'),
        subTitle: strings('shared.homeScreen.MTSubTitle'),
        icon: require('../../assets/images/ambulance_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/transport.png'),
        colors: '#FCEFF8',
        backgroundColor: '#FFC7EE',
        location: [0, 1],
        angel: 164,
        id: 'medicalTransport',
      },
      {
        title: strings('shared.homeScreen.CGTitle'),
        subTitle: strings('shared.homeScreen.CGSubTitle'),
        icon: require('../../assets/images/caregiver_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/caregiver.png'),
        colors: '#F5F0FE',
        backgroundColor: '#D5C0FB',
        location: [0, 1],
        angel: 158,
        id: 'careGiver',
      },
      {
        title: strings('shared.homeScreen.MAWMTitle'),
        subTitle: strings('shared.homeScreen.MAWMSubTitle'),
        icon: require('../../assets/images/medical_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/marketplace.png'),
        colors: '#EAF4F5',
        backgroundColor: '#B5E4E8',
        location: [0, 1],
        angel: 162,
        id: 'healthCare',
      },
      {
        title: strings('shared.homeScreen.VSMTitle'),
        subTitle: strings('shared.homeScreen.VSMSubTitle'),
        icon: require('../../assets/images/vital_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/vital.png'),
        colors: '#FFE5E5',
        backgroundColor: '#FFB4B4',
        location: [0, 1],
        angel: 159,
        id: 'vitalSign',
      },
      {
        title: strings('shared.homeScreen.HTPLTitle'),
        subTitle: strings('shared.homeScreen.HTPLSubTitle'),
        icon: require('../../assets/images/wellness_withbg.png'),
        iconWithoutCircle: require('../../assets/images/wellness_withbg.png'),
        colors: '#f1a623',
        backgroundColor: '#f1a623',
        location: [0, 1],
        angel: 159,
        id: 'htpl',
      },
      {
        title: strings('shared.homeScreen.HAWATitle'),
        subTitle: strings('shared.homeScreen.HAWASubTitle'),
        icon: require('../../assets/images/health_With_Circle.png'),
        iconWithoutCircle: require('../../assets/homeScreenImages/article.png'),
        colors: '#F1FCFA',
        backgroundColor: '#B2F1E5',
        location: [0, 1],
        angel: 159,
        id: 'article',
      },
    ].filter((rec) => rec);
  }

  static androidDeviceList() {
    return [
      {
        _id: 1,
        isMapped: false,
        deviceName: 'Fitbit',
        brand: 'Smart Watch',
        // description: "Fitbit",
        deviceImage: require('./../../assets/images/fitbit_img.jpeg'),
      },
     
      // {
      //   _id: "2",
      //   isMapped: false,
      //   deviceName: "Samsung watch",
      //   brand: "Samsung ",
      //   description: "Samsung watch",
      //   deviceImage: require("./../../assets/images/samsung_watch.png"),
      // },
      // {
      //   _id: "3",
      //   isMapped: false,
      //   deviceName: "Omron BP",
      //   brand: "Omron",
      //   description: "Omron BP",
      //   deviceImage: require("./../../assets/images/omron.png"),
      // },
    ];
  }

  static iosDeviceList(){
    return [
      {
        _id: 1,
        isMapped: false,
        deviceName: 'Fitbit',
        brand: 'Smart Watch',
        // description: "Fitbit",
        deviceImage: require('./../../assets/images/fitbit_img.jpeg'),
      },
      {
        _id: 2,
        isMapped: false,
        deviceName: 'Apple Health',
        brand: 'Apple Watch',
        // category: 'Vital Devices',
        // name:'Vital Devices',
        deviceImage: require(`./../../assets/images/apple_watch.png`),
      },
    ]
  }
}
