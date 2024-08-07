import React from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  I18nManager,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { Switch } from "react-native-switch";
import { Actions } from "react-native-router-flux";
import ElevatedView from "react-native-elevated-view";
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import { moderateScale, verticalScale } from "../../utils/Scaling";
import { Validator } from "../../shared/Validator";
import { AppColors } from "../../shared/AppColors";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import SHButtonDefault from "../../shared/SHButtonDefault";
import LinearGradient from "react-native-linear-gradient";
import ModalSelector from "../../shared/ModalSelector";
import ProgressLoader from "rn-progress-loader";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Dropdown } from 'react-native-material-dropdown';
import Toast from "react-native-simple-toast";
import images from "../../utils/images";
import ClinicHeader from "../../navigationHeader/ClinicHeader";

import { CachedImage, ImageCacheProvider } from "../../cachedImage";
import { strings } from "../../locales/i18n";
import bmiStyles from "../../styles/bmiStyles";
import AsyncStorage from "@react-native-community/async-storage";

const { width, height } = Dimensions.get("window");

const confirmLogo = require("../../../assets/images/confirm_icon.png");
const isRTL = I18nManager.isRTL;

var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;

const reg = /^[1-9][0-9]*$/;

var insIndex = 0,
  relIndex = 0;

const relationData = [
  { key: relIndex++, section: true, label: "Select Relation" },
  { key: relIndex++, label: "Self" },
  { key: relIndex++, label: "Spouse" },
  { key: relIndex++, label: "Son" },
  { key: relIndex++, label: "Daughter" },
  { key: relIndex++, label: "Others" },
];

const otherRelationData = [
  { key: relIndex++, section: true, label: "Select Relation" },
  { key: relIndex++, label: "Spouse" },
  { key: relIndex++, label: "Son" },
  { key: relIndex++, label: "Daughter" },
  { key: relIndex++, label: "Others" },
];

const unSelectedSlotColor = AppColors.whiteColor;
const selectedSlotColor = AppColors.primaryColor;

