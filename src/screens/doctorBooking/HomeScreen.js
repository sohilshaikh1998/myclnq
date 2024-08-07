import React from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  LayoutAnimation,
  Linking,
  PermissionsAndroid,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableHighlight,
  View,
  AppState,
  TouchableOpacity,
  ImageBackground,
  I18nManager,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from "react-native-maps";
import { AppStyles } from "../../shared/AppStyles";
import { AppColors } from "../../shared/AppColors";
import { moderateScale, verticalScale } from "../../utils/Scaling";
import { Actions } from "react-native-router-flux";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import ChipView from "../../shared/ChipView";
import Pulse from "../../shared/Pulse";
import ProgressLoader from "rn-progress-loader";
import { GooglePlacesAutocomplete } from "../../utils/GooglePlacesAutocomplete";
import CheckInternet from "../../utils/CheckInternet";
import { AppStrings } from "../../shared/AppStrings";
import Geocoder from "react-native-geocoding";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import { CachedImage } from "../../cachedImage";
import { check, PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { strings } from "../../locales/i18n";
import { AppArray } from "../../utils/AppArray";

const { width, height } = Dimensions.get("window");
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = 0.001;
const isRTL = I18nManager.isRTL;
export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position),
      (e) => reject(e)
    );
  });
};

