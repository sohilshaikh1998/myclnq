import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, NativeModules, NativeEventEmitter, ScrollView, Platform } from 'react-native';
import { moderateScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import images from '../../utils/images';
import * as Progress from 'react-native-progress';
import { AppStyles } from '../../shared/AppStyles';
import { Switch } from 'react-native-switch';
import Tooltip from 'react-native-walkthrough-tooltip';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import { GlobalContext } from '../../GlobalContext';

//SOHIL_CODE

const { CRPBluetoothModule } = NativeModules;
const eventEmitter = Platform.OS == 'ios' ? null : new NativeEventEmitter(CRPBluetoothModule);

const activityOptions = [
  {
    id: 1,
    progress: 0.5,
    title: 'Steps',
    text: 'Steps',
    value: '4678',
    img: images.stepsAct,
    trackColor: AppColors.primaryColor,
    tooltipTxt:
      'Lorem Ipsum is simple text of the printing & typsettings insdustry standard has been dummy Lorem Ipsum is simple text of the printing & typsettings insdustry standard has been dummy',
  },
  {
    id: 2,
    progress: 0.6,
    title: 'Steps',
    text: 'Floors Climbing',
    value: '2456',
    img: images.climbingAct,
    trackColor: AppColors.redTrackColor,
    tooltipTxt: 'Lorem Ipsum is simple text of the printing & typsettings insdustry standard has been dummy',
  },
  {
    id: 3,
    progress: 0.5,
    title: 'Hours',
    text: 'Sleep Hrs',
    value: '12.30',
    img: images.sleepHrAct,
    trackColor: AppColors.magenta,
    tooltipTxt: 'Lorem Ipsum is simple text of the printing & typsettings insdustry standard has been dummy',
  },
  {
    id: 4,
    progress: 0.3,
    title: 'Hours',
    text: 'Screen Time',
    value: '08.30',
    img: images.screenTimeAct,
    trackColor: AppColors.greenColor2,
    tooltipTxt: 'Lorem Ipsum is simple text of the printing & typsettings insdustry standard has been dummy',
  },
];
class SelectionActivity extends Component {
  static contextType = GlobalContext;
  constructor(props) {
    super(props);
    const switchStates = activityOptions.reduce((acc, item) => {
      acc[item.id] = item.isEnabled || false;
      return acc;
    }, {});

    this.state = {
      isEnabled: false,
      isModalVisible: false,
      toolTipVisible: null,
      toggled: false,
      switchStates,
      deviceId: props?.deviceId,
      selectedBox: [1],
      infoText: false,
      callingNativeConnection: true,
      selectedDeviceNameFromAsync: '',

      heartRate: 0,
      oxygenLevel: 0,
      temperature: 0,
      running: 0,
      walking: 0,
      climbingSteps: 0,
      sleepData: 0,
      isLoading: true,
      ScreenTime: 0,

      stepChangeSubscription: null,
      sleepChangeSubscription: null,
      heartRateChangeSubscription: null,
      bloodOxygenChangeSubscription: null,
      tempChangeSubscription: null,
      TrainingChangeSubscription: null,
      TrainingChangeSubscription1: null,
      heartRateChangeSubscriptionLastDynamic: null,
    };

    this.timerInterval = null;
  }

  componentDidMount() {
    this.initFunc();
    this.toggleSwitch(1);
    this.handleAPi();
    this.timerInterval = setInterval(() => {
      this.handleAPi();
    }, 180000);
  }

  safeParse = (data, fallback) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return fallback;
    }
  };

  initFunc = async () => {
    const deviceId1 = await AsyncStorage.getItem('deviceId');
    const stepsAsync1 = await AsyncStorage.getItem('steps');
    const sleepAsync1 = await AsyncStorage.getItem('sleep');
    const heart_rateAsync1 = await AsyncStorage.getItem('heart_rate');
    const blood_oxygenAsync1 = await AsyncStorage.getItem('blood_oxygen');
    const tempAsync1 = await AsyncStorage.getItem('temp');
    const selectedDeviceNameFromAsync = await AsyncStorage.getItem('selectedDeviceName');

    this.setState({
      selectedDeviceNameFromAsync: selectedDeviceNameFromAsync,
    });

    try {
      const storedActivities = await AsyncStorage.getItem('selectedActivities');
      const selectedActivities = storedActivities ? JSON.parse(storedActivities) : [1];
      this.setState({
        selectedBox: [...selectedActivities],
      });
    } catch (error) {
      console.warn('Failed to load selected activities:', error);
    }

    const deviceId = deviceId1;
    const stepsAsync = this.safeParse(stepsAsync1, 0);
    const sleepAsync = this.safeParse(sleepAsync1, 0);
    const heart_rateAsync = this.safeParse(heart_rateAsync1, 0);
    const blood_oxygenAsync = this.safeParse(blood_oxygenAsync1, 0);
    const tempAsync = this.safeParse(tempAsync1, 0);

    this.setState({
      heartRate: heart_rateAsync ? heart_rateAsync : 0,
      oxygenLevel: blood_oxygenAsync ? blood_oxygenAsync : 0,
      temperature: tempAsync ? tempAsync : 0,
      climbingSteps: stepsAsync ? stepsAsync : 0,
      sleepData: sleepAsync ? sleepAsync : 0,
      deviceId: deviceId,
    });

    if (deviceId) {
      this.connectToDeviceNative(deviceId || this.state.deviceId);
    }
  };

  connectToDeviceNative = async (device) => {
    if (Platform.OS == 'android') {
      try {
        console.log('in connect to device ', device);
        await AsyncStorage.setItem('deviceId', device);

        const result = await CRPBluetoothModule.connectToDevice(device, this.state.selectedDeviceNameFromAsync);
        console.log('selection result', JSON.stringify(result));

        this.listeners(device);
      } catch (error) {
        console.error(error);
      }
    }
  };

  listeners = (deviceId) => {
    console.log('in listeners', deviceId, this.state.callingNativeConnection);

    const subscriptionStep = eventEmitter.addListener('onStepChange', this.handleStepChange);
    const subscriptionSleep = eventEmitter.addListener('onSleepChange', this.handleSleepChange);

    const subscriptionHeartRate = eventEmitter.addListener('onOnceMeasureComplete', this.handleHeartRateChange);
    const subscriptionHeartRateLastDynamic = eventEmitter.addListener('onMeasureComplete', this.handleHeartRateChangeLastDynamic);
    const subscriptionOxygen = eventEmitter.addListener('onBloodOxygen', this.handleOxygenChange);
    const subscriptionTemp = eventEmitter.addListener('onMeasureTemp', this.handleTempChange);
    const subscriptionTraining = eventEmitter.addListener('onHistoryTrainingChange', this.handleTraining);
    const subscriptionTraining1 = eventEmitter.addListener('onTrainingChange', this.handleTraining1);

    this.setState({
      stepChangeSubscription: subscriptionStep,
      sleepChangeSubscription: subscriptionSleep,
      heartRateChangeSubscription: subscriptionHeartRate,
      bloodOxygenChangeSubscription: subscriptionOxygen,
      tempChangeSubscription: subscriptionTemp,
      TrainingChangeSubscription: subscriptionTraining,
      TrainingChangeSubscription1: subscriptionTraining1,
      heartRateChangeSubscriptionLastDynamic: subscriptionHeartRateLastDynamic,
    });
  };

  handleStepChange = async (event) => {
    console.log('console_2', event.steps);

    this.setState(
      {
        climbingSteps: event.steps,
      },
      () => {
        this.updateGlobalData();
      }
    );
    await AsyncStorage.setItem('steps', event.steps);
  };

  handleSleepChange = async (event) => {
    this.setState(
      {
        sleepData: event.sleep,
      },
      () => {
        this.updateGlobalData();
      }
    );

    await AsyncStorage.setItem('sleep', event.sleep);
  };

  handleHeartRateChange = async (event) => {
    console.log('console_4', event.heart_rate);
    this.setState(
      {
        heartRate: event.heart_rate,
      },
      () => {
        this.updateGlobalData();
      }
    );

    await AsyncStorage.setItem('heart_rate', event.heart_rate);
  };

  handleOxygenChange = async (event) => {
    console.log('console_5', event.blood_oxygen);
    this.setState(
      {
        oxygenLevel: event.blood_oxygen,
      },
      () => {
        this.updateGlobalData();
      }
    );
    await AsyncStorage.setItem('blood_oxygen', event.blood_oxygen);
  };

  handleTempChange = async (event) => {
    console.log('console_6', event.temp);
    this.setState(
      {
        temperature: event.temp,
      },
      () => {
        this.updateGlobalData();
      }
    );
    await AsyncStorage.setItem('temp', event.temp);
  };

  handleTraining = async (event) => {
    console.log('console_7', event);
  };

  handleTraining1 = async (event) => {
    console.log('console_8', event);
  };

  handleHeartRateChangeLastDynamic = async (event) => {
    return;
    console.log('console_9', event.heart_rate);
    this.setState({
      heartRate: event.heart_rate,
    });
    await AsyncStorage.setItem('heart_rate', event.heart_rate);
  };

  handleAPi = () => {
    console.log(this.state.selectedBox);
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    // Prepare base data
    const baseData = [
      { activityType: 'temperature', withDevice: false, activityCount: this.state.temperature },
      { activityType: 'heartrate', withDevice: false, activityCount: this.state.heartRate },
      { activityType: 'oxygen', withDevice: false, activityCount: this.state.oxygenLevel },
    ];

    // Add data based on selectedBox
    const selectedData = [];

    if (this.state.selectedBox.includes(1)) {
      selectedData.push({ activityType: 'steps', withDevice: false, activityCount: this.state.climbingSteps });
    }
    if (this.state.selectedBox.includes(2)) {
      selectedData.push({
        activityType: 'floor_climbing',
        withDevice: false,
        activityCount: this.state.climbingSteps > 1500 ? Math.round(this.state.climbingSteps / 1500) : 0,
      });
    }
    if (this.state.selectedBox.includes(3)) {
      selectedData.push({ activityType: 'sleep', withDevice: false, activityCount: this.state.sleepData });
    }
    if (this.state.selectedBox.includes(4)) {
      selectedData.push({ activityType: 'screen_time', withDevice: false, activityCount: this.state.ScreenTime });
    }

    // Combine base data and selected data
    const raw = JSON.stringify({
      data: [...baseData, ...selectedData],
    });

    console.log(JSON.stringify(raw));

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    fetch('http://54.251.192.85:3000/api/v1/activityTracker/save', requestOptions)
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

  toggleSwitch = (id) => {
    this.setState((prevState) => ({
      switchStates: {
        ...prevState.switchStates,
        [id]: !prevState.switchStates[id],
      },
    }));
  };
  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  onTooltipToggle = (id) => {
    this.setState({ toolTipVisible: id });
  };
  switch(val) {
    this.setState({ toggled: val });
  }

  handleBoxSelection = (boxId) => {
    this.setState((prevState) => {
      const { selectedBox } = prevState;
      if (selectedBox.includes(boxId)) {
        // If the box is already selected, remove it
        return { selectedBox: selectedBox.filter((id) => id !== boxId) };
      } else {
        // If the box is not selected, add it
        if (selectedBox.length < 2) {
          // If less than 2 boxes are selected, just add the new box
          return { selectedBox: [...selectedBox, boxId] };
        } else {
          // If 2 boxes are already selected, replace the last one
          return { selectedBox: [selectedBox[0], boxId] };
        }
      }
    });
  };

  updateGlobalData = () => {
    const { globalData, setGlobalData } = this.context;
    setGlobalData({
      ...globalData,
      stepGlobal: this.state.climbingSteps,
      sleepGlobal: this.state.sleepData,
      heartRateGlobal: this.state.heartRate,
      oxygenLevelGlobal: this.state.oxygenLevel,
      tempGlobal: this.state.temperature,
      stepClimbGlobal: this.state.climbingSteps > 1500 ? Math.round(this.state.climbingSteps / 1500) : 0,
    });
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: AppColors.lightGray,
        }}
      >
        <View>
          <ScrollView contentContainerStyle={{}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: wp(2) }}>
              <CardView
                dataValue={this.state.climbingSteps}
                state={this.state}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={1}
                onTooltipToggle={(id) => {
                  this.onTooltipToggle(id);
                }}
                selectedBox={this.state.selectedBox.includes(1)}
                img={images.stepsAct}
                toolTipText={'Monitor your daily steps to stay active and healthy.'}
                title={'Steps'}
                text={'Steps'}
                trackColor={AppColors.primaryColor}
              />
              <CardView
                dataValue={this.state.climbingSteps > 1500 ? Math.round(this.state.climbingSteps / 1500) : 0}
                state={this.state}
                onTooltipToggle={(id) => {
                  this.onTooltipToggle(id);
                }}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={2}
                toolTipText={'Keep count of stairs climbed to boost your fitness levels.'}
                selectedBox={this.state.selectedBox.includes(2)}
                img={images.climbingAct}
                title={'Steps'}
                text={'Floors Climbing'}
                trackColor={AppColors.redTrackColor}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: wp(2) }}>
              <CardView
                onTooltipToggle={(id) => {
                  this.onTooltipToggle(id);
                }}
                toolTipText={'Track your sleep patterns to improve your rest and overall health.'}
                dataValue={this.state.sleepData}
                state={this.state}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={3}
                selectedBox={this.state.selectedBox.includes(3)}
                img={images.sleepHrAct}
                title={'Hours'}
                text={'Sleep Hrs'}
                trackColor={AppColors.magenta}
              />
              <CardView
                onTooltipToggle={(id) => {
                  this.onTooltipToggle(id);
                }}
                toolTipText={'Record your screen activities for better app usage insights.'}
                dataValue={this.state.ScreenTime}
                state={this.state}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={4}
                selectedBox={this.state.selectedBox.includes(4)}
                img={images.screenTimeAct}
                title={'Hours'}
                text={'Screen Time'}
                trackColor={AppColors.greenColor2}
              />
            </View>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: wp(2) }}>
              <CardView
                dataValue={this.state.heartRate}
                state={this.state}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={5}
                selectedBox={this.state.selectedBox.includes(5)}
                img={images.stepsAct}
                title={'BPM'}
                text={'Heart Rate'}
                trackColor={AppColors.primaryColor}
              />
              <CardView
                dataValue={this.state.oxygenLevel}
                state={this.state}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={6}
                selectedBox={this.state.selectedBox.includes(6)}
                img={images.climbingAct}
                title={'SaO2'}
                text={'Oxygen Level'}
                trackColor={AppColors.redTrackColor}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: wp(2) }}>
              <CardView
                dataValue={convertMinutes(this.state.temperature)}
                state={this.state}
                toggleSwitch={(val) => {
                  this.handleBoxSelection(val);
                }}
                id={7}
                selectedBox={this.state.selectedBox.includes(7)}
                img={images.sleepHrAct}
                title={'C'}
                text={'Temperature'}
                trackColor={AppColors.magenta}
              />
            </View> */}
          </ScrollView>

          <View style={{ marginTop: hp(3) }}>
            <Text
              style={{
                color: AppColors.blackColor4,
                fontSize: 16,
                fontFamily: AppStyles.fontFamilyOpenSansSemiBold,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Select any two activities from above.
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',

              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: AppColors.blackColor4,
                fontSize: 16,
                fontFamily: AppStyles.fontFamilyOpenSansSemiBold,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Steps is selected by default.
            </Text>
            <Tooltip
              isVisible={this.state.infoText}
              content={
                <Text style={styles.tooltipText}>
                  {
                    'Whatever activities you select will be displayed on the dashboard. Easily monitor your progress and stay on top of your health goals.'
                  }
                </Text>
              }
              placement="center"
              onClose={() => {
                this.setState({
                  infoText: false,
                });
              }}
              containerStyle={styles.tooltipContainer}
              contentStyle={styles.tooltipContent}
              backgroundColor="transparent"
            >
              <TouchableOpacity
                style={{ marginLeft: moderateScale(3), marginTop: moderateScale(1) }}
                onPress={() => {
                  this.setState({
                    infoText: true,
                  });
                }}
              >
                <AntDesign
                  name="exclamationcircleo"
                  size={10}
                  style={{
                    color: this.state.infoText ? AppColors.primaryColor : AppColors.greyColor,
                  }}
                />
              </TouchableOpacity>
            </Tooltip>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.connectToDeviceNative(this.state.deviceId);
            }}
          >
            <Text
              style={{
                color: AppColors.blackColor4,
                fontSize: 16,
                fontFamily: AppStyles.fontFamilyOpenSansSemiBold,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: hp(5),
              }}
            >
              Tap Here to reconnect to watch to fetch latest data
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            height: moderateScale(52),
            backgroundColor: AppColors.buttonPrimarColor,
            borderRadius: 5,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: wp(90),
            marginBottom: hp(2),
            position: 'absolute',
            bottom: 0,
          }}
          onPress={async () => {
            if (this.state.selectedBox?.length == 2) {
              await AsyncStorage.setItem('selectedActivities', JSON.stringify(this.state.selectedBox));
              this.toggleModal();
            } else {
              alert('Please select any two activities. Steps is selected by default.');
            }
          }}
        >
          <Text style={{ color: AppColors.whiteChange, textTransform: 'uppercase', fontSize: 15, fontWeight: '600' }}>Continue</Text>
        </TouchableOpacity>

        <Modal visible={this.state.isModalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                style={{
                  height: moderateScale(119),
                  width: moderateScale(216),
                  resizeMode: 'contain',
                }}
                source={images.successSelect}
              />
              <Text
                style={{
                  fontSize: 20,
                  color: AppColors.blackColor4,
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontWeight: '700',
                  paddingBottom: moderateScale(5),
                  textAlign: 'center',
                  marginTop: hp(2),
                }}
              >
                Success for Selection Options!
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: AppColors.blackColor5,
                  fontFamily: AppStyles.fontFamilyMedium,
                  paddingBottom: moderateScale(5),
                  textAlign: 'center',
                  marginTop: hp(2),
                  width: wp(75),
                  lineHeight: hp(2),
                }}
              >
                You have successfully selected two activities. Now you can get the data graph on your dashboard, and by clicking on the dashboard
                graph card, you can view more information."
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(3), paddingBottom: moderateScale(5) }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: AppColors.buttonPrimarColor,
                    width: wp(70),
                    height: moderateScale(52),
                    borderRadius: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: moderateScale(6),
                  }}
                  //   onPress={this.toggleModal}
                  onPress={() => {
                    this.toggleModal();
                    Actions.MainScreen();
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: AppColors.whiteColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      textTransform: 'uppercase',
                    }}
                  >
                    Back to home
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const CardView = (props) => {
  const { toolTipVisible, switchStates } = props.state;

  const value1 = props.dataValue;
  if (props.id == 3) {
    console.log(value1);
  }

  const value2 = convertMinutes(props.dataValue);

  const goalValue = props.id == 1 ? 7000 : props.id == 3 ? 600 : props.id == 5 ? 120 : props.id == 6 ? 110 : props.id == 7 ? 100 : 1000;

  const calculateProgress = (value) => {
    const numValue = Number(value);

    if (isNaN(numValue) || numValue === 0) {
      console.log('Invalid input or division by zero');
      return 0;
    }

    const actualValue = value1 / numValue;
    return actualValue;
  };

  const actualValue = calculateProgress(goalValue);

  return (
    <View
      style={{
        backgroundColor: AppColors.whiteColor,
        width: moderateScale(168),
        height: moderateScale(210),
        borderRadius: 20,
        marginVertical: hp(1),
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', marginTop: moderateScale(10), justifyContent: 'space-between', marginHorizontal: moderateScale(10) }}>
        <Image
          style={{
            height: moderateScale(38),
            width: moderateScale(38),
            resizeMode: 'contain',
          }}
          source={props?.img}
        />

        {props.id == 1 ? null : (
          <Switch
            onValueChange={() => {
              props.toggleSwitch(props.id);
            }}
            value={props.selectedBox}
            disabled={false}
            renderActiveText={false}
            renderInActiveText={false}
            circleSize={moderateScale(18)}
            barHeight={moderateScale(25)}
            backgroundActive={AppColors.lightPink}
            backgroundInactive={AppColors.switchOffGray}
            // circleActiveColor={AppColors.primaryColor}
            circleActiveColor={AppColors.whiteColor}
            circleInActiveColor={AppColors.primaryGray}
            changeValueImmediately={true}
            innerCircleStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: 'transparent',
            }}
            switchLeftPx={2}
            switchRightPx={2}
            switchWidthMultiplier={2.5}
          />
        )}
      </View>
      <Progress.Circle
        size={moderateScale(100)}
        progress={actualValue}
        thickness={10}
        color={props.trackColor}
        unfilledColor={AppColors.unfilledGray}
        borderWidth={0}
        showsText={false}
        formatText={() => `test`}
        textStyle={styles.progressText}
        strokeCap={'round'}
        style={{ alignSelf: 'center', marginTop: hp(2), alignItems: 'center' }}
      >
        <View style={styles.circleTextContainer}>
          <Text style={styles.circleTitle}>{props?.title}</Text>
          <Text style={styles.circleSubText}>{props.id == 3 ? value2 : value1}</Text>
        </View>
      </Progress.Circle>

      <View
        style={{
          flexDirection: 'row',
          marginTop: hp(2),
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <Text style={{ fontSize: 15, color: AppColors.textDarkGray, fontWeight: '700', textAlign: 'center' }}>{props?.text} </Text>

        <Tooltip
          isVisible={props.id == toolTipVisible}
          content={<Text style={styles.tooltipText}>{props.toolTipText}</Text>}
          placement="center"
          onClose={() => props?.onTooltipToggle(null)}
          containerStyle={styles.tooltipContainer}
          contentStyle={styles.tooltipContent}
          backgroundColor="transparent"
        >
          <TouchableOpacity style={{ marginLeft: moderateScale(3), marginTop: moderateScale(1) }} onPress={() => props.onTooltipToggle(props.id)}>
            <AntDesign
              name="exclamationcircleo"
              size={10}
              style={{
                color: props.id == toolTipVisible ? AppColors.primaryColor : AppColors.greyColor,
              }}
            />
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  circleTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginLeft: moderateScale(28),
    marginTop: moderateScale(28),
  },
  circleTitle: {
    fontSize: 10,
    color: AppColors.blackColor5,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  circleSubText: {
    fontSize: 20,
    color: AppColors.blackColor4,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: AppStyles.fontFamilyRegular,
  },
  listContent: {
    paddingBottom: hp(1),
    alignSelf: 'center',
    marginTop: hp(4),
  },
  row: {
    justifyContent: 'space-between',
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
  },

  tooltipText: {
    color: AppColors.tooltipText,
    fontSize: 12,
  },
  tooltipContainer: {
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'yellow',
  },
  tooltipContent: {
    padding: 8, // Less padding inside the tooltip
    backgroundColor: AppColors.switchBackground,
    borderWidth: 1,
    borderColor: AppColors.primaryColor,
    width: moderateScale(211),
    borderRadius: 10,
  },
});

export default SelectionActivity;

function convertMinutes(minutes) {
  // Check if the input is less than 60
  if (minutes < 60) {
    return `${minutes}`;
  }

  // Calculate hours and remaining minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // Format the output string
  let result = `${hours}:`;
  if (remainingMinutes > 0) {
    result += `${remainingMinutes}`;
  }

  return result;
}

export const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    value === NaN ||
    value === '' ||
    value.length === 0 ||
    value === 0 ||
    value === '0' ||
    value === '0.0' ||
    !value ||
    value === 'null' ||
    Object.keys(value).length === 0 ||
    value === false
  );
};
