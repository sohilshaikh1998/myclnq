import React, { Component } from 'react';
import { Alert, View, Text, StyleSheet, Animated, Easing, Image, AppState } from 'react-native';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import images from '../../utils/images';
import { strings } from '../../locales/i18n';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Actions } from 'react-native-router-flux';
import SHButtonDefault from '../../shared/SHButtonDefault';
import ElevatedView from 'react-native-elevated-view';
import { IndicatorViewPager } from 'react-native-best-viewpager';
import { AppStrings } from '../../shared/AppStrings';


class CountdownTimer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsRemaining: 780,
      remainingTime: '10',
      appState: AppState.currentState,
      backgroundTimestamp: null,
      ws:null
    };

    this.pulseAnimation1 = new Animated.Value(0.8);
    this.pulseAnimation2 = new Animated.Value(1.2);


    
    this.interval = null;
   
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    this.startTimer();
   const reqID={
    command:"createDocument",
    docId:this.props.requestId
   }
    //this.wsConncetion.send(JSON.stringify(reqID))
    let wsConncetion = new WebSocket(AppStrings.apiURL.baseWS);
    wsConncetion.onopen = () => {
      console.log('Connected to WebSocket server');
      wsConncetion.send(JSON.stringify(reqID))
     
    };
   
    wsConncetion.onmessage = (event)=>{
      const receivedMessage = JSON.parse(event.data);
     
      if (receivedMessage.command ==="updatedDocument") {
        this.clearIntervalAndSocket();
        Actions.DoctorAssigned({
          doctorInfo: receivedMessage.message,
          patientDetails: this.props.patientDetails,
        });
      }
    }
    wsConncetion.onerror = (error) => {
      console.error('WebSocket error:', error);
      alert("You've been disconnected due to inactivity. Please refresh to reconnect to the chat.");
    
    };

    wsConncetion.onclose = () => {
      console.log('WebSocket connection closed');
      };
    this.setState({ws:wsConncetion})  

    

    const pulseAnimationConfig = {
      toValue: 1.2,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    };

    Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseAnimation1, pulseAnimationConfig),
        Animated.timing(this.pulseAnimation1, { ...pulseAnimationConfig, toValue: 1 }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseAnimation2, pulseAnimationConfig),
        Animated.timing(this.pulseAnimation2, { ...pulseAnimationConfig, toValue: 1 }),
      ])
    ).start();

    if (this.state.secondsRemaining <= 0) {
      this.pulseAnimation1.stopAnimation();
      this.pulseAnimation2.stopAnimation();
    }
  }
 
  _handleAppStateChange = (nextAppState) => {
    console.log("_handleAppStateChange")
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'background') {
      this.setState({ backgroundTimestamp: new Date() });
    } else if (this.state.appState.match(/background/) && nextAppState === 'active' && this.state.backgroundTimestamp) {
      const currentTime = new Date();
      const backgroundTime = Math.floor((currentTime - this.state.backgroundTimestamp) / 1000);
      this.setState((prevState) => ({
        backgroundTimestamp: null,
        secondsRemaining: Math.max(prevState.secondsRemaining - backgroundTime, 0),
      }));
    }
    this.setState({ appState: nextAppState });
  };

  componentWillUnmount() {
    this.clearIntervalAndSocket();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.setState(
        (prevState) => ({
          secondsRemaining: prevState.secondsRemaining - 1,
        }),
        () => {
          this.checkTime();
        }
      );
    }, 1000);
  }

  checkTime() {
    const { secondsRemaining } = this.state;
   // console.log('CheckTime', secondsRemaining);
    if (secondsRemaining === 180) {
      clearInterval(this.interval);
      this.showAlertAfterTenMinutes();
    } else if (secondsRemaining > 660 && secondsRemaining <= 720) {
      this.setState({ remainingTime: '9' });
    } else if (secondsRemaining > 600 && secondsRemaining <= 660) {
      this.setState({ remainingTime: '8' });
    } else if (secondsRemaining > 540 && secondsRemaining <= 600) {
      this.setState({ remainingTime: '7' });
    } else if (secondsRemaining > 480 && secondsRemaining <= 540) {
      this.setState({ remainingTime: '6' });
    } else if (secondsRemaining > 420 && secondsRemaining <= 480) {
      this.setState({ remainingTime: '5' });
    } else if (secondsRemaining > 360 && secondsRemaining <= 420) {
      this.setState({ remainingTime: '4' });
    } else if ((secondsRemaining > 300 && secondsRemaining <= 360) || (secondsRemaining > 120 && secondsRemaining < 180)) {
      this.setState({ remainingTime: '3' });
    } else if ((secondsRemaining > 240 && secondsRemaining <= 300) || (secondsRemaining > 60 && secondsRemaining <= 120)) {
      this.setState({ remainingTime: '2' });
    } else if ((secondsRemaining >= 180 && secondsRemaining < 240) || (secondsRemaining > 1 && secondsRemaining < 60)) {
      this.setState({ remainingTime: '1' });
    } else if (secondsRemaining <= 1) {
      this.clearIntervalAndSocket();
      Actions.DoctorBusy();
    }
  }

  showAlertAfterTenMinutes() {
    Alert.alert(strings('common.waitingRoom.doctorsBusy'), strings('common.waitingRoom.wait3Min'), [
      {
        text: strings('common.waitingRoom.continue'),
        onPress: () => {
          this.startTimer();
        },
      },
      {
        text: strings('common.titles.cancelBooking'),
        onPress: () => {
          this.clearIntervalAndSocket();
          Actions.CancelBooking({
            requestId: this.props.requestId,
          });
        },
      },
    ]);
  }

  clearIntervalAndSocket() {
    clearInterval(this.interval);
    this.state.ws.close()
   // this.socket.disconnect();
    this.pulseAnimation1.stopAnimation();
    this.pulseAnimation2.stopAnimation();
    console.log("Socket disconnected")
  }

  confirmCancel() {
    Alert.alert(strings('common.titles.cancelBooking'), strings('common.waitingRoom.confirmCancel'), [
      {
        text: 'Yes',
        onPress: () => {
          this.clearIntervalAndSocket();
          Actions.CancelBooking({
            requestId: this.props.requestId,
          });
        },
      },
      {
        text: 'No',
        onPress: () => console.log('No Pressed'),
      },
    ]);
  }

  renderPulse(animatedValue, color) {
    const interpolatedScale = animatedValue.interpolate({
      inputRange: [1, 1.2],
      outputRange: [0.6, 0.8],
    });

    return (
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: color,
            transform: [{ scale: interpolatedScale }],
          },
        ]}
      />
    );
  }

  renderTimer() {
    return (
      <View style={styles.timerContainer}>
        {this.renderPulse(this.pulseAnimation1, AppColors.instantVideoTheme)}
        {this.renderPulse(this.pulseAnimation2, AppColors.primaryColor)}
        <Text style={styles.timerText}>{strings('common.waitingRoom.searching')}</Text>
      </View>
    );
  }

  renderCardContent(heading, image, description) {
    return (
      <ElevatedView
        elevation={4}
        style={{
          justifyContent: 'space-evenly',
          borderRadius: hp(2),
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <Text style={[styles.textCard, { color: AppColors.blackColor }]}>{heading}</Text>
        <Image style={styles.imageCard} resizeMode="cover" source={image} />
        <Text style={styles.textCard}>{description}</Text>
      </ElevatedView>
    );
  }

  cancelBooking() {
    return (
      <SHButtonDefault
        btnText={strings('common.titles.cancelBooking')}
        style={{ marginTop: hp(6), borderRadius: wp(2) }}
        btnTextColor={AppColors.whiteColor}
        btnPressBackground={AppColors.primaryColor}
        onBtnClick={() => this.confirmCancel()}
      />
    );
  }

  render() {
    const { remainingTime } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: AppColors.lightPink2 }}>
        <View style={styles.container1}></View>
        <View style={styles.container2}>
          {this.renderTimer()}
          <Text style={styles.textStyle}>
            {strings('common.waitingRoom.doctorWillbeAssigned')} {remainingTime}{' '}
            {remainingTime == '1' ? strings('common.waitingRoom.min') : strings('common.waitingRoom.mins')}!
          </Text>
        </View>
        <IndicatorViewPager autoPlayEnable={true} style={{ height: hp(45), width: wp(100) }}>
          {this.renderCardContent(strings('common.waitingRoom.ourServices'), images.walkThrough2, strings('common.waitingRoom.service1'))}
          {this.renderCardContent(strings('common.waitingRoom.ourServices'), images.walkThrough3, strings('common.waitingRoom.service2'))}
          {this.renderCardContent(strings('common.waitingRoom.ourServices'), images.nearbyClinic, strings('common.waitingRoom.service3'))}
          {this.renderCardContent(strings('common.waitingRoom.ourServices'), images.healthArticles, strings('common.waitingRoom.service4'))}
        </IndicatorViewPager>
        <View style={styles.container3}>{this.cancelBooking()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: AppColors.whiteColor,
  },
  container2: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  container3: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(5),
  },
  pulse: {
    width: 180,
    height: 180,
    borderRadius: 100,
    borderColor: AppColors.instantVideoTheme,
    borderWidth: 20,
    position: 'absolute',
    opacity: 0.6,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(15),
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.whiteColor,
  },
  textStyle: {
    width: wp(90),
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 16,
    marginBottom: hp(3),
    textAlign: 'center',
  },
  imageCard: {
    height: hp(35),
    width: wp(95),
    borderRadius: hp(2),
    alignSelf: 'center',
  },
  textCard: {
    color: AppColors.primaryColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(2),
    alignSelf: 'center',
    textAlign: 'center',
    justifyContent: 'center',
  },
});

export default CountdownTimer;
