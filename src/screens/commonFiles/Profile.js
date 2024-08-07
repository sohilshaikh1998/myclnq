import React from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ProgressLoader from 'rn-progress-loader';
import { Actions } from 'react-native-router-flux';
import { AppStyles } from '../../shared/AppStyles';
import { AppStrings } from '../../shared/AppStrings';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppUtils } from '../../utils/AppUtils';
import SelectAddressModal from '../../shared/SelectAddressModal';
import AddOrUpdateAddress from '../../shared/AddOrUpdateAddress';
import FamilyProfile from './FamilyProfile';
import LinearGradient from 'react-native-linear-gradient';
import ElevatedView from 'react-native-elevated-view';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { CachedImage, ImageCacheProvider } from '../../cachedImage';
import { strings } from '../../locales/i18n';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;

class Profile extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Profile');
    this.state = {
      relatives: [],
      mobNumber: '',
      NICR: '',
      address: '',
      insurance: '',
      fName: '',
      lName: '',
      age: '',
      email: '',
      gender: '',
      NRIC: '',
      profilePic: '',
      isLoading: false,
      userCountryCode: '',
      isDataVisible: false,
      userId: '',
      selfProfileExists: false,
      relativePic: '',
      currentAddress: false,
      addressList: [],
      updateAddressData: {},
      isAddAddressOpen: false,
      isAddressOpen: false,
      isJustLoginUser: false,
      guIdPhoneNumber: 'NA',
      subscriptionCount: 0,
      corporatePlanCount: 0,
      corporatePlan: false
    };
    this.getUserProfile = this.getUserProfile.bind(this);
    AppStrings.userName = this.state.userName;
  }

  async getData() {
    AppUtils.console('GET_Data');

    try {
      const response = await SHApiConnector.getService();
      if (response.data.status) {
        AppUtils.console('GET_SERVICE', response);
        this.getSelectedAddress(response.data.response.userAddress);
      } else this.showAlert(response.data.error_message);
      this.setState({ isLoading: false });
    } catch (e) {
      AppUtils.console('Errrror', e);
      this.setState({ isLoading: false });
      this.showAlert(e.response.data.error_message);
    }
  }

  getSelectedAddress(addressList) {
    AppUtils.console('GetSelectedAddresss', addressList);
    let selectedAddress = addressList.length > 0 ? addressList[0] : {};
    let isDefaultAddressAvail = false;
    addressList.map((address) => {
      AppUtils.console('zxcsdzxfscx', address);
      if (address.isDefaultAddress) {
        selectedAddress = address;
        isDefaultAddressAvail = true;
      }
    });
    if (!isDefaultAddressAvail && addressList.length > 0) {
      addressList[0].isDefaultAddress = true;
    }
    AppUtils.console('GetSelectedAddresssis---->', selectedAddress);

    this.setState({ address: selectedAddress, addressList: addressList });
  }

  componentDidMount() {
    this.getData();
    this.getUserProfile();
    this.getCorporateUserDetails();
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack(true);
      return true;
    });
  }

  goBack(isBackPress) {
    AppUtils.console('::Scene key ', this.props.sceneKey);
    switch (this.props.sceneKey) {
      case 'WagonProfile':
        isBackPress ? Actions.MyCareWagonDash() : null;
        break;
      case 'Profile':
        Actions.MainScreen();
        break;
      case 'MedicalEquipmentProfile':
        isBackPress ? Actions.drawer() : null;
        break;
      case 'CaregiverProfile':
        isBackPress ? Actions.CaregiverHome() : null;
        break;
      case 'VitalProfile':
        this.goToVital();
        break;
    }

    //(this.props.sceneKey === 'WagonProfile')? Actions.MyCareWagonDash() :Actions.HomeScreen();
  }
  goToVital() {
    Actions.pop();
    setTimeout(() => {
      AppUtils.console('timeout', '----->');
      Actions.refresh({ update: true });
    }, 500);
  }

  async getUserProfile() {
    var self = this;
    self.setState({ isLoading: true });
    AppUtils.console('MYLOG fetchProfile');
    SHApiConnector.fetchProfile(async function (err, stat) {
      self.setState({ isLoading: false });
      AppUtils.console('ProfilData', stat);
      AppUtils.console('dxfgfhvmbj', stat);
      try {
        if (stat.error_code != null && stat.error_code == '10006') {
          Actions.LoginMobile({ screen: 'profile' });
        } else if (stat.userDetails.length == 0) {
          self.setState({
            profilePic: AppStrings.placeholderImg,
            fName: 'N/A',
            lName: ' ',
            age: 'N/A',
            gender: 'N/A',
            mobNumber: stat.userDetails[0].phoneNumber,
            guIdPhoneNumber: stat.userDetails[0].guIdPhoneNumber ? stat.userDetails[0].guIdPhoneNumber : 'NA',
            email: 'N/A',
            NRIC: 'N/A',
            address: 'N/A',
            insurance: 'N/A',
            relatives: stat.familyMembers,
            isDataVisible: true,
            userId: stat.userDetails[0]._id,
          });
        } else {
          var userData = stat.userDetails[0];
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(stat.userDetails[0]));
          if (userData.relativeDetails) {
            self.setState({
              profilePic: userData.profilePic,
              fName: userData.relativeDetails.firstName,
              lName: userData.relativeDetails.lastName,
              age: userData.relativeDetails.dateOfBirth,
              gender: userData.relativeDetails.gender,
              mobNumber: userData.phoneNumber,
              guIdPhoneNumber: stat.userDetails[0].guIdPhoneNumber ? stat.userDetails[0].guIdPhoneNumber : 'NA',
              email: userData.email ? userData.email : 'N/A',
              NRIC: userData.relativeDetails.NRIC,
              insurance: !userData.relativeDetails.insuranceNumber ? strings('common.titles.notAvailable') : userData.relativeDetails.insuranceNumber,
              relatives: stat.familyMembers,
              isDataVisible: true,
              userId: userData._id,
              selfProfileExists: true,
            });
          } else {
            self.setState({
              profilePic: AppStrings.placeholderImg,
              fName: 'N/A',
              lName: ' ',
              age: 'N/A',
              gender: 'N/A',
              mobNumber: stat.userDetails[0].phoneNumber,
              guIdPhoneNumber: stat.userDetails[0].guIdPhoneNumber ? stat.userDetails[0].guIdPhoneNumber : 'NA',
              NRIC: 'N/A',
              email: 'N/A',
              address: 'N/A',
              insurance: 'N/A',
              relatives: stat.familyMembers,
              isDataVisible: true,
              userId: stat.userDetails[0]._id,
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        AppUtils.console('MYLOG', 'finally');
        let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
        let user = JSON.parse(userData);
        self.setState({ isJustLoginUser: user.isJustLoginUser });
        AppUtils.console('MYLOG-', user.isJustLoginUser, self.state.isJustLoginUser);
      }
    });
  }

  editUserProfile() {
    AppUtils.console('zdxicons8-heart-100.pngcdszsf', this.props.sceneKey);
    let selfProfile = this.state.selfProfileExists ? true : false;
    let isWagon = this.props.sceneKey === 'WagonProfile' ? true : false;
    Actions.EditProfile({
      selfProfile: Platform.OS === 'ios' ? true : selfProfile,
      isWagon: isWagon,
      profile: this.props.sceneKey,
    });
  }

  mySubscriptions() {
    Actions.MySubscriptions();
  }

  corporatePlan() {
    Actions.CorporatePlan();
  }

  async getCorporateUserDetails(){
    var self = this;
    self.setState({ isLoading: true });
    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);
    if(user.company == null || user.company == undefined) {
        this.setState({
            corporatePlan: false
        })
        this.getSubscriptionStatus();
        self.setState({ isLoading: false });
    } else {
        this.setState({
            corporatePlan: true
        })
        this.getCorporatePlanStatus();
        self.setState({ isLoading: false });
    }
}

  async getSubscriptionStatus() {
    let response = await SHApiConnector.getUserSubscriptStatus();
    if (response.data.status == 'success') {
      console.log('Profile.js: SubscriptionCount1', JSON.stringify(response.data));
      this.setState({ subscriptionCount: response.data.data.activeSubscriptionCount });
    } else {
      this.setState({ subscriptionCount: 0 });
    }
  }

  async getCorporatePlanStatus() {
    let response = await SHApiConnector.getUserCorporatePlanStatus();
    if (response.data.status == 'success') {
      console.log('Profile.js: CorproatePlanCount', JSON.stringify(response.data));
      this.setState({ corporatePlanCount: response.data.data.packageCount });
    } else {
      this.setState({ corporatePlanCount: 0 });
    }
  }

  renderIOS() {
    AppUtils.console('sdfvdsedv', this.props);
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={5}>
        <TouchableHighlight
          onPress={() => {
            this.goBack(false);
          }}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          {this.props.sceneKey == 'VitalProfile' || this.props.sceneKey == 'Profile' ? (
            <Image
              style={{
                height: moderateScale(30),
                width: moderateScale(30),
                marginTop: hp(4),
                marginLeft: wp(3),
                tintColor: AppColors.blackColor,
              }}
              source={require('../../../assets/images/blackarrow.png')}
            />
          ) : (
            <View />
          )}
        </TouchableHighlight>
        <View
          style={{
            width: cellWidth,
            height: hp('6'),
            marginTop: hp('1'),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text allowFontScaling={false} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: AppUtils.isX ? 0 : 16,
            marginRight: 8,
          }}
        >
          {this.props.title == strings('common.titles.myProfile') || this.props.title == 'My Profile'  ? (
            <TouchableHighlight onPress={() => this.editUserProfile()} underlayColor="transparent">
              <Image
                style={{
                  height: verticalScale(20),
                  width: moderateScale(20),
                  marginRight: moderateScale(8),
                  marginTop: AppUtils.isX ? 16 + 18 : 16,
                  tintColor: 'black',
                }}
                resizeMode={'contain'}
                source={require('../../../assets/images/edit.png')}
              />
            </TouchableHighlight>
          ) : (
            <View />
          )}

          {this.props.sceneKey == 'MyCareWagonHome' ? (
            <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent" style={{ marginRight: 8 }}>
              <Image
                style={{
                  height: moderateScale(25),
                  width: moderateScale(25),
                  marginTop: AppUtils.isX ? 16 + 18 : 0,
                }}
                source={require('../../../assets/images/setting.png')}
              />
            </TouchableHighlight>
          ) : (
            <View />
          )}
        </View>
      </ElevatedView>
    );
  }

  navToHomescreen() {
    Actions.MainScreen();
  }

  renderAndroid() {
    AppUtils.console('sdfvdsedv', this.props);
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row', paddingBottom: hp(3) }]} elevation={5}>
        <TouchableHighlight
          onPress={() => {
            this.goBack(false);
          }}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          {this.props.sceneKey == 'VitalProfile' || this.props.sceneKey == 'Profile' ? (
            <Image
              style={{
                height: moderateScale(30),
                width: moderateScale(30),
                marginTop: hp(4),
                marginLeft: wp(3),
                tintColor: AppColors.blackColor,
              }}
              source={require('../../../assets/images/blackarrow.png')}
            />
          ) : (
            <View />
          )}
        </TouchableHighlight>
        <View
          style={{
            width: cellWidth,
            height: hp('6'),
            marginTop: hp('3'),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text allowFontScaling={false} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: AppUtils.isX ? 0 : 16,
            marginRight: 8,
          }}
        >
          {this.props.title == strings('common.titles.myProfile') || this.props.title == 'My Profile'  ? (
            <TouchableHighlight onPress={() => this.editUserProfile()} underlayColor="transparent">
              <Image
                style={{
                  height: verticalScale(20),
                  width: moderateScale(20),
                  marginRight: moderateScale(8),
                  marginTop: hp('2'),
                  tintColor: 'black',
                }}
                resizeMode={'contain'}
                source={require('../../../assets/images/edit.png')}
              />
            </TouchableHighlight>
          ) : (
            <View />
          )}

          {this.props.sceneKey == 'MyCareWagonHome' ? (
            <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent" style={{ marginRight: 8 }}>
              <Image
                style={{
                  height: moderateScale(25),
                  width: moderateScale(25),
                  marginTop: AppUtils.isX ? 16 + 18 : 0,
                }}
                source={require('../../../assets/images/setting.png')}
              />
            </TouchableHighlight>
          ) : (
            <View />
          )}
        </View>
      </ElevatedView>
    );
  }

  render() {
    return (
      <ScrollView
        style={{
          height: height,
          width: width,
          backgroundColor: AppColors.lightGray,
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}
        <AddOrUpdateAddress
          isOpen={this.state.isAddAddressOpen}
          location={this.state.location}
          addressList={this.state.addressList}
          updateAddressData={this.state.updateAddressData}
          currentAddress={this.state.currentAddress}
          closeModal={() =>
            this.setState({
              isAddAddressOpen: false,
              isAddressOpen: false,
              updateAddressData: {},
            })
          }
          onAddressAddedOrUpdated={(addressList) =>
            this.setState(
              {
                addressList: addressList,
                isAddAddressOpen: false,
                isAddressOpen: false,
                updateAddressData: {},
              },
              () => this.getSelectedAddress(addressList)
            )
          }
        />
        <SelectAddressModal
          isOpen={this.state.isAddressOpen}
          location={this.state.location}
          addressList={this.state.addressList}
          closeModal={() => this.setState({ isAddressOpen: false, isAddAddressOpen: false })}
          addAddress={() =>
            this.setState(
              {
                isAddressOpen: false,
                updateAddressData: {},
                currentAddress: true,
              },
              () => this.setState({ isAddAddressOpen: true })
            )
          }
          selectAddress={(addressList) =>
            this.setState(
              {
                addressList: addressList,
                isAddressOpen: false,
                isAddAddressOpen: false,
              },
              () => this.getSelectedAddress(addressList)
            )
          }
          updateAddress={(updateAddress) =>
            this.setState({
              updateAddressData: updateAddress,
              isAddressOpen: false,
              isAddAddressOpen: true,
              currentAddress: false,
            })
          }
          deleteAddress={(addressList) =>
            this.setState({ addressList: addressList, updateAddressData: {} }, () => this.getSelectedAddress(addressList))
          }
        />

        {this.state.isDataVisible ? (
          <View>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={[AppColors.primaryColor, AppColors.primaryLight]}
              style={{
                width: width,
                height: verticalScale(300),
                alignItems: 'center',
                top: 0,
                bottom: 0,
              }}
            >
              <View
                style={{
                  height: moderateScale(120),
                  width: moderateScale(120),
                  borderRadius: moderateScale(60),
                  backgroundColor: AppColors.whiteColor,
                  justifyContent: 'center',
                  marginTop: moderateScale(15),
                }}
              >
                <CachedImage
                  source={{
                    uri: AppUtils.handleNullImg(this.state.profilePic),
                  }}
                  style={{
                    height: moderateScale(120),
                    width: moderateScale(120),
                    borderRadius: moderateScale(60),
                    alignSelf: 'center',
                  }}
                />
              </View>

              <View
                style={{
                  marginTop: AppUtils.isIphone ? moderateScale(20) : moderateScale(10),
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    color: AppColors.whiteColor,
                    fontSize: moderateScale(15),
                    alignSelf: 'center',
                  }}
                >
                  {this.state.fName} {this.state.lName}
                </Text>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.whiteColor,
                    fontSize: moderateScale(15),
                    alignSelf: 'center',
                  }}
                >
                  {this.state.age == 'N/A' ? 'N/A' : AppUtils.getAgeFromDateOfBirth(this.state.age)} yrs, {this.state.gender}
                </Text>
              </View>
            </LinearGradient>
            <ElevatedView elevation={5} style={styles.speciality}>
              <View style={{ margin: moderateScale(10), flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                    fontSize: moderateScale(12),
                    flex: 1,
                    textAlign: isRTL ? 'left' : 'auto',
                  }}
                >
                  {strings('common.common.mobNumber')}
                </Text>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.textGray,
                    fontSize: moderateScale(12),
                    flex: 1.5,
                    textAlign: isRTL ? 'left' : 'auto',

                  }}
                >
                  {this.state.isJustLoginUser ? this.state.guIdPhoneNumber : this.state.mobNumber}
                </Text>
              </View>
              <View style={{ margin: moderateScale(10), flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                    fontSize: moderateScale(12),
                    flex: 1,
                    textAlign: isRTL ? 'left' : 'auto',
                  }}
                >
                  {strings('common.common.email')}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.textGray,
                    fontSize: moderateScale(12),
                    flex: 1.5,
                    textAlign: isRTL ? 'left' : 'auto',

                  }}
                >
                  {this.state.email}
                </Text>
              </View>
              <View style={{ margin: moderateScale(10), flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                    fontSize: moderateScale(12),
                    flex: 1,
                    textAlign: isRTL ? 'left' : 'auto',
                  }}
                >
                  {strings('common.common.address')}
                </Text>
                <View style={{ flexDirection: 'row', flex: 1.5 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: AppColors.textGray,
                      fontSize: moderateScale(12),
                      flex: 1,
                      textAlign: isRTL ? 'left' : 'auto',
                      marginRight: isRTL ? moderateScale(10) : 0,
                    }}
                  >
                    {this.state.address.address ? this.state.address.address : 'N/A'}
                  </Text>
                  <TouchableOpacity onPress={() => this.setState({ isAddressOpen: true })}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.blueColor,
                        fontSize: moderateScale(12),
                        textAlign: isRTL ? 'left' : 'auto',
                      }}
                    >
                      {strings('common.common.more')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ margin: moderateScale(10), flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                    fontSize: moderateScale(12),
                    flex: 1,
                    textAlign: isRTL ? 'left' : 'auto',
                  }}
                >
                  {strings('common.common.insurance')}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.textGray,
                    fontSize: moderateScale(12),
                    flex: 1.5,
                    textAlign: isRTL ? 'left' : 'auto',

                  }}
                >
                  {this.state.insurance}
                </Text>
              </View>
              { this.state.corporatePlan == false ?
              <View style={{ margin: moderateScale(10), flexDirection: 'row', paddingBottom: 10 }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                    fontSize: moderateScale(12),
                    flex: 1,
                    textAlign: isRTL ? 'left' : 'auto',
                  }}
                >
                  {strings('common.common.subscription')}
                </Text>
                <View style={{ flexDirection: 'row', flex: 1.5 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: AppStyles.fontFamilyMedium,
                      color: this.state.subscriptionCount > 0 ? AppColors.greenColor : AppColors.whiteColor,
                      fontSize: moderateScale(12),
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: this.state.subscriptionCount > 0 ? AppColors.activeStatusColor : AppColors.primaryColor,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    {this.state.subscriptionCount > 0 ? strings('common.common.active') : strings('common.common.noSubscription')}
                  </Text>
                  {this.state.subscriptionCount > 0 ? (
                    <TouchableOpacity onPress={() => this.mySubscriptions()}>
                      <Text
                        numberOfLines={1}
                        style={{
                          paddingLeft: 8,
                          paddingVertical: 3,
                          fontFamily: AppStyles.fontFamilyRegular,
                          color: AppColors.blueColor,
                          fontSize: moderateScale(12),
                        }}
                      >
                        {strings('common.common.viewPlans')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View></View>
                  )}
                </View>
              </View> :
               <View style={{ margin: moderateScale(10), flexDirection: 'row', paddingBottom: 10 }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                    fontSize: moderateScale(12),
                    flex: 1,
                    textAlign: isRTL ? 'left' : 'auto',
                  }}
                >
                  {strings('common.titles.corporatePlan')}
                </Text>
                <View style={{ flexDirection: 'row', flex: 1.5 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: AppStyles.fontFamilyMedium,
                      color: this.state.corporatePlanCount > 0 ? AppColors.greenColor : AppColors.whiteColor,
                      fontSize: moderateScale(12),
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: this.state.corporatePlanCount > 0 ? AppColors.activeStatusColor : AppColors.primaryColor,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      //textAlign: isRTL ? 'left' : 'right',
                      marginLeft: isRTL ? moderateScale(50) : 0,
                    }}
                  >
                    {this.state.corporatePlanCount > 0 ? strings('common.common.active') : strings('common.common.noPlan')}
                  </Text>
                  {this.state.corporatePlanCount > 0 ? (
                    <TouchableOpacity onPress={() => this.corporatePlan()}>
                      <Text
                        numberOfLines={1}
                        style={{
                          paddingLeft: 8,
                          paddingVertical: 3,
                          fontFamily: AppStyles.fontFamilyRegular,
                          color: AppColors.blueColor,
                          fontSize: moderateScale(12),
                          //textAlign: isRTL ? 'left' : 'right',
                          marginLeft: isRTL ? moderateScale(30) : 0,
                        }}
                      >
                        {strings('common.common.viewPlans')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View></View>
                  )}
                </View>
              </View> }

            </ElevatedView>
            {/* <FamilyProfile /> */}

            <View
              style={{
                marginTop: AppUtils.isIphone ? moderateScale(160) : moderateScale(170),
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {!this.state.isJustLoginUser && (
                <TouchableHighlight onPress={() => this.addNew()} underlayColor="transparent">
                  <Text
                    style={{
                      color: AppColors.primaryColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      fontSize: moderateScale(18),
                      justifyContent: 'center',
                    }}
                  >
                    {strings('common.common.manageFM')}
                  </Text>
                </TouchableHighlight>
              )}
              {this.state.relatives.length < 5 && this.state.isJustLoginUser != true ? (
                <TouchableHighlight onPress={() => this.addNew()} underlayColor="transparent">
                  <Image
                    style={{
                      height: moderateScale(25),
                      width: moderateScale(25),
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      alignSelf: 'center',
                      marginLeft: moderateScale(25),
                      marginBottom: moderateScale(4),
                    }}
                    source={require('../../../assets/images/plus.png')}
                  />
                </TouchableHighlight>
              ) : (
                <View />
              )}
            </View>
            <ScrollView>
              <FlatList
                data={this.state.relatives}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this._render_relative(item)}
                bounces={false}
                style={{ margin: 2 }}
                horizontal={true}
              />
            </ScrollView>
          </View>
        ) : (
          <View />
        )}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </ScrollView>
    );
  }

  addNew() {
    let isWagon = this.props.sceneKey === 'WagonProfile' ? true : false;
    Actions.EditProfile({
      selfProfile: false,
      relative: 'new',
      isWagon: isWagon,
      profile: this.props.sceneKey,
    });
  }

  editProfile(id, userCountryCode) {
    AppUtils.console('zdxicons8-heart-100.pngcdszsf', this.props.sceneKey, id, userCountryCode);

    let selfProfile = this.state.selfProfileExists ? true : false;
    let isWagon = this.props.sceneKey === 'WagonProfile' ? true : false;

    Actions.EditProfile({
      selfProfile: false,
      relativeId: id,
      userCountryCode: userCountryCode,
      isWagon: isWagon,
      profile: this.props.sceneKey,
    });
  }

  _render_relative(item) {
    var relativeDetail = item.item.relativeDetails;
    return (
      <ElevatedView
        elevation={6}
        style={{
          height: verticalScale(50),
          width: moderateScale(130),
          alignItems: 'center',
          margin: AppUtils.isIphone ? moderateScale(7) : moderateScale(10),
          borderRadius: AppUtils.isIphone ? moderateScale(8) : moderateScale(10),
          flexDirection: 'row',
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <TouchableHighlight onPress={() => this.editProfile(relativeDetail._id, this.state.userCountryCode)} underlayColor="transparent">
          <CachedImage
            source={{ uri: AppUtils.handleNullImg(relativeDetail.profilePic) }}
            style={{
              marginLeft: moderateScale(3.5),
              width: PixelRatio.getPixelSizeForLayoutSize(12),
              height: PixelRatio.getPixelSizeForLayoutSize(12),
              borderRadius: PixelRatio.getPixelSizeForLayoutSize(15) / 2,
            }}
          />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => this.editProfile(relativeDetail._id, this.state.userCountryCode)} underlayColor="transparent">
          <View style={{ marginLeft: moderateScale(8), flexDirection: 'column' }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: 14,
                color: AppColors.blackColor,
                width: moderateScale(60),
              }}
            >
              {relativeDetail.firstName}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                color: AppColors.textGray,
                fontSize: 12,
              }}
            >
              {relativeDetail.spouse}
            </Text>
          </View>
        </TouchableHighlight>
      </ElevatedView>
    );
  }
}

const styles = StyleSheet.create({
  speciality: {
    alignSelf: 'center',
    marginTop: AppUtils.screenHeight / 2.8,
    height: verticalScale(170),
    width: moderateScale(330),
    backgroundColor: AppColors.whiteColor,
    borderRadius: AppUtils.isIphone ? moderateScale(10) : moderateScale(15),
    position: 'absolute',
    paddingLeft: 13,
    paddingTop: 13,
    justifyContent: 'center',
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
  headerText: {
    color: AppColors.blackColor,
    marginLeft: moderateScale(120),
    marginTop: Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
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
});

export default Profile;
