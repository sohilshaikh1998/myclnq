import React from 'react';
import { StyleSheet, View, Dimensions, Modal, Image, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import PubNubReact from 'pubnub-react';
import Geocoder from 'react-native-geocoding';
navigator.geolocation = require('@react-native-community/geolocation');
import MapViewDirections from 'react-native-maps-directions';
import { AppColors } from '../shared/AppColors';
import { AppStyles } from '../shared/AppStyles';
import { SHApiConnector } from '../network/SHApiConnector';
import AntDesign from 'react-native-vector-icons/AntDesign';
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
class DriverTrackingWidget extends React.Component {
  constructor(props) {
    super(props);
    Geocoder.init('AIzaSyBdc7TPydN4945Q-91KC7ndiczXdkqaPKo');
    this.state = {
      latitude: null,
      longitude: null,
      coordinate: new AnimatedRegion({
        latitude: null,
        longitude: null,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }),
      homeLocation: { latitude: 0, longitude: 0 },
      driverLocation: { latitude: 0, longitude: 0 },
      endLocation: { latitude: 0, longitude: 0 },
      routeCoordinates: [],
      isMapReady: false,
      consumedCoordinates: [],
      remainingRouteCoordinates: [],
      navigationMode: 'driverToHome',
      tripIdValidated: false,
      arrivingTime: '',
      timeInSeconds: 60,
    };
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-3284c866-18de-4dc7-a83f-4016774383f3",
      subscribeKey: "sub-c-2a15b69b-8ef7-4aef-a4ac-e0272325a714",
      uuid: this.props.driverId,
    });
    this.pubnub.init(this);
  }

  componentDidMount() {
        Promise.all([this.setLocation(this.props.pickUp, this.props.drop), this.subscribeToPubNub()]);
    this.pubnub.subscribe({
      channels: ['tripStatus'],
    });

    this.pubnub.getMessage('tripStatus', (msg) => {
      if (msg.message.tripStarted) {
        this.setState({ navigationMode: 'driverToHospital' });
      }
    });
  }

  setLocation = async (pickUp, drop) => {
    const pickupLocation = await this.getCoordinatesFromLocation(pickUp);
    const dropLocation = await this.getCoordinatesFromLocation(drop);
    if (pickupLocation) {
      this.setState({
        homeLocation: {
          latitude: pickupLocation.lat,
          longitude: pickupLocation.lng,
        },
      });
    }

    if (dropLocation) {
      this.setState({
        endLocation: {
          latitude: dropLocation.lat,
          longitude: dropLocation.lng,
        },
      });
    }
  };

  getCoordinatesFromLocation = async (location) => {
    try {
      const customerLocation = await Geocoder.from(location);
      const coordinates = customerLocation.results[0].geometry.location;
      return coordinates;
    } catch (error) {
      console.warn(error);
      return null;
    }
  };

  subscribeToPubNub = () => {
    this.pubnub.subscribe({
      channels: ['location'],
      withPresence: true,
    });
    this.pubnub.getMessage('location', (msg) => {
      if (this.props.driverId === msg.publisher) {
        const { coordinate } = this.state;
        const { latitude, longitude } = msg.message;
        const newCoordinate = { latitude, longitude };
        console.log('CheckNewCoordinate: ', newCoordinate);
        coordinate.timing(newCoordinate).start();
        // if (Platform.OS === 'android') {
        //   if (this.marker) {
        //     this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
        //   }
        // } else {
        //   coordinate.timing(newCoordinate).start();
        // }
        this.getDistanceBetweenPickAndDropLocation(newCoordinate);
        this.setState(() => ({
          latitude,
          longitude,
          driverLocation: {
            latitude: newCoordinate.latitude,
            longitude: newCoordinate.longitude,
          },
        }));
      }
    });
  };

  async getDistanceBetweenPickAndDropLocation(newCoordinate) {
    let data = {
      pickUplat: newCoordinate.latitude,
      pickUplong: newCoordinate.longitude,
      droplat: this.state.navigationMode === 'driverToHome' ? this.state.homeLocation.latitude : this.state.endLocation.latitude,
      droplong: this.state.navigationMode === 'driverToHome' ? this.state.homeLocation.longitude : this.state.endLocation.longitude,
    };
    try {
      let response = await SHApiConnector.getDistanceBetweenLatLong(data);
      if (response.data.status == 'OK' && response.data.rows[0].elements[0].status == 'OK') {
        let time = response.data.rows[0].elements[0].duration.text;
        let timeInSeconds = response.data.rows[0].elements[0].duration.value;
        console.log('CheckTime: ', timeInSeconds);
        this.setState({
          arrivingTime: time,
          timeInSeconds: timeInSeconds,
        });
      } else {
        this.setState({
          arrivingTime: 'N/A',
        });
      }
    } catch (e) {
      console.log('Error: ', e);
    }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  getCoordinatesFromLocation = async (location) => {
    try {
      const customerLocation = await Geocoder.from(location);
      const coordinates = customerLocation.results[0].geometry.location;
      return coordinates;
    } catch (error) {
      console.warn(error);
      return null;
    }
  };

  getMapRegion = () => {
    const { latitude, longitude } = this.state;
    if (latitude !== null && longitude !== null) {
      return {
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA * 2,
        longitudeDelta: LONGITUDE_DELTA * 2,
      };
    }
    return null;
  };

  onMapLayout = () => {
    this.setState({
      isMapReady: true,
    });
  };

  render() {
    const { driverLocation, endLocation, isMapReady, homeLocation, navigationMode, arrivingTime, timeInSeconds } = this.state;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.visible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <MapView
              style={styles.map}
              showUserLocation
              followUserLocation
              loadingEnabled
              ref={(c) => (this.mapView = c)}
              onMapReady={this.onMapLayout}
              region={this.state.latitude ? this.getMapRegion() : null}
              zoomEnabled={true}
              scrollEnabled={true}
              maxZoomLevel={100}
              initialRegion={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {isMapReady && (
                <>
                  {navigationMode === 'driverToHome' ? (
                    <MapViewDirections
                      origin={driverLocation}
                      destination={homeLocation}
                      apikey="AIzaSyBdc7TPydN4945Q-91KC7ndiczXdkqaPKo"
                      mode="DRIVING"
                      strokeWidth={2}
                      strokeColor="black"
                      resetOnChange={false}
                    />
                  ) : (
                    <MapViewDirections
                      origin={driverLocation}
                      destination={endLocation}
                      apikey="AIzaSyBdc7TPydN4945Q-91KC7ndiczXdkqaPKo"
                      mode="DRIVING"
                      strokeWidth={2}
                      strokeColor="black"
                      resetOnChange={false}
                    />
                  )}
                  {homeLocation && (
                    <Marker coordinate={homeLocation} title="You">
                      <Image resizeMode="contain" style={{ height: 20, width: 20 }} source={require('../../assets/images/home-track.png')} />
                    </Marker>
                  )}
                  {endLocation && (
                    <Marker coordinate={endLocation} title="Hospital">
                      <Image resizeMode="contain" style={{ height: 20, width: 20 }} source={require('../../assets/images/hospital-buildings.png')} />
                    </Marker>
                  )}
                  {driverLocation && endLocation && (
                    <Marker.Animated
                      ref={(marker) => {
                        this.marker = marker;
                      }}
                      coordinate={this.state.coordinate}
                    >
                      <Image resizeMode={'contain'} style={{ height: 20, width: 20 }} source={require('../../assets/images/ambulancelights.png')} />
                    </Marker.Animated>
                  )}
                </>
              )}
            </MapView>
            <TouchableOpacity style={styles.buttonContainer} onPress={this.props.closeModal}>
              <AntDesign
                name="closecircle"
                size={24}
                style={{
                  color: AppColors.primaryColor,
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
            </TouchableOpacity>
            {arrivingTime == '' ? (
              <View elevation={4} style={styles.cardTile}>
                <Text style={styles.timeData}>Waiting for driver to start trip!</Text>
              </View>
            ) : (
              <View elevation={4} style={styles.cardTile}>
                {timeInSeconds < 40 && navigationMode === 'driverToHome' ? (
                  <Text style={styles.timeData}>Your ambulance has arrived!</Text>
                ) : navigationMode === 'driverToHome' ? (
                  <Text style={styles.timeData}> Arriving in {arrivingTime} </Text>
                ) : timeInSeconds > 50 && navigationMode === 'driverToHospital' ? (
                  <Text style={styles.timeData}> Estimated time to reach: {arrivingTime} </Text>
                ) : (
                  <Text style={styles.timeData}>You have reached your destination!</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 5,
    borderTopColor: '#000',
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    right: 10,
  },
  cardTile: {
    margin: 0,
    flexDirection: 'row',
    backgroundColor: AppColors.whiteColor,
    width: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    paddingVertical: 25,
  },
  timeData: {
    color: AppColors.blackColor3,
    fontSize: 16,
    fontFamily: AppStyles.fontFamilyDemi,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 50,
    // padding: 35,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    bottom: 0,
    position: 'absolute',
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    top: '8%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#000',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default DriverTrackingWidget;
