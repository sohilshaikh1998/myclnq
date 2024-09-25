import React from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Linking,
  PermissionsAndroid,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  Button,
  TouchableHighlight,
  Dimensions,
  DatePickerAndroid,
  ScrollView,
  I18nManager,
} from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-community/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import VersionCheck from 'react-native-version-check';
import { Actions } from 'react-native-router-flux';
import { AppStrings } from '../../shared/AppStrings';
import { AppUtils } from '../../utils/AppUtils';
import { AppArray } from '../../utils/AppArray';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import images from '../../utils/images';
import MapView from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { SHApiConnector } from '../../network/SHApiConnector';
import firebaseNotifications from '../../utils/firebaseNotifications';
import { getUniqueId } from 'react-native-device-info';
import ProgressLoader from 'rn-progress-loader';
import DeviceInfo from 'react-native-device-info';
import InAppReview from 'react-native-in-app-review';
import I18n from 'react-native-i18n';
import axios from 'axios';
import { CachedImage, ImageCacheProvider } from '../../cachedImage';

import BottomUp from 'react-native-modal';
import VitalCard from '../vital/VitalCard';
import { DummyArray } from '../../shared/dummy';
import ElevatedView from 'react-native-elevated-view';
import moment from 'moment';
import { strings } from '../../locales/i18n';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import ApplyVoucher from '../../shared/ApplyVoucher';
const { width, height } = Dimensions.get('window');
import auth from '@react-native-firebase/auth';
import { revokeAccessToken } from '../../../src/network/vitalApi';
import { CountryInfo } from '../../shared/AllCountryCode';
import { moderateScale } from '../../utils/Scaling';
import CustomRingProgress from '../../components/CustomRingProgress';
import { GlobalContext } from '../../GlobalContext';
import { googleFitCode } from '../../components/getStepsCount';
// import { err } from 'react-native-svg/lib/typescript/xml';