var lastTimeout;

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker("Medical Appointment Home Screen");
    this.setSearchLocation = this.setSearchLocation.bind(this);
    this.locations = this.locations.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.getUserLocation = this.getUserLocation.bind(this);
    this.state = {
      isLoading: false,
      isDataVisible: false,
      marker1: true,
      marker2: false,
      data: [{}],
      clinicID: "",
      search: this.props.search,
      region: {
        latitude: 1.4538337,
        longitude: 103.8195883,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      nearByLocation: [],
      locationName: [],
      page: "HomeScreen",
      department: [],
      status: "",
      isFilterOpen: false,
      listViewDisplayed: true,
      searchLocation: true,
      searchOthers: false,
      location: "",
      searchLocationKeyWord: "",
      isAlertVisible: false,
      range: false,
      departmentLength: "",
      isActiveCall: false,
      isIncomingCall: false,
      appState: AppState.currentState,
      suggestionList: AppArray.searchSuggestionDoctor(),
      showSuggestion: false,
    };
    // this._setUpListeners = this._setUpListeners.bind(this);
    lastTimeout = setTimeout;
  }

  async getUserLocation() {
    let self = this;
    if (AppUtils.isIphone) {
      Geolocation.getCurrentPosition(
        (position) => {
          self.search(position.coords.latitude, position.coords.longitude);
          self.setState({
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
          });
        },
        (error) => {
          AppUtils.console("dfxvdbcgfdxcgbvvb", error);
        },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 3600000 }
      );
    } else {
      const location = await AppUtils.getCurrentLocation();
      const { latitude, longitude } = location.coords;
      self.search(latitude, longitude);
      self.setState({
        region: {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
      });
    }
  }

  showDenialAlertMessage(err) {
    AppUtils.console("Error:", err);
    if (Platform.OS === "ios") {
      Alert.alert(
        strings("doctor.alertTitle.locPermission"),
        strings("doctor.alertMsg.allowNearClinic"),
        [
          { text: strings("doctor.button.donotAllow"), style: "cancel" },
          {
            text: strings("doctor.button.allow"),
            onPress: () => this.navigateToSettings(),
          },
        ]
      );
    } else {
      Alert.alert(
        strings("doctor.alertTitle.locPermission"),
        strings("doctor.alertMsg.allowPermissionSetting"),
        [
          {
            text: strings("doctor.button.gotIt"),
            onPress: () => this.navigateToSettings(),
          },
        ]
      );
    }
  }

  navigateToSettings() {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      ToastAndroid.show(strings("doctor.alertMsg.exit"), 2000);
      setTimeout(() => {
        BackHandler.exitApp();
      }, 2100);
    }
  }

  setLocation(data) {
    let self = this;
    this.map = "";
    let dataLength = data.length;
    let nearLocation = [];
    let locationName = [];
    let latLongArray = [];
    data.map((clinic, i) => {
      nearLocation[i] = [clinic.geoLocation[1], clinic.geoLocation[0], clinic];
      locationName[i] = [clinic.clinicName];
      latLongArray.push({
        latitude: clinic.geoLocation[1],
        longitude: clinic.geoLocation[0],
      });
    });

    self.setState(
      {
        nearByLocation: nearLocation,
        locationName: locationName,
      },
      () => {
        if (latLongArray.length > 0) {
          setTimeout(() => {
            if (this.state.searchLocation) {
              this.map.fitToCoordinates(
                latLongArray,
                {
                  edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                  animated: true,
                },
                1000
              );
            }
          });
        }
      }
    );
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      if (Platform.OS === "ios") {
        this.setSearchLocation();
      } else {
        this.locationPermissionsAccess(); //for Android
      }
    }
    this.setState({ appState: nextAppState });
  };

  async componentDidMount() {
      

    if (Platform.OS === "ios") {
      this.setSearchLocation();
    } else {
      this.locationPermissionsAccess(); //for Android
    }

    // const storedLanguage = await this.getLanguagePreference();
    // if (storedLanguage) {
    //   this.setState({ language: storedLanguage });
    // } else {
    // }
    // storeLanguagePreference = async (language) => {
    //   try {
    //     await AsyncStorage.setItem('language', language);
    //   } catch (error) {
    //     console.error('Error storing language preference:', error);
    //   }
    // };
  



    AppState.addEventListener("change", this._handleAppStateChange);
    AppState.addEventListener("change", this._handleAppStateChange);

    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", () => {
        return true;
      });
    }
  }
  async requestLocationPermissionForAndroid() {
    const chckLocationPermission = PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (chckLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
      return;
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          alert(strings("doctor.alertTitle.locPermission"));
        }
      } catch (err) {
        AppUtils.console("Location permission error:", err);
      }
    }
  }

  locationPermissionsAccess() {
  
    try {
      (async () => {
        {
          try {
            const always_permission =
              Platform.OS === "ios"
                ? await check(PERMISSIONS.IOS.LOCATION_ALWAYS)
                : await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                  );
  
  
            const when_in_use_permission =
              Platform.OS === "ios"
                ? await check(PERMISSIONS.IOS.LOCATION_ALWAYS)
                : await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                  );
  
            let granted =
              Platform.OS === "ios"
                ? RESULTS.GRANTED
                : PermissionsAndroid.RESULTS.GRANTED;

  
            if (
              always_permission === granted ||
              when_in_use_permission === granted
            ) {
              Geolocation.getCurrentPosition(
                (position) => {
                  this.setSearchLocation();
                },
                (error) => {},
                {}
              );
            } else {
              if (Actions.currentScene == "_HomeScreen") {
                if (Platform.OS === "ios") {
                  Alert.alert(
                    strings("doctor.alertTitle.location"),
                    strings("doctor.alertMsg.locPermissionForClinic"),
                    [
                      {
                        text: strings("doctor.button.cancel"),
                        onPress: () => AppUtils.console("Permission Denied"),
                        style: "cancel",
                      },
                      {
                        text: strings("doctor.button.allow"),
                        onPress: () => {
                          Geolocation.requestAuthorization();
                        },
                      },
                    ],
                    { cancelable: false }
                  );
                } else {
                  this.requestLocationPermissionForAndroid();
                }
              }
              BackHandler.exitApp();
            }
          } catch (err) {
            console.error("No Access  to location" + err);
          }
        }
      })();
    } catch (error) {
      console.error("Error in locationPermissionsAccess:", error);
    }
  }
  

  // exitAlert() {
  //     Alert.alert(
  //         strings('common.common.exitApp'), strings('common.common.wantToQuit'),
  //         [
  //             {text: strings('common.common.stay'), style: 'cancel'},
  //             {text: strings('common.common.exit'), onPress: () => BackHandler.exitApp()}
  //         ]
  //     );
  // };

  componentWillReceiveProps(data) {
    if (data.filtersSet) {
      this.search(
        this.state.region.latitude,
        this.state.region.longitude,
        this.state.search
      );
      Actions.refresh({ filtersSet: false });
    }
  }

  async setSearchLocation() {
    try {
      await this.getUserLocation();
    } catch (err) {
      console.error("ERROR:::::", err);
    }
  }

  checkGpsAccess(location) {
    if (Platform.OS === "ios") {
      var shortNamedLocation =
        location.results[0].address_components[2].long_name;
      Actions.refresh({ location: shortNamedLocation });
      this.search(this.state.region.latitude, this.state.region.longitude);
    } else {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then((data) => {
          // The user has accepted to enable the location services
          // data can be :
          //  - "already-enabled" if the location services has been already enabled
          //  - "enabled" if user has clicked on OK button in the popup

          if (data == "enabled" || data == "already-enabled") {
            var shortNamedLocation =
              location.results[0].address_components[2].long_name;
            Actions.refresh({ location: shortNamedLocation });
            this.search(
              this.state.region.latitude,
              this.state.region.longitude
            );
          }
        })
        .catch((err) => {
          if (err) {
            setTimeout(() => {
              alert(strings("doctor.alertMsg.turnGPSOn"));
            }, 100);
          }
          // The user has not accepted to enable the location services or something went wrong during the process
          // "err" : { "code" : "ERR00|ERR01|ERR02", "message" : "message"}
          // codes :
          //  - ERR00 : The user has clicked on Cancel button in the popup
          //  - ERR01 : If the Settings change are unavailable
          //  - ERR02 : If the popup has failed to open
        });
    }
  }

  console(response) {
    AppUtils.console("Response:", resolve(response.json));
  }

  cancel() {
    this.setState({
      range: true,
      isAlertVisible: false,
      filtersSet: false,
      location: "",
      data: [{}],
      listViewDisplayed: true,
    });
    Actions.refresh({ location: "" });
  }

  openFilters() {
    this.setState({ range: true, isAlertVisible: false, filtersSet: false });
    Actions.refresh({ range: true });
  }

  search(lat, long, input) {
    var self = this;
    Keyboard.dismiss();
    let details = {
      longitude: long,
      latitude: lat,
      search: input,
      maximumDistance: AppUtils.maxDistance * 1000,
      insuranceId: AppUtils.insuranceId,
      isClinicAcceptInsurance:
        AppUtils.insuranceAccepted == 2
          ? "none"
          : AppUtils.insuranceAccepted == 1
          ? false
          : true,
    };
    AppUtils.maxDistance = details.maximumDistance / 1000;
    AppUtils.latitude = self.state.region.latitude;
    AppUtils.longitude = self.state.region.longitude;
    this.setState({
      isLoading: Actions.currentScene == "_HomeScreen" ? true : false,
      data: [],
    });

    SHApiConnector.getNearByClinic(details, function (err, stat) {
      try {
        self.setState({ isLoading: false });
        AppUtils.location = self.state.location;
        if (stat && !stat.error_code) {
          if (
            stat.nearByClinics.clinicDetails.length == 0 &&
            details.maximumDistance < 10000
          ) {
            if (!self.state.isAlertVisible) {
              self.setState({
                isDataVisible: true,
                data: [{}],
                isAlertVisible: true,
                isLoading: false,
              });
              self.showAlert();
            }
          } else if (
            stat.nearByClinics.clinicDetails.length == 0 &&
            details.maximumDistance >= 10000
          ) {
            setTimeout(() => {
              AppUtils.showMessage(
                self,
                strings("doctor.alertTitle.sorry"),
                strings("doctor.alertMsg.couldNotFindClinic"),
                strings("doctor.button.ok"),
                function () {}
              );
            }, 500);
            self.setState(
              {
                isDataVisible: true,
                data: [{}],
                isLoading: false,
                region: {
                  longitude: self.state.region.longitude,
                  latitude: self.state.region.latitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                },
              },
              () => {
                self.setLocation(stat.nearByClinics.clinicDetails);
              }
            );
          } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
            self.setState(
              {
                data: stat.nearByClinics.clinicDetails.concat([{}]),
                isDataVisible: true,
                isLoading: false,
                region: {
                  longitude: self.state.region.longitude,
                  latitude: self.state.region.latitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                },
              },
              () => {
                self.setLocation(stat.nearByClinics.clinicDetails);
              }
            );
          }
        } else {
          if (stat.error_code) {
            self.setState({ isLoading: false }, () => {
              if (stat.error_code && stat.error_code === "10006") {
                // Actions.LoginMobile();
              }
            });
          }
        }
      } catch (err) {
        self.setState({
          isLoading: false,
          region: {
            longitude: self.state.region.longitude,
            latitude: self.state.region.latitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
        });
        console.error(err);
      }
    });
  }

  showAlert() {
    var self = this;
    // setTimeout(() => {
    //     Alert.alert(
    //         'No Clinics Found',
    //         "Sorry, We haven't found any clinic.",
    //         // "Sorry, We haven't found any clinic, Press ok to change the search range from preferences.",
    //         [
    //             {text: strings('doctor.button.ok'), onPress: () => self.cancel()},
    //
    //             // {text: strings('doctor.button.ok'), onPress: () => self.openFilters()}
    //         ]
    //     );
    // }, 1000)
  }

  setValue(text) {
    this.googlePlacesAutocomplete._handleChangeText(text);
  }

  locations(data, details) {}

  getLocation() {
    var self = this;
    return (
      <View>
        {this.state.searchLocation ? (
          <View style={{ backgroundColor: AppColors.whiteColor }}>
            <GooglePlacesAutocomplete
              placeholder={strings("doctor.text.enterLocation")}
              minLength={3}
              autoFocus={false}
              returnKeyType={"search"}
              fetchDetails={true}
              renderDescription={(row) => row.description}
              ref={(c) => (this.googlePlacesAutocomplete = c)}
              enablePoweredByContainer={true}
              listViewDisplayed={this.state.listViewDisplayed}
              onPress={(data, details = null) => {
                self.setState({
                  region: {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  },
                  listViewDisplayed: !this.state.listViewDisplayed,
                  location: details.formatted_address,
                });
                this.search(
                  details.geometry.location.lat,
                  details.geometry.location.lng
                );
                Actions.refresh({ location: details.formatted_address });
              }}
              textInputProps={{
                onChangeText: (text) => {
                  this.setState({
                    searchLocationKeyWord: text,
                    listViewDisplayed: true,
                  });
                },
              }}
              query={{
                key: "AIzaSyDLM_IO2v3nlqUqWmuPDg6I3H_3-u90J6E",
                language: "en",
                default: "geocode",
              }}
              getDefaultValue={() => {
                return "";
              }}
              styles={{
                textInputContainer: {
                  borderBottomWidth: 0,
                  height: hp(8),
                  marginLeft: wp(2),
                  textAlign: "left",
                  alignItems: "center",
                  backgroundColor: AppColors.whiteColor,
                },
                description: {
                  fontWeight: "bold",
                  color: AppColors.blackColor,
                  padding: 0,
                  backgroundColor: AppColors.whiteColor,
                },
                textInput: {
                  marginLeft: 0,
                  marginRight: wp(2),
                  height: 38,
                  color: "#5d5d5d",
                  fontSize: 16,
                  textAlign: isRTL ? 'right' : 'auto',

                },
                predefinedPlacesDescription: {
                  color: AppColors.blackColor,
                },
              }}
              debounce={500}
              currentLocation={false}
              currentLocationLabel={strings("doctor.text.currentLocation")}
              enableHighAccuracyLocation={true}
              renderRightButton={() => (
                <View style={{ flexDirection: "row", marginRight: wp(2) }}>
                  <TouchableHighlight
                    style={{ alignSelf: "center" }}
                    onPress={() => this.clearField()}
                    underlayColor="transparent"
                  >
                    <Image
                      resizeMode={"contain"}
                      style={{
                        height: hp(3),
                        width: hp(3),
                        borderRadius: hp(1.5),
                        marginRight: 5,
                        opacity: 0.4,
                      }}
                      source={require("../../../assets/images/tutorial_close.png")}
                    />
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={{
                      alignSelf: "center",
                      marginLeft: moderateScale(5),
                    }}
                    onPress={() =>
                      this.search(
                        this.state.region.latitude,
                        this.state.region.longitude,
                        this.state.search
                      )
                    }
                    underlayColor="transparent"
                  >
                    <Image
                      style={{
                        height: hp(4),
                        width: hp(4),
                        borderRadius: hp(2),
                        marginRight: 5,
                        opacity: 0.4,
                      }}
                      source={require("../../../assets/images/search.png")}
                    />
                  </TouchableHighlight>
                </View>
              )}
            />
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: hp(8),
              backgroundColor: AppColors.whiteColor,
            }}
          >
            <TextInput
              allowFontScaling={false}
              placeholder={strings("doctor.button.search")}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              value={this.state.search}
              onChangeText={(input) => this.rSearch(input)}
              returnKeyType="search"
              underlineColorAndroid={"white"}
              onSubmitEditing={(input) =>
                this.arrowSearch(input.nativeEvent.text)
              }
            ></TextInput>
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() =>
                this.search(
                  this.state.region.latitude,
                  this.state.region.longitude,
                  this.state.search
                )
              }
            >
              <Image
                style={{
                  height: hp(4),
                  width: hp(4),
                  marginRight: moderateScale(10),
                  borderRadius: hp(2),
                }}
                source={require("../../../assets/images/arrow.png")}
              />
            </TouchableHighlight>
          </View>
        )}
      </View>
    );
  }
  suggestionList(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState(
            { search: item.item.name, showSuggestion: false },
            () => {
              this.search(
                this.state.region.latitude,
                this.state.region.longitude,
                this.state.search
              );
            }
          );
        }}
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginRight: wp(1),
          marginLeft: wp(1),
          backgroundColor: AppColors.colorHeadings,
          alignSelf: "center",
          borderRadius: 8,
          height: hp(3.5),
          borderWidth: 1,
          borderColor: AppColors.colorHeadings,
        }}
      >
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            paddingLeft: wp(2),
            paddingRight: wp(2),
            fontFamily: AppStyles.fontFamilyMedium,
            textAlign: "center",
            fontSize: moderateScale(10),
            color: AppColors.whiteColor,
            marginTop: Platform.OS === "ios" ? 4 : 0,
          }}
        >
          {item.item.translation}
        </Text>
      </TouchableOpacity>
    );
  }

  sendLocation(location) {
    Actions.refresh({ location: location });
  }

  arrowSearch(input) {
    this.setState({ search: input });
    this.search(this.state.region.latitude, this.state.region.longitude, input);
  }

  rSearch(input) {
    this.setState({ search: input });
    let filteredData = this.state.suggestionList.filter(function (item) {
      return item.name.includes(input);
    });
  }

  clearField() {
    this.setState({ location: "", data: [{}], listViewDisplayed: true });
    Actions.refresh({ location: "" });
    this.googlePlacesAutocomplete._handleChangeText("");
    this.setSearchLocation();
  }

  onRegionChange(region) {
    var self = this;
    self.setState({
      region: {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      },
    });
  }

  render() {
    return (
      <View
        style={{
          justifyContent: "flex-start",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <View style={styles.HScontainer}>
          <MapView
            ref={(map) => {
              this.map = map;
            }}
            provider={this.props.provider}
            style={styles.map}
            region={this.state.region}
            showsUserLocation={false}
          >
            {this.renderUserLocation()}
            {this.state.nearByLocation.map((item, index) =>
              this.renderMarker(item, index)
            )}
          </MapView>
          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              shadowColor: AppColors.backgroundGray,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              elevation: 2,
              width: wp(100),
            }}
          >
            <View
              style={{
                width: wp(100),
                height: hp(0.2),
                backgroundColor: AppColors.backgroundGray,
              }}
            />
            {this.renderSearchBox()}

            {this.getLocation()}
            {!this.state.searchLocation ? (
              <View style={{ marginTop: hp(1), flexDirection: "row" }}>
                <FlatList
                  ref={(ref) => {
                    this.flatlist = ref;
                  }}
                  style={{ marginRight: wp(2), marginLeft: wp(2) }}
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  data={this.state.suggestionList}
                  onEndReachedThreshold={0.5}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item, index) => this.suggestionList(item, index)}
                  extraData={this.state}
                />
                <TouchableOpacity
                  onPress={() => {
                    this.flatlist.scrollToEnd();
                  }}
                >
                  <Image
                    source={require("../../../assets/images/arrow_up.png")}
                    style={{
                      alignSelf: "center",
                      height: wp(4),
                      width: wp(4),
                      marginRight: wp(2),
                      marginTop: hp(0.6),
                      tintColor: AppColors.colorHeadings,
                      //rotation:90,
                      transform: [{ rotate: "90deg" }],
                    }}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          {this.state.data.length > 0 ? (
            <View style={styles.flatList}>
              <FlatList
                data={this.state.data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this._render_row(item)}
                horizontal={true}
              />
            </View>
          ) : (
            <View />
          )}
          {/*<CheckInternet style={{ justifyContent: 'flex-start' }} />*/}
          <View
            style={{
              flexDirection: "row",
              width: width,
              height: verticalScale(100),
            }}
          >
            <Image
              source={require("../../../assets/images/compass_active.png")}
            />
            <Image
              source={require("../../../assets/images/compass_active.png")}
            />
          </View>
        </View>

        <ProgressLoader
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={"#FFFFFF"}
          color={AppColors.primaryColor}
        />
      </View>
    );
  }

  searchLocation() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    var self = this;
    self.setState({
      searchLocation: true,
    });
  }

  async navigateToQuickConsult() {
    try {
      // let countryCode = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)).countryCode;
      // const remoteConsult = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.APPLICATION)).REMOTE_CONSULT;
      // AppUtils.console("SBFKHSFKHSFB:", countryCode, remoteConsult);
      Actions.QuickRequest();
    } catch (e) {
      AppUtils.console("error", e);
    }
  }

  searchOthers() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    var self = this;
    self.setState({
      searchLocation: false,
    });
  
    //Updated homescreen.js to address issue MBW-1907
    // Fetching the user's location
    Geolocation.getCurrentPosition(
      (position) => {
        // Set the state with the fetched latitude and longitude
        self.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
        });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 3600000 }
    );
  }

  renderSearchBox() {
    return (
      <View
        style={{ flexDirection: "row", backgroundColor: AppColors.whiteColor }}
      >
        {this.state.searchLocation ? (
          <View
            style={{ flexDirection: "row", width: wp(100), marginTop: hp(1) }}
          >
            <TouchableHighlight
              style={{
                flex: 1,
                alignSelf: "center",
                justifyContent: "flex-end",
                marginLeft: wp(3),
              }}
              onPress={() => this.searchOthers()}
              underlayColor="transparent"
            >
              <View
                style={{
                  height: hp(4),
                  width: wp(30),
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: AppColors.whiteColor,
                  borderRadius: wp(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: AppUtils.isX ? wp(3.2) : wp(2.8),
                    textAlign: "center",
                    marginTop: Platform.OS === "ios" ? hp(0.5) : 0,
                    color: AppColors.blackColor,
                  }}
                >
                  {strings("doctor.text.docClinicSpec")}
                </Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              style={{ flex: 1, alignSelf: "center", marginLeft: wp(2) }}
              onPress={() => this.searchLocation()}
              underlayColor="transparent"
            >
              <View
                style={{
                  height: hp(4),
                  width: wp(20),
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: AppColors.primaryColor,
                  borderRadius: wp(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: AppUtils.isX ? wp(3.2) : wp(2.8),
                    marginTop: Platform.OS === "ios" ? hp(0.5) : 0,
                    color: AppColors.whiteColor,
                  }}
                >
                  {strings("doctor.alertTitle.location")}
                </Text>
              </View>
            </TouchableHighlight>

            <View style={{ flex: 1 }} />

            <TouchableHighlight
              style={{ flex: 1, alignItems: "flex-end" }}
              onPress={() => this.navigateToQuickConsult()}
              underlayColor="transparent"
            >
              <ImageBackground
                resizeMode={"contain"}
                style={{
                  height: wp(12),
                  width: wp(35),
                  alignItems: "center",
                  justifyContent: "center",
                }}
                source={require("../../../assets/images/empty_quick_consult.png")}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    alignSelf: "center",
                    color: AppColors.whiteColor,
                    marginTop: AppUtils.isIphone ? hp(0.2) : 0,
                    fontSize: wp(3),
                    marginLeft: isRTL ? wp(-12) : wp(12),
                    width: wp(25),
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: AppStyles.fontFamilyBold,
                  }}
                >
                  {strings("doctor.button.videoConsult")}
                </Text>
              </ImageBackground>
            </TouchableHighlight>
          </View>
        ) : (
          <View
            style={{ flexDirection: "row", width: wp(100), marginTop: hp(1) }}
          >
            <TouchableHighlight
              style={{ flex: 1, alignSelf: "center", marginLeft: wp(8) }}
              onPress={() => this.searchOthers()}
              underlayColor="transparent"
            >
              <View
                style={{
                  height: hp(4),
                  width: wp(30),
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: AppColors.primaryColor,
                  borderRadius: wp(10),
                }}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: AppUtils.isX ? wp(3.2) : wp(2.8),
                    textAlign: "center",
                    marginTop: Platform.OS === "ios" ? hp(0.5) : 0,
                    color: AppColors.whiteColor,
                  }}
                >
                  {strings("doctor.text.docClinicSpec")}
                </Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              style={{ flex: 1, alignSelf: "center", marginLeft: wp(5) }}
              onPress={() => this.searchLocation()}
              underlayColor="transparent"
            >
              <View
                style={{
                  height: hp(4),
                  width: wp(20),
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: AppColors.whiteColor,
                  borderRadius: wp(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: AppUtils.isX ? wp(3.2) : wp(2.8),
                    marginTop: Platform.OS === "ios" ? hp(0.5) : 0,
                    color: AppColors.blackColor,
                  }}
                >
                  {strings("doctor.alertTitle.location")}
                </Text>
              </View>
            </TouchableHighlight>

            <View style={{ flex: 1 }} />

            <TouchableHighlight
              style={{ flex: 1, alignItems: "flex-end" }}
              onPress={() => this.navigateToQuickConsult()}
              underlayColor="transparent"
            >
              <ImageBackground
                resizeMode={"contain"}
                style={{
                  height: wp(12),
                  width: wp(35),
                  alignItems: "center",
                  justifyContent: "center",
                }}
                source={require("../../../assets/images/empty_quick_consult.png")}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    color: AppColors.whiteColor,
                    marginTop: AppUtils.isIphone ? hp(0.2) : 0,
                    fontSize: wp(3),
                    marginLeft: isRTL ? wp(-12) : wp(12),
                    numberOfLines: 2,
                    width: wp(25),
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: AppStyles.fontFamilyBold,
                  }}
                >
                  {strings("doctor.button.videoConsult")}
                </Text>
              </ImageBackground>
            </TouchableHighlight>
          </View>
        )}
      </View>
    );
  }

  renderMarker(marker, index) {
    return (
      <Marker
        key={index}
        coordinate={{ latitude: marker[0], longitude: marker[1] }}
        image={require("../../../assets/images/map-marker.png")}
        title={marker[2].clinicName}
        onPress={() =>
          setTimeout(() => {
            //AppUtils.console("wesfd343rfd", index, marker)
            this.clinicDetail(marker[2]);
          }, 2000)
        }
      />
    );
  }

  renderUserLocation() {
    var self = this;
    let lat = self.state.region.latitude;
    let long = self.state.region.longitude;
    return (
      <View style={{ borderWidth: AppUtils.isIphone ? 0 : 1 }}>
        {AppUtils.isIphone ? (
          <Marker
            key={1024}
            style={{ alignItems: "center", justifyContent: "center" }}
            coordinate={{ latitude: lat, longitude: long }}
          >
            <Image
              style={{ zIndex: 999 }}
              source={require("../../../assets/images/gps_postition.png")}
            />
            <Pulse
              style={{
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
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
              alignItems: "center",
              justifyContent: "center",
              height: verticalScale(250),
              width: moderateScale(250),
            }}
            coordinate={{ latitude: lat, longitude: long }}
          ></Marker>
        )}
      </View>
    );
  }

  async clinicDetail(item) {
      Actions.ClinicDetails({
        clinicID: item._id,
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
      });
  }

  getClinicOnBoarded(clinicId) {
    try {
      let response = SHApiConnector.storeOnBoardRequest(clinicId);
      AppUtils.console("dxczxdsdzxdsezxd", clinicId, response);
    } catch (e) {
      AppUtils.console("CLINIC_ON_BOARDED_ERROR", e);
    }
  }

  async openClinic(item) {
    var self = this;
    let userDetails = JSON.parse(
      await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)
    );
    AppUtils.console("xcsdxcdfdvc1234", item[4], userDetails.countryCode);
    if (item[4] === userDetails.countryCode) {
      Actions.ClinicDetails({
        clinicID: item[2],
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
      });
    } else {
      Alert.alert("", strings("doctor.alertMsg.numberNotBelongsCountry"));
    }
  }

  _render_row(item) {
    AppUtils.console(
      "dzxczsxdfvfd",
      item,
      item.index !== this.state.data.length - 1
    );
    if (item.index !== this.state.data.length - 1) {
      let clinicDetail = item.item;
      let dist = item.item.distance;
      let distance = dist.toFixed(2);
      let distText = "" + distance + " KM";
      let departmentLength = clinicDetail.clinicDepartments.length;
      let waitingText = "";
      if (
        clinicDetail.waitingMinutes === "CLOSED" ||
        clinicDetail.waitingMinutes === "Closed" ||
        clinicDetail.waitingMinutes === "Appointment-Full"
      ) {
        waitingText = clinicDetail.waitingMinutes;
      } else {
        waitingText = strings("doctor.text.approxWaitingTime", {
          minutes: clinicDetail.waitingMinutes,
        });
      }

      return (
        <TouchableHighlight
          onPress={() => this.clinicDetail(clinicDetail)}
          underlayColor="transparent"
        >
          <View style={styles.cardView}>
            <View style={styles.clinicData}>
              <View style={[styles.view1]}>
                <View style={[styles.docImage, { overflow: "hidden" }]}>
                  <CachedImage
                    style={{
                      height: PixelRatio.getPixelSizeForLayoutSize(15),
                      width: PixelRatio.getPixelSizeForLayoutSize(15),
                      borderRadius:
                        PixelRatio.getPixelSizeForLayoutSize(15) / 2,
                    }}
                    resizeMode={"contain"}
                    source={{
                      uri: AppUtils.handleNullClinicImg(
                        clinicDetail.clinicLogo
                      ),
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: moderateScale(5),
                    marginTop: verticalScale(10),
                  }}
                >
                  <View
                    style={{
                      marginTop: verticalScale(5),
                      height: verticalScale(40),
                      width: moderateScale(100),
                    }}
                  >
                    <Text style={[styles.cardText,{marginRight: isRTL ? moderateScale(7) : 0}]} numberOfLines={2} ellipsizeMode={"middle"}>
                      {clinicDetail.clinicName}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      {item.item.bookingConfiguration.videoCall ? (
                        <Image
                          style={{ height: wp(4), width: wp(4) }}
                          resizeMode={"contain"}
                          source={require("../../../assets/images/video_camera_red.png")}
                        />
                      ) : null}
                      {item.item.bookingConfiguration.audioCall ? (
                        <Image
                          style={{
                            height: wp(4),
                            width: wp(4),
                            marginLeft: wp(2),
                          }}
                          resizeMode={"contain"}
                          source={require("../../../assets/images/tele_red.png")}
                        />
                      ) : null}
                      {item.item.bookingConfiguration.inHouseCall ? (
                        <Image
                          style={{
                            height: wp(4),
                            width: wp(4),
                            marginLeft: wp(2),
                          }}
                          resizeMode={"contain"}
                          source={require("../../../assets/images/house_call_red.png")}
                        />
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
              <ScrollView
                style={{
                  flexDirection: "row",
                  alignSelf: "flex-start",
                  marginTop: verticalScale(35),
                  height: moderateScale(30),
                }}
                showsVerticalScrollIndicator={false}
              >
                <FlatList
                  data={clinicDetail.clinicDepartments}
                  numColumns={20}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item, length) =>
                    this.specialisation(item, departmentLength)
                  }
                />
              </ScrollView>
            </View>
            <View style={[styles.addressView, { alignItems: "center" }]}>
              <View style={{ flex: 1.5 }}>
                <Text numberOfLines={1} style={styles.cardText}>
                  {clinicDetail.locationName}
                </Text>
              </View>
              <ChipView
                height={20}
                width={50}
                style={{ marginLeft: moderateScale(10), flex: 1 }}
                chipText={distText}
              />
            </View>
          </View>
        </TouchableHighlight>
      );
    } else {
      return (
        <View />
        // <TouchableHighlight onPress={() => Linking.openURL('https://ssivixlab.com/myclnqs/doctors')}
        //                     underlayColor='transparent'>
        //     <View style={[styles.cardView, {alignSelf: 'center', alignItems: 'center'}]}>
        //         <View style={{flex: 1, alignSelf: 'center', alignItems: 'center'}}>
        //             <Image
        //                 style={[{
        //                     marginTop: (Platform.OS === 'ios') ? hp(4) : hp(2),
        //                     height: (Platform.OS === 'ios') ? hp(10) : hp(10),
        //                     width: (Platform.OS === 'ios') ? hp(10) : hp(10)
        //                 }]}
        //                 source={require('../../../assets/images/showMoreClinic.png')}
        //             />
        //             <Text style={[styles.cardText, {
        //                 textAlign: 'center',
        //                 margin: (Platform.OS === 'ios') ? hp(2) : hp(1.5),
        //                 color: AppColors.textGray,
        //                 fontSize: (Platform.OS === 'ios') ? moderateScale(20) : moderateScale(16)
        //             }]} numberOfLines={2}>Search More Clinics</Text>
        //
        //         </View>
        //
        //     </View>
        // </TouchableHighlight>
      );
    }
  }

  specialisation(item, length) {
    AppUtils.console("sdzfxcseasd2323we", item, length);
    return (
      <View style={{ flexDirection: "row", height: moderateScale(30) }}>
        <Text style={{ color: AppColors.textGray }} numberOfLines={1}>
          {item.item.departmentName}
        </Text>
        {item.index == length - 1 ? (
          <Text> </Text>
        ) : (
          <Text style={{ color: AppColors.textGray }}>, </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    height: verticalScale(AppUtils.headerHeight),
    width: width,
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 5,
  },
  headerText: {
    color: AppColors.blackColor,
    //marginTop:verticalScale(15),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? 8 : verticalScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  searchBar: {
    position: "absolute",
    marginTop: verticalScale(20),
    height: Platform.OS === "ios" ? verticalScale(40) : verticalScale(50),
    width: moderateScale(300),
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(5),
    flexDirection: "row",
  },
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
    height: hp(8),
    width: wp(100),
    alignSelf: "flex-start",
    flex: 1.5,
    borderBottomColor: AppColors.primaryColor,
    marginLeft: wp(5),
    marginTop: Platform.OS === "ios" ? 3 : 0,
    textAlign: isRTL ? 'right' : 'auto',

  },
  HScontainer: {
    height: height,
    width: width,
    alignItems: "center",
    flexDirection: "column",
  },
  container1: {
    position: "absolute",
    width: width,
    height: verticalScale(350),
  },
  map: {
    height: height,
    width: width,
  },
  marker: {
    marginLeft: moderateScale(45),
    marginTop: verticalScale(45),
    fontWeight: "bold",
  },
  cardView: {
    borderWidth: 0,
    borderRadius: 8,
    elevation: 5,
    marginBottom: AppUtils.isIphone ? (AppUtils.isLowResiPhone ? 80 : 8) : 8,
    marginTop: Platform.OS === "ios" ? moderateScale(8) : moderateScale(40),
    marginRight: moderateScale(8),
    marginLeft: moderateScale(8),
    backgroundColor: AppColors.whiteColor,
    height: AppUtils.isIphone
      ? AppUtils.isX
        ? verticalScale(140)
        : verticalScale(150)
      : verticalScale(140),
    width: AppUtils.isIphone ? moderateScale(155) : moderateScale(150),
    margin: moderateScale(8),
  },
  flatList: {
    // height: Platform.OS === 'ios' ? (AppUtils.isLowResiPhone ? verticalScale(160) : verticalScale(170)) : verticalScale(250),
    height: AppUtils.isIphone
      ? AppUtils.isLowResiPhone
        ? verticalScale(160)
        : verticalScale(240)
      : verticalScale(250),
    width: width,
    marginTop: AppUtils.isX ? verticalScale(350) : verticalScale(350),
    marginBottom: AppUtils.isIphone ? (AppUtils.isLowResiPhone ? 80 : 8) : 8,
    position: "absolute",
    justifyContent: "flex-end",
  },

  view1: {
    flexDirection: "row",
    height: verticalScale(25),
    margin: moderateScale(5),
  },
  docImage: {
    //height:verticalScale(40),
    //width:moderateScale(40),
    height: PixelRatio.getPixelSizeForLayoutSize(15),
    width: PixelRatio.getPixelSizeForLayoutSize(15),
    borderRadius: PixelRatio.getPixelSizeForLayoutSize(15) / 2,
    borderColor: AppColors.backgroundGray,
    borderWidth: moderateScale(0.5),
    marginTop: AppUtils.isIphone ? verticalScale(12) : verticalScale(16),
  },
  cardText: {
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.textGray,
  },
  waitingText: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(10),
    color: AppColors.primaryColor,
    marginBottom: moderateScale(15),
  },
  specialisation: {
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.textGray,
    marginTop: verticalScale(35),
  },
  clinicData: {
    borderBottomWidth: 1,
    height: verticalScale(100),
    margin: moderateScale(5),
    borderBottomColor: AppColors.dividerColor,
  },
  distButton: {
    height: verticalScale(25),
    width: moderateScale(50),
    borderRadius: 200,
    justifyContent: "center",
    backgroundColor: AppColors.primaryColor,
    marginLeft: moderateScale(10),
  },

  distText: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
  },
  addressView: {
    flexDirection: "row",
    margin: moderateScale(5),
    /* alignItems:'center',
         justifyContent:'center'*/
  },
  waitingView: {
    flexDirection: "row",
    /* alignItems:'center',
         justifyContent:'center'*/
  },
  wagonIcon: {
    height: verticalScale(50),
    borderWidth: 5,
    flexDirection: "column",
    borderColor: AppColors.primaryColor,
    backgroundColor: AppColors.whiteColor,
    width: verticalScale(50),
    borderRadius: verticalScale(50 / 2),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});

export default HomeScreen;
