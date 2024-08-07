import React from 'react';
import {
  Alert,
  BackHandler,
  DatePickerAndroid,
  Dimensions,
  FlatList,
  PixelRatio,
  Image,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  I18nManager
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import { AppStyles } from '../../shared/AppStyles';
import { AppColors } from '../../shared/AppColors';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { Actions } from 'react-native-router-flux';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppStrings } from '../../shared/AppStrings';
import { AppUtils } from '../../utils/AppUtils';
import Spinner from '../../shared/Spinner';
import ClinicHeader from '../../navigationHeader/ClinicHeader';
import ChipView from '../../shared/ChipView';
import SlotView from '../../shared/SlotView';
import SHButton from '../../shared/SHButton';
import ElevatedView from 'react-native-elevated-view';
import SHButtonDefault from '../../shared/SHButtonDefault';
import LinearGradient from 'react-native-linear-gradient';
import ProgressLoader from 'rn-progress-loader';
import Switch from '../../shared/Switch';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { getTimeZone } from 'react-native-localize';
import { CachedImage, ImageCacheProvider } from '../../cachedImage';
import ImageZoom from 'react-native-image-pan-zoom';
import { strings } from '../../locales/i18n';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
const menuIcon = require('../../../assets/images/notifcation_active.png');
const closeIcon = require('../../../assets/images/notifcation_inactive.png');
const image_background = require('../../../assets/images/receiver_bg.png');
const unSelectedSlotColor = AppColors.whiteColor;
const selectedSlotColor = AppColors.primaryColor;
var datedata = moment(dt).format();
moment(new Date()).format();

