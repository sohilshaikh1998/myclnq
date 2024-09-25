import React, { createContext, Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  NativeModules,
  NativeEventEmitter,
  ScrollView,
  Platform,
} from 'react-native';

const { CRPBluetoothModule } = NativeModules;
const eventEmitter = Platform.OS == 'ios' ? null : new NativeEventEmitter(CRPBluetoothModule);

export const GlobalContext = createContext();

export class GlobalProvider extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    globalData: {
      stepGlobal: 0,
      sleepGlobal: 0,
      heartRateGlobal: 0,
      oxygenLevelGlobal: 0,
      tempGlobal: 0,
      stepClimbGlobal: 0,
      screenTime: 0,
    },
    stepChangeSubscription: null,
    sleepChangeSubscription: null,
    heartRateChangeSubscription: null,
    bloodOxygenChangeSubscription: null,
    tempChangeSubscription: null,
    TrainingChangeSubscription: null,
    TrainingChangeSubscription1: null,
    heartRateChangeSubscriptionLastDynamic: null,
    callingNativeConnection: true,
    selectedDeviceNameFromAsync: '',
  };

  componentDidMount() {
    this.loadGlobalData();
  }

  loadGlobalData = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');

      const steps = await AsyncStorage.getItem('steps');
      const stepGlobal = steps ? JSON.parse(steps) : 0;
      const stepClimbGlobal = stepGlobal > 1500 ? Math.round(stepGlobal / 1500) : 0;
      const sleep = await AsyncStorage.getItem('sleep');
      const sleepGlobal = sleep ? JSON.parse(sleep) : 0;
      const heartRate = await AsyncStorage.getItem('heart_rate');
      const heartRateGlobal = heartRate ? JSON.parse(heartRate) : 0;
      const oxygenLevel = await AsyncStorage.getItem('blood_oxygen');
      const oxygenLevelGlobal = oxygenLevel ? JSON.parse(oxygenLevel) : 0;
      const tempGlobal = 0;
      const selectedDeviceNameFromAsync = await AsyncStorage.getItem('selectedDeviceName');

      this.setState({
        selectedDeviceNameFromAsync: selectedDeviceNameFromAsync,
      });

      this.setState((prevState) => ({
        globalData: {
          ...prevState.globalData,
          stepGlobal,
          sleepGlobal,
          heartRateGlobal,
          oxygenLevelGlobal,
          tempGlobal,
          stepClimbGlobal,
        },
      }));
      // console.log('from global', deviceId);
      // if (deviceId) {
      //   this.connectToDeviceNative(deviceId);
      // }
    } catch (error) {
      console.error('Failed to load steps from AsyncStorage', error);
    }
  };

  connectToDeviceNative = async (device) => {
    if (Platform.OS == 'android') {
      console.log('from global connectToDevice', device, this.state.callingNativeConnection);
      if (device && this.state.callingNativeConnection) {
        try {
          await AsyncStorage.setItem('deviceId', device);
          const result = await CRPBluetoothModule.connectToDevice(device, this.state.selectedDeviceNameFromAsync);
          console.log('global result', JSON.stringify(result));
          this.listeners(device);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  setGlobalData = (data) => {
    this.setState({ globalData: data });
  };

  listeners = (deviceId) => {
    console.log('in listeners global');
    if (deviceId && this.state.callingNativeConnection) {
      setTimeout(() => {
        this.connectToDeviceNative(deviceId);
      }, 5000);
    }
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

    this.setState({
      callingNativeConnection: false,
    });
    this.connectToDeviceNative(false);
    this.setState({ globalData: { ...this.state.globalData, stepGlobal: event.steps } });
    await AsyncStorage.setItem('steps', event.steps);
  };

  handleSleepChange = async (event) => {
    this.setState({ globalData: { ...this.state.globalData, sleepGlobal: event.sleep } });
    await AsyncStorage.setItem('sleep', event.sleep);
  };

  handleHeartRateChange = async (event) => {
    this.setState({ globalData: { ...this.state.globalData, heartRateGlobal: event.heart_rate } });
    await AsyncStorage.setItem('heart_rate', event.heart_rate);
  };

  handleOxygenChange = async (event) => {
    this.setState({ globalData: { ...this.state.globalData, oxygenLevelGlobal: event.blood_oxygen } });
    await AsyncStorage.setItem('blood_oxygen', event.blood_oxygen);
  };

  handleTempChange = async (event) => {
    this.setState({ globalData: { ...this.state.globalData, tempGlobal: event.temp } });
    await AsyncStorage.setItem('temp', event.temp);
  };

  render() {
    return (
      <GlobalContext.Provider
        value={{
          globalData: this.state.globalData,
          setGlobalData: this.setGlobalData,
          connectToDeviceNativeGlobal: this.connectToDeviceNative,
        }}
      >
        {this.props.children}
      </GlobalContext.Provider>
    );
  }
}
