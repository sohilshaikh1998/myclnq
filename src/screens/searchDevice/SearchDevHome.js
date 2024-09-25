import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, PermissionsAndroid } from 'react-native';
import { AppColors } from '../../shared/AppColors';
import images from '../../utils/images';
import { moderateScale } from '../../utils/Scaling';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CheckBox from 'react-native-check-box';
import Feather from 'react-native-vector-icons/Feather';
import * as Progress from 'react-native-progress';
import { AppStyles } from '../../shared/AppStyles';
import { Actions } from 'react-native-router-flux';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-community/async-storage';
import LottieView from 'lottie-react-native';
import { GlobalContext } from '../../GlobalContext';

//SOHIL_CODE

class SearchDevHome extends Component {
  static contextType = GlobalContext;
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
      checkedItems: {},
      selectedDeviceId: null,
      BTDevices: [],
      isModalVisible: false,
      isLoading: true,
      showModalLoading: false,
      progresLoading: 0,
      selectedDeviceName: '',
      selectedDeviceIdFromAsync: '',
      selectedDeviceNameFromAsync: '',

      connectingModal: false,
      pairReq: false,
      connectionDone: false,
      allowForNotification: false,
      updateUI: 1,
    };
    this.deviceCard = this.deviceCard.bind(this);
    this.timerInterval = null;
  }

  async componentDidMount() {
    const selectedDeviceIdFromAsync = await AsyncStorage.getItem('deviceId');
    const selectedDeviceNameFromAsync = await AsyncStorage.getItem('selectedDeviceName');

    this.setState({
      selectedDeviceIdFromAsync: selectedDeviceIdFromAsync,
      selectedDeviceNameFromAsync: selectedDeviceNameFromAsync,
    });

    this.getBTDevicesRNLib();
  }

  componentWillUnmount() {
    this.timerInterval && clearInterval(this.timerInterval);
  }

  toggleCheckBox = (id, name) => {
    this.setState({
      selectedDeviceId: id,
      selectedDeviceName: name,
    });
  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  getBTDevicesRNLib = async () => {
    try {
      const permissionGranted = await this.requestAndroidPermissions();
      if (permissionGranted) {
        const devices = await RNBluetoothClassic.startDiscovery();

        const paired = await RNBluetoothClassic.getBondedDevices();

        const selectedDeviceIdFromAsync = await AsyncStorage.getItem('deviceId');
        const selectedDeviceNameFromAsync = await AsyncStorage.getItem('selectedDeviceName');

        const alreadySelectedDevice = {
          id: selectedDeviceIdFromAsync,
          name: selectedDeviceNameFromAsync,
        };

        function filterDuplicateDevices(...arrays) {
          const combined = arrays.flat();
          const uniqueDevices = {};

          combined.forEach((device) => {
            uniqueDevices[device.id] = device;
          });

          return Object.values(uniqueDevices);
        }

        const filteredDevices = alreadySelectedDevice.id
          ? filterDuplicateDevices(devices, paired, alreadySelectedDevice)
          : filterDuplicateDevices(devices, paired);

        console.log(JSON.stringify(filteredDevices));

        const wearableDevices = filteredDevices.filter((device) => {
          return (
            device.deviceClass?.majorClass == 7936 ||
            device.deviceClass?.majorClass == 1792 ||
            !device.deviceClass?.majorClass ||
            device?.name?.toLowerCase().includes('myclnq') ||
            device?.name?.toLowerCase().includes('g109')
          );
        });
        this.setState({ BTDevices: wearableDevices, isLoading: false });
      } else {
        this.setState({ isLoading: false });
        alert('Please give Bluetooth permission');
      }
    } catch (error) {
      this.setState({ isLoading: false });
      RNBluetoothClassic.cancelDiscovery();
      console.log(error);
    }
  };

  requestAndroidPermissions = async () => {
    const scanPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
      title: 'Bluetooth Scan Permission',
      message: 'Bluetooth scan is required to find devices',
      buttonPositive: 'OK',
    });
    const connectPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
      title: 'Bluetooth Connect Permission',
      message: 'Bluetooth connect is required to connect to devices',
      buttonPositive: 'OK',
    });
    const locationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
      title: 'Location Permission',
      message: 'Location access is required for Bluetooth scanning',
      buttonPositive: 'OK',
    });

    return (
      scanPermission === PermissionsAndroid.RESULTS.GRANTED &&
      connectPermission === PermissionsAndroid.RESULTS.GRANTED &&
      locationPermission === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  intialSearchView() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          style={{
            height: moderateScale(300),
            width: moderateScale(300),
            resizeMode: 'contain',
          }}
          source={images.watchOrbits}
        />
        <View
          style={{
            position: 'absolute',
            backgroundColor: AppColors.blackColor4,
            height: moderateScale(25),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            top: 0,
            marginTop: hp(58),
          }}
        >
          <Text
            style={{
              color: AppColors.whiteColor,
              paddingHorizontal: 15,
              textAlign: 'center',
            }}
          >
            M8
          </Text>
        </View>
      </View>
    );
  }
  deviceCard({ item, index }) {
    const isChecked = this.state.selectedDeviceId === item.id;
    return (
      <TouchableOpacity
        style={[styles.deviceCard, index === 0 && styles.firstDeviceCard]}
        key={item.id}
        onPress={() => this.toggleCheckBox(item.id, item.name)}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', marginLeft: wp(4) }}>
          <Image
            style={{
              height: moderateScale(40),
              width: moderateScale(40),
              resizeMode: 'contain',
            }}
            source={images.smallWatch}
          />
          <View style={{ marginLeft: wp(3) }}>
            <Text
              style={{
                fontSize: 15,
                color: AppColors.textDarkGray,
                fontWeight: '800',
              }}
            >
              {item?.name}
            </Text>
            <Text
              style={{
                color: AppColors.textLightGray,
                fontSize: 12,
              }}
            >
              {item?.extraInfo}
            </Text>
          </View>
        </View>
        <CheckBox
          style={styles.checkBox}
          onClick={() => this.toggleCheckBox(item.id, item.name)}
          isChecked={isChecked}
          checkedImage={
            <View style={styles.checkedBox}>
              <Feather
                name="check"
                size={12}
                style={{
                  color: AppColors.primaryColor,
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
            </View>
          }
          unCheckedImage={<View style={styles.uncheckedBox}></View>}
        />
      </TouchableOpacity>
    );
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: AppColors.lightGray,
        }}
      >
        <View
          style={{
            flex: 1,
            marginTop: hp(5),
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Anurag's Code */}
          {!this.state.selectedDeviceIdFromAsync && (
            <View style={{ marginBottom: 20 }}>
              <Text
                onPress={() => {
                  this.setState(
                    {
                      showModalLoading: false,
                      connectingModal: false,
                      pairReq: false,
                      connectionDone: false,
                      allowForNotification: false,
                      updateUI: this.state.updateUI + 1,
                      progresLoading: 0,
                    },
                    () => {
                      Actions.SelectionActivity({ deviceId: this.state.selectedDeviceId });
                    }
                  );
                }}
              >
                no smart watch? <Text style={{ color: 'blue' }}>Click here</Text>
              </Text>
            </View>
          )}
          {/* /////// */}

          {this.state.selectedDeviceIdFromAsync ? (
            <>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: AppColors.textDarkGray,
                      fontWeight: '800',
                    }}
                  >
                    Connected Device : {this.state.selectedDeviceNameFromAsync}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    height: moderateScale(52),
                    backgroundColor: AppColors.buttonPrimarColor,
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: wp(90),
                    marginTop: hp(2),
                  }}
                  onPress={async () => {
                    this.setState(
                      {
                        showModalLoading: false,
                        connectingModal: false,
                        pairReq: false,
                        connectionDone: false,
                        allowForNotification: false,
                        updateUI: this.state.updateUI + 1,
                        progresLoading: 0,
                      },
                      () => {
                        Actions.SelectionActivity({ deviceId: this.state.selectedDeviceId });
                      }
                    );
                  }}
                >
                  <Text style={{ color: AppColors.whiteChange, textTransform: 'uppercase', fontSize: 15, fontWeight: '600' }}>Skip</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }} key={this.state.isLoading}>
              {this.state.isLoading ? (
                <LottieView
                  source={require('../../../assets/images/lottie/orbit.json')}
                  autoPlay={true}
                  loop
                  style={{
                    width: moderateScale(300),
                    height: moderateScale(300),
                  }}
                />
              ) : (
                <LottieView
                  source={require('../../../assets/images/lottie/orbit.json')}
                  autoPlay={false}
                  loop
                  style={{
                    width: moderateScale(300),
                    height: moderateScale(300),
                  }}
                />
              )}

              <Image
                style={{
                  height: moderateScale(80),
                  width: moderateScale(39),
                  resizeMode: 'contain',
                  position: 'absolute',
                }}
                source={images.watchRed}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                this.setState({ isLoading: true });
                this.getBTDevicesRNLib();
              }}
              style={{
                position: 'absolute',
                backgroundColor: AppColors.blackColor4,
                height: moderateScale(25),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                top: 0,
                marginTop: hp(33),
              }}
            >
              <Text
                style={{
                  color: AppColors.whiteColor,
                  paddingHorizontal: 15,
                  textAlign: 'center',
                }}
              >
                {this.state.isLoading ? 'Looking for device...' : 'Tap to Reload'}
              </Text>
            </TouchableOpacity>

            <FlatList
              data={this.state.BTDevices}
              renderItem={this.deviceCard}
              keyExtractor={(item) => item?.id?.toString()}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
          {this.state.selectedDeviceId && (
            <TouchableOpacity
              style={{
                height: moderateScale(52),
                backgroundColor: AppColors.buttonPrimarColor,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                width: wp(90),
                marginBottom: hp(2),
                position: 'absolute',
                bottom: 0,
              }}
              onPress={async () => {
                await AsyncStorage.setItem('deviceId', this.state.selectedDeviceId);
                await AsyncStorage.setItem('selectedDeviceName', this.state.selectedDeviceName);
                this.setState({
                  showModalLoading: true,
                  connectingModal: true,
                  updateUI: this.state.updateUI + 1,
                  progresLoading: 0,
                });

                this.timerInterval = setInterval(() => {
                  if (this.state.progresLoading == 1) {
                    clearInterval(this.timerInterval);
                    this.setState({
                      connectingModal: false,
                      pairReq: true,
                      updateUI: this.state.updateUI + 1,
                      progresLoading: 0,
                    });
                  }
                  this.setState({
                    progresLoading: this.state.progresLoading + 0.5,
                  });
                }, 500);
              }}
            >
              <Text style={{ color: AppColors.whiteChange, textTransform: 'uppercase', fontSize: 15, fontWeight: '600' }}>Connect device</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={this.state.showModalLoading} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent} key={this.state.updateUI}>
              {this.state.connectingModal && (
                <>
                  <Progress.Circle
                    size={moderateScale(160)}
                    progress={this.state.progresLoading}
                    thickness={10}
                    color={AppColors.primaryColor}
                    unfilledColor={AppColors.unfilledGray}
                    borderWidth={0}
                    showsText={false}
                    formatText={() => `test`}
                    textStyle={styles.progressText}
                    strokeCap={'round'}
                    style={{ alignSelf: 'center', marginTop: hp(2) }}
                  >
                    <Image
                      style={{
                        height: moderateScale(71),
                        width: moderateScale(71),
                        resizeMode: 'contain',
                        position: 'absolute',
                        marginLeft: moderateScale(45),
                        marginTop: moderateScale(45),
                      }}
                      source={images.watchBg}
                    />
                  </Progress.Circle>
                  <View
                    style={{
                      marginTop: hp(2),
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'center',
                      justifyContent: 'space-between',
                      width: wp(70),
                    }}
                  >
                    <Text style={{ fontSize: 12, color: AppColors.blackColor4, fontWeight: '600' }}>Watch Connecting...</Text>
                    <Text style={{ fontSize: 12, color: AppColors.lighterPrimary, fontWeight: '600' }}>
                      {Math.round(this.state.progresLoading * 100)}%
                    </Text>
                  </View>

                  <Progress.Bar
                    progress={this.state.progresLoading}
                    width={wp(70)}
                    height={hp(1.2)}
                    color={AppColors.primaryColor}
                    unfilledColor="#FFE0DF"
                    borderWidth={0}
                    style={{ marginTop: hp(1) }}
                  />
                  <Text
                    style={{
                      alignSelf: 'center',
                      marginTop: hp(2),
                      fontSize: 22,
                      fontWeight: '700',
                      color: AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                    }}
                  >
                    Connecting...
                  </Text>
                </>
              )}
              {this.state.pairReq && (
                <>
                  <Image
                    style={{
                      height: moderateScale(119),
                      width: moderateScale(216),
                      resizeMode: 'contain',
                    }}
                    source={images.bluetoothFail}
                  />
                  <Text style={{ fontSize: 20, color: AppColors.blackColor4, fontFamily: AppStyles.fontFamilyMedium, fontWeight: '700' }}>
                    Bluetooth Pairing Request
                  </Text>
                  <Text style={{ fontSize: 12, color: AppColors.blackColor5, fontFamily: AppStyles.fontFamilyMedium, marginTop: hp(1) }}>
                    {' '}
                    {this.state.selectedDeviceName} Would like to pair with your mobile
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(3), paddingBottom: moderateScale(5) }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: AppColors.buttonGray,
                        width: moderateScale(134),
                        height: moderateScale(52),
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: moderateScale(6),
                      }}
                      onPress={() => {
                        this.setState({
                          showModalLoading: false,
                          connectingModal: false,
                          pairReq: false,
                          connectionDone: false,
                          allowForNotification: false,
                          updateUI: this.state.updateUI + 1,
                          progresLoading: 0,
                        });
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: AppColors.blackColor4,
                          fontFamily: AppStyles.fontFamilyMedium,
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          pairReq: false,
                          connectionDone: true,
                          updateUI: this.state.updateUI + 1,
                          progresLoading: 0,
                        });
                        setTimeout(() => {
                          this.setState({
                            pairReq: false,
                            connectionDone: false,
                            allowForNotification: true,
                            updateUI: this.state.updateUI + 1,
                            progresLoading: 0,
                          });
                        }, 3000);
                      }}
                      style={{
                        backgroundColor: AppColors.buttonPrimarColor,
                        width: moderateScale(134),
                        height: moderateScale(52),
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: moderateScale(6),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: AppColors.whiteColor,
                          fontFamily: AppStyles.fontFamilyMedium,
                        }}
                      >
                        Pair
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {this.state.connectionDone && (
                <>
                  <Image
                    style={{
                      height: moderateScale(141),
                      width: moderateScale(256),
                      resizeMode: 'contain',
                    }}
                    source={images.connectSuccess}
                  />
                  <Text
                    style={{
                      fontSize: 22,
                      color: AppColors.blackColor4,
                      fontFamily: AppStyles.fontFamilyMedium,
                      fontWeight: '700',
                      paddingBottom: moderateScale(5),
                    }}
                  >
                    Connection Succeeded
                  </Text>
                </>
              )}
              {this.state.allowForNotification && (
                <>
                  <Image
                    style={{
                      height: moderateScale(119),
                      width: moderateScale(216),
                      resizeMode: 'contain',
                    }}
                    source={images.allowWatchNoti}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      color: AppColors.blackColor4,
                      fontFamily: AppStyles.fontFamilyRegular,
                      // fontWeight: '700',
                      paddingBottom: moderateScale(5),
                      textAlign: 'center',
                      marginTop: hp(2),
                    }}
                  >
                    Allow watch to receive{'\n'} your mobile for notification?
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: AppColors.blackColor5,
                      fontFamily: AppStyles.fontFamilyMedium,
                      paddingBottom: moderateScale(5),
                      textAlign: 'center',
                      marginTop: hp(2),
                      width: wp(75),
                      lineHeight: hp(2),
                    }}
                  >
                    Stay connected with alerts directly on your wrist. Allow your watch to receive notifications from your mobile, so you never miss
                    an important update again
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(3), paddingBottom: moderateScale(5) }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: AppColors.buttonGray,
                        width: moderateScale(134),
                        height: moderateScale(52),
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: moderateScale(6),
                      }}
                      onPress={() => {
                        this.setState(
                          {
                            showModalLoading: false,
                            connectingModal: false,
                            pairReq: false,
                            connectionDone: false,
                            allowForNotification: false,
                            updateUI: this.state.updateUI + 1,
                            progresLoading: 0,
                          },
                          () => {
                            Actions.SelectionActivity({ deviceId: this.state.selectedDeviceId });
                          }
                        );
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: AppColors.blackColor4,
                          fontFamily: AppStyles.fontFamilyMedium,
                        }}
                      >
                        Don't Allow
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: AppColors.buttonPrimarColor,
                        width: moderateScale(134),
                        height: moderateScale(52),
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: moderateScale(6),
                      }}
                      onPress={() => {
                        this.setState(
                          {
                            showModalLoading: false,
                            connectingModal: false,
                            pairReq: false,
                            connectionDone: false,
                            allowForNotification: false,
                            updateUI: this.state.updateUI + 1,
                            progresLoading: 0,
                          },
                          () => {
                            Actions.SelectionActivity({ deviceId: this.state.selectedDeviceId });
                          }
                        );
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: AppColors.whiteColor,
                          fontFamily: AppStyles.fontFamilyMedium,
                        }}
                      >
                        Allow
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

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
  checkBox: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2.5),
  },
  checkedBox: {
    width: moderateScale(18),
    height: moderateScale(18),
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  uncheckedBox: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderWidth: 1,
    borderColor: AppColors.checkboxGrey,
    borderRadius: 100,
  },
  checkedIcon: {
    color: AppColors.checkTickRed,
    fontSize: 10,
    borderRadius: 100,
  },
  deviceCard: {
    height: moderateScale(64),
    width: wp(90),
    backgroundColor: AppColors.whiteColor,
    borderWidth: 1,
    borderColor: AppColors.borderColor,
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: hp(1.5),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  firstDeviceCard: {
    marginTop: hp(3),
  },
  flatListContent: {
    paddingBottom: 90,
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
    // justifyContent: 'center',
  },
});

export default SearchDevHome;