class FamilyProfile extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker("Medical Appointment Booking Screen");
    this.openCalender = this.openCalender.bind(this);

    this.firstName = this.firstName.bind(this);
    this.getInsuranceProviders = this.getInsuranceProviders.bind(this);
    this.getUserDetailsAlways = this.getUserDetailsAlways.bind(this);

    this.inputs = {};
    AppUtils.console("fdcszfsdxfsrffgc", this.props);
    this.state = {
      data: [],
      firstNameData: [],
      isLoading: false,
      isDataVisible: false,
      value: 0,
      fName: "",
      lName: "",
      dob: _dt,
      NRIC: "",
      relation: "",
      relationText: "",
      gender: "",
      insuranceNumber: "",
      insuranceCompany: "",
      insuranceText: "",
      maleTextColor: "#d3d3d3",
      femaleTextColor: "#d3d3d3",
      toggled: false,
      confirmation: false,
      isPatientSelected: false,
      clinicLogo: "",
      patientName: "",
      queueNumber: "",
      start: _dt,
      doctorName: "",
      appointMentDate: "",
      clinicName: "",
      clinicAddress: "",
      query: "",
      hideResults: false,
      relationData: relationData,
      otherRelationData: otherRelationData,
      showDOB: false,
      showRelation: false,
      showInsurance: false,
      relativeId: "",
      insuranceProviders: [],
      insurancePId: "",
      insuranceCompanyName: "",
      isDataSet: false,
      isSelfExist: false,
      patientProfilePic: "",
      symptoms: "",
      isAddNewRelative: false,
      selectedSymptoms: [],
      symptomList: [],
      addSymptoms: "",
      isDoctorDetail: false,
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

  componentWillMount() {
    this.getUserDetailsAlways();
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.goBack();
      return true;
    });
  }

  componentDidMount() {
this.getUserIdList()
  }

 async getUserIdList(){
    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);
    const data = {
      country: user.country,
    };


    const getIdTypesResponse = await SHApiConnector.getIdList(data);
    const idTypes = getIdTypesResponse?.data?.data?.idTypes;

    if (idTypes) {
      const dataIdentificationType = idTypes.map((item) => {
        return { value: item.identificationType };
      });

      this.setState({ userIdTypes: dataIdentificationType,selectedId: idTypes  });
    }
  }

  getUserDetailsAlways() {
    var self = this;
    self.setState({ isLoading: true });
    SHApiConnector.getUserDetailsAlways(function (err, stat) {
      try {
        AppUtils.console("ProfileDetails", stat);
        self.setState({ isLoading: false });
        if (stat) {
          if (stat.error_code) {
            self.openAlert(stat);
          } else {
          }
          self.setData(stat.relativeDetails, stat.profilePic);
          self.getInsuranceProviders();
        }
      } catch (e) {
        self.setState({ isLoading: false });
        self.getInsuranceProviders();

        console.error(e);
      }
    });
  }

  setData(allDetails, selfPic) {
    var self = this;
    if (self.props.selectedRelative.length == 0) {
      for (let i = 0; i < allDetails.length; i++) {
        if (allDetails[i].spouse == "self" || allDetails[i].spouse == "Self") {
          (allDetails[i].isSelected = true),
            (allDetails[i].profilePic = allDetails[i].profilePic
              ? allDetails[i].profilePic
              : selfPic);
          self.setState({
            isSelfExist: true,
            data: allDetails,
            isPatientSelected: allDetails.length > 0 ? true : false,
          });
          this.props.selectedProfile(allDetails[i]);

          self.fetchProfile(allDetails[i]._id);
        } else {
          allDetails[i].isSelected = false;
          self.setState({
            data: allDetails,
            isPatientSelected: allDetails.length > 0 ? true : false,
          });
        }
      }
    } else {
      for (let i = 0; i < allDetails.length; i++) {
        if (allDetails[i]._id == this.props.selectedRelative._id) {
          allDetails[i].isSelected = true;
          allDetails[i].profilePic = allDetails[i].profilePic
            ? allDetails[i].profilePic
            : selfPic;
          self.setState({
            isSelfExist: true,
            data: allDetails,
            isPatientSelected: allDetails.length > 0 ? true : false,
          });
          this.props.selectedProfile(allDetails[i]);
          self.fetchProfile(allDetails[i]._id);
        } else {
          allDetails[i].isSelected = false;
          self.setState({
            data: allDetails,
            isPatientSelected: allDetails.length > 0 ? true : false,
          });
        }
      }
    }
  }

  openAlert(stat) {
    var self = this;
    if (stat.error_code == "10006") {
      //self.showAlert(strings('string.error_code.error_10006'), true)
      Actions.LoginMobile({ appointmentData: self.props.appointmentData });
    } else if (stat.error_code == "10002") {
      self.showAlert(strings("string.error_code.error_10002"), true);
    } else if (stat.error_code == "10003") {
      self.showAlert(strings("string.error_code.error_10003"), true);
    } else if (stat.error_code == "10013") {
      self.showAlert(strings("string.error_code.error_10013"), true);
    } else if (stat.error_code == "10014") {
      self.showAlert(strings("string.error_code.error_10014"), true);
    } else if (stat.error_code == "10015") {
      self.showAlert(strings("string.error_code.error_10015"), true);
    } else if (stat.error_code == "10017") {
      self.showAlert(strings("string.error_code.error_10017"), true);
    } else if (stat.error_code == "10021") {
      self.showAlert(strings("string.error_code.error_10021"), true);
    } else if (stat.error_code == "10024") {
      self.showAlert(strings("string.error_code.error_10024"), true);
    } else if (stat.error_code == "10025") {
      if (self.state.isCalender == true) {
        self.showAlert(strings("string.error_code.error_10025_calendar"), true);
      } else {
        self.showAlert(strings("string.error_code.error_10025"), true);
      }
    } else if (stat.error_code == "10028") {
      if (self.state.isCalender == true) {
        self.showAlert(strings("string.error_code.error_10028"), true);
      } else {
        self.showAlert(strings("string.error_code.error_10028"), true);
      }
    } else if (stat.error_code == "10029") {
      self.showAlert(strings("string.error_code.error_10029"), true);
    } else if (stat.error_code == "10020") {
      if (self.state.isCalender == true) {
        self.showAlert(strings("string.error_code.error_10020_calendar"), true);
      } else {
        self.showAlert(strings("string.error_code.error_10020"), true);
      }
    } else if (stat.error_code == "10019") {
      if (self.state.isCalender == true) {
        self.showAlert(strings("string.error_code.error_10019_calendar"), true);
      } else {
        self.showAlert(strings("string.error_code.error_10019"), true);
      }
    }
  }

  getInsuranceProviders() {
    var self = this;
    self.setState({
      isLoading: true,
    });

    SHApiConnector.getInsuranceProviders(function (err, stat) {
      self.setState({ isLoading: false });
      try {
        if (stat) {
          var firstValue = {
            companyName: "Select Insurance",
            _id: "00000000000",
          };
          var data =
            Platform.OS === "ios" ? [firstValue, ...stat.status] : stat.status;
          self.setState({
            insuranceProviders: data,
            insurancePId: self.state.insurancePId,
          });
          self.setInsuranceData(self.state.insurancePId);
        }
      } catch (e) {
        console.error("Error:", e);
      }
    });
  }

  getUserDetails() {
    if (this.props.appointmentData.callType) {
      Alert.alert(
        strings("doctor.alertTitle.attention"),
        strings("doctor.alertMsg.regulatoryGuideLines"),
        [
          { text: strings("doctor.button.yes"), onPress: () => this.bookNow() },
          {
            text: strings("doctor.button.no"),
            onPress: () => AppUtils.console("Cancel Pressed"),
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    } else {
      this.bookNow();
    }
  }

  async bookNow() {
    var self = this;
    var appData = self.props.appointmentData;
    let symptoms = "";
    this.state.selectedSymptoms.map((symptom, index) => {
      if (index === 0) {
        symptoms = symptom.name;
      } else {
        symptoms = symptoms + ", " + symptom.name;
      }
    });

    appData.symptoms = symptoms;
    if (self.state.isCalender) {
      appData.isCalenderBasedAppointment = true;
      appData.appointmentState = "WAITING_CLINIC_CONFIRMATION";
      //appData.licenseFor = "CLINIC"
    } else {
      appData.appointmentState = "CONFIRMED";
    }

    let patientData = {
      patientData: {
        firstName: this.state.fName,
        lastName: this.state.lName,
        dateOfBirth: moment(this.state.dob).format("YYYY-MM-DD"),
        profilePic: this.state.patientProfilePic,
        gender: this.state.gender,
        height: this.state.height,
        weight: this.state.weight,
        heightType: this.state.heightType,
        weightType: this.state.weightType,
        relation: this.state.relation,
        insuranceProvider: this.state.insurancePId,
        insuranceNumber: this.state.insuranceNumber,
        relativeId: this.state.relativeId,
      },
      appointmentData: appData,
    };

    self.setState({ isLoading: true });
    this.bookAppointment(patientData);
    AppUtils.console("PATIENT_DATA", patientData);
  }

  bookAppointment(patientData) {
    var self = this;
    self.setState({ isLoading: true });
    SHApiConnector.getUserNameDetails(patientData, function (err, stat) {
      try {
        self.setState({ isLoading: false });
        AppUtils.console("Data after Booking:", stat, err);
        if (!err && stat) {
          if (stat.status) {
            AppUtils.positiveEventCount();
            self.setState({
              confirmation: true,
              clinicLogo: stat.appointment.clinicId.clinicLogo,
              patientName: stat.appointment.patientId.firstName,
              queueNumber: stat.appointment.queueNumber,
              start: stat.appointment.startTime,
              doctorName: stat.appointment.doctorId.doctorName,
              appointMentDate: moment(stat.appointment.startTime).format(
                "dddd, MMM DD YYYY"
              ),
              clinicName: stat.appointment.clinicId.clinicName,
              clinicAddress: stat.appointment.clinicId.locationName,
              isDataVisible: true,
              isLoading: false,
            });
          }
          self.openAlert(stat);
        }
      } catch (err) {
        self.setState({
          isLoading: false,
        });
        console.error(err);
      }
    });
  }

  onBoardVideoSetup(data) {}

  showAlert(msg, ispop) {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(
        this,
        "",
        msg,
        strings("doctor.button.ok"),
        function () {}
      );
    }, 500);
  }

  showPicker = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DateTimePicker.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);
      onsubmit: {
        (event) => {
          this.refs.NRIC.focus();
        };
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  };

  openCalender() {
    var self = this;
    Keyboard.dismiss();
    Platform.OS === "ios"
      ? self.setState({ showDOB: true })
      : self.setState({ showDOB: true });
  }

  closeIOSCalender() {
    this.setState({ showDOB: false });
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
    var dt = AppUtils.currentDateTime;
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
            backgroundColor: "rgba(52, 52, 52, 0.8)",
            height: height,
            width: width,
            alignSelf: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", width: width - 30 }}
          >
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <DateTimePicker
                value={new Date(this.state.dob)}
                style={{ backgroundColor: AppColors.whiteColor }}
                maximumDate={_dt}
                mode="date"
                display={"spinner"}
                onChange={(event, date) => {
                  this.setState({ dob: date });
                }}
              />
            </View>
            <TouchableHighlight
              onPress={() => this.closeIOSCalender()}
              underlayColor="transparent"
            >
              <View
                style={{
                  backgroundColor: AppColors.primaryColor,
                  height: 50,
                  width: width - 30,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: "center",
                  }}
                >
                  {moment.parseZone(this.state.dob).format("MMM DD YYYY")}
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

  showValidationDialog(message, blank, title) {
    if (!title) {
      this.setState({
        isValidationVisible: true,
        validationTitle: title,
        validationMessage: message,
      });
    } else {
      this.setState({
        isValidationVisible: true,
        validationTitle: "Missing Information",
        validationMessage: message,
      });
    }
  }

  validateData() {
    var isSelectInsurance =
      Platform.OS === "ios"
        ? this.state.insuranceCompanyName === "Select Insurance"
        : false;

    //var isClinicOpened = AppUtils.isClinicOpen(this.props.appointmentData.startHour, this.props.appointmentData.startMin, this.props.appointmentData.endHour, this.props.appointmentData.endMins);
    var isClinicOpened = true;
    if (isClinicOpened) {
      if (Validator.isBlank(this.state.fName)) {
        alert(strings("doctor.alertMsg.patientDetailsMissing"));
      } else if (Validator.isBlank(this.state.lName)) {
        alert(strings("doctor.alertMsg.patientDetailsMissing"));
      } else if (!Validator.validateNRIC(this.state.NRIC)) {
        alert(strings("doctor.alertMsg.patientDetailsMissing"));
      } else if (Validator.isBlank(this.state.gender)) {
        alert(strings("doctor.alertMsg.patientDetailsMissing"));
      } else if (Validator.isBlank(this.state.relation)) {
        alert(strings("doctor.alertMsg.patientDetailsMissing"));
      } else if (Validator.isValidHeightWeight(this.state.height, this.state.weight)) {
        this.showAlert('Invalid height or weight', true);
      } else if (Validator.isValidDOB(this.state.dob, this.state.relation)) {
        if (this.state.relation == "Self") {
          alert(strings("doctor.alertMsg.patientDetailsMissing"));
        } else {
          alert(strings("doctor.alertMsg.patientDetailsMissing"));
        }
        this.setState({
          DOB: moment(new Date()).format("DD-MMM-YYYY"),
        });
      } else {
        if (this.state.toggled) {
          if (isSelectInsurance || !this.state.insurancePId) {
            this.showAlert(strings("string.mandatory.insuranceCompany"), true);
          } else if (Validator.isBlank(this.state.insuranceNumber)) {
            this.showAlert(strings("string.mandatory.insuranceNumber"), true);
          } else {
            this.getUserDetails();
          }
        } else {
          this.getUserDetails();
        }
      }
    } else {
      Alert.alert(
        strings("doctor.button.clinicClosed"),
        strings("doctor.text.clinicWorkCompleted"),
        [
          {
            text: strings("doctor.button.ok"),
            onPress: () =>
              Platform.OS === "ios"
                ? Actions.HomeScreen()
                : Actions.HomeScreenDash({ isHomeScreenUpdated: true }),
          },
        ],
        { cancelable: false }
      );
    }
  }

  validateNewUser() {
    var isSelectInsurance =
      Platform.OS === "ios"
        ? this.state.insuranceCompanyName === "Select Insurance"
        : false;

    if (Validator.isBlank(this.state.fName)) {
      alert(strings("string.mandatory.firstName"));
    } else if (Validator.isBlank(this.state.lName)) {
      alert(strings("string.mandatory.lastName"));
    } else if (!Validator.validateNRIC(this.state.NRIC)) {
      alert(strings("string.mandatory.NRIC"));
    } else if (Validator.isBlank(this.state.gender)) {
      alert(strings("string.mandatory.gender"));
    } else if (Validator.isBlank(this.state.relation)) {
      alert(strings("string.mandatory.relation"));
    } else if (Validator.isValidHeightWeight(this.state.height, this.state.weight)) {
      this.showAlert('Invalid height or weight', true);
    } 
    else if (Validator.isValidDOB(this.state.dob, this.state.relation)) {
      if (this.state.relation == "Self") {
        alert(strings("string.mandatory.ageDifference"));
      } else {
        alert(strings("doctor.text.dobInvalid"));
      }
      this.setState({
        DOB: moment(new Date()).format("DD-MMM-YYYY"),
      });
    } else {
      if (this.state.toggled) {
        if (isSelectInsurance || !this.state.insurancePId) {
          this.showAlert(strings("string.mandatory.insuranceCompany"), true);
        } else if (Validator.isBlank(this.state.insuranceNumber)) {
          this.showAlert(strings("string.mandatory.insuranceNumber"), true);
        } else {
          this.addNewRelative();
        }
      }
      else if (this.state.userId !== '') {
        if (Validator.isBlank(this.state.userIdNum)) {
          this.showAlert(strings('string.mandatory.idNumber'), true);
        }
        else{
          this.addNewRelative();
        }
      }
       else {
        this.addNewRelative();
      }
    }
  }

  setGender(gender) {
    if (gender == "Male") {
      this.setState({
        gender: "Male",
        maleTextColor: "#FF4848",
        femaleTextColor: "#d3d3d3",
      });
    } else {
      this.setState({
        gender: "Female",
        femaleTextColor: "#FF4848",
        maleTextColor: "#d3d3d3",
      });
    }
  }

  goBack() {
    Platform.OS === "ios" ? Actions.HomeScreenDash() : Actions.HomeScreenDash();
  }

  goBackToClinicDetails() {
    Actions.ClinicDetails({
      clinicID: this.props.appointmentData.clinicId,
      latitude: this.props.appointmentData.latitude,
      longitude: this.props.appointmentData.longitude,
    });
  }

  switch(val) {
    this.setState({ toggled: val });
  }

  focusNextField(id) {
    this.inputs[id].focus();
  }

  firstName(input) {
    var self = this;
    this.setState({ fName: input });
  }

  getPickerVal(pickedVal) {
    switch (pickedVal) {
      case "self":
        return "Self";
      case "spouse":
        return "Spouse";
      case "son":
        return "Son";
      case "daughter":
        return "Daughter";
      case "other":
        return "Others";
      default:
        return "";
    }
  }

  getPickerLabel(pickedVal) {
    switch (pickedVal) {
      case "Self":
        return "self";
      case "Spouse":
        return "spouse";
      case "Son":
        return "son";
      case "Daughter":
        return "daughter";
      case "Others":
        return "other";
      default:
        return "";
    }
  }

  getInsurance(pickedVal) {
    switch (pickedVal) {
      case "LIC":
        return "lic";
      case "Reliance":
        return "reliance";
      case "Bajaj":
        return "bajaj";
      case "HDFC Life":
        return "hdfcLife";
      case "Birla Group":
        return "birlaGroup";
      default:
        return "";
    }
  }

  getInsuranceVal(pickedVal) {
    switch (pickedVal) {
      case "lic":
        return "LIC";
      case "reliance":
        return "Reliance";
      case "bajaj":
        return "Bajaj";
      case "hdfcLife":
        return "HDFC Life";
      case "birlaGroup":
        return "Birla Group";
      default:
        return "";
    }
  }

  onAutoComplete() {
    this.setState({ hideResults: true });
    this.refs.LastName.focus();
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

  fetchProfile(id) {
    var self = this;
    var relativeId = { relativeId: id };
    self.setState({ isLoading: true, isPatientSelected: false });
    SHApiConnector.fetchProfileUsingId(relativeId, function (err, stat) {
      AppUtils.console("FamilyRes", stat);
      try {
        self.setState({ isLoading: false, isPatientSelected: false });
        let selectedUser = stat.relativeDetails[0];
        let dob = new Date(selectedUser.dateOfBirth);
        if (stat) {
          if (
            !selectedUser.insuranceNumber ||
            selectedUser.insuranceProvider == "" ||
            !selectedUser.insuranceProvider
          ) {
            self.setState({
              toggled: false,
              fName: selectedUser.firstName,
              lName: selectedUser.lastName,
              NRIC: selectedUser.NRIC,
              gender: selectedUser.gender == "Male" ? "Male" : "Female",
              maleTextColor:
                selectedUser.gender == "Male" ? "#FF4848" : "#d3d3d3",
              femaleTextColor:
                selectedUser.gender == "Female" ? "#FF4848" : "#d3d3d3",
              relation: selectedUser.spouse,
              relationText: self.getPickerVal(selectedUser.spouse),
              relativeId: selectedUser._id,
              dob: dob,
              isDataSet: true,
              isPatientSelected: false,
              patientProfilePic: selectedUser.profilePic,
              insurancePId:
                selectedUser.insuranceProvider == "" ||
                !selectedUser.insuranceProvider
                  ? ""
                  : "",
              insuranceNumber:
                selectedUser.insuranceNumber != "" ||
                !selectedUser.insuranceNumber
                  ? selectedUser.insuranceNumber
                  : strings("doctor.text.insuranceNumNotAvail"),
              insuranceCompanyName: "",
              height: selectedUser.height == undefined ? '0' : selectedUser.height,
              weight: selectedUser.weight == undefined ? '0' : selectedUser.weight,
              weightType: selectedUser.weightType == undefined ? 'kgs' : selectedUser.weightType,
              heightType: selectedUser.heightType == undefined ? 'cms' : selectedUser.heightType,
            });
          } else {
            self.setState({
              fName: selectedUser.firstName,
              lName: selectedUser.lastName,
              NRIC: selectedUser.NRIC,
              gender: selectedUser.gender == "Male" ? "Male" : "Female",
              maleTextColor:
                selectedUser.gender == "Male" ? "#FF4848" : "#d3d3d3",
              femaleTextColor:
                selectedUser.gender == "Female" ? "#FF4848" : "#d3d3d3",
              relation: selectedUser.spouse,
              relationText: self.getPickerVal(selectedUser.spouse),
              relativeId: selectedUser._id,
              isPatientSelected: false,
              dob: dob,
              toggled: true,
              patientProfilePic: selectedUser.profilePic,
              insuranceNumber: selectedUser.insuranceNumber,
              insurancePId: selectedUser.insuranceProvider,
              isDataSet: true,
              height: selectedUser.height == undefined ? '0' : selectedUser.height,
              weight: selectedUser.weight == undefined ? '0' : selectedUser.weight,
              weightType: selectedUser.weightType == undefined ? 'kgs' : selectedUser.weightType,
              heightType: selectedUser.heightType == undefined ? 'cms' : selectedUser.heightType,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
  handleChange =  (value) => {
    this.setState({ userId: value, showInput: true,userIdNum:'' });
  };

  addNew() {
    if (this.state.data.length < 6) {
      this.setState({
        fName: "",
        lName: "",
        dob: _dt,
        NRIC: "",
        relation: "",
        relationText: "",
        gender: "",
        insuranceNumber: "",
        insuranceText: "",
        maleTextColor: "#d3d3d3",
        femaleTextColor: "#d3d3d3",
        toggled: false,
        confirmation: false,
        isPatientSelected: false,
        relationData: relationData,
        otherRelationData: otherRelationData,
        relativeId: "",
        /*insuranceProviders: '',*/
        insurancePId: "",
        insuranceCompanyName: "Select Insurance",
        isDataSet: false,
      });
    }
  }

  _render_Details(item, dataLength) {
    //  AppUtils.console("SelectedProfile", item.item)

    return (
      <View
        style={{
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.2,
          shadowColor: "#000000",
          elevation: 2,
          width: wp(30),
          height: hp(6),
          backgroundColor: item.item.isSelected
            ? AppColors.primaryColor
            : AppColors.whiteColor,
          borderRadius: moderateScale(8),
          marginLeft: moderateScale(5),
          marginTop: moderateScale(10),
          marginBottom: moderateScale(5),
          marginRight: moderateScale(5),
          alignItems: "flex-start",
          flexDirection: "row",
        }}
      >
        <TouchableHighlight
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            alignSelf: "center",
          }}
          onPress={() => this.setTheSelectedRelative(item, dataLength)}
          underlayColor="transparent"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              alignSelf: "center",
            }}
          >
            <CachedImage
              style={{
                width: moderateScale(25),
                height: moderateScale(25),
                borderRadius: moderateScale(25 / 2),
                marginLeft: moderateScale(5),
                alignSelf: "center",
              }}
              source={{ uri: AppUtils.handleNullImg(item.item.profilePic) }}
            />
            <View
              style={{
                alignItems: "flex-start",
                alignSelf: "center",
                marginLeft: moderateScale(9),
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: !item.item.isSelected
                    ? AppColors.blackColor
                    : AppColors.whiteColor,
                  width: wp(18),
                  textAlign: isRTL ? 'left' : 'auto',
                }}
                numberOfLines={1}
              >
                {item.item.firstName} {item.item.lastName}{" "}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  width: wp(24),
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(10),
                  color: !item.item.isSelected
                    ? AppColors.greyColor
                    : AppColors.whiteColor,
                    textAlign: isRTL ? 'left' : 'auto',
                }}
              >
                {item.item.spouse}{" "}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  setTheSelectedRelative(item, dataLength) {
    var data = this.state.data;

    for (var i = 0; i < data.length; i++) {
      if (item.item._id == data[i]._id) {
        data[i].isSelected = true;
      } else {
        data[i].isSelected = false;
      }
    }
    this.setState({
      data: data,
    });

    this.fetchProfile(item.item._id);
    this.props.selectedProfile(item.item);
  }

  selectPatient() {
    this.setState({ isPatientSelected: !this.state.isPatientSelected });
  }

  render() {
    var dataLength = this.state.data?.length;
    const { query } = this.state;
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : ""}>
        <ScrollView style={styles.container}>
          {Platform.OS === "ios"
            ? this.openIOSCalender()
            : this.openAndroidCalender()}
          <View
            style={{
              width: width,
              backgroundColor: AppColors.loader,
              borderRadius: moderateScale(10),
              marginTop: moderateScale(8),
              marginBottom: moderateScale(8),
            }}
          >
            <View style={{ flexDirection: "row", width: wp(100) }}>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyMedium,
                  fontSize: 14,
                  width: wp(65),
                  color: AppColors.primaryColor,
                  marginTop: moderateScale(10),
                  marginLeft: moderateScale(20),
                  alignSelf: "flex-start",
                  textAlign: isRTL ? 'left' : 'auto',
                }}
              >
                {strings("doctor.text.selectPatient")}
              </Text>

              {dataLength < 6 ? (
                <TouchableHighlight
                  style={{
                    alignItems: "flex-end",
                    marginTop: hp(1),
                    width: wp(20),
                    flexDirection: "row",
                  }}
                  onPress={() => this.showAddPatientView()}
                  underlayColor="transparent"
                >
                  <View
                    style={{
                      alignItems: "flex-start",
                      height: hp(4),
                      width: moderateScale(150),
                      flexDirection: "row",
                    }}
                  >
                    <Image
                      style={{
                        width: moderateScale(20),
                        height: moderateScale(20),
                        borderRadius: moderateScale(5),
                      }}
                      source={require("../../../assets/images/add_relative.png")}
                    />
                    <Text
                      style={{
                        fontFamily: AppStyles.fontFamilyRegular,
                        fontSize: 14,
                        marginLeft: moderateScale(5),
                        color: AppColors.grey,
                        marginTop: hp(0.2),
                      }}
                    >
                      {strings("doctor.button.addNew")}
                    </Text>
                  </View>
                </TouchableHighlight>
              ) : (
                <View />
              )}
            </View>

            <View
              style={{
                justifyContent: "center",
                marginLeft: moderateScale(15),
                alignItems: isRTL ? 'flex-start' : 'auto'
              }}
            >
              <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={this.state.data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this._render_Details(item, dataLength)}
                extraData={this.state}
              />
            </View>
          </View>
          {this.state.isAddNewRelative ? this.addPatientView() : <View />}
        </ScrollView>
        {/* <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} /> */}
      </KeyboardAvoidingView>
    );
  }

  showAddPatientView() {
    this.setState({
      isAddNewRelative: true,
      fName: "",
      lName: "",
      dob: _dt,
      NRIC: "",
      relation: "",
      relationText: "",
      gender: "",
      insuranceNumber: "",
      insuranceText: "",
      maleTextColor: "#d3d3d3",
      femaleTextColor: "#d3d3d3",
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      toggled: false,
      confirmation: false,
      isPatientSelected: false,
      relationData: relationData,
      otherRelationData: otherRelationData,
      relativeId: "",
      insurancePId: "",
      insuranceCompanyName: "Select Insurance",
      isDataSet: false,
    });
  }

  addPatientView() {
    let insuranceProviders = this.state.insuranceProviders.map((d, i) => {
      return <Picker.Item key={d._id} label={d.companyName} value={d._id} />;
    });

    var insuranceProviderIOS = this.state.insuranceProviders.map((d, i) => {
      return i == 0
        ? { key: d._id, section: true, label: d.companyName }
        : { key: d._id, label: d.companyName };
    });

    return (
      <View>
        {!this.state.isDataSet ? (
          <View style={styles.registration}>
            <TextInput
              allowFontScaling={false}
              placeholder={strings("doctor.text.firstName")}
              multiline={false}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.fName}
              onChangeText={(text) => this.firstName(text)}
              returnKeyType={"next"}
              onSubmitEditing={(event) => this.refs.LastName.focus()}
            ></TextInput>
            <TextInput
              allowFontScaling={false}
              ref="LastName"
              placeholder={strings("doctor.text.lastName")}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.lName}
              onChangeText={(input) =>
                this.setState({ lName: input, hideResults: true })
              }
              underlineColorAndroid={"white"}
              returnKeyType={"next"}
            ></TextInput>
            <TouchableHighlight
              onPress={() => this.openCalender()}
              underlayColor="transparent"
            >
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>{strings("doctor.text.dob")}</Text>
                <Text ref="DOB" style={styles.date}>
                  {moment(this.state.dob).format("DD-MMM-YYYY")}
                </Text>
              </View>
            </TouchableHighlight>

            {/*<TextInput allowFontScaling={false}*/}
            {/*    refs="NRIC"*/}
            {/*    placeholder="NRIC"*/}
            {/*    placeholderTextColor={AppColors.textGray}*/}
            {/*    style={styles.NRIC}*/}
            {/*    value={this.state.NRIC}*/}
            {/*    onChangeText={(input) => this.setState({NRIC: input})}*/}
            {/*    underlineColorAndroid={'white'}*/}
            {/*    returnKeyType={'next'}*/}
            {/*    maxLength={9}*/}
            {/*></TextInput>*/}
            <View style={styles.genderView}>
              <Text style={styles.selectGender}>
                {strings("doctor.text.gender")}
              </Text>
              <Text
                style={[styles.male, { color: this.state.maleTextColor }]}
                onPress={() => this.setGender("Male")}
              >
                {strings("doctor.text.male")}
              </Text>
              <Text
                style={[styles.female, { color: this.state.femaleTextColor }]}
                onPress={() => this.setGender("Female")}
              >
                {strings("doctor.text.female")}
              </Text>
            </View>
            
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
                  dropdownPosition={-5}
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
            {this.bmiView()}
            {Platform.OS === "ios" ? (
              <View>
                <ModalSelector
                  data={
                    this.state.isSelfExist ? otherRelationData : relationData
                  }
                  initValue="Select Relation"
                  accessible={true}
                  cancelText={"Cancel"}
                  animationType={"fade"}
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
                    <Text style={styles.dobText}>
                      {strings("doctor.text.relation")}
                    </Text>
                    <Text style={styles.date}>{this.state.relationText}</Text>
                  </View>
                </ModalSelector>
              </View>
            ) : (
              <View
                style={{ borderBottomWidth: 1, borderBottomColor: "#D3D3D3" }}
              >
                {this.state.isSelfExist ? (
                  <Picker
                    style={styles.picker}
                    selectedValue={this.state.relation}
                    onValueChange={(itemValue, itemIndex) =>
                      this.setState({ relation: itemValue })
                    }
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
                    onValueChange={(itemValue, itemIndex) =>
                      this.setState({ relation: itemValue })
                    }
                  >
                    <Picker.Item label="Relation" value="" />
                    <Picker.Item label="Self" value="self" />
                    <Picker.Item label="Spouse" value="spouse" />
                    <Picker.Item label="Son" value="son" />
                    <Picker.Item label="Daughter" value="daughter" />
                    <Picker.Item label="Others" value="other" />
                  </Picker>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row" }}>
              <Text style={styles.holderText}>
                {strings("doctor.text.insuranceHolder")}
              </Text>
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
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: "transparent",
                  }}
                  switchLeftPx={2}
                  switchRightPx={2}
                  switchWidthMultiplier={2}
                />
              </View>
            </View>
            {this.state.toggled ? (
              <View>
                {Platform.OS === "ios" ? (
                  <View>
                    <ModalSelector
                      data={insuranceProviderIOS}
                      initValue="Select Insurance"
                      accessible={true}
                      cancelText={"Cancel"}
                      animationType={"fade"}
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
                        <Text style={styles.dobText}>
                          {this.state.insuranceCompanyName}
                        </Text>
                        <Text style={styles.date}></Text>
                      </View>
                    </ModalSelector>
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings("doctor.text.insuranceNum")}
                      placeholderTextColor={AppColors.textGray}
                      style={styles.NRIC}
                      value={this.state.insuranceNumber}
                      onChangeText={(input) =>
                        this.setState({ insuranceNumber: input })
                      }
                      underlineColorAndroid={"white"}
                    ></TextInput>
                  </View>
                ) : (
                  <View>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#D3D3D3",
                      }}
                    >
                      <Picker
                        style={styles.picker}
                        selectedValue={this.state.insurancePId}
                        onValueChange={(itemValue, itemIndex) =>
                          this.setState({ insurancePId: itemValue })
                        }
                      >
                        {/*onValueChange={(itemValue, itemIndex) => this.setInsuranceData(itemValue)}>*/}
                        {insuranceProviders}
                      </Picker>
                    </View>
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings("doctor.text.insuranceNum")}
                      placeholderTextColor={AppColors.textGray}
                      style={styles.NRIC}
                      value={this.state.insuranceNumber}
                      onChangeText={(input) =>
                        this.setState({ insuranceNumber: input })
                      }
                      underlineColorAndroid={"white"}
                    ></TextInput>
                  </View>
                )}
              </View>
            ) : (
              <View />
            )}
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                margin: moderateScale(30),
                justifyContent: "center",
              }}
            >
              <SHButtonDefault
                btnText={strings("doctor.button.camelAdd")}
                btnType={"normal"}
                style={{ marginTop: verticalScale(30) }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() => this.validateNewUser()}
              />
              <SHButtonDefault
                btnText={strings("doctor.button.cancel")}
                btnType={"normal"}
                style={{ marginTop: verticalScale(30), marginLeft: wp(2) }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() => this.setState({ isAddNewRelative: false })}
              />
            </View>
          </View>
        ) : (
          <View style={styles.registration}>
            <View style={styles.dobStyle}>
              <Text
                style={Platform.OS === "ios" ? styles.inputIOS : styles.dobText}
              >
                {this.state.fName}
              </Text>
            </View>
            <View style={styles.dobStyle}>
              <Text
                style={Platform.OS === "ios" ? styles.inputIOS : styles.dobText}
              >
                {this.state.lName}
              </Text>
            </View>
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>{strings("doctor.text.dob")}</Text>
              <Text ref="DOB" style={styles.date}>
                {moment(this.state.dob).format("DD-MMM-YYYY")}
              </Text>
            </View>
            {/*<View style={styles.dobStyle}>*/}
            {/*    <Text*/}
            {/*        style={(Platform.OS === 'ios') ? styles.inputIOS : styles.dobText}>{this.state.NRIC}</Text>*/}
            {/*</View>*/}
            <View style={styles.genderView}>
              <Text style={styles.selectGender}>
                {strings("doctor.text.gender")}
              </Text>
              <Text style={[styles.male, { color: this.state.maleTextColor }]}>
                {strings("doctor.text.male")}
              </Text>
              <Text
                style={[styles.female, { color: this.state.femaleTextColor }]}
              >
                {strings("doctor.text.female")}
              </Text>
            </View>
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>
                {strings("doctor.text.relation")}
              </Text>
              <Text style={styles.date}>{this.state.relationText}</Text>
            </View>

                     
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
                  dropdownPosition={-5}
                  dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                  itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                  rippleCentered={false}
                  dropdownMargins={{ min: 8, max: 16 }}
                  baseColor={'transparent'}
                  value={this.state.selectedId.identificationType ?? ' Identification Type'}
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
            {this.bmiView()}
            <View>
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>
                  {this.state.insuranceNumber == "" ||
                  this.state.insuranceCompanyName == ""
                    ? strings("doctor.text.insuranceNotAvail")
                    : this.state.insuranceCompanyName}
                </Text>
              </View>
            </View>
            <Text style={styles.dobText}>
              {this.state.insuranceNumber == ""
                ? " "
                : this.state.insuranceNumber}
            </Text>
          </View>
        )}
      </View>
    );
  }

  addNewRelative() {
    var self = this;
    const tempId = this.state.selectedId.find((item) => item.identificationType === this.state.userId);
    self.setState({
      isAddNewRelative: false,
    });

    var profileDetails = {
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
      relationText: "Select Relation",
      insuranceProvider: this.state.insurancePId,
      insuranceNumber: this.state.insuranceNumber,
      identificationType: tempId?._id ?? '',
      identificationNumber: this.state.userIdNum ?? '',
    };
    var self = this;
    self.setState({ isLoading: true });
    SHApiConnector.addNewRelativeInAppointment(
      profileDetails,
      function (err, stat) {
        AppUtils.console("After Adding Relative:", err, stat);
        try {
          self.setState({ isLoading: false });
          if (stat || !stat.error_code) {
            self.setState({
              data: stat.relativeDetails,
              fName: "",
              lName: "",
              dob: _dt,
              NRIC: "",
              relation: "",
              relationText: "",
              gender: "",
              insuranceNumber: "",
              insuranceText: "",
            });
          } else if (stat.error_code == "10029") {
            self.showAlert(strings("string.error_code.error_10029"), true);
          } else if (stat.error_code == "10024") {
            self.showAlert(strings("string.error_code.error_10024"), true);
          } else if (stat.error_code == "10030") {
            self.showAlert(strings("string.error_code.error_10030"), true);
          } else if (stat.error_code == "10021") {
            self.showAlert(strings("string.error_code.error_10021"), true);
          } else if (stat.error_code == "10002") {
            self.showAlert(strings("string.error_code.error_10002"), true);
          }
        } catch (e) {
          console.error(e);
          self.setState({ isLoading: false });
        }
      }
    );
  }

  bmiView() {
    return (
      <View>
        <View style={bmiStyles.bmiRow}>
            <Text style={bmiStyles.bmiHeader} >
            {strings('doctor.text.weight')} ({strings('doctor.text.optional')})
            </Text>
            <View style={{flexDirection: 'row'}}>
            <TextInput 
              placeholder="0"
              style={bmiStyles.bmiInput}
              value={this.state.weight.toString()}
              textContentType={'telephoneNumber'}
              keyboardType={'numeric'}
              onChangeText={val => {
                console.log(val)
                if ( val === '' || reg.test(val)) this.setState({weight: val})
              }}
              maxLength={3}
            />
            <View style={bmiStyles.bmiOptionHolder}>
              <Text style={[bmiStyles.weightOption,  this.state.weightType === 'kgs' ? bmiStyles.selected: {}]}
              onPress={() => {
                if (this.state.weightType === 'lbs' && this.state.weight) {
                  const wt = Math.round(Number(this.state.weight)/2.2046);
                  this.setState({weightType: 'kgs', weight: wt.toString()})
                } else {
                  this.setState({weightType: 'kgs'})
                }
              }}
              >kgs</Text>
              <Text style={[bmiStyles.weightOption,  this.state.weightType === 'lbs' ? bmiStyles.selected: {}]}
              onPress={() => {
                if (this.state.weightType === 'kgs' && this.state.weight) {
                  const wt = Math.round(Number(this.state.weight)*2.2046);
                  this.setState({weightType: 'lbs', weight: wt.toString()})
                } else {
                  this.setState({weightType: 'lbs'})
                }
              }}
              >lbs</Text>
            </View>
            </View>
          </View>
          <View style={bmiStyles.bmiRow}>
            <Text style={bmiStyles.bmiHeader} >
            {strings('doctor.text.height')} ({strings('doctor.text.optional')})
            </Text>
            <View style={{flexDirection: 'row'}}>
            <TextInput 
              placeholder="0"
              style={bmiStyles.bmiInput}
              value={this.state.height.toString()}
              textContentType={'telephoneNumber'}
              keyboardType={'numeric'}
              maxLength={5}
              onChangeText={val => {
                console.log(val.length)
                const { height, heightType } = this.state;
                if (heightType === 'cms') {
                  if ( val === '' || reg.test(val)) this.setState({height: val})
                } else {
                  if (val.length < 2) {
                    if (height.length > val.length) {
                      this.setState({height:val})
                    } else {
                      if (Number(val) < 1) {
                        return;
                      } else {
                        if ( val === '' || reg.test(val))
                          this.setState({height: `${val}'`})
                      }
                    }
                  } else if ( val.length === 2 ) {
                    if (height.length > val.length) {
                      this.setState({height:val})
                    }
                  } else if (val.length === 3) {
                      if (height.length > val.length) {
                        this.setState({height:val})
                      } else {
                      const rem = val.split("'")[1];
                      if ( Number(rem) > 1 ) {
                        if (reg.test(Number(rem))) {
                          this.setState({height: `${height}0${Number(rem)}"`})
                        }
                      } else {
                        if (reg.test(Number(rem))) {
                          this.setState({height: `${height}${Number(rem)}`})
                        }
                      }
                    }
                  } else if (val.length === 4) {
                    console.log(val)
                    if (height.length > val.length) {
                      this.setState({height:val})
                    } else {
                      const rem = val.split("'")[1];
                      if ( Number(rem) < 12 ) {
                        if (reg.test(Number(rem))) {
                          this.setState({height: `${height}${Number(rem)%10}"`})
                        }
                      }
                    }
                  }
                }
              }}
            />
            <View style={bmiStyles.bmiOptionHolder}>
              <Text style={[bmiStyles.weightOption,  this.state.heightType === 'cms' ? bmiStyles.selected: {}]}
              onPress={() => {
                const {height, heightType} = this.state;
                if (heightType === 'ft' && height) {
                    let [ft, inch] = height.split("'");
                    ft = Number(ft);
                    inch = Number(inch?.split('"')[0] || 0);
                    const ht = Math.round(ft*30.48) + Math.round(inch * 2.54) 
                    this.setState({heightType: 'cms', height: `${ht}`})
                } else {
                  this.setState({heightType: 'cms'})
                }
              }}
              >cms</Text>
              <Text style={[bmiStyles.weightOption,  this.state.heightType === 'ft' ? bmiStyles.selected: {}]}
              onPress={() => {
                const {height, heightType} = this.state;
                if (heightType === 'cms' && height) {
                    const realFeet = ((height*0.393700) / 12);
                    const ft = Math.floor(realFeet);
                    const inch = Math.round((realFeet - ft) * 12);
                    this.setState({heightType: 'ft', height: `${ft}'${inch > 9 ? inch : '0' + inch}"`})
                } else {
                  this.setState({heightType: 'ft'})
                }
              }}
              >ft</Text>
            </View>
            </View>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: AppColors.whiteColor,
  },
  doctorView: {
    alignSelf: "center",
    flexDirection: "row",
    marginLeft: moderateScale(20),
    marginRight: moderateScale(20),
    width: moderateScale(320),
    marginTop:
      Platform.OS === "ios" ? AppUtils.headerHeight : verticalScale(30),
    height: Platform.OS === "ios" ? verticalScale(100) : verticalScale(120),
    backgroundColor: AppColors.primaryColor,
    borderRadius: Platform.OS === "ios" ? moderateScale(10) : moderateScale(20),
  },
  doctorImage: {
    alignSelf: "center",
    marginLeft: moderateScale(6),
    height: PixelRatio.getPixelSizeForLayoutSize(20),
    width: PixelRatio.getPixelSizeForLayoutSize(20),
    borderRadius: PixelRatio.getPixelSizeForLayoutSize(20) / 2,
  },
  clinicbuttonView: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: verticalScale(60),
    flexDirection: "row",
    marginTop: verticalScale(10),
  },
  appointmentButton: {
    height: verticalScale(50),
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primaryColor,
    marginLeft: moderateScale(30),
  },
  proceedText: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
  },
  doctorDetails: {
    flexDirection: "column",
    width: Platform.OS === "ios" ? moderateScale(135) : moderateScale(135),
    height: verticalScale(48),
    alignSelf: "center",
    marginLeft: moderateScale(10),
    borderRightWidth: 2,
    borderRightColor: AppColors.whiteColor,
  },
  doctorName: {
    marginTop: verticalScale(10),
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(12),
  },
  doctorDesignation: {
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(12),
  },
  doctorTiming: {
    flexDirection: "column",
    width: moderateScale(80),
    alignSelf: "center",
    margin: moderateScale(5),
  },
  doctorTime: {
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(12),
  },
  doctorDate: {
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(9),
  },
  clinicName: {
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(6.5),
  },

  registration: {
    margin: Platform.OS === "ios" ? moderateScale(12) : moderateScale(10),
  },
  appointmentText: {
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.blackColor,
    fontSize: moderateScale(18),
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
  picker: {
    height: Platform.OS === "ios" ? verticalScale(100) : verticalScale(50),
    marginTop: verticalScale(22),
    borderBottomWidth: 1,
    color: AppColors.blackColor,
  },
  pickerIOS: {
    height: Platform.OS === "ios" ? verticalScale(100) : verticalScale(50),
  },
  genderView: {
    flexDirection: "row",
    height: verticalScale(70),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    alignItems: "center",
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

  dobStyle: {
    flexDirection: "row",
    height: verticalScale(70),
    borderBottomWidth: 1,
    alignItems: "center",
    borderBottomColor: AppColors.primaryGray,
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
    width: moderateScale(100),
    marginLeft: moderateScale(100),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
    color: AppColors.textGray,
    textAlign: 'right',
  },
  buttonView: {
    alignItems: "center",
    flexDirection: "row",
    margin: moderateScale(30),
  },
  goBack: {
    height: verticalScale(50),
    width: moderateScale(120),
    borderRadius: 200,
    borderWidth: 1,
    justifyContent: "center",
    backgroundColor: AppColors.whiteColor,
  },
  goBacktext: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
  },
  continueButton: {
    marginTop: verticalScale(30),
    marginLeft: moderateScale(30),
    height: verticalScale(50),
    width: moderateScale(120),
    borderRadius: 200,
    justifyContent: "center",
    backgroundColor: AppColors.primaryColor,
  },
  continuetext: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
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
    alignSelf: "center",
  },
  itemText: {
    height: verticalScale(40),
    fontSize: 20,
    margin: 2,
    alignSelf: "flex-start",
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
});

export default FamilyProfile;
