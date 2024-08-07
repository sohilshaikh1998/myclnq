import React from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  PermissionsAndroid,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Actions } from 'react-native-router-flux';
import { AppStyles } from '../../shared/AppStyles';
import { AppStrings } from '../../shared/AppStrings';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { SHApiConnector } from '../../network/SHApiConnector';
import Geocoder from 'react-native-geocoding';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CountryPicker, { FlagButton } from 'react-native-country-picker-modal';
import SHButtonDefault from '../../shared/SHButtonDefault';
import moment from 'moment';
import { Validator } from '../../shared/Validator';
import { AppUtils } from '../../utils/AppUtils';
import ProgressLoader from 'rn-progress-loader';
import Profile from './Profile';
import { getCountry, getTimeZone } from 'react-native-localize';
import { strings } from '../../locales/i18n';
import PasswordInputText from 'react-native-hide-show-password-input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getUniqueId } from 'react-native-device-info';
import Toast from 'react-native-simple-toast';
import bmiStyles from '../../styles/bmiStyles';
import firebaseNotifications from '../../utils/firebaseNotifications';
import { Dropdown } from 'react-native-material-dropdown';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
let dt = new Date();
dt.setDate(dt.getDate());
let _dt = dt;

const reg = /^[1-9][0-9]*$/;

let insIndex = 0,
  relIndex = 0;
const insuranceData = [
  { key: insIndex++, section: true, label: 'Choose Insurance Company' },
  { key: insIndex++, label: 'LIC' },
  { key: insIndex++, label: 'Reliance' },
  { key: insIndex++, label: 'Bajaj' },
  { key: insIndex++, label: 'HDFC Life' },
  { key: insIndex++, label: 'Birla Group' },
];
const relationData = [
  { key: relIndex++, section: true, label: 'Select Relation' },
  { key: relIndex++, label: 'Self' },
  { key: relIndex++, label: 'Spouse' },
  { key: relIndex++, label: 'Son' },
  { key: relIndex++, label: 'Daughter' },
  { key: relIndex++, label: 'Others' },
];

const otherRelationData = [
  { key: relIndex++, section: true, label: 'Select Relation' },
  { key: relIndex++, label: 'Spouse' },
  { key: relIndex++, label: 'Son' },
  { key: relIndex++, label: 'Daughter' },
  { key: relIndex++, label: 'Others' },
];

class UserSignUp extends React.Component {
  constructor(props) {
    super(props);
    this.callOnSuccess.bind(this);
    AppUtils.analyticsTracker('SignUp Screen');
    AppUtils.console('PropsUser', props);
    let callingCode = AppUtils.getCountryCallingCode(getCountry());
    this.state = {
      isNewUser: props.isNewUser,
      title: '',
      fName: '',
      lName: '',
      DOB: AppUtils.currentDateTime(),
      gender: '',
      maleTextColor: '#d3d3d3',
      femaleTextColor: '#d3d3d3',
      firstNameData: [],
      profilePic: '',
      showDOB: false,
      clinicProfile: AppStrings.placeholderImg,
      relativePic: AppStrings.placeholderImg,
      fullName: '',
      email: '',
      abhaId: '',
      abhaNumber: '',
      referral: '',
      mobileNumber: '',
      companyName: '',
      password: this.props?.userDetail?.googleUserData || this.props?.userDetail?.appleUserData ? 'google_123' : '',
      confirmPassord: this.props?.userDetail?.googleUserData || this.props?.userDetail?.appleUserData ? 'google_123' : '',
      countryCode: callingCode,
      numberLimit: callingCode == '91' ? 10 : callingCode == '65' ? 8 : callingCode == '62' ? 13 : 12,
      isC: false,
      isLoading: false,
      isCountryListVisible: false,
      cca2: getCountry(),
      countryName: getCountry() === 'IN' || getTimeZone() === 'Asia/Kolkata' ? 'India' : 'Singapore',
      profilePicURL: '',
      enableAbha: true,
      searchAbha: '',
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      showInput: false,
      userIdTypes: '',
      userId: '',
      userIdNum: '',
      selectedId: '',
    };
  }