const isRTL = I18nManager.isRTL;
var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
var minDatee = new Date(2022, 11, 24, 10, 33, 30, 0);
var today = new Date();
var dd = String(new Date().getDate()).padStart(2, '0');
var mm = String(new Date().getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
let tomrwDate = String(new Date().getDate() + 1).padStart(2, '0');
let tomorrow = yyyy + '-' + mm + '-' + tomrwDate;
let timeToRefreshPedometer = 20000;

class Main extends React.Component {
  static contextType = GlobalContext;
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    AppUtils.analyticsTracker('MyCLNQ Home Screen');

    this.state = {
      dateToday: _dt,
      maxDate: _dt,
      showDateSelector: false,
      sDate: moment(_dt).format('YYYY-MM-DD'),
      region: {
        latitude: 1.4538337,
        longitude: 103.8195883,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      isLoading: false,
      userName: 'User',
      isRefreshing: false,
      category: AppArray.getMainCategory(),
      languageList: AppArray.language(),
      showRenewModal: false,
      showStartModal: false,
      planModal: this.props.openPlanModal !== undefined ? true : false,
      planOptions: DummyArray.dropDowndata,
      startPlanOption: [
        {
          option: 'Today',
          isSelected: true,
          dateIs: today,
        },
        {
          option: 'Tomorrow',
          isSelected: false,
          dateIs: tomorrow,
        },
        {
          option: 'Select Date',
          isSelected: false,
          dateIs: today,
        },
      ],
      showDate: false,
      minDate: new Date(),
      vitalSubscriptionPlan: [],
      selectedVitalPlan: [],
      selectedPlanTime: '',
      selectedItemIs: '',
      subscribedPlan: '',
      subcribePlan: false,
      adminContact: false,
      firstUser: false,
      dateSelectedIs: '',
      planEndsON: '',
      subscriptionenabled: '',
      hideTodayTomorrow: false,
      planEndTime: '',
      otherCountry: false,
      timeExist: '',
      futureEnable: '',
      planEndsONDate: '',
      planEndsONNextDate: '',
      userImage: null,
      showLangModal: false,
      selectedLang: '',
      avatarImage: require('./../../../assets/images/avatar_male.png'),
      settingsImage: require('./../../../assets/images/settings.png'),
      isOpneVoucherModal: true,
      webViewHeight: null,
      userCountryCode: '',
      carouselUrl: 'https://myclnq.co/components/carousel/index.html',
      selectedActivities: [],
      asyncScreenTime: 0,
      selectedSubscription: null,
      walletResponse: null,
      membershipPlans: null,
      userActivePlan: null,
      totalSteps: 1,
      isSmartWatchConnected: false,
    };
  }

  async loadPedometer() {
    this.setState({ isLoading: !true });
    const selectedDeviceIdFromAsync = await AsyncStorage.getItem('deviceId');
    if (!selectedDeviceIdFromAsync) {
      this.setState({ isSmartWatchConnected: false });
      await googleFitCode();
      var stepRes = (await AsyncStorage.getItem('stepCount')) || 1;
      console.log('pppppp', JSON.stringify(stepRes));
      this.setState({ totalSteps: stepRes, isLoading: false });
    } else {
      this.setState({ isSmartWatchConnected: true, isLoading: false });
    }
  }

  async componentDidMount() {
    this.loadPedometer();
    setTimeout(() => {
      timeToRefreshPedometer = 120000;
    }, 60000);

    setInterval(() => {
      this.loadPedometer();
    }, timeToRefreshPedometer); //reloading after 2 min. to get latest values

    this.focusSubscription = this.props.navigation.addListener('willFocus', async () => {
      this.loadPedometer();
      setTimeout(() => {
        timeToRefreshPedometer = 120000;
      }, 60000);
    });

    await SHApiConnector.getWalletDetails().then((res) => {
      this.setState({ walletResponse: res?.data });
    });

    await SHApiConnector.getAllMembershipPlan()
      .then(async (res) => {
        if (res?.data?.status) {
          this.setState({ membershipPlans: res?.data?.data });
          await SHApiConnector.getUserMembershipPlan().then(async (plan) => {
            let activePlann = [];
            await plan?.data?.map((i) => {
              if (i?.paymentStatus == 'success') {
                activePlann.push(i);
              }
            });
            res?.data?.data?.map((i) => {
              if (activePlann[0]?.planId == i?._id && activePlann[0]?.paymentStatus == 'success') {
                this.setState({ userActivePlan: activePlann[0]?.planId });
              }
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });

    await this.checkUserLoggedIn().catch((error) => {
      console.log(error, 'errorInFN');
    });

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        this.exitAlert();
        return true;
      });
    }

    const selectedActivities = JSON.parse(await AsyncStorage.getItem('selectedActivities'));
    const deviceIdBT = await AsyncStorage.getItem('deviceId');

    this.setState({
      selectedActivities: [...selectedActivities],
      deviceIdBT: deviceIdBT,
    });

    const userCountryCodeInLocal = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)).countryCode;

    const localeData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOCALE));

    this.setState({ userCountryCode: userCountryCodeInLocal });
    I18n.locale = localeData?.value;

    if (localeData) {
      this.setState({
        selectedLang: localeData?.short,
      });
    }
    this.setState({
      showLangModal: false,
      category: AppArray.getMainCategory(userCountryCodeInLocal),
      carouselUrl: this.state.carouselUrl + '?lang=',
    });

    // const item = this.state.languageList.filter((item) => console.log('Ssdxfewsfdvdfxd_!23', I18n.locale, item.value.indexOf(I18n.locale)));
  }

  async checkUserLoggedIn() {
    const isLoggedIn = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN));
    if (isLoggedIn && isLoggedIn.isLoggedIn) {
      this.storeToken();
      this.checkUpdateNeeded();
      this.getLocation();
      this.getVitalSubscription();

      const googleUserDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
      const appleUserDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.APPLE_USER_DATA));

      if (googleUserDetails) {
        this.setState({
          userName: googleUserDetails?.googleUserData?.user?.givenName,
          avatarImage: { uri: googleUserDetails?.googleUserData?.user?.photo },
        });
      }

      if (appleUserDetails) {
        this.setState({
          userName: appleUserDetails?.appleUserData?.fullName?.givenName || appleUserDetails?.appleUserData?.firstName,
        });
      }

      const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
      let index = 0;

      // this.setState({
      //   category: AppArray.getMainCategory(userDetails?.countryCode),
      //   userImage: userDetails.profilePic,
      //   avatarImage: gender == 'Male' ? require('./../../../assets/images/avatar_male.png') : require('./../../../assets/images/avatar_female.png'),
      //   userName: Array.isArray(userDetails?.relativeDetails) ? userDetails?.relativeDetails[index].firstName : userDetails?.relativeDetails?.firstName,
      // });

      if (Array.isArray(userDetails.relativeDetails)) {
        index = userDetails.relativeDetails.findIndex((relativeDetail) => relativeDetail.spouse === 'self');
      } else if (userDetails.relativeDetails && userDetails.relativeDetails.spouse === 'self') {
        index = 0;
      } else {
        index = -1;
      }

      if (index !== -1) {
        const { firstName, gender } = Array.isArray(userDetails.relativeDetails) ? userDetails.relativeDetails[index] : userDetails.relativeDetails;

        this.setState({
          category: AppArray.getMainCategory(userDetails?.countryCode),
          userImage: userDetails.profilePic,
          avatarImage:
            gender === 'Male' ? require('./../../../assets/images/avatar_male.png') : require('./../../../assets/images/avatar_female.png'),
          userName: firstName,
        });
      } else {
        const { firstName, gender } = Array.isArray(userDetails?.relativeDetails) ? userDetails.relativeDetails[index] : userDetails.relativeDetails;
        // Set default values or perform actions accordingly
        this.setState({
          category: AppArray.getMainCategory(userDetails?.countryCode),
          userImage: userDetails.profilePic,
          avatarImage:
            gender === 'Male' ? require('./../../../assets/images/avatar_male.png') : require('./../../../assets/images/avatar_female.png'), // Set a default avatar image
          userName: firstName,
        });
      }
    } else {
      // Actions.LoginOptions();
    }
  }

  async getWellnessStatus() {
    try {
      let response = await SHApiConnector.getWellnessStatus();
      if (response.data != null || response.data != undefined) {
        Alert.alert('', response.data.data.message);
      } else {
        Alert.alert('Sorry', 'Something went wrong!');
      }
    } catch (error) {
      this.setState({ isLoading: false });
      const googleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
      if (!googleUserData && error) {
        Alert.alert('Sorry', 'Something went wrong!');
      } else {
        Alert.alert(
          '',
          strings('common.common.completeProfile'),
          [
            {
              text: strings('doctor.button.cancel'),
              onPress: () => {
                // Handle cancel action if needed
                console.log('Cancel pressed');
              },
              style: 'cancel',
            },
            {
              text: strings('doctor.button.completeProfileBtn'),
              onPress: () => {
                Actions.UserSignUp({ isNewUser: true, userDetail: googleUserData });
              },
            },
          ],
          { cancelable: true }
        );
      }
    }
  }

  async getVitalSubscription() {
    try {
      this.setState({ isLoading: false });
      let subscriptionPlan = await SHApiConnector.getvitalSubscriptionPlan();
      this.setState({ isLoading: false });
      if (subscriptionPlan.data.status) {
        subscriptionPlan.data.response.map((val, arrayIndex) => {
          if (val.subscriptionPlanName === 'Monthly') {
            Object.assign(val, { selected: true });
          } else {
            Object.assign(val, { selected: false });
          }
        });
        this.setState(
          {
            vitalSubscriptionPlan: subscriptionPlan.data.response,
          },
          () => {
            this.state.vitalSubscriptionPlan.map((val) => {
              AppUtils.console('subbb' + val.subscriptionPlanName);
            });
          }
        );
      }
    } catch (e) {
      AppUtils.console('ResponseVitalSubscriptionerror:', e);
      this.setState({ isLoading: false });
    }
  }

  openCalender() {
    try {
      AppUtils.console('openCalender');
      var self = this;
      var dateexpireOn = new Date(self.state.planEndTime);
      var selectedDate = self.state.hideTodayTomorrow ? dateexpireOn.setDate(dateexpireOn.getDate() + 1) : moment(self.state.dateToday)._d;
      var maxDate = new Date(2022, 11, 24, 10, 33, 30, 0);
      if (Platform.OS === 'ios') {
        self.setState({ planModal: false }, () => {
          setTimeout(() => {
            self.setState({
              showDateSelector: true,
              date: selectedDate,
              mode: 'default',
              maxDate: maxDate,
            });
          }, 500);
        });
        AppUtils.console('openCalenderIOS');
      } else {
        self.setState({ planModal: false }, () => {
          setTimeout(() => {
            if (self.state.hideTodayTomorrow) {
              self.showPicker('dateToday', {
                date: selectedDate,
                mode: 'default',
                minDate: selectedDate,
                maxDate: maxDate,
              });
            } else {
              self.showPicker('dateToday', {
                date: selectedDate,
                mode: 'default',
                maxDate: maxDate,
              });
            }
          }, 500);
        });
      }
    } catch (e) {
      AppUtils.console('error', e);
    }
  }

  openDateSelector() {
    let self = this;
    AppUtils.console('sgdfhsedfg345', this.state.date);
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDateSelector}
        onRequestClose={this.close}
        animationType="fade"
        key={this.state.showDateSelector ? 1 : 2}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: hp(30),
              alignSelf: 'center',
              backgroundColor: AppColors.whiteColor,
              justifyContent: 'center',
              width: width - 30,
            }}
          >
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
              <TouchableOpacity onPress={() => this.setState({ showDateSelector: false })}>
                <Image
                  resizeMode={'contain'}
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: 10,
                  }}
                  source={require('../../../assets/images/cancel.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <DateTimePicker
                mode="date"
                value={new Date(this.state.sDate)}
                display="spinner"
                maximumDate={this.state.maxDate}
                style={{ backgroundColor: AppColors.whiteColor }}
                onChange={(event, selectDate) => {
                  AppUtils.console('eventIs', selectDate);
                  this.setState({
                    sDate: moment(selectDate).format('YYYY-MM-DD'),
                  });
                }}
              />
            </View>
            <TouchableHighlight
              onPress={() => {
                self.setState({ showDateSelector: false }, () => {
                  this.setDate(this.state.sDate);
                });
              }}
              underlayColor="transparent"
            >
              <View
                style={{
                  backgroundColor: AppColors.colorHeadings,
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
                  {moment(this.state.sDate).format('DD MMM Y')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  showPicker = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DatePickerAndroid.open(options);
      if (action === DatePickerAndroid.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);
      this.setDate(date);
      this.setState({ selectedPlanTime: 'Select Date' });
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  setDate(date) {
    try {
      this.setState({
        sDate: moment(date).format('YYYY-MM-DD'),
        planModal: !this.state.planModal,
      });
    } catch (e) {
      AppUtils.console('DiffError', e);
    }
  }

  async checkUpdateNeeded() {
    let updateNeeded = await VersionCheck.needUpdate();
    if (AppStrings.apiURL.baseURL === 'https://myclnqapi.ssivixlab.com' && updateNeeded.latestVersion > AppStrings.myClnqVersionName) {
      //Alert the user and direct to the app url
      setTimeout(() => {
        Alert.alert(strings('common.common.update'), strings('common.common.newUpdateAvail'), [
          { text: strings('doctor.button.cancel') },
          {
            text: strings('common.common.update'),
            onPress: () => Linking.openURL(AppStrings.storeLink),
          },
        ]);
      }, 500);
    } else {
      if (InAppReview.isAvailable() && (await AppUtils.showRating())) {
        InAppReview.RequestInAppReview();
        await AppUtils.positiveEventCount();
      }
    }
  }

  startPlanFrom(item, dataLength, selectedOption) {
    AppUtils.console('selectedOption' + selectedOption);
    var data = this.state.startPlanOption;

    for (var i = 0; i < data.length; i++) {
      if (item.item.option == data[i].option) {
        data[i].isSelected = true;
      } else {
        data[i].isSelected = false;
      }
    }

    this.setState(
      {
        startPlanOption: data,
      },
      () => {
        if (item.item.option == 'Select Date') {
          // this.setState({
          //     showDate: !this.state.showDate
          // });
          this.openCalender();
        }
      }
    );
    AppUtils.console('daaaa-->' + this.state.dateToday);

    this.setState({
      selectedPlanTime: selectedOption,
    });
  }

  async storeToken() {
    //AppUtils.console("StoreToken");

    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);
    let tokenData;
    if (user.isJustLoginUser) {
      tokenData = {
        OSType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
        fcmToken: await firebaseNotifications.fetchFCMToken(),
        deviceId: getUniqueId(),
        userGuid: user.phoneNumber,
      };
    } else {
      tokenData = {
        OSType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
        fcmToken: await firebaseNotifications.fetchFCMToken(),
        deviceId: getUniqueId(),
      };
    }
    //  AppUtils.console("StoreToken" + JSON.stringify(tokenData));
    this.setState({ isLoading: false });

    try {
      let response = await SHApiConnector.storeToken(tokenData);
      this.setState(
        {
          isLoading: false,
        },
        async () => {
          if (response.data.error_code === '10006') {
            await AsyncStorage.clear();
            setTimeout(() => {
              Alert.alert(
                '',
                strings('common.common.sessionExpired'),
                [
                  {
                    text: strings('doctor.button.ok'),
                    onPress: () => AppUtils.logout(),
                  },
                ],
                { cancelable: false }
              );
            }, 500);
          }
        }
      );
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('STORE_TOKEN_ERROR', e);
    }
  }

  getSubcriptionDetails = async () => {
    let tokenData = {
      OSType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
    };

    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.storeToken(tokenData);
      AppUtils.console('response-->', response);
      this.setState({
        isLoading: false,
      });
      if (response.data.status) {
        let vitalPlan = response;
        let servingCountry = vitalPlan.data.application.REMOTE_CONSULT;
        let subscriptionPlanDetails = vitalPlan.data.response.vitalSubscriptionPlan;

        //  if (servingCountry.includes('91') || servingCountry.includes('65')) {
        //  if (false) {
        if (vitalPlan.data.response.hasOwnProperty('vitalSubscriptionPlan')) {
          if (subscriptionPlanDetails.length === 0) {
            AppUtils.console('not Subscribed');
            if (servingCountry.includes('91') || servingCountry.includes('65')) {
              this.setState({
                firstUser: !this.state.firstUser,
              });
            } else {
              this.updateAdminContact();
            }
            //this.firstSubscription();
          } else if (subscriptionPlanDetails.length === 1) {
            let subscribedPlanData = subscriptionPlanDetails[0];
            this.setState({
              subscriptionenabled: subscribedPlanData,
            });
            var startplan = moment(subscribedPlanData.planStartsOn.substr(0, 10), 'YYYY-MM-DD');
            var currentDateIS = moment().format('YYYY-MM-DD');
            var planEnd = moment(subscribedPlanData.planEndsOn.substr(0, 10), 'YYYY-MM-DD');
            var timeIs = moment(planEnd, 'YYYY-MM-DD').fromNow();
            var ffff = moment(subscribedPlanData.planStartsOn.substr(0, 10)).format('DD MMM');

            var diffDays = planEnd.diff(currentDateIS, 'days');
            let currentDate = moment().format('YYYY-MM-DD');

            this.setState({
              planEndsON: moment(planEnd).format('DD MMM'),
              planEndsONNextDate: moment(planEnd).add(1, 'days').format('DD MMM'),
              planEndsONDate: diffDays,
              planEndTime: planEnd,
              timeExist: diffDays,
              futureEnable: moment(subscribedPlanData.planStartsOn.substr(0, 10)).format('DD MMM'),
            });

            if (currentDate < moment(subscribedPlanData.planStartsOn).format('YYYY-MM-DD')) {
              this.startVital();
            } else if (diffDays <= '10') {
              if (servingCountry.includes('91') || servingCountry.includes('65')) {
                this.renewModal();
              } else {
                this.setState({
                  otherCountry: !this.state.otherCountry,
                });
              }
            } else {
              Actions.VitalDrawer();
            }
          } else {
            Actions.VitalDrawer();
          }
        } else {
          AppUtils.console('vitalSubscriptionPlan not added---->');
        }
        // }
        // else {
        //     this.updateAdminContact();
        // }
      } else {
        console.log('error is' + response.data.error_code);
        // this.showAlert(strings('string.error_code.error_10006'), true);
        if (response.data.error_code === '10006') {
          this.logout();
        }
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('STORE_TOKEN_ERROR', e);
    }
  };

  // showAlert(msg, ispop) {
  //     let self = this;
  //     setTimeout(() => {
  //         AppUtils.showMessage(this, "", msg, strings('doctor.button.ok'), function () {
  //             if (ispop) {
  //                 self.setState({
  //                     isRescheduling: false,
  //                 });
  //             }
  //         });
  //     }, 500);
  // }

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
    try {
      let self = this;
      const location = await AppUtils.getCurrentLocation();
      const { latitude, longitude } = location.coords;
      this.setState({
        region: {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
      });

      Geocoder.from(latitude, longitude).then(async (json) => {
        let itemsToBeRemoved = json.results[0].address_components;

        let filteredArr = CountryInfo.filter((o1) => {
          return itemsToBeRemoved.some((o2) => o2.short_name === o1.code);
        });

        let currentUserCountryCode = filteredArr[0].dial_code;
        const googleUserDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
        const appleUserDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.APPLE_USER_DATA));
        const tempCountryCode = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
        self.getCountryName(json.results[0].address_components);

        if (tempCountryCode) {
          this.setState({
            userCountryCode: tempCountryCode?.countryCode,
          });

          return;
        }

        if (googleUserDetails || appleUserDetails) {
          this.setState({
            userCountryCode: currentUserCountryCode,
          });
        }
      });
    } catch (e) {
      console.log('CURRENT_LOCATION_ERROR', e);
    }
  }

  async getCountryName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];

      if (addressType == 'country') {
        const userCountryCode = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)).countryCode;

        if (
          (address_components[i].short_name === 'IN' && userCountryCode !== '91') ||
          (address_components[i].short_name === 'SG' && userCountryCode !== '65')
        ) {
          let numberNotBelongsUserLocation = JSON.parse(
            await AsyncStorage.getItem(AppStrings.contracats.NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED)
          );

          if (!numberNotBelongsUserLocation || !numberNotBelongsUserLocation.NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED) {
            await AsyncStorage.setItem(
              AppStrings.contracts.NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED,
              JSON.stringify({
                NUMBER_NOT_BELONGS_USER_LOCATION_ALERT_SHOWED: true,
              })
            );
            Alert.alert('', strings('common.common.numberNotWithCurrentLocation'), [
              { text: strings('doctor.button.ok') },
              {
                text: strings('common.common.logout'),
                onPress: () => this.logout(),
              },
            ]);
          }
        }
        return;
      }
    }
    return '';
  }

  getEmail = async () => {
    const { singapore, malaysia } = AppStrings.contactEmails;
    const userCountryCode = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)).countryCode;
    return userCountryCode === '60' ? malaysia : singapore;
  };

  async logout() {
    let self = this;

    let isUserLoggedIn = await AppUtils.isUserLoggedIn();

    if (isUserLoggedIn) {
      SHApiConnector.logout(async function (err, stat) {
        if (stat) {
          try {
            //this.firebaseLogout();
            await AsyncStorage.setItem(AppStrings.contracts.GOOGLE_USER_DATA, JSON.stringify({ googleUserData: null }));
            if (stat.logOutStatus) {
              AppUtils.logoutNoNav();
              Actions.LoginMobile();
            } else {
              AppUtils.logoutNoNav();
              Actions.LoginMobile();
            }
            console.log('application logout');
          } catch (err) {
            console.error(err);
          }
        }
      });
    } else {
      Actions.LoginMobile();
    }
  }

  /**
   * firebase logout
   */
  firebaseLogout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('firebaselogout');
      })
      .catch((error) => {
        console.log(error, 'error in auth ');
        // An error happened.
      });
  };

  componentWillUnmount() {
    let self = this;
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        self.exitAlert();
        return true;
      });
    }
  }

  bookDoctor() {
    let self = this;
    AppUtils.firstTimeUser(function (isFirstTimeUser) {
      if (isFirstTimeUser) {
        // AsyncStorage.setItem(AppStrings.contracts.firstTimeUser, JSON.stringify('true'));
        Actions.HomeScreenDash();
      } else {
        Actions.HomeScreenDash();
      }
    });
  }

  exitAlert() {
    Alert.alert(strings('common.common.exitApp'), strings('common.common.wantToQuit'), [
      { text: strings('common.common.stay'), style: 'cancel' },
      {
        text: strings('common.common.exit'),
        onPress: () => BackHandler.exitApp(),
      },
    ]);
  }

  renderNewCategory(item, length) {
    return (
      <View
        style={[
          styles.bookingNewButton,
          {
            // shadowColor: AppColors.whiteColor,
            shadowColor: '#B7B7B7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 0.5,
            elevation: 0.5,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          testId={item.item.id}
          onPress={async () => {
            if (item.item.id === 'htpl') {
              if (this.state.userCountryCode === '91' || this.state.userCountryCode === '+91') {
                Linking.openURL(Platform.OS === 'android' ? 'market://launch?id=com.sunpooh.Health' : 'https://happilyhealth.page.link/ndgv');
              } else {
                this.getWellnessStatus();
              }
            } else this.categoryClick(item.item.id);
          }}
        >
          <View
            style={[
              styles.cardView,
              {
                backgroundColor: AppColors.whiteColor,
                position: 'relative',
                width: wp(28),
                height: AppUtils.isIphone ? wp(28) : 110,
              },
            ]}
          >
            <View style={{ flexDirection: 'column' }}>
              <Image
                resizeMode="cover"
                style={{
                  height: AppUtils.isX ? wp(12) : wp(12),
                  width: AppUtils.isX ? wp(12) : wp(12),
                  alignSelf: 'center',
                  marginTop: AppUtils.isX ? hp(1.5) : hp(1.5),
                }}
                source={item.item.iconWithoutCircle}
              />

              <View
                style={[
                  styles.cardTitleView,
                  {
                    height: AppUtils.isIphone ? (AppUtils.isX ? hp(5) : hp(6)) : hp(5),
                  },
                ]}
              >
                <Text
                  numberOfLines={3}
                  style={
                    item.item.title == 'Video Consult / Tele-ART'
                      ? [styles.cardTitleLongText, styles.cardTitle]
                      : [
                          styles.cardTitle,
                          {
                            lineHeight: AppUtils.isX ? hp(2) : this.state.selectedLang == 'KM' ? hp(2) : hp(2),
                            textAlign: 'center',
                          },
                        ]
                  }
                >
                  {item.item.title}
                </Text>
              </View>
            </View>

            {/* <Text numberOfLines={2} 
                        style={[styles.medicalTransportSubText, {lineHeight: this.state.selectedLang == 'KM' ? hp(2.3) : hp(2.3)}]}>{item.item.subTitle}</Text> */}
            {this.state.userCountryCode === '91' || this.state.userCountryCode === '+91' || this.state.userCountryCode === ''
              ? null
              : item.item.id === 'htpl' && (
                  <Text
                    style={{
                      backgroundColor: 'red',
                      color: '#FFF',
                      fontSize: this.state.userCountryCode === '91' ? 8 : 7,
                      position: 'absolute',
                      paddingHorizontal: this.state.userCountryCode === '91' ? 8 : 5,
                      paddingVertical: 2,
                      borderRadius: wp(2),
                      overflow: 'hidden',
                      fontWeight: '700',
                      right: 5,
                      top: 5,
                    }}
                  >
                    {strings('common.common.comingSoon')}
                  </Text>
                )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  onMessage(event) {
    this.setState({ webViewHeight: Number(event.nativeEvent.data) });
    Actions.ArticleWebView({
      data: { url: event.nativeEvent.data, isMain: true },
    });
  }

  // renderCategory(item) {
  //     return (
  //         <View style={[styles.bookingButton,
  //         {
  //             marginTop: AppUtils.isIphone ? hp(1) : hp(1),
  //             marginBottom: hp(.5),
  //             shadowColor: AppColors.blackColor,
  //             shadowOffset: { width: 0, height: 0 },
  //             shadowOpacity: .5,
  //             shadowRadius: .5,
  //             elevation: .5,
  //         }]}>
  //             <TouchableOpacity
  //                 activeOpacity={.7}
  //                 testId={item.item.id}
  //                 onPress={() => this.categoryClick(item.item.id)}
  //                 >
  //                 <View
  //                     style={[styles.bookDoctorAppointment, { backgroundColor: item.item.colors }]}>
  //                     <View style={{ flexDirection: 'row' }}>
  //                         <Text numberOfLines={3} style={[styles.medicalTransport, {lineHeight: this.state.selectedLang == 'KM' ? hp(2.5) : hp(2.3)}]}>{item.item.title}</Text>
  //                         <Image resizeMode={'cover'} style={{ height: wp(14), width: wp(14) }}
  //                             source={item.item.icon} />
  //                     </View>

  //                     <Text numberOfLines={2}
  //                     style={[styles.medicalTransportSubText, {lineHeight: this.state.selectedLang == 'KM' ? hp(2.3) : hp(2.3)}]}>{item.item.subTitle}</Text>
  //                 </View>
  //             </TouchableOpacity>
  //         </View>

  //     )
  // }
  updatePlanSelected = (index, itemIs) => {
    let plan = this.state.vitalSubscriptionPlan;

    plan.map((val, arrayIndex) => {
      if (arrayIndex === index) {
        //plan[arrayIndex].isActive = true
        plan[arrayIndex].selected = true;
      } else {
        plan[arrayIndex].selected = false;
        // plan[arrayIndex].isActive = false
      }
    });

    this.setState(
      {
        vitalSubscriptionPlan: plan,
        selectedItemIs: itemIs,
      },
      () => {
        AppUtils.console('----->>' + JSON.stringify(this.state.selectedItemIs));
      }
    );
    // this.state.selectedVitalPlan.push(this.state.vitalSubscriptionPlan);
  };

  renderItemPlan = ({ item, index }) => (
    <VitalCard
      title={item.subscriptionPlanName}
      itemIs={item}
      indexValue={index}
      symbol={item.currencySymbol}
      currency={item.price}
      data={this.state.vitalSubscriptionPlan}
      selected={item.selected}
      updatePlan={(indexvall) => this.updatePlanSelected(indexvall, item)}
    />
  );

  async categoryClick(id) {
    const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER));
    const googleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
    const appleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.APPLE_USER_DATA));

    if (id === 'article') {
      Actions.Article();
      return;
    }
    if (!userDetails) {
      Alert.alert(
        '',
        strings('common.common.completeProfile'),
        [
          {
            text: strings('doctor.button.cancel'),
            onPress: () => {
              // Handle cancel action if needed
              console.log('Cancel pressed');
            },
            style: 'cancel',
          },
          {
            text: strings('doctor.button.completeProfileBtn'),
            onPress: () => {
              Actions.UserSignUp({ isNewUser: true, userDetail: googleUserData || appleUserData });
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      this.handleAction(id);
    }
  }

  handleAction = (id) => {
    console.log(id, 'id');
    switch (id) {
      case 'doctorBooking':
        this.bookDoctor();
        break;
      case 'videoConsult':
        Actions.QuickRequest({ consultType: 'video' });
        break;
      case 'instantOnlineConsult':
        Actions.InstantConsult({ userCountryCode: this.state.userCountryCode });
        break;
      case 'houseCall':
        Actions.QuickRequest({ consultType: 'house' });
        break;
      case 'careGiver':
        this.openCaregiver();
        break;
      case 'medicalTransport':
        this.openMyCareWagon();
        break;
      case 'healthCare':
        this.openMedicalEquipment();
        break;
      case 'vitalSign':
        this.getSubcriptionDetails();
        break;
      default:
        // Handle the case where id doesn't match any known action

        break;
    }
  };

  updatefirstPlanModal = () => {
    // this.setState({
    //     //  subcribePlan: !this.state.subcribePlan,
    //     firstUser: !this.state.firstUser,
    //     planModal: !this.state.planModal
    // })
    this.setState(
      {
        firstUser: !this.state.firstUser,
      },
      () =>
        Actions.VitalOrderSummary({
          openPlan: true,
          supportedOrientations: this.props.supportedOrientations,
        })
    );
  };

  updatePlanModal = () => {
    let updateNewDate = new Date(this.state.planEndTime);
    datestring = '';
    let datestring = updateNewDate.getFullYear() + '-' + (updateNewDate.getMonth() + 1) + '-' + (updateNewDate.getDate() + 1);
    this.setState({ sDate: datestring });
    let planDetails = this.state.vitalSubscriptionPlan;
    let startFrom = this.state.startPlanOption;
    let selectedObj = '';
    planDetails.map((plan, arrayIndex) => {
      if (plan._id === this.state.subscriptionenabled['vitalSubscriptionPlanId']) {
        planDetails[arrayIndex].selected = true;
        selectedObj = plan;
      } else {
        planDetails[arrayIndex].selected = false;
      }
    });
    startFrom.push({ option: this.state.planEndsONNextDate, isSelected: true });

    this.setState({
      vitalSubscriptionPlan: planDetails,
      startPlanOption: startFrom,
      planModal: !this.state.planModal,
      hideTodayTomorrow: true,
      selectedPlanTime: this.state.planEndsON,
      selectedItemIs: selectedObj,
    });
  };

  _renderModalContent = () => (
    <BottomUp
      isVisible={this.state.planModal}
      onBackdropPress={() =>
        this.setState({
          planModal: !this.state.planModal,
        })
      }
      onBackButtonPress={() =>
        this.setState({
          planModal: !this.state.planModal,
        })
      }
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      <View
        style={{
          backgroundColor: AppColors.whiteColor,
          paddingTop: wp('5'),
          justifyContent: 'center',
          alignItems: 'center',
          borderTopRightRadius: wp(8),
          borderTopLeftRadius: wp(8),
          borderColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.topBar}></View>
          <Text allowFontScaling={false} style={styles.vitalHeadingText}>
            {strings('common.common.selectVital')}
          </Text>
          <View style={styles.dividerVital}></View>
        </View>

        <View
          style={{
            height: hp('15%'),
            width: wp('90%'),
            flexDirection: 'row',
          }}
        >
          <FlatList
            data={this.state.vitalSubscriptionPlan}
            renderItem={(item, index) => this.renderItemPlan(item, index)}
            keyExtractor={(item) => item._id}
            numColumns={3}
          />
        </View>
        <View
          style={{
            width: wp(90),
            marginTop: hp(3),
            height: hp(6),
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginLeft: wp(5),
          }}
        >
          <Text allowFontScaling={false} style={[styles.vitalHeadingText, { color: AppColors.blackColor }]}>
            {strings('common.common.whenStartPlan')}
          </Text>
        </View>

        <View
          style={{
            width: wp(90),
            marginBottom: hp('5'),
            height: hp(6),
          }}
        >
          <FlatList
            data={this.state.startPlanOption}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(item) => this._render_Details(item, this.state.startPlanOption.length)}
            numColumns={4}
            extraData={this.state}
          />
        </View>

        {this.state.showDate ? (
          <DateTimePicker
            value={new Date(this.state.dateToday)}
            style={{ backgroundColor: AppColors.whiteColor }}
            display="spinner"
            mode="date"
            maximumDate={minDatee}
            minimumDate={this.state.minDate}
            onChange={(event, date) => {
              // AppUtils.console('qqqsqsqdq'+date)
              var month = date.getUTCMonth() + 1; //months from 1-12
              var day = date.getUTCDate();
              var year = date.getUTCFullYear();

              var newdate = year + '-' + month + '-' + day;

              if (event.type === 'set') {
                this.setState({
                  dateToday: date,
                  showDate: false,
                  dateSelectedIs: newdate,
                });
              } else {
                this.setState({ showDate: false });
              }
            }}
          />
        ) : null}
        <TouchableOpacity onPress={() => this.subscriptionDetails()}>
          <View
            style={{
              backgroundColor: AppColors.colorHeadings,
              marginBottom: hp('5'),
              alignSelf: 'flex-end',
              borderRadius: wp(2),
              borderColor: 'rgba(0, 0, 0, 0.1)',
              width: wp(90),
              height: hp(6),
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                alignSelf: 'center',
                color: AppColors.whiteColor,
                fontFamily: AppStyles.fontFamilyDemi,
              }}
            >
              {strings('doctor.button.continue')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </BottomUp>
  );

  subscriptionDetails = () => {
    this.setState({ planModal: !this.state.planModal });

    // this.state.selectedVitalPlan.map((e)=>{
    //     AppUtils.console('eeeee-->'+e)
    // })
    if (this.state.selectedPlanTime == '' || this.state.selectedItemIs == '') {
      if (this.state.selectedItemIs == '') {
        Actions.VitalOrderSummary({
          date: moment().format('YYYY-MM-DD'),
          details: this.state.vitalSubscriptionPlan[0],
        });
      } else {
        Actions.VitalOrderSummary({
          date: moment().format('YYYY-MM-DD'),
          details: this.state.selectedItemIs,
        });
      }
    } else if (this.state.selectedPlanTime == 'Today') {
      Actions.VitalOrderSummary({
        date: moment().format('YYYY-MM-DD'),
        details: this.state.selectedItemIs,
      });
      //this.state.selectedVitalPlan.push(moment().format('YYYY-MM-DD'));
    } else if (this.state.selectedPlanTime == 'Tomorrow') {
      Actions.VitalOrderSummary({
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        details: this.state.selectedItemIs,
      });
      //this.state.selectedVitalPlan.push(moment().add(1, 'days').format('YYYY-MM-DD'));
    } else if (this.state.selectedPlanTime == 'Select Date') {
      Actions.VitalOrderSummary({
        date: this.state.sDate,
        details: this.state.selectedItemIs,
      });
      AppUtils.console('qqqqq--4');

      //this.state.selectedVitalPlan.push(this.state.sDate);
    } else if (this.state.selectedPlanTime == this.state.planEndsON) {
      Actions.VitalOrderSummary({
        date: moment(this.state.planEndTime).add(1, 'days').format('YYYY-MM-DD'),
        details: this.state.selectedItemIs,
      });
      AppUtils.console('qqqqq--5');
      //this.state.selectedVitalPlan.push(moment(this.state.planEndTime).add(1, 'days').format('YYYY-MM-DD'));
    }
    //else if(this.state.selectedItemIs != '' ){
    //     Actions.VitalOrderSummary({  date:moment().format('YYYY-MM-DD'), details: this.state.vitalSubscriptionPlan[0] });
    // }

    // this.state.selectedVitalPlan.push(this.state.selectedItemIs != '' ?
    //     this.state.selectedItemIs : this.state.vitalSubscriptionPlan[0]);

    // AppUtils.console("qqqqqqrrrrrrrrrrrssss-->" + JSON.stringify({ date:this.state.selectedVitalPlan[0], details: this.state.selectedItemIs }));
  };

  renewModal = () => {
    this.setState({
      showRenewModal: !this.state.showRenewModal,
    });
  };

  firstSubscription = () => {
    this.setState({
      subcribePlan: !this.state.subcribePlan,
    });
  };

  updateAdminContact = () => {
    this.setState({
      adminContact: !this.state.adminContact,
    });
  };

  startVital = () => {
    this.setState({
      showStartModal: !this.state.showStartModal,
    });
    //this.startVitalPlan()
  };

  startVitalPlan = async () => {
    try {
      let planData = {
        vitalSubscriptionPlanId: this.state.subscriptionenabled['vitalSubscriptionPlanId'],
        userVitalSubscriptionPlanId: this.state.subscriptionenabled['_id'],
      };
      this.setState({ isLoading: true });
      let futureSubscriptionPlan = await SHApiConnector.startSubscriptionPlan(planData);
      AppUtils.console('Response:::::', futureSubscriptionPlan);
      this.setState({ isLoading: false });
      if (futureSubscriptionPlan.data.status) {
        let futurePlanActivated = futureSubscriptionPlan.data.response;
        this.startVital();

        Alert.alert(
          ' ',
          strings('common.common.subscriptionEndsOn', {
            endOn: moment(futurePlanActivated['planEndsOn']).format(' DD MMM YYYY'),
          })
        );

        Actions.VitalDrawer();
      }
    } catch (e) {
      AppUtils.console('ResponseVitalSubscriptionerror:', e);
      this.setState({ isLoading: false });
    }
  };

  vitalRenewModal = () => {
    return (
      <Modal visible={this.state.showRenewModal} transparent={true} style={styles.renewContainer} animationType={'fade'}>
        <View style={styles.renewBox}>
          <View style={styles.innerContainer}>
            <TouchableOpacity style={styles.contentView} onPress={() => this.renewModal()}>
              <Image resizeMode="contain" style={styles.cancelstyle} source={require('../../../assets/images/close.png')} />
            </TouchableOpacity>
            <View style={styles.textView}>
              <Text style={styles.alertText}>
                {strings('common.common.hi')} {this.state.userName},
              </Text>
              <Text
                style={{
                  fontFamily: AppStrings.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {strings('common.common.subscriptionWithin', {
                  endDate: this.state.planEndsONDate,
                  renewDate: this.state.planEndsONNextDate,
                })}
              </Text>
            </View>

            {/* <TouchableOpacity
                            style={styles.planButton}
                            underlayColor='transparent'
                            onPress={() => this.renewModal()}>

                            <Text style={styles.planButtonText}>Renew Your Plan</Text>

                        </TouchableOpacity> */}
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: AppColors.colorHeadings,
                  flexDirection: 'row',
                  height: hp('5'),
                  width: wp('34%'),
                  margin: wp('5%'),
                  //marginBottom:hp(10),
                  borderRadius: hp('1'),
                  alignItems: 'flex-end',
                  justifyContent: 'center',

                  marginTop: hp('3'),
                }}
                underlayColor="transparent"
                onPress={() => {
                  this.setState(
                    {
                      showRenewModal: !this.state.showRenewModal,
                    },
                    () => {
                      Actions.VitalOrderSummary({ renewPlan: true });
                    }
                  );
                  //  this.updatePlanModal()
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {strings('common.common.renewPlan')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: AppColors.whiteColor,
                  borderColor: AppColors.colorHeadings,
                  flexDirection: 'row',
                  height: hp('5'),
                  width: wp('28%'),
                  //marginBottom:hp(10),
                  borderRadius: hp('1'),
                  borderWidth: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'center',

                  marginTop: hp('3'),
                }}
                underlayColor="transparent"
                onPress={() => Actions.VitalDrawer()}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.blackColor,
                    alignSelf: 'center',
                  }}
                >
                  {strings('doctor.button.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  otherCountrySubscribeModal = () => {
    return (
      <Modal visible={this.state.otherCountry} transparent={true} style={styles.renewContainer} animationType={'fade'}>
        <View style={styles.renewBox}>
          <View style={styles.innerContainer}>
            <TouchableOpacity
              style={styles.contentView}
              onPress={() => {
                this.setState({
                  otherCountry: !this.state.otherCountry,
                });
              }}
            >
              <Image resizeMode="contain" style={styles.cancelstyle} source={require('../../../assets/images/close.png')} />
            </TouchableOpacity>
            <View style={styles.textView}>
              <Text style={styles.alertText}>
                {strings('common.common.hi')} {this.state.userName},
              </Text>
              <Text
                style={{
                  fontFamily: AppStrings.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {strings('common.common.subscriptionWillExpire', {
                  time: this.state.timeExist,
                })}
              </Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <View style={{ width: wp(50) }}>
                <TouchableOpacity
                  onPress={() => Linking.openURL('mailto:' + 'support@myclnq.co' + '?subject=' + '\nVital Subscription : ' + 'Subscribe vital plan')}
                  style={{
                    width: wp(34),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    resizeMode={'contain'}
                    style={{
                      height: wp(6),
                      width: wp(6),
                      borderRadius: 100,
                      borderColor: AppColors.whiteColor,
                      borderWidth: 0,
                      marginLeft: wp(5),
                    }}
                    source={images.dashboardMail}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      color: AppColors.greyColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      justifyContent: 'center',
                      fontSize: hp(1.8),
                      width: wp(70),
                      marginLeft: wp(1),
                      marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                    }}
                  >
                    support@myclnq.co
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row' }} underlayColor="transparent" onPress={() => this.openDialScreen('+65 81893129')}>
                <Image
                  resizeMode={'contain'}
                  style={{
                    height: wp(6),
                    width: wp(6),
                    borderRadius: 100,
                    borderColor: AppColors.whiteColor,
                    borderWidth: 0,
                    marginLeft: wp(5),
                  }}
                  source={images.dashboardCall}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    color: AppColors.greyColor,
                    fontFamily: AppStyles.fontFamilyMedium,
                    justifyContent: 'center',
                    fontSize: hp(1.8),
                    marginLeft: wp(1),
                    width: wp(70),
                    marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0.5),
                  }}
                >
                  +65 81893129
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.planButton}
              underlayColor="transparent"
              onPress={() => {
                this.setState({ otherCountry: !this.state.otherCountry });
                Actions.VitalDrawer();
              }}
            >
              <Text style={styles.planButtonText}>{strings('doctor.button.continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  firstSubscribeModal = () => {
    return (
      <Modal visible={this.state.firstUser} transparent={true} style={styles.renewContainer} animationType={'fade'}>
        <View style={styles.renewBox}>
          <View style={styles.innerContainer}>
            <TouchableOpacity
              style={styles.contentView}
              onPress={() => {
                this.setState({
                  firstUser: !this.state.firstUser,
                });
              }}
            >
              <Image resizeMode="contain" style={styles.cancelstyle} source={require('../../../assets/images/close.png')} />
            </TouchableOpacity>
            <View style={styles.textView}>
              <Text style={styles.alertText}>
                {strings('common.common.hi')} {this.state.userName},
              </Text>
              <Text
                style={{
                  fontFamily: AppStrings.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {strings('common.common.subscribeForModule')}
              </Text>
            </View>

            <TouchableOpacity style={styles.planButton} underlayColor="transparent" onPress={() => this.updatefirstPlanModal()}>
              <Text style={styles.planButtonText}>{strings('common.common.subscribe')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  vitalplanSubscribeModal = () => {
    return (
      <Modal visible={this.state.adminContact} transparent={true} style={styles.renewContainer} animationType={'fade'}>
        <View style={styles.renewBox}>
          <View style={styles.adminInnerContainer}>
            <TouchableOpacity
              style={{
                width: wp(90),
                height: hp(4),
                alignSelf: 'flex-start',
                flexDirection: 'row-reverse',
                marginBottom: hp(4),
                marginTop: hp(2),
              }}
              onPress={() => this.updateAdminContact()}
            >
              <Image resizeMode="contain" style={styles.cancelstyle} source={require('../../../assets/images/close.png')} />
            </TouchableOpacity>
            <View style={styles.textView}>
              <Text style={styles.alertText}>
                {strings('common.common.hi')} {this.state.userName},
              </Text>
              <Text
                style={{
                  fontFamily: AppStrings.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {strings('common.common.notSubscribedForModule')}
              </Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <View style={{ width: wp(50) }}>
                <TouchableOpacity
                  onPress={() => Linking.openURL('mailto:' + 'support@myclnq.co' + '?subject=' + '\nVital Subscription : ' + 'Subscribe vital plan')}
                  style={{
                    width: wp(34),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    resizeMode={'contain'}
                    style={{
                      height: wp(6),
                      width: wp(6),
                      borderRadius: 100,
                      borderColor: AppColors.whiteColor,
                      borderWidth: 0,
                      marginLeft: wp(5),
                    }}
                    source={images.dashboardMail}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      color: AppColors.greyColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      justifyContent: 'center',
                      fontSize: hp(1.8),
                      width: wp(70),
                      marginLeft: wp(1),
                      marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                    }}
                  >
                    support@myclnq.co
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row' }} underlayColor="transparent" onPress={() => this.openDialScreen('+65-81893129')}>
                <Image
                  resizeMode={'contain'}
                  style={{
                    height: wp(6),
                    width: wp(6),
                    borderRadius: 100,
                    borderColor: AppColors.whiteColor,
                    borderWidth: 0,
                    marginLeft: wp(5),
                  }}
                  source={images.dashboardCall}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    color: AppColors.greyColor,
                    fontFamily: AppStyles.fontFamilyMedium,
                    justifyContent: 'center',
                    fontSize: hp(1.8),
                    marginLeft: wp(1),
                    width: wp(70),
                    marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0.5),
                  }}
                >
                  +65 81893129
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  openDialScreen(number) {
    if (Platform.OS === 'ios') {
      number = 'telprompt:${' + number + '}';
    } else {
      number = 'tel:${' + number + '}';
    }
    Linking.openURL(number);
  }

  vitalStartModal = () => {
    return (
      <Modal
        visible={this.state.showStartModal}
        transparent={true}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: AppColors.transparent,
        }}
        animationType={'fade'}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            flex: 1,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              height: hp('38%'),
              width: wp('90%'),
              borderRadius: wp(4),
              marginRight: hp('5%'),
              marginLeft: hp('5%'),
              marginTop: hp('3%'),
            }}
          >
            <TouchableOpacity
              style={{
                height: hp(6),
                width: wp(90),
                alignItems: 'flex-end',
              }}
              onPress={() => this.startVital()}
            >
              <Image
                resizeMode="contain"
                style={{
                  marginRight: wp(5),
                  marginTop: hp(3),
                  height: hp(3),
                  width: wp(4),
                }}
                source={require('../../../assets/images/close.png')}
              />
            </TouchableOpacity>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: hp('5'),
                marginLeft: hp('3%'),
                flexDirection: 'column',
                marginRight: hp('5%'),
                marginBottom: hp('2%'),
              }}
            >
              <Text style={styles.alertText}>
                {strings('common.common.hi')} {this.state.userName},
              </Text>
              <Text
                style={{
                  fontFamily: AppStrings.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {strings('common.common.subscriptionWillStartFrom', {
                  future: this.state.futureEnable,
                })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: AppColors.colorHeadings,
                  flexDirection: 'row',
                  height: hp('5'),
                  width: wp('28%'),
                  margin: wp('5%'),
                  //marginBottom:hp(10),
                  borderRadius: hp('1'),
                  alignItems: 'flex-end',
                  justifyContent: 'center',

                  marginTop: hp('3'),
                }}
                underlayColor="transparent"
                onPress={() => this.startVitalPlan()}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {strings('common.common.startPlan')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: AppColors.whiteColor,
                  borderColor: AppColors.colorHeadings,
                  flexDirection: 'row',
                  height: hp('5'),
                  width: wp('28%'),
                  //marginBottom:hp(10),
                  borderRadius: hp('1'),
                  borderWidth: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'center',

                  marginTop: hp('3'),
                }}
                underlayColor="transparent"
                onPress={() => this.startVital()}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.blackColor,
                    alignSelf: 'center',
                  }}
                >
                  {strings('doctor.button.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  _render_header() {
    return (
      <View
        style={{
          flexDirection: 'column',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 10 }}>
          <View
            style={{
              flexDirection: 'column',
              paddingLeft: wp(5),
              width: wp(70),
              alignItems: 'flex-start',
            }}
          >
            <Text
              style={{
                fontSize: wp(4.5),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.newTitle,
                marginTop: hp(1),
              }}
            >
              {strings('common.common.hey')} {this.state.userName}
            </Text>
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyDemi,
                fontSize: 15,
                marginTop: hp(0.5),
                color: AppColors.newSubTitle,
              }}
            >
              {strings('common.common.whatAreYouLooking')}
              {AppUtils.isProduction() ? '' : '\nStaging Build'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginRight: moderateScale(20) }}>
            <TouchableOpacity onPress={Actions.SearchDevice} style={{ alignItems: 'center' }}>
              <Image
                style={{
                  height: moderateScale(36),
                  width: moderateScale(36),
                  resizeMode: 'contain',
                }}
                source={images.earnCashback}
              />
              <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 9, color: AppColors.textDarkGray }}>Earn{'\n'}Cashback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: moderateScale(10), alignItems: 'center' }}>
              <Image
                style={{
                  height: moderateScale(36),
                  width: moderateScale(36),
                  resizeMode: 'contain',
                }}
                source={images.rewardSteps}
              />
              <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 9, color: AppColors.textDarkGray }}>10K{'\n'}Steps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {this.todayStatus()}

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={{ height: wp(60), width: Dimensions.get('screen').width - 40 }}>
            <Image style={{ resizeMode: 'contain', height: wp(55), width: '100%' }} source={require('../../../assets/images/offerImage.png')} />
          </View>
          <View style={{ height: wp(60), width: Dimensions.get('screen').width - 40 }}>
            <Image style={{ resizeMode: 'contain', height: wp(55), width: '100%' }} source={require('../../../assets/images/offerImage.png')} />
          </View>
          <View style={{ height: wp(60), width: Dimensions.get('screen').width - 40 }}>
            <Image style={{ resizeMode: 'contain', height: wp(55), width: '100%' }} source={require('../../../assets/images/offerImage.png')} />
          </View>
        </ScrollView>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20 }}>
            <Text style={{ fontSize: 16, lineHeight: 21, fontFamily: AppStyles.fontFamilyBold, color: 'black' }}>Membership Plans</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                onPress={() => Actions.MembershipScreen({ plans: this.state.membershipPlans })}
                style={{ fontSize: 12, lineHeight: 16, fontFamily: AppStyles.fontFamilyRegular }}
              >
                View more
              </Text>
              <AntDesign name="arrowright" size={10} />
            </View>
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {this?.state?.membershipPlans?.map((i) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  this.setState({ selectedSubscription: i.planName });
                }}
              >
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    height: wp(60),
                    width: Dimensions.get('screen').width / 2,
                    padding: 20,
                    borderRadius: 12,
                    margin: 10,
                    borderWidth: this.state.selectedSubscription == i.planName ? 1 : 0,
                    borderColor: this.state.selectedSubscription == i.planName ? '#FE4948' : null,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View
                      style={{
                        backgroundColor: '#ffeaeb',
                        width: wp(10),
                        height: wp(10),
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image style={{ resizeMode: 'contain', width: wp(7), height: wp(7) }} source={require('../../../assets/images/cash.png')} />
                    </View>

                    {i?._id == this.state?.userActivePlan ? (
                      <TouchableOpacity onPress={() => Actions.MembershipTransactionHistory()}>
                        <View
                          style={{
                            height: 25,
                            width: 90,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                            backgroundColor: '#FE4948',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 20,
                            marginTop: -20,
                          }}
                        >
                          <Image
                            style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }}
                            source={require('../../../assets/images/activePlanImg.png')}
                          />
                          <Text style={{ color: 'white', fontWeight: '600', fontSize: 10, lineHeight: 13, marginLeft: 5 }}>Active Plan</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Text style={{ color: '#FE4948', fontSize: 14, fontFamily: AppStyles.fontFamilyBold, marginTop: 5 }} numberOfLines={1}>
                    {i.planName}
                  </Text>
                  <Text style={{ fontSize: 16, fontFamily: AppStyles.fontFamilyRegular, marginTop: 5 }}>
                    ₹ <Text style={{ color: 'black', fontFamily: AppStyles.fontFamilyBold }}>{i?.amount}</Text>
                    <Text style={{ fontSize: 12, fontFamily: AppStyles.fontFamilyRegular, marginTop: 0 }}>
                      {i?.duration == 6 ? '/Half Yearly' : '/ yearly'}
                    </Text>
                  </Text>
                  <Text numberOfLines={2} style={{ fontSize: 12, fontFamily: AppStyles.fontFamilyRegular, marginTop: 5 }}>
                    {i.description}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: AppStyles.fontFamilyMedium, marginTop: 5 }}>Read more</Text>

                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({ selectedSubscription: i.planName });
                        Actions.MembershipOrderSummary({ plan: i });
                      }}
                      activeOpacity={1}
                      style={{
                        backgroundColor: this.state.selectedSubscription == i.planName ? '#FE4948' : '#ffeaeb',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        marginTop: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: this.state.selectedSubscription == i.planName ? 'white' : '#FE4948',
                          fontSize: 14,
                          lineHeight: 16,
                          fontFamily: AppStyles.fontFamilyMedium,
                          marginVertical: 5,
                          marginHorizontal: 15,
                        }}
                      >
                        Choose Plan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* {this.state.userCountryCode == '65' ||
        this.state.userCountryCode == '91' ||
        this.state.userCountryCode == '+91' ||
        this.state.userCountryCode == '60' ||
        this.state.userCountryCode == '62' ||
        this.state.userCountryCode == '971' ? (
          this.instantOnlineConsultation()
        ) : (
          <View />
        )} */}

        {this.instantOnlineConsultation()}
      </View>
    );
  }

  calculateProgress = (value, goalValue) => {
    const numValue = Number(goalValue);

    if (isNaN(numValue) || numValue === 0) {
      console.log('Invalid input or division by zero');
      return 0;
    }

    const actualValue = value / numValue;

    return actualValue;
  };

  convertMinutes(minutes) {
    // Check if the input is less than 60
    if (minutes < 60) {
      return `${minutes}`;
    }

    // Calculate hours and remaining minutes
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    // Format the output string
    let result = `${hours} H:`;
    if (remainingMinutes > 0) {
      result += `${remainingMinutes} M`;
    }

    return result;
  }

  todayStatus() {
    const { globalData } = this.context;

    let stepValue, stepValueClimb, sleepValueHrsMin;
    if (!this.state.isSmartWatchConnected) {
      //Anurag's Code//
      stepValue = this.calculateProgress(this.state.totalSteps, 7000);
      stepValueClimb = this.state.selectedActivities.includes(2)
        ? this.calculateProgress(parseInt(this.state.totalSteps / 1500), 1500)
        : this.state.selectedActivities.includes(3)
        ? this.calculateProgress(globalData.sleepGlobal, 600)
        : this.calculateProgress(globalData.screenTime, 600);
      sleepValueHrsMin = this.convertMinutes(globalData.sleepGlobal);
    } else {
      //SOHIL_CODE

      stepValue = this.calculateProgress(globalData.stepGlobal, 7000);
      stepValueClimb = this.state.selectedActivities.includes(2)
        ? this.calculateProgress(globalData.stepClimbGlobal, 1000)
        : this.state.selectedActivities.includes(3)
        ? this.calculateProgress(globalData.sleepGlobal, 600)
        : this.calculateProgress(globalData.screenTime, 600);
      sleepValueHrsMin = this.convertMinutes(globalData.sleepGlobal);
    }

    return (
      <TouchableOpacity
        onPress={() => {
          Actions.BodyBeatDash();
        }}
        activeOpacity={0.7}
      >
        <ElevatedView
          elevation={3}
          style={{
            width: wp(92),
            height: moderateScale(220),
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignSelf: 'center',
            backgroundColor: AppColors.whiteColor,
          }}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }} key={stepValueClimb}>
            <CustomRingProgress
              radius={100}
              strokeWidth={25}
              progress={Number(stepValue)}
              percentage={Math.round(Number(stepValue) * 100)}
              trackColor={AppColors.primaryColor}
            />
            <View style={{ position: 'absolute' }}>
              <CustomRingProgress
                radius={70}
                strokeWidth={25}
                progress={Number(stepValueClimb)}
                percentage={Math.round(Number(stepValueClimb) * 100)}
                trackColor={AppColors.redTrackColor}
              />
            </View>
            <View style={{ alignItems: 'center', marginTop: moderateScale(56), position: 'absolute' }}>
              <Image
                style={{
                  height: moderateScale(17),
                  width: moderateScale(18),
                  resizeMode: 'contain',
                }}
                source={images.stepLeg}
              />
              <Text style={{ textAlign: 'center', textTransform: 'uppercase', fontWeight: '700', fontSize: 10, color: AppColors.blackColor5 }}>
                TODAY
              </Text>
              <Text style={{ textAlign: 'center', fontWeight: '800', fontSize: 14, color: AppColors.blackColor4 }}>
                {this.state.isSmartWatchConnected ? globalData.stepGlobal : this.state.totalSteps}
              </Text>
              <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 12, color: AppColors.checkTickRed }}>Goal: 7000{'\n'}steps</Text>
            </View>
          </View>

          {/* right */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                style={{
                  height: moderateScale(32),
                  width: moderateScale(32),
                  resizeMode: 'contain',
                }}
                source={images.stepsDash}
              />
              <View style={{ marginLeft: moderateScale(8) }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>
                  {!this.state.isSmartWatchConnected
                    ? this.state.totalSteps
                    : this.state.selectedActivities.includes(1)
                    ? globalData.stepGlobal
                    : '1'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Steps</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(10) }}>
              <Image
                style={{
                  height: moderateScale(32),
                  width: moderateScale(32),
                  resizeMode: 'contain',
                }}
                source={images.climbDash}
              />
              <View style={{ marginLeft: moderateScale(8) }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>
                  {!this.state.isSmartWatchConnected
                    ? parseInt(this.state.totalSteps / 1500)
                    : this.state.selectedActivities.includes(2)
                    ? globalData.stepClimbGlobal
                    : '0'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Climbing</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(10) }}>
              <Image
                style={{
                  height: moderateScale(32),
                  width: moderateScale(32),
                  resizeMode: 'contain',
                }}
                source={images.sleepDash}
              />
              <View style={{ marginLeft: moderateScale(8) }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>
                  {this.state.selectedActivities.includes(3) ? sleepValueHrsMin : '0 Hrs'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Sleep</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(10) }}>
              <Image
                style={{
                  height: moderateScale(32),
                  width: moderateScale(32),
                  resizeMode: 'contain',
                }}
                source={images.screenDash}
              />
              <View style={{ marginLeft: moderateScale(8) }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>
                  {this.state.selectedActivities.includes(4) ? this.state.asyncScreenTime : '0 Hrs'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Screen</Text>
              </View>
            </View>
          </View>
        </ElevatedView>
      </TouchableOpacity>
    );
  }

  instantOnlineConsultation() {
    return (
      <TouchableOpacity
        style={{
          width: wp(92),
          alignSelf: 'center',
        }}
        onPress={() => this.categoryClick('instantOnlineConsult')}
      >
        <ElevatedView
          elevation={3}
          style={{
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 10,
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderRadius: 10,
            backgroundColor: AppColors.whiteColor,
          }}
        >
          <View style={{ alignItems: 'flex-start', flex: 1.8 }}>
            <Text
              style={{
                color: AppColors.blackColor,
                fontSize: 15,
                fontFamily: AppStyles.fontFamilyDemi,
              }}
            >
              {strings('common.waitingRoom.instantConsult')}
            </Text>
            <Text
              style={{
                marginTop: hp(1),
                color: AppColors.blackColor,
                fontSize: wp(3.2),
                fontFamily: AppStyles.fontFamilyMedium,
              }}
            >
              {strings('common.waitingRoom.doctorSpeak')}
            </Text>

            <ElevatedView
              elevation={6}
              style={{
                flexDirection: 'row',
                backgroundColor: AppColors.whiteChange,
                padding: hp(1),
                borderRadius: hp(1),
                marginTop: hp(1),
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Entypo
                name="video-camera"
                size={17}
                style={{
                  color: AppColors.blackColor,
                  paddingRight: hp(1),
                  marginRight: isRTL ? hp(1) : 0,
                }}
              />
              <Text
                style={{
                  alignContent: 'center',
                  fontFamily: AppStyles.fontFamilyMedium,
                  color: AppColors.blackColor,
                }}
              >
                {strings('common.waitingRoom.consultNow')}
              </Text>
            </ElevatedView>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <ElevatedView
              elevation={2}
              style={{
                height: hp(6.4),
                width: hp(6.4),
                justifyContent: 'center',
                borderRadius: 30,
                marginRight: hp(5),
                borderWidth: 2,
                borderColor: AppColors.greyBorder,
              }}
            >
              <Image
                style={{
                  height: hp(6.2),
                  width: hp(6.2),
                  alignSelf: 'center',
                  borderRadius: hp(20),
                  backgroundColor: AppColors.whiteColor,
                }}
                source={images.maleDoctor}
              />
            </ElevatedView>
            <ElevatedView
              elevation={2}
              style={{
                height: hp(6.4),
                width: hp(6.4),
                justifyContent: 'center',
                borderRadius: 30,
                backgroundColor: AppColors.lightPink2,
                position: 'absolute',
                borderWidth: 2,
                borderColor: AppColors.greyBorder,
                right: 0,
              }}
            >
              <Image
                style={{
                  height: hp(6.2),
                  width: hp(6.2),
                  alignSelf: 'center',
                  borderRadius: hp(20),
                }}
                source={images.femaleDoctor}
              />
            </ElevatedView>
          </View>
        </ElevatedView>
      </TouchableOpacity>
    );
  }

  getNumColumns(num) {
    return num % 3 ? 4 : 3;
  }

  render() {
    //  let planLength = this.state.startPlanOption.length;
    return (
      <View style={styles.mainScreenContainer} testID={'Main_Screen'}>
        {this.selectLanguage()}
        <ScrollView
        // contentContainerStyle={{
        //   flexGrow: 1,
        //   height: "100%",
        // }}
        >
          {this._render_header()}
          <View style={styles.selectOption}>
            <FlatList
              data={this.state.category}
              key={this.getNumColumns(this.state?.category.length)}
              numColumns={this.getNumColumns(this.state.category.length)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(item) => this.renderNewCategory(item, this.state.category.length)}
              extraData={this.state}
              style={{ width: wp(100) }}
            />
          </View>
          <View
            style={{
              flex: 1,
              height: 500,
              width: '100%',
            }}
          >
            <WebView
              source={{ uri: this.state.carouselUrl }}
              style={{ width: wp(100), alignSelf: 'flex-end' }}
              startInLoadingState={true}
              automaticallyAdjustContentInsets={true}
              androidHardwareAccelerationDisabled={true}
              domStorageEnabled={true}
              mixedContentMode={'never'}
              javaScriptEnabledAndroid={true}
              javaScriptEnabled={true}
              onMessage={this.onMessage.bind(this)}
            />
          </View>
        </ScrollView>
        {this.state.isLoading ? (
          <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        ) : null}

        {this.state.showDateSelector ? this.openDateSelector() : null}
        {this.vitalRenewModal()}
        {this.vitalStartModal()}
        {this._renderModalContent()}
        {this.vitalplanSubscribeModal()}
        {this.firstSubscribeModal()}
        {this.otherCountrySubscribeModal()}
        {this.languageList()}
      </View>
    );
  }

  languageList() {
    return (
      <Modal visible={this.state.showLangModal} transparent={true} style={styles.renewContainer} animationType={'fade'}>
        <TouchableOpacity onPress={() => this.setState({ showLangModal: false })} style={styles.renewLangBox}>
          <View
            style={{
              marginTop: hp(10),
              height: hp(35),
              marginRight: wp(25),
              borderRadius: wp(2),
              backgroundColor: AppColors.whiteColor,
            }}
          >
            <FlatList data={this.state.languageList} renderItem={(item) => this.renderLang(item)} keyExtractor={(item) => item._id} />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  renderLang(item) {
    return (
      <TouchableOpacity
        onPress={() => this.changeLang(item.item)}
        style={{
          backgroundColor: AppColors.whiteColor,
          justifyContent: 'center',
          marginLeft: wp(2),
          marginTop: wp(2),
          borderBottomWidth: item.index < this.state.languageList.length - 1 ? 1 : 0,
          borderColor: AppColors.backgroundGray,
          marginRight: wp(3),
        }}
      >
        <Text
          style={{
            textAlign: 'left',
            color: AppColors.blackColor,
            fontFamily: AppStyles.fontFamilyRegular,
            fontSize: wp(4),
          }}
        >
          {item.item.name}
        </Text>
        <Text
          style={{
            textAlign: 'left',
            marginBottom: wp(2),
            marginTop: hp(0.5),
            color: AppColors.textGray,
            fontFamily: AppStyles.fontFamilyRegular,
            fontSize: wp(3),
          }}
        >
          {item.item.subTitle}
        </Text>
      </TouchableOpacity>
    );
  }

  async changeLang(item) {
    let webUrl = 'https://myclnq.co/components/carousel/index.html';
    const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
    const prevLang = await AsyncStorage.getItem('lang');
    await AsyncStorage.setItem(AppStrings.contracts.LOCALE, JSON.stringify(item));
    await AsyncStorage.setItem('lang', item.value);
    I18n.locale = item.value;
    //console.log(item.value, 'itemValue');

    // if (item.value === 'ar') {
    //   I18nManager.forceRTL(true);
    //   RNRestart.restart()

    // } else {
    //   I18nManager.forceRTL(false);
    //   RNRestart.restart()
    // }
    // Check if the language has changed to or from Arabic
    if ((prevLang === 'ar' && item.value !== 'ar') || (prevLang !== 'ar' && item.value === 'ar')) {
      I18nManager.forceRTL(item.value === 'ar');
      RNRestart.restart();
    }

    this.setState({
      showLangModal: false,
      selectedLang: item.short,
      category: AppArray.getMainCategory(userDetails ? userDetails.countryCode : this.state.userCountryCode),
      carouselUrl: webUrl + '?lang=' + item.value,
    });
  }

  selectLanguage() {
    return (
      <View
        style={{
          flexDirection: 'row',
          marginTop: AppUtils.isIphone ? hp(5) : hp(2),
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            height: hp(5),
            width: wp(50),
            flexDirection: 'row',
            paddingLeft: wp(6),
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {/* <AntDesign name='logout' size={30} color={'red'}/> */}
          {/* <TouchableOpacity onPress={() => this.sureLogout()}>
            <Image
              resizeMode={'contain'}
              style={{
                height: wp(8),
                width: wp(8),
                tintColor: AppColors.primaryColor,
              }}
              source={require('../../../assets/images/logout_main.png')}
            />
          </TouchableOpacity> */}
          <Image
            resizeMode={'contain'}
            style={{
              height: wp(12),
              width: wp(12),
              tintColor: AppColors.primaryColor,
            }}
            source={require('../../../assets/images/myclnq-homescreen.png')}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: hp(5),
            width: wp(50),
            paddingRight: wp(7),
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Actions.Wallet({ userName: this.state.userName });
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: 22,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              marginRight: 10,
              height: wp(8),
              paddingLeft: 5,
              marginTop: 5,
            }}
          >
            <Image
              resizeMode={'contain'}
              style={{
                height: wp(5),
                width: wp(5),
                backgroundColor: '#FE4948',
                borderRadius: 12,
              }}
              source={require('../../../assets/images/mainStar.png')}
            />
            <Text style={{ marginRight: 20, color: 'black', marginLeft: 5, fontSize: 12, lineHeight: 16, fontFamily: AppStyles.fontFamilyBold }}>
              {this.state.walletResponse?.balance}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ showLangModal: true })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <SimpleLineIcons
              color={AppColors.blackColor}
              name="globe"
              size={25}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            />
            <Text
              style={{
                paddingTop: wp(0.8),
                marginRight: wp(1),
                marginLeft: wp(0.5),
                fontFamily: AppStyles.fontFamilyDemi,
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: wp(4.5),
              }}
            >
              {this.state.selectedLang || 'EN'}
            </Text>
            <AntDesign
              name="caretdown"
              size={12}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: wp(4),
            }}
            onPress={() => {
              this.checkGoogleUser('appointment');
            }}
          >
            <Image
              resizeMode={'contain'}
              style={{
                height: wp(6),
                width: wp(6),
                tintColor: AppColors.blackColor,
              }}
              source={require('../../../assets/images/RescheduleAppointment.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.checkGoogleUser('profile')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: wp(4),
            }}
          >
            {this.state.userImage ? (
              <CachedImage
                source={{ uri: AppUtils.handleNullImg(this.state.userImage) }}
                style={{
                  height: wp(6),
                  width: wp(6),
                  borderRadius: wp(3),
                  borderWidth: wp(0.1),
                  borderColor: AppColors.textGray,
                  alignSelf: 'center',
                }}
              />
            ) : (
              <Image
                source={this.state.avatarImage}
                style={{
                  height: wp(6),
                  width: wp(6),
                  borderRadius: wp(3),
                  borderWidth: wp(0.1),
                  borderColor: AppColors.textGray,
                  alignSelf: 'center',
                }}
              />
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => this.checkGoogleUser('settings')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: wp(4),
            }}
          >
            <Image
              source={this.state.settingsImage}
              style={{
                height: wp(6),
                width: wp(6),
                borderRadius: wp(3),
                borderWidth: wp(0.1),
                borderColor: AppColors.textGray,
                alignSelf: 'center',
              }}
            /> 
          {/* <Feather name="settings" size={25} color={AppColors.blackColor} /> */}
          {/* </TouchableOpacity> */}
        </View>
      </View>
    );
  }

  sureLogout() {
    Alert.alert('', strings('common.common.sureWantToLogout'), [
      { text: strings('common.common.logout'), onPress: () => this.logout() },
      { text: strings('doctor.button.cancel') },
    ]);
  }

  async logout() {
    // this.firebaseLogout();

    const accessToken = await AsyncStorage.getItem(AppStrings.fitBitToken.ACCESS_TOKEN);

    await revokeAccessToken(accessToken).catch((err) => {
      console.log(err, 'err');
    });

    // appleAuth.onCredentialRevoked(async () => {
    //   try {
    //     console.warn('If this function executes, User Credentials have been Revoked');
    //     // Additional error-prone logic can be added here
    //   } catch (error) {
    //     console.error(error);
    //   }
    // })

    SHApiConnector.logout(async function (err, stat) {
      console.log(err, stat, 'logggedout');
      await AsyncStorage.setItem(AppStrings.contracts.GOOGLE_USER_DATA, JSON.stringify({ googleUserData: null }));
      try {
        AppUtils.logoutNoNav();

        Actions.LoginOptions();
      } catch (err) {
        console.log(err, 'err here');
        AppUtils.logoutNoNav();
        Actions.LoginOptions();
      }
    });
  }

  async checkGoogleUser(cardName) {
    const googleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
    const appleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.APPLE_USER_DATA));
    const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER));
    if (!userDetails) {
      Alert.alert(
        '',
        strings('common.common.completeProfile'),
        [
          {
            text: strings('doctor.button.cancel'),
            onPress: () => {
              // Handle cancel action if needed
              console.log('Cancel pressed');
            },
            style: 'cancel',
          },
          {
            text: strings('doctor.button.completeProfileBtn'),
            onPress: () => {
              Actions.UserSignUp({ isNewUser: true, userDetail: googleUserData || appleUserData });
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      if (cardName === 'appointment') {
        Actions.HomeScreenDash({ isAppointmentUpdated: true });
      } else if (cardName === 'profile') {
        Actions.HomeScreenDash({ isProfileUpdated: true });
      } else {
        Actions.Settings();
      }
    }
  }

  _render_Details(item, dataLength) {
    let today = this.state.hideTodayTomorrow;
    AppUtils.console('called' + item.item.option + 'jujj' + dataLength);
    if (item.item.isSelected == undefined) {
      item.item.isSelected = false;
    }

    return (today && item.item.option == 'Today') || (today && item.item.option == 'Tomorrow') ? null : (
      <ElevatedView
        style={{
          width: item.item.option == 'Select Date' ? wp(30) : wp(22),
          height: hp(6),
          backgroundColor: item.item.isSelected ? AppColors.primaryColor : AppColors.whiteColor,
          borderColor: item.item.isSelected ? AppColors.primaryColor : AppColors.primaryGray,
          borderRadius: wp(1),
          flexDirection: 'row',
          marginLeft: item.item.option == 'Today' || (today && item.item.option == 'Tomorrow') ? wp(0) : wp(5),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
        }}
      >
        <TouchableOpacity
          style={{
            alignSelf: 'center',
          }}
          onPress={() => this.startPlanFrom(item, dataLength, item.item.option)}
          underlayColor="transparent"
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}
          >
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: 12,
                color: item.item.isSelected ? AppColors.whiteColor : AppColors.primaryGray,
                textAlign: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            >
              {item.item.option == 'Select Date' ? this.state.sDate : item.item.option}
            </Text>
            {item.item.option == 'Select Date' ? (
              <Image
                resizeMode={'cover'}
                style={{
                  height: wp(3),
                  width: wp(2),
                  tintColor: item.item.isSelected ? AppColors.whiteColor : AppColors.primaryGray,
                  marginLeft: wp(4),
                }}
                source={require('../../../assets/images/drop_black.png')}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      </ElevatedView>
    );
  }

  async openMyCareWagon() {
    try {
      var wagonStatus = await AsyncStorage.getItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE);
      wagonStatus = JSON.parse(wagonStatus);
      if (wagonStatus) {
        if (wagonStatus.isWagonSearchActive) {
          let bookingData = await AsyncStorage.getItem(AppStrings.wagonSearch.BOOKING_DATA);
          bookingData = JSON.parse(bookingData);
          Actions.SearchingVehicle(bookingData);
        } else {
          Actions.MyCareWagonDash();
        }
      } else {
        Actions.MyCareWagonDash();
      }
    } catch (e) {
      AppUtils.console('WagonCrash', e);
    }
  }

  async openMedicalEquipment() {
    Actions.drawer();
  }

  async openCaregiver() {
    Actions.caregiverTab();
  }
}

export default Main;

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
    width: wp(100),
    flexDirection: 'column',
    alignItems: 'center',
  },
  clnqLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    // marginTop: (AppUtils.isX) ? hp(5) : hp(5)
  },
  selectOption: {
    elevation: 5,
    marginVertical: hp(2),
  },
  bookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: wp(45),
  },
  bookingNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginLeft: wp(4),
    position: 'relative',
  },
  bookDoctorAppointment: {
    paddingBottom: hp(2),
    height: hp(17),
    width: wp(41),
    borderRadius: 7,
    borderWidth: 0,
    elevation: 2,
  },

  cardView: {
    height: AppUtils.isIphone ? 115 : 130,
    borderRadius: 10,
    borderWidth: 0,
    elevation: 10,
    marginBottom: hp(2),
  },
  medicalTransport: {
    marginLeft: wp(2),
    fontSize: wp(3.2),
    color: AppColors.newTitle,
    width: wp(25),
    alignItems: 'center',
    marginTop: hp(2),
    lineHeight: hp(1.8),
    fontFamily: AppStyles.fontFamilyDemi,
  },
  cardTitleView: {
    justifyContent: 'center',
  },
  cardTitleLongText: {
    flex: 1,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: wp(2.9),
    color: AppColors.newTitle,
    width: wp(24),
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: hp(0.8),
    lineHeight: hp(1.5),
    fontFamily: AppStyles.fontFamilyDemi,
  },

  medicalTransportSubText: {
    marginLeft: wp(2),
    fontSize: wp(2),
    marginTop: hp(2),
    marginRight: wp(2),
    color: AppColors.newSubTitle,
    lineHeight: hp(1.8),
    fontFamily: AppStyles.fontFamilyMedium,
  },
  bookImages: { height: hp(7), width: wp(7), alignSelf: 'center' },
  bookView: { flexDirection: 'row', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    width: wp(25),
    height: hp(1),
    borderRadius: hp(2),
    backgroundColor: AppColors.greyBorder,
    marginBottom: hp(3),
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  vitalHeadingText: {
    fontFamily: AppStyles.fontFamilyDemi,
    fontSize: 15,
    color: AppColors.black,
    marginBottom: hp(3),
  },
  dividerVital: {
    width: wp('100%'),
    height: hp(0.2),
    flexDirection: 'row',
    backgroundColor: AppColors.greyBorder,
    marginBottom: hp(3),
  },
  renewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.transparent,
  },
  renewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.transparent,
    flex: 1,
  },
  renewLangBox: {
    alignItems: 'flex-end',
    backgroundColor: AppColors.transparent,
    flex: 1,
  },
  innerContainer: {
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: hp('38%'),
    width: wp('90%'),
    borderRadius: wp(4),
    marginRight: hp('5%'),
    marginLeft: hp('5%'),
    marginTop: hp('3%'),
  },
  adminInnerContainer: {
    backgroundColor: '#FFFFFF',
    height: hp('38%'),
    width: wp('90%'),
    borderRadius: wp(4),
    marginRight: hp('5%'),
    marginLeft: hp('5%'),
    marginTop: hp('3%'),
  },
  contentView: { flex: 0.5, alignItems: 'flex-end' },
  cancelstyle: {
    marginRight: wp(5),
    height: hp(3),
    width: wp(4),
  },
  textView: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: hp('3%'),
    flexDirection: 'column',
    marginRight: hp('5%'),
  },
  planButton: {
    backgroundColor: AppColors.colorHeadings,
    flexDirection: 'row',
    height: hp('7'),
    width: wp('35%'),
    margin: wp('5%'),
    //marginBottom:hp(10),
    borderRadius: hp('1'),
    alignItems: 'flex-end',
    justifyContent: 'center',

    marginTop: hp('3'),
  },
  planButtonText: {
    fontSize: 13,
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.whiteColor,
    alignSelf: 'center',
  },
  alertText: {
    fontFamily: AppStyles.fontFamilyDemi,
    color: AppColors.blackColor,
    fontSize: 15,
  },
});
