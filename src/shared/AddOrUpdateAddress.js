import React, { Component } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppColors } from './AppColors';
import { AppStyles } from './AppStyles';
import { AppStrings } from './AppStrings';
import PropTypes from 'prop-types';
import { AppUtils } from '../utils/AppUtils';
import ElevatedView from 'react-native-elevated-view';
import { moderateScale, verticalScale } from '../utils/Scaling';
import CardView from 'react-native-cardview';
import { Switch } from 'react-native-switch';
import { GooglePlacesAutocomplete } from '../utils/GooglePlacesAutocomplete';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import { SHApiConnector } from '../network/SHApiConnector';
import ProgressLoader from 'rn-progress-loader';
import Geocoder from 'react-native-geocoding';
import { Validator } from './Validator';
import { strings } from '../locales/i18n';
const isRTL = I18nManager.isRTL;

class AddOrUpdateAddress extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    location: PropTypes.string,
    addressList: PropTypes.array,
    updateAddressData: PropTypes.object,
    onAddressAddedOrUpdated: PropTypes.func,
    closeModal: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    location: '',
    addressList: [],
    updateAddressData: {},
    onAddressAddedOrUpdated: () => {},
    closeModal: () => {},
  };

  constructor(props) {
    super(props);

    AppUtils.console('nextPropsAddOrUpdate', props);
    this.state = {
      isLoading: false,
      addressList: props.addressList,
      listViewDisplay: false,
      isAddressOpen: false, //this.props.isOpen,
      location: '',
      name: '',
      unitNumber: '',
      address: '',
      title: '',
      landmark: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      updateAddressId: null,
      isUpdateAddress: false,
      phoneNumber: null,
      isDefault: props.addressList.length <= 0,
      longitude: null,
      latitude: null,
      enableScrollViewScroll: true,
    };
  }

  async componentDidMount() {
    try {
      BackHandler.addEventListener('hardwareBackPress', () => {
        this.closeModal();
        // alert("hi")
        return false;
      });
    } catch (e) {
      AppUtils.console('Error', e);
    }
    this.setState({ listViewDisplay: false });
    if (this.googlePlaceAutocomplete) {
      this.googlePlaceAutocomplete._handleChangeText('');
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () => {});
  }

  async componentWillReceiveProps(nextProps) {

    if (nextProps.isOpen) {
      this.setState({
        isAddressOpen: this.props.isOpen,
        addressList: nextProps.addressList,
        listViewDisplay: false,
        isLoading: false,
        isDefault: nextProps.addressList.length > 0,
      });

      if (this.googlePlaceAutocomplete) {
        this.googlePlaceAutocomplete._handleChangeText('');
      }
    }
    if (nextProps.currentAddress) {
      this.getUserCurrentLocation();
      this.setState({
        isDefault: !(nextProps.addressList.length > 0),
      });
    }

    if (nextProps.updateAddressData._id) {
      this.setState({
        location: nextProps.updateAddressData,
        name: nextProps.updateAddressData.userName,
        unitNumber: nextProps.updateAddressData.unitNumber,
        address: nextProps.updateAddressData.address,
        title: nextProps.updateAddressData.title,
        landmark: nextProps.updateAddressData.landmark,
        city: nextProps.updateAddressData.city,
        state: nextProps.updateAddressData.state,
        country: nextProps.updateAddressData.country,
        pincode: nextProps.updateAddressData.zipCode,
        isUpdateAddress: true,
        phoneNumber: nextProps.updateAddressData.contactNumber,
        isDefault: nextProps.updateAddressData.isDefaultAddress,
        updateAddressId: nextProps.updateAddressData._id,
        longitude: nextProps.updateAddressData.geoLocation[0],
        latitude: nextProps.updateAddressData.geoLocation[1],
      });
    }
  }

  async getUserCurrentLocation() {
    let self = this;
    const location = await AppUtils.getCurrentLocation();

    console.log(location, 'location');
    // this.setState({ isLoading: false })
    const { latitude, longitude } = location.coords;
    Geocoder.from(latitude, longitude).then((json) => {
      self.setAddressData(json.results[0].address_components, json.results[0].geometry.location);
    });
  }

  header() {
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>
        <TouchableHighlight
          onPress={() => this.closeModal()}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          <Image
            style={{
              height: moderateScale(30),
              width: moderateScale(30),
              marginTop: AppUtils.isIphone ? (AppUtils.isX ? 16 + 18 : 16) : 0,
              marginLeft: 8,
            }}
            source={require('../../assets/images/blackarrow.png')}
          />
        </TouchableHighlight>
        <View style={{ width: cellWidth + 5, height: AppUtils.headerHeight, justifyContent: 'center' }}>
          <Text style={styles.headerTextIOS}>
            {this.state.isUpdateAddress ? strings('shared.updateAddress') : strings('string.label.add_address')}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: AppUtils.isX ? 16 + 18 : 16,
          }}
        ></View>
      </ElevatedView>
    );
  }

  closeModal() {
    this.setState({ isAddressOpen: false }, () => {
      this.clearData();
      this.props.closeModal();
    });
  }

  clearData() {
    this.setState({
      isLoading: false,
      location: '',
      name: '',
      unitNumber: '',
      address: '',
      title: '',
      landmark: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      updateAddressId: null,
      isUpdateAddress: false,
      phoneNumber: null,
      longitude: null,
      latitude: null,
    });
  }

  renderAddSelectAddress() {
    let isSwitchDisable =
      this.state.addressList.length > 0 ? (this.state.isUpdateAddress && this.props.updateAddressData.isDefaultAddress ? true : false) : true;
    return (
      <Modal
        style={{ justifyContent: 'center' }}
        visible={this.props.isOpen}
        hardwareAccelerated={true}
        transparent={true}
        onRequestClose={() => this.closeModal()}
      >
        <View
          style={{
            flex: 1,
            paddingBottom: AppUtils.isX ? hp(5) : 0,
            backgroundColor: AppColors.whiteShadeColor,
          }}
        >
          {this.header()}
          <ScrollView>
            <KeyboardAwareScrollView scrollEnabled={this.state.enableScrollViewScroll} style={{ backgroundColor: 'transparent' }}>
              <View
                style={{
                  height: hp(10),
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: wp(100),
                  backgroundColor: AppColors.primaryColor,
                }}
              >
                <Text
                  style={{
                    color: AppColors.whiteColor,
                    fontSize: hp(1.8),
                    marginLeft: 10,
                    marginRight: 10,
                    fontFamily: AppStyles.fontFamilyRegular,
                  }}
                >
                  {strings('shared.makeSureAddressAccurate')}
                </Text>
              </View>
              <CardView
                cardElevation={5}
                cardMaxElevation={5}
                style={{
                  borderRadius: 10,
                  marginTop: hp(8),
                  width: wp('90'),
                  alignSelf: 'center',
                  backgroundColor: 'white',
                }}
              >
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.addressTitle')}</Text>

                  <TextInput
                    maxLength={40}
                    allowFontScaling={false}
                    value={this.state.title}
                    onChangeText={(text) => this.setState({ title: text })}
                    placeholder={strings('shared.addressTitle')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.name')}</Text>

                  <TextInput
                    maxLength={50}
                    allowFontScaling={false}
                    value={this.state.name}
                    onChangeText={(text) => this.setState({ name: text })}
                    placeholder={strings('shared.addressOwnerName')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={[styles.textInputViewStyle, { alignItems: 'center' }]}>
                  <Text style={[styles.textInputTitleStyle]}>{strings('shared.addressOne')}</Text>
                  <TextInput
                    maxLength={100}
                    allowFontScaling={false}
                    value={this.state.unitNumber}
                    onChangeText={(text) => this.setState({ unitNumber: text })}
                    placeholder={strings('shared.flatFlorBuilding')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={[styles.textInputViewStyle, { alignItems: 'center' }]}>
                  <Text style={[styles.textInputTitleStyle]}>{strings('shared.addressTwo')}</Text>
                  <TextInput
                    maxLength={150}
                    allowFontScaling={false}
                    value={this.state.address}
                    editable={true}
                    multiline={true}
                    onChangeText={(text) => this.setState({ address: text })}
                    placeholder={strings('shared.colonyStreet')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.landmark')}</Text>
                  <TextInput
                    maxLength={100}
                    allowFontScaling={false}
                    value={this.state.landmark}
                    onChangeText={(text) => this.setState({ landmark: text })}
                    placeholder={strings('shared.landmark')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.city')}</Text>
                  <TextInput
                    maxLength={50}
                    value={this.state.city}
                    allowFontScaling={false}
                    onChangeText={(text) => this.setState({ city: text })}
                    placeholder={strings('shared.city')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.state')}</Text>
                  <TextInput
                    maxLength={50}
                    value={this.state.state}
                    allowFontScaling={false}
                    editable={true}
                    onChangeText={(text) => this.setState({ state: text })}
                    placeholder={strings('shared.state')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.country')}</Text>
                  <TextInput
                    maxLength={50}
                    value={this.state.country}
                    allowFontScaling={false}
                    editable={true}
                    onChangeText={(text) => this.setState({ country: text })}
                    placeholder={strings('shared.country')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.pincode')}</Text>

                  <TextInput
                    maxLength={6}
                    allowFontScaling={false}
                    value={this.state.pincode}
                    onChangeText={(text) => this.onChangedPin(text)}
                    keyboardType="numeric"
                    placeholder={strings('shared.validPincode')}
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={styles.textInputViewStyle}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.phone')}</Text>
                  <TextInput
                    maxLength={10}
                    value={this.state.phoneNumber}
                    allowFontScaling={false}
                    onChangeText={(text) => this.onChangedPhone(text)}
                    placeholder={strings('shared.phoneNum')}
                    keyboardType="numeric"
                    style={styles.textInputStyle}
                  />
                </View>
                <View style={[styles.textInputViewStyle, { borderBottomWidth: 0 }]}>
                  <Text style={styles.textInputTitleStyle}>{strings('shared.setDefault')}</Text>
                  <View
                    style={{
                      width: wp('55'),
                      alignSelf: 'center',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Switch
                      onValueChange={(value) => this.setState({ isDefault: value })}
                      value={this.state.isDefault}
                      disabled={isSwitchDisable}
                      circleSize={moderateScale(20)}
                      barHeight={moderateScale(20)}
                      backgroundActive={AppColors.lightPink}
                      backgroundInactive={AppColors.lightGray}
                      circleActiveColor={AppColors.primaryColor}
                      circleInActiveColor={AppColors.primaryGray}
                      changeValueImmediately={true}
                      innerCircleStyle={{
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        borderColor: 'transparent',
                      }}
                      switchLeftPx={2}
                      switchRightPx={2}
                      switchWidthMultiplier={2}
                    />
                  </View>
                </View>
              </CardView>
              <TouchableOpacity
                onPress={() => this.validateAddress()}
                style={{
                  marginTop: hp(5),
                  marginBottom: hp(5),
                  backgroundColor: AppColors.primaryColor,
                  borderRadius: 5,
                  height: hp('6'),
                  width: wp('35'),
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#FFFFFF',
                    fontSize: hp(2.5),
                    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                    textAlign: 'center',
                    fontFamily: AppStyles.fontFamilyRegular,
                  }}
                >
                  {this.state.isUpdateAddress ? strings('common.common.update') : strings('shared.save')}
                </Text>
              </TouchableOpacity>
            </KeyboardAwareScrollView>
            {this.searchLocation()}
            <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
          </ScrollView>
        </View>
      </Modal>
    );
  }
  onChangedPhone(number) {
    let newText = '';
    let numbers = '0123456789';

    for (var i = 0; i < number.length; i++) {
      if (numbers.indexOf(number[i]) > -1) {
        newText = newText + number[i];
      } else {
        alert(strings('common.common.enterNumbersOnly'));
      }
    }
    this.setState({ phoneNumber: newText });
  }

  onChangedPin(number) {
    let newText = '';
    let numbers = '0123456789';

    for (var i = 0; i < number.length; i++) {
      if (numbers.indexOf(number[i]) > -1) {
        newText = newText + number[i];
      } else {
        alert(strings('common.common.enterNumbersOnly'));
      }
    }
    this.setState({ pincode: newText });
  }

  async validateAddress() {
    if (this.state.title.trim().length === 0) {
      Toast.show(strings('shared.titleMissing'));
    } else if (this.state.name.trim().length === 0) {
      Toast.show(strings('shared.nameMissing'));
    } else if (this.state.unitNumber.trim().length === 0) {
      Toast.show(strings('shared.addressOneMissing'));
    } else if (this.state.address.trim().length === 0) {
      Toast.show(strings('shared.addressTwoMissing'));
    } else if (this.state.country.trim().length === 0) {
      Toast.show(strings('shared.countryMissing'));
    } else if (this.state.pincode.trim().length === 0) {
      Toast.show(strings('shared.pincodeMissing'));
    } else if (this.state.phoneNumber.trim().length === 0) {
      Toast.show(strings('shared.phoneNumMissing'));
    } else if (this.state.phoneNumber.length < 8) {
      Toast.show(strings('shared.phoneValid'));
    } else if (!this.state.latitude || !this.state.longitude) {
      Toast.show(strings('shared.searchLocation'));
    } else {
      let userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER));
      AppUtils.console('UserDetail', userDetails, this.state);

      let addressData = {
        title: this.state.title,
        userName: this.state.name,
        unitNumber: this.state.unitNumber,
        address: this.state.address,
        landmark: this.state.landmark,
        zipCode: this.state.pincode,
        city: this.state.city,
        state: this.state.state,
        country: this.state.country,
        countryCode: userDetails.countryCode,
        contactNumber: this.state.phoneNumber,
        isDefaultAddress: this.state.isDefault,
        longitude: this.state.longitude,
        latitude: this.state.latitude,
      };

      if (this.state.isUpdateAddress) {
        try {
          this.setState({ isLoading: true });
          addressData.addressId = this.state.updateAddressId;
          let data = await SHApiConnector.updateAddress(addressData);
          if (data.data.status) {
            this.setState({ isLoading: false, addressData: data.data.response }, () => {
              this.clearData();
              this.props.onAddressAddedOrUpdated(data.data.response);
            });
          } else {
            this.setState({ isLoading: false }, () => Toast.show(data.data.error_message));
          }
        } catch (e) {
          AppUtils.console('ADD_OR_UPDATE_ADDRESS_ERROR', e);
        }
      } else {
        try {
          this.setState({ isLoading: true });
          let data = await SHApiConnector.addAddress(addressData);
          if (data.data.status) {
            this.setState({ isLoading: false, addressData: data.data.response }, () => {
              this.clearData();
              this.props.onAddressAddedOrUpdated(data.data.response);
            });
          } else {
            this.setState({ isLoading: false }, () => Toast.show(data.data.error_message));
          }
          AppUtils.console('sdzfcszsdfs', data);
        } catch (e) {
          AppUtils.console('ADD_OR_UPDATE_ADDRESS_ERROR', e);
        }
      }
    }
  }

  async setAddressData(addressComponent, location) {
    console.log('SetAddress', addressComponent, location);
    this.setState({
      address: '',
      listViewDisplay: false,
      latitude: location.lat,
      longitude: location.lng,
      enableScrollViewScroll: true,
    });
    for (var i = 0; i < addressComponent.length; i++) {
      var addressType = addressComponent[i].types[0];
      AppUtils.console('SetAddress_loop', addressComponent[i]);
      if (
        addressType == 'street_number' ||
        addressType == 'route' ||
        addressType == 'neighborhood' ||
        addressType == 'sublocality_level_2' ||
        addressType == 'sublocality_level_1' ||
        addressType == 'locality'
      ) {
        if (this.state.address == '') {
          this.setState({ address: addressComponent[i].long_name });
        } else {
          this.setState({ address: this.state.address + ', ' + addressComponent[i].long_name });
        }
      }

      if (addressType == 'administrative_area_level_2') {
        this.setState({ city: addressComponent[i].long_name });
      }

      if (addressType == 'administrative_area_level_1') {
        this.setState({ state: addressComponent[i].long_name });
      }

      if (addressType == 'country') {
        this.setState({ country: addressComponent[i].long_name });
      }
    }

    if (addressType == 'postal_code') {
      this.setState({ pincode: addressComponent[i].long_name });
    }
  }

  async setSearchAddress(addressComponent, location) {
    AppUtils.console('SetAddress', addressComponent, location);
    this.setState({
      address: '',
      listViewDisplay: false,
      latitude: location.lat,
      longitude: location.lng,
      enableScrollViewScroll: true,
    });
    for (var i = 0; i < addressComponent.length; i++) {
      var addressType = addressComponent[i].types[0];
      if (
        addressType == 'street_number' ||
        addressType == 'route' ||
        addressType == 'neighborhood' ||
        addressType == 'sublocality_level_2' ||
        addressType == 'sublocality_level_1' ||
        addressType == 'locality'
      ) {
        if (this.state.address == '') {
          this.setState({ address: addressComponent[i].long_name });
        } else {
          this.setState({ address: this.state.address + ', ' + addressComponent[i].long_name });
        }
      }

      if (addressType == 'administrative_area_level_2') {
        this.setState({ city: addressComponent[i].long_name });
      }

      if (addressType == 'administrative_area_level_1') {
        this.setState({ state: addressComponent[i].long_name });
      }

      if (addressType == 'country') {
        let userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
        AppUtils.console('UserDetailAddress', userDetails.countryCode);
        if (Validator.checkCountry(userDetails.countryCode, addressComponent[i].long_name)) {
          this.setState({ country: addressComponent[i].long_name });
        } else {
          alert(strings('shared.searchLocationWithinCountry'));

          this.clearData();
          break;
        }
      }

      if (addressType == 'postal_code') {
        this.setState({ pincode: addressComponent[i].long_name });
      }
    }
  }

  searchLocation() {
    let self = this;
    return (
      <View style={{ position: 'absolute', alignSelf: 'center' }}>
        <GooglePlacesAutocomplete
          suppressDefaultStyles={false}
          placeholder={strings('shared.searchYourLocation')}
          minLength={2}
          autoFocus={true}
          returnKeyType={'search'}
          fetchDetails={true}
          predefinedPlacesAlwaysVisible={true}
          renderDescription={(row) => row.description}
          ref={(c) => (this.googlePlaceAutocomplete = c)}
          listViewDisplayed={self.state.listViewDisplay}
          getDefaultValue={() => ''}
          onPress={(data, details = null) => {
            AppUtils.console('Address', data, details);
            this.setSearchAddress(details.address_components, details.geometry.location);
          }}
          textInputProps={{
            onChangeText: (text) => {
              if (text.length > 0) {
                self.setState({
                  searchPickUpLocationKeyWord: text,
                  listViewDisplay: !self.state.listViewDisplay,
                });
              } else {
                self.setState({
                  enableScrollViewScroll: false,
                  listViewDisplay: !self.state.listViewDisplay,
                });
              }
            },
          }}
          query={{
            key: AppStrings.MAP_API_KEY,
            language: 'en',
            default: 'geocode',
          }}
          GoogleReverseGeocodingQuery={{}}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
            types: 'hospital',
          }}
          filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
          styles={{
            container: [styles.autoCompleteContainer],
            listView: { height: hp(30) },
            list: { position: 'absolute' },
            textInputContainer: styles.pack1,
            // marginLeft:isRTL ? 8 : null,
            description: styles.description,
            textInput: styles.textInput,
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
          }}
          debounce={500}
          currentLocation={true}
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
                    source={require('../../assets/images/cancel.png')}
                  />
                ) : (
                  <Image
                    style={{
                      height: verticalScale(17),
                      width: moderateScale(17),
                      marginTop: hp(1.7),
                    }}
                    source={require('../../assets/images/cancel.png')}
                  />
                )}
              </TouchableHighlight>
            </View>
          )}
        />
      </View>
    );
  }

  clearField() {
    this.setState({
      listViewDisplay: false,
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      isDefault: false,
      enableScrollViewScroll: true,
    });

    this.googlePlaceAutocomplete._handleChangeText('');
  }

  render() {
    return this.renderAddSelectAddress();
  }
}

const styles = StyleSheet.create({
  autoCompleteContainer: {
    width: wp('100%'),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    top: hp(9.5),
    position: 'absolute',
    paddingLeft: hp('1%'),
    paddingRight: hp('1%'),
    backgroundColor: AppColors.whiteColor,
  },
  pack1: {
    borderBottomWidth: 0,
    textAlign: 'left',
    alignItems: 'center',
    borderColor: AppColors.backgroundGray,
  },
  description: {
    fontWeight: 'bold',
    color: AppColors.blackColor,
    padding: 0,
    backgroundColor: AppColors.whiteColor,
  },
  textInput: {
    borderBottomWidth: 0,
    borderColor: AppColors.backgroundGray,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: hp(0.3),
    padding: 0,
    color: '#5d5d5d',
    fontSize: hp(1.8),
    textAlign: isRTL ? 'right' : 'auto',
  },
  predefinedPlacesDescription: {
    color: AppColors.blackColor,
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  textInputViewStyle: {
    alignSelf: 'center',
    height: hp(7),
    flexDirection: 'row',
    width: wp(90),
    borderBottomWidth: 1,
    borderColor: AppColors.backgroundGray,
  },

  textInputTitleStyle: {
    fontSize: hp(2),
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: 'center',
    width: wp(30),
    color: AppColors.blackColor,
    paddingLeft: wp(5),
    marginLeft: isRTL ? hp(1) : null,
    fontFamily: AppStyles.fontFamilyRegular,
    textAlign: isRTL ? "left" : "auto"
  },

  textInputStyle: {
    fontSize: hp(2),
    borderBottomWidth: 0,
    borderBottomColor: '#999999',
    width: wp('55'),
    padding: wp(0),
    marginLeft: wp(5),
    fontFamily: AppStyles.fontFamilyMedium,
    textAlign: isRTL ? 'right' : 'auto',
  },
  addressModal: {
    position: 'absolute',
    height: hp(60),
    width: wp(90),
    backgroundColor: AppColors.whiteColor,
    borderRadius: 13,
  },
  addressModalView1: {
    height: hp(10),
    width: wp(90),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressModalView1TxtView: {
    width: wp(75),
  },
  modalTxt: {
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: 16,
  },
  addressListView: {
    height: hp(38),
    width: wp(90),
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerAddressListView: {
    flexDirection: 'row',
    height: hp(10),
    width: wp(80),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.greyBorder,
    paddingTop: hp(1),
    paddingBottom: hp(1),
  },
  innerAddressListView1: {
    height: hp(8),
    width: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerAddressListView2: {
    width: wp(60),
  },
  innerAddressListView3: {
    flexDirection: 'row',
    height: hp(8),
    width: wp(10),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressModalView2: {
    height: hp(12),
    width: wp(90),
    alignItems: 'center',
  },
  addressModalBtn: {
    flexDirection: 'row',
    height: hp(5),
    width: wp(40),
    borderRadius: 6,
    backgroundColor: AppColors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  addressModalBtnTxt: {
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 12,
  },
  addressModalGPSIcon: {
    height: wp(6),
    width: wp(6),
  },
  addressOuterRadio: {
    borderColor: AppColors.primaryColor,
    borderWidth: 1,
    width: wp(3.7),
    height: wp(3.7),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInnerRadio: {
    backgroundColor: AppColors.primaryColor,
    width: wp(2.7),
    height: wp(2.7),
    borderRadius: 50,
  },
  binImage: {
    height: wp(4),
    width: wp(4),
  },
  addSelectorIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(10),
    width: wp(86),
    borderRadius: 7,
    borderColor: AppColors.greyBorder,
  },
});

export default AddOrUpdateAddress;
