import React, { Component } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  PixelRatio,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';
import Geocoder from 'react-native-geocoding';
import MapView, { Marker } from 'react-native-maps';
import styles from '../../styles/myCareWagonStyles';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppUtils } from '../../utils/AppUtils';
import Pulse from '../../shared/Pulse';
import { AppColors } from '../../shared/AppColors';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { SHApiConnector } from '../../network/SHApiConnector';
import { GooglePlacesAutocomplete } from '../../utils/GooglePlacesAutocomplete';
import { Actions } from 'react-native-router-flux';
import { AppStrings } from '../../shared/AppStrings';
import { AppStyles } from '../../shared/AppStyles';
import moment from 'moment';
import ProgressLoader from 'rn-progress-loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RadioButton, RadioGroup } from 'react-native-flexi-radio-button';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { strings } from '../../locales/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import CustomAlert from '../../components/CustomAlert';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
const returnTimeList = [
  { value: '1 Hour', key: 1 },
  { value: '2 Hour', key: 2 },
  { value: '3 Hour', key: 3 },
  { value: '4 Hour', key: 4 },
  { value: '5 Hour', key: 5 },
  { value: '6 Hour', key: 6 },
  { value: '7 Hour', key: 7 },
  { value: '8 Hour', key: 8 },
  { value: '9 Hour', key: 9 },
  { value: '10 Hour', key: 10 },
  { value: 'Not Sure', key: 'NOT_SURE' },
];

class MyCareWagonHome extends Component {
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    AppUtils.analyticsTracker('Medical Transport Home Screen');
    this.state = {
      region: {
        latitude: 1.4538337,
        longitude: 103.8195883,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      vehicleType: AppUtils.parseVehicleType(),
      tripType: AppUtils.parseTripType(),
      paymentType: AppUtils.parsePaymentType(),
      selectedVehicle: 'AMBULANCE',
      selectedTrip: 'SINGLE',
      selectedPayment: 'CARD',
      vehicleValue: 'Medical Transport',
      tripValue: 'One Way',
      paymentValue: 'Card',
      unitNumber: '',
      pickUpLatLong: {},
      dropLatLong: {},
      pickUpCountry: '',
      DropCountry: '',
      pickUpState: '',
      pickUpCity: 'OTHER',
      dropState: '',
      pickUpLocation: null,
      dropLocation: null,
      tripAmount: 'NA',
      distance: 5,
      showCalender: false,
      isCalendar: true,
      returnHour: 1,
      selectedDate: AppUtils.currentDateTime(),
      listViewDisplayForDrop: false,
      listViewDisplayForPickUp: false,
      hospitalList: [],
      isLoading: false,
      isRefreshing: false,
      isReqData: false,
      isReqTime: false,
      countryCodeString: null,
      countryCode: null,
      showCustomAlert: true,
    };
  }

