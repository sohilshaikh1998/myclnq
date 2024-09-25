import React, { Component } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  I18nManager,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-community/async-storage';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppColors } from '../../shared/AppColors';
import { AppStrings } from '../../shared/AppStrings';
import { AppStyles } from '../../shared/AppStyles';
import AddressView from '../../shared/AddressView';
import AddOrUpdateAddress from '../../shared/AddOrUpdateAddress';
import SelectAddressModal from '../../shared/SelectAddressModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import countryList from '../../../assets/jsonFiles/coutryList.json';
import { AppUtils } from '../../utils/AppUtils';
import { Actions } from 'react-native-router-flux';
import { Dropdown } from 'react-native-material-dropdown';
import ProgressLoader from 'rn-progress-loader';
import { heightPercentageToDP, heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import careGiverHomeScreenStyle from '../caregiver/caregiverHome/caregiverHomeScreenStyle';
import moment from 'moment';
import images from '../../utils/images';
import DateTimePicker from '@react-native-community/datetimepicker';
//import DatePicker from 'react-native-date-picker';
import { getTimeZone } from 'react-native-localize';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import ElevatedView from 'react-native-elevated-view';
import SHButtonDefault from '../../shared/SHButtonDefault';
import ModalSelector from '../../shared/ModalSelector';
import { Switch } from 'react-native-switch';
import { Validator } from '../../shared/Validator';
import Toast from 'react-native-simple-toast';
import index from 'react-phone-number-input';
import Geolocation from '@react-native-community/geolocation';
import bmiStyles from '../../styles/bmiStyles';
const isRTL = I18nManager.isRTL;
let dt = new Date();
dt.setDate(dt.getDate());
let _dt = dt;
const reg = /^[1-9][0-9]*$/;
import { CachedImage, ImageCacheProvider } from '../../cachedImage';
import CountryPicker, { FlagButton } from 'react-native-country-picker-modal';
import { strings } from '../../locales/i18n';
import { AppArray } from '../../utils/AppArray';

const relationData = [
  { key: relIndex++, section: true, label: 'Select Relation' },

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
let insIndex = 0,
  relIndex = 0;

const { width, height } = Dimensions.get('window');
const hour = [
  { value: '01' },
  { value: '02' },
  { value: '03' },
  { value: '04' },
  { value: '05' },
  { value: '06' },
  { value: '07' },
  { value: '08' },
  { value: '09' },
  { value: '10' },
  { value: '11' },
  { value: '12' },
];
const min = [{ value: '00' }, { value: '15' }, { value: '30' }, { value: '45' }];

const ampm = [{ value: 'AM' }, { value: 'PM' }];

const confirmLogo = require('../../../assets/images/confirm_icon.png');

const sortBy = [
  {
    value: 'All',
  },
  {
    value: 'Male',
  },
  {
    value: 'Female',
  },
];
const languageBy = [];
export default class QuickRequest extends Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('QuickRequest');
    let dateWithAdditionalTime = moment(new Date()).add(30, 'minutes');
    let roundMin = 15 - (dateWithAdditionalTime.minute() % 15);
    this.getInsuranceProviders = this.getInsuranceProviders.bind(this);
    let selectedMin = moment(dateWithAdditionalTime).add(roundMin, 'minutes').format('mm');
    let selectedHour = moment(dateWithAdditionalTime).format('hh');
    let selectedAMPM = moment(dateWithAdditionalTime).format('A');
    if (selectedMin === '00') {
      if (selectedHour === '11') {
        selectedAMPM = selectedAMPM === 'PM' ? 'AM' : 'PM';
      }
      if (selectedHour === '11') {
        selectedHour = '12';
      } else {
        selectedHour = parseInt(selectedHour) + 1;
        if (selectedHour < 10) {
          selectedHour = '0' + selectedHour;
        }
      }
    }

    this.state = {
      consultationType: this.props.consultType === 'house' ? 'IN_HOUSE_CALL' : 'VIDEO',
      isLoading: false,
      selectedDate: AppUtils.currentDateTime(),
      showCalender: false,
      selectedSpecialityId: null,
      selectedSpeciality: null,
      selectedHour: selectedHour,
      selectedMin: selectedMin,
      selectedAMPM: selectedAMPM,
      selectedDateTime: dateWithAdditionalTime,
      doctorList: [],
      selectedSessionIndex: 0,
      selectedDoctor: null,
      userRelativeList: [],
      isConsentModel: false,
      selectedUserRelative: null,
      countryCode: '65',
      cca2: 'SG',
      countryName: 'Singapore',
      userCountryCode: '65',
      symptoms: '',
      page: 1,
      confirmation: false,
      clinicLogo: '',
      patientName: '',
      queueNumber: '',
      doctorName: '',
      appointmentDate: '',
      clinicName: '',
      clinicAddress: '',
      query: '',
      isAddNewRelative: false,
      fName: '',
      lName: '',
      dob: _dt,
      NRIC: '',
      relation: '',
      relationText: '',
      gender: '',
      insuranceNumber: '',
      insuranceText: '',
      maleTextColor: '#d3d3d3',
      femaleTextColor: '#d3d3d3',
      toggled: false,
      isPatientSelected: false,
      relationData: relationData,
      otherRelationData: otherRelationData,
      departmentListForDropdown: [],
      relativeId: '',
      insurancePId: '',
      insuranceCompanyName: 'Select Insurance',
      isDataSet: false,
      insuranceProviders: [],
      showDOB: false,
      languageListForDropDown: [],
      addressList: [],
      languageList: [],
      selectedGender: 'All',
      selectedLanguage: 'All',
      selectedAddress: {},
      isAddAddressOpen: false,
      isAddressOpen: false,
      updateAddressData: {},
      currentAddress: true,
      symptomList: [],
      selectedSymptoms: [],
      addSymptoms: '',
      defaultLat: 0,
      defaultLong: 0,
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      corporatePlanCount: 0,
      clinicHospitalList: [],
      filteredDoctorList: [],
      selectedClinicOrHospital: 'All',
      userIdTypes: '',
      userId: '',
      userIdNum: '',
      showInput: false,
      selectedId: '',
    };
  }

  componentWillMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        Actions.pop();
        return true;
      });
    }
  }
  async componentDidMount() {
    this.setInitialSymptoms();
    this.getInsuranceProviders();
    this.getUserAddress();
    this.setUserIDTypes();
    let data = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER));
    let countryCode = data.countryCode;
    this.setState({ userCountryCode: countryCode }, () => this.setCountry(countryCode));

    this.getCorporateUserDetails(data);
    if (this.props.consultType === 'house') {
      this.selectConsultationType('IN_HOUSE_CALL', false);
      this.setDefaultLocation();
    }

    if (Platform.OS === 'ios') {
      this.setSearchLocation();
    } else {
      this.locationPermissionsAccess(); //for Android
    }
  }

  async setUserIDTypes() {
    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);
    this.setState({ isJustLoginUser: user.isJustLoginUser, countryCode: user.countryCode });
    const data = {
      country: user.country,
    };
    const getIdTypesResponse = await SHApiConnector.getIdList(data);
    const idTypes = getIdTypesResponse?.data?.data?.idTypes;

    if (idTypes) {
      const dataIdentificationType = idTypes.map((item) => {
        return { value: item.identificationType.toUpperCase() };
      });

      this.setState({ userIdTypes: dataIdentificationType, selectedId: idTypes });
    }
  }
  async getCorporateUserDetails(userData) {
    var self = this;
    self.setState({ isLoading: true });
    if (userData.company == null || userData.company == undefined) {
      self.setState({ isLoading: false });
    } else {
      this.getCorporatePlanStatus();
      self.setState({ isLoading: false });
    }
  }

  async getCorporatePlanStatus() {
    let response = await SHApiConnector.getUserCorporatePlanStatus();
    if (response.data.status == 'success') {
      console.log('QuickRequest.js: CorproatePlanCount2', JSON.stringify(response.data));
      this.setState({ corporatePlanCount: response.data.data.packageCount });
    } else {
      this.setState({ corporatePlanCount: 0 });
    }
  }

  setDateTime(consultationType) {
    let dateWithAdditionalTime = consultationType === 'IN_HOUSE_CALL' ? moment(new Date()).add(1, 'hours') : moment(new Date()).add(30, 'minutes');
    let roundMin = 15 - (dateWithAdditionalTime.minute() % 15);
    this.getInsuranceProviders = this.getInsuranceProviders.bind(this);
    let selectedMin = moment(dateWithAdditionalTime).add(roundMin, 'minutes').format('mm');
    let selectedHour = moment(dateWithAdditionalTime).format('hh');
    let selectedAMPM = moment(dateWithAdditionalTime).format('A');

    this.setState({
      dateWithAdditionalTime: dateWithAdditionalTime,
      selectedMin: selectedMin,
      selectedHour: selectedHour,
      selectedAMPM: selectedAMPM,
    });

    if (selectedMin === '00') {
      if (selectedHour === '11') {
        const updatedSelectedAMPM = selectedAMPM === 'PM' ? 'AM' : 'PM';
        this.setState({ selectedAMPM: updatedSelectedAMPM });
      }
      if (selectedHour === '11') {
        this.setState({ selectedHour: 12 });
      } else {
        selectedHour = parseInt(selectedHour) + 1;
        if (selectedHour < 10) {
          const updatedSelectedHour = '0' + selectedHour;
          this.setState({ selectedHour: updatedSelectedHour });
        }
      }
    }
  }

  setSearchLocation() {
    var self = this;
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          AppUtils.console('LocationPermissionSearchLoc', position);
          AppUtils.console('LocationPermissionLatLong', position.coords);

          self.setState({
            defaultLat: position.coords.latitude,
            defaultLong: position.coords.longitude,
          });
        },
        (error) => {
          AppUtils.console('LocationPermissionError', error);
          self.setDefaultLocation();
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
      );
    } catch (err) {
      AppUtils.console('LocationPermissionError', err);
    }
  }
  locationPermissionsAccess() {
    AppUtils.console('LocationPermission', Actions.currentScene);
    (async () => {
      {
        try {
          const always_permission =
            Platform.OS === 'ios'
              ? await check(PERMISSIONS.IOS.LOCATION_ALWAYS)
              : await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

          const when_in_use_permission =
            Platform.OS === 'ios'
              ? await check(PERMISSIONS.IOS.LOCATION_ALWAYS)
              : await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

          let granted = Platform.OS === 'ios' ? RESULTS.GRANTED : PermissionsAndroid.RESULTS.GRANTED;

          AppUtils.console('LocationPermission', always_permission, when_in_use_permission, granted);

          if (always_permission === granted || when_in_use_permission === granted) {
            Geolocation.getCurrentPosition(
              (position) => {
                AppUtils.console('LocationPermissionAccessLatLong', position.coords);

                this.setSearchLocation();
              },
              (error) => {
                AppUtils.console('LocationPermissionErr', error);
                this.setDefaultLocation();
              },
              {}
            );
          } else {
            if (Actions.currentScene == 'QuickRequest') {
              if (Platform.OS === 'ios') {
                Alert.alert(
                  strings('doctor.alertTitle.location'),
                  strings('doctor.alertMsg.locPermissionForClinic'),
                  [
                    {
                      text: strings('doctor.button.cancel'),
                      onPress: () => AppUtils.console('Permission Denied'),
                      style: 'cancel',
                    },
                    {
                      text: strings('doctor.button.allow'),
                      onPress: () => {
                        Geolocation.requestAuthorization();
                      },
                    },
                  ],
                  { cancelable: false }
                );
              } else {
                this.requestLocationPermissionForAndroid();
              }
            }
          }
        } catch (err) {
          AppUtils.console('LocationPermissionErr', err);
        }
      }
    })();
  }
  setDefaultLocation() {
    let region;
    AppUtils.console('LocationCountry', this.state.userCountryCode);
    region = AppUtils.getDefaultLatLong(this.state.userCountryCode);
    AppUtils.console('LocationRegion Lat ', region.latitude, ' Long ', region.longitude);
    this.setState({
      defaultLat: region.latitude,
      defaultLong: region.longitude,
    });
  }

  setCountry(countryCode) {
    let selectedCountry = AppUtils.getCountryDetails(countryCode);
    this.setState({
      countryCode: countryCode,
      cca2: selectedCountry.code,
      countryName: selectedCountry.name,
    });
  }

  setInitialSymptoms() {
    var list = [];
    let symptoms = AppArray.symptoms();
    symptoms.map((symptom) => {
      symptom.isSelected = false;
      list.push(symptom);
    });
    this.setState({
      symptomList: list,
      selectedSymptoms: [],
      addSymptoms: '',
    });
  }

  async requestLocationPermissionForAndroid() {
    const chckLocationPermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (chckLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
      return;
    } else {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          alert(strings('doctor.alertTitle.locPermission'));
        }
      } catch (err) {
        AppUtils.console('Location permission error:', err);
      }
    }
  }

  async getUserAddress() {
    try {
      let addressData = await SHApiConnector.getUserAddress();
      AppUtils.console('Response:', addressData);

      if (addressData.data.status) {
        this.setState(
          {
            addressList: addressData.data.response.userAddress,
            languageList: addressData.data.response.languageList,
          },
          () => this.getSelectedAddress(addressData.data.response.userAddress)
        );
      }

      let departmentList = addressData.data.response.departmentList;
      await departmentList.map((department) => {
        department.value = department.departmentName;
      });
      let List = addressData.data.response.languageList;
      let List1 = [];
      List.map((language) => {
        List1.push({ value: language.language });
      });
      AppUtils.console('videeeee', departmentList);
      this.setState({
        departmentList: addressData.data.response.departmentList,
        departmentListForDropdown: departmentList,
        selectedSpecialityId: departmentList[0]._id,
        selectedSpeciality: departmentList[0].departmentName,
        languageListForDropDown: [{ value: 'All' }].concat(List1),
      });
      AppUtils.console('ResponseLanguage:', this.state.languageListForDropDown);
    } catch (e) {
      AppUtils.console('ResponseLanguageError:', e);
    }
  }

  getSelectedAddress(addressList) {
    AppUtils.console('Address', addressList);
    let selectedAddress = addressList.length > 0 ? addressList[0] : {};
    let isDefaultAddressAvail = false;
    addressList.map((address) => {
      AppUtils.console('zxcsdzxfscx', address);
      if (address.isDefaultAddress) {
        selectedAddress = address;
        isDefaultAddressAvail = true;
      }
    });
    if (!isDefaultAddressAvail && addressList.length > 0) {
      addressList[0].isDefaultAddress = true;
    }
    AppUtils.console('SelectedAddress', selectedAddress);

    this.setState({
      selectedAddress: selectedAddress,
      addressList: addressList,
    });
  }

  getInsuranceProviders() {
    let self = this;
    AppUtils.console('getInsuranceProviders');
    self.setState({
      isLoading: true,
    });
    SHApiConnector.getInsuranceProviders(function (err, stat) {
      self.setState({ isLoading: false });
      try {
        if (stat) {
          let firstValue = {
            companyName: 'Select Insurance',
            _id: '00000000000',
          };
          let data = Platform.OS === 'ios' ? [firstValue, ...stat.status] : stat.status;
          self.setState({
            insuranceProviders: data,
            insurancePId: self.state.insurancePId,
          });
          self.setInsuranceData(self.state.insurancePId);
        }
      } catch (e) {
        console.error('Error:', e);
      }
    });
  }

  setInsuranceData(insuranceKey) {
    let self = this;
    this.state.insuranceProviders.map(function (value) {
      if (insuranceKey == value._id) {
        self.setState({
          insuranceCompanyName: value.companyName,
          insurancePId: insuranceKey,
        });
      }
    });
  }

  async getDepartmentList() {
    try {
      AppUtils.console('getDepartmentList');
      this.setState({ isLoading: true });
      let response = await SHApiConnector.getDepartmentList();
      AppUtils.console('Response:', response);
      this.setState({ isLoading: false });
      if (response.data.error_code && response.data.error_code === '10006') {
        this.showAlert(strings('string.error_code.error_10006'), true);
        // Actions.LoginMobile();
      } else {
        if (response.status === 200) {
          let departmentList = response.data.response;
          await departmentList.map((department) => {
            department.value = department.departmentName;
          });
          this.setState({
            departmentList: response.data.response,
            departmentListForDropdown: departmentList,
          });
        } else {
          Alert.alert('', strings('doctor.alertMsg.checkConnection'), [
            { text: strings('doctor.button.cancel') },
            {
              text: strings('doctor.button.ok'),
              onPress: () => this.getDepartmentList(),
            },
          ]);
        }
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('DEPARTMENT_LIST_ERROR', e);
    }
  }

  selectConsultationType(consultationType, isTeleART) {
    this.setDateTime(consultationType);
    if (this.state.consultationType != consultationType) {
      if (isTeleART) {
        let teleARTIndex = this.state.departmentListForDropdown.findIndex((department) => department.departmentName == 'Tele-ART');
        teleARTIndex != -1 ? this.selectSpeciality(teleARTIndex, this.state.departmentListForDropdown) : null;
      } else {
        this.state.countryCode == '65' ? this.selectSpeciality(0, this.state.departmentListForDropdown) : null;
      }
      this.setState({ consultationType: consultationType }, () => this.getSelectedAddress(this.state.addressList));
    }
  }

  openDateTimeSelector() {
    let maxDate = moment().add(60, 'days');

    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showCalender}
        onRequestClose={this.close}
        animationType={this.props.animationType}
        key={this.state.isReviewListOpen ? 1 : 2}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: hp(100),
            width: wp(100),
            alignSelf: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', width: width - 30 }}>
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
              <TouchableOpacity onPress={() => this.setState({ showCalender: false })}>
                <Image resizeMode={'contain'} style={careGiverHomeScreenStyle.cancelIcon} source={images.cancelIcon} />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? (
              <View style={{ backgroundColor: AppColors.whiteColor }}>
                <DateTimePicker
                  value={this.state.selectedDate}
                  mode={'date'}
                  display={'spinner'}
                  style={{ backgroundColor: AppColors.whiteColor }}
                  minimumDate={AppUtils.currentDateTime()}
                  maximumDate={new Date(maxDate)}
                  onChange={(event, date) => {
                    this.setState({ selectedDate: date });
                  }}
                />
              </View>
            ) : // <DatePicker
            //   date={this.state.selectedDate}
            //   mode={'date'}
            //   style={{
            //     backgroundColor: AppColors.whiteColor,
            //     width: width - 30,
            //   }}
            //   minuteInterval={30}
            //   minimumDate={AppUtils.currentDateTime()}
            //   maximumDate={new Date(maxDate)}
            //   onDateChange={(date) => {
            //     this.setState({ selectedDate: date });
            //   }}
            // />
            null}
            <TouchableHighlight
              onPress={() => {
                this.setState({ showCalender: false });
              }}
              underlayColor="transparent"
            >
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
                  allowFontScaling={false}
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {moment.parseZone(this.state.selectedDate).format('MMM DD YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  checkNextOrSubmit() {
    if (this.state.page === 1) {
      this.state.consultationType != 'IN_HOUSE_CALL' ? this.checkLeadTime(0.5) : this.checkLeadTime(1);
    } else if (this.state.page === 2) {
      !this.state.selectedDoctor ? Alert.alert('', strings('doctor.text.pleaseSelectDoc')) : this.getUserRelativeList();
    } else {
      !this.state.selectedUserRelative
        ? Alert.alert('', strings('common.waitingRoom.plsSelectPatient'))
        : this.state.consultationType === 'IN_HOUSE_CALL'
        ? this.bookRequest()
        : this.setState({ isConsentModel: true });
    }
  }
  checkLeadTime(leadTime) {
    let month = moment(this.state.selectedDate).format('MM');
    let day = moment(this.state.selectedDate).format('DD');
    let year = moment(this.state.selectedDate).format('YYYY');
    let hours = this.state.selectedHour;

    if (this.state.selectedAMPM === 'PM') {
      if (parseInt(hours) < 12) {
        hours = parseInt(hours) + 12;
      }
    } else if (hours == '12' && this.state.selectedAMPM === 'AM') {
      hours = '00';
    }
    let selectedDateTime = moment(new Date(year, parseInt(month) - 1, day, hours, this.state.selectedMin)).tz(getTimeZone());
    let diff = selectedDateTime.diff(AppUtils.currentDateTime());
    let isAddressSelected = this.state.consultationType === 'IN_HOUSE_CALL' && !this.state.selectedAddress.address ? false : true;
    !this.state.selectedSpecialityId
      ? Alert.alert('', strings('doctor.text.selectSpeciality'))
      : !isAddressSelected
      ? Alert.alert(
          strings('string.label.add_address'),
          strings('string.alert.alert_address'),
          [
            {
              text: strings('string.label.cancel'),
              style: 'cancel',
            },
            {
              text: strings('string.label.add_address'),
              onPress: () => this.setState({ isAddAddressOpen: true }),
            },
          ],
          { cancelable: false }
        )
      : diff / (60 * 60000) <= leadTime
      ? leadTime == 1
        ? Alert.alert('', strings('doctor.text.selectWithinOneHour'))
        : Alert.alert('', strings('doctor.text.selectWithinThirtyMinutes'))
      : this.state.consultationType === 'VIDEO'
      ? this.setState({
          isConsentModel: true,
          newSelectedDateTime: selectedDateTime,
        })
      : this.getDoctorList(selectedDateTime, this.state.selectedAMPM);
  }

  getSessionIndex() {
    this.state.selectedDoctor.timing.map((timing, index) => {
      AppUtils.console('xzcszsfsd', timing, index, this.state.selectedDoctor.sessionId);
      if (timing._id === this.state.selectedDoctor.sessionId) {
        AppUtils.console('xzcszsfsd123', timing, index, this.state.selectedDoctor.sessionId);
        this.setState({ selectedSessionIndex: index });
      }
    });
  }

  showConsentAlert() {
    Alert.alert(
      strings('doctor.alertTitle.attention'),
      strings('doctor.alertMsg.regulatoryGuideLines'),
      [
        {
          text: strings('doctor.button.yes'),
          onPress: () => this.bookRequest(),
        },
        {
          text: strings('doctor.button.no'),
          onPress: () => AppUtils.console('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  }

  async bookRequest() {
    let doctorDetails = this.state.selectedDoctor;
    let patientDetails = this.state.selectedUserRelative;
    let self = this;

    if (self.state.corporatePlanCount > 0 && patientDetails.spouse != 'self') {
      alert(
        'Sorry, your corporate plan doesn’t allow appointment booking for relatives. Please use your personal login to book appointments for relatives.'
      );
    } else {
      let symptoms = '';
      this.state.selectedSymptoms.map((symptom, index) => {
        if (index === 0) {
          symptoms = symptom.name;
        } else {
          symptoms = symptoms + ', ' + symptom.name;
        }
      });

      AppUtils.console('sdfxbcvxzdfbccfvx', symptoms);
      let appointmentData = {
        patientData: {
          firstName: patientDetails.firstName,
          lastName: patientDetails.lastName,
          dateOfBirth: moment(patientDetails.dateOfBirth).format('YYYY-MM-DD'),
          profilePic: patientDetails.profilePic,
          gender: patientDetails.gender,
          relation: patientDetails.spouse,
          insuranceProvider: patientDetails.insuranceProvider,
          insuranceNumber: patientDetails.insuranceNumber,
          relativeId: patientDetails._id,
          height: patientDetails.height,
          weight: patientDetails.weight,
          heightType: patientDetails.heightType,
          weightType: patientDetails.weightType,
        },
        appointmentData: {
          callType: this.state.consultationType,
          clinicId: doctorDetails.clinicId,
          clinicName: doctorDetails.clinicName,
          departmentId: this.state.selectedSpecialityId,
          docImage: doctorDetails.profilePic,
          docName: doctorDetails.doctorName,
          docSpeciality: this.state.selectedSpeciality,
          doctorId: doctorDetails._id,
          endHour: doctorDetails.doctorTimings.timings.endHour,
          endMins: doctorDetails.doctorTimings.timings.startMinute,
          isCalender: doctorDetails.isCalender,
          latitude: doctorDetails.geoLocation[1],
          longitude: doctorDetails.geoLocation[0],
          shiftIndex: this.state.selectedSessionIndex,
          shiftSlotId: doctorDetails.sessionId,
          start: this.state.selectedDateTime,
          startHour: doctorDetails.doctorTimings.timings.startHour,
          startMin: doctorDetails.doctorTimings.timings.startMinute,
          timeout: 60,
          symptoms: symptoms,
          isCalenderBasedAppointment: true,
          appointmentState: 'WAITING_CLINIC_CONFIRMATION',
          isConsentForRemoteConsultation: true,
          licenseFor: 'DEPARTMENT',
          addressId: this.state.selectedAddress._id,
          isCrossCountry: this.state.userCountryCode !== this.state.countryCode,
        },
      };
      AppUtils.console('Appoinment Data', appointmentData);
      this.setState({ isLoading: true });
      let fullName = appointmentData.patientData.firstName + ' ' + appointmentData.patientData.lastName;
      let login = appointmentData.patientData.relativeId;
      let password = appointmentData.patientData.relativeId;
      let userData = {
        full_name: fullName,
        login: login,
        password: password,
        color: '#FF4848',
      };
      AppUtils.console('Data:', userData);
      AppUtils.console('Onboarding Successfull', appointmentData);
      SHApiConnector.getUserNameDetails(appointmentData, function (err, stat) {
        try {
          self.setState({ isLoading: false });
          AppUtils.console('Data after Booking:', stat, err);
          if (!err && stat) {
            if (stat.status) {
              AppUtils.positiveEventCount();
              self.setState({
                confirmation: true,
                clinicLogo: stat.appointment.clinicId.clinicLogo,
                patientName: stat.appointment.patientId.firstName,
                queueNumber: stat.appointment.queueNumber,
                doctorName: stat.appointment.doctorId.doctorName,
                appointmentDate: moment(stat.appointment.startTime).format('dddd, MMM DD YYYY'),
                clinicName: stat.appointment.clinicId.clinicName,
                clinicAddress: stat.appointment.clinicId.locationName,
                isDataVisible: true,
                isLoading: false,
              });
            }
            self.openAlert(stat);
          }
        } catch (err) {
          self.setState({ isLoading: false });
          console.error(err);
        }
      });
    }
  }

  openAlert(stat) {
    let self = this;
    if (stat.error_code === '10006') {
      // Actions.LoginMobile({ appointmentData: self.props.appointmentData });
    } else if (stat.error_code === '10002') {
      self.showAlert(strings('string.error_code.error_10002'), true);
    } else if (stat.error_code === '10003') {
      self.showAlert(strings('string.error_code.error_10003'), true);
    } else if (stat.error_code === '10013') {
      self.showAlert(strings('string.error_code.error_10013'), true);
    } else if (stat.error_code === '10014') {
      self.showAlert(strings('string.error_code.error_10014'), true);
    } else if (stat.error_code === '10015') {
      self.showAlert(strings('string.error_code.error_10015'), true);
    } else if (stat.error_code === '10017') {
      self.showAlert(strings('string.error_code.error_10017'), true);
    } else if (stat.error_code === '10021') {
      self.showAlert(strings('string.error_code.error_10021'), true);
    } else if (stat.error_code === '10024') {
      self.showAlert(strings('string.error_code.error_10024'), true);
    } else if (stat.error_code === '10025') {
      if (self.state.isCalender) {
        self.showAlert(strings('string.error_code.error_10025_calendar'), true);
      } else {
        self.showAlert(strings('string.error_code.error_10025'), true);
      }
    } else if (stat.error_code === '10028') {
      if (self.state.isCalender) {
        self.showAlert(strings('string.error_code.error_10028'), true);
      } else {
        self.showAlert(strings('string.error_code.error_10028'), true);
      }
    } else if (stat.error_code === '10029') {
      self.showAlert(strings('string.error_code.error_10029'), true);
    } else if (stat.error_code === '10020') {
      if (self.state.isCalender) {
        self.showAlert(strings('string.error_code.error_10020_calendar'), true);
      } else {
        self.showAlert(strings('string.error_code.error_10020'), true);
      }
    } else if (stat.error_code === '10019') {
      if (self.state.isCalender) {
        self.showAlert(strings('string.error_code.error_10019_calendar'), true);
      } else {
        self.showAlert(strings('string.error_code.error_10019'), true);
      }
    }
  }

  showAlert(msg, ispop) {
    let self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  async getUserRelativeList() {
    try {
      AppUtils.console('getUserRelativeList');
      this.setState({ isLoading: true });
      let response = await SHApiConnector.relativeList();
      this.setState({ isLoading: false });
      AppUtils.console('xcvczdxfv', response);
      console.log('CheckRelatives', response.data.response.relativeDetails);
      if (response.data.status) {
        this.setInitialSymptoms();
        this.setState({
          userRelativeList: response.data.response.relativeDetails,
          page: 3,
        });
      } else {
        setTimeout(() => {
          Alert.alert('', response.data.error_message);
        }, 500);
      }
    } catch (e) {
      AppUtils.console('GET_RELATIVE_LIST_ERROR', e);
    }
  }

  onPressCancelOrPrevious() {
    this.state.page === 1
      ? !this.props.consultType
        ? Actions.HomeScreenDash()
        : Actions.MainScreen()
      : this.state.page === 2
      ? this.setState(
          {
            page: 1,
            selectedDoctor: null,
            selectedUserRelative: null,
          },
          () => this.setCountry(this.state.userCountryCode)
        )
      : this.state.isAddNewRelative
      ? this.setState({ isAddNewRelative: false })
      : this.setState({ page: 2, selectedUserRelative: null });
  }

  async getDoctorList(selectedDateTime, isAMOrPM) {
    AppUtils.console('dvkdvkjdkjv:', moment(selectedDateTime).format('HH'), isAMOrPM);
    let selectedHour = moment(selectedDateTime).format('HH') == 12 && isAMOrPM === 'AM' ? '00' : moment(selectedDateTime).format('HH');
    try {
      let data = {
        departmentId: this.state.selectedSpecialityId,
        start: selectedDateTime,
        videoCall: this.state.consultationType === 'VIDEO',
        audioCall: this.state.consultationType === 'AUDIO',
        inHouse: this.state.consultationType === 'IN_HOUSE_CALL',
        hour: selectedHour,
        minute: this.state.selectedMin,
        isCrossCountry: this.state.userCountryCode !== this.state.countryCode,
        doctorCountryCode: this.state.countryCode,
        page: 1,
        limit: 50,
        gender: this.state.selectedGender === 'Male' ? 'MALE' : this.state.selectedGender === 'Female' ? 'FEMALE' : null,
        language: this.state.selectedLanguage === 'All' ? null : [this.state.selectedLanguage],
      };

      if (this.state.consultationType === 'IN_HOUSE_CALL') {
        AppUtils.console('UserLocation', this.state.selectedAddress.geoLocation[0], ':', this.state.selectedAddress.geoLocation[1]);
        data.longitude = this.state.selectedAddress.geoLocation[0];
        data.latitude = this.state.selectedAddress.geoLocation[1];
      } else {
        data.longitude = this.state.defaultLong;
        data.latitude = this.state.defaultLat;
      }

      AppUtils.console('getDoctorList');
      this.setState({ isLoading: true });
      let response = await SHApiConnector.getDoctorList(data);
      this.setState({ isLoading: false });
      AppUtils.console('doctorList', response);
      if (response.data.status) {
        if (response.data.response.length > 0) {
          this.setState({
            doctorList: response.data.response,
            page: 2,
            selectedDateTime: selectedDateTime,
          });
          let clinicNames = this.state.doctorList.map((item) => item.clinicName);
          let data = [];
          // Add unique clinic names to the array
          clinicNames.forEach((name) => {
            if (!data.some((clinic) => clinic.value === name)) {
              data.push({ value: name });
            }
          });
          let clinicList = data;
          for (let i = 0; i < clinicList.length; i++) {
            if (clinicList[i].value.toLowerCase().includes('wava husada hospital')) {
              let wavaClinic = clinicList.splice(i, 1)[0];
              clinicList.unshift(wavaClinic);

              break;
            }
          }
          clinicList.unshift({ value: 'All' });

          this.setState({ clinicHospitalList: clinicList });
          this.setState({ filteredDoctorList: this.state.doctorList });
        } else {
          AppUtils.console('zfdghsr43etgfc', response);
          this.setState({ doctorList: [], isLoading: false }, () => {
            if (this.state.page == 1) {
              setTimeout(() => {
                Alert.alert('', response.data.message);
              }, 500);
            }
          });
        }
      } else {
        AppUtils.console('zfdghsr43etgfc123', response);
        this.setState({ isLoading: false }, () => {
          setTimeout(() => {
            Alert.alert('', response.data.error_message);
          }, 500);
        });
      }
    } catch (e) {
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 200);
      AppUtils.console('GET_DOCTOR_LIST_ERROR', e);
    }
  }

  handleChange = (value) => {
    this.setState({ userId: value, showInput: true, userIdNum: '' });
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: AppColors.whiteColor,
        }}
      >
        {Platform.OS === 'ios' ? this.openIOSCalender() : this.openAndroidCalender()}
        <View
          style={{
            height: AppUtils.isX ? hp(9) : hp(6),
            width: wp(100),
            backgroundColor: AppColors.whiteColor,
            alignItems: 'flex-end',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              height: hp(1.5),
              width: wp(25),
              backgroundColor: AppColors.primaryColor,
              borderRadius: hp(1),
            }}
          />
          <View
            style={{
              height: hp(1.5),
              width: wp(25),
              marginLeft: wp(7),
              marginRight: wp(7),
              backgroundColor: this.state.page > 1 ? AppColors.primaryColor : AppColors.backgroundGray,
              borderRadius: hp(1),
            }}
          />
          <View
            style={{
              height: hp(1.5),
              width: wp(25),
              backgroundColor: this.state.page > 2 ? AppColors.primaryColor : AppColors.backgroundGray,
              borderRadius: hp(1),
            }}
          />
        </View>

        <KeyboardAwareScrollView bounces={false}>
          {this.state.page === 1 ? this.firstPage() : this.state.page === 2 ? this.secondPage() : this.thirdPage()}
        </KeyboardAwareScrollView>

        <View
          style={{
            width: wp(100),
            shadowOffset: {
              width: 0,
              height: -1,
            },
            shadowOpacity: 0.1,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000000',
            backgroundColor: AppColors.whiteColor,
            paddingBottom: AppUtils.isX ? hp(1) : 0,
            elevation: 0,
            height: AppUtils.isX ? hp(12) : hp(10),
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }} onPress={() => this.onPressCancelOrPrevious()}>
            <View
              style={{
                height: hp(6),
                width: wp(40),
                backgroundColor: AppColors.whiteColor,
                borderWidth: 2,
                justifyContent: 'center',
                borderRadius: hp(0.8),
                alignItems: 'center',
                borderColor: AppColors.primaryColor,
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.primaryColor,
                  marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                  textAlign: 'center',
                  fontSize: hp(2.2),
                }}
              >
                {this.state.page === 1 || this.state.isAddNewRelative ? strings('doctor.button.cancel') : strings('doctor.button.previous')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }}
            onPress={() => {
              this.state.isAddNewRelative ? this.validateNewUser() : this.checkNextOrSubmit();
            }}
          >
            <View
              style={{
                height: hp(6),
                width: wp(40),
                backgroundColor: AppColors.primaryColor,
                borderWidth: 2,
                justifyContent: 'center',
                borderRadius: hp(0.8),
                alignItems: 'center',
                borderColor: AppColors.primaryColor,
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.whiteColor,
                  marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                  textAlign: 'center',
                  fontSize: hp(2.2),
                }}
              >
                {this.state.page === 1
                  ? strings('doctor.button.findDoctors')
                  : this.state.page === 2
                  ? strings('doctor.button.next')
                  : this.state.isAddNewRelative
                  ? strings('doctor.button.addUser')
                  : strings('doctor.button.submit')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {this.openDateTimeSelector()}
        {this.state.confirmation ? this.confirmation() : null}
        {this.state.isConsentModel ? this.consentModel() : null}

        {this.state.isLoading ? (
          <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        ) : null}
      </View>
    );
  }

  addPatientView() {
    let insuranceProviders = this.state.insuranceProviders.map((d, i) => {
      return <Picker.Item key={d._id} label={d.companyName} value={d._id} />;
    });

    let insuranceProviderIOS = this.state.insuranceProviders.map((d, i) => {
      return i == 0 ? { key: d._id, section: true, label: d.companyName } : { key: d._id, label: d.companyName };
    });

    return (
      <View>
        {!this.state.isDataSet ? (
          <View style={styles.registration}>
            <TextInput
              allowFontScaling={false}
              placeholder={strings('doctor.text.firstName')}
              multiline={false}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.fName}
              onChangeText={(text) => this.setState({ fName: text })}
              returnKeyType={'next'}
              onSubmitEditing={(event) => this.refs.LastName.focus()}
            ></TextInput>
            <TextInput
              allowFontScaling={false}
              ref="LastName"
              placeholder={strings('doctor.text.lastName')}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.lName}
              onChangeText={(input) => this.setState({ lName: input, hideResults: true })}
              underlineColorAndroid={'white'}
              returnKeyType={'next'}
            ></TextInput>
            <TouchableHighlight onPress={() => this.openCalender()} underlayColor="transparent">
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>{strings('doctor.text.dob')}</Text>
                <Text ref="DOB" style={styles.date}>
                  {moment(this.state.dob).format('DD-MMM-YYYY')}
                </Text>
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
            {this.bmiView()}
            {Platform.OS === 'ios' ? (
              <View>
                <ModalSelector
                  data={this.state.isSelfExist ? otherRelationData : relationData}
                  initValue="Select Relation"
                  accessible={true}
                  cancelText={'Cancel'}
                  animationType={'fade'}
                  optionContainerStyle={{
                    backgroundColor: AppColors.whiteColor,
                  }}
                  optionTextStyle={{ color: AppColors.primaryColor }}
                  childrenContainerStyle={{
                    backgroundColor: AppColors.whiteColor,
                  }}
                  onChange={(option) => {
                    this.setState({
                      relation: this.getPickerLabel(option.label),
                      relationText: option.label,
                    });
                  }}
                >
                  <View style={styles.dobStyle}>
                    <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
                    <Text style={styles.date}>{this.state.relationText}</Text>
                  </View>
                </ModalSelector>
              </View>
            ) : (
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#D3D3D3' }}>
                {this.state.isSelfExist ? (
                  <Picker
                    style={styles.picker}
                    selectedValue={this.state.relation}
                    onValueChange={(itemValue, itemIndex) => this.setState({ relation: itemValue })}
                  >
                    <Picker.Item label="Relation" value="" />
                    <Picker.Item label="Spouse" value="spouse" />
                    <Picker.Item label="Son" value="son" />
                    <Picker.Item label="Daughter" value="daughter" />
                    <Picker.Item label="Others" value="other" />
                  </Picker>
                ) : (
                  <Picker
                    style={styles.picker}
                    selectedValue={this.state.relation}
                    onValueChange={(itemValue, itemIndex) => this.setState({ relation: itemValue })}
                  >
                    <Picker.Item label="Relation" value="" />
                    <Picker.Item label="Spouse" value="spouse" />
                    <Picker.Item label="Son" value="son" />
                    <Picker.Item label="Daughter" value="daughter" />
                    <Picker.Item label="Others" value="other" />
                  </Picker>
                )}
              </View>
            )}

            {this.state.userIdTypes.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
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
                    // dropdownPosition={-2}
                    dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                    itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                    rippleCentered={false}
                    dropdownMargins={{ min: 8, max: 16 }}
                    baseColor={'transparent'}
                    value={this.state.selectedId.identificationType ?? 'Identification Type'}
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
            )}
            {this.state.showInput && (
              <View style={{ display: 'flex', justifyContent: 'center', marginHorizontal: 16 }}>
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
              </View>
            )}

            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.holderText}>{strings('doctor.text.insuranceHolder')}</Text>
              <View style={styles.switchStyle}>
                <Switch
                  onValueChange={(value) => this.switch(value)}
                  value={this.state.toggled}
                  disabled={false}
                  circleSize={moderateScale(25)}
                  barHeight={moderateScale(25)}
                  backgroundActive={AppColors.lightPink}
                  backgroundInactive={AppColors.lightGray}
                  circleActiveColor={AppColors.primaryColor}
                  circleInActiveColor={AppColors.primaryGray}
                  changeValueImmediately={true}
                  innerCircleStyle={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: 'transparent',
                  }}
                  switchLeftPx={2}
                  switchRightPx={2}
                  switchWidthMultiplier={2}
                />
              </View>
            </View>
            {this.state.toggled ? (
              <View>
                {Platform.OS === 'ios' ? (
                  <View>
                    <ModalSelector
                      data={insuranceProviderIOS}
                      initValue="Select Insurance"
                      accessible={true}
                      cancelText={'Cancel'}
                      animationType={'fade'}
                      optionContainerStyle={{
                        backgroundColor: AppColors.whiteColor,
                      }}
                      optionTextStyle={{ color: AppColors.primaryColor }}
                      childrenContainerStyle={{
                        backgroundColor: AppColors.whiteColor,
                      }}
                      onChange={(option) => {
                        this.setInsuranceData(option.key);
                      }}
                    >
                      <View style={styles.dobStyle}>
                        <Text style={styles.dobText}>{this.state.insuranceCompanyName}</Text>
                        <Text style={styles.date}></Text>
                      </View>
                    </ModalSelector>
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings('doctor.text.insuranceNum')}
                      placeholderTextColor={AppColors.textGray}
                      style={styles.NRIC}
                      value={this.state.insuranceNumber}
                      onChangeText={(input) => this.setState({ insuranceNumber: input })}
                      underlineColorAndroid={'white'}
                    ></TextInput>
                  </View>
                ) : (
                  <View>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#D3D3D3',
                      }}
                    >
                      <Picker
                        style={styles.picker}
                        selectedValue={this.state.insurancePId}
                        onValueChange={(itemValue, itemIndex) => this.setState({ insurancePId: itemValue })}
                      >
                        {/*onValueChange={(itemValue, itemIndex) => this.setInsuranceData(itemValue)}>*/}
                        {insuranceProviders}
                      </Picker>
                    </View>
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings('doctor.text.insuranceNum')}
                      placeholderTextColor={AppColors.textGray}
                      style={styles.NRIC}
                      value={this.state.insuranceNumber}
                      onChangeText={(input) => this.setState({ insuranceNumber: input })}
                      underlineColorAndroid={'white'}
                    ></TextInput>
                  </View>
                )}
              </View>
            ) : (
              <View />
            )}
          </View>
        ) : (
          <View style={styles.registration}>
            <View style={styles.dobStyle}>
              <Text style={Platform.OS === 'ios' ? styles.inputIOS : styles.dobText}>{this.state.fName}</Text>
            </View>
            <View style={styles.dobStyle}>
              <Text style={Platform.OS === 'ios' ? styles.inputIOS : styles.dobText}>{this.state.lName}</Text>
            </View>
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>{strings('doctor.text.dob')}</Text>
              <Text ref="DOB" style={styles.date}>
                {moment(this.state.dob).format('DD-MMM-YYYY')}
              </Text>
            </View>
            <View style={styles.genderView}>
              <Text style={styles.selectGender}>{strings('doctor.text.gender')}</Text>
              <Text style={[styles.male, { color: this.state.maleTextColor }]}>{strings('doctor.text.male')}</Text>
              <Text style={[styles.female, { color: this.state.femaleTextColor }]}>Female</Text>
            </View>
            {this.bmiView()}
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
              <Text style={styles.date}>{this.state.relationText}</Text>
            </View>
            <View>
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>
                  {this.state.insuranceNumber == '' || this.state.insuranceCompanyName == ''
                    ? strings('doctor.text.insuranceNotAvail')
                    : this.state.insuranceCompanyName}
                </Text>
              </View>
            </View>
            <Text style={styles.dobText}>{this.state.insuranceNumber == '' ? ' ' : this.state.insuranceNumber}</Text>
          </View>
        )}
      </View>
    );
  }

  bmiView() {
    return (
      <View>
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
      </View>
    );
  }

  openCalender() {
    let self = this;
    Keyboard.dismiss();
    Platform.OS === 'ios' ? self.setState({ showDOB: true }) : self.setState({ showDOB: true });
  }

  closeIOSCalender() {
    this.setState({ showDOB: false });
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

  getPickerLabel(pickedVal) {
    switch (pickedVal) {
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

  openAndroidCalender() {
    return (
      <View>
        {this.state.showDOB ? (
          <DateTimePicker
            value={new Date(this.state.dob)}
            style={{ backgroundColor: AppColors.whiteColor }}
            maximumDate={_dt}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              this.setState({ dob: date, showDOB: false });
            }}
          />
        ) : null}
      </View>
    );
  }

  openIOSCalender() {
    let dt = AppUtils.currentDateTime;
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
                value={new Date(this.state.dob)}
                style={{ backgroundColor: AppColors.whiteColor }}
                maximumDate={_dt}
                mode="date"
                display={'spinner'}
                onChange={(event, date) => {
                  this.setState({ dob: date });
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
                  {moment.parseZone(this.state.dob).format('MMM DD YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  openRelation() {
    this.setState({ showRelation: !this.state.showRelation });
  }

  openInsurance() {
    this.setState({ showInsurance: !this.state.showInsurance });
  }

  consentModel() {
    let userMsg = strings('string.quickRequest.consent');
    let tcMsg =
      this.state.userCountryCode == '65'
        ? strings('string.quickRequest.videoCallTCForSG')
        : this.state.userCountryCode == '91'
        ? strings('string.quickRequest.videoCallTCForIN')
        : strings('string.quickRequest.videoCallTCForAll');

    userMsg = this.state.page === 1 ? tcMsg : userMsg;
    console.log(userMsg, 'userMsg');

    let btnText = 'Track Request';

    return (
      <Modal visible={this.state.isConsentModel} transparent={true} animationType={'fade'} onRequestClose={() => AppUtils.console('Modal Closed')}>
        <View
          style={{
            height: height,
            width: width,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              elevation: 2,
              borderRadius: moderateScale(5),
              backgroundColor: AppColors.whiteColor,
              width: width - moderateScale(20),
              marginLeft: moderateScale(10),
              marginRight: moderateScale(10),
              paddingTop: hp(4),
              paddingBottom: hp(4),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                marginLeft: moderateScale(30),
                marginRight: moderateScale(30),
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyBold,
                  fontSize: wp(5),
                  color: AppColors.blackColor,
                  textAlign: 'center',
                }}
              >
                {strings('doctor.alertTitle.attention')}
              </Text>
              <Text
                style={{
                  marginTop: verticalScale(5),
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: wp(4),
                  color: AppColors.blackColor,
                  // lineHeight: 18,
                  textAlign: 'justify',
                }}
              >
                {userMsg}
              </Text>
            </View>
            <View
              style={[
                styles.clinicbuttonView,
                {
                  marginTop: 20,
                  flexDirection: 'row',
                  marginRight: moderateScale(20),
                },
              ]}
            >
              <SHButtonDefault
                btnText={this.state.page === 1 ? strings('doctor.button.capCancel') : strings('doctor.button.capNo')}
                btnType={'normal'}
                style={{
                  marginLeft: moderateScale(30),
                  borderColor: AppColors.primaryColor,
                  borderWidth: 1,
                  backgroundColor: AppColors.whiteColor,
                  width: moderateScale(120),
                }}
                btnTextColor={AppColors.primaryColor}
                btnPressBackground={AppColors.whiteColor}
                onBtnClick={() => this.setState({ isConsentModel: false })}
              />

              <SHButtonDefault
                btnText={this.state.page === 1 ? strings('doctor.button.capContinue') : strings('doctor.button.capYes')}
                btnType={'normal'}
                style={{
                  marginLeft: moderateScale(30),
                  width: moderateScale(120),
                }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() =>
                  this.setState({ isConsentModel: false }, () => {
                    setTimeout(() => {
                      this.state.page === 1 ? this.getDoctorList(this.state.newSelectedDateTime, this.state.selectedAMPM) : this.bookRequest();
                    }, 500);
                  })
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  confirmation() {
    let textToShow = this.state.doctorName;
    let consultationType =
      this.state.consultationType === 'VIDEO'
        ? strings('doctor.text.videoConsult')
        : this.state.consultationType === 'IN_HOUSE_CALL'
        ? strings('doctor.text.inHouseConsult')
        : strings('doctor.text.videoConsult');
    let userMsg = strings('doctor.text.appointSubmitSuccess', {
      name: this.state.patientName,
      type: consultationType,
    });
    let timeOfReq =
      moment.parseZone(this.state.selectedDateTime).format(' MMM DD YYYY') + ' | ' + moment(this.state.selectedDateTime).format('hh:mm A');

    let btnText = strings('doctor.text.trackRequest');

    return (
      <Modal visible={this.state.confirmation} transparent={true} animationType={'fade'} onRequestClose={() => AppUtils.console('Modal Closed')}>
        <View
          style={{
            height: height,
            width: width,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: verticalScale(400),
              elevation: 2,
              borderRadius: moderateScale(5),
              backgroundColor: AppColors.whiteColor,
              width: width - moderateScale(20),
              marginLeft: moderateScale(10),
              marginRight: moderateScale(10),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={confirmLogo}
              style={{
                height: verticalScale(120),
                width: verticalScale(120),
                borderRadius: verticalScale(60),
                backgroundColor: AppColors.whiteColor,
                alignSelf: 'center',
                marginTop: verticalScale(20),
              }}
            ></Image>
            <View
              style={{
                marginLeft: moderateScale(30),
                marginRight: moderateScale(30),
              }}
            >
              <Text
                style={{
                  marginTop: verticalScale(20),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.blackColor,
                  textAlign: 'center',
                }}
              >
                {userMsg}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyBold,
                  color: AppColors.blackColor,
                  textAlign: 'center',
                  marginTop: verticalScale(30),
                }}
              >
                {textToShow}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyBold,
                  color: AppColors.blackColor,
                  textAlign: 'center',
                  marginTop: verticalScale(10),
                }}
              >
                {timeOfReq}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyMedium,
                  color: AppColors.textGray,
                  textAlign: 'center',
                  marginTop: verticalScale(20),
                }}
                numberOfLines={1}
              >
                {this.state.clinicName} | {this.state.clinicAddress}
              </Text>
            </View>
            <View
              style={[
                styles.clinicbuttonView,
                {
                  marginTop: 20,
                  marginBottom: verticalScale(20),
                  marginRight: moderateScale(20),
                },
              ]}
            >
              <SHButtonDefault
                btnText={btnText}
                btnType={'normal'}
                style={{
                  marginLeft: moderateScale(30),
                  width: moderateScale(140),
                }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() => this.myAppointments(this.state.isCalender)}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  switch(val) {
    this.setState({ toggled: val });
  }

  focusNextField(id) {
    this.inputs[id].focus();
  }

  myAppointments(key) {
    try {
      this.setState({ confirmation: false });
      AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true }));
      Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
    } catch (e) {
      AppUtils.console('sdfxcszdxc', e);
    }
  }

  selectSpeciality(index, data) {
    this.setState({
      selectedSpecialityId: data[index]._id,
      selectedSpeciality: data[index].departmentName,
    });
  }

  firstPage() {
    return (
      <View>
        <View style={{ marginTop: hp(8), marginLeft: wp(4), marginRight: wp(4) }}>
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyRegular,
              fontSize: hp(2.2),
              textAlign: isRTL ? 'left' : 'auto',
            }}
          >
            {strings('doctor.text.consultType')}
          </Text>
          <View style={{ marginTop: hp(2), flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => this.selectConsultationType('VIDEO', false)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: this.state.consultationType === 'VIDEO' ? AppColors.primaryColor : AppColors.whiteColor,
                borderWidth: hp(0.2),
                borderColor: this.state.consultationType === 'VIDEO' ? AppColors.primaryColor : AppColors.backgroundGray,
                width: wp(30),
                borderRadius: hp(1),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  height: hp(6),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  style={{ height: hp(3), width: wp(6) }}
                  source={
                    this.state.consultationType === 'VIDEO'
                      ? require('../../../assets/images/video_camera.png')
                      : require('../../../assets/images/video_camera_red.png')
                  }
                />
                <Text
                  style={{
                    color: this.state.consultationType === 'VIDEO' ? AppColors.whiteColor : AppColors.blackColor,
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: hp(1.6),
                    marginLeft: wp(2),
                    width: wp(15),
                    marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                  }}
                >
                  {strings('doctor.call_type.vid')}
                </Text>
              </View>
            </TouchableOpacity>
            {this.state.userCountryCode == '65' ? (
              <TouchableOpacity
                onPress={() => this.selectConsultationType('AUDIO', true)}
                style={{
                  marginLeft: wp(2),
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: this.state.consultationType === 'AUDIO' ? AppColors.primaryColor : AppColors.whiteColor,
                  borderWidth: hp(0.2),
                  borderColor: this.state.consultationType === 'AUDIO' ? AppColors.primaryColor : AppColors.backgroundGray,
                  width: wp(30),
                  borderRadius: hp(1),
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    height: hp(6),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    style={{ height: hp(3), width: wp(6) }}
                    source={
                      this.state.consultationType === 'AUDIO'
                        ? require('../../../assets/images/tele_white.png')
                        : require('../../../assets/images/tele_red.png')
                    }
                  />
                  <Text
                    style={{
                      color: this.state.consultationType === 'AUDIO' ? AppColors.whiteColor : AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: hp(1.6),
                      marginLeft: wp(2),
                      // width: wp(15),
                      marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                      alignItems: 'center',
                    }}
                  >
                    {/* {strings('doctor.call_type.teleArt')} */}
                    {strings('doctor.call_type.tele')}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => this.selectConsultationType('AUDIO', false)}
                style={{
                  marginLeft: wp(2),
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: this.state.consultationType === 'AUDIO' ? AppColors.primaryColor : AppColors.whiteColor,
                  borderWidth: hp(0.2),
                  borderColor: this.state.consultationType === 'AUDIO' ? AppColors.primaryColor : AppColors.backgroundGray,
                  width: wp(30),
                  borderRadius: hp(1),
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    height: hp(6),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    style={{ height: hp(3), width: wp(6) }}
                    source={
                      this.state.consultationType === 'AUDIO'
                        ? require('../../../assets/images/tele_white.png')
                        : require('../../../assets/images/tele_red.png')
                    }
                  />
                  <Text
                    style={{
                      color: this.state.consultationType === 'AUDIO' ? AppColors.whiteColor : AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: hp(1.6),
                      marginLeft: wp(2),
                      marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                    }}
                  >
                    {strings('doctor.call_type.tele')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => this.selectConsultationType('IN_HOUSE_CALL', false)}
              style={{
                marginLeft: wp(2),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: this.state.consultationType === 'IN_HOUSE_CALL' ? AppColors.primaryColor : AppColors.whiteColor,
                borderWidth: hp(0.2),
                borderColor: this.state.consultationType === 'IN_HOUSE_CALL' ? AppColors.primaryColor : AppColors.backgroundGray,
                width: wp(30),
                borderRadius: hp(1),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: hp(6),
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              >
                <Image
                  style={{ height: hp(3), width: wp(6) }}
                  source={
                    this.state.consultationType === 'IN_HOUSE_CALL'
                      ? require('../../../assets/images/house_call.png')
                      : require('../../../assets/images/house_call_red.png')
                  }
                />
                <Text
                  numberOfLines={3}
                  style={{
                    textAlign: 'center',
                    marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
                    color: this.state.consultationType === 'IN_HOUSE_CALL' ? AppColors.whiteColor : AppColors.blackColor,
                    fontFamily: AppStyles.fontFamilyRegular,
                    width: wp(20),
                    fontSize: hp(1.6),
                    marginLeft: wp(0.5),
                    marginRight: wp(2),
                  }}
                >
                  {strings('doctor.call_type.inHou')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {this.state.consultationType === 'IN_HOUSE_CALL' ? (
          <View
            style={{
              marginTop: hp(8),
              marginLeft: wp(5.5),
              marginRight: wp(5.5),
            }}
          >
            <Text
              style={{
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: hp(2.2),
                marginBottom: hp(2),
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings('string.addressModal.selectAdd')}
            </Text>
            <AddressView isElevation={'true'} selectedAddress={this.state.selectedAddress} onPress={() => this.setState({ isAddressOpen: true })} />
            <AddOrUpdateAddress
              isOpen={this.state.isAddAddressOpen}
              location={this.state.location}
              addressList={this.state.addressList}
              currentAddress={this.state.currentAddress}
              updateAddressData={this.state.updateAddressData}
              closeModal={() =>
                this.setState({
                  isAddAddressOpen: false,
                  isAddressOpen: false,
                  updateAddressData: {},
                })
              }
              onAddressAddedOrUpdated={(addressList) =>
                this.setState(
                  {
                    addressList: addressList,
                    isAddAddressOpen: false,
                    isAddressOpen: false,
                    updateAddressData: {},
                  },
                  () => this.getSelectedAddress(addressList)
                )
              }
            />
            <SelectAddressModal
              isOpen={this.state.isAddressOpen}
              location={this.state.location}
              addressList={this.state.addressList}
              addAddress={() =>
                this.setState({ isAddressOpen: false }, () =>
                  this.setState({
                    isAddAddressOpen: true,
                    currentAddress: true,
                  })
                )
              }
              selectAddress={(addressList) =>
                this.setState(
                  {
                    addressList: addressList,
                    isAddressOpen: false,
                    isAddAddressOpen: false,
                  },
                  () => this.getSelectedAddress(addressList)
                )
              }
              deleteAddress={(addressList) => this.setState({ addressList: addressList }, () => this.getSelectedAddress(addressList))}
              closeModal={() => this.setState({ isAddressOpen: false })}
              updateAddress={(updateAddress) =>
                this.setState({
                  updateAddressData: updateAddress,
                  isAddressOpen: false,
                  isAddAddressOpen: true,
                  currentAddress: true,
                })
              }
            />
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginHorizontal: 20,
            marginTop: 40,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                flex: 1,
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: hp(2.2),
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings('doctor.text.selectFilter')}
            </Text>
            {this.state.consultationType !== 'IN_HOUSE_CALL' ? (
              <TouchableOpacity
                onPress={() => this.setState({ isCountryListVisible: true })}
                style={{
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginLeft: wp(2),
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderBottomWidth: 0.5,
                  paddingBottom: hp(0.8),
                  borderBottomColor: AppColors.greyColor,
                  flex: 1,
                }}
              >
                <View>
                  <Text style={{ color: AppColors.greyColor }}>{this.state.countryName}</Text>
                </View>
                {this.state.isCountryListVisible ? (
                  <CountryPicker
                    //countryCodes={['SG', 'IN', 'MY', 'TH', 'ID', 'ZA']}
                    visible={this.state.isCountryListVisible}
                    closeable
                    withFilter
                    withFlag
                    withCallingCode
                    withCountryNameButton
                    onClose={() => this.setState({ isCountryListVisible: false })}
                    onSelect={(value) => {
                      AppUtils.console('asfsdzs23refdszxc', this.state.cca2);
                      this.setState(
                        {
                          cca2: value.cca2,
                          countryCode: value.callingCode[0],
                          isCountryListVisible: false,
                          countryName: value.name,
                        }
                        // () => this.filterList()
                      );
                    }}
                    // cca2={this.state.cca2}
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
                    justifyContent: 'flex-end',
                  }}
                >
                  <Image
                    style={{
                      tintColor: AppColors.greyColor,
                      alignSelf: 'center',
                      width: wp(4),
                      height: wp(4),
                    }}
                    source={require('../../../assets/images/drop_black.png')}
                  />
                </TouchableHighlight>
              </TouchableOpacity>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Dropdown
              label=""
              textColor={AppColors.greyColor}
              itemColor={AppColors.greyColor}
              rippleColor={'transparent'}
              fontSize={12}
              dropdownPosition={-5}
              dropdownOffset={{ top: hp(2), left: 0 }}
              itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
              dropdownMargins={{ min: 8, max: 16 }}
              value={this.state.selectedLanguage}
              onChangeText={(value, index, data) => this.selectedLanguage(value, index)}
              containerStyle={{
                flex: 1,
                width: wp(18),
                padding: 0,
                marginRight: wp(5.5),
              }}
              data={this.state.languageListForDropDown}
            />

            <Dropdown
              label=""
              textColor={AppColors.greyColor}
              itemColor={AppColors.greyColor}
              rippleColor={'transparent'}
              fontSize={12}
              dropdownPosition={-3}
              dropdownOffset={{ top: hp(2), left: 0 }}
              itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
              dropdownMargins={{ min: 8, max: 16 }}
              value={this.state.selectedGender}
              onChangeText={(value, index, data) => this.sort(value, index)}
              containerStyle={{
                flex: 1,
                width: wp(18),
                padding: 0,
              }}
              data={sortBy}
            />
          </View>
        </View>

        <View
          style={{
            marginTop: hp(6),
            marginLeft: wp(5.5),
            marginRight: wp(5.5),
          }}
        >
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyRegular,
              fontSize: hp(2.2),
              textAlign: isRTL ? 'left' : 'auto',
            }}
          >
            {strings('doctor.text.selectSpe')}
          </Text>
          <TouchableOpacity
            onPress={() => this.refs.departmentDropdown.onPress()}
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
              ref={'departmentDropdown'}
              label=""
              textColor={AppColors.blackColor}
              itemColor={AppColors.blackColor}
              fontFamily={AppStyles.fontFamilyRegular}
              dropdownPosition={-5}
              dropdownOffset={{ top: hp(2), left: wp(1.8) }}
              itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
              rippleCentered={false}
              dropdownMargins={{ min: 8, max: 16 }}
              baseColor={'transparent'}
              value={this.state.selectedSpeciality ? this.state.selectedSpeciality : strings('doctor.text.selectSpe')}
              onChangeText={(value, index, data) => this.selectSpeciality(index, data)}
              pickerStyle={{
                width: wp(89),
                height: hp(40),
              }}
              containerStyle={{
                width: wp(80),
                marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                justifyContent: 'center',
              }}
              data={this.state.departmentListForDropdown}
            />
            <Image resizeMode={'contain'} style={{ height: hp(2.5), width: hp(2.5) }} source={require('../../../assets/images/arrow_down.png')} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: hp(6),
            marginLeft: wp(5.5),
            marginRight: wp(5.5),
          }}
        >
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyRegular,
              fontSize: hp(2.2),
              textAlign: isRTL ? 'left' : 'auto',
            }}
          >
            {strings('doctor.text.selectDate')}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ showCalender: true })}
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
            <Text
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: hp(2),
                color: AppColors.blackColor,
                marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
                fontFamily: AppStyles.fontFamilyRegular,
                width: wp(80),
                flexDirection: 'row',
                textAlign: 'left',
              }}
            >
              {moment(this.state.selectedDate).format('DD MMM, YYYY')}
            </Text>

            <Image resizeMode={'contain'} style={{ height: hp(2.5), width: hp(2.5) }} source={require('../../../assets/images/arrow_down.png')} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: hp(6),
            marginLeft: wp(5.5),
            marginRight: wp(5.5),
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: hp(2.2),
              }}
            >
              {strings('doctor.text.selectTime') + ' '}
            </Text>
            {/*  */}
            <Text
              style={{
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: hp(2.2),
              }}
            >
              {' '}
              ({moment.tz.guess()}){' '}
            </Text>
          </View>

          {/*  */}
          <View style={{ flexDirection: 'row', width: wp(90) }}>
            <View style={styles.selectTimeMainView}>
              <TouchableOpacity onPress={() => this.refs.hourDropdown.onPress()} style={styles.selectTimeTouchView}>
                <Dropdown
                  ref={'hourDropdown'}
                  label=""
                  textColor={AppColors.blackColor}
                  itemColor={AppColors.blackColor}
                  dropdownPosition={-5}
                  fontSize={hp(2)}
                  fontFamily={AppStyles.fontFamilyRegular}
                  dropdownOffset={{ top: hp(-25), left: wp(1.2) }}
                  itemTextStyle={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: wp(2),
                  }}
                  rippleCentered={false}
                  dropdownMargins={{ min: 8, max: 16 }}
                  baseColor={'transparent'}
                  onChangeText={(value) => this.setState({ selectedHour: value })}
                  value={this.state.selectedHour}
                  pickerStyle={{
                    width: wp(24),
                    height: hp(20),
                  }}
                  containerStyle={{
                    width: wp(15),
                    padding: 0,
                    marginTop: Platform.OS === 'ios' ? hp(3) : hp(2),
                    justifyContent: 'center',
                  }}
                  data={hour}
                />

                <Image resizeMode={'contain'} style={styles.selectTimeDropdownIcon} source={require('../../../assets/images/arrow_down.png')} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.timeDivider, { marginRight: wp(1) }]}>:</Text>
            <View style={[styles.selectTimeMainView, { alignItems: 'center' }]}>
              <TouchableOpacity onPress={() => this.refs.minDropdown.onPress()} style={styles.selectTimeTouchView}>
                <Dropdown
                  ref={'minDropdown'}
                  label=""
                  textColor={AppColors.blackColor}
                  itemColor={AppColors.blackColor}
                  dropdownPosition={-5}
                  fontSize={hp(2)}
                  fontFamily={AppStyles.fontFamilyRegular}
                  dropdownOffset={{ top: hp(-25), left: wp(1.2) }}
                  itemTextStyle={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: wp(2),
                  }}
                  rippleCentered={false}
                  onChangeText={(value) => this.setState({ selectedMin: value })}
                  dropdownMargins={{ min: 8, max: 16 }}
                  baseColor={'transparent'}
                  value={this.state.selectedMin}
                  pickerStyle={{
                    width: wp(24),
                    height: hp(20),
                  }}
                  containerStyle={{
                    width: wp(15),
                    marginTop: Platform.OS === 'ios' ? hp(3) : hp(2),
                    justifyContent: 'center',
                  }}
                  data={min}
                />

                <Image resizeMode={'contain'} style={styles.selectTimeDropdownIcon} source={require('../../../assets/images/arrow_down.png')} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.timeDivider, { marginLeft: wp(1) }]}>:</Text>
            <View style={[styles.selectTimeMainView, { alignItems: 'flex-end' }]}>
              <TouchableOpacity onPress={() => this.refs.ampmDropdown.onPress()} style={styles.selectTimeTouchView}>
                <Dropdown
                  ref={'ampmDropdown'}
                  label=""
                  textColor={AppColors.blackColor}
                  itemColor={AppColors.blackColor}
                  dropdownPosition={-5}
                  fontSize={hp(2)}
                  fontFamily={AppStyles.fontFamilyRegular}
                  dropdownOffset={{ top: hp(-25), left: wp(1.2) }}
                  itemTextStyle={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: wp(2),
                  }}
                  rippleCentered={false}
                  dropdownMargins={{ min: 8, max: 16 }}
                  baseColor={'transparent'}
                  onChangeText={(value) => this.setState({ selectedAMPM: value })}
                  value={this.state.selectedAMPM}
                  pickerStyle={{
                    width: wp(24),
                    height: hp(10),
                  }}
                  containerStyle={{
                    width: wp(15),
                    marginTop: Platform.OS === 'ios' ? hp(3) : hp(2),
                    justifyContent: 'center',
                  }}
                  data={ampm}
                />
                <Image resizeMode={'contain'} style={styles.selectTimeDropdownIcon} source={require('../../../assets/images/arrow_down.png')} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  secondPage() {
    return (
      <View style={{ marginTop: hp(6), marginLeft: wp(5.5), marginRight: wp(5.5) }}>
        {this.state.doctorList.length == 0 ? (
          <View
            style={{
              width: wp(80),
              height: hp(50),
              marginRight: moderateScale(5),
              marginLeft: moderateScale(5),
              justifyContent: 'center',
              alignItem: 'center',
              alignSelf: 'center',
            }}
          >
            <Image
              source={require('../../../assets/images/cancel.png')}
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                height: verticalScale(100),
                width: moderateScale(100),
              }}
            />
            <Text
              style={{
                color: AppColors.primaryColor,
                fontSize: moderateScale(15),
                textAlign: 'center',
                fontFamily: AppStyles.fontFamilyBold,
              }}
            >
              {strings('doctor.text.docNotAvail')}
            </Text>
          </View>
        ) : (
          <View>
            <View style={{ marginBottom: 6 }}>
              <Text
                style={{
                  color: AppColors.blackColor,
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: hp(2.2),
                  textAlign: isRTL ? 'left' : 'auto',
                }}
              >
                {strings('doctor.text.selectClinicHospital')}
              </Text>
              <TouchableOpacity
                onPress={() => this.refs.filterDropdown.onPress()}
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
                  ref={'filterDropdown'}
                  label=""
                  textColor={AppColors.blackColor}
                  itemColor={AppColors.blackColor}
                  fontFamily={AppStyles.fontFamilyRegular}
                  dropdownPosition={-3}
                  dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                  itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                  rippleCentered={false}
                  dropdownMargins={{ min: 8, max: 16 }}
                  baseColor={'transparent'}
                  value={this.state.selectedClinicOrHospital ? this.state.selectedClinicOrHospital : 'All'}
                  onChangeText={(value, index, data) => this.filterDoctorList(data[index])}
                  pickerStyle={{
                    width: wp(89),
                    height: hp(40),
                  }}
                  containerStyle={{
                    width: wp(80),
                    marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                    justifyContent: 'center',
                  }}
                  selection={{ start: 0, end: 0 }}
                  data={this.state.clinicHospitalList}
                />
                <Image resizeMode={'contain'} style={{ height: hp(2.5), width: hp(2.5) }} source={require('../../../assets/images/arrow_down.png')} />
              </TouchableOpacity>
            </View>
            <FlatList
              style={{ height: heightPercentageToDP(50) }}
              data={this.state.filteredDoctorList}
              keyExtractor={(item, index) => index}
              renderItem={(item) => this._render_row(item)}
            />
          </View>
        )}
      </View>
    );
  }

  filterDoctorList(data) {
    if (data.value === 'All') {
      this.setState({ filteredDoctorList: this.state.doctorList });
    } else {
      let list = this.state.doctorList.filter((doctor) => doctor.clinicName === data.value);

      this.setState({ filteredDoctorList: list });
      this.setState((prevState) => ({ isChanged: !prevState.isChanged }));
    }
  }

  sort(name, index) {
    this.setState({ selectedGender: name });
  }

  selectedLanguage(name, index) {
    this.setState({ selectedLanguage: name });
  }

  filterList() {
    let month = moment(this.state.selectedDate).format('MM');
    let day = moment(this.state.selectedDate).format('DD');
    let year = moment(this.state.selectedDate).format('YYYY');
    let hours = this.state.selectedHour;
    if (this.state.selectedAMPM === 'PM') {
      if (parseInt(hours) < 12) {
        hours = parseInt(hours) + 12;
      }
    }
    AppUtils.console('xvcsdzfxsdxc', month, day, year, this.state.selectedAMPM);
    let selectedDateTime = moment(new Date(year, parseInt(month) - 1, day, hours, this.state.selectedMin)).tz(getTimeZone());
    let diff = selectedDateTime.diff(AppUtils.currentDateTime());
    AppUtils.console('sdzfvdxdfsxsdfx', selectedDateTime, month, day, year, hours, this.state.selectedMin, this.state.selectedHour);
    setTimeout(() => {
      this.getDoctorList(selectedDateTime, this.state.selectedAMPM);
    }, 500);
  }

  selectDoctor(item) {
    let doctorList = this.state.filteredDoctorList;
    doctorList.map((doctor, index) => {
      AppUtils.console('zxcszdxfvsfd', doctor, index);
      doctor.isSelected = item.index === index ? true : false;
    });
    this.setState({ filterDoctorList: doctorList, selectedDoctor: item.item }, () => this.getSessionIndex());
  }

  _render_row(item) {
    AppUtils.console('Xccszdxfcx', item, this.state.videoCall);
    let docImage = AppUtils.handleNullImg(item.item.profilePic);
    let doctorDetail = item.item;
    let languageArr = doctorDetail.language;
    let languageStr = null;
    if (languageArr) {
      for (let i in languageArr) {
        languageStr = languageStr ? languageStr + ', ' + languageArr[i] : languageArr[i];
      }
    } else {
      languageStr = 'N/A';
    }

    AppUtils.console('SJBCJKSBJKSBC:', languageStr);
    let pricing =
      this.state.consultationType === 'VIDEO'
        ? item.item.videoCallCharge
        : this.state.consultationType === 'IN_HOUSE_CALL'
        ? item.item.inHouseCallCharge
        : item.item.audioCallCharge;
    return (
      <View
        style={{
          paddingTop: hp(2),
          borderBottomWidth: wp(0.2),
          borderColor: AppColors.backgroundGray,
          paddingBottom: hp(2),
        }}
      >
        <TouchableOpacity onPress={() => this.selectDoctor(item)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              height: wp(5),
              width: wp(5),
              borderWidth: wp(0.2),
              borderColor: AppColors.textGray,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: wp(2.5),
            }}
          >
            {item.item.isSelected ? (
              <View
                style={{
                  height: wp(2.5),
                  width: wp(2.5),
                  backgroundColor: AppColors.primaryColor,
                  borderRadius: wp(2.5 / 2),
                }}
              />
            ) : null}
          </View>
          <View style={{ marginLeft: wp(2), alignItems: 'center' }}>
            <CachedImage
              style={{
                height: wp(15),
                width: wp(15),
                borderRadius: wp(15 / 2),
              }}
              source={{ uri: docImage }}
            />
            <View style={{ flexDirection: 'row' }}>
              {item.item.videoCall ? (
                <Image
                  style={{ height: wp(4), width: wp(4) }}
                  resizeMode={'contain'}
                  source={require('../../../assets/images/video_camera_red.png')}
                />
              ) : null}
              {item.item.audioCall ? (
                <Image
                  style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }}
                  resizeMode={'contain'}
                  source={require('../../../assets/images/tele_red.png')}
                />
              ) : null}
              {item.item.inHouseCall ? (
                <Image
                  style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }}
                  resizeMode={'contain'}
                  source={require('../../../assets/images/house_call_red.png')}
                />
              ) : null}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginLeft: wp(2),
              alignSelf: 'center',
            }}
          >
            <View style={{ width: wp(45) }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: wp(4.5),
                  //height: hp(2),
                  fontFamily: AppStyles.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {item.item.doctorName}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: wp(3.5),
                  height: hp(2),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {item.item.qualification}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: wp(3.5),
                  height: hp(2),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {AppUtils.getAllDepartmentListInString(item.item.departmentList)}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: wp(3.5),
                  height: hp(2),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {item.item.clinicName}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: wp(3.5),
                  height: hp(2),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {languageStr}
              </Text>
            </View>
            <View
              style={{
                width: wp(20),
                alignSelf: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: wp(4),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.blackColor,
                }}
              >
                {item.item.currencySymbol + pricing}
              </Text>
              {this.state.countryCode == '65' ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: wp(2.5),
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.textGray,
                  }}
                >
                  {'(Before GST)'}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
        <View
          style={{
            marginTop: hp(1),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: wp(3),
              marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
              fontFamily: AppStyles.fontFamilyRegular,
              color: AppColors.textGray,
            }}
          >
            {strings('doctor.text.sess')}
          </Text>

          <FlatList
            data={item.item.timing}
            horizontal={true}
            key={2}
            style={{ marginLeft: wp(2) }}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(item) => this.sessionTiming(item)}
          />
        </View>
      </View>
    );
  }

  sessionTiming(item) {
    let docSessStartTime = AppUtils.timeConversion(item.item.startHour, item.item.startMinute);
    let docSessEndTime = AppUtils.timeConversion(item.item.endHour, item.item.endMinute);

    return (
      <View
        style={{
          width: wp(30),
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: AppColors.primaryColor,
          marginRight: wp(2),
          borderRadius: wp(1),
          height: hp(3.2),
          borderWidth: wp(0.2),
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            textAlign: 'right',
            fontSize: wp(2.5),
            marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
            fontFamily: AppStyles.fontFamilyRegular,
            color: AppColors.blackColor,
          }}
        >
          {docSessStartTime + ' - ' + docSessEndTime}
        </Text>
      </View>
    );
  }

  showAddPatientView() {
    this.setState({
      isAddNewRelative: true,
      fName: '',
      lName: '',
      dob: _dt,
      NRIC: '',
      relation: '',
      relationText: '',
      gender: '',
      insuranceNumber: '',
      insuranceText: '',
      maleTextColor: '#d3d3d3',
      femaleTextColor: '#d3d3d3',
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      toggled: false,
      confirmation: false,
      isPatientSelected: false,
      relationData: relationData,
      otherRelationData: otherRelationData,
      relativeId: '',
      insurancePId: '',
      insuranceCompanyName: 'Select Insurance',
      isDataSet: false,
    });
  }

  validateNewUser() {
    let isSelectInsurance = Platform.OS === 'ios' ? this.state.insuranceCompanyName === 'Select Insurance' : false;

    if (Validator.isBlank(this.state.fName)) {
      alert(strings('string.mandatory.firstName'));
    } else if (Validator.isBlank(this.state.lName)) {
      alert(strings('string.mandatory.lastName'));
    } else if (!Validator.validateNRIC(this.state.NRIC)) {
      alert(strings('string.mandatory.NRIC'));
    } else if (Validator.isBlank(this.state.gender)) {
      alert(strings('string.mandatory.gender'));
    } else if (Validator.isBlank(this.state.relation)) {
      alert(strings('string.mandatory.relation'));
    } else if (Validator.isValidHeightWeight(this.state.height, this.state.weight)) {
      this.showAlert('Invalid height or weight', true);
    } else if (Validator.isValidDOB(this.state.dob, this.state.relation)) {
      if (this.state.relation == 'Self') {
        alert(strings('string.mandatory.ageDifference'));
      } else {
        alert(strings('doctor.text.dobInvalid'));
      }
      this.setState({
        DOB: moment(new Date()).format('DD-MMM-YYYY'),
      });
    } else {
      if (this.state.toggled) {
        if (isSelectInsurance || !this.state.insurancePId) {
          this.showAlert(strings('string.mandatory.insuranceCompany'), true);
        } else if (Validator.isBlank(this.state.insuranceNumber)) {
          this.showAlert(strings('string.mandatory.insuranceNumber'), true);
        } else {
          this.addNewRelative();
        }
      } else {
        this.addNewRelative();
      }
    }
  }

  addNewRelative() {
    var self = this;

    self.setState({
      isAddNewRelative: false,
    });
    const tempId = this.state.selectedId.find((item) => item.identificationType === this.state.userId);

    let profileDetails = {
      firstName: this.state.fName,
      lastName: this.state.lName,
      dateOfBirth: this.state.dob,
      gender: this.state.gender,
      height: this.state.height,
      weight: this.state.weight,
      heightType: this.state.heightType,
      weightType: this.state.weightType,
      NRIC: this.state.NRIC,
      relation: this.state.relation,
      relationText: 'Select Relation',
      insuranceProvider: this.state.insurancePId,
      insuranceNumber: this.state.insuranceNumber,
      identificationType: tempId?._id ?? '',
      identificationNumber: this.state.userIdNum ?? '',
    };

    var self = this;
    AppUtils.console('addNewRelative');
    self.setState({ isLoading: true });
    console.log('CheckFlow', this.state.height);
    SHApiConnector.addNewRelativeInAppointment(profileDetails, function (err, stat) {
      console.log('After Adding Relative:', err, stat);
      try {
        self.setState({ isLoading: false }, () => {
          if (err) {
            self.showAlert(strings('string.error_code.error_10002'), true);
          } else if (stat?.error_code == '10029') {
            self.showAlert(strings('string.error_code.error_10029'), true);
          } else if (stat?.error_code == '10024') {
            self.showAlert(strings('string.error_code.error_10024'), true);
          } else if (stat?.error_code == '10030') {
            self.showAlert(strings('string.error_code.error_10030'), true);
          } else if (stat?.error_code == '10021') {
            self.showAlert(strings('string.error_code.error_10021'), true);
          } else if (stat?.error_code == '10002') {
            self.showAlert(strings('string.error_code.error_10002'), true);
          } else if (stat?.error_code == '20001') {
            self.showAlert(strings('string.error_code.error_20001'), true);
          } else if (stat && stat !== null) {
            self.setState({
              userRelativeList: stat.relativeDetails,
              fName: '',
              lName: '',
              dob: _dt,
              NRIC: '',
              relation: '',
              relationText: '',
              gender: '',
              insuranceNumber: '',
              insuranceText: '',
              isLoading: false,
            });
          }
        });
      } catch (e) {
        console.error(e);
        self.setState({ isLoading: false });
      }
    });
  }

  thirdPage() {
    return (
      <View
        style={{
          marginTop: hp(8),
          marginLeft: wp(5.5),
          marginRight: wp(5.5),
        }}
      >
        <Text
          style={{
            color: AppColors.blackColor,
            fontFamily: AppStyles.fontFamilyRegular,
            fontSize: hp(2.2),
            textAlign: isRTL ? 'left' : 'auto',
          }}
        >
          {strings('doctor.text.selectPatient')}
        </Text>
        <FlatList
          data={this.state.userRelativeList}
          key={3}
          style={{ marginTop: hp(2) }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(item) => this._render_Details(item)}
          numColumns={2}
          extraData={this.state}
        />

        {this.state.userRelativeList.length < 6 && !this.state.isAddNewRelative ? (
          <TouchableHighlight
            style={{
              height: verticalScale(50),
              width: moderateScale(150),
              flexDirection: 'row',
            }}
            onPress={() => this.showAddPatientView()}
            underlayColor="transparent"
          >
            <View
              style={{
                alignItems: 'flex-start',
                height: verticalScale(50),
                width: moderateScale(150),
                flexDirection: 'row',
                margin: moderateScale(20),
                marginLeft: 0,
              }}
            >
              <Image
                style={{
                  width: moderateScale(20),
                  height: moderateScale(20),
                  borderRadius: moderateScale(5),
                }}
                source={require('../../../assets/images/add_relative.png')}
              />
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(17),
                  marginLeft: moderateScale(5),
                  color: AppColors.grey,
                }}
              >
                {strings('doctor.button.addNew')}
              </Text>
            </View>
          </TouchableHighlight>
        ) : (
          <View />
        )}

        {this.state.isAddNewRelative ? this.addPatientView() : <View />}

        <View
          style={{
            width: wp(90),
            borderBottomWidth: wp(0.5),
            borderColor: AppColors.dividerColor,
            paddingBottom: hp(1),
            marginTop: hp(2),
          }}
        >
          {this.state.selectedSymptoms.length > 0 ? (
            <FlatList
              data={this.state.selectedSymptoms}
              key={4}
              style={{ marginTop: hp(3) }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(item) => this._renderSelectedSymptoms(item)}
              numColumns={2}
              extraData={this.state}
            />
          ) : (
            <Text
              style={{
                marginTop: hp(3),
                fontSize: 15,
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings('doctor.text.selectSymptoms')}
            </Text>
          )}
        </View>

        <View
          style={{
            width: wp(90),
            borderBottomWidth: wp(0.5),
            borderColor: AppColors.dividerColor,
            paddingBottom: hp(1),
            marginTop: hp(3),
            flexDirection: 'row',
          }}
        >
          <TextInput
            allowFontScaling={false}
            placeholder={strings('doctor.text.addSymp')}
            multiline={true}
            placeholderTextColor={AppColors.textGray}
            style={{
              flex: 1,
              color: AppColors.blackColor,
              fontSize: moderateScale(15),
              fontFamily: AppStyles.fontFamilyRegular,
              textAlign: isRTL ? 'right' : 'auto',
            }}
            value={this.state.addSymptoms}
            maxLength={25}
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={(text) => this.setState({ addSymptoms: text })}
            returnKeyType={'done'}
          />

          <TouchableOpacity onPress={() => (this.state.addSymptoms.trim().length > 0 ? this.addUserSpecifiedSymptoms() : null)}>
            <Text
              style={{
                flex: 0.2,
                marginTop: hp(0.5),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.primaryColor,
                textAlign: 'right',
              }}
            >
              {strings('doctor.button.add')}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.symptomList}
          key={5}
          style={{ marginTop: hp(3) }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(item) => this._renderSymptoms(item)}
          numColumns={3}
          extraData={this.state}
        />
      </View>
    );
  }

  addUserSpecifiedSymptoms() {
    if (this.state.selectedSymptoms.length < 8) {
      let selectedSymptoms = this.state.selectedSymptoms;
      selectedSymptoms.push({
        name: this.state.addSymptoms.trim(),
        isPrimary: false,
      });
      this.setState({ selectedSymptoms: selectedSymptoms, addSymptoms: '' });
    } else {
      Toast.show(strings('doctor.text.notMoreThenEightSymp'));
    }
  }

  addSymptoms(item) {
    let symptoms = this.state.symptomList;
    let selectedSymptoms = this.state.selectedSymptoms;
    if (!item.item.isSelected) {
      if (this.state.selectedSymptoms.length < 8) {
        symptoms[item.index].isSelected = !item.item.isSelected;
        selectedSymptoms.push({
          name: item.item.name,
          index: item.index,
          isPrimary: true,
          _id: item.item._id,
        });
      } else {
        Toast.show(strings('doctor.text.notMoreThenEightSymp'));
      }
    } else {
      symptoms[item.index].isSelected = !item.item.isSelected;
      let index = selectedSymptoms.findIndex((symptoms) => symptoms._id === item.item._id);
      selectedSymptoms.splice(index, 1);
      AppUtils.console('sdg3w5t3edfcf123', symptoms, selectedSymptoms, index);
    }
    AppUtils.console('sdg3w5t3edfcf', symptoms, selectedSymptoms);
    this.setState({
      symptomList: symptoms,
      selectedSymptoms: selectedSymptoms,
    });
  }

  _renderSelectedSymptoms(item) {
    return (
      <View
        style={{
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: AppColors.primaryColor,
          borderRadius: wp(5),
          borderColor: AppColors.primaryColor,
          marginRight: wp(4),
          marginBottom: hp(1),
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            paddingBottom: wp(1.2),
            paddingTop: wp(1.2),
            paddingLeft: wp(1.8),
            paddingRight: wp(1.8),
            width: wp(30),
            marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
            fontFamily: AppStyles.fontFamilyRegular,
            color: AppColors.whiteColor,
          }}
        >
          {item.item.name}
        </Text>

        <TouchableOpacity onPress={() => this.deleteSelectedSymptoms(item)}>
          <Image resizeMode={'contain'} style={{ height: 30, width: 30 }} source={images.cancelIcon} />
        </TouchableOpacity>
      </View>
    );
  }

  deleteSelectedSymptoms(item) {
    AppUtils.console('sdxgsesrf2435tr', item);
    let selectedSymptoms = this.state.selectedSymptoms;
    let symptoms = this.state.symptomList;
    if (item.item.isPrimary) {
      symptoms[item.item.index].isSelected = false;
    }
    selectedSymptoms.splice(item.index, 1);
    this.setState({
      selectedSymptoms: selectedSymptoms,
      symptomList: symptoms,
    });
  }

  _renderSymptoms(item) {
    return (
      <TouchableOpacity
        onPress={() => this.addSymptoms(item)}
        style={{
          borderWidth: 1,
          backgroundColor: item.item.isSelected ? AppColors.primaryColor : AppColors.whiteColor,
          borderRadius: wp(2),
          borderColor: item.item.isSelected ? AppColors.primaryColor : AppColors.backgroundGray,
          marginRight: wp(3),
          marginBottom: hp(1),
        }}
      >
        <Text
          style={{
            paddingBottom: wp(1.5),
            paddingTop: wp(1.5),
            paddingLeft: wp(1.5),
            paddingRight: wp(1.5),
            marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
            fontFamily: AppStyles.fontFamilyRegular,
            color: item.item.isSelected ? AppColors.whiteColor : AppColors.textGray,
          }}
        >
          {item.item.name}
        </Text>
      </TouchableOpacity>
    );
  }

  _render_Details(item) {
    let isLeft = item.index % 2 > 0 ? false : true;
    return (
      <ElevatedView
        elevation={4}
        style={{
          width: wp(40),
          height: verticalScale(60),
          backgroundColor: item.item.isSelected ? AppColors.primaryColor : AppColors.whiteColor,
          borderRadius: moderateScale(15),
          marginTop: moderateScale(10),
          marginBottom: moderateScale(5),
          marginRight: isLeft ? wp(5) : 0,
          marginLeft: wp(1),
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}
      >
        <TouchableHighlight
          onPress={() => this.selectRelative(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            alignSelf: 'center',
          }}
          underlayColor="transparent"
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
                width: wp(10),
                height: wp(10),
                borderRadius: wp(10 / 2),
                marginLeft: wp(0.5),
                alignSelf: 'center',
              }}
              source={{ uri: AppUtils.handleNullImg(item.item.profilePic) }}
            />
            <View
              style={{
                alignItems: 'flex-start',
                alignSelf: 'center',
                marginLeft: moderateScale(5),
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: item.item.isSelected ? AppColors.whiteColor : AppColors.blackColor,
                  width: wp(26),
                  textAlign: isRTL ? 'left' : 'auto',
                }}
                numberOfLines={1}
              >
                {item.item.firstName} {item.item.lastName}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: item.item.isSelected ? AppColors.whiteColor : AppColors.grey,
                }}
              >
                {item.item.spouse}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </ElevatedView>
    );
  }

  selectRelative(item) {
    let userRelativeList = this.state.userRelativeList;
    userRelativeList.map((relative, index) => {
      AppUtils.console('zxcszdxfvsfd', relative, index);
      relative.isSelected = item.index === index ? true : false;
    });
    this.setState({
      userRelativeList: userRelativeList,
      selectedUserRelative: item.item,
    });
  }
}