  handleChange =  (value) => {
    this.setState({ userId: value, showInput: true,userIdNum:'' });
  };
  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        // Actions.LoginMobile();
        Actions.LoginOptions();
        return true;
      });
    }
    if (this.props.isNewUser !== undefined && this.props.isNewUser) {
      this.setState({ isNewUser: true });
    }
    if (this.props.userDetail) {
      this.setState({
        fName:
          this.props.userDetail?.googleUserData?.user?.givenName ||
          this.props.userDetail?.appleUserData?.fullName?.givenName ||
          this.props?.userDetail?.appleUserData?.firstName,
        lName:
          this.props.userDetail?.googleUserData?.user?.familyName ||
          this.props.userDetail?.appleUserData?.fullName?.familyName ||
          this.props?.userDetail?.appleUserData?.lastName,
        email: this.props.userDetail?.googleUserData?.user?.email || this.props.userDetail?.appleUserData?.email,
        clinicProfile: this.props.userDetail?.googleUserData?.user?.photo,
      });
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.exitAlert();
      return true;
    });
  }

  getDataFromDeepLink() {
    var self = this.props;
    this.setState({
      fName: self.firstName,
      lName: self.lastName,
      email: self.email,
      mobileNumber: self.mobile,
    });
  }
  componentWillUnmount() {
    let self = this;
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        self.exitAlert();
        return true;
      });
    }
  }

  exitAlert() {
    if (this.state.isNewUser) {
      AppUtils.console('BackPress', 'SignUpPOP');
      // Actions.LoginMobile();
      Actions.LoginOptions();
    } else {
      Alert.alert(strings('common.common.exitApp'), strings('common.common.wantToQuit'), [
        { text: strings('common.common.stay'), style: 'cancel' },
        {
          text: strings('common.common.exit'),
          onPress: () => BackHandler.exitApp(),
        },
      ]);
    }
  }

  async getLocation() {
    if (Platform.OS === 'ios') {
      this.getUserCurrentLocation();
    } else {
      const permissionGranted = await AppUtils.locationPermissionsAccess();
      if (permissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getUserCurrentLocation();
      }
    }
  }

  async getUserCurrentLocation() {
    let self = this;
    const location = await AppUtils.getCurrentLocation();
    this.setState({ isLoading: false });
    const { latitude, longitude } = location.coords;
    Geocoder.from(latitude, longitude).then((json) => {
      this.getCountryName(json.results[0].address_components);
    });
  }

  getCountryName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      AppUtils.console('xdfvsdzxfv', address_components);
      if (addressType == 'country') {
        if (address_components[i].long_name === 'India') {
          this.setState({
            countryCode: '91',
            cca2: 'IN',
          });
          return;
        } else if (address_components[i].long_name === 'Indonesia') {
          this.setState({
            countryCode: '62',
            cca2: 'ID',
          });
          return;
        }
      }
    }
    return '';
  }

  showPicker = async (stateKey, options) => {
    try {
      let newState = {};
      const { action, year, month, day } = await DateTimePicker.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        let date = new Date(year, month, day);
        AppUtils.console('Scsfz', date);
        newState[stateKey] = date;
      }
      this.setState(newState);
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  openCalender() {
    let self = this;
    Keyboard.dismiss();
    Platform.OS === 'ios' ? self.setState({ showDOB: true }) : self.setState({ showDOB: true });
  }

  closeIOSCalender() {
    this.setState({ showDOB: false });
  }

  openAndroidCalender() {
    return (
      <View>
        {this.state.showDOB ? (
          <DateTimePicker
            value={new Date(this.state.DOB)}
            style={{ backgroundColor: AppColors.whiteColor }}
            maximumDate={AppUtils.currentDateTime()}
            display="spinner"
            mode="date"
            onChange={(event, date) => {
              this.setState({ DOB: date, showDOB: false });
            }}
          />
        ) : null}
      </View>
    );
  }

  openIOSCalender() {
    let _dt = AppUtils.currentDateTime();
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDOB}
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
              <DateTimePicker
                value={new Date(this.state.DOB)}
                style={{ backgroundColor: AppColors.whiteColor }}
                maximumDate={AppUtils.currentDateTime()}
                display="spinner"
                mode="date"
                onChange={(event, date) => {
                  this.setState({ DOB: date });
                }}
              />
            </View>
            <TouchableHighlight onPress={() => this.closeIOSCalender()} underlayColor="transparent">
              <View
                style={{
                  backgroundColor: AppColors.primaryColor,
                  height: 50,
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
                  {moment(this.state.DOB).format('MMM DD YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  setGender(gender) {
    if (gender == 'Male') {
      this.setState({
        gender: 'Male',
        maleTextColor: '#FF4848',
        femaleTextColor: '#d3d3d3',
      });
    } else {
      this.setState({
        gender: 'Female',
        femaleTextColor: '#FF4848',
        maleTextColor: '#d3d3d3',
      });
    }
  }

  showAlert(msg, ispop) {
    let self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  validateData() {
    let isSelectInsurance = Platform.OS === 'ios' ? this.state.insuranceCompanyName === 'Select Insurance' : false;
    let relation = Platform.OS === 'ios' ? this.state.relationText : this.state.relation;

    if (Validator.isBlank(this.state.fName)) {
      this.showAlert(strings('string.mandatory.firstName'), true);
    } else if (Validator.isBlank(this.state.lName)) {
      this.showAlert(strings('string.mandatory.lastName'), true);
    } else if (this.state.mobileNumber.length === 0) {
      this.showAlert(strings('common.common.no_mobile_number'), true);
    } else if (this.validNumber(this.state.mobileNumber.trim())) {
      alert(strings('string.mandatory.mobNumber'));
    } else if (this.state.password.trim().length < 8) {
      this.showAlert(strings('common.common.smallPassword'), true);
    } else if (this.state.password.trim() != this.state.confirmPassord.trim()) {
      this.showAlert(strings('common.common.passwordNotMatching'), true);
    } else if (Validator.isBlank(this.state.email)) {
      this.showAlert(strings('string.mandatory.email'), true);
    } else if (!Validator.validateEmail(this.state.email)) {
      this.showAlert(strings('string.mandatory.invalidEmail'), true);
    } else if (Validator.isBlank(this.state.gender)) {
      this.showAlert(strings('string.mandatory.gender'), true);
    } else if (Validator.isValidHeightWeight(this.state.height, this.state.weight)) {
      this.showAlert('Invalid height or weight', true);
    } else if (Validator.isValidDOB(this.state.DOB, 'self')) {
      this.showAlert(strings('string.mandatory.ageDifference'), true);
      this.setState({
        DOB: moment(new Date()).format('DD-MMM-YYYY'),
      });
    } else {
      this.updateOrInsertUser();
    }
  }

  validNumber(number) {
    var numberLength = number.length;
    AppUtils.console('Number', this.state.numberLimit, ' Length ', numberLength);
    if (this.state.isNewUser) {
      if (this.state.numberLimit == 12 && numberLength < 8) {
        return true;
      } else if (this.state.numberLimit == 13 && numberLength < 8) {
        return true;
      } else if (this.state.numberLimit != 12 && numberLength < this.state.numberLimit) {
        if (this.state.countryCode == '62') {
          return false;
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  toastTimer(message) {
    setTimeout(() => {
      Toast.show(message);
    }, 100);
  }

  updateOrInsertUser() {
    const { isNewUser } = this.state;
    if (isNewUser) {
      if (Validator.isBlank(this.state.mobileNumber.trim())) {
        this.showAlert(strings('string.mandatory.mobNumber'), true);
      }
    }
    isNewUser ? this.registerUser() : this.updateProfile();
  }

  async searchAbhaDetails() {
    if (this.state.searchAbha === '') {
      this.toastTimer(strings('common.abha.id_or_num'));
      return;
    }
    var self = this;
    let body = {
      healthId: this.state.searchAbha.trim(),
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.searchAbha(body);
      AppUtils.console('UserSignUp_443', response);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let temp = responseBody.data;
        this.setState({
          abhaId: temp.healthId,
          abhaNumber: temp.healthIdNumber,
        });
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
      }
    } catch (e) {
      self.setState({ isLoading: false });
    }
  }

  async registerUser() {
    let self = this;
    const tempId = this.state.selectedId.find((item) => item.identificationType === this.state.userId);
    let userDetails = {
      countryCode: self.state.countryCode,
      phoneNumber: self.state.mobileNumber.trim(),
      firstName: self.state.fName,
      lastName: self.state.lName,
      dateOfBirth: moment(self.state.DOB).format(),
      gender: self.state.gender,
      email: self.state.email,
      height: this.state.height,
      weight: this.state.weight,
      heightType: this.state.heightType,
      weightType: this.state.weightType,
      referralCode: self.state.referral === '' ? null : self.state.referral,
      profilePic: self.state.profilePicURL === '' ? null : self.state.profilePicURL,
      companyName: this.state.companyName,
      abhaId: this.state.abhaId != '' ? this.state.abhaId : null,
      abhaNumber: this.state.abhaNumber != '' ? this.state.abhaNumber : null,
      password: this.state.password.trim(),
      uid: this.props?.userDetail?.googleUserData?.user?.id || this.props.userDetail?.appleUserData?.identityToken,
      OSType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
      identificationType: tempId?._id ?? '',
      identificationNumber: this.state.userIdNum ?? '',
    };

    const preCheckResponse = await SHApiConnector.patientPreCheck(userDetails);
    console.log(preCheckResponse.data.message, 'preCheckResponse.data.message');
    // // check if user exist or not
    if (preCheckResponse.status === 200) {
      Actions.SmsotpScreen({ userDetail: userDetails });
    } else {
      setTimeout(() => {
        AppUtils.showMessage(this, '', preCheckResponse.data.message, strings('doctor.button.ok'), () => {});
      }, 500);
    }
  }

  async updateProfile() {
    let profileDetails = {
      firstName: this.state.fName,
      lastName: this.state.lName,
      dateOfBirth: this.state.DOB,
      gender: this.state.gender,
      email: this.state.email,
      height: this.state.height,
      weight: this.state.weight,
      heightType: this.state.heightType,
      weightType: this.state.weightType,
      referralCode: this.state.referral,
      abhaId: this.state.abhaId != '' ? this.state.abhaId : null,
      abhaNumber: this.state.abhaNumber != '' ? this.state.abhaNumber : null,
    };
    let self = this;

    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.updateUserSelfProfile(profileDetails);
      self.setState({ isLoading: false });
      AppUtils.console('dfxcszxfv', response);
      if (response.data.status) {
        await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.response));
        await AsyncStorage.setItem(AppStrings.contracts.IS_PROFILE_AVAILABLE, JSON.stringify({ isProfileAvailable: true }));
        Actions.MainScreen();
      } else {
        setTimeout(() => Alert.alert('', response.data.error_message), 500);
      }
    } catch (e) {
      self.setState({ isLoading: false });
    }
  }

  showMessage() {
    let self = this;
    setTimeout(() => {
      AppUtils.showMessage(self, strings('common.common.success'), strings('common.common.profileUpdated'), strings('doctor.button.ok'), function () {
        self.openProfile();
      });
    }, 500);
  }

  openProfile() {
    AppUtils.console('eszfcsesrfwesd', this.props);
    switch (this.props.profile) {
      case 'WagonProfile':
        Platform.OS === 'ios' ? Actions.MyCareWagonDash({ isWagonProfileUpdated: true }) : Actions.MyCareWagonDash({ isWagonProfileUpdated: true });
        break;
      case 'Profile':
        Platform.OS === 'ios' ? Actions.HomeScreenDash({ isProfileUpdated: true }) : Actions.HomeScreenDash({ isProfileUpdated: true });
        break;
      case 'CaregiverProfile':
        Platform.OS === 'ios' ? Actions.caregiverTab({ isCaregiverProfileUpdated: true }) : Actions.caregiverTab({ isCaregiverProfileUpdated: true });
        break;
      case 'MedicalEquipmentProfile':
        Platform.OS === 'ios'
          ? Actions.drawer({ isMedicalEquipmentProfileUpdated: true })
          : Actions.drawer({ isMedicalEquipmentProfileUpdated: true });
        break;
    }
  }

  cancel() {
    Actions.pop();
  }

  openImagePickerModal() {
    if (Platform.OS === 'ios') {
      Alert.alert('', 'Please select option', [
        { text: 'Take Photo', onPress: async () => await this.openCamera() },
        { text: 'Choose from Library', onPress: async () => await this.launchImageLibraryonTap() },
        { text: 'Close', onPress: () => console.log('dismissing alert') },
      ]);
    } else {
      Alert.alert('', 'Please select option', [
        { text: 'Close', onPress: () => console.log('dismissing alert') },
        { text: 'Choose from Library', onPress: async () => await this.launchImageLibraryonTap() },
        { text: 'Take Photo', onPress: async () => await this.openCamera() },
      ]);
    }
  }

  async openCamera() {
    if (Platform.OS == 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.launchCameraOnTap();
      }
    } else {
      this.launchCameraOnTap();
    }
  }

  async launchCameraOnTap() {
    const options = {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 1,
      mediaType: 'photo',
      storageOptons: {
        skipBackup: true,
      },
    };
    var self = this;

    await launchCamera(options, (response) => {
      AppUtils.console('Response = ', response);
      console.log('CheckResponse', response);
      if (response.didCancel) {
        AppUtils.console('User cancelled photo picker');
      } else if (response.error) {
        AppUtils.console('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        AppUtils.console('User tapped custom button: ', response.customButton);
      } else {
        let source = { uri: response.assets[0].uri };
        if (Platform.OS == 'ios') {
          self.setState({
            clinicProfile: source.uri,
          });
          self.uploadImage(response);
        } else {
          self.setState({
            clinicProfile: source.uri,
          });
          self.uploadImage(response);
        }
      }
    });
  }

  async launchImageLibraryonTap() {
    const options = {
      quality: Platform.OS === 'ios' ? 0 : 1,
      maxWidth: 1000,
      maxHeight: 1000,
      storageOptons: {
        skipBackup: true,
      },
    };

    var self = this;
    await launchImageLibrary(options, (response) => {
      AppUtils.console('Response = ', response);
      if (response.didCancel) {
        AppUtils.console('User cancelled photo picker');
      } else if (response.error) {
        AppUtils.console('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        AppUtils.console('User tapped custom button: ', response.customButton);
      } else {
        let source = { uri: response.assets[0].uri };
        if (Platform.OS == 'ios') {
          self.setState({
            clinicProfile: source.uri,
          });
          self.uploadImage(response);
        } else {
          self.setState({
            clinicProfile: source.uri,
          });
          self.uploadImage(response);
        }
      }
    });
  }

  async uploadImage(response) {
    var self = this;
    let imageInfo = response.assets[0];
    var source = imageInfo.uri;
    const form = new FormData();
    var imgObj = {
      name: imageInfo.fileName ? imageInfo.fileName : 'XXXXX.jpg',
      uri: source,
      type: imageInfo.type,
    };
    form.append('image', imgObj);
    console.log('Check imgObj', imgObj);
    self.setState({ isLoading: true });
    try {
      let sResp = await SHApiConnector.newUserProfilePic(form);
      if (sResp.data.status) {
        console.log('Check upload Response', sResp.data.profilePicUrl);
        self.setState({ isLoading: false, profilePicURL: sResp.data.profilePicUrl }, () => {
          AppUtils.console('SNCKSHCKGVHKS:', self.state);
        });
      }
    } catch (e) {
      self.setState({ isLoading: false });
      AppUtils.console('e:', e);
    }
  }

  callOnSuccess = ({ firstname, lastname, mobilenumber, email, dob, gender, profileurl, healthid, healthidnumber } = {}) => {
    this.setState({
      fName: firstname,
      lName: lastname,
      gender: gender,
      email: email,
      abhaId: healthid,
      abhaNumber: healthidnumber,
      DOB: dob,
      mobileNumber: mobilenumber,
    });
    this.setGender(gender);
  };

  emailHandler = async (e) => {
    const googleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
    console.log(e, 'input');
    // const text = e.nativeEvent.text;
    // console.log(text,'text')
    if (!googleUserData) {
      this.setState({ email: e });
    }
  };

  onSelect = async (value) => {
    this.setState({
      cca2: value.cca2,
      countryCode: value.callingCode[0],
      numberLimit: value.callingCode[0] == '91' ? 10 : value.callingCode[0] == '65' ? 8 : value.callingCode[0] == '62' ? 13 : 12,
      isCountryListVisible: false,
      mobileNumber: '',
    });
    try {
      const data = {
        country: value.name,
      };
      const getIdTypesResponse = await SHApiConnector.getIdList(data);
      const idTypes = getIdTypesResponse?.data?.data?.idTypes;
      if (idTypes) {
        const dataIdentificationType = idTypes.map((item) => {
          return { value: item.identificationType.toUpperCase() };
        });

        this.setState({ userIdTypes: dataIdentificationType, selectedId: idTypes });
      }
    } catch (error) {
      console.error('Error fetching ID types:', error);
    }
  };

  render() {
    AppUtils.console('props onslancndjnc:', this.state.isNewUser);
    let parentMargin = 16;
    let parentWidth = AppUtils.screenWidth - parentMargin * 2;
    let parentHeight = PixelRatio.getPixelSizeForLayoutSize(25);
    let cCodeWidth = PixelRatio.getPixelSizeForLayoutSize(25);
    const { isNewUser } = this.state;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          width: width,
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <KeyboardAwareScrollView
          style={{
            height: height,
            width: width,
            backgroundColor: AppColors.whiteColor,
          }}
        >
          {Platform.OS === 'ios' ? this.openIOSCalender() : this.openAndroidCalender()}

          <View
            style={{
              height: verticalScale(150),
              width: width,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableHighlight onPress={() => this.openImagePickerModal()} underlayColor="transparent">
              <Image
                style={{
                  height: moderateScale(100),
                  width: moderateScale(100),
                  borderRadius: moderateScale(50),
                }}
                source={{ uri: AppUtils.handleNullImg(this.state.clinicProfile) }}
              />
            </TouchableHighlight>
          </View>

          <ScrollView style={styles.registration} showsVerticalScrollIndicator={false}>
            <TextInput
              allowFontScaling={false}
              placeholder={strings('doctor.text.firstName')}
              style={styles.inputStyle}
              value={this.state.fName}
              placeholderTextColor={AppColors.textGray}
              onChangeText={(input) => this.setState({ fName: input })}
              returnKeyType={'next'}
              underlineColorAndroid={'white'}
              onSubmitEditing={(event) => this.refs.LastName.focus()}
            />
            <TextInput
              allowFontScaling={false}
              ref="LastName"
              placeholder={strings('doctor.text.lastName')}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              value={this.state.lName}
              onChangeText={(input) => this.setState({ lName: input })}
              returnKeyType={'next'}
              underlineColorAndroid={'white'}
            />
            <View>
              {isNewUser ? (
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      height: hp(6),
                      width: wp('95'),
                      marginTop: hp(2),
                      borderBottomWidth: 1,
                      borderColor: AppColors.backgroundGray,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        alignItems: 'center',
                        alignSelf: 'center',
                        marginLeft: wp(1),
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <FlagButton
                        withCountryNameButton={!this.state.isCountryListVisible}
                        withCallingCodeButton={!this.state.isCountryListVisible}
                        containerButtonStyle={{
                          marginTop: Platform.OS === 'ios' ? hp(0.6) : hp(1.2),
                          fontFamily: AppStyles.fontFamilyBold,
                          fontSize: 15,
                          flex: 5,
                        }}
                        onOpen={() => this.setState({ isCountryListVisible: true })}
                        withEmoji={!this.state.isCountryListVisible}
                        withFlag={!this.state.isCountryListVisible}
                        countryCode={this.state.cca2}
                      />
                      {this.state.isCountryListVisible ? (
                        <CountryPicker
                          //countryCodes={['SG', 'IN']}
                          //countryCodes={["SG", "IN", "MY", "TH", "ID", "ZA"]}

                          visible={this.state.isCountryListVisible}
                          closeable
                          withFilter
                          withFlag
                          withCallingCode
                          withCountryNameButton
                          onClose={() => this.setState({ isCountryListVisible: false })}
                          onSelect={this.onSelect}
                          cca2={this.state.cca2}
                          translation="eng"
                        />
                      ) : null}
                      <TouchableHighlight
                        underlayColor={'transparent'}
                        onPress={() => this.setState({ isCountryListVisible: true })}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                          alignSelf: 'center',
                          marginRight: wp(2),
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Image
                          style={{
                            alignSelf: 'center',
                            width: wp(4),
                            height: wp(4),
                          }}
                          source={require('../../../assets/images/arrow_down.png')}
                        />
                      </TouchableHighlight>
                    </View>
                  </View>
                  <TextInput
                    allowFontScaling={false}
                    ref="Mobile Number"
                    placeholder={strings('common.common.mobNumber')}
                    style={{ ...styles.ninputStyle }}
                    placeholderTextColor={AppColors.textGray}
                    maxLength={this.state.numberLimit}
                    keyboardType="number-pad"
                    value={this.state.mobileNumber}
                    onChangeText={(input) => this.setState({ mobileNumber: input })}
                    returnKeyType={'next'}
                    underlineColorAndroid={'white'}
                  ></TextInput>
                </View>
              ) : (
                <View />
              )}
            </View>
            {this.state.enableAbha && this.state.countryCode == '91' && (this.state.abhaId === '' || this.state.abhaNumber === '') && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: verticalScale(10),
                  flexDirection: 'column',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <TextInput
                    allowFontScaling={false}
                    ref="generate_abha"
                    flex={1}
                    placeholder={strings('common.abha.abha_optional')}
                    style={styles.inputStyle}
                    placeholderTextColor={AppColors.textGray}
                    autoCapitalize={'none'}
                    onChangeText={(input) => {
                      this.setState({ searchAbha: input });
                    }}
                    underlineColorAndroid={'white'}
                  />

                  <SHButtonDefault
                    btnText={'Search'}
                    btnType={'normal'}
                    style={styles.searchButton}
                    btnTextColor={AppColors.whiteColor}
                    btnPressBackground={AppColors.primaryColor}
                    onBtnClick={() => {
                      this.searchAbhaDetails();
                    }}
                  />
                </View>

                {this.state.searchAbha === '' && (
                  <SHButtonDefault
                    btnText={strings('common.abha.generate')}
                    btnType={'normal'}
                    style={{
                      alignSelf: 'center',
                      borderRadius: wp(2),
                      height: hp(4),
                      width: wp(35),
                      marginTop: hp(3),
                    }}
                    btnTextColor={AppColors.whiteColor}
                    btnPressBackground={AppColors.primaryColor}
                    onBtnClick={() => {
                      Actions.AbhaRegistration({
                        onSuccess: this.callOnSuccess,
                      });
                    }}
                  />
                )}
              </View>
            )}

            {this.state.enableAbha && this.state.abhaNumber !== '' && (
              <TextInput
                allowFontScaling={false}
                ref="abhaNumber"
                style={styles.inputStyle}
                value={this.state.abhaNumber}
                editable={false}
                returnKeyType={'next'}
                underlineColorAndroid={'white'}
              />
            )}

            {this.state.enableAbha && this.state.abhaId !== '' && (
              <TextInput
                allowFontScaling={false}
                ref="abhaId"
                style={styles.inputStyle}
                value={this.state.abhaId}
                editable={false}
                returnKeyType={'next'}
                underlineColorAndroid={'white'}
              />
            )}
            {!this.props?.userDetail && (
              <>
                <PasswordInputText
                  refs="password"
                  label=""
                  placeholder={strings('common.common.password')}
                  style={[styles.inputStyle, { borderBottomWidth: 0, marginTop: 0 }]}
                  placeholderTextColor={AppColors.textGray}
                  autoCapitalize={'none'}
                  secureTextEntry={true}
                  value={this.state.password}
                  onChangeText={(input) => this.setState({ password: input })}
                  returnKeyType={'next'}
                  underlineColorAndroid={'transparent'}
                  activeLineWidth={0}
                />

                <PasswordInputText
                  refs="confirmPassword"
                  label=""
                  placeholder={strings('common.common.confirmPassword')}
                  style={[styles.inputStyle, { borderBottomWidth: 0, marginTop: 0 }]}
                  placeholderTextColor={AppColors.textGray}
                  autoCapitalize={'none'}
                  secureTextEntry={true}
                  value={this.state.confirmPassord}
                  onChangeText={(input) => this.setState({ confirmPassord: input })}
                  returnKeyType={'next'}
                  underlineColorAndroid={'transparent'}
                  activeLineWidth={0}
                />
              </>
            )}

            <TextInput
              allowFontScaling={false}
              ref="email"
              placeholder={strings('common.common.email')}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              autoCapitalize={'none'}
              value={this.state.email}
              onChangeText={(input) => this.setState({ email: input })}
              returnKeyType={'next'}
              underlineColorAndroid={this.props?.userDetail?.googleUserData || this.props?.userDetail?.appleUserData ? '#F3F3F3' : 'white'}
              selectTextOnFocus={this.props?.userDetail && false}
              editable={this.props?.userDetail && false}
              backgroundColor={this.props?.userDetail && '#F3F3F3'}
            />
            {this.state.userIdTypes.length > 0 && (
              <View style={styles.idContainer}>
                <View style={{ marginLeft: wp(0.5), marginRight: wp(0.5) }}>
                  <Text style={styles.labelStyle}>User Identification</Text>
                  <TouchableOpacity
                    style={{
                      marginTop: hp(2),
                      height: hp(6),
                      justifyContent: 'center',
                      fontFamily: AppStyles.fontFamilyRegular,
                      borderWidth: hp(0.2),
                      borderColor: AppColors.backgroundGray,
                      borderRadius: hp(1),
                      width: wp(90),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Dropdown
                      ref={'identificationtypeDropdown'}
                      label=""
                      textColor={AppColors.blackColor}
                      itemColor={AppColors.blackColor}
                      fontFamily={AppStyles.fontFamilyRegular}
                      // dropdownPosition={-5}
                      dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                      itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                      rippleCentered={false}
                      dropdownMargins={{ min: 8, max: 16 }}
                      baseColor={'transparent'}
                      value={'Identification Type'}
                      pickerStyle={{
                        width: wp(89),
                        height: 'auto',
                      }}
                      containerStyle={{
                        width: wp(80),
                        marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                        justifyContent: 'center',
                      }}
                      data={this.state.userIdTypes}
                      onChangeText={this.handleChange}
                    />

                    <Image
                      resizeMode={'contain'}
                      style={{ height: hp(2.5), width: hp(2.5) }}
                      source={require('../../../assets/images/arrow_down.png')}
                    />
                  </TouchableOpacity>
                </View>

                {this.state.showInput && (
                  <TextInput
                    allowFontScaling={false}
                    ref="referral"
                    autoCapitalize={'none'}
                    placeholder={'ID Number'}
                    style={styles.inputStyle}
                    placeholderTextColor={AppColors.textGray}
                    value={this.state.userIdNum}
                    maxLength={50}
                    returnKeyType={'next'}
                    underlineColorAndroid={'white'}
                    onChangeText={(input) => this.setState({ userIdNum: input })}
                  ></TextInput>
                )}
              </View>
            )}

            <TouchableHighlight onPress={() => this.openCalender()} underlayColor="transparent">
              <View style={styles.dobStyle}>
                <TouchableHighlight
                  onPress={() => {
                    this.setState({ DOB: '16-May-1997' });
                  }}
                >
                  <Text style={styles.dobText}>{strings('doctor.text.dob')}</Text>
                </TouchableHighlight>
                <Text style={styles.date}>{moment(this.state.DOB).format('DD-MMM-YYYY')}</Text>
              </View>
            </TouchableHighlight>
            <View style={styles.genderView}>
              <Text style={styles.selectGender}>{strings('doctor.text.gender')}</Text>
              <Text style={[styles.male, { color: this.state.maleTextColor }]} onPress={() => this.setGender('Male')}>
                {strings('doctor.text.male')}
              </Text>
              <Text style={[styles.female, { color: this.state.femaleTextColor }]} onPress={() => this.setGender('Female')}>
                {strings('doctor.text.female')}
              </Text>
            </View>
            <View style={bmiStyles.bmiRow}>
              <Text style={bmiStyles.bmiHeader}>
                {strings('doctor.text.weight')} ({strings('doctor.text.optional')})
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  placeholder="0"
                  style={bmiStyles.bmiInput}
                  value={this.state.weight.toString()}
                  textContentType={'telephoneNumber'}
                  keyboardType={'numeric'}
                  onChangeText={(val) => {
                    console.log(val);
                    if (val === '' || reg.test(val)) this.setState({ weight: val });
                  }}
                  maxLength={3}
                />
                <View style={bmiStyles.bmiOptionHolder}>
                  <Text
                    style={[bmiStyles.weightOption, this.state.weightType === 'kgs' ? bmiStyles.selected : {}]}
                    onPress={() => {
                      if (this.state.weightType === 'lbs' && this.state.weight) {
                        const wt = Math.round(Number(this.state.weight) / 2.2046);
                        this.setState({ weightType: 'kgs', weight: wt.toString() });
                      } else {
                        this.setState({ weightType: 'kgs' });
                      }
                    }}
                  >
                    kgs
                  </Text>
                  <Text
                    style={[bmiStyles.weightOption, this.state.weightType === 'lbs' ? bmiStyles.selected : {}]}
                    onPress={() => {
                      if (this.state.weightType === 'kgs' && this.state.weight) {
                        const wt = Math.round(Number(this.state.weight) * 2.2046);
                        this.setState({ weightType: 'lbs', weight: wt.toString() });
                      } else {
                        this.setState({ weightType: 'lbs' });
                      }
                    }}
                  >
                    lbs
                  </Text>
                </View>
              </View>
            </View>
            <View style={bmiStyles.bmiRow}>
              <Text style={bmiStyles.bmiHeader}>
                {strings('doctor.text.height')} ({strings('doctor.text.optional')})
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  placeholder="0"
                  style={bmiStyles.bmiInput}
                  value={this.state.height.toString()}
                  textContentType={'telephoneNumber'}
                  keyboardType={'numeric'}
                  maxLength={5}
                  onChangeText={(val) => {
                    console.log(val.length);
                    const { height, heightType } = this.state;
                    if (heightType === 'cms') {
                      if (val === '' || reg.test(val)) this.setState({ height: val });
                    } else {
                      if (val.length < 2) {
                        if (height.length > val.length) {
                          this.setState({ height: val });
                        } else {
                          if (Number(val) < 1) {
                            return;
                          } else {
                            if (val === '' || reg.test(val)) this.setState({ height: `${val}'` });
                          }
                        }
                      } else if (val.length === 2) {
                        if (height.length > val.length) {
                          this.setState({ height: val });
                        }
                      } else if (val.length === 3) {
                        if (height.length > val.length) {
                          this.setState({ height: val });
                        } else {
                          const rem = val.split("'")[1];
                          if (Number(rem) > 1) {
                            if (reg.test(Number(rem))) {
                              this.setState({ height: `${height}0${Number(rem)}"` });
                            }
                          } else {
                            if (reg.test(Number(rem))) {
                              this.setState({ height: `${height}${Number(rem)}` });
                            }
                          }
                        }
                      } else if (val.length === 4) {
                        console.log(val);
                        if (height.length > val.length) {
                          this.setState({ height: val });
                        } else {
                          const rem = val.split("'")[1];
                          if (Number(rem) < 12) {
                            if (reg.test(Number(rem))) {
                              this.setState({ height: `${height}${Number(rem) % 10}"` });
                            }
                          }
                        }
                      }
                    }
                  }}
                />
                <View style={bmiStyles.bmiOptionHolder}>
                  <Text
                    style={[bmiStyles.weightOption, this.state.heightType === 'cms' ? bmiStyles.selected : {}]}
                    onPress={() => {
                      const { height, heightType } = this.state;
                      if (heightType === 'ft' && height) {
                        let [ft, inch] = height.split("'");
                        ft = Number(ft);
                        inch = Number(inch?.split('"')[0] || 0);
                        const ht = Math.round(ft * 30.48) + Math.round(inch * 2.54);
                        this.setState({ heightType: 'cms', height: `${ht}` });
                      } else {
                        this.setState({ heightType: 'cms' });
                      }
                    }}
                  >
                    cms
                  </Text>
                  <Text
                    style={[bmiStyles.weightOption, this.state.heightType === 'ft' ? bmiStyles.selected : {}]}
                    onPress={() => {
                      const { height, heightType } = this.state;
                      if (heightType === 'cms' && height) {
                        const realFeet = (height * 0.3937) / 12;
                        const ft = Math.floor(realFeet);
                        const inch = Math.round((realFeet - ft) * 12);
                        this.setState({ heightType: 'ft', height: `${ft}'${inch > 9 ? inch : '0' + inch}"` });
                      } else {
                        this.setState({ heightType: 'ft' });
                      }
                    }}
                  >
                    ft
                  </Text>
                </View>
              </View>
            </View>

            <TextInput
              allowFontScaling={false}
              ref="referral"
              autoCapitalize={'none'}
              placeholder={strings('common.common.companyName')}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              value={this.state.companyName}
              maxLength={50}
              onChangeText={(input) => this.setState({ companyName: input })}
              returnKeyType={'next'}
              underlineColorAndroid={'white'}
            ></TextInput>

            <TextInput
              allowFontScaling={false}
              ref="referral"
              placeholder={strings('common.common.referral')}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              value={this.state.referral}
              onChangeText={(input) => this.setState({ referral: input })}
              returnKeyType={'next'}
              underlineColorAndroid={'white'}
            ></TextInput>
          </ScrollView>

          <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        </KeyboardAwareScrollView>
        {this.footer()}
      </View>
    );
  }

  footer() {
    return (
      <View style={styles.buttonView}>
        <SHButtonDefault
          btnText={
            this.state.isNewUser
              ? this.props.userDetail?.googleUserData || this.props.userDetail?.appleUserData
                ? 'hi'
                : strings('common.common.register')
              : strings('common.common.addInfo')
          }
          btnType={'normal'}
          style={{
            flex: 1,
            // marginTop: verticalScale(30),
            alignSelf: 'center',
            borderRadius: wp(2),
          }}
          btnTextColor={AppColors.whiteColor}
          btnPressBackground={AppColors.primaryColor}
          onBtnClick={() => this.validateData()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  registration: {
    margin: Platform.OS === 'ios' ? moderateScale(12) : moderateScale(10),
  },
  labelStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.grey,
    // height: verticalScale(50),
    marginTop: verticalScale(10),
    textAlign: isRTL ? 'right' : 'left',
  },
  idContainer: {
    //  height:'auto',
    //  width : wp * .9,
    borderWidth: 1,
    borderColor: AppColors.grey,
    marginLeft: wp(0.5), 
    marginRight: wp(0.5)
  },
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.backgroundGray,
    marginTop: verticalScale(10),
    textAlign: isRTL ? 'right' : 'left',
  },
  ninputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.backgroundGray,
    marginTop: verticalScale(10),
    width: wp(100),
    marginLeft: wp(6.5),
    textAlign: isRTL ? 'right' : 'left',
  },
  dobStyle: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: AppColors.backgroundGray,
    margin: moderateScale(1),
  },
  dobStyle1: {
    flexDirection: 'row',
    height: verticalScale(70),
    alignItems: 'center',
    borderBottomColor: AppColors.backgroundGray,
    margin: moderateScale(1),
  },

  dobText: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
    marginTop: verticalScale(20),
  },
  date: {
    borderBottomWidth: 0,
    width: moderateScale(150),
    marginLeft: moderateScale(100),
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
  },
  NRIC: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.backgroundGray,
    marginTop: verticalScale(20),
  },
  genderView: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.backgroundGray,
    alignItems: 'center',
  },
  selectGender: {
    width: moderateScale(60),
    color: AppColors.blackColor,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    marginTop: verticalScale(20),
  },
  male: {
    marginLeft: moderateScale(150),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.primaryGray,
    marginTop: verticalScale(20),
  },
  female: {
    marginLeft: moderateScale(20),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
  },
  buttonView: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: moderateScale(30),
  },
  itemText: {
    height: verticalScale(40),
    fontSize: 20,
    margin: 2,
    alignSelf: 'flex-start',
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  picker: {
    height: Platform.OS === 'ios' ? verticalScale(100) : verticalScale(50),
    marginTop: verticalScale(22),
    borderBottomWidth: 1,
    color: AppColors.blackColor,
  },
  switchStyle: {
    marginLeft: moderateScale(120),
    alignSelf: 'center',
  },
  holderText: {
    color: AppColors.primaryGray,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    margin: moderateScale(5),
  },
  searchButton: {
    alignSelf: 'center',
    borderRadius: wp(2),
    height: hp(4),
    width: wp(20),
    position: 'absolute',
    right: 0,
  },
});

export default UserSignUp;
