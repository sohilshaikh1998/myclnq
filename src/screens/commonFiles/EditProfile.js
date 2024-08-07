import React from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  I18nManager,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Actions } from 'react-native-router-flux';
import { AppStyles } from '../../shared/AppStyles';
import { AppStrings } from '../../shared/AppStrings';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { SHApiConnector } from '../../network/SHApiConnector';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SHButtonDefault from '../../shared/SHButtonDefault';
import moment from 'moment/moment';
import { Validator } from '../../shared/Validator';
import { AppUtils } from '../../utils/AppUtils';
import ModalSelector from '../../shared/ModalSelector';
import ProgressLoader from 'rn-progress-loader';
import { Switch } from 'react-native-switch';
import { Dropdown } from 'react-native-material-dropdown';
import { strings } from '../../locales/i18n';
import Share from 'react-native-share';
import Toast from 'react-native-simple-toast';
import { Buffer } from 'buffer';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-community/async-storage';
import bmiStyles from '../../styles/bmiStyles';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;

const reg = /^[1-9][0-9]*$/;

var insIndex = 0,
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

class EditProfile extends React.Component {
  constructor(props) {
    AppUtils.analyticsTracker('Edit Profile');
    super();
    super(props);
    this.callOnSuccess.bind(this);
    this.openCalender = this.openCalender.bind(this);
    this.userDetails = this.userDetails.bind(this);
    this.updateProfile = this.updateProfile.bind(this);

    this.state = {
      fName: '',
      lName: '',
      DOB: AppUtils.currentDateTime(),
      NRIC: '',
      gender: '',
      maleTextColor: '#d3d3d3',
      femaleTextColor: '#d3d3d3',
      firstNameData: [],
      profilePic: '',
      showDOB: false,
      email: '',
      abhaId: '',
      abhaNumber: '',
      insuranceData: [],
      relationData: this.props.selfProfile ? relationData : otherRelationData,
      relationText: this.props.selfProfile ? 'Self' : 'Select Relation',
      insuranceText: '',
      toggled: true,
      insuranceNumber: '',
      insurancePId: '',
      insuranceProviders: [],
      insuranceCompanyName: 'Select Insurance',
      clinicProfile: AppStrings.placeholderImg,
      relativePic: AppStrings.placeholderImg,
      fullName: '',
      transportProvider: false,
      data: [
        {
          value: 'Banana',
        },
        {
          value: 'Mango',
        },
        {
          value: 'Pear',
        },
      ],
      countryCode: '',
      transportProviderList: [],
      selectedProvider: '',
      selectedProviderId: null,
      companyName: '',
      enableAbha: true,
      isJustLoginUser: false,
      searchAbha: '',
      isViewModalVisible: false,
      isImageModalVisible: false,
      isOTPModalVisible: false,
      isPDFModalVisible: false,
      mobileSentOTP: '',
      isHealthCardClicked: false,
      isAuthInitCode: false,
      transactionId: '',
      qrImageUrl: '',
      pdfBase64: '',
      showModeList: false,
      linkIdOrAddress: '',
      modes: [],
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      userIdTypes: '',
      userId: '',
      userIdNum: '',
      showInput: false,
      selectedId: '',
    };
  }