const styles = StyleSheet.create({
  selectTimeMainView: {
    width: wp(28),
  },
  selectTimeTouchView: {
    marginTop: hp(2),
    height: hp(6),
    justifyContent: 'center',
    fontFamily: AppStyles.fontFamilyRegular,
    borderWidth: hp(0.2),
    borderColor: AppColors.backgroundGray,
    borderRadius: hp(1),
    width: wp(25),
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    marginTop: verticalScale(10),
  },
  selectTimeText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: hp(2),
    marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
    fontFamily: AppStyles.fontFamilyRegular,
    width: wp(15),
    flexDirection: 'row',
  },
  selectTimeDropdownIcon: { height: hp(2), width: hp(2) },
  timeDivider: {
    color: AppColors.blackColor,
    marginTop: Platform.OS === 'ios' ? hp(2) : 0,
    alignSelf: 'center',
    width: wp(2),
    justifyContent: 'center',
    height: hp(6),
    fontSize: hp(4),
  },
  dobStyle: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: AppColors.primaryGray,
    margin: moderateScale(1),
    justifyContent: 'space-between',
  },
  holderText: {
    color: AppColors.primaryGray,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    margin: moderateScale(5),
    marginTop: verticalScale(30),
  },
  switchStyle: {
    marginLeft: moderateScale(120),
    marginTop: verticalScale(30),
    alignSelf: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? verticalScale(100) : verticalScale(50),
    marginTop: verticalScale(22),
    borderBottomWidth: 1,
    color: AppColors.blackColor,
  },
  pickerIOS: {
    height: Platform.OS === 'ios' ? verticalScale(100) : verticalScale(50),
  },

  dobText: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
    marginTop: verticalScale(20),
  },
  genderView: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectGender: {
    width: moderateScale(60),
    color: AppColors.blackColor,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    marginTop: verticalScale(20),
  },
  relation: {
    margin: moderateScale(5),
    color: AppColors.primaryGray,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    marginTop: verticalScale(30),
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
  date: {
    borderBottomWidth: 0,
    width: moderateScale(100),
    marginLeft: moderateScale(100),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
    color: AppColors.textGray,
    textAlign: 'right',
  },
  NRIC: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    marginTop: verticalScale(20),
    textAlign: isRTL ? 'right' : 'auto',
  },
  idContainer: {
    //  height:'auto',
    //  width : wp * .9,
    borderWidth: 1,
    borderColor: AppColors.grey,
    marginLeft: wp(0.5),
    marginRight: wp(0.5),
  },
});
