import React, { Component } from 'react';
import { Alert, TouchableHighlight, BackHandler, Image, Platform, Text, View, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppColors } from '../../shared/AppColors';
import { Actions } from 'react-native-router-flux';
import styles from '../../styles/SearchingVehicleStyles';
import Slider from 'react-native-slider';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppUtils } from '../../utils/AppUtils';
import moment from 'moment';
import { AppStrings } from '../../shared/AppStrings';
import AsyncStorage from '@react-native-community/async-storage';
import { strings } from '../../locales/i18n';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ProgressLoader from 'rn-progress-loader';

var timerId = null;

class SearchingVehicle extends Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Medical Transport Searching Vehicle');
    let time;
    if(AppUtils.isProduction()){
    time = moment(props.bookingData.requestedTime).add(15, 'minutes');
     }else{
        time = moment(props.bookingData.requestedTime).add(1, 'minutes');
    }
    this.state = {
      isLoading: false,
      timerInSecond: 900,
      maxTimeInSec: 900,
      slideTime: 0,
      scheduleRequestTime: time,
      time: '00:00 Min',
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.isRequestReceived) {
      this.clearTimer();
      this.getBookingStatus(true);
    }
  }

  componentDidMount() {
    if (this.props.isRequestReceived) {
      this.clearTimer();
      this.getBookingStatus(true);
    } else {
      this.startTimer();
      AsyncStorage.setItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE, JSON.stringify({ isWagonSearchActive: true }));
      AsyncStorage.setItem(AppStrings.wagonSearch.BOOKING_DATA, JSON.stringify({ bookingData: this.props.bookingData }));
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', () => {
          return true;
        });
      }
    }
  }

  startTimer() {
    this.clearTimer();
    timerId = setInterval(() => this.updateTime(), 1000);
  }

  clearTimer() {
    AppUtils.console('sdfsvdxv', timerId);
    timerId ? clearInterval(timerId) : null;
  }

  updateTime() {
    let self = this;
    AppUtils.console('dxcszfxvd', this.state.scheduleRequestTime);

    AppUtils.getTimeDifferenceFromTodayForTransport(this.state.scheduleRequestTime, function (hr, min, sec, days, isOver) {
      AppUtils.console('sdfvdxdv', hr, min, sec, days, isOver, self.state.scheduleRequestTime);
      let timerInSec = parseInt(min) * 60 + parseInt(sec);
      AppUtils.console('Sdfzs', timerInSec);
      self.setState(
        {
          time: min + ':' + sec + ' Min',
          timerInSecond: timerInSec,
          slideTime: 900 - timerInSec,
        },
        () => {
          if (isOver) {
            self.checkWagonStatus(true);
          } else if (self.state.slideTime % 20 == 0) {
            self.checkWagonStatus(false);
          }
        }
      );
    });
  }

  async checkWagonStatus(isTimerFinished) {
    isTimerFinished ? this.clearTimer() : null;
    let wagonStatus = await AsyncStorage.getItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE);
    wagonStatus = JSON.parse(wagonStatus);
    if (wagonStatus.isWagonSearchActive) {
      this.getBookingStatus(isTimerFinished);
    }
  }

  async getBookingStatus(isTimerFinished) {
    let bookingId = {
      bookingId: this.props.bookingData._id,
    };

    let response = await SHApiConnector.getTripDetails(bookingId);
    AppUtils.console('sdfxvdsxfs', response);
    if (response.data.data.bookingStatus === 'SCHEDULED') {
      this.clearBookingDataFromAsyncStorage();
      Actions.PickUpDetailsScreen({ wagonData: { trip: response.data.data } });
    } else {
      isTimerFinished ? this.goHomeOnceTimerOver() : null;
    }
  }

  goHome() {
    this.clearTimer();
    Actions.MyCareWagonDash();
  }

  goHomeOnceTimerOver() {
    console.log('CheckTimer: ', this.state.timerInSecond);
    if (this.state.timerInSecond <= 0) {
      this.clearTimer();
      this.clearBookingDataFromAsyncStorage();
      setTimeout(() => {
        Alert.alert('', strings('common.transport.vehicleNotAvailable'), [
          {
            text: strings('doctor.button.ok'),
            onPress: () => Actions.MyCareWagonDash(),
          },
        ]);
      }, 500);
    }
  }

  async clearBookingDataFromAsyncStorage() {
    this.clearTimer();
    await AsyncStorage.setItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE, JSON.stringify({ isWagonSearchActive: false }));
    await AsyncStorage.setItem(AppStrings.wagonSearch.BOOKING_DATA, JSON.stringify({ bookingData: {} }));
  }

  componentWillUnmount() {
    this.clearTimer();
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        // this.goHome();
        return true;
      });
    }
  }
  pressGoHome() {
    this.clearTimer();
    Actions.MainScreen();
  }

  async cancelAllRequests() {
    try {
      this.setState({ isLoading: true });
      const response = await SHApiConnector.cancelAllVehicleRequests();
      this.setState({ isLoading: false });
      if (response.data.status == 'success') {
        this.clearTimer();
        Actions.MyCareWagonDash();
      } else {
        alert('Something went wrong!');
      }
    } catch (e) {
      this.setState({ isLoading: false });
      alert('Something went wrong!');
    }
  }

  render() {
    return (
      <View style={styles.content}>
        <View style={styles.pickupScreenHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
            <Text style={styles.pickupDetails}> {'Searching'} </Text>
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => {
                this.pressGoHome();
              }}
            >
              <Image
                resizeMode={'contain'}
                style={{ height: hp(12), width: hp(12), alignSelf: 'center' }}
                source={require('../../../assets/images/dashboard/home.png')}
              />
            </TouchableHighlight>
          </View>
        </View>
        <View style={{ marginBottom: hp(3) }}>
          <Image
            resizeMode={'cover'}
            style={{ height: hp('25%'), width: wp(80), alignSelf: 'center' }}
            source={require('../../../assets/wagon/map_design.png')}
          />
        </View>
        {Platform.OS === 'ios' ? (
          <Slider
            value={this.state.slideTime}
            minimumValue={0}
            maximumValue={this.state.maxTimeInSec}
            style={{
              width: wp(80),
              backgroundColor: AppColors.whiteColor,
              alignSelf: 'center',
              height: 12,
              borderWidth: 1,
              borderColor: AppColors.whiteColor,
              borderRadius: 5,
            }}
            step={1}
            disabled={true}
            trackStyle={{ height: 10 }}
            minimumTrackTintColor={AppColors.whiteColor}
            maximumTrackTintColor={AppColors.primaryColor}
            onValueChange={(value) => AppUtils.console('asdcsdx', value)}
            thumbTintColor={'transparent'}
          />
        ) : (
          <Slider
            value={this.state.slideTime}
            disabled={true}
            minimumValue={0}
            maximumValue={this.state.maxTimeInSec}
            style={{
              width: wp(70),
              alignSelf: 'center',
              height: 7,
              borderColor: AppColors.whiteColor,
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: AppColors.whiteColor,
            }}
            step={1}
            minimumTrackTintColor={AppColors.whiteColor}
            maximumTrackTintColor={AppColors.primaryColor}
            onValueChange={(value) => AppUtils.console('asdcsdx', value)}
            thumbTintColor={'transparent'}
          />
        )}
        <Text style={[styles.yourCare, { fontSize: 12, marginTop: 10 }]}>
          {strings('common.transport.willUpdateWithIn', { time: this.state.time })}
        </Text>
        <View>
          <View style={{ marginTop: hp(5) }}>
            <Text style={styles.yourCare}>{strings('common.transport.serchingFor')}</Text>
            <Text style={styles.yourCare}>{strings('common.transport.youCare')}</Text>
            <Text style={styles.yourCare}>{strings('common.transport.wagon')}</Text>
          </View>
        </View>
        <View>
          <Image style={{ height: hp('25%') }} source={require('../../../assets/images/circuler_ambulance.png')} />
        </View>
        <TouchableOpacity onPress={() => this.cancelAllRequests()}>
          <View style={styles.buttonStyle}>
            <Text style={styles.textStyle}>Cancel Request</Text>
          </View>
        </TouchableOpacity>
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }
}

export default SearchingVehicle;