class ClinicDetails extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Clinic Profile');
    this.getClinicdetails = this.getClinicdetails.bind(this);
    this.getDoctorSlots = this.getDoctorSlots.bind(this);
    this.saveSessionSlots = this.saveSessionSlots.bind(this);
    var dateToBook = moment(new Date()).format('YYYY-MM-DDTHH:mm:00');
    const todayHr = moment(dateToBook).format('hh');
    const todayMin = moment(dateToBook).format('mm');
    const todayExt = moment(dateToBook).format('A');

    this.state = {
      isLoading: false,
      isDataVisible: false,
      isSlotLoading: false,
      isSlotVisible: false,
      data: [],
      value: 0,
      checked: false,
      dateToday: _dt,
      spec: [],
      morningTimeSlot: [],
      isMenuOpen: false,
      menuIcon: menuIcon,
      animationType: 'bounceInUp',
      slotColor: unSelectedSlotColor,
      clinicData: '',
      clinicID: '',
      docID: '',
      docName: '',
      doctorDescription: '',
      docImage: 'https://smarthelpbucket.s3.amazonaws.com/local_storage/user_pics/new_doctor_2018-06-05T11:43:53.202Z.jpg',
      speciality: '',
      clinicName: '',
      selected: '',
      slotData: '',
      shiftID: '',
      selectedSlot: {},
      shiftSelected: '',
      slotSelected: '',
      clinicStartHour: '',
      clinicEndHour: '',
      clinicStartMinute: '',
      clinicEndMinute: '',
      doctorStartHour: '',
      doctorStartMinute: '',
      doctorEndHour: '',
      doctorEndMinute: '',
      departmentId: '',
      showDate: false,
      qualification: '',
      clinicStatus: '',
      locality: '',
      doctorAvailable: true,
      clinicAdvanceBooking: false,
      docQualification: '',
      isAlertOpen: true,
      doctorStatus: false,
      clinicNextAvailableDay: '',
      clinicNextWorkingDayFromCurrentDay: null,
      isNextWorkingDayAvaialble: false,
      advanceBookingDays: '0',
      doctorNextAvailableDay: '',
      maxDate: null,
      minDate: new Date(),
      sessionBookings: {},
      queueNumber: '',
      sequence: '',
      clinicIsClosed: false,
      doctorLeave: false,
      isCalender: false,
      ishoursModal: false,
      isminsModal: false,
      isBookingType: this.props.isBookingType,
      listForHours: [],
      listForMinutes: [],
      listForExt: [],
      hoursinRail: '',
      hours: todayHr,
      mins: todayMin,
      ext: todayExt,
      start: _dt,
      timeout: 15,
      isDoctorSessionExist: true,
      listToShowHoursFT: [],
      listToShowMinsFT: [],
      isDoctorHoliday: false,
      isClinicHoliday: false,
      doctorAdbCheck: false,
      isVideoConsultationEnabled: false,
      isAudioConsultationEnabled: false,
      remoteCosultation: false,
      audioCall: false,
      videoCall: false,
      inHouseCall: false,
      isClinicRemoteConsultationEnabled: false,
      isClinicDetail: false,
      isDoctorDetail: false,
      selectedDocDetails: {},
    };
  }

  componentWillMount() {
    this.getClinicdetails(datedata);
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        this.goBack();
        return true;
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        this.goBack();
        return true;
      });
    }
  }

  goBack() {
    Platform.OS === 'ios' ? Actions.HomeScreen() : Actions.HomeScreenDash({ isHomeScreenUpdated: true });
  }

  getClinicdetails(date) {
    var self = this;
    var clinicId = {
      clinicId: this.props.clinicID,
      date: moment(date).format(),
    };
    self.setState({ isLoading: true });

    if (clinicId.date > moment(new Date()).format()) {
      self.setState({
        nextDay: false,
      });
    } else {
      self.setState({
        nextDay: true,
      });
    }

    SHApiConnector.getClinicDetails(clinicId, function (err, stat) {
      self.setState({ isLoading: false });
      AppUtils.console('Clinic Details:', stat);
      AppUtils.console('Clinic Details Contact:', stat.clinicDetails.contactNumbers);

      try {
        if (stat) {
          if (
            !err &&
            stat &&
            stat.clinicDetails &&
            stat.clinicDetails.clinicTimings &&
            stat.clinicDetails.clinicTimings.length > 0 &&
            stat.clinicDetails.clinicTimings[0].timings
          ) {
            var slotLength = stat.clinicDetails.clinicTimings[0].timings.length;
            if (
              (stat.clinicClosed || !stat.clinicDetails.clinicTimings[0].isActive) &&
              stat.clinicNextWorkingDay !== 'CLINIC_CONTINUESLY_CLOSED' &&
              stat.clinicNextWorkingDay !== 'CLINIC_ADVANCE_BOOKING_EXCEDED'
            ) {
              self.setState({
                isAlertOpen: true,
                isMenuOpen: false,
                clinicID: stat._id,
                clinicData: stat.clinicDetails,
                spec: stat.clinicDetails.departments,
                locality: stat.clinicDetails.locationName,
                isDataVisible: true,
                data: [],
                clinicStartHour: stat.clinicDetails.clinicTimings[0].timings[0].startHour,
                clinicStartMinute: stat.clinicDetails.clinicTimings[0].timings[0].startMinute,
                clinicEndHour: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endHour,
                clinicEndMinute: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endMinute,
                clinicNextWorkingDay: stat.clinicNextWorkingDay,
                clinicNextWorkingDayFromCurrentDay: stat.nextWorkingDayFromCurrentDay,
                isNextWorkingDayAvaialble: true,
                advanceBookingDays: stat.clinicDetails.bookingConfiguration.advanceBookingLimit,
                clinicStatus: 'Closed',
                doctorStatus: stat.doctorDetails.length == 0 ? false : true,
                advanceBookingDay: true,
                doctorAvailable: true,
                clinicAdvanceBooking: stat.clinicDetails.bookingConfiguration.advanceBooking,
                isClinicRemoteConsultationEnabled:
                  stat.clinicDetails.isRemoteConsult === undefined || !stat.clinicDetails.isRemoteConsult ? false : true,
              });
            } else if (
              (stat.clinicClosed || !stat.clinicDetails.clinicTimings[0].isActive) &&
              (stat.clinicNextWorkingDay === 'CLINIC_CONTINUESLY_CLOSED' || stat.clinicNextWorkingDay === 'CLINIC_ADVANCE_BOOKING_EXCEDED')
            ) {
              self.setState({
                isAlertOpen: true,
                isMenuOpen: false,
                clinicID: stat._id,
                clinicData: stat.clinicDetails,
                spec: stat.clinicDetails.departments,
                locality: stat.clinicDetails.locationName,
                isDataVisible: true,
                data: [],
                clinicStartHour: stat.clinicDetails.clinicTimings[0].timings[0].startHour,
                clinicStartMinute: stat.clinicDetails.clinicTimings[0].timings[0].startMinute,
                clinicEndHour: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endHour,
                clinicEndMinute: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endMinute,
                clinicNextAvailableDay: stat.clinicNextWorkingDay.nextAvailableDate,
                clinicNextWorkingDayFromCurrentDay: null,
                isNextWorkingDayAvaialble: false,
                advanceBookingDays: stat.clinicDetails.bookingConfiguration.advanceBookingLimit,
                clinicStatus: 'Closed',
                doctorStatus: stat.doctorDetails.length !== 0,
                advanceBookingDay: true,
                doctorAvailable: true,
                clinicAdvanceBooking: stat.clinicDetails.bookingConfiguration.advanceBooking,
              });
            } else if (
              !stat.clinicClosed &&
              stat.clinicDetails.clinicTimings[0].isActive &&
              stat.clinicDetails.bookingConfiguration.advanceBooking &&
              stat.clinicNextWorkingDay
            ) {
              self.setState({
                isAlertOpen: false,
                clinicID: stat._id,
                clinicData: stat.clinicDetails,
                spec: stat.clinicDetails.departments,
                data: stat.doctorDetails,
                locality: stat.clinicDetails.locationName,
                isDataVisible: true,
                clinicStartHour: stat.clinicDetails.clinicTimings[0].timings[0].startHour,
                clinicStartMinute: stat.clinicDetails.clinicTimings[0].timings[0].startMinute,
                clinicEndHour: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endHour,
                clinicEndMinute: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endMinute,
                clinicAdvanceBooking: stat.clinicDetails.bookingConfiguration.advanceBooking,
                clinicNextWorkingDay: stat.clinicNextWorkingDay,
                clinicNextWorkingDayFromCurrentDay: stat.nextWorkingDayFromCurrentDay,
                advanceBookingDays: stat.clinicDetails.bookingConfiguration.advanceBookingLimit,
                clinicStatus: 'Open',
                doctorStatus: stat.doctorDetails.length !== 0,
                isMenuOpen: false,
                isCalender: false,
              });
            } else if (
              !stat.clinicClosed &&
              stat.clinicDetails.clinicTimings[0].isActive &&
              !stat.clinicDetails.bookingConfiguration.advanceBooking &&
              stat.clinicNextWorkingDay
            ) {
              self.setState({
                isAlertOpen: false,
                clinicID: stat._id,
                clinicData: stat.clinicDetails,
                spec: stat.clinicDetails.departments,
                data: stat.doctorDetails,
                locality: stat.clinicDetails.locationName,
                isDataVisible: true,
                clinicStartHour: stat.clinicDetails.clinicTimings[0].timings[0].startHour,
                clinicStartMinute: stat.clinicDetails.clinicTimings[0].timings[0].startMinute,
                clinicEndHour: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endHour,
                clinicEndMinute: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endMinute,
                clinicAdvanceBooking: stat.clinicDetails.bookingConfiguration.advanceBooking,
                clinicNextAvailableDay: stat.clinicNextWorkingDay,
                clinicNextWorkingDayFromCurrentDay: stat.nextWorkingDayFromCurrentDay,
                advanceBookingDays: stat.clinicDetails.bookingConfiguration.advanceBookingLimit,
                clinicStatus: 'Open',
                doctorStatus: stat.doctorDetails.length !== 0,
                advanceBookingDay: false,
              });
            } else if (stat.clinicNextWorkingDay && stat.clinicDetails.bookingConfiguration.advanceBooking) {
              self.setState({
                isDataVisible: true,
                isMenuOpen: false,
                isCalender: false,
                isAlertOpen: false,
                isNextWorkingDayAvaialble: false,
                clinicNextWorkingDayFromCurrentDay: null,
                advanceBookingDays: stat.clinicDetails.bookingConfiguration.advanceBookingLimit,
                doctorStatus: stat.doctorDetails.length !== 0,
                clinicData: stat.clinicDetails,
                spec: stat.clinicDetails.departments,
                data: stat.doctorDetails,
                locality: stat.clinicDetails.locationName,
                clinicStartHour: stat.clinicDetails.clinicTimings[0].timings[0].startHour,
                clinicStartMinute: stat.clinicDetails.clinicTimings[0].timings[0].startMinute,
                clinicEndHour: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endHour,
                clinicEndMinute: stat.clinicDetails.clinicTimings[0].timings[slotLength - 1].endMinute,
                clinicAdvanceBooking: stat.clinicDetails.bookingConfiguration.advanceBooking,
                clinicStatus: stat.clinicClosed || !stat.clinicDetails.clinicTimings[0].isActive ? 'Closed' : 'Open',
              });
            } else {
            }
          }
        } else {
          self.getClinicdetails(date);
        }
      } catch (err) {
        setTimeout(() => {
          AppUtils.showMessage(
            self,
            strings('doctor.alertTitle.sorry'),
            strings('doctor.alertMsg.noClinicDetails'),
            strings('doctor.button.ok'),
            function () {
              Actions.HomeScreen();
            }
          );
        }, 500);
      }
    });
  }

  onAnimEnd() {
    if (!this.state.isMenuOpen) {
      this.setState({
        isMenuOpen: !this.state.isMenuOpen,
      });
    } else if (this.state.animationType == 'bounceOutDown') {
      this.setState({
        isMenuOpen: false,
      });
    }
  }

  onAnimStart() {}

  openCalender() {
    var self = this;
    if (!self.state.clinicAdvanceBooking) {
      AppUtils.showMessage(
        self,
        strings('doctor.alertTitle.sorry'),
        strings('doctor.alertMsg.advanceBookingNotAllowed'),
        strings('doctor.button.ok'),
        function () {}
      );
    } else {
      var maxDate = moment(_dt).add(this.state.advanceBookingDays - 1, 'days')._d;
      var minDate = moment(_dt)._d;

      if (!self.state.clinicAdvanceBooking) {
        maxDate = new Date();
      }
      Keyboard.dismiss();
      Platform.OS === 'ios'
        ? self.setState({ showDate: true, minDate: minDate, maxDate: maxDate })
        : self.setState({ showDate: true, minDate: minDate, maxDate: maxDate });
    }
  }

  openCalender1() {
    var self = this;
    var maxDate = moment(_dt).add(this.state.advanceBookingDays - 1, 'days')._d;
    var minDate = moment(_dt)._d;
    if (!self.state.clinicAdvanceBooking) {
      AppUtils.showMessage(
        self,
        strings('doctor.alertTitle.sorry'),
        strings('doctor.alertMsg.advanceBookingNotAllowed'),
        strings('doctor.button.ok'),
        function () {}
      );
    } else {
      Keyboard.dismiss();
      Platform.OS === 'ios'
        ? self.setState({ showDate: true, minDate: minDate, maxDate: maxDate })
        : self.setState({ showDate: true, minDate: minDate, maxDate: maxDate });
    }
  }

  showPicker = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DatePickerAndroid.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);
      this.getClinicdetails(date);
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  showPicker1 = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DatePickerAndroid.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);

      let doctorDetails = {
        id: this.state.docID,
        name: this.state.docName,
        image: this.state.docImage,
        speciality: this.state.speciality,
      };
      this.getDoctorSlotsFromDate(doctorDetails);
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  openCalender2() {
    var self = this;
    var maxDate = moment(_dt).add(this.state.advanceBookingDays - 1, 'days')._d;
    var minDate = moment(_dt)._d;
    if (!self.state.clinicAdvanceBooking) {
      maxDate = new Date();
    }
    Keyboard.dismiss();
    Platform.OS === 'ios'
      ? self.setState({ showDate: true, minDate: minDate, maxDate: maxDate })
      : self.showPicker2('dateToday', { mode: 'spinner', minDate: minDate, maxDate: maxDate });
  }

  setDocTimingsIos() {
    let self = this;
    let data = this.state.data;
    let docTimings = [];
    let isCalender = false;
    let timeout = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i]._id == this.state.docID) {
        docTimings = data[i];
        isCalender = data[i].isCalender;
        timeout = data[i].timeout;
      }
    }
    self.setState({ timeout: timeout, isDoctorSessionExist: true });
    self.getDoctorSessions(docTimings);
  }

  showPicker2 = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DatePickerAndroid.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);
      let data = this.state.data;
      this.setState({
        isDoctorSessionExist: true,
      });
      let docTimings = [];
      let isCalender = false;
      let timeout = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i]._id == this.state.docID) {
          docTimings = data[i];
          isCalender = data[i].isCalender;
          timeout = data[i].timeout;
        }
      }
      this.setState({ timeout: timeout });

      this.getDoctorSessions(docTimings);
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  backScreen() {
    Actions.HomeScreen();
  }

  render() {
    AppUtils.console('NKJSFKJSKJHKJSH:', this.state);
    let self = this;
    let sessionstartHour = self.state.clinicStartHour;
    let sessionstartMinute = self.state.clinicStartMinute;
    let sessionEndHour = self.state.clinicEndHour;
    let sessionEndMinute = self.state.clinicEndMinute;
    let isClinicOpened = AppUtils.isClinicOpen(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute);
    let clinicText = strings('doctor.text.clinicNotOpened');
    let clinicCompleteText = strings('doctor.text.clinicWorkingNotStart');
    if (isClinicOpened) {
      clinicText = '';
      clinicCompleteText = '';
    } else {
      clinicText = strings('doctor.button.clinicClosed');
      clinicCompleteText = strings('doctor.text.clinicWorkCompleted');
    }

    return (
      <View style={styles.clinicContainer}>
        {Platform.OS === 'ios' ? this.openIOSCalender() : this.openAndroidCalender()}
        {this.state.isDataVisible ? (
          <View style={{ height: AppUtils.screenHeight, alignItems: 'center' }}>
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => {
                this.setState({ isClinicDetail: true });
              }}
              style={{ height: verticalScale(200), width: moderateScale(200), alignItems: 'center' }}
            >
              <ClinicHeader
                clinicName={this.state.clinicData.clinicName}
                clinicDetails={this.state.clinicData}
                clinicLogo={this.state.clinicData.clinicLogo}
                clinicStartHour={this.state.clinicStartHour}
                clinicStartMinute={this.state.clinicStartMinute}
                clinicEndHour={this.state.clinicEndHour}
                clinicEndMinute={this.state.clinicEndMinute}
                clinicStatus={this.state.clinicStatus}
                clinicAddress={this.state.locality}
              />
            </TouchableHighlight>

            <View style={styles.speciality}>
              <Text style={styles.spText}>{strings('doctor.button.specialities')}</Text>
              <FlatList
                data={this.state.spec}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this._render_spec(item)}
                extraData={this.state}
              />
            </View>
            <View style={styles.bottomContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ flex: 2 }}>
                  <Text style={styles.spText}>{strings('doctor.text.selectDoc')}</Text>
                </View>
                <View style={{ flex: 1, marginTop: moderateScale(10) }}>
                  <TouchableHighlight
                    onPress={() => this.openCalender()}
                    underlayColor="transparent"
                    style={{
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <View
                      style={{
                        borderRadius: moderateScale(10),
                        width: moderateScale(80),
                        height: verticalScale(50),
                        backgroundColor: AppColors.primaryColor,
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
                      }}
                    >
                      <Text style={styles.date}>{moment(this.state.dateToday).format('MMM DD')}</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
              <ScrollView>
                <View>
                  {self.state.doctorStatus ? (
                    <View style={{ width: width }}>
                      <FlatList
                        data={this.state.data}
                        keyExtractor={(item, index) => index.toString()}
                        bounces={false}
                        style={{ marginBottom: Platform.OS === 'ios' ? 100 : 100 }}
                        renderItem={(item) => (item.item.doctorTimings && item.item.doctorTimings.timings.length > 0 ? this._render_row(item) : null)}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        height: verticalScale(100),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: AppStyles.fontFamilyBold,
                          color: AppColors.textGray,
                        }}
                      >
                        {strings('doctor.text.noDocAvail')}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
            {self.state.isMenuOpen ? self.openDoctorSlot() : <View />}
            {self.state.isCalender ? self.openDoctorSession() : <View />}
            {
              self.state.isAlertOpen ? (
                <View style={{ height: height, width: width, position: 'absolute' }}>
                  {self.state.isNextWorkingDayAvaialble ? (
                    <View
                      style={{
                        height: height,
                        width: width,
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ElevatedView
                        elevation={200}
                        style={{
                          height: verticalScale(200),
                          width: moderateScale(320),
                          borderRadius: moderateScale(10),
                          marginTop: moderateScale(350),
                          backgroundColor: AppColors.lightGray,
                          borderColor: AppColors.primaryGray,
                          borderWidth: moderateScale(1),
                          alignSelf: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: AppColors.primaryColor,
                            fontFamily: AppStyles.fontFamilyBold,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicClosed')}
                        </Text>
                        <Text
                          style={{
                            color: AppColors.textGray,
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicCloseNextWorkDay', {
                            clinicName: self.state.clinicData.clinicName,
                            date: moment(self.state.dateToday).format('DD MMM YYYY'),
                          })}
                        </Text>
                        <View style={{ flexDirection: 'row', margin: moderateScale(20) }}>
                          <View style={{ margin: moderateScale(1) }}>
                            <SHButtonDefault
                              btnText={strings('doctor.button.cancel')}
                              btnType={'border-only'}
                              btnPressBackground={'transparent'}
                              btnTextColor={AppColors.blackColor}
                              onBtnClick={() => self.homeScreen()}
                            />
                          </View>
                          <View style={{ margin: moderateScale(1) }}>
                            <SHButtonDefault
                              btnText={moment(self.state.clinicNextWorkingDay).format('DD MMM YYYY')}
                              btnType={'normal'}
                              onBtnClick={() => self.calender(moment(self.state.clinicNextWorkingDay))}
                            />
                          </View>
                        </View>
                      </ElevatedView>
                    </View>
                  ) : (
                    <View
                      style={{
                        height: height,
                        width: width,
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ElevatedView
                        elevation={200}
                        style={{
                          height: verticalScale(150),
                          width: moderateScale(300),
                          borderRadius: moderateScale(10),
                          marginTop: moderateScale(350),
                          backgroundColor: AppColors.lightGray,
                          borderColor: AppColors.primaryGray,
                          borderWidth: moderateScale(1),
                          alignSelf: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: AppColors.primaryColor,
                            fontFamily: AppStyles.fontFamilyBold,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicClosed')}
                        </Text>
                        <Text
                          style={{
                            color: AppColors.textGray,
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicNameClosed', { clinicName: self.state.clinicData.clinicName })}
                        </Text>
                        <SHButtonDefault
                          btnText={strings('doctro.button.ok')}
                          btnType={'normal'}
                          btnPressBackground={'transparent'}
                          onBtnClick={() => this.closeAlert()}
                        />
                      </ElevatedView>
                    </View>
                  )}
                </View>
              ) : null
              // : (!isClinicOpened)  ?
              // <View style={{
              //     height: height,
              //     width: width,
              //     backgroundColor: 'transparent',
              //     position: 'absolute',
              //     alignSelf: 'center',
              //     justifyContent: 'center',
              //     alignItems: 'center'
              // }}>
              // <ElevatedView elevation={200} style={{
              //     height: verticalScale(150),
              //     width: moderateScale(300),
              //     borderRadius: moderateScale(10),
              //     marginTop: moderateScale(350),
              //     backgroundColor: AppColors.lightGray,
              //     borderColor: AppColors.primaryGray,
              //     borderWidth: moderateScale(1),
              //     alignSelf: 'center',
              //     alignItems: 'center'
              // }}>
              //     <Text style={{
              //         color: AppColors.primaryColor,
              //         fontFamily: AppStyles.fontFamilyBold,
              //         fontSize: moderateScale(15),
              //         margin: moderateScale(10)
              //     }}>{clinicText}</Text>
              //     <Text style={{
              //         color: AppColors.textGray,
              //         fontFamily: AppStyles.fontFamilyMedium,
              //         fontSize: moderateScale(15),
              //         margin: moderateScale(10)
              //     }}>{clinicCompleteText} </Text>
              //     <SHButtonDefault btnText={strings('doctor.button.ok')}
              //                      btnType={'normal'}
              //                      btnPressBackground={'transparent'}
              //                      onBtnClick={() => this.closeAlert()}/>
              //
              // </ElevatedView>
              // </View> : <View/>
            }
          </View>
        ) : (
          <View />
        )}
        {this.modalSettingList()}
        {this.modalSettingMinsList()}
        {this.clinicDetailList()}
        {this.doctorDetailList()}

        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }

  closeAlert() {
    var self = this;
    self.setState({ isAlertOpen: false });
    Actions.HomeScreen();
  }

  homeScreen() {
    let self = this;
    self.setState({ isAlertOpen: false, isCalender: false });
    Actions.HomeScreen();
  }

  goBackToClinicPage() {
    this.setState({
      doctorAvailable: false,
      isMenuOpen: false,
      isCalender: false,
    });
    this.getClinicdetails();
  }

  calender(date) {
    if (!this.state.clinicAdvanceBooking) {
      let selectedDate = date.toDate();
      var bookingEndDate = new Date();
      if (moment(selectedDate).format('YYYY-MM-DD') > moment(bookingEndDate).format('YYYY-MM-DD')) {
        setTimeout(() => {
          AppUtils.showMessage(
            this,
            strings('doctor.alertTitle.sorry'),
            strings('doctor.alertMsg.noAdvanceBookingAllowed'),
            strings('doctor.button.ok'),
            function () {}
          );
        }, 500);
      } else {
        if (Platform.OS === 'ios') {
          this.setState({
            dateToday: date.toDate(),
          });
        } else {
          this.setState({
            dateToday: date,
            isAlertOpen: false,
            doctorAvailable: false,
          });
        }
        this.getClinicdetails(moment(date).format());
      }
    } else {
      let selectedDate = date.toDate();
      var bookingEndDate = new Date();

      let advanceBookingDays = this.state.advanceBookingDays;
      bookingEndDate.setDate(bookingEndDate.getDate() + advanceBookingDays);

      if (moment(selectedDate).format('YYYY-MM-DD') > moment(bookingEndDate).format('YYYY-MM-DD')) {
        var msg = strings('doctor.text.bookingNotAllowedForDate', { days: advanceBookingDays });
        if (advanceBookingDays == 1) {
          msg = strings('doctor.alertMsg.bookingNotAllowed');
        }
        setTimeout(() => {
          AppUtils.showMessage(this, strings('doctor.alertTitle.sorry'), msg, strings('doctor.button.ok'), function () {});
        }, 500);
      } else {
        if (Platform.OS === 'ios') {
          this.setState({
            dateToday: date.toDate(),
          });
        } else {
          this.setState({
            dateToday: date,
            isAlertOpen: false,
            doctorAvailable: false,
          });
        }
        this.getClinicdetails(moment(date).format());
      }
    }
  }

  closeIOSCalender() {
    this.setState({ showDate: false });
    if (this.state.isMenuOpen) {
      let doctorDetails = {
        id: this.state.docID,
        name: this.state.docName,
        image: this.state.docImage,
        speciality: this.state.speciality,
      };
      this.getDoctorSlotsFromDate(doctorDetails);
    } else {
      this.state.isCalender ? this.setDocTimingsIos() : this.getClinicdetails(this.state.dateToday);
    }
  }

  openAndroidCalender() {
    return (
      <View>
        {this.state.showDate ? (
          <DateTimePicker
            value={new Date(this.state.dateToday)}
            style={{ backgroundColor: AppColors.whiteColor }}
            display="spinner"
            mode="date"
            maximumDate={this.state.maxDate}
            minimumDate={this.state.minDate}
            onChange={(event, date) => {
              this.setState({ dateToday: date, showDate: false }, () => this.closeIOSCalender());
            }}
          />
        ) : null}
      </View>
    );
  }

  openIOSCalender() {
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDate}
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
                value={this.state.dateToday}
                style={{ backgroundColor: AppColors.whiteColor }}
                mode="date"
                display={'spinner'}
                maximumDate={this.state.maxDate}
                minimumDate={this.state.minDate}
                onChange={(event, date) => this.setState({ dateToday: date })}
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
                  {moment(this.state.dateToday).format('MMM DD YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  openDoctorSlot() {
    let self = this;
    var docImage = AppUtils.handleNullImg(this.state.docImage);
    return (
      <View
        animation={this.state.animationType}
        onAnimationEnd={() => this.onAnimEnd()}
        onAnimationBegin={() => this.onAnimStart()}
        duration={4000}
        style={styles.menuParentStyle}
      >
        <View style={styles.cardDoctDetails}>
          <CachedImage style={styles.cardDoctImage} source={{ uri: docImage }} />
          <View style={styles.cardDoctor}>
            <Text style={styles.cardDoctorName}>
              {this.state.docName} {this.state.docQualification}
            </Text>
            <Text style={styles.cardDoctorSpec} numberOfLines={1}>
              {this.state.clinicData.clinicName}
            </Text>
            <Text numberOfLines={2} style={styles.cardDoctorSpec}>
              {this.state.speciality}
            </Text>
          </View>
        </View>
        {!self.state.doctorAvailable ? (
          <View
            style={{
              height: height,
              width: width,
              backgroundColor: 'transparent',
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ElevatedView
              elevation={20}
              style={{
                height: verticalScale(200),
                width: moderateScale(300),
                borderRadius: moderateScale(10),
                backgroundColor: AppColors.whiteColor,
                borderColor: AppColors.primaryGray,
                borderWidth: moderateScale(1),
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: AppColors.primaryColor,
                  fontFamily: AppStyles.fontFamilyBold,
                  fontSize: moderateScale(15),
                  margin: moderateScale(10),
                }}
              >
                {strings('doctor.text.docNotAvail')}
              </Text>
              {!self.state.doctorLeave ? (
                <Text
                  style={{
                    color: AppColors.textGray,
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: moderateScale(15),
                    margin: moderateScale(10),
                  }}
                >
                  {strings('doctor.text.docNotAvailDate', { date: moment(self.state.dateToday).format('DD MMM YYYY') })}
                </Text>
              ) : (
                <Text
                  style={{
                    color: AppColors.textGray,
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: moderateScale(15),
                    margin: moderateScale(10),
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignItems: 'center',
                  }}
                >
                  {strings('doctor.text.docNextWorkDayNotAvailTryAgain')}
                </Text>
              )}
              {!self.state.clinicIsClosed && !self.state.doctorLeave ? (
                <View
                  style={{
                    flexDirection: 'row',
                    margin: AppUtils.isLowResiPhone ? moderateScale(8) : moderateScale(20),
                  }}
                >
                  <View style={{ margin: moderateScale(1) }}>
                    <SHButtonDefault
                      btnText={strings('doctor.button.cancel')}
                      btnType={'border-only'}
                      btnPressBackground={'transparent'}
                      btnTextColor={AppColors.blackColor}
                      onBtnClick={() => self.goBackToClinicPage({})}
                    />
                  </View>
                  <View style={{ margin: moderateScale(1) }}>
                    <SHButtonDefault
                      btnText={moment(self.state.doctorNextAvailableDay).format('DD-MM-YYYY')}
                      btnType={'normal'}
                      btnPressBackground={'transparent'}
                      onBtnClick={() => self.calender(moment(self.state.doctorNextAvailableDay))}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', margin: moderateScale(20) }}>
                  <View style={{ margin: moderateScale(1) }}>
                    <SHButtonDefault
                      btnText={strings('doctor.button.ok')}
                      btnType={'normal'}
                      btnPressBackground={'transparent'}
                      btnTextColor={AppColors.whiteColor}
                      onBtnClick={() => self.goBackToClinicPage({})}
                    />
                  </View>
                </View>
              )}
            </ElevatedView>
          </View>
        ) : (
          <View style={{ height: height }}>
            <ScrollView style={{ height: height - verticalScale(100) }}>
              <View style={styles.cardSlot}>
                <Text style={styles.cardSelectText}>{strings('doctor.text.selectSlot')}</Text>
                <TouchableHighlight
                  onPress={() => this.openCalender1()}
                  underlayColor="transparent"
                  style={{
                    width: moderateScale(80),
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <View
                    style={{
                      borderRadius: moderateScale(10),
                      width: moderateScale(80),
                      height: verticalScale(50),
                      backgroundColor: AppColors.primaryColor,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={styles.cardDate}>{moment(this.state.dateToday).format('MMM DD')}</Text>
                  </View>
                </TouchableHighlight>
              </View>
              <View
                style={{
                  marginBottom: moderateScale(10),
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              >
                {!this.state.clinicAdvanceBooking ? (
                  <Text style={{ color: AppColors.primaryColor }}>{strings('doctor.text.bookBeforeSixty')}</Text>
                ) : (
                  <Text />
                )}
              </View>

              <View
                style={{
                  height: AppUtils.isLowResiPhone ? verticalScale(300) : verticalScale(280),
                  width: width,
                  flexDirection: 'row',
                }}
              >
                <FlatList
                  data={this.state.morningTimeSlot}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item) => this._render_morningSlot(item)}
                  extraData={this.state}
                />
              </View>
              <View style={[styles.clinicbuttonView]}>
                <SHButton
                  btnText={strings('doctor.button.cancel')}
                  btnType={'border-only'}
                  btnTextColor={AppColors.blackColor}
                  btnPressBackground={'transparent'}
                  style={{ alignSelf: 'center' }}
                  onBtnClick={() => this.cancel()}
                />

                <SHButton
                  btnText={strings('doctor.button.proceed')}
                  btnType={'normal'}
                  btnTextColor={AppColors.whiteColor}
                  btnPressBackground={AppColors.primaryColor}
                  onBtnClick={() => this.nextScreen()}
                />
              </View>
            </ScrollView>
            <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
          </View>
        )}
      </View>
    );
  }

  openDoctorSession() {
    let self = this;
    var docImage = AppUtils.handleNullImg(this.state.docImage);
    let sessVal = this.state.shiftSelected + 1;
    let hours = this.state.hours + ' ' + this.state.ext + ' Sess ' + sessVal;
    return (
      <View
        animation={this.state.animationType}
        onAnimationEnd={() => this.onAnimEnd()}
        onAnimationBegin={() => this.onAnimStart()}
        duration={4000}
        style={styles.menuParentStyle}
      >
        <View style={[styles.cardDoctDetails, { marginLeft: moderateScale(30) }]}>
          <View style={{ alignItems: 'center', alignSelf: 'center' }}>
            <CachedImage style={styles.cardDoctImage} source={{ uri: docImage }} />
            <View style={{ flexDirection: 'row', height: wp(4) }}>
              {this.state.videoCall ? (
                <Image
                  style={{ height: wp(4), width: wp(4) }}
                  resizeMode={'contain'}
                  source={require('../../../assets/images/video_camera_red.png')}
                />
              ) : null}
              {this.state.audioCall ? (
                <Image
                  style={{ height: wp(4), width: wp(4), marginLeft: wp(1) }}
                  resizeMode={'contain'}
                  source={require('../../../assets/images/tele_red.png')}
                />
              ) : null}
              {this.state.inHouseCall ? (
                <Image
                  style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }}
                  resizeMode={'contain'}
                  source={require('../../../assets/images/house_call_red.png')}
                />
              ) : null}
            </View>
          </View>
          <View style={styles.cardDoctor}>
            <Text style={styles.cardDoctorName}>
              {this.state.docName} {this.state.docQualification}
            </Text>
            <Text style={styles.cardDoctorSpec} numberOfLines={1}>
              {this.state.clinicData.clinicName}
            </Text>
            <Text style={styles.cardDoctorSpec}>{this.state.speciality}</Text>
          </View>
        </View>
        {!self.state.doctorAvailable ? (
          <View
            style={{
              height: height,
              width: width,
              backgroundColor: 'transparent',
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ElevatedView
              elevation={20}
              style={{
                height: verticalScale(200),
                width: moderateScale(300),
                borderRadius: moderateScale(10),
                backgroundColor: AppColors.whiteColor,
                borderColor: AppColors.primaryGray,
                borderWidth: moderateScale(1),
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: AppColors.primaryColor,
                  fontFamily: AppStyles.fontFamilyBold,
                  fontSize: moderateScale(15),
                  margin: moderateScale(10),
                }}
              >
                {strings('doctor.text.docNotAvailToday')}
              </Text>
              {!self.state.doctorLeave ? (
                <Text
                  style={{
                    color: AppColors.textGray,
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: moderateScale(15),
                    margin: moderateScale(10),
                  }}
                >
                  {strings('doctor.text.docNotAvailDate', { date: moment(self.state.dateToday).format('DD MMM YYYY') })}
                </Text>
              ) : (
                <Text
                  style={{
                    color: AppColors.textGray,
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: moderateScale(15),
                    margin: moderateScale(10),
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignItems: 'center',
                  }}
                >
                  {strings('doctor.text.docNextWorkDayNotAvailTryAgain')}
                </Text>
              )}
              {self.state.isAlertOpen ? (
                <View style={{ height: height, width: width, position: 'absolute' }}>
                  {self.state.isNextWorkingDayAvaialble ? (
                    <View
                      style={{
                        height: height,
                        width: width,
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ElevatedView
                        elevation={200}
                        style={{
                          height: verticalScale(200),
                          width: moderateScale(320),
                          borderRadius: moderateScale(10),
                          marginTop: moderateScale(350),
                          backgroundColor: AppColors.lightGray,
                          borderColor: AppColors.primaryGray,
                          borderWidth: moderateScale(1),
                          alignSelf: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: AppColors.primaryColor,
                            fontFamily: AppStyles.fontFamilyBold,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicClosed')}
                        </Text>
                        <Text
                          style={{
                            color: AppColors.textGray,
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicCloseNextWorkDay', {
                            clinicName: self.state.clinicData.clinicName,
                            date: moment(self.state.dateToday).format('DD MMM YYYY'),
                          })}
                        </Text>
                        <View style={{ flexDirection: 'row', margin: moderateScale(20) }}>
                          <View style={{ margin: moderateScale(1) }}>
                            <SHButtonDefault
                              btnText={strings('doctor.button.cancel')}
                              btnType={'border-only'}
                              btnPressBackground={'transparent'}
                              btnTextColor={AppColors.blackColor}
                              onBtnClick={() => self.homeScreen()}
                            />
                          </View>
                          <View style={{ margin: moderateScale(1) }}>
                            <SHButtonDefault
                              btnText={moment(self.state.clinicNextWorkingDay).format('DD MMM YYYY')}
                              btnType={'normal'}
                              onBtnClick={() => self.homeScreen()}
                            />
                          </View>
                        </View>
                      </ElevatedView>
                    </View>
                  ) : (
                    <View
                      style={{
                        height: height,
                        width: width,
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ElevatedView
                        elevation={200}
                        style={{
                          height: verticalScale(150),
                          width: moderateScale(300),
                          borderRadius: moderateScale(10),
                          marginTop: moderateScale(350),
                          backgroundColor: AppColors.lightGray,
                          borderColor: AppColors.primaryGray,
                          borderWidth: moderateScale(1),
                          alignSelf: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: AppColors.primaryColor,
                            fontFamily: AppStyles.fontFamilyBold,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.clinicClosed')}
                        </Text>
                        <Text
                          style={{
                            color: AppColors.textGray,
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: moderateScale(15),
                            margin: moderateScale(10),
                          }}
                        >
                          {self.state.clinicData.clinicName} is closed
                        </Text>
                        <SHButtonDefault
                          btnText={strings('doctor.button.ok')}
                          btnType={'normal'}
                          btnPressBackground={'transparent'}
                          onBtnClick={() => this.closeAlert()}
                        />
                      </ElevatedView>
                    </View>
                  )}
                </View>
              ) : (
                <View />
              )}

              {!self.state.clinicIsClosed && !self.state.doctorLeave ? (
                <View
                  style={{
                    flexDirection: 'row',
                    margin: AppUtils.isLowResiPhone ? moderateScale(8) : moderateScale(20),
                  }}
                >
                  <View style={{ margin: moderateScale(1) }}>
                    <SHButtonDefault
                      btnText={strings('doctor.button.cancel')}
                      btnType={'border-only'}
                      btnPressBackground={'transparent'}
                      btnTextColor={AppColors.blackColor}
                      onBtnClick={() => self.goBackToClinicPage({})}
                    />
                  </View>
                  <View style={{ margin: moderateScale(1) }}>
                    <SHButtonDefault
                      btnText={moment(self.state.doctorNextAvailableDay).format('DD-MM-YYYY')}
                      btnType={'normal'}
                      btnPressBackground={'transparent'}
                      onBtnClick={() => self.calender(moment(self.state.doctorNextAvailableDay))}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', margin: moderateScale(20) }}>
                  <View style={{ margin: moderateScale(1) }}>
                    <SHButtonDefault
                      btnText={strings('doctor.button.ok')}
                      btnType={'normal'}
                      btnPressBackground={'transparent'}
                      btnTextColor={AppColors.whiteColor}
                      onBtnClick={() => self.goBackToClinicPage({})}
                    />
                  </View>
                </View>
              )}
            </ElevatedView>
          </View>
        ) : (
          <View style={{ height: height }}>
            <ScrollView style={{ height: height - verticalScale(100) }}>
              <ScrollView style={{ height: AppUtils.isLowResiPhone ? verticalScale(300) : verticalScale(350) }}>
                <View
                  style={{
                    flexDirection: 'column',
                    // margin: moderateScale(10),
                    marginTop: moderateScale(15),
                    marginLeft: moderateScale(25),
                    marginRight: moderateScale(25),
                    marginBottom: moderateScale(30),
                    alignItems: 'flex-start',
                  }}
                >
                  {this.state.isClinicRemoteConsultationEnabled && (this.state.audioCall || this.state.videoCall) ? (
                    <View
                      style={{
                        height: verticalScale(90),
                        width: width - moderateScale(40),
                        borderWidth: 0,
                        alignItems: 'center',
                        alignSelf: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          height: verticalScale(30),
                          width: width - moderateScale(40),
                          borderWidth: 0,
                          alignItems: 'center',
                          flexDirection: 'row',
                          alignSelf: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: AppStyles.fontFamilyBold,
                            fontSize: moderateScale(15),
                            color: AppColors.blackColor,
                            alignSelf: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
                          }}
                        >
                          {strings('doctor.text.optRemoteConsult')}
                        </Text>
                        <Switch
                          value={this.state.remoteCosultation}
                          onSyncPress={(value) => this.toggleSwitchConsulting(value, 2)}
                          backgroundActive={AppColors.switchBackground}
                          backgroundInactive={AppColors.switchBackground}
                          circleActiveColor={AppColors.colorHeadings}
                          circleInActiveColor={AppColors.switchOff}
                          changeValueImmediately={true}
                          innerCircleStyle={{
                            borderColor: 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      </View>
                      {this.state.remoteCosultation ? (
                        <View>
                          {this.state.videoCall ? (
                            <View
                              style={{
                                height: verticalScale(30),
                                width: width - moderateScale(40),
                                borderWidth: 0,
                                alignItems: 'center',
                                flexDirection: 'row',
                                alignSelf: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  fontSize: moderateScale(15),
                                  color: AppColors.blackColor,
                                  alignSelf: 'center',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
                                }}
                              >
                                {strings('doctor.text.optVideoConsult')}
                              </Text>
                              <Switch
                                value={this.state.isVideoConsultationEnabled}
                                onSyncPress={(value) => this.toggleSwitchConsulting(value, 0)}
                                backgroundActive={AppColors.switchBackground}
                                backgroundInactive={AppColors.switchBackground}
                                circleActiveColor={AppColors.colorHeadings}
                                circleInActiveColor={AppColors.switchOff}
                                changeValueImmediately={true}
                                innerCircleStyle={{
                                  borderColor: 'transparent',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              />
                            </View>
                          ) : (
                            <View />
                          )}
                          {this.state.audioCall ? (
                            <View
                              style={{
                                height: verticalScale(30),
                                width: width - moderateScale(40),
                                borderWidth: 0,
                                alignItems: 'center',
                                flexDirection: 'row',
                                alignSelf: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  fontSize: moderateScale(15),
                                  color: AppColors.blackColor,
                                  alignSelf: 'center',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
                                }}
                              >
                                {strings('doctor.text.optAudioConsult')}
                              </Text>
                              <Switch
                                value={this.state.isAudioConsultationEnabled}
                                onSyncPress={(value) => this.toggleSwitchConsulting(value, 1)}
                                backgroundActive={AppColors.switchBackground}
                                backgroundInactive={AppColors.switchBackground}
                                circleActiveColor={AppColors.colorHeadings}
                                circleInActiveColor={AppColors.switchOff}
                                changeValueImmediately={true}
                                innerCircleStyle={{
                                  borderColor: 'transparent',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              />
                            </View>
                          ) : (
                            <View />
                          )}
                        </View>
                      ) : (
                        <View />
                      )}
                    </View>
                  ) : null}

                  <Text
                    style={{
                      alignSelf: 'flex-start',
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: moderateScale(17),
                      color: AppColors.primaryColor,
                      flex: 1,
                      marginTop: verticalScale(10),
                    }}
                  >
                    {strings('doctor.text.selectDate')}
                  </Text>

                  <View style={{ marginTop: moderateScale(10), marginBottom: moderateScale(20) }}>
                    <TouchableHighlight
                      onPress={() => (self.state.doctorAdbCheck ? self.adbAlert() : self.openCalender())}
                      underlayColor="transparent"
                      style={{
                        width: moderateScale(80),
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <View
                        style={{
                          borderRadius: moderateScale(10),
                          width: moderateScale(80),
                          height: verticalScale(50),
                          backgroundColor: AppColors.primaryColor,
                          alignSelf: 'center',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={styles.cardDate}>{moment(this.state.dateToday).format('MMM DD')}</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
                <View
                  style={{
                    marginRight: moderateScale(20),
                    marginLeft: moderateScale(25),
                    marginBottom: moderateScale(20),
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: moderateScale(17),
                      color: AppColors.primaryColor,
                      flex: 1,
                      marginBottom: moderateScale(10),
                      textAlign: isRTL ? "left" : "auto"
                    }}
                  >
                    {strings('doctor.text.selectTime')}
                  </Text>

                  {/*<View style={{flexDirection: 'row', width: wp(90)}}>*/}
                  {/*    <View style={[styles.selectTimeMainView, {width: wp(38)}]}>*/}
                  {/*        <TouchableOpacity onPress={() => this.refs.hourDropdown.onPress()}*/}
                  {/*                          style={[styles.selectTimeTouchView, {width: wp(38)}]}>*/}
                  {/*            <Dropdown*/}
                  {/*                ref={'hourDropdown'}*/}
                  {/*                label=''*/}
                  {/*                textColor={AppColors.blackColor}*/}
                  {/*                itemColor={AppColors.blackColor}*/}
                  {/*                dropdownPosition={-9.6}*/}
                  {/*                fontSize={hp(2)}*/}
                  {/*                fontFamily={AppStyles.fontFamilyRegular}*/}
                  {/*                dropdownOffset={{top: hp(-25), left: wp(4)}}*/}
                  {/*                itemTextStyle={{fontFamily: AppStyles.fontFamilyRegular, fontSize: wp(2)}}*/}
                  {/*                rippleCentered={false}*/}
                  {/*                dropdownMargins={{min: 8, max: 16}}*/}
                  {/*                baseColor={'transparent'}*/}
                  {/*                onChangeText={(value, index, data) => this.setTheHoursInClk(data[index])}*/}
                  {/*                value={hours}*/}
                  {/*                pickerStyle={{*/}
                  {/*                    width: wp(35),*/}
                  {/*                    height: hp(28),*/}
                  {/*                    padding:0*/}
                  {/*                }}*/}
                  {/*                containerStyle={{*/}
                  {/*                    width: wp(30),*/}
                  {/*                    padding: 0,*/}
                  {/*                    marginTop: (Platform.OS === 'ios') ? hp(3) : hp(4),*/}
                  {/*                    justifyContent: 'center',*/}
                  {/*                    fontFamily: AppStyles.fontFamilyRegular,*/}
                  {/*                }}*/}
                  {/*                data={this.state.listToShowHoursFT}*/}
                  {/*            />*/}

                  {/*            <Image resizeMode={'contain'} style={styles.selectTimeDropdownIcon}*/}
                  {/*                   source={require('../../../assets/images/arrow_down.png')}/>*/}
                  {/*        </TouchableOpacity>*/}
                  {/*    </View>*/}
                  {/*    <Text style={[styles.timeDivider]}>:</Text>*/}
                  {/*    <View style={[styles.selectTimeMainView, {alignItems: 'center', width: wp(20)}]}>*/}
                  {/*        <TouchableOpacity onPress={() => this.refs.minDropdown.onPress()}*/}
                  {/*                          style={[styles.selectTimeTouchView, {width: wp(20)}]}>*/}
                  {/*            <Dropdown*/}
                  {/*                ref={'minDropdown'}*/}
                  {/*                label=''*/}
                  {/*                textColor={AppColors.blackColor}*/}
                  {/*                itemColor={AppColors.blackColor}*/}
                  {/*                dropdownPosition={-10}*/}
                  {/*                fontSize={hp(2)}*/}
                  {/*                fontFamily={AppStyles.fontFamilyRegular}*/}
                  {/*                dropdownOffset={{top: hp(-25), left: wp(4 )}}*/}
                  {/*                itemTextStyle={{fontFamily: AppStyles.fontFamilyRegular, fontSize: wp(2)}}*/}
                  {/*                rippleCentered={false}*/}
                  {/*                onChangeText={(value, index, data) => this.setTheMinsInClk(data[index])}*/}
                  {/*                dropdownMargins={{min: 8, max: 16}}*/}
                  {/*                baseColor={'transparent'}*/}
                  {/*                value={this.state.mins}*/}
                  {/*                pickerStyle={{*/}
                  {/*                    width: wp(18),*/}
                  {/*                    height: hp(28)*/}
                  {/*                }}*/}
                  {/*                containerStyle={{*/}
                  {/*                    width: wp(12),*/}
                  {/*                    marginTop: (Platform.OS === 'ios') ? hp(3) : hp(4),*/}
                  {/*                    justifyContent: 'center',*/}
                  {/*                    fontFamily: AppStyles.fontFamilyRegular,*/}
                  {/*                }}*/}
                  {/*                data={this.state.listToShowMinsFT}*/}
                  {/*            />*/}

                  {/*            <Image resizeMode={'contain'} style={styles.selectTimeDropdownIcon}*/}
                  {/*                   source={require('../../../assets/images/arrow_down.png')}/>*/}
                  {/*        </TouchableOpacity>*/}
                  {/*    </View>*/}
                  {/*    <Text style={[styles.timeDivider]}>:</Text>*/}
                  {/*    <View style={[styles.selectTimeMainView, {alignItems: 'flex-end', width: wp(18)}]}>*/}
                  {/*        <TouchableOpacity*/}
                  {/*                          style={[styles.selectTimeTouchView, {width: wp(18)}]}>*/}
                  {/*            <Dropdown*/}
                  {/*                ref={'ampmDropdown'}*/}
                  {/*                label=''*/}
                  {/*                textColor={AppColors.blackColor}*/}
                  {/*                itemColor={AppColors.blackColor}*/}
                  {/*                dropdownPosition={-5}*/}
                  {/*                fontSize={hp(2)}*/}
                  {/*                fontFamily={AppStyles.fontFamilyRegular}*/}
                  {/*                dropdownOffset={{top: hp(-25), left: wp(1.2)}}*/}
                  {/*                itemTextStyle={{fontFamily: AppStyles.fontFamilyRegular, fontSize: wp(2)}}*/}
                  {/*                rippleCentered={false}*/}
                  {/*                dropdownMargins={{min: 8, max: 16}}*/}
                  {/*                baseColor={'transparent'}*/}
                  {/*                value={this.state.ext}*/}
                  {/*                pickerStyle={{*/}
                  {/*                    width: wp(20),*/}
                  {/*                    height: hp(10)*/}
                  {/*                }}*/}
                  {/*                containerStyle={{*/}
                  {/*                    width: wp(14),*/}
                  {/*                    marginTop: (Platform.OS === 'ios') ? hp(3) : hp(4),*/}
                  {/*                    justifyContent: 'center',*/}
                  {/*                    fontFamily: AppStyles.fontFamilyRegular,*/}
                  {/*                }}*/}
                  {/*            />*/}
                  {/*        </TouchableOpacity>*/}

                  {/*    </View>*/}

                  {/*</View>*/}
                  <View
                    style={{
                      flexDirection: 'row',
                      height: verticalScale(60),
                      width: moderateScale(200),
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => (!this.state.isDoctorSessionExist ? AppUtils.console('Doctor Doesnot have time') : this.setTheDoctorTimings())}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          height: verticalScale(50),
                          justifyContent: 'space-around',
                          alignItems: 'center',
                          marginRight: moderateScale(15),
                          width: moderateScale(75),
                          borderRadius: moderateScale(10),
                          borderColor: AppColors.dividerColor,
                          borderWidth: moderateScale(1),
                        }}
                      >
                        <Text style={{ marginLeft: moderateScale(2), fontSize: moderateScale(15) }}>{this.state.hours}</Text>
                        <Image
                          source={require('../../../assets/images/drop_black.png')}
                          style={{
                            width: 23,
                            height: 23,
                            borderRadius: 23,
                            marginRight: moderateScale(2),
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                    <View>
                      <Text
                        style={{
                          color: AppColors.blackColor,
                          alignSelf: 'center',
                          alignItems: 'center',
                          fontSize: moderateScale(30),
                        }}
                      >
                        :
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => (!this.state.isDoctorSessionExist ? AppUtils.console('Doctor Doesnot have time') : this.setMinsBeforeSetting())}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          height: verticalScale(50),
                          justifyContent: 'space-around',
                          alignItems: 'center',
                          marginLeft: moderateScale(15),
                          width: moderateScale(75),
                          marginRight: moderateScale(15),
                          borderRadius: moderateScale(10),
                          borderColor: AppColors.dividerColor,
                          borderWidth: moderateScale(1),
                        }}
                      >
                        <Text style={{ marginLeft: moderateScale(2), fontSize: moderateScale(15) }}>{this.state.mins}</Text>
                        <Image
                          source={require('../../../assets/images/drop_black.png')}
                          style={{
                            width: 23,
                            height: 23,
                            borderRadius: 23,
                            marginRight: moderateScale(2),
                          }}
                        />
                      </View>
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: 'row',
                        height: verticalScale(50),
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        marginLeft: moderateScale(15),
                        width: moderateScale(75),
                        marginRight: moderateScale(15),
                        borderRadius: moderateScale(10),
                        borderColor: AppColors.dividerColor,
                        borderWidth: moderateScale(1),
                      }}
                    >
                      <Text style={{ marginLeft: moderateScale(2), fontSize: moderateScale(15) }}>{this.state.ext}</Text>
                    </View>
                  </View>

                  {!this.state.isDoctorSessionExist ? (
                    <View style={{ width: width - 50 }}>
                      <Text style={{ fontSize: moderateScale(15), color: AppColors.primaryColor }} numberOfLines={2}>
                        {strings('doctor.text.docTodayWorkComplete')}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                </View>
              </ScrollView>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  alignSelf: 'center',
                  width: width,
                  height: AppUtils.isLowResiPhone ? verticalScale(90) : verticalScale(80),
                  flexDirection: 'row',
                  flex: 1,
                  marginBottom: verticalScale(100),

                  marginTop: verticalScale(25),
                }}
              >
                <SHButton
                  btnText={strings('doctor.button.cancel')}
                  btnType={'border-only'}
                  btnTextColor={AppColors.blackColor}
                  btnPressBackground={'transparent'}
                  style={{ alignSelf: 'center', marginTop: moderateScale(20) }}
                  onBtnClick={() => this.cancel()}
                />

                <SHButton
                  btnText={strings('doctor.button.proceed')}
                  btnType={'normal'}
                  style={{ alignSelf: 'center', marginTop: moderateScale(20) }}
                  btnTextColor={AppColors.whiteColor}
                  btnPressBackground={AppColors.primaryColor}
                  onBtnClick={() =>
                    !this.state.isDoctorSessionExist
                      ? this.showSessionAlert()
                      : this.state.isCalender == true
                      ? this.proceedForCalenderBasedAppointment()
                      : this.nextScreen()
                  }
                />
              </View>
            </ScrollView>
            <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
          </View>
        )}
      </View>
    );
  }

  proceedForCalenderBasedAppointment() {
    if (this.state.remoteCosultation) {
      if (this.state.isVideoConsultationEnabled || this.state.isAudioConsultationEnabled) {
        this.nextCalenderScreen();
      } else {
        alert(strings('doctor.alertMsg.selectConsultType'));
      }
    } else {
      this.nextCalenderScreen();
    }
  }

  adbAlert() {
    Alert.alert('', strings('doctor.alertMsg.noFutureRequest'));
  }

  toggleSwitchConsulting(value, module) {
    if (module === 0) {
      this.setState({ isVideoConsultationEnabled: value, isAudioConsultationEnabled: !value });
    } else if (module === 2) {
      this.setState({ remoteCosultation: value }, () => {
        if (!value) {
          this.setState({ isAudioConsultationEnabled: false, isVideoConsultationEnabled: false });
        }
      });
    } else {
      this.setState({ isAudioConsultationEnabled: value, isVideoConsultationEnabled: !value });
    }
  }

  showSessionAlert() {
    Alert.alert('', strings('doctor.alertMsg.docWorkComplete'));
  }

  nextCalenderScreen() {
    var self = this;
    var isSlotSelected = 0;
    let timeCheckForExpire = 3600000;
    let sessionstartHour = self.state.clinicStartHour;
    let sessionstartMinute = self.state.clinicStartMinute;
    let sessionEndHour = self.state.clinicEndHour;
    let sessionEndMinute = self.state.clinicEndMinute;
    let currentTime = moment(new Date()).format('YYYY-MM-DDTHH:mm:00');
    let currentDate = moment(new Date()).format('YYYY-MM-DD');
    let startDate = moment(this.state.start).format('YYYY-MM-DD');
    let nextWorkingDate = moment().add(1, 'days').format('YYYY-MM-DD');
    let stTime = this.state.start;
    let isTimeExpired = false;
    let clinicStartTime = currentTime;
    let clinicAvailableBookingTime = AppUtils.timeConversion(parseInt(sessionstartHour) + 1, sessionstartMinute);

    AppUtils.console('sezdfgdf', clinicAvailableBookingTime);
    let isClinicStarted = AppUtils.isClinicStarted(sessionstartHour, sessionstartMinute);
    if (currentDate !== startDate) {
      if (nextWorkingDate !== startDate) {
        AppUtils.console('sezdfgdf1', clinicAvailableBookingTime);
        self.sendRequest(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute);
      } else {
        AppUtils.console('sezdfgdf12', clinicAvailableBookingTime);
        let month = moment().format('MM');
        let day = moment().format('DD');
        let year = moment().format('YYYY');
        let clinicEndTime = moment(new Date(year, parseInt(month) - 1, day, sessionEndHour, sessionEndMinute))
          .tz(getTimeZone())
          .format('YYYY-MM-DDTHH:mm:00');
        AppUtils.validateTime(currentTime, clinicEndTime, function (isValid, diff) {
          isTimeExpired = diff <= timeCheckForExpire;
          if (isTimeExpired) {
            month = moment(nextWorkingDate).format('MM');
            day = moment(nextWorkingDate).format('DD');
            year = moment(nextWorkingDate).format('YYYY');
            clinicStartTime = moment(new Date(year, parseInt(month) - 1, day, sessionstartHour, sessionstartMinute))
              .tz(getTimeZone())
              .format('YYYY-MM-DDTHH:mm:00');
            AppUtils.validateTime(clinicStartTime, stTime, function (isValid, diff) {
              isTimeExpired = diff <= timeCheckForExpire;
              if (isTimeExpired) {
                alert(strings('doctor.alertMsg.chooseSlotTime', { time: clinicAvailableBookingTime }));
              } else {
                self.sendRequest(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute);
              }
            });
          } else {
            self.sendRequest(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute);
          }
        });
      }
    } else {
      AppUtils.console('sezdfgdf123', isClinicStarted);
      if (!isClinicStarted) {
        let month = moment().format('MM');
        let day = moment().format('DD');
        let year = moment().format('YYYY');
        clinicStartTime = moment(new Date(year, parseInt(month) - 1, day, sessionstartHour, sessionstartMinute))
          .tz(getTimeZone())
          .format('YYYY-MM-DDTHH:mm:00');
      }
      AppUtils.validateTime(clinicStartTime, stTime, function (isValid, diff) {
        AppUtils.console('sezdfgdf123', isClinicStarted, clinicStartTime, stTime, isValid, diff);
        isTimeExpired = diff <= timeCheckForExpire;
        if (isTimeExpired) {
          isClinicStarted
            ? alert(strings('doctor.alertMsg.cannotRaiseRequest'))
            : alert(strings('doctor.alertMsg.chooseSlotTime', { time: clinicAvailableBookingTime }));
        } else {
          self.sendRequest(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute);
        }
      });
    }
  }

  sendRequest(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute) {
    var doctorID = this.state.docID;
    var doctorName = this.state.docName;
    var docImage = this.state.docImage;
    var docSpeciality = this.state.speciality;
    var qualification = this.state.qualification;

    var clinicID = this.state.clinicData._id;
    var clinicName = this.state.clinicData.clinicName;

    var shiftID = this.state.shiftID;
    var startTime = this.state.start; //moment(this.state.dateToday).format('YYYY-MM-DDTHH:mm:ss');

    var shiftSelected = this.state.shiftSelected;

    var departmentId = this.state.departmentId;
    var latitude = this.props.latitude;
    var longitude = this.props.longitude;
    var timeout = this.state.timeout;
    let callType = this.state.remoteCosultation
      ? this.state.isAudioConsultationEnabled
        ? 'AUDIO'
        : this.state.isVideoConsultationEnabled
        ? 'VIDEO'
        : null
      : null;

    let appointmentData = {
      clinicId: clinicID,
      doctorId: doctorID,
      start: startTime,
      shiftSlotId: shiftID,
      docName: doctorName,
      docImage: docImage,
      docSpeciality: docSpeciality,
      doctorDescription: this.state.doctorDescription,
      qualification: qualification,
      clinicName: clinicName,
      shiftIndex: shiftSelected,
      departmentId: departmentId,
      latitude: latitude,
      longitude: longitude,
      isCalender: true,
      timeout: timeout,
      startHour: sessionstartHour,
      startMin: sessionstartMinute,
      endHour: sessionEndHour,
      endMins: sessionEndMinute,
      callType: callType,
      licenseFor: 'CLINIC',
    };
    AppUtils.console('sdxgfhjgsetrgvh', appointmentData);
    AppUtils.userSessionValidation(function (loggedIn) {
      if (!loggedIn) {
        Actions.LoginMobile({ appointmentData: appointmentData });
      } else {
        //let isClinicOpened= AppUtils.isClinicOpen(sessionstartHour, sessionstartMinute, sessionEndHour, sessionEndMinute);
        let isClinicOpened = true;
        if (isClinicOpened) {
          Actions.Registration({ appointmentData: appointmentData });
        } else {
          Alert.alert(
            strings('doctor.button.clinicClosed'),
            strings('doctor.text.clinicWorkCompleted'),
            [{ text: strings('doctor.button.ok'), onPress: () => self.goBack() }],
            { cancelable: false }
          );
        }
      }
    });
  }

  nextScreen() {
    var self = this;
    let sessionstartHour = self.state.clinicStartHour;
    let sessionstartMinute = self.state.clinicStartMinute;
    let sessionEndHour = self.state.clinicEndHour;
    let sessionEndMinute = self.state.clinicEndMinute;
    var arrayData = this.state.morningTimeSlot;
    var dataLength = arrayData.length;
    var isSlotSelected = 0;

    var doctorID = this.state.docID;
    var doctorName = this.state.docName;
    var docImage = this.state.docImage;
    var docSpeciality = this.state.speciality;

    var clinicID = this.state.clinicData._id;
    var clinicName = this.state.clinicData.clinicName;

    var daySlotID = this.state.slotData._id;
    var slotID = this.state.selectedSlot._id;
    var shiftID = this.state.shiftID;
    var startTime = this.state.selectedSlot.start;
    var endTime = this.state.selectedSlot.end;

    var shiftSelected = this.state.shiftSelected;
    var slotSelected = this.state.slotSelected;

    var departmentId = this.state.departmentId;

    var latitude = this.props.latitude;
    var longitude = this.props.longitude;

    var queueNumber = this.state.queueNumber;
    var sequence = this.state.sequence;
    var appointmentData = {
      clinicId: clinicID,
      doctorId: doctorID,
      start: startTime,
      end: endTime,
      daySlotId: daySlotID,
      shiftSlotId: shiftID,
      slotId: slotID,
      docName: doctorName,
      docImage: docImage,
      doctorDescription: this.state.doctorDescription,
      docSpeciality: docSpeciality,
      clinicName: clinicName,
      shiftIndex: shiftSelected,
      slotIndex: slotSelected,
      departmentId: departmentId,
      latitude: latitude,
      longitude: longitude,
      queueNumber: queueNumber,
      sequence: sequence,
      isCalender: false,
      startHour: sessionstartHour,
      startMin: sessionstartMinute,
      endHour: sessionEndHour,
      endMins: sessionEndMinute,
    };

    AppUtils.console('dsxfsezsfsrxd', appointmentData);

    for (var i = 0; i < dataLength; i++) {
      var getSubData = arrayData[i].slots.length;
      for (var j = 0; j < getSubData; j++) {
        if (arrayData[i].slots[j].isSelected) {
          isSlotSelected = 1;
        }
      }
    }

    if (isSlotSelected === 1) {
      var self = this;
      var details = {
        doctorId: doctorID,
        departmentId: departmentId,
        clinicId: clinicID,
        slotStart: startTime,
        longitude: self.props.longitude,
        latitude: self.props.latitude,
      };
      //
      SHApiConnector.getBookingSuggestion(details, function (err, stat) {
        AppUtils.console('sfwrsgf23434_3w43', err, stat);
        try {
          if (!err && stat) {
            if (stat.length == 0) {
              AppUtils.userSessionValidation(function (loggedIn) {
                if (!loggedIn) {
                  Actions.LoginMobile({ appointmentData: appointmentData });
                  self.setState({ isModalOpen: false });
                } else {
                  Actions.Registration({ appointmentData: appointmentData });
                  self.setState({ isModalOpen: false });
                }
              });
            } else {
              AppUtils.userSessionValidation(function (loggedIn) {
                if (!loggedIn) {
                  Actions.LoginMobile({ appointmentData: appointmentData });
                  self.setState({ isModalOpen: false });
                } else {
                  Actions.BookingSuggestions({ appointmentData: appointmentData });
                  self.setState({ isModalOpen: false });
                }
              });
            }
          }
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      setTimeout(() => {
        AppUtils.console('sd2r4esdfcsdxf_', appointmentData);
        AppUtils.showMessage(
          this,
          strings('doctor.alertTitle.sorry'),
          strings('doctor.alertMsg.selectSlot'),
          strings('doctor.button.ok'),
          function () {}
        );
      }, 500);
    }
  }

  cancel() {
    this.setState({
      isMenuOpen: false,
      isCalender: false,
    });
    this.getClinicdetails(this.state.dateToday);
  }

  _render_spec(item) {
    AppUtils.console('Sdfsdgcgfdasdfg', item);
    var dept = item.item;
    return dept.departmentId && dept.departmentId.departmentName ? (
      <ChipView
        height={20}
        width={moderateScale(90)}
        style={{ marginTop: moderateScale(5), marginLeft: moderateScale(10) }}
        chipText={dept.departmentId.departmentName}
      />
    ) : null;
  }

  doctorDetailList() {
    AppUtils.console('sdfvsersfdgrgf', this.state.selectedDocDetails);
    return (
      <Modal
        visible={this.state.isDoctorDetail}
        transparent={true}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: AppColors.transparent,
          height: AppUtils.screenHeight,
          width: AppUtils.screenWidth,
        }}
        animationType={'fade'}
        onRequestClose={() => this.onBackPress1()}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
          activeOpacity={1}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: AppColors.transparent,
              height: AppUtils.screenHeight,
              width: AppUtils.screenWidth,
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={[AppColors.primaryColor, AppColors.primaryLight]}
              style={{
                backgroundColor: AppColors.whiteColor,
                width: wp(90),
                alignItems: 'center',
                alignSelf: 'center',
                borderRadius: hp(2),
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', paddingTop: Platform.OS === 'ios' ? moderateScale(20) : 0 }}>
                  <View style={{ flex: 1 }} />

                  <View style={{ flex: 1, alignItems: 'center', alignSelf: 'center' }}>
                    <View
                      style={[
                        {
                          marginTop: hp(2),
                          height: hp(13),
                          width: hp(13),
                          borderRadius: hp(10),
                          borderColor: AppColors.colorHeadings,
                          borderWidth: hp(0.2),
                        },
                        { overflow: 'hidden' },
                      ]}
                    >
                      <Image
                        style={{
                          backgroundColor: AppColors.whiteColor,
                          height: hp(13),
                          width: hp(13),
                          borderRadius: PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30) / 2,
                        }}
                        resizeMode={'cover'}
                        source={{ uri: AppUtils.handleNullClinicImg(this.state.selectedDocDetails.profilePic) }}
                      />
                    </View>
                  </View>
                  <TouchableHighlight
                    style={[{ alignSelf: 'flex-start', flex: 1 }, styles.navbar]}
                    underlayColor="transparent"
                    onPress={() => {
                      this.setState({ isDoctorDetail: false });
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/close.png')}
                      style={{
                        height: hp(2),
                        width: hp(2),
                        marginLeft: wp(18),
                        marginTop: hp(3),
                        tintColor: AppColors.whiteColor,
                      }}
                    />
                  </TouchableHighlight>
                </View>
                <View
                  style={{
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: moderateScale(250),
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: AppColors.whiteColor,
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: hp(2.5),
                      lineHeight: hp(3),
                      marginTop: verticalScale(10),
                    }}
                    numberOfLines={3}
                  >
                    {this.state.selectedDocDetails.doctorName} ({this.state.selectedDocDetails.qualification}){' '}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: AppColors.whiteColor,
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: hp(2.5),
                      marginTop: verticalScale(2),
                    }}
                  >
                    {this.state.clinicName}{' '}
                  </Text>
                </View>
                {this.state.selectedDocDetails.doctorDescription ? (
                  <View style={{ width: wp(85), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: AppColors.whiteColor,
                        textAlign: 'center',
                        justifyContent: 'center',
                        marginTop: hp(1.5),
                        fontSize: hp(2),
                        marginLeft: hp(0.5),
                        marginBottom: hp(2),
                      }}
                    >
                      {this.state.selectedDocDetails.doctorDescription}
                    </Text>
                  </View>
                ) : null}
                <View style={{ width: wp(80), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={3}
                    style={{
                      color: AppColors.whiteColor,
                      textAlign: 'center',
                      justifyContent: 'center',
                      marginTop: hp(1.5),
                      fontSize: hp(2),
                      marginLeft: hp(0.5),
                      marginBottom: hp(4),
                    }}
                  >
                    {AppUtils.getAllDepartmentListInString(this.state.selectedDocDetails.departmentList)}{' '}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  _render_row(item) {
    console.log('Dfdsfcbdszdfg', item.item.doctorTimings);
    var slotLength = item.item.doctorTimings.timings.length;
    var startHour = item.item.doctorTimings.timings[0].startHour;
    var startMinute = item.item.doctorTimings.timings[0].startMinute;
    var endHour = item.item.doctorTimings.timings[slotLength - 1].endHour;
    var endMinute = item.item.doctorTimings.timings[slotLength - 1].endMinute;
    var doctStartTime = AppUtils.timeConversion(startHour, startMinute);
    var doctEndTime = AppUtils.timeConversion(endHour, endMinute);
    var doctDetails = item.item;
    var userImage = AppUtils.handleNullImg(doctDetails.profilePic);
    let isLeave = item.item.isLeave;
    let isTimingsActive = item.item.doctorTimings.isActive;
    let DocList = this.state.data;
    let count = 0;
    let isShowMsg = false;
    let adBcheck = false;
    let adB = true;
    let todayDate = moment(new Date()).format('YYYY-MM-DD');
    let selectedDate = moment(this.state.dateToday).format('YYYY-MM-DD');
    if (todayDate != selectedDate) {
      adBcheck = true;
      adB = item.item.advanceBooking;
    }

    if (item.item._id == DocList[DocList.length - 1]._id) {
      for (let i = 0; i < DocList.length; i++) {
        if (DocList[i].isLeave == true || DocList[i].doctorTimings.isActive == false) {
          count = count + 1;
        }
        if (adBcheck) {
          if (!DocList[i].advanceBooking) {
            count = count + 1;
          }
        }
      }
      if (count == DocList.length) {
        isShowMsg = true;
      }
    }
    return (
      <View style={{ marginBottom: hp(1.2), paddingBottom: hp(1), borderBottomWidth: 0.5, borderBottomColor: AppColors.dividerColor }}>
        {!isLeave && isTimingsActive && adB ? (
          <View>
            <TouchableOpacity
              onPress={() => this.selectedDoctor(item.item)}
              style={{
                alignSelf: 'center',
                alignItems: 'center',
                borderBottomColor: AppColors.dividerColor,
              }}
              underlayColor="transparent"
            >
              <View style={styles.doctorList}>
                <View style={{ alignItems: 'center', alignSelf: 'center' }}>
                  <CachedImage style={styles.doctImage} source={{ uri: userImage }} />
                  <View style={{ flexDirection: 'row', height: wp(4) }}>
                    {item.item.videoCall ? (
                      <Image
                        style={{ height: wp(4), width: wp(4) }}
                        resizeMode={'contain'}
                        source={require('../../../assets/images/video_camera_red.png')}
                      />
                    ) : (
                      <View style={{ height: wp(4), width: wp(4) }} />
                    )}
                    {item.item.audioCall ? (
                      <Image
                        style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }}
                        resizeMode={'contain'}
                        source={require('../../../assets/images/tele_red.png')}
                      />
                    ) : (
                      <View style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }} />
                    )}
                    {item.item.inHouseCall ? (
                      <Image
                        style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }}
                        resizeMode={'contain'}
                        source={require('../../../assets/images/house_call_red.png')}
                      />
                    ) : (
                      <View style={{ height: wp(4), width: wp(4), marginLeft: wp(2) }} />
                    )}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    //marginTop: verticalScale(25),
                    width: moderateScale(110),
                    alignItems: 'flex-start',
                    marginLeft: moderateScale(10),
                  }}
                >
                  <Text style={styles.doctorDetails1}>{doctDetails.doctorName}</Text>
                  <Text style={styles.doctorSpec}>{doctDetails.qualification}</Text>
                  <Text numberOfLines={1} style={styles.doctorSpec}>
                    {AppUtils.getAllDepartmentListInString(doctDetails.departmentList)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                  <Text style={styles.doctorAvail}>
                    {doctStartTime}:{doctEndTime}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: wp(26) }} onPress={() => this.setState({ selectedDocDetails: doctDetails, isDoctorDetail: true })}>
              <Text style={[styles.doctorDetails1, { color: 'blue' }]}>{'Show Details'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View />
        )}
        {isShowMsg ? (
          <View
            style={{
              height: verticalScale(100),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyBold,
                color: AppColors.textGray,
              }}
            >
              {strings('doctor.text.noDocAvail')}
            </Text>
          </View>
        ) : (
          <View />
        )}
      </View>
    );
  }

  _render_morningSlot(item) {
    return (
      <ScrollView style={{ width: width, flexDirection: 'column' }}>
        <Text
          style={{
            fontFamily: AppStyles.fontFamilyMedium,
            marginLeft: moderateScale(15),
            fontSize: moderateScale(15),
            color: AppColors.blackColor,
          }}
        >
          {item.item.shift}
        </Text>
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <FlatList
            data={item.item.slots}
            keyExtractor={(time, index) => index.toString()}
            renderItem={(time) => this._render_eveningSlot(item, time)}
            numColumns={4}
            extraData={this.state}
          />
        </View>
      </ScrollView>
    );
  }

  _render_eveningSlot(mainItem, item) {
    var recievedTime = item.item.start;
    var time = moment.parseZone(recievedTime).format('hh:mm A');
    var format = 'hh:mm a';
    var isTimeOver = false;

    AppUtils.getTimeDifferenceFromToday(recievedTime, function (hour, min, sec, days, isOver) {
      isTimeOver = isOver;
    });
    var isValueSelected = false;
    if (item.item.isSelected) {
      isValueSelected = true;
    }
    return (
      <View style={{ margin: moderateScale(5) }}>
        {this.state.isSlotVisible ? (
          <View>
            {!isTimeOver && !item.item.isBooked && !item.item.isLocked ? (
              isValueSelected ? (
                <SlotView slotType={'blocked'} backgroundColor={selectedSlotColor} slotText={time} />
              ) : (
                <SlotView
                  slotType={'available'}
                  backgroundColor={unSelectedSlotColor}
                  slotText={time}
                  onSlotClick={() => {
                    this.selectEveningSlot(mainItem, item, isTimeOver);
                  }}
                />
              )
            ) : (
              <SlotView slotType={'occupied'} slotText={time} />
            )}
          </View>
        ) : (
          <View />
        )}
        <Spinner visible={this.state.isLoading} textContent={''} textStyle={{ color: '#FFF' }} />
      </View>
    );
  }

  selectedDoctor(index) {
    var self = this;
    var arrayData = this.state.data;
    var dataLength = arrayData.length;
    for (var i = 0; i < dataLength; i++) {
      if (index === i) {
        arrayData[i].isValueSelected = true;
      } else {
        arrayData[i].isValueSelected = false;
      }
    }
    AppUtils.console('Selected Doctor Data:', index, this.state.clinicData);
    if (this.state.clinicData.bookingConfiguration.isClinicOnBoarded) {
      this.setState({
        data: arrayData,
        isMenuOpen: !index.isCalender,
        isCalender: index.isCalender,
        docID: index._id,
        qualification: index.qualification,
        departmentId: index.department.length > 0 ? index.department[0]._id : index.departmentList[0]._id,
        speciality: AppUtils.getAllDepartmentListInString(index.departmentList),
        docName: index.doctorName,
        timeout: index.timeout,
        doctorAdbCheck: !index.advanceBooking,
        docImage: index.profilePic,
        videoCall: index.videoCall,
        audioCall: index.audioCall,
        inHouseCall: index.inHouseCall,
        doctorDescription: index.doctorDescription ? index.doctorDescription : '',
      });
      if (index.isCalender) {
        this.getDoctorSessions(index);
      } else {
        this.getDoctorSlots(index);
      }
    } else {
      Alert.alert(
        '',
        strings('doctor.text.clinicBookingNotAvailCall', {
          number: '+' + this.state.clinicData.countryCode + ' ' + this.state.clinicData.phoneNumber,
        }),
        [{ text: strings('doctor.button.ok'), onPress: () => this.getClinicOnBoarded(this.state.clinicData._id) }]
      );
    }
  }

  getClinicOnBoarded(clinicId) {
    try {
      let response = SHApiConnector.storeOnBoardRequest(clinicId);
      AppUtils.console('dxczxdsdzxdsezxd', clinicId, response);
    } catch (e) {
      AppUtils.console('CLINIC_ON_BOARDED_ERROR', e);
    }
  }

  showAlert(msg, ispop) {
    let self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {
        if (!ispop) {
          self.getClinicdetails();
        }
      });
    }, 500);
  }

  getDoctorSlots(item) {
    var self = this;
    var date = this.state.dateToday;
    var clinicId = this.props.clinicID;
    var docId = item._id;
    self.setState({
      isLoading: true,
    });

    var isAdvBookingCheckRequired = item.advanceBooking;
    if (typeof date === 'string') {
      isAdvBookingCheckRequired = true;
    } else if (moment(date).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD')) {
      isAdvBookingCheckRequired = false;
    } else {
      isAdvBookingCheckRequired = true;
    }

    var doctorAvailability = !item.doctorTimings.isActive || item.isLeave ? false : true;
    if (isAdvBookingCheckRequired) {
      doctorAvailability = !item.advanceBooking || !item.doctorTimings.isActive || item.isLeave ? false : true;
    }
    console.log('sfghfgxdfsd', item);
    self.setState({ departmentId: item.department.length > 0 ? item.department[0]._id : item.departmentList[0]._id });
    var clinicDetail = {
      slotsDate: date,
      clinicId: clinicId,
      doctorId: docId,
    };
    AppUtils.console('xvcxdzfxsxdgdf', clinicDetail);
    if (doctorAvailability) {
      SHApiConnector.getDoctorSlots(clinicDetail, function (err, stat) {
        AppUtils.console('zxdaszfszfx', stat);
        self.setState({
          isLoading: false,
        });

        var slotTiming = stat.slotTimings;
        try {
          if (!err && stat) {
            if (stat.error_code) {
              if (stat.error_code == '10002') {
                self.showAlert(strings('string.error_code.error_10002'), true);
              } else if (stat.error_code == '10005') {
                self.showAlert(strings('string.error_code.error_10005'), true);
              } else if (stat.error_code == '10009') {
                self.showAlert(strings('string.error_code.error_10009'), true);
              } else if (stat.error_code == '10010') {
                self.showAlert(strings('string.error_code.error_10010'), true);
              } else if (stat.error_code == '10011') {
                self.showAlert(strings('string.error_code.error_10011'), true);
              } else if (stat.error_code == '10012') {
                self.showAlert(strings('string.error_code.error_10012'), true);
              } else if (stat.error_code == '10016') {
                self.showAlert(strings('string.error_code.error_10016'), true);
              } else if (stat.error_code == '10019') {
                self.showAlert(strings('doctor.alertMsg.noSlots'), true);
              }
            } else if (stat.slotTimings != undefined && (stat.clinicWorkingDay == undefined || stat.doctorWorkingDay == undefined)) {
              AppUtils.console('zxdaszfszfx1', stat);

              self.setState({
                isSlotVisible: true,
                doctorAvailable: true,
                slotData: stat,
                morningTimeSlot: slotTiming,
                docName: item.doctorName,
                docImage: item.profilePic,
              });
              self.saveSessionSlots(slotTiming);
            } else if (stat.slotTimings == undefined && stat.clinicWorkingDay != undefined && stat.doctorNextAvailableDate == undefined) {
              AppUtils.console('zxdaszfszfx2', stat);
              if (
                stat.clinicWorkingDay == 'DOCTOR_CONTINUESLY_CLOSED' ||
                stat.clinicWorkingDay == 'DOCTOR_ADVANCE_BOOKING_EXCEDED' ||
                stat.clinicWorkingDay == 'CLINIC_ADVANCE_BOOKING_EXCEDED' ||
                stat.clinicWorkingDay == 'CLINIC_CONTINUESLY_CLOSED'
              ) {
                self.setState({
                  isSlotVisible: true,
                  isAlertOpen: true,
                  isNextWorkingDayAvaialble: false,
                  clinicNextWorkingDay: stat.clinicWorkingDay,
                  docName: item.doctorName,
                  docImage: item.profilePic,
                });
              } else {
                self.setState({
                  isSlotVisible: true,
                  isAlertOpen: true,
                  isNextWorkingDayAvaialble: true,
                  clinicNextWorkingDay: stat.clinicWorkingDay,
                  docName: item.doctorName,
                  docImage: item.profilePic,
                });
              }
            } else if (stat.slotTimings == undefined && stat.doctorNextAvailableDate != undefined && stat.clinicWorkingDay == undefined) {
              AppUtils.console('zxdaszfszfx3', stat);

              self.setState({
                isSlotVisible: true,
                isAlertOpen: true,
                isMenuOpen: true,
                isNextWorkingDayAvaialble: true,
                doctorNextAvailableDay: stat.doctorNextAvailableDate,
                docName: item.doctorName,
                docImage: item.profilePic,
              });
            } else if (
              (stat.clinicWorkingDay == 'DOCTOR_CONTINUESLY_CLOSED' ||
                stat.clinicWorkingDay == 'DOCTOR_ADVANCE_BOOKING_EXCEDED' ||
                stat.clinicWorkingDay == 'CLINIC_ADVANCE_BOOKING_EXCEDED' ||
                stat.clinicWorkingDay == 'CLINIC_CONTINUESLY_CLOSED') &&
              stat.slotTimings == undefined
            ) {
              AppUtils.console('zxdaszfszfx4', stat);

              self.setState({
                isSlotVisible: true,
                doctorAvailable: false,
                isNextWorkingDayAvaialble: false,
                doctorNextAvailableDay: stat.status,
                docName: item.doctorName,
                docImage: item.profilePic,
                clinicIsClosed: true,
                doctorLeave: true,
              });
            }
          }
        } catch (err) {
          console.error('error_fetching_doc_slot:', err);
        }
      });
    } else {
      SHApiConnector.getDoctorNextWorkingDay(clinicDetail, function (err, stat) {
        self.setState({
          isLoading: false,
        });
        try {
          if (!err && stat) {
            if (stat.error_code) {
              if (stat.error_code == '10002') {
                self.showAlert(strings('string.error_code.error_10002'));
              } else if (stat.error_code == '10005') {
                self.showAlert(strings('string.error_code.error_10005'));
              } else if (stat.error_code == '10009') {
                self.showAlert(strings('string.error_code.error_10009'));
              } else if (stat.error_code == '10010') {
                self.showAlert(strings('string.error_code.error_10010'), true);
              } else if (stat.error_code == '10011') {
                self.showAlert(strings('string.error_code.error_10011'));
              } else if (stat.error_code == '10012') {
                self.showAlert(strings('string.error_code.error_10012'));
              } else if (stat.error_code == '10019') {
                self.showAlert(strings('doctor.alertMsg.noSlots'));
              }
            } else if (stat.clinicNextAvailableDay == undefined && stat.slotTimings != undefined) {
              self.setState({
                slotData: stat,
                morningTimeSlot: slotTiming,
                docName: item.doctorName,
                docImage: item.profilePic,
                speciality: item.department[0].departmentName,
              });
            } else if (stat.slotTimings == undefined && stat.status.doctorNextAvailableDate != undefined) {
              self.setState({
                isMenuOpen: true,
                doctorAvailable: false,
                doctorNextAvailableDay: stat.status.doctorNextAvailableDate,
              });
            } else if (stat.status == 'DOCTOR_ADVANCE_BOOKING_EXCEDED') {
              self.setState({
                isMenuOpen: true,
                doctorAvailable: false,
                doctorLeave: true,
              });
            }
          }
        } catch (err) {
          console.error('error_fetching_doc_slot:', err);
        }
      });
    }
  }

  getDoctorSessions(item) {
    var self = this;
    var date = moment(this.state.dateToday).format();
    var clinicId = this.props.clinicID;
    var docId = item._id;
    self.setState({
      isLoading: true,
    });

    var isAdvBookingCheckRequired = item.advanceBooking;
    if (moment(date).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) {
      isAdvBookingCheckRequired = false;
    } else {
      isAdvBookingCheckRequired = true;
    }

    var doctorAvailability = item.doctorTimings.isActive == false || item.isLeave == true ? false : true;
    if (isAdvBookingCheckRequired) {
      doctorAvailability = !item.advanceBooking || !item.doctorTimings.isActive || item.isLeave ? false : true;
    }
    self.setState({ departmentId: item.department.length > 0 ? item.department[0]._id : item.departmentList[0]._id });
    var clinicDetail = {
      date: date,
      clinicId: clinicId,
      doctorId: docId,
    };

    if (doctorAvailability) {
      SHApiConnector.toGetDoctorSessionCalendar(clinicDetail, function (err, stat) {
        self.setState({ isLoading: false });

        try {
          AppUtils.console('getDoctor', stat);
          if (!err && stat) {
            if (stat.error_code) {
              if (stat.error_code == '10002') {
                self.showAlert(strings('string.error_code.error_10002'), true);
              } else if (stat.error_code == '10005') {
                self.showAlert(strings('string.error_code.error_10005'), true);
              } else if (stat.error_code == '10009') {
                self.showAlert(strings('string.error_code.error_10009'), true);
              } else if (stat.error_code == '10010') {
                self.showAlert(strings('string.error_code.error_10010'), true);
              } else if (stat.error_code == '10011') {
                self.showAlert(strings('string.error_code.error_10011'), true);
              } else if (stat.error_code == '10012') {
                self.showAlert(strings('string.error_code.error_10012'), true);
              } else if (stat.error_code == '10016') {
                self.showAlert(strings('string.error_code.error_10016'), true);
              } else if (stat.error_code == '10019') {
                self.showAlert(strings('doctor.alertMsg.noSlots'), true);
              }
            } else if (
              stat.doctorDetails.length == 0 &&
              stat.clinicDetails.clinicTimings[0].isActive == false &&
              stat.clinicNextWorkingDay != undefined &&
              stat.clinicClosed == false
            ) {
              self.setState({
                isNextWorkingDayAvaialble: true,
                isDoctorHoliday: false,
                isClinicHoliday: true,
                clinicIsClosed: true,
                doctorLeave: true,
                clinicNextWorkingDay: stat.clinicNextWorkingDay,
                isAlertOpen: true,
                doctorStatus: false,
                doctorAvailable: true,
              });
            } else if (
              stat.doctorDetails.length == 0 &&
              stat.clinicDetails.clinicTimings[0].isActive == true &&
              stat.clinicNextWorkingDay != undefined &&
              stat.clinicClosed == false
            ) {
              self.checkTheDoctorTimingsAndDate(stat.doctorDetails[0]);

              self.getDoctorNextWorkingDay(date, clinicId, docId);
            } else if (stat.doctorDetails.length == 0 && stat.clinicNextWorkingDay != undefined && stat.clinicClosed == true) {
              self.setState({
                isNextWorkingDayAvaialble: true,
                isDoctorHoliday: false,
                isClinicHoliday: true,
                clinicIsClosed: true,
                doctorLeave: true,
                clinicNextWorkingDay: stat.clinicNextWorkingDay,
                isAlertOpen: true,
                doctorStatus: false,
                doctorAvailable: true,
              });
            } else if (
              stat.doctorDetails.length != 0 &&
              stat.clinicNextWorkingDay != undefined &&
              stat.clinicDetails.clinicTimings[0].isActive == true &&
              stat.doctorDetails[0].doctorTimings.isActive == false &&
              stat.clinicClosed == false
            ) {
              self.checkTheDoctorTimingsAndDate(stat.doctorDetails[0]);
              self.getDoctorNextWorkingDay(date, clinicId, docId);
            } else if (
              stat.doctorDetails.length != 0 &&
              stat.doctorDetails[0].doctorTimings.isActive == true &&
              stat.clinicDetails.clinicTimings[0].isActive == true &&
              stat.clinicNextWorkingDay != undefined &&
              stat.clinicClosed == false
            ) {
              self.setState({
                doctorLeave: false,
                doctorAvailable: true,
                clinicIsClosed: false,
                isAlertOpen: false,
                isNextWorkingDayAvaialble: true,
                doctorTimings: stat.doctorDetails[0],
                docImage: stat.doctorDetails[0].profilePic,
              });
              self.checkTheDoctorTimingsAndDate(stat.doctorDetails[0]);
            } else if (stat.doctorDetails.length != 0 && stat.clinicNextWorkingDay != undefined && stat.clinicClosed == true) {
              self.setState({
                doctorTimings: stat.doctorDetails.doctorTimings,
                isClinicHoliday: true,
                clinicIsClosed: true,
                clinicNextWorkingDay: stat.clinicNextWorkingDay,
                isAlertOpen: true,
                isNextWorkingDayAvaialble: true,
                docImage: stat.doctorDetails[0].profilePic,
              });
              self.checkTheDoctorTimingsAndDate(stat.doctorDetails[0]);
            }
          }
        } catch (err) {
          console.error('error_fetching_doc_slot:', err);
        }
      });
    } else {
      var clinicDetail = {
        slotsDate: date,
        clinicId: clinicId,
        doctorId: docId,
      };

      SHApiConnector.getDoctorNextWorkingDay(clinicDetail, function (err, stat) {
        self.setState({
          isLoading: false,
        });
        try {
          if (!err && stat) {
            if (stat.error_code) {
              if (stat.error_code == '10002') {
                self.showAlert(strings('string.error_code.error_10002'));
              } else if (stat.error_code == '10005') {
                self.showAlert(strings('string.error_code.error_10005'));
              } else if (stat.error_code == '10009') {
                self.showAlert(strings('string.error_code.error_10009'));
              } else if (stat.error_code == '10010') {
                self.showAlert(strings('string.error_code.error_10010'), true);
              } else if (stat.error_code == '10011') {
                self.showAlert(strings('string.error_code.error_10011'));
              } else if (stat.error_code == '10012') {
                self.showAlert(strings('string.error_code.error_10012'));
              } else if (stat.error_code == '10019') {
                self.showAlert(strings('doctor.alertMsg.noSlots'));
              }
            } else if (stat.status != undefined) {
              if (stat.status == 'DOCTOR_ADVANCE_BOOKING_EXCEDED' || stat.status == 'CLINIC_ADVANCE_BOOKING_EXCEDED') {
                self.setState({
                  doctorAdbCheck: true,
                });
                let doctorData = self.state.data;
                let docTimings = [];
                for (let i = 0; i < doctorData.length; i++) {
                  if (doctorData[i]._id == docId) {
                    docTimings = doctorData[i];
                  }
                }
                self.checkTheDoctorTimingsAndDate(docTimings);
              }
              if (moment(self.state.dateToday).format('YYYY-MM-DD') == stat.status.doctorNextAvailableDate) {
                self.setState({
                  doctorAdbCheck: true,
                });
              }
              self.setState({
                doctorNextAvailableDay: stat.status.doctorNextAvailableDate,
              });
            }
          }
        } catch (err) {
          console.error('error_fetching_doc_slot:', err);
        }
      });
    }
  }

  getDoctorNextWorkingDay(date, clinicId, docId) {
    let self = this;

    var clinicDetail = {
      slotsDate: date,
      clinicId: clinicId,
      doctorId: docId,
    };

    SHApiConnector.getDoctorNextWorkingDay(clinicDetail, function (err, stat) {
      self.setState({
        isLoading: false,
      });
      try {
        if (!err && stat) {
          if (stat.error_code) {
            if (stat.error_code == '10002') {
              self.showAlert(strings('string.error_code.error_10002'));
            } else if (stat.error_code == '10005') {
              self.showAlert(strings('string.error_code.error_10005'));
            } else if (stat.error_code == '10009') {
              self.showAlert(strings('string.error_code.error_10009'));
            } else if (stat.error_code == '10010') {
              self.showAlert(strings('string.error_code.error_10010'), true);
            } else if (stat.error_code == '10011') {
              self.showAlert(strings('string.error_code.error_10011'));
            } else if (stat.error_code == '10012') {
              self.showAlert(strings('string.error_code.error_10012'));
            } else if (stat.error_code == '10019') {
              self.showAlert(strings('doctor.alertMsg.noSlots'));
            }
          } else if (stat.status != undefined) {
            self.setState({
              doctorAvailable: false,
              doctorNextAvailableDay: stat.status.doctorNextAvailableDate,
              isDoctorHoliday: true,
              doctorLeave: true, //false
              clinicIsClosed: false,
            });
          }
        }
      } catch (err) {
        console.error('error_fetching_doc_slot:', err);
      }
    });
  }

  getDoctorSlotsFromDate(item, indate) {
    var self = this;
    var date = moment(self.state.dateToday).format('YYYY-MM-DD');
    var clinicId = this.props.clinicID;
    var docId = item.id;
    var isCalender = item.isCalender;
    if (indate != undefined && indate != null) {
      date = indate;
    }

    var clinicDetail = {
      slotsDate: date,
      clinicId: clinicId,
      doctorId: docId,
    };

    var self = this;
    self.setState({ isLoading: true, docName: item.name });

    SHApiConnector.getDoctorSlots(clinicDetail, function (err, stat) {
      self.setState({ isLoading: false });
      var slotTiming = stat.slotTimings;
      try {
        if (!err && stat) {
          if (stat.error_code) {
            if (stat.error_code == '10002') {
              self.showAlert(strings('string.error_code.error_10002'), true);
            } else if (stat.error_code == '10005') {
              self.showAlert(strings('string.error_code.error_10005'), true);
            } else if (stat.error_code == '10009') {
              self.showAlert(strings('string.error_code.error_10009'), true);
            } else if (stat.error_code == '10010') {
              self.showAlert(strings('string.error_code.error_10010'), true);
            } else if (stat.error_code == '10011') {
              self.showAlert(strings('string.error_code.error_10011'), true);
            } else if (stat.error_code == '10012') {
              self.showAlert(strings('string.error_code.error_10012'), true);
            } else if (stat.error_code == '10016') {
              self.showAlert(strings('string.error_code.error_10016'), true);
            } else if (stat.error_code == '10019') {
              self.showAlert(strings('doctor.alertMsg.noSlots'), true);
            }
          } else if (stat.slotTimings != undefined && (stat.clinicWorkingDay == undefined || stat.doctorWorkingDay == undefined)) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            self.setState({
              doctorAvailable: true,
              slotData: stat,
              morningTimeSlot: slotTiming,
              docName: item.name,
              docImage: item.profilePic,
            });
            self.saveSessionSlots(slotTiming);
          } else if (stat.slotTimings == undefined && stat.clinicWorkingDay == 'DOCTOR_ADVANCE_BOOKING_EXCEDED') {
            self.setState({
              isMenuOpen: true,
              doctorAvailable: false,
              doctorLeave: true,
            });
          } else if (stat.slotTimings == undefined && stat.clinicWorkingDay != undefined) {
            self.setState({
              isAlertOpen: true,
              clinicNextWorkingDay: stat.clinicWorkingDay,
              docName: item.name,
              docImage: item.profilePic,
              isNextWorkingDayAvaialble: true,
            });
          } else if (stat.slotTimings == undefined && stat.doctorWorkingDay != undefined) {
            self.setState({
              isMenuOpen: false,
              doctorAvailable: false,
              doctorNextAvailableDay: stat.clinicWorkingDay,
              docName: item.name,
              docImage: item.profilePic,
            });
          }
        }
      } catch (err) {
        console.error('error in render slots:', err);
      }
    });
  }

  saveSessionSlots(slotTiming) {
    var sessionBookings = {};
    for (let sessionObj of slotTiming) {
      if (sessionObj.slots != undefined && sessionObj.slots.length > 0) {
        var startDate = sessionObj.slots[0].start;
        var subtracted = moment(startDate).subtract(60, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
        subtracted = moment(subtracted).format('YYYY-MM-DDTHH:mm:ss');
        sessionBookings[sessionObj.shift] = subtracted;
      }
    }
    this.setState({ sessionBookings: sessionBookings });
  }

  selectEveningSlot(mainItem, item, isTimeOver) {
    var arrayData = this.state.morningTimeSlot;
    var getData = arrayData[mainItem.index];
    var dataLength = arrayData.length;

    for (var i = 0; i < dataLength; i++) {
      var getSubData = arrayData[i].slots.length;
      for (var j = 0; j < getSubData; j++) {
        if (mainItem.index == i && item.index == j) {
          arrayData[i].slots[j].isSelected = true;
          let slotDate = moment(arrayData[i].slots[j].start);
          let currentTime = moment();
          var diff = slotDate.diff(currentTime);
          var timeDifferenceinMinutes = diff / 1000 / 60;

          if (timeDifferenceinMinutes < 60) {
            this.showAlert(strings('doctor.alertMsg.noSlotSelctionNextSixtyMin'));
            arrayData[i].slots[j].isSelected = false;
          } else {
            if (!this.state.clinicAdvanceBooking) {
              let currentSessionName = arrayData[i].shift;
              var bookingMaxSessionTime = this.state.sessionBookings[currentSessionName];
              bookingMaxSessionTime = moment(bookingMaxSessionTime);

              let difference = moment.duration(currentTime.diff(bookingMaxSessionTime));
              if (currentTime > bookingMaxSessionTime) {
                this.setState({
                  selectedSlot: arrayData[i].slots[j],
                  shiftID: mainItem.item._id,
                  shiftSelected: i,
                  slotSelected: j,
                  queueNumber: arrayData[i].slots[j].queueNumber,
                  sequence: arrayData[i].slots[j].sequence,
                });
              } else {
                this.showAlert(strings('doctor.alertMsg.bookAppointBeforeOneHour'));
                arrayData[i].slots[j].isSelected = false;
              }
            } else {
              this.setState({
                selectedSlot: arrayData[i].slots[j],
                shiftID: mainItem.item._id,
                shiftSelected: i,
                slotSelected: j,
                queueNumber: arrayData[i].slots[j].queueNumber,
                sequence: arrayData[i].slots[j].sequence,
              });
            }
          }
        } else {
          arrayData[i].slots[j].isSelected = false;
        }
      }
    }
    this.setState({
      morningTimeSlot: arrayData,
    });
  }

  setTheDoctorTimingsMins(item) {
    let self = this;
    let startMin = item.mins;
    let endMin = parseInt(item.endMins);
    let minFormat = 0;
    let minutesList = [];
    if (startMin !== 30) {
      startMin = 0;
    }
    if (endMin === 0) {
      endMin = 60;
    }

    for (let i = item.mins; i < endMin; i++) {
      if (i < 10 && i !== '00') {
        minFormat = '0' + i;
      } else {
        minFormat = i;
      }

      minutesList.push({ mins: minFormat, value: minFormat });
    }
    self.setState({
      listToShowMinsFT: minutesList,
    });
  }

  setTheHoursInClk(item) {
    AppUtils.console('dxfcvbnfdfcgb', item);
    let self = this;
    let month = moment(self.state.dateToday).format('MM');
    let day = moment(self.state.dateToday).format('DD');
    let year = moment(self.state.dateToday).format('YYYY');
    let timeHoursFormat = item.hourFormat;
    let timeMinutesFormat = parseInt(item.mins);
    if (timeHoursFormat < 10) {
      timeHoursFormat = '0' + timeHoursFormat;
    }

    if (timeMinutesFormat < 10) {
      timeMinutesFormat = '0' + timeMinutesFormat;
    }

    //let setTheTime = year + '-' + month + '-' + day + 'T' + timeHoursFormat + ':' + timeMinutesFormat + ':00'
    let setTheTime = this.setTheTime(year, month, day, timeHoursFormat, timeMinutesFormat);

    self.setState({
      ishoursModal: false,
      hours: item.hours,
      mins: item.mins,
      ext: item.ext,
      start: setTheTime,
      shiftID: item.sessionId,
      shiftSelected: item.sessionIndex,
    });

    self.setTheDoctorTimingsMins(item);
  }

  setTheMinsInClk(item) {
    let self = this;
    let month = moment(self.state.dateToday).format('MM');
    let day = moment(self.state.dateToday).format('DD');
    let year = moment(self.state.dateToday).format('YYYY');
    let hours = parseInt(self.state.hours);

    let mins = parseInt(item.mins);

    AppUtils.console('dxcszsfxddfes123', hours, mins);

    if (hours > 12) {
      if (self.state.ext == 'PM') {
        hours = hours - 12;
      }
    } else if (hours == 12) {
      if (self.state.ext == 'PM') {
        hours = 12;
      }
    } else {
      if (self.state.ext == 'PM') {
        hours = hours + 12;
      }
    }

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (mins < 10) {
      mins = '0' + mins;
    }

    //let setTheTime = year + '-' + month + '-' + day + 'T' + hours + ':' + mins + ':00'
    let setTheTime = this.setTheTime(year, month, day, hours, mins);

    self.setState({
      isminsModal: false,
      mins: mins,
      start: setTheTime,
    });
  }

  setMinsBeforeSetting() {
    var self = this;
    if (self.state.listToShowHoursFT.length > 0) {
      self.setState({
        isminsModal: true,
      });
    }
  }

  arrangeItemsMins(item) {
    return (
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => this.setTheMinsInClk(item.item)}>
          <View
            style={{
              width: moderateScale(100),
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: AppColors.whiteColor,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: moderateScale(15),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.black,
                marginBottom: moderateScale(5),
                marginTop: moderateScale(5),
                textAlign: 'center',
              }}
            >
              {item.item.mins}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  arrangeItems(item) {
    return (
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => this.setTheHoursInClk(item.item)}>
          <View
            style={{
              width: moderateScale(180),
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: AppColors.cardBgColor,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: moderateScale(15),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.black,
                marginBottom: moderateScale(5),
                marginTop: moderateScale(5),
                textAlign: 'center',
              }}
            >
              {item.item.hours} {item.item.ext}{' '}
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontFamily: AppStyles.fontFamilyMedium,
                  color: AppColors.textGray,
                }}
              >
                {strings('doctor.text.session', { index: item.item.sessionIndex + 1 })}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  onBackPress1() {
    this.setState({
      ishoursModal: false,
      isminsModal: false,
      isClinicDetail: false,
    });
  }
  clinicDetailList() {
    return (
      <Modal
        visible={this.state.isClinicDetail}
        transparent={true}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: AppColors.transparent,
          height: AppUtils.screenHeight,
          width: AppUtils.screenWidth,
        }}
        animationType={'fade'}
        onRequestClose={() => this.onBackPress1()}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
          activeOpacity={1}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: AppColors.transparent,
              height: AppUtils.screenHeight,
              width: AppUtils.screenWidth,
            }}
          >
            <ClinicHeader
              clinicName={this.state.clinicData.clinicName}
              clinicDetails={this.state.clinicData}
              isClinicDetail={this.state.isClinicDetail}
              clinicLogo={this.state.clinicData.clinicLogo}
              clinicStartHour={this.state.clinicStartHour}
              clinicStartMinute={this.state.clinicStartMinute}
              clinicEndHour={this.state.clinicEndHour}
              clinicEndMinute={this.state.clinicEndMinute}
              clinicStatus={this.state.clinicStatus}
              clinicAddress={this.state.locality}
              closeModal={(close) =>
                this.setState({
                  isClinicDetail: false,
                })
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  modalSettingList() {
    return (
      <Modal
        visible={this.state.ishoursModal}
        transparent={true}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: AppColors.transparent,
          height: AppUtils.screenHeight,
          width: AppUtils.screenWidth,
        }}
        animationType={'fade'}
        onRequestClose={() => this.onBackPress1()}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
          activeOpacity={1}
          onPressOut={() => {
            this.onBackPress1();
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: AppColors.transparent,
              height: AppUtils.screenHeight,
              width: AppUtils.screenWidth,
            }}
          >
            <View
              style={{
                flexDirection: 'column',
                height: verticalScale(300),
                width: moderateScale(180),
                borderRadius: 5,
                backgroundColor: AppColors.cardBgColor,
                paddingTop: moderateScale(20),
                paddingBottom: moderateScale(20),
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                elevation: 1,
              }}
            >
              <FlatList
                data={this.state.listToShowHoursFT}
                style={{ backgroundColor: AppColors.cardBgColor }}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this.arrangeItems(item)}
                extraData={this.state}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  modalSettingMinsList() {
    return (
      <Modal
        visible={this.state.isminsModal}
        transparent={true}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: AppColors.transparent,
          height: AppUtils.screenHeight,
          width: AppUtils.screenWidth,
        }}
        animationType={'fade'}
        onRequestClose={() => this.onBackPress1()}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
          activeOpacity={1}
          onPressOut={() => {
            this.onBackPress1();
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: AppColors.transparent,
              height: AppUtils.screenHeight,
              width: AppUtils.screenWidth,
            }}
          >
            <View
              style={{
                flexDirection: 'column',
                height: verticalScale(300),
                borderRadius: 5,
                paddingTop: moderateScale(10),
                paddingBottom: moderateScale(10),
                backgroundColor: AppColors.whiteColor,
                elevation: 1,
              }}
            >
              <FlatList
                data={this.state.listToShowMinsFT}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this.arrangeItemsMins(item)}
                extraData={this.state}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  checkTheDoctorTimingsAndDate(index) {
    let self = this;
    let doctorTimings = index.doctorTimings.timings;
    let month = moment(self.state.dateToday).format('MM');
    let day = moment(self.state.dateToday).format('DD');
    let year = moment(self.state.dateToday).format('YYYY');
    var dateToBookApps = moment(new Date()).format('YYYY-MM-DDTHH:mm:00');

    if (day < moment(dateToBookApps).format('DD')) {
      dateToBookApps = new Date();
    }

    if (moment(self.state.dateToday).format('DD-MM-YYYY') === moment(dateToBookApps).format('DD-MM-YYYY')) {
      let todayHour = moment(dateToBookApps).format('HH');
      let ext = 'AM';
      let todayMin = moment(dateToBookApps).format('mm');
      let timeHoursFormat, timeMinutesFormat;

      for (let i = 0; i < doctorTimings.length; i++) {
        if (todayHour == doctorTimings[i].startHour) {
          if (todayMin > doctorTimings[i].startMinute) {
            todayMin = todayMin < 10 ? '0' + todayMin : todayMin;
          } else {
            todayMin = doctorTimings[i].startMinute < 10 ? '0' + doctorTimings[i].startMinute : doctorTimings[i].startMinute;
          }

          if (todayHour > 12) {
            todayHour = todayHour - 12;
            ext = 'PM';
            if (todayHour < 10) {
              todayHour = '0' + todayHour;
            }
          }
          timeHoursFormat = doctorTimings[i].startHour;

          if (timeHoursFormat < 10) {
            timeHoursFormat = '0' + timeHoursFormat;
          }

          //let setTheTime = year + '-' + month + '-' + day + 'T' + timeHoursFormat + ':' + todayMin + ':00'
          let setTheTime = this.setTheTime(year, month, day, timeHoursFormat, todayMin);

          self.setState({
            hours: todayHour,
            mins: todayMin,
            ext: ext,
            start: setTheTime,
            shiftID: doctorTimings[i]._id,
            shiftSelected: i,
          });
          self.setTheTimingsAndDateForToday(doctorTimings, todayHour, todayMin, ext, doctorTimings[i]._id, i);
          break;
        } else if (todayHour == doctorTimings[i].endHour) {
          if (i != doctorTimings.length - 1) {
            let timeHoursFormat = doctorTimings[i + 1].startHour;
            if (timeHoursFormat < 10) {
              timeHoursFormat = '0' + timeHoursFormat;
            }

            if (i + 1 !== doctorTimings.length) {
              todayHour = doctorTimings[i + 1].startHour;
              if (todayHour > 12) {
                todayHour = todayHour - 12;
                ext = 'PM';
                if (todayHour < 10) {
                  todayHour = '0' + todayHour;
                }
              }
              todayMin = doctorTimings[i + 1].startMinute < 10 ? '0' + doctorTimings[i + 1].startMinute : doctorTimings[i + 1].startMinute;

              //let setTheTime = year + '-' + month + '-' + day + 'T' + timeHoursFormat + ':' + todayMin + ':00'
              let setTheTime = this.setTheTime(year, month, day, timeHoursFormat, todayMin);

              self.setState({
                hours: todayHour,
                mins: todayMin,
                ext: ext,
                start: setTheTime,
                shiftID: doctorTimings[i + 1]._id,
                shiftSelected: i + 1,
              });
              self.setTheTimingsAndDateForToday(doctorTimings, todayHour, todayMin, ext, doctorTimings[i + 1]._id, i + 1);
            } else {
              todayHour = doctorTimings[i].endHour;
              todayMin = doctorTimings[i].endMinute;
              timeHoursFormat = doctorTimings[i].endHour;
              if (todayMin < 10) {
                todayMin = parseInt(todayMin);
                todayMin = '0' + todayMin;
              }
              if (timeHoursFormat < 10) {
                timeHoursFormat = parseInt(timeHoursFormat);
                timeHoursFormat = '0' + timeHoursFormat;
              }

              if (todayHour > 12) {
                todayHour = todayHsour - 12;
              }
              if (todayHour < 10) {
                todayHour = parseInt(todayHour);
                todayHour = '0' + todayHour;
              }
              //let setTheTime = year + '-' + month + '-' + day + 'T' + timeHoursFormat + ':' + todayMin + ':00'
              let setTheTime = this.setTheTime(year, month, day, timeHoursFormat, todayMin);

              self.setState({
                hours: todayHour,
                mins: todayMin,
                ext: ext,
                start: setTheTime,
                shiftID: doctorTimings[i]._id,
                shiftSelected: i,
              });

              self.setState({
                isDoctorSessionExist: false,
              });
            }
          } else {
            self.setState({
              isDoctorSessionExist: false,
            });
          }
          break;
        } else if (todayHour > doctorTimings[i].startHour && todayHour < doctorTimings[i].endHour) {
          let todayHourFormat = todayHour;
          if (todayHourFormat < 10) {
            todayHourFormat = '0' + todayHourFormat;
          }
          if (todayHour > 12) {
            todayHour = todayHour - 12;
            ext = 'PM';
            if (todayHour < 10) {
              todayHour = '0' + todayHour;
            }
          }
          todayMin = doctorTimings[i].startMinute < 10 ? '0' + doctorTimings[i].startMinute : doctorTimings[i].startMinute;

          //let setTheTime = year + '-' + month + '-' + day + 'T' + todayHourFormat + ':' + todayMin + ':00'
          let setTheTime = this.setTheTime(year, month, day, todayHourFormat, todayMin);

          self.setState({
            hours: todayHour,
            mins: todayMin,
            ext: ext,
            start: setTheTime,
            shiftID: doctorTimings[i]._id,
            shiftSelected: i,
          });
          self.setTheTimingsAndDateForToday(doctorTimings, todayHour, todayMin, ext, doctorTimings[i]._id, i);
          break;
        } else if (todayHour > doctorTimings[i].endHour) {
          if (i + 1 != doctorTimings.length) {
            if (todayHour < doctorTimings[i + 1].startHour) {
              let todayHourFormat = doctorTimings[i + 1].startHour;
              if (todayHourFormat < 10) {
                todayHourFormat = '0' + todayHourFormat;
              }
              todayHour = doctorTimings[i + 1].startHour;
              if (todayHour > 12) {
                todayHour = todayHour - 12;
                ext = 'PM';
                if (todayHour < 10) {
                  todayHour = '0' + todayHour;
                }
              }
              todayMin = doctorTimings[i + 1].startMinute < 10 ? '0' + doctorTimings[i + 1].startMinute : doctorTimings[i + 1].startMinute;

              //let setTheTime = year + '-' + month + '-' + day + 'T' + todayHourFormat + ':' + todayMin + ':00'
              let setTheTime = this.setTheTime(year, month, day, todayHourFormat, todayMin);

              self.setState({
                hours: todayHour,
                mins: todayMin,
                ext: ext,
                start: setTheTime,
                shiftID: doctorTimings[i + 1]._id,
                shiftSelected: i + 1,
              });
              self.setTheTimingsAndDateForToday(doctorTimings, todayHour, todayMin, ext, doctorTimings[i + 1]._id, i + 1);
              break;
            }
          } else {
            let setHour = todayHour;
            let extToSet = 'AM';
            if (setHour > 12) {
              setHour = setHour - 12;
              extToSet = 'PM';
            }
            if (setHour < 10) {
              setHour = parseInt(setHour);
              setHour = '0' + setHour;
            }

            self.setState({
              hours: setHour,
              ext: extToSet,
            });

            self.setState({
              isDoctorSessionExist: false,
            });
            break;
          }
        } else {
          self.prepareTheListToShowTimings(doctorTimings);
          break;
        }
      }
    } else {
      self.prepareTheListToShowTimings(doctorTimings);
    }
  }

  setTheTimingsAndDateForToday(doctorTimings, hr, min, extExt, sesId, sesIndex) {
    let self = this;
    let count = 0;
    let list = [];
    let value = 0;
    let hours, mins, ext, endMins;
    let minutesList = [];
    let month = moment(self.state.dateToday).format('MM');
    let day = moment(self.state.dateToday).format('DD');
    let year = moment(self.state.dateToday).format('YYYY');
    var dateToBookApps = moment(new Date()).format('YYYY-MM-DDTHH:mm:00');
    let currentHour = moment(dateToBookApps).format('HH');
    let currentMin = parseInt(moment(dateToBookApps).format('mm'));

    let previous = doctorTimings[sesIndex].endHour;

    for (let i = sesIndex; i < doctorTimings.length; i++) {
      count = doctorTimings[i].endHour - doctorTimings[i].startHour;
      value = doctorTimings[i].startHour;
      previous = doctorTimings[i].endHour;
      if (doctorTimings[i].endMinute > 0) {
        previous = doctorTimings[i].endHour + 1;
      }

      for (let j = 0; j < count + 1; j++) {
        hours = value;
        endMins = doctorTimings[i].endMinute;
        mins = doctorTimings[i].startMinute;
        if (doctorTimings[i].startHour == hours && doctorTimings[i].endHour > hours) {
          mins = doctorTimings[i].startMinute;
          endMins = 0;
        } else if (doctorTimings[i].startHour < hours && doctorTimings[i].endHour > hours) {
          mins = 0;
          endMins = 0;
        } else if (doctorTimings[i].startHour < hours && doctorTimings[i].endHour == hours) {
          mins = 0;
          endMins = doctorTimings[i].endMinute;
        } else if (doctorTimings[i].startHour == hours && doctorTimings[i].endHour == hours) {
          mins = doctorTimings[i].startMinute;
          endMins = doctorTimings[i].endMinute;
        }

        if (hours > 12) {
          hours = hours - 12;
          ext = 'PM';
        } else {
          if (hours == 12) {
            ext = 'PM';
          } else {
            ext = 'AM';
          }
        }
        if (hours < 10) {
          hours = '0' + hours;
        }
        if (mins < 10) {
          mins = '0' + mins;
        }

        if (previous !== value && value >= currentHour) {
          let indexVal = i + 1;
          let val = hours + ' ' + ext + ' Sess ' + indexVal;
          list.push({
            hourFormat: value,
            hours: hours,
            value: val,
            mins: mins,
            ext: ext,
            endMins: endMins,
            sessionIndex: i,
            sessionId: doctorTimings[i]._id,
          });
        }
        value = value + 1;
      }
    }

    let minFormat = 0;
    let selectedStMin = parseInt(doctorTimings[sesIndex].startMinute);
    if (currentMin > selectedStMin) {
      selectedStMin = currentMin;
    }

    let selectedEndMin = 60;

    for (let i = selectedStMin; i < selectedEndMin; i++) {
      minFormat = i;
      if (minFormat < 10) {
        minFormat = '0' + minFormat;
      }
      minutesList.push({ mins: minFormat, value: minFormat });
    }
    let timeHoursFormat = doctorTimings[sesIndex].startHour;
    let timeMinutesFormat = doctorTimings[sesIndex].startMinute;
    if (timeHoursFormat <= currentHour) {
      timeHoursFormat = parseInt(currentHour);
      timeMinutesFormat = parseInt(currentMin);
    }
    if (timeHoursFormat < 10) {
      timeHoursFormat = '0' + timeHoursFormat;
    }
    if (timeMinutesFormat < 10) {
      timeMinutesFormat = '0' + timeMinutesFormat;
    }

    //let setTheTime = year + '-' + month + '-' + day + 'T' + timeHoursFormat + ':' + timeMinutesFormat + ':00'
    let setTheTime = this.setTheTime(year, month, day, timeHoursFormat, timeMinutesFormat);

    let selectedHour = parseInt(currentHour);
    let selectedExt = 'AM';
    if (selectedHour > 12) {
      selectedHour = selectedHour - 12;
      selectedExt = 'PM';
    }
    if (selectedHour === 12) {
      selectedExt = 'PM';
    }
    if (selectedHour < 10) {
      selectedHour = '0' + selectedHour;
    }
    if (currentMin < 10) {
      currentMin = '0' + currentMin;
    }

    self.setState({
      hours: selectedHour,
      mins: currentMin,
      ext: selectedExt,
      start: setTheTime,
      shiftID: sesId,
      shiftSelected: sesIndex,
    });

    self.setState({
      listToShowHoursFT: list,
      listToShowMinsFT: minutesList,
    });
  }

  prepareTheListToShowTimings(doctorTimings) {
    let self = this;
    let count = 0;
    let list = [];
    let value = 0;
    let hours, mins, ext, endMins;
    let minutesList = [];
    let month = moment(self.state.dateToday).format('MM');
    let day = moment(self.state.dateToday).format('DD');
    let year = moment(self.state.dateToday).format('YYYY');
    let previousHour, previousMinute;

    for (let i = 0; i < doctorTimings.length; i++) {
      count = doctorTimings[i].endHour - doctorTimings[i].startHour;
      value = doctorTimings[i].startHour;
      previousHour = doctorTimings[i].endHour;
      previousMinute = doctorTimings[i].endMinute;
      if (doctorTimings[i].endMinute > 0) {
        previousHour = doctorTimings[i].endHour + 1;
      }

      for (let j = 0; j < count + 1; j++) {
        hours = value;
        if (doctorTimings[i].startHour === hours && doctorTimings[i].endHour > hours) {
          mins = doctorTimings[i].startMinute;
          endMins = 0;
        } else if (doctorTimings[i].startHour < hours && doctorTimings[i].endHour > hours) {
          mins = 0;
          endMins = 0;
        } else if (doctorTimings[i].startHour < hours && doctorTimings[i].endHour === hours) {
          mins = 0;
          endMins = doctorTimings[i].endMinute;
        } else if (doctorTimings[i].startHour === hours && doctorTimings[i].endHour === hours) {
          mins = doctorTimings[i].startMinute;
          endMins = doctorTimings[i].endMinute;
        }

        if (hours > 12) {
          hours = hours - 12;
          ext = 'PM';
        } else {
          if (hours === 12) {
            ext = 'PM';
          } else {
            ext = 'AM';
          }
        }
        if (hours < 10) {
          hours = '0' + hours;
        }
        if (mins < 10) {
          mins = '0' + mins;
        }
        if (endMins < 10) {
          endMins = '0' + endMins;
        }
        if (endMins === 0) {
          endMins = 60;
        }
        previousMinute = parseInt(doctorTimings[i].endMinute);
        if (previousMinute < 10) {
          previousMinute = '0' + previousMinute;
        }

        if (previousMinute === 30) {
          //check if the end min is 30 we need that hour in the list
          let indexVal = i + 1;
          let val = hours + ' ' + ext + ' Sess ' + indexVal;
          list.push({
            hourFormat: value,
            hours: hours,
            value: val,
            mins: mins,
            ext: ext,
            endMins: endMins,
            sessionIndex: i,
            sessionId: doctorTimings[i]._id,
          });
        } else if (previousHour !== value) {
          let indexVal = i + 1;
          let val = hours + ' ' + ext + ' Sess ' + indexVal;
          list.push({
            hourFormat: value,
            hours: hours,
            value: val,
            mins: mins,
            ext: ext,
            endMins: endMins,
            sessionIndex: i,
            sessionId: doctorTimings[i]._id,
          });
        }

        value = value + 1;
      }
    }

    let minFormat = 0;

    let selectedStMin = parseInt(doctorTimings[0].startMinute);
    let selectedEndMin = 60;

    for (let i = selectedStMin; i < selectedEndMin; i++) {
      minFormat = i;
      if (minFormat < 10) {
        minFormat = '0' + minFormat;
      }
      minutesList.push({ mins: minFormat, value: minFormat });
    }
    let timeHoursFormat = doctorTimings[0].startHour;
    let timeMinutesFormat = doctorTimings[0].startMinute;
    if (timeHoursFormat < 10) {
      timeHoursFormat = '0' + timeHoursFormat;
    }
    if (timeMinutesFormat < 10) {
      timeMinutesFormat = '0' + timeMinutesFormat;
    }

    //let setTheTime = year + '-' + month + '-' + day + 'T' + timeHoursFormat + ':' + timeMinutesFormat + ':00';
    let setTheTime = this.setTheTime(year, month, day, timeHoursFormat, timeMinutesFormat);
    let selectedHour = doctorTimings[0].startHour;
    let selectedExt = 'AM';
    if (selectedHour > 12) {
      selectedHour = selectedHour - 12;
      selectedExt = 'PM';
    }
    if (selectedHour === 12) {
      selectedExt = 'PM';
    }
    if (selectedHour < 10) {
      selectedHour = '0' + selectedHour;
    }
    self.setState({
      hours: selectedHour,
      mins: minutesList[0].mins,
      ext: selectedExt,
      start: setTheTime,
      shiftID: doctorTimings[0]._id,
      shiftSelected: 0,
    });

    self.setState({
      listToShowHoursFT: list,
      listToShowMinsFT: minutesList,
    });
  }

  setTheTime(year, month, day, hour, min) {
    return moment(new Date(year, parseInt(month) - 1, day, hour, min)).tz(getTimeZone());
  }

  setTheDoctorTimings() {
    var self = this;
    if (self.state.listToShowHoursFT.length > 0) {
      self.setState({
        ishoursModal: true,
      });
    }
  }
}

const styles = StyleSheet.create({
  menuParentStyle: {
    position: 'absolute',
    width: width,
    height: AppUtils.screenHeight / 1.1,
    bottom: 0,
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(10),
  },
  menuInsideStyle: {
    width: width,

    backgroundColor: AppColors.whiteColor,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(10),
  },

  clinicContainer: {
    width: width,
    flex: 1,
    alignItems: 'center',
    backgroundColor: AppColors.lightGray,
    flexDirection: 'column',
  },
  topContainer: {
    backgroundColor: AppColors.primaryColor,
    height: verticalScale(250),
    width: width,
    alignItems: 'center',
    alignSelf: 'center',
  },
  hospLogo: {
    marginTop: verticalScale(15),
    height: verticalScale(70),
    width: moderateScale(70),
    borderRadius: moderateScale(35),
    alignSelf: 'center',
  },
  hospName: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(20),
    marginTop: verticalScale(10),
  },
  date: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
  },
  hospTimimg: {
    height: verticalScale(20),
    width: moderateScale(160),
    borderRadius: moderateScale(35),
    backgroundColor: AppColors.lightPink,
    marginTop: Platform.OS === 'ios' ? verticalScale(15) : verticalScale(15),
    alignSelf: 'center',
    justifyContent: 'center',
  },
  hospTimimgText: {
    alignSelf: 'center',
    fontFamily: AppStyles.fontFamilyMedium,
  },
  bottomContainer: {
    marginTop: Platform.OS === 'ios' ? verticalScale(220) : verticalScale(220),
    alignSelf: 'center',
    height: verticalScale(270),
    width: moderateScale(330),
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(15),
  },
  speciality: {
    alignSelf: 'center',
    marginTop: AppUtils.screenHeight / 2.6,
    height: verticalScale(130),
    width: moderateScale(330),
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(15),
    position: 'absolute',
  },
  spec: {
    width: moderateScale(80),
    borderRadius: 200,
    height: moderateScale(25),
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryColor,
    marginTop: moderateScale(10),
  },
  specText: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
  },
  spText: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(15),
    color: AppColors.primaryColor,
    marginTop: verticalScale(20),
    marginLeft: moderateScale(20),
    textAlign: isRTL ? 'left' : 'auto',
      },
  timing: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(15),
    color: AppColors.primaryGray,
    marginTop: verticalScale(20),
    marginLeft: moderateScale(90),
  },
  doctorDetails1: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(14),
    color: AppColors.blackColor,
    alignSelf: 'flex-start',
    textAlign: isRTL ? 'left' : 'auto',
  },
  doctorSpec: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(12),
    color: AppColors.descColor,
    alignSelf: 'flex-start',
  },
  doctorAvail: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(12),
    color: AppColors.descColor,
    alignSelf: 'flex-end',
  },
  doctorList: {
    flexDirection: 'row',
    alignSelf: 'center',
    //height: AppUtils.isLowResiPhone ? verticalScale(110) : verticalScale(100),
    width: wp(85),
  },
  button: {
    alignSelf: 'center',
    height: verticalScale(15),
    width: moderateScale(15),
    borderRadius: moderateScale(7.5),
    borderWidth: moderateScale(1),
    borderColor: AppColors.blackColor,
  },
  doctDetails: {
    height: moderateScale(16),
    width: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: AppColors.whiteColor,
    borderColor: AppColors.radioBorderColor,
    borderWidth: moderateScale(0.5),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  doctImage: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
    alignSelf: 'center',
    marginLeft: moderateScale(0),
  },
  cardDoctDetails: {
    height: verticalScale(100),
    width: width,
    alignSelf: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    margin: moderateScale(5),
    borderBottomColor: AppColors.lightGray,
  },
  cardDoctImage: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
    alignSelf: 'center',
    margin: moderateScale(0),
  },
  cardDoctor: {
    flexDirection: 'column',
    marginTop: verticalScale(30),
    width: moderateScale(280),
    marginLeft: moderateScale(20),
  },
  cardDoctorName: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
    alignSelf: 'flex-start',
    textAlign: isRTL ? 'left' : 'auto',
  },
  cardDoctorSpec: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(13),
    color: AppColors.blackColor,
    alignSelf: 'flex-start',
    width: wp(70),
    textAlign: isRTL ? 'left' : 'auto',
  },
  cardSlot: {
    /*height:verticalScale(30),*/
    flexDirection: 'row',
    margin: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  cardSelectText: {
    alignSelf: 'center',
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(15),
    color: AppColors.primaryColor,
    flex: 1,
  },
  cardDate: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(15),
    color: AppColors.whiteColor,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
    //  flex:1
  },
  cardSpecFree: {
    width: moderateScale(70),
    borderRadius: moderateScale(5),
    height: moderateScale(45),
    alignSelf: 'center',
    borderWidth: moderateScale(1),
    borderColor: AppColors.primaryColor,
  },
  cardSpecOccupied: {
    width: moderateScale(70),
    borderRadius: moderateScale(5),
    height: moderateScale(45),
    alignSelf: 'center',
    backgroundColor: AppColors.primaryGray,
  },
  cardTimeText: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    marginTop: moderateScale(15),
  },
  cardTimeText1: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    marginTop: moderateScale(15),
  },
  clinicbuttonView: {
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center',
    width: width,
    height: AppUtils.isLowResiPhone ? verticalScale(90) : verticalScale(80),
    flexDirection: 'row',
    flex: 1,
    marginBottom: verticalScale(100),
  },
  cancelButton: {
    height: verticalScale(50),
    width: moderateScale(120),
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.whiteColor,
  },
  cancelText: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
  },
  proceedButton: {
    height: verticalScale(50),
    width: moderateScale(120),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryColor,
    marginLeft: moderateScale(30),
  },
  appointmentButton: {
    height: verticalScale(50),
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: AppColors.primaryColor,
    marginLeft: moderateScale(30),
  },
  proceedText: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
  },
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
    marginTop: Platform.OS === 'ios' ? hp(2) : hp(1.5),
    marginLeft: wp(2),
    marginRight: wp(2),
    alignSelf: 'center',
    width: wp(2),
    justifyContent: 'center',
    height: hp(6),
    fontSize: hp(4),
  },
});

export default ClinicDetails;