  componentDidMount() {
    this.userDetails();
    this.getInsuranceProviders();
    this.getUserDetails();
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack();
      return true;
    });
  }
  async getUserDetails() {
    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);

    this.setState({ isJustLoginUser: user.isJustLoginUser, countryCode: user.countryCode });

  }

  async getTransportProvider() {
    var self = this;
    self.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.getTransportProviders(this.state.countryCode);
      self.setState({ isLoading: false });
      AppUtils.console('trnsportttt', response.data.response);
      let transportList = response.data.response;
      await transportList.map((provider) => {
        provider.value = provider.companyName;
      });
      if (transportList[0].isProviderMapped) {
        self.setState({ transportProvider: true });
      }
      self.setState({
        transportProviderList: transportList,
        selectedProvider: transportList[0].companyName,
        selectedProviderId: transportList[0]._id,
      });
    } catch (e) {
      self.setState({ isLoading: false });
      AppUtils.console('Error:', e);
    }
  }

  getInsuranceProviders() {
    var self = this;

    SHApiConnector.getInsuranceProviders(function (err, stat) {
      try {
        if (stat) {
          var firstValue = {
            companyName: 'Select Insurance',
            _id: '00000000000',
          };
          var data = Platform.OS === 'ios' ? [firstValue, ...stat.status] : stat.status;

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

  goBack() {
    Actions.pop();
  }

  showPicker = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DateTimePicker.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        AppUtils.console('Scsfz', date);
        newState[stateKey] = date;
      }
      this.setState(newState);
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  linkDisclaimer(idOrAddress) {
    this.setState({ isViewModalVisible: false, linkIdOrAddress: idOrAddress });
    setTimeout(async () => {
      Alert.alert('Disclaimer', 'By clicking Yes I consent to linking my ABHA' + idOrAddress + 'with health records', [
        { text: strings('doctor.button.capYes'), onPress: () => this.fetchMode() },
        { text: strings('doctor.button.capNo'), style: 'cancel' },
      ]);
    }, 200);
  }

  async fetchMode() {
    try {
      this.setState({ isLoading: true });

      let body = {
        abhaId: this.state.linkIdOrAddress == 'ID' ? this.state.abhaId : this.state.abhaNumber,
        relativeId: this.state.relativeID,
      };

      AppUtils.console('sdfxggfdsf', body, this.state.linkIdOrAddress, this.state.abhaId, this.state.abhaNumber);
      let response = await SHApiConnector.fetchModes(body);
      AppUtils.console('sdzdsxgfasfeggdfszd_123', response);
      if (response.data.statusCode == 202) {
        setTimeout(async () => {
          let modes = await SHApiConnector.fetchRelativeModes({ relativeId: this.state.relativeID });
          this.setState({ isLoading: false });
          if (modes.data.status) {
            this.setState({ modes: modes.data.data, showModeList: true });
          }
          AppUtils.console('sdzdsxgfasfeggdfszd', modes);
        }, 1000);
      } else {
        this.setState({ isLoading: false });
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  async getCardOtp() {
    var self = this;
    self.setState({ isViewModalVisible: false });
    let result = await this.getABHADetailsMobileOTP();
    if (result) {
      setTimeout(() => {
        self.setState({
          isOTPModalVisible: true,
          transactionId: result,
          isHealthCardClicked: true,
        });
      }, 1500);
    }
  }

  async getQrOTP() {
    this.setState({ isViewModalVisible: false });

    let result = await this.getABHADetailsMobileOTP();
    if (result) {
      setTimeout(() => {
        this.setState({
          isOTPModalVisible: true,
          transactionId: result,
          isHealthCardClicked: false,
        });
      }, 1500);
    }
  }

  async sharePdf() {
    let shareOptionsUrl = {
      title: 'My ABHA CARD',
      filename: 'AbhaCard',
      message: 'My ABHA CARD',
      url: `data:application/pdf;base64,${this.state.pdfBase64}`,
    };
    Share.open(shareOptionsUrl);
  }
  async shareQr() {
    let shareOptionsUrl = {
      title: 'My ABHA QR',
      message: 'My ABHA QR',
      url: `data:image/jpeg;base64,${this.state.qrImageUrl}`, // use image/jpeg instead of image/jpg
      // subject: 'Share information from your application'
    };
    Share.open(shareOptionsUrl);
  }
  toastTimer(message) {
    setTimeout(() => {
      Toast.show(message);
    }, 1000);
  }

  async getABHADetailsMobileOTP() {
    var self = this;
    try {
      let body = {
        authMethod: 'MOBILE_OTP',
        healthid: this.state.abhaId.replace('@sbx', ''),
        // "healthid":"joeJo"
      };

      AppUtils.console('BODDDy ', body);
      setTimeout(() => {
        this.setState({ isLoading: true });
      }, 200);

      let response = await SHApiConnector.getABHADetailsOtpVerfication(body);
      //  self.setState({ isLoading: false });
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 200);
      AppUtils.console('response ', response);

      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let transactionId = responseBody.data.txnId;
        AppUtils.console('txn  ', transactionId);

        return transactionId;
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  async generateHealthCard(txnId, otp) {
    var self = this;
    try {
      let body = {
        txnId: txnId,
        otp: otp,
      };
      AppUtils.console('generate health otp ', body);
      //  self.setState({ isLoading: true });
      setTimeout(() => {
        this.setState({ isLoading: true });
      }, 200);
      let response = await SHApiConnector.generateHealthCard(body);
      //  self.setState({ isLoading: false });
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 200);
      AppUtils.console('generate health card ', response);
      let responseBody = response.data;
      if (response.status && responseBody) {
        const buff = Buffer.from(responseBody, 'base64');
        let base64test = buff.toString('base64');
        setTimeout(() => {
          self.setState({
            pdfBase64: base64test,
            isOTPModalVisible: false,
            mobileSentOTP: '',
            isViewModalVisible: false,
            isPDFModalVisible: true,
          });
        }, 200);
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(strings('common.abha.try_again'));
        self.setState({ mobileSentOTP: '' });
      }
    } catch (e) {
      this.toastTimer(strings('common.abha.try_again'));
      self.setState({ isLoading: false, mobileSentOTP: '' });
    }
  }

  async generateQRCard(txnId, otp) {
    var self = this;
    try {
      let body = {
        txnId: txnId,
        otp: otp,
      };
      //  self.setState({ isLoading: true });
      setTimeout(() => {
        this.setState({ isLoading: true });
      }, 200);
      let response = await SHApiConnector.generateQRCard(body);
      //  self.setState({ isLoading: false });
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 200);
      let responseBody = response.data;
      if (response.status && responseBody) {
        try {
          const buff = Buffer.from(responseBody, 'base64');
          let base64QR = buff.toString('base64');
          setTimeout(() => {
            self.setState({
              qrImageUrl: base64QR,
              isImageModalVisible: true,
              isOTPModalVisible: false,
              mobileSentOTP: '',
              isViewModalVisible: false,
            });
          }, 200);
        } catch (e) {
          return;
        }
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
      }
    } catch (e) {
      this.toastTimer(strings('common.abha.try_again'));
      self.setState({ isLoading: false, mobileSentOTP: '' });
    }
  }

  async searchAbha() {
    var self = this;
    if (this.state.searchAbha === '') {
      this.toastTimer(strings('common.abha.enter_id_or_num'));
      return;
    }
    let body = {
      healthId: this.state.searchAbha,
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.searchAbha(body);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let temp = responseBody.data;
        self.setState({
          abhaId: temp.healthId,
          abhaNumber: temp.healthIdNumber,
          searchAbha: '',
        });
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
        self.setState({ searchAbha: '' });
      }
    } catch (e) {
      self.setState({ isLoading: false, aadharOTP: '', searchAbha: '' });
    }
  }

  openCalender() {
    var self = this;
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

  callOnSuccess = ({ firstname, lastname, mobilenumber, email, dob, gender, profileurl, healthid, healthidnumber } = {}) => {
    console.log(healthid, healthidnumber, firstname, lastname, email, mobilenumber, dob, gender, profileurl, 'health');
    if (this.props.relative == 'new') {
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
    } else {
      this.setState({
        abhaId: healthid,
        abhaNumber: healthidnumber,
      });
    }
    try {
      this.updateProfile();
    } catch (e) {
      AppUtils.console('EXCEPTIOn =>', e);
    }
    this.setGender(gender);
  };

  addNewDependent() {
    var self = this;
    let tempId = '';

    if (Array.isArray(this.state.selectedId)) {
      tempId = this.state.selectedId.find((item) => item.identificationType === this.state.userId);
    } else if (this.state.selectedId && typeof this.state.selectedId === 'object') {
      tempId = this.state.selectedId;
    }

    var profileDetails = {
      firstName: this.state.fName,
      lastName: this.state.lName,
      dateOfBirth: this.state.DOB,
      gender: this.state.gender,
      height: this.state.height,
      weight: this.state.weight,
      heightType: this.state.heightType,
      weightType: this.state.weightType,
      relation: this.state.relation,
      relationText: this.state.relationText,
      insuranceProvider: this.state.insurancePId,
      abhaId: this.state.abhaId != '' ? this.state.abhaId : null,
      abhaNumber: this.state.abhaNumber != '' ? this.state.abhaNumber : null,
      insuranceNumber: this.state.insuranceNumber,
      identificationType: tempId?._id ?? '',
      identificationNumber: this.state.userIdNum ?? '',
    };
    self.setState({ isLoading: true });
    SHApiConnector.addNewDependent(profileDetails, function (err, stat) {
      try {
        self.setState({ isLoading: false });
        if (stat) {
          if (stat.status) {
            self.showRelativeAddedMessage();
          } else if (stat.error_code == '10029') {
            self.showAlert(strings('string.error_code.error_10029'), true);
          } else if (stat.error_code == '10024') {
            self.showAlert(strings('string.error_code.error_10024'), true);
          } else if (stat.error_code == '10030') {
            self.showAlert(strings('string.error_code.error_10030'), true);
          } else if (stat.error_code == '10021') {
            self.showAlert(strings('string.error_code.error_10021'), true);
          } else if (stat.error_code == '10002') {
            self.showAlert(strings('string.error_code.error_10002'), true);
          } else if (stat.error_code === '20001') {
            self.showAlert(strings('string.error_code.error_20001'), true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  showAlert(msg, ispop) {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  validateData() {
    var isSelectInsurance = Platform.OS === 'ios' ? this.state.insuranceCompanyName === 'Select Insurance' : false;
    var relation = Platform.OS === 'ios' ? this.state.relationText : this.state.relation;
    if (Validator.isBlank(this.state.fName)) {
      this.showAlert(strings('string.mandatory.firstName'), true);
    } else if (Validator.isBlank(this.state.lName)) {
      this.showAlert(strings('string.mandatory.lastName'), true);
    } else if (this.state.email != '' && Validator.isBlank(this.state.email)) {
      this.showAlert(strings('string.mandatory.email'), true);
    } else if (this.state.email != '' && !Validator.validateEmail(this.state.email)) {
      this.showAlert(strings('string.mandatory.invalidEmail'), true);
    } else if (!Validator.validateNRIC(this.state.NRIC)) {
      this.showAlert(strings('string.mandatory.NRIC'), true);
    } else if (Validator.isBlank(this.state.gender)) {
      this.showAlert(strings('string.mandatory.gender'), true);
    } else if (Validator.isBlank(relation)) {
      this.showAlert(strings('string.mandatory.relation'), true);
    } else if (Validator.isValidHeightWeight(this.state.height, this.state.weight)) {
      this.showAlert('Invalid height or weight', true);
    } else if (Validator.isValidDOB(this.state.DOB, relation)) {
      this.showAlert(strings('string.mandatory.ageDifference'), true);
      this.setState({
        DOB: moment(new Date()).format('DD-MMM-YYYY'),
      });
    } else {
      var id = '';
      if (this.state.toggled) {
        if (isSelectInsurance || !this.state.insurancePId || this.state.insurancePId == '') {
          this.showAlert(strings('string.mandatory.insuranceCompany'), true);
        } else if (Validator.isBlank(this.state.insuranceNumber)) {
          this.showAlert(strings('string.mandatory.insuranceNumber'), true);
        } else {
          this.updateOrInsertUser();
        }
      } else if (this.state.userId !== '') {
        if (Validator.isBlank(this.state.userIdNum)) {
          this.showAlert(strings('string.mandatory.idNumber'), true);
        } else {
          this.updateOrInsertUser();
        }
      } else {
        this.updateOrInsertUser();
      }
    }
  }

  updateOrInsertUser() {
    if (this.props.relative == 'new') {
      this.addNewDependent();
    } else {
      this.updateProfile();
    }
  }

  updateProfile() {
    let tempId = '';

    if (Array.isArray(this.state.selectedId)) {
      tempId = this.state.selectedId.find((item) => item.identificationType === this.state.userId);
    } else if (this.state.selectedId && typeof this.state.selectedId === 'object') {
      tempId = this.state.selectedId;
    }

    var profileDetails = {
      firstName: this.state.fName,
      lastName: this.state.lName,
      dateOfBirth: this.state.DOB,
      gender: this.state.gender,
      height: this.state.height,
      weight: this.state.weight,
      heightType: this.state.heightType,
      weightType: this.state.weightType,
      NRIC: this.state.NRIC,
      email: this.state.email,
      relation: this.state.relation,
      relationText: this.state.relationText,
      relativeId: this.state.relativeID,
      insuranceProvider: this.state.insurancePId,
      insuranceNumber: this.state.insuranceNumber,
      abhaId: this.state.abhaId != '' ? this.state.abhaId : null,
      abhaNumber: this.state.abhaNumber != '' ? this.state.abhaNumber : null,
      identificationType: tempId?._id ?? '',
      identificationNumber: this.state.userIdNum ?? '',
    };

    var self = this;
    if (this.state.relationText === 'Self') {
      profileDetails.transportProviderId = this.state.selectedProviderId && this.state.transportProvider ? this.state.selectedProviderId : 'ALL';
      profileDetails.companyName = this.state.companyName;
    }
    self.setState({ isLoading: true });
    AppUtils.console('xdcszsfxvdf  relative profile', profileDetails);
    SHApiConnector.updateProfile(profileDetails, function (err, stat) {
      try {
        AppUtils.console('xdcszsfxvdf1234', stat);
        self.setState({ isLoading: false });
        if (stat) {
          if (stat.status) {
            self.showMessage();
          } else if (stat.error_code == '10029') {
            self.showAlert(strings('string.error_code.error_10029'), true);
          } else if (stat.error_code == '10024') {
            self.showAlert(strings('string.error_code.error_10024'), true);
          } else if (stat.error_code == '10030') {
            self.showAlert(strings('string.error_code.error_10030'), true);
          } else if (stat.error_code == '10021') {
            self.showAlert(strings('string.error_code.error_10021'), true);
          } else if (stat.error_code == '10002') {
            self.showAlert(strings('string.error_code.error_10002'), true);
          } else if (stat.error_code == '10033') {
            self.showAlert(strings('string.error_code.error_10033'), true);
          }
        }
      } catch (e) {
        console.log('EditProfileError:', e);
        self.setState({ isLoading: false });
      }
    });
  }

  showMessage() {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(self, strings('common.common.success'), strings('common.common.profileUpdated'), strings('doctor.button.ok'), function () {
        self.openProfile();
      });
    }, 500);
  }

  showRelativeAddedMessage() {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(self, strings('common.common.success'), 'Relative added successfully', strings('doctor.button.ok'), function () {
        self.openProfile();
      });
    }, 500);
  }

  openProfile() {
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
      case 'QuickRequest':
        Actions.QuickRequest();
        break;
      case 'CaregiverHome':
        Actions.caregiverTab();
    }
  }

  async userDetails() {
    var self = this;
    self.setState({ isLoading: true });
    var relativeId = {
      relativeId: this.props.relativeId,
    };

    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);
    const data = {
      country: user.country,
    };

    const getIdTypesResponse = await SHApiConnector.getIdList(data);
    const idTypes = getIdTypesResponse?.data?.data?.idTypes;
    console.log(idTypes, 'idTypes');

    if (idTypes) {
      const dataIdentificationType = idTypes.map((item) => {
        return { value: item.identificationType };
      });

      this.setState({ userIdTypes: dataIdentificationType, selectedId: idTypes });
    }

    if ((this.props.relativeId == undefined || this.props.relativeId == null) && (this.props.relative == undefined || this.props.relative == null)) {
      SHApiConnector.fetchProfile(function (err, stat) {
        console.log(stat.userDetails[0].relativeDetails, 'stat');
        if (stat.userDetails[0].relativeDetails.identification) {
          const tempUserIdType = stat.userDetails[0].relativeDetails.identification;
          const userIDType = self.state.selectedId.find((item) => item._id === tempUserIdType.type);
          if (userIDType) {
            const matchedIdNum = tempUserIdType.type === userIDType._id ? tempUserIdType.number : '';
            self.setState({ selectedId: userIDType, showInput: true, userIdNum: matchedIdNum, isLoading: false });
          } else {
            console.warn('No matching userIDType found for', tempUserIdType.type);
            self.setState({ showInput: false, isLoading: false });
          }
        }

        self.setState({ isLoading: false });

        try {
          if (stat) {
            let userDetails = stat.userDetails[0].relativeDetails;
            AppUtils.console('UserDetailsRelative', userDetails);
            self.setState(
              {
                countryCode: stat.userDetails[0].countryCode,
              },
              () => self.getTransportProvider()
            );

            if (userDetails) {
              let dob = new Date(userDetails.dateOfBirth) ? new Date(userDetails.dateOfBirth) : new Date();
              var gender = userDetails.gender == 'Male' ? 'Male' : 'Female';
              var maleColor = userDetails.gender == 'Male' ? '#FF4848' : '#d3d3d3';
              var femaleColor = userDetails.gender == 'Female' ? '#FF4848' : '#d3d3d3';
              if (
                userDetails.insuranceNumber == null ||
                userDetails.insuranceNumber == undefined ||
                userDetails.insuranceProvider == '' ||
                userDetails.insuranceProvider == null
              ) {
                self.setState({
                  fName: userDetails.firstName == undefined ? '' : userDetails.firstName,
                  lName: userDetails.lastName == undefined ? '' : userDetails.lastName,
                  DOB: dob,
                  gender: gender,
                  email: stat.userDetails && stat.userDetails[0].email ? stat.userDetails[0].email : '',
                  maleTextColor: maleColor,
                  femaleTextColor: femaleColor,
                  height: userDetails.height == undefined ? '' : userDetails.height,
                  weight: userDetails.weight == undefined ? '' : userDetails.weight,
                  weightType: userDetails.weightType == '' ? 'kgs' : userDetails.weightType,
                  heightType: userDetails.heightType == '' ? 'cms' : userDetails.heightType,
                  NRIC: userDetails.NRIC == undefined ? '' : userDetails.NRIC,
                  relativeID: userDetails._id == undefined ? '' : userDetails._id,
                  clinicProfile: stat.userDetails[0].profilePic,
                  relation: 'self',
                  relationText: self.props.selfProfile == true ? 'Self' : 'Select Relation',
                  companyName: stat.userDetails && stat.userDetails[0].companyName ? stat.userDetails[0].companyName : '',
                  toggled: true,
                  abhaId: userDetails.abhaId != null && userDetails.abhaId != undefined ? userDetails.abhaId : '',
                  abhaNumber: userDetails.abhaNumber != null && userDetails.abhaNumber != undefined ? userDetails.abhaNumber : '',
                });
              } else {
                self.setState({
                  fName: userDetails.firstName == undefined ? '' : userDetails.firstName,
                  lName: userDetails.lastName == undefined ? '' : userDetails.lastName,
                  DOB: dob,
                  gender: gender,
                  maleTextColor: maleColor,
                  femaleTextColor: femaleColor,
                  email: stat.userDetails && stat.userDetails[0].email ? stat.userDetails[0].email : '',
                  height: userDetails.height == undefined ? '' : userDetails.height,
                  weight: userDetails.weight == undefined ? '' : userDetails.weight,
                  weightType: userDetails.weightType == '' ? 'kgs' : userDetails.weightType,
                  heightType: userDetails.heightType == '' ? 'cms' : userDetails.heightType,
                  NRIC: userDetails.NRIC == undefined ? '' : userDetails.NRIC,
                  relativeID: userDetails._id == undefined ? '' : userDetails._id,
                  relation: 'self',
                  relationText: self.props.selfProfile ? 'Self' : 'Select Relation',
                  toggled: true,
                  insuranceNumber: userDetails.insuranceNumber,
                  clinicProfile: stat.userDetails[0].profilePic,
                  insurancePId: userDetails.insuranceProvider,
                  insuranceText: AppUtils.getInsuranceLabel(userDetails.insuranceProvider),
                  companyName: stat.userDetails && stat.userDetails[0].companyName ? stat.userDetails[0].companyName : '',
                  abhaId: userDetails.abhaId != null && userDetails.abhaId != undefined ? userDetails.abhaId : '',
                  abhaNumber: userDetails.abhaNumber != null && userDetails.abhaNumber != undefined ? userDetails.abhaNumber : '',
                });
                self.setInsuranceData(userDetails.insuranceProvider);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    } else if (this.props.relative == 'new') {
      self.setState({ isLoading: false });

      try {
        self.setState({
          fName: '',
          lName: '',
          DOB: AppUtils.currentDateTime(),
          gender: gender,
          maleTextColor: maleColor,
          femaleTextColor: femaleColor,
          email: '',
          NRIC: '',
          relativeID: '',
          relation: '',
          relationText: '',
          toggled: true,
          companyName: '',
        });
      } catch (e) {}
    } else {
      SHApiConnector.fetchProfileUsingId(relativeId, function (err, stat) {
        self.setState({ isLoading: false });
        try {
          if (stat) {
            console.log('UserDetailsRelative11', stat.relativeDetails[0]);
            if (stat.relativeDetails[0].identification) {
              const tempUserIdType = stat.relativeDetails[0].identification;

              const userIDType = self.state.selectedId.find((item) => item._id === tempUserIdType.type);
              if (userIDType) {
                const matchedIdNum = tempUserIdType.type === userIDType._id ? tempUserIdType.number : '';
                self.setState({ selectedId: userIDType, showInput: true, userIdNum: matchedIdNum, isLoading: false });
              }
            }

            self.setState({ isLoading: false });

            let userDetails = stat.relativeDetails[0];
            let dob = moment(userDetails.dateOfBirth);
            var gender = userDetails.gender == 'Male' ? 'Male' : 'Female';
            var maleColor = userDetails.gender == 'Male' ? '#FF4848' : '#d3d3d3';
            var femaleColor = userDetails.gender == 'Female' ? '#FF4848' : '#d3d3d3';
            if (
              userDetails.insuranceNumber == null ||
              userDetails.insuranceNumber == undefined ||
              userDetails.insuranceProvider == '' ||
              userDetails.insuranceProvider == null
            ) {
              self.setState({
                fName: userDetails.firstName,
                lName: userDetails.lastName,
                DOB: dob,
                gender: gender,
                email: stat.userDetails && stat.userDetails[0].email ? stat.userDetails[0].email : '',
                maleTextColor: maleColor,
                femaleTextColor: femaleColor,
                relationText: userDetails.spouse,
                NRIC: userDetails.NRIC,
                relativeID: userDetails._id,
                relation: userDetails.spouse,
                relativePic: userDetails.profilePic,
                toggled: true,
                height: userDetails.height == undefined ? '' : userDetails.height,
                weight: userDetails.weight == undefined ? '' : userDetails.weight,
                weightType: userDetails.weightType == undefined ? 'kgs' : userDetails.weightType,
                heightType: userDetails.heightType == undefined ? 'cms' : userDetails.heightType,
                insuranceNumber: userDetails.insuranceNumber,
                fullName: userDetails.firstName + ' ' + userDetails.lastName,
                companyName: stat.userDetails && stat.userDetails[0].companyName ? stat.userDetails[0].companyName : '',
                abhaId: userDetails.abhaId != null && userDetails.abhaId != undefined ? userDetails.abhaId : '',
                abhaNumber: userDetails.abhaNumber != null && userDetails.abhaNumber != undefined ? userDetails.abhaNumber : '',
              });
            } else {
              self.setState({
                fName: userDetails.firstName,
                lName: userDetails.lastName,
                DOB: dob,
                gender: gender,
                email: stat.userDetails && stat.userDetails[0].email ? stat.userDetails[0].email : '',
                maleTextColor: maleColor,
                femaleTextColor: femaleColor,
                NRIC: userDetails.NRIC,
                relativeID: userDetails._id,
                relation: userDetails.spouse,
                relationText: userDetails.spouse,
                toggled: true,
                height: userDetails.height == undefined ? '' : userDetails.height,
                weight: userDetails.weight == undefined ? '' : userDetails.weight,
                weightType: userDetails.weightType == undefined ? 'kgs' : userDetails.weightType,
                heightType: userDetails.heightType == undefined ? 'cms' : userDetails.heightType,
                relativePic: userDetails.profilePic,
                insuranceNumber: userDetails.insuranceNumber,
                insurancePId: userDetails.insuranceProvider,
                insuranceText: AppUtils.getInsuranceLabel(userDetails.insuranceProvider),
                fullName: userDetails.firstName + ' ' + userDetails.lastName,
                companyName: stat.userDetails && stat.userDetails[0].companyName ? stat.userDetails[0].companyName : '',
                abhaId: userDetails.abhaId != null && userDetails.abhaId != undefined ? userDetails.abhaId : '',
                abhaNumber: userDetails.abhaNumber != null && userDetails.abhaNumber != undefined ? userDetails.abhaNumber : '',
              });
              self.setInsuranceData(userDetails.insuranceProvider);
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  cancel() {
    Actions.pop();
  }

  switch(val) {
    this.setState({ toggled: val });
  }

  switchTransportProvider(val) {
    this.setState({ transportProvider: val });
  }

  setInsuranceData(insuranceKey) {
    var self = this;
    this.state.insuranceProviders.map(function (value) {
      if (insuranceKey == value._id) {
        self.setState({
          insuranceCompanyName: value.companyName,
          insurancePId: insuranceKey,
        });
      }
    });
  }

  selectedTransport(index, data) {
    this.setState({
      selectedProvider: data[index].companyName,
      selectedProviderId: data[index]._id,
    });
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
        AppUtils.console('ImagePicker', source, response);
        if (Platform.OS == 'ios') {
          if (this.props.relative != undefined || this.props.relativeId != undefined) {
            self.uploadRelativeImage(response);
          } else {
            self.uploadImage(response);
          }
        } else {
          if (this.props.relative != undefined || this.props.relativeId != undefined) {
            self.setState({
              relativePic: source.uri,
            });
            self.uploadRelativeImage(response);
          } else {
            self.setState({
              clinicProfile: source.uri,
            });
            self.uploadImage(response);
          }
        }
      }
    });
  }

  handleChange = (value) => {
    
    this.setState({ userId: value, showInput: true,userIdNum:'' });
  };

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
          if (this.props.relative != undefined || this.props.relativeId != undefined) {
            self.uploadRelativeImage(response);
          } else {
            self.uploadImage(response);
          }
        } else {
          if (this.props.relative != undefined || this.props.relativeId != undefined) {
            self.setState({
              relativePic: source.uri,
            });
            self.uploadRelativeImage(response);
          } else {
            self.setState({
              clinicProfile: source.uri,
            });
            self.uploadImage(response);
          }
        }
      }
    });
  }

  uploadImage(response) {
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
    self.setState({ isLoading: true });
    SHApiConnector.uploadProfileImage(form, function (err, stat) {
      try {
        self.setState({ isLoading: false });
        if (!err && stat && stat.status) {
          self.userDetails();
        } else if (stat.error_code) {
          self.showAlert(strings('common.common.uploadFailed'), true);
        }
      } catch (err) {
        AppUtils.console(err);
        self.showAlert(strings('common.common.uploadFailed'), true);
      }
    });
  }

  uploadRelativeImage(response) {
    var self = this;
    let imageInfo = response.assets[0];
    var source = imageInfo.uri;
    const form = new FormData();
    var imgObj = {
      name: imageInfo.fileName ? imageInfo.fileName : 'XXXXX.jpg',
      uri: source,
      type: imageInfo.type,
    };
    var relativeId = this.state.relativeID == undefined ? '' : this.state.relativeID;
    form.append('image', imgObj);
    self.setState({ isLoading: true });
    SHApiConnector.uploadRelativeProfileImage(form, relativeId, function (err, stat) {
      try {
        self.setState({ isLoading: false });
        if (!err && stat.status) {
          self.userDetails();
        } else if (stat.error_code) {
          self.showAlert(strings('common.common.uploadFailed'), true);
        }
      } catch (err) {
        self.showAlert(strings('common.common.uploadFailed'), true);
      }
    });
  }

  render() {
    let insuranceProviders = this.state.insuranceProviders.map((d, i) => {
      return <Picker.Item key={d._id} value={d._id} label={d.companyName} />;
    });

    var insuranceProviderIOS = this.state.insuranceProviders.map((d, i) => {
      return i == 0 ? { key: d._id, section: true, label: d.companyName } : { key: d._id, label: d.companyName };
    });

    let headerText = this.props.relative == 'new' ? 'Add A New Dependent' : 'Edit Profile';

    AppUtils.console('sdfxvsdwe', this.state);
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === 'ios' ? (AppStyles.isX ? 180 : 0) : 70}
        behavior={Platform.OS === 'ios' && 'padding'}
        enabled
        style={{
          flex: 1,
          flexDirection: 'column',
          width: width,
          backgroundColor: AppColors.whiteColor,
        }}
      >
        {Platform.OS === 'ios' ? this.openIOSCalender() : this.openAndroidCalender()}
        <ScrollView style={styles.registration} showsVerticalScrollIndicator={false}>
          {(this.props.relativeId == undefined || this.props.relativeId == null) &&
          (this.props.relative == undefined || this.props.relative == null) ? (
            <View
              style={{
                height: verticalScale(120),
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
                  source={{
                    uri: AppUtils.handleNullImg(this.state.clinicProfile),
                  }}
                />
              </TouchableHighlight>
            </View>
          ) : (
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
                  source={{
                    uri: AppUtils.handleNullImg(this.state.relativePic),
                  }}
                />
              </TouchableHighlight>
            </View>
          )}

          <TextInput
            allowFontScaling={false}
            placeholder={strings('doctor.text.firstName')}
            style={styles.inputStyle}
            editable={!this.state.isJustLoginUser}
            value={this.state.fName}
            placeholderTextColor={AppColors.textGray}
            onChangeText={(input) => this.setState({ fName: input })}
            returnKeyType={'next'}
            underlineColorAndroid={'white'}
            onSubmitEditing={(event) => this.refs.LastName.focus()}
          ></TextInput>
          <TextInput
            allowFontScaling={false}
            ref="LastName"
            placeholder={strings('doctor.text.lastName')}
            style={styles.inputStyle}
            editable={!this.state.isJustLoginUser}
            placeholderTextColor={AppColors.textGray}
            value={this.state.lName}
            onChangeText={(input) => this.setState({ lName: input })}
            returnKeyType={'next'}
            underlineColorAndroid={'white'}
          ></TextInput>
          {this.state.relationText === 'Self' ? (
            <TextInput
              allowFontScaling={false}
              ref="email"
              placeholder={strings('doctor.text.email')}
              style={styles.inputStyle}
              editable={!this.state.isJustLoginUser}
              placeholderTextColor={AppColors.textGray}
              value={this.state.email}
              onChangeText={(input) => this.setState({ email: input })}
              returnKeyType={'next'}
              underlineColorAndroid={'white'}
            />
          ) : null}

          {this.state.userIdTypes.length > 0 && (
            <View style={{ marginLeft: wp(0.5), marginRight: wp(0.5) }}>
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

                <Image resizeMode={'contain'} style={{ height: hp(2.5), width: hp(2.5) }} source={require('../../../assets/images/arrow_down.png')} />
              </TouchableOpacity>
            </View>
          )}
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
          {(this.state.countryCode === '91' || this.props.userCountryCode === '91') && this.state.enableAbha && this.state.abhaNumber !== '' && (
            <TextInput
              allowFontScaling={false}
              style={styles.inputStyle}
              value={this.state.abhaNumber}
              editable={false}
              returnKeyType={'next'}
              underlineColorAndroid={'white'}
            />
          )}

          <View style={styles.pdfModal}>
            <Modal
              id="view_modal"
              animationType="slide"
              transparent={true}
              visible={this.state.isPDFModalVisible}
              onRequestClose={() => {
                this.setState({ isPDFModalVisible: false });
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.pdfContainer}>
                  <TouchableOpacity style={styles.shareStyle} onPress={() => this.setState({ isPDFModalVisible: false })}>
                    <Image resizeMode="contain" style={styles.qrcodeStyle} source={require('../../../assets/images/cancel.png')} />
                  </TouchableOpacity>

                  <Pdf
                    source={{
                      uri: 'data:application/pdf;base64,' + this.state.pdfBase64,
                    }}
                    onLoadComplete={(numberOfPages, filePath) => {
                      AppUtils.console(`number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                      AppUtils.console(`current page: ${page}`);
                    }}
                    onError={(error) => {
                      AppUtils.console('error', error);
                    }}
                    style={styles.pdfStyle}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {this.state.countryCode === '91' && this.state.enableAbha && this.state.abhaId !== '' && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TextInput
                allowFontScaling={false}
                style={styles.inputStyle}
                value={this.state.abhaId}
                editable={false}
                returnKeyType={'next'}
                underlineColorAndroid={'white'}
              />

              <SHButtonDefault
                btnText={'View'}
                btnType={'normal'}
                style={{
                  alignSelf: 'center',
                  borderRadius: wp(2),
                  height: hp(4),
                  width: wp(26),
                  marginTop: hp(3),
                }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() => {
                  setTimeout(() => {
                    this.setState({ isViewModalVisible: true });
                  }, 100);
                }}
              />
            </View>
          )}
          {/* <Text style={{color:"red"}}>{this.state.countryCode+this.props.userCountryCode}</Text> */}

          {this.state.isViewModalVisible && (
            <View style={styles.centeredView}>
              <Modal
                id="view_modal"
                animationType="slide"
                transparent={true}
                visible={this.state.isViewModalVisible}
                onRequestClose={() => {
                  this.setState({ isViewModalVisible: false });
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.buttonsSheet}>
                    <TouchableHighlight
                      style={[{ alignSelf: 'flex-end' }]}
                      underlayColor="transparent"
                      onPress={() => this.setState({ isViewModalVisible: false })}
                    >
                      <Image
                        source={require('../../../assets/images/close.png')}
                        style={{
                          height: hp(2),
                          width: hp(2),
                          marginRight: wp(1),
                        }}
                      />
                    </TouchableHighlight>
                    <SHButtonDefault
                      btnText={'Get Card'}
                      btnType={'normal'}
                      style={styles.getCardButtonStyle}
                      btnTextColor={AppColors.whiteColor}
                      btnPressBackground={AppColors.primaryColor}
                      onBtnClick={() => this.getCardOtp()}
                    />
                    <SHButtonDefault
                      btnText={'Get QRCode'}
                      btnType={'normal'}
                      style={styles.getCardButtonStyle}
                      btnTextColor={AppColors.whiteColor}
                      btnPressBackground={AppColors.primaryColor}
                      onBtnClick={() => this.getQrOTP()}
                    />

                    {/* <SHButtonDefault
                      btnText={"Link ABHA ID"}
                      btnType={"normal"}
                      style={styles.getCardButtonStyle}
                      btnTextColor={AppColors.whiteColor}
                      btnPressBackground={AppColors.primaryColor}
                      onBtnClick={() => this.linkDisclaimer('ID')}
                    /> */}

                    <SHButtonDefault
                      btnText={'Link ABHA'}
                      btnType={'normal'}
                      style={styles.getCardButtonStyle}
                      btnTextColor={AppColors.whiteColor}
                      btnPressBackground={AppColors.primaryColor}
                      onBtnClick={() => this.linkDisclaimer('ID')}
                    />
                  </View>
                </View>
              </Modal>
            </View>
          )}

          {this.state.qrImageUrl !== '' && (
            <View style={styles.centeredView}>
              <Modal
                id="image_modal"
                animationType="slide"
                transparent={true}
                visible={this.state.isImageModalVisible}
                onRequestClose={() => {
                  this.setState({ isImageModalVisible: false });
                }}
              >
                <View style={styles.centeredView}>
                  <View style={{ position: 'relative' }}>
                    <View style={styles.abhaQrcontainer}>
                      <Image
                        source={{
                          uri: 'data:image/png;base64,' + this.state.qrImageUrl,
                          //  this.state.qrImageUrl
                          //  'https://www.ginifab.com/feeds/qr_code/img/qr_code_scanner.jpg'
                          // uri:this.state.qrImageUrl
                        }}
                        style={styles.qrImageStyle}
                      />
                      <TouchableOpacity style={styles.qrImageShareStyle} onPress={() => this.setState({ isImageModalVisible: false })}>
                        <Image resizeMode="contain" style={styles.shareImageStyle} source={require('../../../assets/images/cancel.png')} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          )}

          <View style={styles.centeredView}>
            <Modal
              id="otp_modal"
              animationType="slide"
              transparent={true}
              visible={this.state.isOTPModalVisible}
              onRequestClose={() => this.setState({ isOTPModalVisible: false })}
            >
              <View style={styles.centeredView}>
                <View style={styles.otpContainer}>
                  <TouchableHighlight
                    style={[{ alignSelf: 'flex-end' }]}
                    underlayColor="transparent"
                    onPress={() => this.setState({ isOTPModalVisible: false })}
                  >
                    <Image
                      source={require('../../../assets/images/close.png')}
                      style={{
                        height: hp(2),
                        width: hp(2),
                        marginRight: wp(1),
                      }}
                    />
                  </TouchableHighlight>
                  <Text style={styles.otpEnterText}>{strings('common.abha.otp_enter')}</Text>
                  <Text style={styles.otpEnterMobileText}>{strings('common.abha.enter_otp_mobile')}</Text>

                  <TextInput
                    allowFontScaling={false}
                    placeholder={strings('common.abha.otp_enter')}
                    keyboardType={'numeric'}
                    style={styles.otpFieldStyle}
                    placeholderTextColor={AppColors.textGray}
                    autoCapitalize={'none'}
                    value={this.state.mobileSentOTP}
                    maxLength={8}
                    onChangeText={(input) => {
                      if (AppUtils.isNumber(input) || input === '') {
                        this.setState({ mobileSentOTP: input });
                      }
                    }}
                    returnKeyType={'next'}
                    underlineColorAndroid={'transparent'}
                  />
                  <SHButtonDefault
                    btnText={strings('common.abha.verify')}
                    btnType={'normal'}
                    style={styles.verifyOtpButton}
                    btnTextColor={AppColors.whiteColor}
                    btnPressBackground={AppColors.primaryColor}
                    onBtnClick={async () => {
                      if (this.state.mobileSentOTP === '') {
                        this.toastTimer('Please enter the otp');
                        return;
                      }
                      setTimeout(() => {
                        this.setState({ isOTPModalVisible: false });
                      }, 100);
                      this.state.isAuthInitCode
                        ? this.confirmUserAuth()
                        : this.state.isHealthCardClicked
                        ? this.generateHealthCard(this.state.transactionId, this.state.mobileSentOTP)
                        : this.generateQRCard(this.state.transactionId, this.state.mobileSentOTP);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {this.state.relationText === 'Self' ? (
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
            />
          ) : null}
          {this.state.countryCode === '91' &&
            this.state.enableAbha &&
            (this.state.abhaId == '' || this.state.abhaNumber == '') &&
            !this.state.isLoading && (
              <View style={styles.abhaFieldView}>
                <View style={styles.searchButtonWithAbha}>
                  <TextInput
                    allowFontScaling={false}
                    ref="generate_abha"
                    flex={1}
                    placeholder={strings('common.abha.abha_optional')}
                    style={styles.inputStyle}
                    placeholderTextColor={AppColors.textGray}
                    autoCapitalize={'none'}
                    onChangeText={(input) => this.setState({ searchAbha: input })}
                    underlineColorAndroid={'white'}
                  />
                  <SHButtonDefault
                    btnText={'Search'}
                    btnType={'normal'}
                    style={styles.searchButtonStyle}
                    btnTextColor={AppColors.whiteColor}
                    btnPressBackground={AppColors.primaryColor}
                    onBtnClick={() => {
                      this.searchAbha();
                    }}
                  />
                </View>

                {this.state.searchAbha === '' && (
                  <SHButtonDefault
                    btnText={strings('common.abha.generate')}
                    btnType={'normal'}
                    style={styles.generateAbha}
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

          <TouchableHighlight
            onPress={() => {
              if (this.state.isJustLoginUser) {
                return;
              }
              this.openCalender();
            }}
            underlayColor="transparent"
          >
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>{strings('doctor.text.dob')}</Text>
              <Text style={styles.date}>{moment(this.state.DOB).format('DD-MMM-YYYY')}</Text>
            </View>
          </TouchableHighlight>
          <View style={styles.genderView}>
            <Text style={styles.selectGender}>{strings('doctor.text.gender')}</Text>
            <Text
              style={[styles.male, { color: this.state.maleTextColor }]}
              onPress={() => {
                if (this.state.isJustLoginUser) {
                  return;
                }
                this.setGender('Male');
              }}
            >
              {strings('doctor.text.male')}
            </Text>
            <Text
              style={[styles.female, { color: this.state.femaleTextColor }]}
              onPress={() => {
                if (this.state.isJustLoginUser) {
                  return;
                }
                this.setGender('Female');
              }}
            >
              {strings('doctor.text.female')}
            </Text>
          </View>
          {this.bmiView()}
          {Platform.OS === 'ios' ? (
            this.state.relationText == 'Self' ? (
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
                <Text style={styles.date}>{this.state.relationText}</Text>
              </View>
            ) : (
              <View>
                <ModalSelector
                  data={this.state.relationData}
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
                    AppUtils.console('sdffxc345yxbc', option, this.state.relationText);
                    this.setState({
                      relation: AppUtils.getRelationVal(option.label),
                      relationText: AppUtils.getRelationVal(option.label),
                    });
                  }}
                >
                  <View style={styles.dobStyle}>
                    <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
                    <Text style={styles.date}>{this.state.relationText}</Text>
                  </View>
                </ModalSelector>
              </View>
            )
          ) : (
            <View style={{ borderBottomWidth: 0, borderBottomColor: '#D3D3D3' }}>
              {this.state.relation == 'Self' || this.state.relation == 'self' ? (
                <View style={styles.dobStyle1}>
                  <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
                  <Text style={styles.date}>{this.state.relation}</Text>
                </View>
              ) : this.props.selfProfile ? (
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

          <View
            style={{
              flexDirection: 'row',
              marginTop: verticalScale(50),
              width: width,
            }}
          >
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
                renderActiveText={false}
                renderInActiveText={false}
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
                      borderBottomWidth: 0,
                      borderBottomColor: '#D3D3D3',
                    }}
                  >
                    <Picker
                      style={styles.picker}
                      selectedValue={this.state.insurancePId}
                      onValueChange={(itemValue, itemIndex) => this.setState({ insurancePId: itemValue })}
                    >
                      {insuranceProviders}
                    </Picker>
                  </View>
                  <TextInput
                    allowFontScaling={false}
                    placeholderTextColor={AppColors.textGray}
                    placeholder={strings('doctor.text.insuranceNum')}
                    style={[styles.NRIC, { textAlign: isRTL ? 'right' : 'auto' }]}
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
          {this.state.relationText === 'Self' ? (
            <View
              style={{
                flexDirection: 'row',
                marginTop: verticalScale(50),
                width: width,
              }}
            >
              <Text style={styles.holderText}>{strings('common.common.selectTransport')}</Text>
              <View style={styles.toggleStyle}>
                <Switch
                  onValueChange={(value) => this.switchTransportProvider(value)}
                  value={this.state.transportProvider}
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
                  renderActiveText={false}
                  renderInActiveText={false}
                  switchLeftPx={2}
                  switchRightPx={2}
                  switchWidthMultiplier={2}
                />
              </View>
            </View>
          ) : null}
          {this.state.transportProvider ? (
            <TouchableOpacity onPress={() => this.refs.providerDropdown.onPress()} style={styles.providerStyle}>
              <Dropdown
                ref={'providerDropdown'}
                label=""
                textColor={AppColors.blackColor}
                itemColor={AppColors.blackColor}
                fontFamily={AppStyles.fontFamilyMedium}
                dropdownPosition={0}
                dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                rippleCentered={false}
                dropdownMargins={{ min: 8, max: 16 }}
                baseColor={'transparent'}
                value={this.state.selectedProvider ? this.state.selectedProvider : 'Select Provider'}
                onChangeText={(value, index, data) => this.selectedTransport(index, data)}
                pickerStyle={{
                  width: wp(89),
                  height: hp(40),
                }}
                containerStyle={{
                  width: wp(80),
                  marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                  justifyContent: 'center',
                }}
                data={this.state.transportProviderList}
              />
              <Image
                resizeMode={'contain'}
                style={{
                  height: hp(1.8),
                  width: hp(1.8),
                  marginLeft: wp(7),
                  tintColor: AppColors.greyColor,
                }}
                source={require('../../../assets/images/drop_black.png')}
              />
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </ScrollView>
        {this.modeList()}
        {this.footer()}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </KeyboardAvoidingView>
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

  modeList() {
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showModeList}
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
                      color: AppColors.primaryColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      fontSize: 20,
                      textAlign: 'center',
                      marginLeft: wp(4),
                    }}
                  >
                    {'Select Linking Mode'}
                    {/* Translation req */}
                  </Text>
                </View>

                <FlatList
                  data={this.state.modes}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item, index) => this.modeListView(item, index)}
                  extraData={this.state}
                />
              </View>
            </View>
            <TouchableHighlight onPress={() => this.setState({ showModeList: false })} underlayColor="transparent">
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

  modeListView(item) {
    if (item.item == 'DEMOGRAPHICS') {
      return null;
    } else {
      return (
        <View
          style={{
            height: hp(6),
            backgroundColor: AppColors.whiteColor,
            borderRadius: moderateScale(15),
            marginLeft: moderateScale(3),
            marginRight: moderateScale(10),
            alignItems: 'flex-start',
            flexDirection: 'row',
          }}
        >
          <TouchableHighlight
            onPress={() => this.selectMode(item.item)}
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
              <View style={{ alignSelf: 'center', marginLeft: wp(5) }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: moderateScale(16),
                    color: AppColors.blackColor,
                    width: wp(56),
                  }}
                  numberOfLines={1}
                >
                  {item.item}{' '}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        </View>
      );
    }
  }

  async selectMode(mode) {
    try {
      this.setState({ showModeList: false });
      setTimeout(async () => {
        this.setState({ isLoading: true });
        let body = {
          abhaId: this.state.linkIdOrAddress == 'ID' ? this.state.abhaId : this.state.abhaNumber,
          relativeId: this.state.relativeID,
          selectedMode: mode,
        };

        AppUtils.console('sdfxggfdsf_123', body, this.state.linkIdOrAddress, this.state.abhaId, this.state.abhaNumber);

        let response = await SHApiConnector.userAuthInit(body);
        this.setState({ isLoading: false });
        if (response.data.statusCode == 202) {
          setTimeout(() => {
            this.setState({ isAuthInitCode: true, isOTPModalVisible: true });
          }, 200);
        }
      }, 200);
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  confirmUserAuth() {
    try {
      this.setState({ showModeList: false });
      setTimeout(async () => {
        this.setState({ isLoading: true });
        let body = {
          passcode: this.state.mobileSentOTP,
          relativeId: this.state.relativeID,
        };
        let response = await SHApiConnector.userAuthConfirm(body);
        this.setState({ isLoading: false, isAuthInitCode: false, mobileSentOTP: '' });

        if (response.data.statusCode == 202) {
          Alert.alert('', 'Your ABHA Number is linked successfully');
        } else {
          Alert.alert('', response.data.data.message);
        }
      }, 200);
    } catch (error) {
      this.setState({ isLoading: false, isAuthInitCode: false, mobileSentOTP: '' });
    }
  }

  medicalRecords() {
    AppUtils.console('dfsfserfvdf243refd', this.props, this.state);
    AppUtils.console('dfsfserfvdf243refd_54', this.state.relativeID);
    Actions.MedicalRecords({ relativeId: this.state.relativeID });
  }

  footer() {
    return (
      <View style={styles.footer}>
        {this.props.relative == 'new' ? null : (
          <SHButtonDefault
            btnText={strings('common.common.medicalRecords')}
            btnType={'border-only'}
            style={{
              borderRadius: wp(2),
              marginRight: moderateScale(30),
              width: wp(40),
              borderColor: AppColors.primaryColor,
            }}
            btnTextColor={AppColors.primaryColor}
            btnPressBackground={'transparent'}
            onBtnClick={() => this.medicalRecords()}
          />
        )}

        <SHButtonDefault
          btnText={strings('common.common.updateProfile')}
          btnType={'normal'}
          style={{ width: wp(40), borderRadius: wp(2) }}
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
    margin: moderateScale(10),
  },
  shareStyle: {
    height: hp(5),
    width: wp(7),
    position: 'absolute',
    top: wp(2),
    right: wp(3),
  },
  verifyOtpButton: {
    alignSelf: 'center',
    borderRadius: wp(2),
    height: hp(4),
    width: wp(35),
  },
  searchButtonWithAbha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButtonStyle: {
    alignSelf: 'center',
    borderRadius: wp(2),
    height: hp(4),

    width: wp(28),
    marginTop: hp(2),
  },
  otpFieldStyle: {
    height: hp(7),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.blackColor,
    borderStartWidth: hp(0.3),
    borderEndWidth: hp(0.3),
    borderTopWidth: hp(0.3),
    borderColor: AppColors.backgroundGray,
    borderLeftWidth: hp(0.3),
    borderRightWidth: hp(0.3),
    marginBottom: hp(2.7),
    marginTop: hp(2.7),
    borderBottomWidth: hp(0.3),
    paddingLeft: wp(2),
  },
  qrImageShareStyle: {
    height: hp(5),
    width: wp(7),
    position: 'absolute',
    top: wp(2),
    right: wp(2),
  },

  otpEnterMobileText: {
    fontSize: hp(2.3),
    marginTop: hp(2),
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyRegular,
    marginTop: hp(1),
  },
  otpEnterText: {
    fontSize: hp(2.5),
    marginTop: hp(2),
    color: AppColors.blackColor3,
    fontFamily: AppStyles.fontFamilyDemi,
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  otpContainer: {
    backgroundColor: AppColors.whiteColor,
    borderRadius: 20,
    width: wp(80),
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(4),
    shadowColor: AppColors.blackColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  shareImageStyle: {
    height: hp(5),
    width: wp(7),
    marginRight: wp(1),
  },
  pdfContainer: {
    backgroundColor: AppColors.whiteColor,
    borderRadius: 20,
    width: wp(100),
    height: hp(70),
    paddingHorizontal: wp(6),
    paddingVertical: hp(5),
    shadowColor: AppColors.whiteColor,
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.modalBackground,
  },
  getCardButtonStyle: {
    borderRadius: wp(2),
    height: hp(4),
    alignSelf: 'center',
    marginBottom: hp(2.4),
    width: wp(45),
  },
  qrImageStyle: { width: wp(60), height: wp(70) },
  abhaQrcontainer: {
    backgroundColor: AppColors.whiteColor,
    borderRadius: 20,
    width: wp(80),
    paddingHorizontal: wp(6),
    paddingVertical: hp(6),
    shadowColor: AppColors.blackColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    justifyContent: 'center',
    alignItems: 'center',

    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonsSheet: {
    backgroundColor: AppColors.whiteColor,
    borderRadius: 20,
    width: wp(80),
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
    // shadowColor: AppColors.blackColor,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },

  pdfModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.modalBackground,
  },
  qrcodeStyle: {
    height: hp(5),
    width: wp(7),
  },

  pdfStyle: {
    height: hp(60),
    width: wp(100),
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: AppColors.whiteColor,
  },

  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.backgroundGray,
    marginTop: verticalScale(10),
    textAlign: isRTL ? 'right' : 'auto',
  },
  dobStyle: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: AppColors.backgroundGray,
    margin: moderateScale(1),
  },
  providerStyle: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: AppColors.backgroundGray,
    marginLeft: moderateScale(1),
    marginRight: moderateScale(1),
    marginTop: moderateScale(1),
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
    textAlign: 'right',
  },
  generateAbha: {
    alignSelf: 'center',
    borderRadius: wp(2),
    height: hp(4),
    width: wp(35),
    marginTop: hp(3),
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
    justifyContent: 'space-between',
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
    flexDirection: 'row',
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
    marginLeft: moderateScale(150),
    alignSelf: 'center',
  },
  toggleStyle: {
    marginLeft: wp(28),
    alignSelf: 'center',
  },
  holderText: {
    color: AppColors.primaryGray,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    margin: moderateScale(5),
  },
  abhaFieldView: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
    flexDirection: 'column',
  },
  footer: {
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
    paddingBottom: AppUtils.isX ? hp(2) : 0,
    elevation: 5,
    height: AppUtils.isX ? hp(12) : hp(10),
    flexDirection: 'row',
  },
});

export default EditProfile;