  componentDidMount() {
    this.getFareAndHospital(this.state.selectedTrip);
    this.getLocation();
    this.getLoggedInCountry();
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        Actions.MainScreen();
        return true;
      });
    }
  }

  async getLoggedInCountry() {
    let userDetails = JSON.parse(await AsyncStorage.getItem('logged_in_user'));
    let countryDetails = AppUtils.getCountryDetails(userDetails.countryCode);
    this.setState({
      countryCodeString: countryDetails.code.toLowerCase(),
      countryCode: userDetails.countryCode,
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () => {
      Actions.MainScreen();
    });
  }

  async getLocation() {
    if (Platform.OS === 'ios') {
      await this.getUserCurrentLocation();
    } else {
      const permissionGranted = await AppUtils.locationPermissionsAccess();
      if (permissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
        await this.getUserCurrentLocation();
      }
    }
    this.getFareAndHospital(this.state.selectedTrip);
  }

  async getUserCurrentLocation() {
    let self = this;
    const location = await AppUtils.getCurrentLocation();
    const { latitude, longitude } = location.coords;
    Geocoder.from(latitude, longitude).then((json) => {
      let addressComponent = json.results[0].formatted_address;
      self.googlePlacesPickUpAutocomplete.state.text = addressComponent;
      self.setState(
        {
          pickUpLocation: addressComponent,
          pickUpLatLong: {
            latitude: latitude,
            longitude: longitude,
          },
          region: {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
          pickUpCountry: this.getCountryName(json.results[0].address_components),
          pickUpState: this.getStateName(json.results[0].address_components),
          pickUpCity: this.getCityName(json.results[0].address_components),
        },
        () => {
          this.getFareAndHospital(this.state.selectedTrip);
        }
      );
    });
  }

  getCountryName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      if (addressType == 'country') {
        return address_components[i].long_name;
      }
    }
    return '';
  }

  getStateName(address_components) {
    AppUtils.console('dxcszdwerefdvxc', address_components);
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      if (addressType == 'administrative_area_level_1') {
        return address_components[i].long_name;
      }
    }
    return '';
  }

  getCityName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      if (addressType == 'administrative_area_level_2') {
        return address_components[i].long_name;
      }
    }
    return 'OTHER';
  }

  async getFareAndHospital(tripType) {
    let trip = {
      tripType: tripType,
      vehicleType: this.state.selectedVehicle,
      city: this.state.pickUpCity,
      distance: this.state.distance,
    };
    try {
      this.setState({ isLoading: true });
      const response = await SHApiConnector.getFareAndHospital(trip);
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 100);
      AppUtils.console('sdfsdds44', response);
      if (response.data.status) {
        let hospitals = [];
        response.data.data.hospital.map((data) => {
          hospitals.push({
            description: data.hospitalName + ', ' + data.address,
            geometry: {
              location: { lat: data.geoLocation[1], lng: data.geoLocation[0] },
            },
          });
        });

        if (response.data.data.fare.minPrice == response.data.data.fare.maxPrice) {
          this.setState({
            tripAmount: response.data.data.fare.currency + '' + response.data.data.fare.minPrice,
            hospitalList: hospitals,
            listViewDisplayForDrop: false,
            listViewDisplayForPickUp: false,
          });
        } else {
          this.setState({
            tripAmount:
              response.data.data.fare.currency +
              response.data.data.fare.minPrice +
              ' - ' +
              response.data.data.fare.currency +
              response.data.data.fare.maxPrice,
            hospitalList: hospitals,
            listViewDisplayForDrop: false,
            listViewDisplayForPickUp: false,
          });
        }
      } else {
        if (response.data.error_code == 10006) {
          Actions.LoginMobile({ ambulanceBookingData: {} });
        }
      }
    } catch (e) {
      this.setState({ isLoading: false, listViewDisplayForDrop: false });
    }
  }

  async getFare() {
    let trip = {
      tripType: this.state.selectedTrip,
      vehicleType: this.state.selectedVehicle,
      city: this.state.pickUpCity,
      distance: this.state.distance,
    };
    try {
      const response = await SHApiConnector.getFare(trip);
      this.setState({ isLoading: false });
      if (response.data.status) {
        if (response.data.data.minFare == response.data.data.maxFare) {
          this.setState({
            tripAmount: response.data.data.minFare,
          });
        } else {
          this.setState({
            tripAmount: response.data.data.minFare + ' - ' + response.data.data.maxFare,
          });
        }
      } else {
        if (response.data.error_code == 10006) {
          Actions.LoginMobile({ ambulanceBookingData: {} });
        }
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  setTripType() {
    this.getFare(this.state.selectedTrip);
    this.selectReturnTime(this.state.selectedTrip);
  }

  checkForWheelChairFleet(value) {
    if (this.state.selectedVehicle !== value) {
      if (value === 'OTHER_VEHICLE') {
        Alert.alert(strings('common.transport.wheelFleet'), strings('common.transport.noFacilityAvail'), [
          {
            text: strings('doctor.button.capYes'),
            onPress: () =>
              this.setState(
                {
                  selectedVehicle: value,
                  vehicleValue: value,
                },
                () => this.getFare()
              ),
          },
          {
            text: strings('doctor.button.capNo'),
            onPress: () => {
              this.vehicleType.state.selectedIndex = 0;
              this.setState(
                {
                  selectedVehicle: 'AMBULANCE',
                  vehicleValue: 'AMBULANCE',
                },
                () => this.getFare()
              );
            },
          },
        ]);
      } else {
        this.setState({ selectedVehicle: value, vehicleValue: value }, () => this.getFare());
      }
    }
  }

  modalHandler(btnType) {
    this.setState({
      showCustomAlert: false,
    });
    if (btnType === 'confirm') {
    } else {
      Actions.MainScreen();
    }
  }

  render() {
    let self = this;
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === 'ios' ? (AppStyles.isX ? 180 : 0) : 70}
        style={styles.container}
        behavior={Platform.OS==="ios" && "padding" }
        enabled
      >
        <View style={styles.container}>
          {Actions.prevScene === 'MainScreen' && (
            <CustomAlert
              visible={this.state.showCustomAlert}
              title={strings('common.advisoryNote.title')}
              onCancel={() => this.modalHandler('cancel')}
              onConfirm={() => this.modalHandler('confirm')}
            />
          )}

          {this.openCalender()}
          <MapView
            style={styles.map}
            showsMyLocationButton={false}
            region={this.state.region}
            //showsUserLocation={(Platform.OS === 'ios') ? false : true}
          >
            {this.renderUserLocation()}
          </MapView>
          <View style={styles.form}>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                alignSelf: 'center',
              }}
            >
              <View
                style={[
                  styles.addNoteViewStyle,
                  {
                    borderColor: AppColors.backgroundGray,
                    bottom: AppUtils.screenHeight > 580 ? (AppUtils.isX ? 0 : hp(3)) : hp(2),
                  },
                ]}
              >
                <TextInput
                  allowFontScaling={false}
                  style={{
                    paddingTop: 0,
                    paddingBottom: AppUtils.isX ? hp(1) : hp(0.5),
                    textAlignVertical: 'top',
                    fontSize: 16,
                    textAlign: isRTL ? 'right' : 'auto',
                  }}
                  underlineColorAndroid="transparent"
                  value={this.state.unitNumber}
                  placeholder={strings('common.transport.unitNum')}
                  placeholderTextColor="#808080"
                  onChangeText={this.unitNumberChange}
                  numberOfLines={1}
                  multiline={false}
                />
              </View>
              <ScrollView>
                <View
                  style={[
                    styles.tray1,
                    {
                      marginTop: hp('1%'),
                      width: wp('90%'),
                      // marginBottom:hp('1%')
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tray1PickerViewStyle,
                      styles.vehiclePickerDimension,
                      {
                        borderBottomWidth: 0,
                        flexDirection: 'column',
                        marginTop:wp(2)
                      },
                    ]}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 12,
                        marginLeft: wp(3),
                        textAlign: isRTL ? 'left' : 'auto',
                        color: AppColors.textGray,
                      }}
                    >
                      {strings('common.transport.vehicleType')}
                    </Text>
                    <RadioGroup
                      ref={(ref) => (this.vehicleType = ref)}
                      style={{ flexDirection: 'column'}}
                      color={AppColors.primaryGray}
                      size={AppUtils.screenHeight > 580 ? 15 : 10}
                      selectedIndex={0}
                      activeColor={AppColors.primaryColor}
                      onSelect={(index, value) => this.checkForWheelChairFleet(value)}
                    > 
                      <RadioButton value={'AMBULANCE'} >
                        <Text numberOfLines={2} style={{ color: AppColors.blackColor  }}>
                          {strings('common.transport.medicalTransport')}
                        </Text>
                      </RadioButton>

                      <RadioButton value={'OTHER_VEHICLE'}>
                        <Text numberOfLines={2} style={{ color: AppColors.blackColor}}>
                          {strings('common.transport.otherVehicle')}
                        </Text>
                      </RadioButton>
                    </RadioGroup>
                  </View>
                </View>
                <View
                  style={[
                    styles.tray1,
                    {
                      width: wp('90%'),
                      marginTop: AppUtils.isX ? hp(3) : AppUtils.screenHeight > 580 ? hp(5) : hp(3),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tray1PickerViewStyle,
                      styles.paymentPickerViewStyle,
                      {
                        borderBottomWidth: 0,
                        flexDirection: 'column',
                      },
                    ]}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 12,
                        marginLeft: wp(3),
                        color: AppColors.textGray,
                        textAlign: isRTL ? 'left' : 'auto',
                      }}
                    >
                      {strings('common.transport.paymentMode')}
                    </Text>
                    <RadioGroup
                      style={{ flexDirection: 'row' }}
                      color={AppColors.primaryGray}
                      size={AppUtils.screenHeight > 580 ? 20 : 15}
                      selectedIndex={0}
                      activeColor={AppColors.primaryColor}
                      onSelect={(index, value) =>
                        this.setState({
                          selectedPayment: value,
                          paymentValue: value,
                        })
                      }
                    >
                      <RadioButton style={{ paddingLeft: 0 }} value={'CARD'}>
                        <Text numberOfLines={1} style={{ color: AppColors.blackColor }}>
                          {strings('common.transport.card')}
                        </Text>
                      </RadioButton>
                      <RadioButton value={'CASH'}>
                        <Text numberOfLines={1} style={{ color: AppColors.blackColor }}>
                          {strings('common.transport.cash')}
                        </Text>
                      </RadioButton>
                    </RadioGroup>
                  </View>
                  <View style={[styles.tray1PickerViewStyle, styles.tripPickerViewStyle, { borderBottomWidth: 0, marginLeft: wp(5) }]}>
                    <Text allowFontScaling={false} style={{ fontSize: 12, color: AppColors.textGray,textAlign: isRTL ? 'left' : 'auto', }}>
                      {strings('common.transport.tripType')}
                    </Text>
                    <RadioGroup
                      style={{ flexDirection: 'row' }}
                      color={AppColors.primaryGray}
                      size={AppUtils.screenHeight > 580 ? 20 : 15}
                      selectedIndex={0}
                      activeColor={AppColors.primaryColor}
                      onSelect={(index, value) =>
                        this.setState(
                          {
                            selectedTrip: value,
                            tripValue: value,
                          },
                          () => this.setTripType()
                        )
                      }
                    >
                      <RadioButton style={{ paddingLeft: 0 }} value={'SINGLE'}>
                        <Text style={{ color: AppColors.blackColor }}>{strings('common.transport.oneWay')}</Text>
                      </RadioButton>

                      <RadioButton style={{ paddingLeft: 0 }} value={'ROUND'}>
                        <Text style={{ color: AppColors.blackColor }}>{strings('common.transport.twoWay')}</Text>
                      </RadioButton>
                    </RadioGroup>
                    {this.selectReturnTimeModal()}
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: AppColors.primaryColor,
                    height: hp(6),
                    alignItems: 'center',
                    width: wp('100%'),
                    marginTop: hp('1%'),
                    justifyContent: 'center',
                  }}
                >
                  <View style={[styles.bookingDetails]}>
                    <View
                      style={{
                        marginLeft: wp(8),
                        alignSelf: 'flex-start',
                        flex: 1,
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.pack3,
                          {
                            fontSize: hp('1.5%'),
                            color: AppColors.whiteColor,
                            textAlign: isRTL ? 'left' : 'auto',
                          },
                        ]}
                      >
                        {strings('doctor.text.totalAmount')}
                      </Text>
                      <Text allowFontScaling={false} style={[styles.totalAmount, { color: AppColors.whiteColor,marginRight: isRTL ? wp(28) : 0, }]}>
                        {this.state.tripAmount}
                      </Text>
                    </View>
                    <View
                      style={{
                        justifyContent: 'flex-end',
                        flexDirection: 'row',
                        flex: 1,
                        marginRight: wp(8),
                      }}
                    >
                      <TouchableOpacity onPress={() => this.bookAmbulance('LATER')} style={[styles.bookLater]}>
                        <View>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: hp('1.5%'),
                              color: AppColors.whiteColor,
                            }}
                          >
                            {strings('common.transport.bookLater')}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => this.bookAmbulance('NOW')}
                        style={[
                          styles.bookLater,
                          {
                            marginLeft: 10,
                            backgroundColor: AppColors.whiteColor,
                          },
                        ]}
                      >
                        <View>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: hp('1.5%'),
                              color: AppColors.primaryColor,
                            }}
                          >
                            {strings('common.transport.bookNow')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>

            {this.searchDropLocation()}
            {this.searchPickUpLocation()}
            {this.hospitalList()}
          </View>
        </View>
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </KeyboardAvoidingView>
    );
  }

  unitNumberChange = (note) => {
    this.setState({ unitNumber: note });
  };

  async bookAmbulance(bookingSchedule) {
    Keyboard.dismiss();
    let distance = await this.getDistanceBetweenPickAndDropLocation();
    if (!this.state.pickUpLocation) {
      this.showAlert(strings('common.transport.selectPickLocation'));
    } else if (!this.state.dropLocation) {
      this.showAlert(strings('common.transport.selectDropLocation'));
    } else if (this.state.pickUpLocation === this.state.dropLocation) {
      this.showAlert(strings('common.transport.pickDropLocationShouldNotSame'));
    } else if (this.state.DropCountry != this.state.pickUpCountry) {
      this.showAlert(strings('common.transport.pickDropLocationCountryShouldSame'));
    } else if (!distance) {
      this.showAlert(strings('common.transport.selectPickDropInRange'));
    } else if (this.state.countryCode == '91' && distance > 80) {
      this.showAlert(strings('common.common.distanceMoreThanEighty'));
    } else if (distance > 100) {
      this.showAlert(strings('common.transport.selectPickDropInRange'));
    } else {
      if (bookingSchedule === 'NOW') {
        this.book('BOOK_NOW');
      } else {
        this.setState({
          showCalender: true,
          selectedDate: AppUtils.currentDateTime(),
        });
      }
    }
  }

  async getDistanceBetweenPickAndDropLocation() {
    let data = {
      pickUplat: this.state.pickUpLatLong.latitude,
      pickUplong: this.state.pickUpLatLong.longitude,
      droplat: this.state.dropLatLong.latitude,
      droplong: this.state.dropLatLong.longitude,
    };

    try {
      let response = await SHApiConnector.getDistanceBetweenLatLong(data);
      if (response.data.status == 'OK' && response.data.rows[0].elements[0].status == 'OK') {
        let value = response.data.rows[0].elements[0].distance.value;
        return value / 1000;
      } else {
        return null;
      }
    } catch (e) {}
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async book(bookingSchedule) {
    let bookingTime = bookingSchedule === 'BOOK_NOW' ? moment() : moment(this.state.selectedDate);
    let returnTime = this.state.returnHour != 'NOT_SURE' ? moment(bookingTime).add(parseInt(this.state.returnHour), 'hours') : this.state.returnHour;
    let additionaltemData = {
      tripType: this.state.selectedTrip,
      bookingType: bookingSchedule,
      vehicleType: this.state.selectedVehicle,
      bookingTime: bookingSchedule === 'BOOK_NOW' ? moment().tz('Asia/Singapore') : moment(this.state.selectedDate).tz('Asia/Singapore'),
      pickupLocation: this.state.pickUpLocation,
      dropLocation: this.state.dropLocation,
      city: this.state.pickUpCity,
      distance: this.state.distance,
    };
    try {
      this.setState({ isLoading: true, isRefreshing: false });
      const response = await SHApiConnector.additionalItems(additionaltemData);
      this.setState({ isLoading: false });
      if (response.data.status) {
        let bookData = {
          vehicleType: this.state.selectedVehicle,
          tripType: this.state.selectedTrip,
          pickupLocation: this.state.pickUpLocation,
          dropLocation: this.state.dropLocation,
          city: this.state.pickUpCity,
          fare: response.data.fare,
          transportFare: response.data.transportFare,
          paymentMethod: this.state.selectedPayment,
          unitNumber: this.state.unitNumber,
          additionalItem: response.data.additionalItem,
          bookingType: bookingSchedule,
          country: this.state.pickUpCountry,
          bookingTime: bookingSchedule === 'BOOK_NOW' ? moment() : moment(this.state.selectedDate),
          returnTime: this.state.selectedTrip == 'SINGLE' ? null : returnTime,
          distance: this.state.distance,
        };
        AppUtils.console('zxcszdxfcsdz', bookData);
        Actions.WagonBookingDetails({ bookingDetails: bookData });
      } else {
        this.setState({ isLoading: false });
        Alert.alert('', response.data.error_message, [
          { text: 'Cancel all requests', onPress: async () => this.cancelAllRequests() },
          { text: 'Close', onPress: () => console.log('dismissing alert') },
        ]);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      this.showAlert(e.response.data.error_message);
    }
  }

  async cancelAllRequests() {
    try {
      this.setState({ isLoading: true, isRefreshing: false });
      const response = await SHApiConnector.cancelAllVehicleRequests();
      this.setState({ isLoading: false });
      if (response.data.status == 'success') {
        this.showAlert('Requests Cancelled!');
      } else {
        this.showAlert('Something went wrong!');
      }
    } catch (e) {
      this.setState({ isLoading: false });
      this.showAlert('Something went wrong!');
    }
  }

  showAlert(msg) {
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  closeCalender() {
    this.setState({ showCalender: false });
    if (new Date(AppUtils.currentDateTime().getTime() + 60 * 60 * 1000) >= new Date(this.state.selectedDate)) {
      this.showAlert(strings('common.transport.selectAmbulanceNotAllowed'));
    } else {
      this.book('BOOK_LATER');
    }
  }

  openCalender() {
    let _dt = AppUtils.currentDateTime();
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showCalender}
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
                <Image
                  resizeMode={'contain'}
                  style={{ height: 30, width: 30, marginRight: 10 }}
                  source={require('../../../assets/images/cancel.png')}
                />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? (
              <View style={{ backgroundColor: AppColors.whiteColor }}>
                <DateTimePicker
                  value={this.state.selectedDate}
                  style={{ backgroundColor: AppColors.whiteColor }}
                  minimumDate={_dt}
                  maximumDate={new Date(_dt.getTime() + 7 * 24 * 3600 * 1000)}
                  mode="datetime"
                  display={'spinner'}
                  minuteInterval={1}
                  onChange={(event, date) => {
                    this.setState({ selectedDate: date });
                  }}
                />
              </View>
            ) : (
              <DatePicker
                date={this.state.selectedDate}
                mode="datetime"
                style={{
                  backgroundColor: AppColors.whiteColor,
                  width: width - 30,
                }}
                minimumDate={_dt}
                minuteInterval={1}
                maximumDate={new Date(_dt.getTime() + 7 * 24 * 3600 * 1000)}
                onDateChange={(date) => {
                  this.setState({ selectedDate: date });
                }}
              />
            )}
            <TouchableHighlight onPress={() => this.closeCalender()} underlayColor="transparent">
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
                  {moment.parseZone(this.state.selectedDate).format('MMM DD YYYY hh:mm A')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  async getDistanceAndCheckPricing() {
    let distance = await this.getDistanceBetweenPickAndDropLocation();
    AppUtils.console('sdzfsedgdfxdf_123', distance);
    if (distance && distance <= 100) {
      if (this.state.countryCode == '91' && distance > 80) {
        Alert.alert('', 'common.common.distanceMoreThanEighty');
      } else {
        this.setState({ distance: Math.round(distance) }, () => {
          AppUtils.console('sdzfsedgdfxdf', this.state.distance);
          setTimeout(() => {
            this.getFare(this.state.selectedTrip);
          }, 500);
        });
      }
    }
  }

  searchPickUpLocation() {
    let self = this;
    return (
      <View>
        <GooglePlacesAutocomplete
                  suppressDefaultStyles={false}

          placeholder={strings('common.transport.pickUpFrom')}
          minLength={3}
          autoFocus={false}
          returnKeyType={'search'}
          fetchDetails={true}
          predefinedPlacesAlwaysVisible={true}

          renderDescription={(row) => row.description}
          ref={(c) => (this.googlePlacesPickUpAutocomplete = c)}
          listViewDisplayed={self.state.listViewDisplayForPickUp}
          getDefaultValue={() => ''}
          onPress={(data, details = null) => {
            self.setState(
              {
                pickUpLatLong: {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                },
                listViewDisplayForPickUp: false,
                pickUpLocation: data.description,
                pickUpCountry: self.getCountryName(details.address_components),
                pickUpState: self.getStateName(details.address_components),
                pickUpCity: self.getCityName(details.address_components),
              },
              () => this.getDistanceAndCheckPricing()
            );
          }}
          textInputProps={{
            onChangeText: (text) => {
              self.setState({
                searchPickUpLocationKeyWord: text,
                listViewDisplayForPickUp: !self.state.listViewDisplayForPickUp,
              });
            },
          }}
          query={{
            key: AppStrings.MAP_API_KEY,
            language: 'en',
            default: 'geocode',
            components: 'country:' + this.state.countryCodeString,
          }}
          GoogleReverseGeocodingQuery={{}}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
            types: 'hospital',
          }}
          filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
          styles={{
            container: [styles.autoCompleteContainer, { top: 0 }],
            list: { position: 'absolute' },
            textInputContainer: styles.pack1,
            description: styles.description,
            textInput: [styles.textInput,{textAlign: isRTL ? 'right' : 'auto',}],
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
          }}
          debounce={500}
          currentLocation={false}
          currentLocationLabel={strings('doctor.text.currentLocation')}
          enableHighAccuracyLocation={true}
          renderRightButton={() => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableHighlight
                style={{ alignSelf: 'center', marginRight: wp(2) }}
                onPress={() => this.clearField('Drop')}
                underlayColor="transparent"
              >
                {Platform.OS === 'ios' ? (
                  <Image
                    style={{
                      height: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                      width: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                      borderRadius: isIphoneX() ? hp(3 / 2) : PixelRatio.getPixelSizeForLayoutSize(10) / 2,
                    }}
                    source={require('../../../assets/images/cancel.png')}
                  />
                ) : (
                  <Image
                    style={{
                      height: verticalScale(17),
                      width: moderateScale(17),
                      marginTop: hp(1.7),
                    }}
                    source={require('../../../assets/images/cancel.png')}
                  />
                )}
              </TouchableHighlight>
              <TouchableHighlight style={{ alignSelf: 'center' }} onPress={() => this.getLocation()} underlayColor="transparent">
                {Platform.OS === 'ios' ? (
                  <Image
                    style={{
                      height: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                      width: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                      borderRadius: isIphoneX() ? hp(3 / 2) : PixelRatio.getPixelSizeForLayoutSize(10) / 2,
                    }}
                    source={require('../../../assets/images/gps_postition.png')}
                  />
                ) : (
                  <Image
                    style={{
                      height: verticalScale(19),
                      width: moderateScale(19),
                      marginTop: hp(1.7),
                    }}
                    source={require('../../../assets/images/gps_postition.png')}
                  />
                )}
              </TouchableHighlight>
            </View>
          )}
        />
      </View>
    );
  }

  searchDropLocation() {
    let self = this;
    return (
      <View style={{ position: 'absolute', alignSelf: 'center' }}>
        <GooglePlacesAutocomplete
          placeholder={strings('common.transport.whereToGo')}
          minLength={3}
          autoFocus={false}
          returnKeyType={'search'}
          fetchDetails={true}
          renderDescription={(row) => row.description}
          ref={(c) => (this.googlePlacesDropAutocomplete = c)}
          onPress={(data, details = null) => {
            self.setState(
              {
                dropLatLong: {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                },
                listViewDisplayForDrop: false,
                dropLocation: data.description,
                DropCountry: self.getCountryName(details.address_components),
                dropState: self.getStateName(details.address_components),
                dropCity: self.getCityName(details.address_components),
              },
              () => {
                this.getDistanceAndCheckPricing();
              }
            );
          }}
          getDefaultValue={() => ''}
          listViewDisplayed={self.state.listViewDisplayForDrop}
          query={{
            key: AppStrings.MAP_API_KEY,
            language: 'en',
            default: 'geocode',
            components: 'country:' + this.state.countryCodeString,
          }}
          textInputProps={{
            onChangeText: (text) => {
              self.setState({
                searchDropLocationKeyWord: text,
                listViewDisplayForDrop: !self.state.listViewDisplayForDrop,
              });
            },
          }}
          styles={{
            container: [styles.autoCompleteContainer, { marginTop: hp('1%'), top: 40 }],
            textInputContainer: styles.pack1,
            list: { position: 'absolute' },
            listView: { height: hp(25) },
            description: styles.description,
            textInput: [styles.textInput,{textAlign: isRTL ? 'right' : 'auto',}],
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          GoogleReverseGeocodingQuery={{}}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
            types: 'hospital',
          }}
          filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
          renderRightButton={() => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableHighlight
                style={{ alignSelf: 'center', marginRight: wp(2) }}
                onPress={() => this.clearField('PickUp')}
                underlayColor="transparent"
              >
                {Platform.OS === 'ios' ? (
                  <Image
                    style={{
                      height: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                      width: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                      borderRadius: isIphoneX() ? hp(3 / 2) : PixelRatio.getPixelSizeForLayoutSize(10) / 2,
                    }}
                    source={require('../../../assets/images/cancel.png')}
                  />
                ) : (
                  <Image
                    style={{
                      height: verticalScale(17),
                      width: moderateScale(17),
                      marginTop: hp(1.7),
                    }}
                    source={require('../../../assets/images/cancel.png')}
                  />
                )}
              </TouchableHighlight>
              {this.state.hospitalList.length > 0 ? (
                <TouchableHighlight style={{ alignSelf: 'center' }} onPress={() => this.onModalData()} underlayColor="transparent">
                  {Platform.OS === 'ios' ? (
                    <Image
                      style={{
                        height: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                        width: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                        borderRadius: isIphoneX() ? hp(3 / 2) : PixelRatio.getPixelSizeForLayoutSize(10) / 2,
                        tintColor: AppColors.primaryColor,
                      }}
                      source={require('../../../assets/images/list.png')}
                    />
                  ) : (
                    <Image
                      style={{
                        height: verticalScale(19),
                        width: moderateScale(19),
                        marginTop: hp(1.7),
                        tintColor: AppColors.primaryColor,
                      }}
                      source={require('../../../assets/images/list.png')}
                    />
                  )}
                </TouchableHighlight>
              ) : (
                <View
                  style={{
                    height: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                    width: isIphoneX() ? hp(3) : PixelRatio.getPixelSizeForLayoutSize(10),
                    borderRadius: isIphoneX() ? hp(3 / 2) : PixelRatio.getPixelSizeForLayoutSize(10) / 2,
                  }}
                />
              )}
            </View>
          )}
        />
      </View>
    );
  }

  clearField(pickUpOrDrop) {
    this.setState({
      listViewDisplayForPickUp: false,
      listViewDisplayForDrop: false,
      pickUpLatLong: pickUpOrDrop == 'PickUp' ? this.state.pickUpLatLong : {},
      pickUpLocation: pickUpOrDrop == 'PickUp' ? this.state.pickUpLocation : null,
      dropLatLong: pickUpOrDrop == 'Drop' ? this.state.dropLatLong : {},
      dropLocation: pickUpOrDrop == 'Drop' ? this.state.dropLocation : null,
    });

    pickUpOrDrop == 'PickUp' ? this.googlePlacesDropAutocomplete._handleChangeText('') : this.googlePlacesPickUpAutocomplete._handleChangeText('');
  }

  renderUserLocation() {
    let self = this;
    let lat = self.state.region.latitude;
    let long = self.state.region.longitude;
    return (
      <View style={{ borderWidth: AppUtils.isIphone ? 0 : 1 }}>
        {AppUtils.isIphone ? (
          <Marker key={1024} style={{ alignItems: 'center', justifyContent: 'center' }} coordinate={{ latitude: lat, longitude: long }}>
            <Image style={{ zIndex: 999 }} source={require('../../../assets/images/gps_postition.png')} />
            <Pulse
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
              }}
              color={AppColors.primaryColor}
              numPulses={4}
              diameter={250}
              speed={20}
              duration={1500}
            />
          </Marker>
        ) : (
          <Marker
            key={1024}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: verticalScale(250),
              width: moderateScale(250),
            }}
            coordinate={{ latitude: lat, longitude: long }}
          ></Marker>
        )}
      </View>
    );
  }

  onModalData() {
    if (this.state.hospitalList.length == 0) {
      this.getFareAndHospital(this.state.selectedTrip);
    }

    this.setState({
      isReqData: true,
    });
  }

  selectReturnTime(tripKey) {
    this.setState({
      isReqTime: tripKey == 'SINGLE' ? false : true,
    });
  }

  selectReturnTimeModal() {
    return (
      <Modal visible={this.state.isReqTime} transparent={true} animationType={'fade'} onRequestClose={() => this.onBackPressModal()}>
        <View style={styles.twoWayReturn}>
          <View style={[styles.selectReturnHour, { width: wp(60) }]}>
            <View style={styles.selectReturnTrip}>
              <Text allowFontScaling={false} style={styles.returnTimeText}>
                Return Time
              </Text>
              <TouchableOpacity style={{ flex: 0.7 }} onPress={() => this.onBackPressModal()}>
                <Image
                  source={require('../../../assets/images/close_icon.png')}
                  style={{
                    height: verticalScale(20),
                    width: verticalScale(20),
                    tintColor: AppColors.blackColor,
                  }}
                ></Image>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FlatList
                style={{ width: wp(60) }}
                data={returnTimeList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.twoWayTime}
                    onPress={() =>
                      this.setState({
                        returnHour: item.key,
                        isReqTime: false,
                      })
                    }
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 18,
                        marginTop: hp(3),
                        marginLeft: wp(5),
                        color: AppColors.blackColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                      }}
                    >
                      {item.value}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  hospitalList() {
    return (
      <Modal
        visible={this.state.isReqData}
        data={this.state.hospitalList}
        transparent={true}
        animationType={'fade'}
        onRequestClose={() => this.onBackPress()}
      >
        <View style={styles.twoWayReturn}>
          <View style={[styles.selectReturnHour, { width: wp(80) }]}>
            <View style={styles.hospitalData}>
              <View style={{ flex: 1 }} />
              <Text allowFontScaling={false} style={styles.selectHospitalList}>
                Select Hospital
              </Text>
              <TouchableOpacity style={{ flex: 1.2 }} onPress={() => this.onBackPress()}>
                <Image
                  source={require('../../../assets/images/close_icon.png')}
                  style={{
                    height: verticalScale(20),
                    width: verticalScale(20),
                    tintColor: AppColors.blackColor,
                  }}
                ></Image>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                <FlatList
                  data={this.state.hospitalList}
                  ref={(r) => (this.refs = r)}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item) => this.hospital_list(item)}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  selectHospital(item) {
    this.googlePlacesDropAutocomplete.state.text = item.item.description;
    this.setState({
      dropLocation: item.item.description,
      isReqData: false,
      dropLatLong: {
        latitude: item.item.geometry.location.lat,
        longitude: item.item.geometry.location.lng,
      },
      listViewDisplayForDrop: false,
      listViewDisplayForPickUp: false,
      DropCountry: 'Singapore',
    });
  }

  hospital_list(item) {
    return (
      <TouchableOpacity onPress={() => this.selectHospital(item)}>
        <View
          style={{
            justifyContent: 'center',
            marginLeft: wp(5),
            marginRight: wp(5),
            borderColor: AppColors.lightGray,
            height: hp(10),
          }}
        >
          <Text allowFontScaling={false} style={styles.hospitalName}>
            {item.item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  onBackPress() {
    this.setState({
      isReqData: false,
    });
  }

  onBackPressModal() {
    this.setState({
      isReqTime: false,
    });
  }
}

export default MyCareWagonHome;
