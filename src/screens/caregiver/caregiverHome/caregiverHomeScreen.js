import React, { Component } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Geocoder from 'react-native-geocoding';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ProgressLoader from 'rn-progress-loader';
import { SHApiConnector } from '../../../network/SHApiConnector';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
//import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import careGiverHomeScreenStyle from './caregiverHomeScreenStyle';
import { Actions } from 'react-native-router-flux';
import { AppStrings } from '../../../shared/AppStrings';
import { moderateScale, verticalScale } from '../../../utils/Scaling';
import { AppUtils } from '../../../utils/AppUtils';
import { AppColors } from '../../../shared/AppColors';
import images from '../../../utils/images';
import MapView, { Marker } from 'react-native-maps';
import ElevatedView from 'react-native-elevated-view';
import SelectAddressModal from '../../../shared/SelectAddressModal';
import AddOrUpdateAddress from '../../../shared/AddOrUpdateAddress';
import AddressView from '../../../shared/AddressView';
import Toast from 'react-native-simple-toast';
import { CachedImage } from '../../../cachedImage';
import { strings } from '../../../locales/i18n';

const { width, height } = Dimensions.get('window');

class caregiverHomeScreen extends Component {
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    AppUtils.analyticsTracker('Caregiver Home Screen');
    let startDate = moment(AppUtils.currentDateTime()).add(2, 'hours');
    let endDate = moment(AppUtils.currentDateTime()).add(3, 'hours');
    let roundStartMin = 30 - (startDate.minute() % 30);
    let roundEndMin = 30 - (endDate.minute() % 30);
    this.state = {
      region: AppStrings.region,

      isPanExpanded: false,
      isLoading: false,
      selected: 0,
      isMale: true,
      isExperienced: true,
      sDate: true,
      eDate: true,
      selectStartDate: true,
      selectEndDate: false,
      selectStartTime: false,
      selectEndTime: false,
      selectedStartDate: moment(startDate).add(roundStartMin, 'minutes'),
      selectedEndDate: moment(endDate).add(roundEndMin, 'minutes'),
      selectedStartTime: moment(startDate).add(roundStartMin, 'minutes'),
      selectedEndTime: moment(endDate).add(roundEndMin, 'minutes'),
      isSelectedStartDate: true,
      serviceDays: 0,
      serviceHours: 0,
      sTime: true,
      eTime: true,
      isSelectedStartTime: true,
      isAddAddressOpen: false,
      finalJobStartDate: new Date(),
      finalJobEndDate: new Date(),
      updateAddressData: {},
      isNationality: true,

      totalHrs: 0,

      isDate: true,

      nightState: false,
      showCalender: false,

      location: '',
      country: '',
      state: '',

      selectedPatientConditionIdx: null,
      patientCondition: [{ condition: 'good', id: 0 }],
      initial: true,
      selectedSubServiceIdx: 0,
      subService: [{ option: 'Medical & Nursing Care', id: 0 }],
      selectedOptionIdx: null,
      service: [],
      option: [{ option: 'Medical & Nursing Care', id: 0, isSelected: true }],
      selectedNationalityIdx: undefined, //0
      nationality: [{ nat: 'Chinese', id: 0, isSelected: true }],
      nationalityList: [],
      selectedLanguageIdx: [], //0,
      language: [{ lang: 'English', id: 0, isSelected: true }],
      languageList: [],
      selectedLanguageLimit: 0,
      langList: [],
      selectedAgeIdx: 0,
      age: AppStrings.age,

      addressList: [],

      patienDetailIndx: 0,
      patienDetailList: [],

      additionalInfo: '',

      selectedAddressIndx: 0,
      selectedAddress: {},

      isNationalityModalOpen: false,
      isAgeModalOpen: false,
      isSubServiceModalOpen: false,
      isPatientConditionModalOpen: false,
      isformConfirmModalOpen: false,
      formData: [],

      isAddressOpen: false,
      serviceVal: '',
      subServiceVal: '',
      ageVal: '',
      nationalityVal: '',
      patientConditionVal: '',
      confirmButton: false,
      currentAddress: false,
      calculatedEndDate: '',
      calculatedStartDate: '',
    };
  }

  checkSameDay(first, second) {
    return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.getData();
    this.getUserCurrentLocation();
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', () => {
        this.goBack();
        return true;
      });
    }
  }

  goBack() {
    AppUtils.console('BackPress', this.state.isPanExpanded);
    if (this.state.isPanExpanded) {
      this.closeForm();
    } else {
      Actions.MainScreen();
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () => {
      Actions.MainScreen();
    });
  }

  async getData() {
    AppUtils.console('GET_Data');
    try {
      const response = await SHApiConnector.getService();
      if (response.data.status) {
        AppUtils.console('GET_SERVICE', response);
        this.getSelectedAddress(response.data.response.userAddress);
        this.setState({
          isLoading: false,
          service: response.data.response.serviceType,
          patientCondition: response.data.response.patientConditionList,
          nationality: response.data.response.countryList,
          nationalityList: response.data.response.countryList,
          language: response.data.response.languageList,
          languageList: response.data.response.languageList,
          patienDetailList: response.data.response.family.relativeDetails,
        });
      } else {
        this.setState({ isLoading: false });
        this.showAlert(response.data.error_message);
      }
    } catch (e) {
      AppUtils.console('Errrror', e);
      this.setState({ isLoading: false });
      this.showAlert(e.response.data.error_message);
    }
  }

  getSelectedAddress(addressList) {
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
    this.setState({
      selectedAddress: selectedAddress,
      addressList: addressList,
    });
  }

  async confirmBooking() {
    this.setState({ isLoading: true, confirmButton: true });
    if (this.state.patienDetailList.length === 0) {
      Toast.show(strings('string.alert.patient_alert'));
    } else if (this.state.addressList.length === 0) {
      Toast.show(strings('string.alert.add_address'));
    } else if (!this.state.selectedAddress._id) {
      Toast.show(strings('string.alert.select_adddress'));
    } else {
      this.setState({ confirmButton: true });
      let data;
      data = this.state.service;
      let serviceTypeID = data[this.state.selectedOptionIdx]._id;

      data = this.state.subService;
      let subServiceTypeID = data[this.state.selectedSubServiceIdx]._id;

      data = this.state.nationalityList;
      let nationality = data[this.state.selectedNationalityIdx].country;

      data = this.state.patientCondition;
      let patientCondition = data[this.state.selectedPatientConditionIdx]._id;

      let minAge, maxAge;
      data = this.state.age;
      if (data[this.state.selectedAgeIdx].ageRange !== '>50') {
        minAge = data[this.state.selectedAgeIdx].ageRange.split('-')[0];
        maxAge = data[this.state.selectedAgeIdx].ageRange.split('-')[1];
      } else {
        minAge = '51';
        maxAge = '100';
      }
      data = this.state.patienDetailList;
      AppUtils.console('xzcsdzsfsd', data, this.state);

      let patientDetail = {
        name: data[this.state.patienDetailIndx].firstName + ' ' + data[this.state.patienDetailIndx].lastName,
        age: Math.floor((new Date() - new Date(data[this.state.patienDetailIndx].dateOfBirth).getTime()) / 3.15576e10),
        gender: data[this.state.patienDetailIndx].gender,
      };

      let object = {
        serviceTypeId: serviceTypeID,
        serviceId: subServiceTypeID,
        additionalInformation: this.state.additionalInfo,
        paymentMethod: AppStrings.label.card,
        jobStartTime: moment(this.state.calculatedStartDate),
        jobEndTime: moment(this.state.calculatedEndDate),
        addressId: this.state.selectedAddress._id,
        minAge: minAge,
        maxAge: maxAge,
        gender: this.state.isMale ? AppStrings.label.male : AppStrings.label.female,
        caregiverType: this.state.isExperienced ? AppStrings.label.send_experience : AppStrings.label.send_fresher,
        languages: this.state.langList,
        caregiverNationality: nationality,
        patientConditionId: patientCondition,
        patientDetail: patientDetail,
        serviceHours: this.state.serviceHours,
        numberOfDays: this.state.serviceDays,
      };

      try {
        AppUtils.console('finaldata', object);
        const response = await SHApiConnector.bookCaregiver(object);
        AppUtils.console('xdvcsdzsfsx', response);
        if (response.data.status) {
          this.setState({ isformConfirmModalOpen: false, isLoading: false });
          Toast.show(strings('common.caregiver.requestSendSuccess'));
          await AsyncStorage.setItem(AppStrings.key.request, 'Request');

          Actions.caregiverTab({ isCaregiverBookingUpdated: true });

          this.closeForm();
        } else {
          this.showAlert(response.data.error_message);
          this.setState({ confirmButton: false });
        }
      } catch (e) {
        AppUtils.console('Caregiver_Error', e);
        this.setState({ confirmButton: false });
        this.showAlert(e.response.data.error_message);
      }
    }
  }

  showAlert(msg, ispop) {
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  async getSubServiceList(indx) {
    let data = this.state.service;
    try {
      const response = await SHApiConnector.getSubService({
        typeId: data[indx]._id,
      });

      if (response.data.status) {
        this.setState({ subService: response.data.response });
      } else {
        this.showAlert(response.data.error_message);
      }
    } catch (e) {
      this.showAlert(e.response.data.error_message);
    }
  }

  changeLanguageList(item) {
    let data = this.state.language;
    data[item.index].isSelected = data[item.index].isSelected ? false : true;

    let langList = this.state.langList;

    let valueToRemove = item.item.language;

    if (data[item.index].isSelected) {
      langList.push(item.item.language);
    } else {
      langList = langList.filter((lanlist) => lanlist !== valueToRemove);
    }

    if (langList.length <= 3) {
      this.setState({
        language: data,
        langList: langList,
      });
    } else {
      Toast.show(strings('string.alert.alert_language'));
    }
    AppUtils.console('LangListData:::', this.state.langList);
  }

  changeListLanguage(data) {
    if (this.state.selectedLanguageLimit == 3 && !data.item.isSelected) {
      Toast.show(strings('string.alert.alert_language'));
    } else {
      var limit = this.state.selectedLanguageLimit;
      var dataList = [];

      AppUtils.console('LanguageList', this.state.language);
      AppUtils.console('LanguageData', data);

      dataList.push(data.item);
      dataList.map((i) => {
        if (i.isSelected) {
          i.isSelected = false;
          limit = limit - 1;
        } else {
          limit = limit + 1;
          i.isSelected = true;
        }
      });
      AppUtils.console('LanguageLimit1', limit);

      this.state.languageList.map((item) => {
        if (item._id == data.item._id) {
        } else {
          if (item.isSelected) {
            dataList.push(item);
          } else {
            item.isSelected = false;
            dataList.push(item);
          }
        }
      });
      AppUtils.console('LanguageNewList', dataList);
      AppUtils.console('LanguageLimit', limit);

      dataList.sort(function (a, b) {
        return b.isSelected - a.isSelected;
      });

      this.setState({ languageList: dataList, selectedLanguageLimit: limit });
    }
  }

  changeListNationality(data) {
    var dataList = [];

    AppUtils.console('NationalityList', this.state.nationalityList);
    dataList.push(data.item);

    this.state.nationality.map((item) => {
      if (item._id == data.item._id) {
      } else {
        dataList.push(item);
      }
    });
    AppUtils.console('NationalityNewList', dataList);
    this.setState({ nationalityList: dataList, selectedNationalityIdx: 0 });
  }

  addProfile() {
    AppUtils.console('zdxicons8-heart-100.pngcdszsf', this.props.sceneKey);
    let isWagon = this.props.sceneKey === 'WagonProfile' ? true : false;
    Actions.EditProfile({
      selfProfile: false,
      relative: 'new',
      isWagon: isWagon,
      profile: this.props.sceneKey,
    });
  }

  renderAddressList(item) {
    AppUtils.console('sdzfxcsdzx', item);
    let address = item.item.address + ', ' + item.item.city + ', ' + item.item.state + ', ' + item.item.country + ', ' + item.item.zipCode;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          this.setState({ selectedAddressIndx: item.index });
        }}
        style={[
          careGiverHomeScreenStyle.addSelectorIndicator,
          {
            backgroundColor: item.index === this.state.selectedAddressIndx ? AppColors.selectAddressBorderColor : 'transparent',
            borderWidth: item.index === this.state.selectedAddressIndx ? 2 : 0,
          },
        ]}
      >
        <View style={careGiverHomeScreenStyle.innerAddressListView}>
          <View style={[careGiverHomeScreenStyle.innerAddressListView1, { justifyContent: item.index === 0 ? null : 'center' }]}>
            <View activeOpacity={0.8} style={careGiverHomeScreenStyle.addressOuterRadio}>
              <View
                style={[
                  careGiverHomeScreenStyle.addressInnerRadio,
                  {
                    backgroundColor: item.index === this.state.selectedAddressIndx ? AppColors.primaryColor : null,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[careGiverHomeScreenStyle.innerAddressListView2, { height: item.index === 0 ? hp(8) : null }]}>
            <Text style={careGiverHomeScreenStyle.title}>{item.item.title}</Text>
            <Text
              style={[
                careGiverHomeScreenStyle.address,
                {
                  color: item.index === 0 ? AppColors.blackColor : AppColors.greenColor3,
                },
              ]}
              numberOfLines={2}
            >
              {address}
            </Text>
          </View>
          <View style={careGiverHomeScreenStyle.innerAddressListView3}>
            <Image style={careGiverHomeScreenStyle.binImage} source={images.editIcon} />

            <Image style={careGiverHomeScreenStyle.binImage} source={images.deleteIcon} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  header() {
    AppUtils.console('sdfzvxzdsfx', this.state.selectedAddress);
    let address = !this.state.selectedAddress.address
      ? this.state.location
      : this.state.selectedAddress.address +
        ', ' +
        this.state.selectedAddress.city +
        ', ' +
        this.state.selectedAddress.state +
        ', ' +
        this.state.selectedAddress.country +
        ', ' +
        this.state.selectedAddress.zipCode;

    return (
      <ElevatedView elevation={5} style={careGiverHomeScreenStyle.header}>
        <TouchableOpacity
          onPress={() => {
            this.setState({ isAddressOpen: true });
          }}
          activeOpacity={0.8}
          style={careGiverHomeScreenStyle.subHeader}
        >
          <View style={careGiverHomeScreenStyle.addressView}>
            <View style={careGiverHomeScreenStyle.innerAddressView}>
              <View style={careGiverHomeScreenStyle.addAddressView}>
                <Text style={careGiverHomeScreenStyle.addressPlaceHolderTxt}>
                  {!this.state.selectedAddress.title ? strings('doctor.text.currentLocation') : this.state.selectedAddress.title}
                </Text>
                <Text style={careGiverHomeScreenStyle.addressTxt} numberOfLines={3}>
                  {address}
                </Text>
              </View>
              <View></View>
              <View style={careGiverHomeScreenStyle.dropDownView}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ isAddAddressOpen: true });
                  }}
                  activeOpacity={0.8}
                  style={{ padding: 10 }}
                >
                  <Image resizeMode={'contain'} style={careGiverHomeScreenStyle.dropDownImage} source={images.arrowDown} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ElevatedView>
    );
  }

  closeAddress() {
    this.setState({
      isAddressOpen: false,
    });
  }

  updateOptionList(id) {
    let data = this.state.service;
    let i = 0;
    for (i; i < data.length; i++) {
      if (id === i) data[i].isEnabled = AppStrings.label.enabled;
      else data[i].isEnabled = AppStrings.label.disabled;
    }
    this.setState({
      service: data,
    });
  }

  renderOptionViews(item, id) {
    return (
      <View
        style={{
          fle: 1,
          width: wp(90 / 2),
          alignItems: item.index % 2 !== 0 ? 'flex-end' : null,
          marginTop: item.index % 2 !== 0 || 1 ? 10 : null,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (this.state.selectedOptionIdx !== item.index) {
              this.setState({
                selectedOptionIdx: item.index,
                selectedSubServiceIdx: null,
                isPanExpanded: true,
              });
              this.getSubServiceList(item.index);
            }
          }}
          activeOpacity={0.8}
          style={[
            careGiverHomeScreenStyle.optionView,
            {
              backgroundColor: this.state.selectedOptionIdx === item.index ? AppColors.primaryColor : AppColors.whiteColor,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              careGiverHomeScreenStyle.optionTxt,
              {
                marginTop: hp(0.5),
                marginLeft: wp(1),
                marginRight: wp(1),
                color: this.state.selectedOptionIdx === item.index ? AppColors.whiteColor : AppColors.greyColor,
              },
            ]}
          >
            {item.item.serviceTypeName}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderNationalityViews(item) {
    AppUtils.console('itemLengthNationality:::', this.state.nationalityList.length);

    return item.index < 8 ? (
      <View
        style={{
          width: wp(80 / 4),
          marginTop: 10,
          marginLeft: item.index % 4 !== 0 ? wp(10 / 4) : wp(0),
        }}
      >
        {item.index < 7 || this.state.nationalityList.length == 8 ? (
          <TouchableOpacity
            activeOpacity={this.state.selectedNationalityIdx === item.index ? 1 : 0.8}
            onPress={() => {
              this.changeListNationality(item);
            }}
            style={[
              careGiverHomeScreenStyle.optionView,
              {
                borderWidth: 1,
                borderRadius: 7,
                width: wp(80 / 4),
                backgroundColor:
                  this.state.selectedNationalityIdx === undefined || this.state.selectedNationalityIdx !== item.index
                    ? AppColors.whiteColor
                    : AppColors.primaryColor,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                careGiverHomeScreenStyle.optionTxt,
                {
                  fontSize: 10,
                  color:
                    this.state.selectedNationalityIdx === undefined || this.state.selectedNationalityIdx !== item.index
                      ? AppColors.blackColor
                      : AppColors.whiteColor,
                },
              ]}
            >
              {item.item.nationality}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              careGiverHomeScreenStyle.optionView,
              {
                borderWidth: 0,
                borderRadius: 7,
                width: wp(80 / 4),
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={careGiverHomeScreenStyle.moreView}
              onPress={() =>
                this.setState({
                  isNationalityModalOpen: true,
                  isNationality: true,
                })
              }
            >
              <Text style={careGiverHomeScreenStyle.moreTxt}>{strings('string.label.more')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ) : (
      <View />
    );
  }

  renderNationalityView_Modal(item) {
    AppUtils.console('sdxczsdxfbg', item);
    return (
      <View
        style={{
          width: wp(70 / 3),
          marginTop: 10,
          marginLeft: item.index % 3 !== 0 ? wp(10 / 4) : wp(0),
        }}
      >
        <TouchableOpacity
          activeOpacity={this.state.selectedNationalityIdx === item.index ? 1 : 0.8}
          onPress={() => {
            this.changeListNationality(item);
          }}
          style={[
            careGiverHomeScreenStyle.optionView,
            {
              borderWidth: 1,
              borderRadius: 7,
              width: wp(70 / 3),
              backgroundColor:
                this.state.selectedNationalityIdx === undefined || this.state.selectedNationalityIdx !== item.index
                  ? AppColors.whiteColor
                  : AppColors.primaryColor,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              careGiverHomeScreenStyle.optionTxt,
              {
                fontSize: 10,
                color:
                  this.state.selectedNationalityIdx === undefined || this.state.selectedNationalityIdx !== item.index
                    ? AppColors.blackColor
                    : AppColors.whiteColor,
              },
            ]}
          >
            {item.item.nationality}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderLanguage_Modal(item) {
    return (
      <View
        style={{
          width: wp(70 / 4),
          marginTop: 10,
          marginLeft: item.index % 4 !== 0 ? wp(5 / 4) : wp(0),
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.changeListLanguage(item);
          }}
          style={[
            careGiverHomeScreenStyle.optionView,
            {
              borderWidth: 1,
              borderRadius: 7,
              width: wp(70 / 4),
              backgroundColor: item.item.isSelected ? AppColors.primaryColor : AppColors.whiteColor,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              careGiverHomeScreenStyle.optionTxt,
              {
                fontSize: 10,
                color: item.item.isSelected ? AppColors.whiteColor : AppColors.blackColor,
              },
            ]}
          >
            {item.item.language}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  nationalityModal() {
    return (
      <Modal
        style={{ justifyContent: 'center', zIndex: 2 }}
        visible={this.state.isNationalityModalOpen}
        onRequestClose={() => this.setState({ isNationalityModalOpen: false })}
        transparent={true}
        key={this.state.isReviewListOpen ? 3 : 4}
      >
        <View
          style={{
            width: wp('100'),
            height: hp('100'),
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <TouchableOpacity style={{ width: wp('100'), height: hp('100') }} onPress={() => this.setState({ isNationalityModalOpen: false })}>
            <View />
          </TouchableOpacity>

          <View style={[careGiverHomeScreenStyle.nationalityModalView, careGiverHomeScreenStyle.modalBox]}>
            {this.state.isNationality ? (
              <FlatList
                data={this.state.nationalityList}
                numColumns={3}
                renderItem={(item) => this.renderNationalityView_Modal(item)}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <FlatList
                data={this.state.languageList}
                numColumns={4}
                renderItem={(item) => this.renderLanguage_Modal(item)}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => this.setState({ isNationalityModalOpen: false })}
              style={[
                careGiverHomeScreenStyle.buttonView,
                {
                  backgroundColor: AppColors.primaryColor,
                  alignSelf: 'center',
                },
              ]}
            >
              <Text
                style={[careGiverHomeScreenStyle.txtStyle1, { color: AppColors.whiteColor }, { marginTop: Platform.OS === 'ios' ? hp(1) : hp(0) }]}
              >
                {strings('string.btnTxt.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderExpandedPan() {
    return (
      <View
        style={[
          careGiverHomeScreenStyle.panHead,
          {
            backgroundColor: AppColors.whiteColor,
            flex: 1,
            borderTopLeftRadius: this.state.isPanExpanded ? 0 : 17,
            borderTopRightRadius: this.state.isPanExpanded ? 0 : 17,
          },
        ]}
      >
        {!this.state.isPanExpanded ? (
          <TouchableOpacity onPress={() => this.setState({ isPanExpanded: true })} style={careGiverHomeScreenStyle.panExpand} />
        ) : (
          <View />
        )}

        <View
          style={[
            careGiverHomeScreenStyle.innerPanHead,
            {
              marginTop: !this.state.isPanExpanded ? hp(2) : hp(4),
            },
          ]}
        >
          <View style={careGiverHomeScreenStyle.headerTxtLine}>
            <Image style={careGiverHomeScreenStyle.adjustImage} source={images.adjust} />
            <Text allowFontScaling={false} style={careGiverHomeScreenStyle.optionHeadTxt}>
              {strings('string.alert.looking_msg')}
            </Text>
          </View>

          <View style={{ flex: 1, marginTop: hp(1) }}>
            <FlatList
              data={this.state.service}
              extraData={this.state}
              renderItem={(item, index) => this.renderOptionViews(item, index)}
              numColumns={2}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </View>
    );
  }

  toggleNightStay() {
    this.setState({
      nightState: !this.state.nightState,
    });
  }

  renderNightStay() {
    return (
      <View style={careGiverHomeScreenStyle.nightStayLine}>
        <Text style={careGiverHomeScreenStyle.nightStayTxt}>{strings('string.label.night')}</Text>
        <Switch
          thumbColor={this.state.nightState ? AppColors.primaryColor : '#F8A1A1'}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          onValueChange={() => this.toggleNightStay()}
          value={this.state.nightState}
        />
      </View>
    );
  }

  closeDateTimeSelector() {
    this.setState({ showCalender: false });
    if (this.state.isDate) {
      if (this.state.isSelectedStartDate) {
        if (this.state.sDate) {
          this.setState({
            sDate: false,
            selectEndDate: true,
            selectStartTime: true,
          });
        }
      } else {
        if (this.state.eDate) {
          this.setState({
            selectStartTime: true,
            eDate: false,
          });
        }
      }
    } else {
      if (this.state.isSelectedStartTime) {
        if (this.state.sTime) {
          this.setState({
            sTime: false,
            selectEndTime: true,
          });
        }
      } else {
        if (this.state.eTime) {
          this.setState({
            eTime: false,
          });
        }
      }
    }
    this.checktime();
  }

  openDateTimeSelector() {
    let _dt = this.state.isDate ? AppUtils.currentDateTime() : null;
    AppUtils.console(
      'zsxcszdcgbvb',
      this.state.selectedStartDate,
      this.state.selectedEndDate,
      AppUtils.currentDateTime(),
      this.state.isDate,
      this.state.isSelectedStartDate
    );
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showCalender}
        onRequestClose={this.close}
        animationType={this.props.animationType}
        key={this.state.isReviewListOpen ? 1 : 2}
      >
        <View style={careGiverHomeScreenStyle.selectorView}>
          <View style={{ flex: 1, justifyContent: 'center', width: width - 30 }}>
            <View style={careGiverHomeScreenStyle.cancelView}>
              <TouchableOpacity onPress={() => this.setState({ showCalender: false })}>
                <Image resizeMode={'contain'} style={careGiverHomeScreenStyle.cancelIcon} source={images.cancelIcon} />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? (
              <View style={{ backgroundColor: AppColors.whiteColor }}>
                <DateTimePicker
                  value={
                    new Date(
                      this.state.isDate
                        ? this.state.isSelectedStartDate
                          ? this.state.selectedStartDate
                          : this.state.selectedEndDate
                        : this.state.isSelectedStartTime
                        ? this.state.selectedStartTime
                        : this.state.selectedEndTime
                    )
                  }
                  mode={this.state.isDate ? 'date' : 'time'}
                  display={'spinner'}
                  style={{ backgroundColor: AppColors.whiteColor }}
                  minimumDate={_dt}
                  minuteInterval={30}
                  onChange={(event, date) => {
                    this.state.isDate
                      ? this.state.isSelectedStartDate
                        ? this.setState({
                            selectedStartDate: date,
                            sDate: false,
                            selectStartTime: true,
                            selectEndDate: true,
                          })
                        : this.setState({
                            selectedEndDate: date,
                            eDate: false,
                            selectStartTime: true,
                          })
                      : this.state.isSelectedStartTime
                      ? this.setState({
                          selectedStartTime: date,
                          sTime: false,
                          selectEndTime: true,
                        })
                      : this.setState({ selectedEndTime: date, eTime: false });
                  }}
                />
              </View>
            ) : // <DatePicker
            //   date={
            //     new Date(
            //       this.state.isDate
            //         ? this.state.isSelectedStartDate
            //           ? this.state.selectedStartDate
            //           : this.state.selectedEndDate
            //         : this.state.isSelectedStartTime
            //         ? this.state.selectedStartTime
            //         : this.state.selectedEndTime
            //     )
            //   }
            //   mode={this.state.isDate ? 'date' : 'time'}
            //   style={{
            //     backgroundColor: AppColors.whiteColor,
            //     width: width - 30,
            //   }}
            //   minuteInterval={30}
            //   minimumDate={_dt}
            //   onDateChange={(date) => {
            //     this.state.isDate
            //       ? this.state.isSelectedStartDate
            //         ? this.setState({
            //             selectedStartDate: date,
            //             sDate: false,
            //             selectEndDate: true,
            //             selectStartTime: true,
            //           })
            //         : this.setState({
            //             selectedEndDate: date,
            //             eDate: false,
            //             selectStartTime: true,
            //           })
            //       : this.state.isSelectedStartTime
            //       ? this.setState({
            //           selectedStartTime: date,
            //           sTime: false,
            //           selectedEndTime: true,
            //         })
            //       : this.setState({ selectedEndTime: date, eTime: false });
            //   }}
            // />
            null}
            <TouchableHighlight
              onPress={() => {
                this.closeDateTimeSelector();
              }}
              underlayColor="transparent"
            >
              <View style={careGiverHomeScreenStyle.dateView}>
                <Text allowFontScaling={false} style={careGiverHomeScreenStyle.dateText}>
                  {this.state.isDate
                    ? moment
                        .parseZone(this.state.isSelectedStartDate ? this.state.selectedStartDate : this.state.selectedEndDate)
                        .format('MMM DD YYYY')
                    : moment
                        .parseZone(this.state.isSelectedStartTime ? this.state.selectedStartTime : this.state.selectedEndTime)
                        .format('hh : mm A')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  showDateCalender(startOrEndDate) {
    if (startOrEndDate === 'START_DATE') {
      this.setState({
        showCalender: true,
        isSelectedStartDate: true,
        isDate: true,
      });
    } else if (startOrEndDate === 'END_DATE') {
      if (this.state.selectEndDate) {
        let startDate = moment(this.state.selectedStartDate, 'DD.MM.YYYY'); //Date format
        let endDate = moment(this.state.selectedEndDate, 'DD.MM.YYYY');
        let isAfter = moment(startDate).isAfter(endDate);
        this.setState(
          {
            selectedEndDate: isAfter ? this.state.selectedStartDate : this.state.selectedEndDate,
          },
          () =>
            this.setState({
              showCalender: true,
              isSelectedStartDate: false,
              isDate: true,
            })
        );
      } else {
        Toast.show(strings('string.alert.alert_date'));
      }
    }
  }

  renderSelectDate() {
    let till = moment(this.state.selectedEndDate).format('DD MMM, YYYY');
    let from = moment(this.state.selectedStartTime).format('hh : mm A');
    AppUtils.console('sdzxcdfg', this.state.eDate);
    return (
      <View style={careGiverHomeScreenStyle.nightStayLine}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => this.showDateCalender('START_DATE')} style={careGiverHomeScreenStyle.timeBox}>
          {!this.state.selectedStartDate || this.state.sDate ? (
            <Text style={careGiverHomeScreenStyle.txtStyle2}>{strings('string.label.start_date')}</Text>
          ) : (
            <Text style={careGiverHomeScreenStyle.txtStyle2}>{moment(this.state.selectedStartDate).format('DD MMM, YYYY')}</Text>
          )}
        </TouchableOpacity>
        <Image style={careGiverHomeScreenStyle.leftRightArrowsImage} source={images.leftRightArrows} />
        <TouchableOpacity activeOpacity={0.8} onPress={() => this.showTimeCalender('START_TIME')} style={careGiverHomeScreenStyle.timeBox}>
          {this.state.selectedStartTime === undefined || this.state.sTime ? (
            <Text style={careGiverHomeScreenStyle.txtStyle2}>{strings('string.label.start_time')}</Text>
          ) : (
            <Text style={careGiverHomeScreenStyle.txtStyle2}>{from}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  showTimeCalender(startOrEndTime) {
    if (startOrEndTime === 'START_TIME') {
      if (this.state.selectStartTime) {
        this.setState({
          showCalender: true,
          isSelectedStartTime: true,
          isDate: false,
        });
      } else {
        Toast.show(strings('string.alert.alert_date'));
      }
    } else if (startOrEndTime === 'END_TIME') {
      let startTime = moment(this.state.selectedStartTime); //Date format
      let endTime = moment(this.state.selectedEndTime);
      let isAfter = moment(startTime).isAfter(endTime);

      endTime = isAfter ? startTime : moment(endTime);
      let roundEndMin = 30 - (endTime.minute() % 30);
      if (this.state.selectEndTime) {
        this.setState({
          showCalender: true,
          isSelectedStartTime: false,
          isDate: false,
          selectedEndTime: moment(endTime).add(roundEndMin, 'minutes'),
        });
      } else {
        Toast.show(strings('string.alert.alert_time'));
      }
    }
  }

  setServiceHours(val) {
    if (!val || val <= 24) {
      this.setState({ serviceHours: val });
    } else {
      Toast.show(strings('string.alert.alert_hour'));
      this.setState({ serviceHours: this.state.serviceHours });
    }
  }

  setServiceDays(val) {
    AppUtils.console('sdzdfxgcnvh', val);
    if (!val || val > 0) {
      this.setState({ serviceDays: val });
    } else {
      Toast.show(strings('string.alert.alert_day'));
      this.setState({ serviceDays: this.state.serviceDays });
    }
  }

  renderSelectTime() {
    let from = moment(this.state.selectedStartTime).format('hh : mm A');
    let till = moment(this.state.selectedEndTime).format('hh : mm A');
    return (
      <View style={careGiverHomeScreenStyle.nightStayLine}>
        <TextInput
          allowFontScaling={false}
          value={this.state.serviceDays}
          style={[careGiverHomeScreenStyle.timeBox, { padding: 0 }]}
          multiline={true}
          numberOfLines={1}
          maxLength={3}
          keyboardType="numeric"
          onChangeText={(val) => this.setServiceDays(val)}
          placeholder={strings('string.label.days')}
          placeholderTextColor={AppColors.textGray}
        />

        <Image style={careGiverHomeScreenStyle.leftRightArrowsImage} source={images.leftRightArrows} />
        <TextInput
          allowFontScaling={false}
          value={this.state.serviceHours}
          style={[careGiverHomeScreenStyle.timeBox, { padding: 0 }]}
          multiline={true}
          numberOfLines={1}
          keyboardType="numeric"
          maxLength={2}
          onChangeText={(val) => this.setServiceHours(val)}
          placeholder={strings('string.label.hours')}
          placeholderTextColor={AppColors.textGray}
        />
      </View>
    );
  }

  renderAgeView_Modal(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ selectedAgeIdx: item.index, isAgeModalOpen: false });
        }}
        style={{ marginTop: item.index !== 0 ? 10 : 0, alignItems: 'center' }}
      >
        <Text
          style={[
            careGiverHomeScreenStyle.nationalityTxt,
            {
              color: item.index !== this.state.selectedAgeIdx ? AppColors.textGray : AppColors.blackColor,
            },
          ]}
        >
          {item.item.ageRange}
        </Text>
      </TouchableOpacity>
    );
  }

  ageModal() {
    return (
      <Modal
        style={{ justifyContent: 'center', zIndex: 2 }}
        visible={this.state.isAgeModalOpen}
        onRequestClose={() => this.setState({ isAgeModalOpen: false })}
        transparent={true}
        key={this.state.isAgeModalOpen ? 5 : 6}
      >
        <View style={careGiverHomeScreenStyle.openView}>
          <TouchableOpacity style={{ width: wp('100'), height: hp('100') }} onPress={() => this.setState({ isAgeModalOpen: false })}>
            <View />
          </TouchableOpacity>

          <View style={[careGiverHomeScreenStyle.ageModalView, careGiverHomeScreenStyle.modalBox]}>
            <FlatList
              data={this.state.age}
              extraData={this.state}
              renderItem={(item) => this.renderAgeView_Modal(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </Modal>
    );
  }

  ageGenderRow() {
    let data = this.state.age;
    return (
      <View style={careGiverHomeScreenStyle.ageGenderRowStyle}>
        <View style={careGiverHomeScreenStyle.Box}>
          <Text style={careGiverHomeScreenStyle.softHeading}>{strings('string.label.age')}</Text>
          <TouchableOpacity onPress={() => this.setState({ isAgeModalOpen: true })} activeOpacity={0.8} style={careGiverHomeScreenStyle.ageView}>
            <Text style={[careGiverHomeScreenStyle.txtStyle1, { fontSize: 14 }]}>{data[this.state.selectedAgeIdx].ageRange}</Text>
            <Image style={careGiverHomeScreenStyle.dropDownImage2} source={images.arrowDown} />
          </TouchableOpacity>
        </View>

        <View style={careGiverHomeScreenStyle.Box}>
          <Text style={careGiverHomeScreenStyle.softHeading}>{strings('string.label.gender')}</Text>
          <View style={careGiverHomeScreenStyle.ageView}>
            <TouchableOpacity activeOpacity={this.state.isMale ? 1 : 0.5} onPress={() => this.setState({ isMale: true })}>
              <Text
                style={[
                  careGiverHomeScreenStyle.genderTxt,
                  {
                    color: this.state.isMale ? AppColors.primaryColor : AppColors.genderTxt,
                  },
                ]}
              >
                {strings('string.label.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={!this.state.isMale ? 1 : 0.5} onPress={() => this.setState({ isMale: false })}>
              <Text
                style={[
                  careGiverHomeScreenStyle.genderTxt,
                  {
                    color: !this.state.isMale ? AppColors.primaryColor : AppColors.genderTxt,
                  },
                ]}
              >
                {strings('string.label.female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  nationalityView() {
    return (
      <View style={careGiverHomeScreenStyle.nationalityView}>
        <Text allowFontScaling={false} style={careGiverHomeScreenStyle.softHeading}>
          {strings('string.label.nationality')}
        </Text>
        <View style={careGiverHomeScreenStyle.nationalityInnerView}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={this.state.nationalityList}
              extraData={this.state}
              renderItem={(item) => this.renderNationalityViews(item)}
              numColumns={4}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </View>
    );
  }

  renderLanguageViews(item) {
    AppUtils.console('itemLanguage :::', item);

    AppUtils.console('itemLengthLanguage :::', this.state.languageList.length);

    return item.index < 8 ? (
      <View
        style={{
          width: wp(80 / 4),
          marginTop: 10,
          marginLeft: item.index % 4 !== 0 ? wp(10 / 4) : wp(0),
        }}
      >
        {item.index < 7 || this.state.languageList.length == 8 ? (
          <TouchableOpacity
            onPress={() => {
              this.changeListLanguage(item);
            }}
            style={[
              careGiverHomeScreenStyle.optionView,
              {
                borderWidth: 1,
                borderRadius: 7,
                width: wp(80 / 4),
                backgroundColor: item.item.isSelected ? AppColors.primaryColor : AppColors.whiteColor,
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                careGiverHomeScreenStyle.optionTxt,
                {
                  fontSize: 10,
                  color: item.item.isSelected ? AppColors.whiteColor : AppColors.blackColor,
                },
              ]}
            >
              {item.item.language}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              careGiverHomeScreenStyle.optionView,
              {
                borderWidth: 0,
                borderRadius: 7,
                width: wp(80 / 4),
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={careGiverHomeScreenStyle.moreView}
              onPress={() =>
                this.setState({
                  isNationalityModalOpen: true,
                  isNationality: false,
                })
              }
            >
              <Text allowFontScaling={false} style={careGiverHomeScreenStyle.moreTxt}>
                {strings('string.label.more')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ) : (
      <View />
    );
  }

  languageView() {
    return (
      <View style={careGiverHomeScreenStyle.nationalityView}>
        <Text style={careGiverHomeScreenStyle.softHeading}>{strings('string.label.language')}</Text>
        <View style={careGiverHomeScreenStyle.nationalityInnerView}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={this.state.languageList}
              extraData={this.state}
              renderItem={(item) => this.renderLanguageViews(item)}
              numColumns={4}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </View>
    );
  }

  caregiverType() {
    return (
      <View>
        <Text allowFontScaling={false} style={careGiverHomeScreenStyle.softHeading}>
          {strings('string.label.type')}
        </Text>
        <View style={careGiverHomeScreenStyle.radioRowView}>
          <View style={careGiverHomeScreenStyle.radioView}>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  isExperienced: true,
                })
              }
              activeOpacity={0.8}
              style={careGiverHomeScreenStyle.outerRadio}
            >
              <View
                style={[
                  careGiverHomeScreenStyle.innerRadio,
                  {
                    backgroundColor: this.state.isExperienced ? AppColors.primaryColor : 'transparent',
                  },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  isExperienced: true,
                })
              }
              activeOpacity={0.8}
            >
              <Text
                allowFontScaling={false}
                style={[
                  careGiverHomeScreenStyle.txtStyle1,
                  {
                    marginLeft: wp(2),
                    marginBottom: hp(1),
                    marginTop: Platform.OS ? hp(1) : hp(0),
                  },
                ]}
              >
                {strings('string.label.experienced')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={careGiverHomeScreenStyle.radioView}>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  isExperienced: false,
                })
              }
              activeOpacity={0.8}
              style={careGiverHomeScreenStyle.outerRadio}
            >
              <View
                style={[
                  careGiverHomeScreenStyle.innerRadio,
                  {
                    backgroundColor: !this.state.isExperienced ? AppColors.primaryColor : 'transparent',
                  },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  isExperienced: false,
                })
              }
              activeOpacity={0.8}
            >
              <Text
                allowFontScaling={false}
                style={[
                  careGiverHomeScreenStyle.txtStyle1,
                  {
                    marginLeft: wp(2),
                    marginBottom: hp(1),
                    marginTop: Platform.OS ? hp(1) : hp(0),
                  },
                ]}
              >
                {strings('string.label.fresher')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  renderSubServiceView_Modal(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            selectedSubServiceIdx: item.index,
            isSubServiceModalOpen: false,
            initial: false,
          });
        }}
        style={{
          marginTop: item.index !== 0 ? 10 : 0,
          paddingBottom: hp('1.5'),
        }}
      >
        <Text
          allowFontScaling={false}
          style={[
            careGiverHomeScreenStyle.nationalityTxt,
            {
              color:
                this.state.selectedSubServiceIdx === null || item.index !== this.state.selectedSubServiceIdx || this.state.initial
                  ? AppColors.textGray
                  : AppColors.blackColor,
            },
          ]}
        >
          {item.item.service}
        </Text>
      </TouchableOpacity>
    );
  }

  subServiceModal() {
    let data = this.state.subService;

    return (
      <Modal
        style={{ justifyContent: 'center', zIndex: 2 }}
        visible={this.state.isSubServiceModalOpen}
        onRequestClose={() => this.setState({ isSubServiceModalOpen: false })}
        transparent={true}
        key={this.state.isSubServiceModalOpen ? 7 : 8}
      >
        <View style={careGiverHomeScreenStyle.openView}>
          <TouchableOpacity style={{ width: wp('100'), height: hp('100') }} onPress={() => this.setState({ isSubServiceModalOpen: false })}>
            <View />
          </TouchableOpacity>

          <View
            style={[
              {
                width: wp(60),
                alignItems: 'center',
                height: data.length > 6 ? 300 : null,
              },
              careGiverHomeScreenStyle.modalBox,
            ]}
          >
            <Text allowFontScaling={false} style={{ width: wp('40'), height: hp('5') }}>
              {strings('string.label.services')}{' '}
            </Text>

            <FlatList
              data={this.state.subService}
              showsVerticalScrollIndicator={false}
              extraData={this.state}
              renderItem={(item) => this.renderSubServiceView_Modal(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </Modal>
    );
  }

  subService() {
    let data = this.state.subService;
    let indx = this.state.selectedOptionIdx;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => this.setState({ isSubServiceModalOpen: true })}
        style={careGiverHomeScreenStyle.subServiceView}
      >
        {
          //this.state.selectedSubServiceIdx === null ?
          this.state.initial || this.state.selectedSubServiceIdx === null ? (
            <Text allowFontScaling={false} style={careGiverHomeScreenStyle.txtStyle2}>
              {strings('string.label.select_service')}
            </Text>
          ) : (
            <Text allowFontScaling={false} style={careGiverHomeScreenStyle.txtStyle2}>
              {data[this.state.selectedSubServiceIdx].service}
            </Text>
          )
        }
        <Image style={careGiverHomeScreenStyle.dropDownImage2} source={images.arrowDown} />
      </TouchableOpacity>
    );
  }

  renderPatientConditionView_Modal(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            selectedPatientConditionIdx: item.index,
            isPatientConditionModalOpen: false,
          });
        }}
        style={{
          marginTop: item.index !== 0 ? 10 : 0,
          paddingBottom: hp('1.5'),
        }}
      >
        <Text
          allowFontScaling={false}
          style={[
            careGiverHomeScreenStyle.nationalityTxt,
            {
              color:
                this.state.selectedPatientConditionIdx === null || item.index !== this.state.selectedPatientConditionIdx
                  ? AppColors.textGray
                  : AppColors.blackColor,
            },
          ]}
        >
          {item.item.conditionType}
        </Text>
      </TouchableOpacity>
    );
  }

  patientConditionModal() {
    let data = this.state.patientCondition;
    return (
      <Modal
        style={{ justifyContent: 'center', zIndex: 2, backgroundColor: 'red' }}
        visible={this.state.isPatientConditionModalOpen}
        onRequestClose={() => this.setState({ isPatientConditionModalOpen: false })}
        transparent={true}
        key={this.state.isPatientConditionModalOpen ? 9 : 10}
      >
        <View style={careGiverHomeScreenStyle.openView}>
          <TouchableOpacity style={{ width: wp('100'), height: hp('100') }} onPress={() => this.setState({ isPatientConditionModalOpen: false })}>
            <View />
          </TouchableOpacity>

          <View
            style={[
              {
                width: wp(60),
                alignItems: 'center',
                height: data.length > 6 ? 300 : null,
              },
              careGiverHomeScreenStyle.modalBox,
            ]}
          >
            <Text allowFontScaling={false} style={{ width: wp('38'), height: hp('5') }}>
              {strings('string.label.condition')}{' '}
            </Text>
            <FlatList
              data={this.state.patientCondition}
              showsVerticalScrollIndicator={false}
              extraData={this.state}
              renderItem={(item) => this.renderPatientConditionView_Modal(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </Modal>
    );
  }

  patientCondition() {
    let data = this.state.patientCondition;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => this.setState({ isPatientConditionModalOpen: true })}
        style={careGiverHomeScreenStyle.subServiceView}
      >
        {this.state.selectedPatientConditionIdx === null ? (
          <Text allowFontScaling={false} style={careGiverHomeScreenStyle.txtStyle2}>
            {strings('string.label.condition')}
          </Text>
        ) : (
          <Text allowFontScaling={false} style={careGiverHomeScreenStyle.txtStyle2}>
            {data[this.state.selectedPatientConditionIdx].conditionType}
          </Text>
        )}

        <Image style={careGiverHomeScreenStyle.dropDownImage2} source={images.arrowDown} />
      </TouchableOpacity>
    );
  }

  additionalInfo() {
    return (
      <View style={careGiverHomeScreenStyle.additionalInfoView}>
        <TextInput
          allowFontScaling={false}
          value={this.state.additionalInfo}
          style={careGiverHomeScreenStyle.additionalInfoTxt}
          textAlignVertical={'top'}
          multiline={true}
          numberOfLines={5}
          maxLength={200}
          onChangeText={(val) =>
            this.setState({
              additionalInfo: val,
            })
          }
          placeholder={strings('string.label.information')}
          placeholderTextColor={AppColors.textGray}
        />
      </View>
    );
  }

  validateFormData() {
    let selectedDateTime = new Date(
      moment(this.state.selectedStartDate).format('MM/DD/YYYY') + moment(this.state.selectedStartTime).format(' HH:mm')
    );
    selectedDateTime = moment(selectedDateTime);
    let diff = selectedDateTime.diff(AppUtils.currentDateTime());
    AppUtils.console('zdazsfxgbv', diff / (60 * 60000), Number(diff), this.state.serviceHours);
    if (!this.state.selectedAddress.address) {
      Alert.alert(
        strings('string.label.add_address'),
        strings('string.alert.alert_address'),
        [
          {
            text: strings('string.label.cancel'),
            style: 'cancel',
          },
          {
            text: strings('string.label.add_address'),
            onPress: () => this.setState({ isAddAddressOpen: true }),
          },
        ],
        { cancelable: false }
      );
    } else if (this.state.initial) {
      this.showAlert(strings('string.label.select_service'));
    } else if (this.state.sDate === true) {
      this.showAlert(strings('string.label.select_date'));
    } else if (this.state.sTime === true) {
      this.showAlert(strings('string.label.select_time'));
    } else if (diff / (60 * 60000) <= 2) {
      this.showAlert(strings('string.alert.request_limit') + '' + moment(AppUtils.currentDateTime()).add(2, 'hours').format('MM/DD/YYYY HH:mm'));
    } else if (parseInt(this.state.serviceDays) <= 0) {
      this.showAlert(strings('string.alert.days_limit'));
    } else if (parseInt(this.state.serviceHours) <= 0) {
      this.showAlert(strings('string.alert.hour_limit'));
    } else if (this.state.selectedNationalityIdx === undefined) {
      this.showAlert(strings('string.alert.select_nationality'));
    } else if (this.state.selectedPatientConditionIdx === null) {
      this.showAlert(strings('string.alert.select_patient'));
    } else {
      this.generateFormSummary();
      this.setState({ isformConfirmModalOpen: true });
    }
  }

  checktime() {
    let selectedDateTime = new Date(
      moment(this.state.selectedStartDate).format('MM/DD/YYYY') + moment(this.state.selectedStartTime).format(' HH:mm')
    );
    selectedDateTime = moment(selectedDateTime);

    let diff = selectedDateTime.diff(AppUtils.currentDateTime());

    if (diff / (60 * 60000) <= 2) {
      this.showAlert(strings('string.alert.request_limit') + '' + moment(AppUtils.currentDateTime()).add(2, 'hours').format('MM/DD/YYYY HH:mm'));
    } else {
      if (Platform.OS === 'ios') {
        this.state.selectedStartDate = selectedDateTime;
      } else {
      }
    }
  }

  getHrs(sDate, eDate) {
    AppUtils.console('xzcxzdszdcsvxfv', sDate, eDate, this.state.selectedEndDate);
    let res = this.checkSameDay(sDate, eDate);

    let msec, mins, hrs, days, yrs, reminder;

    msec = eDate - sDate;
    mins = Math.floor(msec / 60000);
    hrs = Math.floor(mins / 60);
    reminder = mins % 60 < 10 ? '0' + (mins % 60) : mins % 60;
    days = Math.floor(hrs / 24);
    yrs = Math.floor(days / 365);

    if (!res) {
      let newEndDate, msec2, mins2, hrs2;
      let locDays = days + 1;

      newEndDate = new Date(moment(sDate).format('MM/DD/YYYY') + moment(eDate).format(' HH:mm:sss'));

      msec2 = (newEndDate - sDate) * locDays;
      mins2 = Math.floor(msec2 / 60000);
      hrs2 = Math.floor(mins2 / 60);
      reminder = mins2 % 60 < 10 ? '0' + (mins2 % 60) : mins2 % 60;

      AppUtils.console('xzcxzdszdcsvxfv2', newEndDate, msec2, mins2, hrs2, locDays);
      return hrs2 + ':' + reminder;
    } else {
      return hrs + ':' + reminder;
    }
  }

  generateFormSummary() {
    var langList = [];

    AppUtils.console('LanguageListConfirm', this.state.languageList);

    this.state.languageList.map((i) => {
      if (i.isSelected) {
        langList.push(i.language);
      }
    });
    AppUtils.console('LanguageLimit1', langList);
    this.setState({ langList: langList });

    let data = this.state.service;
    this.setState({
      serviceVal: data[this.state.selectedOptionIdx].serviceTypeName,
    });

    data = this.state.subService;
    let addDays = this.state.serviceDays - 1;
    this.setState({
      subServiceVal: data[this.state.selectedSubServiceIdx].service,
    });

    let finalJobStartDate = moment(this.state.selectedStartDate).format('dddd, MMMM D, YYYY h:mm A');
    let finalJobEndDate = moment(this.state.selectedStartDate)
      .add({
        hours: this.state.serviceHours,
        days: addDays,
      })
      .format('dddd, MMMM D, YYYY h:mm A');
    let totalHours = parseInt(this.state.serviceDays) * parseInt(this.state.serviceHours);
    AppUtils.console('RequestForm ', finalJobStartDate, finalJobEndDate, this.state.serviceDays, totalHours);

    this.setState({
      finalJobStartDate: finalJobStartDate,
      finalJobEndDate: finalJobEndDate,
      totalHrs: totalHours,
      calculatedEndDate: moment(this.state.selectedStartDate).add({
        hours: this.state.serviceHours,
        days: addDays,
      }),
      calculatedStartDate: this.state.selectedStartDate,
    });

    data = this.state.age;
    this.setState({ ageVal: data[this.state.selectedAgeIdx].ageRange });

    data = this.state.nationalityList;
    this.setState({
      nationalityVal: data[this.state.selectedNationalityIdx].country,
    });

    data = this.state.patientCondition;
    this.setState({
      patientConditionVal: data[this.state.selectedPatientConditionIdx].conditionType,
    });
    console.log('form summary', finalJobStartDate, finalJobEndDate, this.state.serviceDays, totalHours);
  }

  closeForm() {
    let startDate = moment(AppUtils.currentDateTime()).add(2, 'hours');
    let endDate = moment(AppUtils.currentDateTime()).add(3, 'hours');
    let roundStartMin = 30 - (startDate.minute() % 30);
    let roundEndMin = 30 - (endDate.minute() % 30);

    this.setState({
      selectedStartDate: moment(startDate).add(roundStartMin, 'minutes'),
      selectedEndDate: moment(endDate).add(roundEndMin, 'minutes'),
      selectedStartTime: moment(startDate).add(roundStartMin, 'minutes'),
      selectedEndTime: moment(endDate).add(roundEndMin, 'minutes'),
      nightState: false,
      isMale: true,
      additionalInfo: '',
      initial: true,
      langList: [],
      isPanExpanded: false,
      confirmButton: false,
    });
  }

  buttonRow() {
    return (
      <View style={careGiverHomeScreenStyle.buttonRowView}>
        <TouchableOpacity onPress={() => this.closeForm()} activeOpacity={0.8} style={careGiverHomeScreenStyle.buttonView}>
          <Text allowFontScaling={false} style={[careGiverHomeScreenStyle.txtStyle1, { marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0) }]}>
            {strings('string.btnTxt.cancel')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => this.validateFormData()}
          style={[careGiverHomeScreenStyle.buttonView, { backgroundColor: AppColors.primaryColor }]}
        >
          <Text
            allowFontScaling={false}
            style={[careGiverHomeScreenStyle.txtStyle1, { color: AppColors.whiteColor }, { marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0) }]}
          >
            {strings('string.btnTxt.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderForm() {
    return (
      <View style={careGiverHomeScreenStyle.form}>
        <View style={{ width: wp(90) }}>
          {this.subService()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.renderSelectDate()}
          {/* <View style={careGiverHomeScreenStyle.gapBy} /> */}
          {/* {this.renderNightStay()} */}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.renderSelectTime()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.ageGenderRow()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.nationalityView()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.languageView()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.caregiverType()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.renderPatienDetails()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.patientCondition()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.additionalInfo()}
          <View style={careGiverHomeScreenStyle.gapBy} />
          {this.buttonRow()}
          <View style={careGiverHomeScreenStyle.gapBy} />
        </View>
      </View>
    );
  }

  formConfirmModal() {
    let patientName = '';
    let age = '';
    let patientDetail = this.state.patienDetailList;

    if (patientDetail[this.state.patienDetailIndx] !== undefined) {
      patientName = patientDetail[this.state.patienDetailIndx].firstName + ' ' + patientDetail[this.state.patienDetailIndx].lastName;
      age = moment(new Date()).format('YYYY') - moment(patientDetail[this.state.patienDetailIndx].dateOfBirth).format('YYYY');
    }

    let address = AppUtils.getAddress(this.state.selectedAddress);
    //patientDetail[this.state.patienDetailIndx].name
    //let age = moment(new Date()).format("YYYY") - moment(patientDetail[0].dateOfBirth).format("YYYY")
    return (
      <Modal
        style={{ justifyContent: 'center', zIndex: 2 }}
        visible={this.state.isformConfirmModalOpen}
        onRequestClose={() => this.setState({ isformConfirmModalOpen: false })}
        transparent={true}
        key={this.state.isformConfirmModalOpen ? 11 : 12}
      >
        <View style={careGiverHomeScreenStyle.openView}>
          <TouchableOpacity style={{ width: wp('100'), height: hp('100') }} onPress={() => this.setState({ isformConfirmModalOpen: false })}>
            <View />
          </TouchableOpacity>

          <View style={careGiverHomeScreenStyle.confirmModalBox}>
            <View style={careGiverHomeScreenStyle.redBarView}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => this.setState({ isformConfirmModalOpen: false })}
                style={careGiverHomeScreenStyle.closeIconView}
              >
                <Image style={careGiverHomeScreenStyle.cancelIcon} source={images.cancelIcon} />
              </TouchableOpacity>
              <View style={careGiverHomeScreenStyle.redBarInnerView}>
                <Text style={careGiverHomeScreenStyle.redBarTxt}>{strings('string.label.please_msg')}</Text>
                <Text style={careGiverHomeScreenStyle.redBarTxt}>{strings('string.label.requirement')}</Text>
              </View>
            </View>

            <View style={careGiverHomeScreenStyle.viewBelowredBarView}>
              <View style={careGiverHomeScreenStyle.viewBelowredBarView1}>
                <ScrollView>
                  <View style={careGiverHomeScreenStyle.modalListContentView}>
                    <View style={careGiverHomeScreenStyle.modalListContentInnerView}>
                      <View style={careGiverHomeScreenStyle.modalListContentViewHead}>
                        <Text numberOfLines={2} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {strings('string.label.location')}
                        </Text>
                      </View>
                      <View style={careGiverHomeScreenStyle.modalListContentViewTail}>
                        <Text style={careGiverHomeScreenStyle.modalListContentViewTxt}>{address}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={careGiverHomeScreenStyle.modalListContentView}>
                    <View style={careGiverHomeScreenStyle.modalListContentInnerView}>
                      <View style={careGiverHomeScreenStyle.modalListContentViewHead}>
                        <Text numberOfLines={2} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {strings('string.label.looking_for')}
                        </Text>
                      </View>
                      <View style={careGiverHomeScreenStyle.modalListContentViewTail}>
                        <Text numberOfLines={1} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {this.state.serviceVal}
                        </Text>
                        <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}>{this.state.subServiceVal}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={careGiverHomeScreenStyle.modalListContentView}>
                    <View style={careGiverHomeScreenStyle.modalListContentInnerView}>
                      <View style={careGiverHomeScreenStyle.modalListContentViewHead}>
                        <Text numberOfLines={2} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {strings('string.label.date')}
                        </Text>
                      </View>
                      <View style={careGiverHomeScreenStyle.modalListContentViewTail}>
                        <Text numberOfLines={1} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {moment(this.state.calculatedStartDate).format('DD MMM, YYYY')} -{' '}
                          {moment(this.state.calculatedEndDate).format('DD MMM, YYYY')}
                        </Text>
                        <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}>
                          {moment(this.state.calculatedStartDate).format('hh:mm A')} - {moment(this.state.calculatedEndDate).format('hh:mm A')} [
                          {this.state.totalHrs} Hrs]
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={careGiverHomeScreenStyle.modalListContentView}>
                    <View style={careGiverHomeScreenStyle.modalListContentInnerView}>
                      <View style={careGiverHomeScreenStyle.modalListContentViewHead}>
                        <Text numberOfLines={1} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {strings('string.label.nurse')}{' '}
                        </Text>
                        <Text numberOfLines={1} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {strings('string.label.preferences')}{' '}
                        </Text>
                      </View>

                      <View style={careGiverHomeScreenStyle.modalListContentViewTail}>
                        <Text numberOfLines={1} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {this.state.isExperienced ? strings('string.label.experienced') : strings('string.label.fresher')}
                        </Text>
                        {this.state.isMale ? (
                          <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}> {this.state.ageVal}</Text>
                        ) : (
                          <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}> {this.state.ageVal}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}>{strings('string.label.speaks')}</Text>
                          <View>
                            <FlatList
                              data={this.state.langList}
                              renderItem={(item) => this.renderLangList(item, this.state.langList)}
                              keyExtractor={(item, index) => index.toString()}
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={careGiverHomeScreenStyle.modalListContentView}>
                    <View style={careGiverHomeScreenStyle.modalListContentInnerView}>
                      <View style={careGiverHomeScreenStyle.modalListContentViewHead}>
                        <Text numberOfLines={2} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {strings('string.label.patient_detail')}{' '}
                        </Text>
                      </View>
                      <View style={careGiverHomeScreenStyle.modalListContentViewTail}>
                        <Text numberOfLines={1} style={careGiverHomeScreenStyle.modalListContentViewTxt}>
                          {patientName}, {age}
                        </Text>
                        <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}>{this.state.patientConditionVal}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>

              <View style={careGiverHomeScreenStyle.viewBelowredBarView2}>
                {/* <Text style={careGiverHomeScreenStyle.priceTxt}>** Estimated Total: S$300 </Text> */}
                <TouchableOpacity
                  onPress={() => this.confirmBooking()}
                  disabled={this.state.confirmButton}
                  activeOpacity={0.8}
                  style={careGiverHomeScreenStyle.confirmBtn}
                >
                  <Text style={careGiverHomeScreenStyle.confirmBtnTxt}>{strings('string.btnTxt.confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  renderLangList(item, langList) {
    AppUtils.console('renderLangList:::::', item, langList);
    let list = langList.length;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={careGiverHomeScreenStyle.modalListContentViewSubTxt}>{item.item}</Text>
        {item.index !== list - 1 ? <Text>, </Text> : <View />}
      </View>
    );
  }

  getCountryName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      if (addressType == 'country') {
        return address_components[i].long_name;
      }
    }
    return '';
  }

  getStateName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      if (addressType == 'administrative_area_level_1') {
        return address_components[i].long_name;
      }
    }
    return '';
  }

  setLocaInTxt() {
    let lat = this.state.region.latitude;
    let long = this.state.region.longitude;
    Geocoder.init(AppStrings.MAP_API_KEY);

    let address = this.state.addressList;

    Geocoder.from(lat, long)
      .then((json) => {
        address[0].add = json.results[0].formatted_address;
        this.setState({
          location: json.results[0].formatted_address,
          country: this.getCountryName(json.results[0].address_components),
          state: this.getStateName(json.results[0].address_components),
          addressList: address,
        });
      })
      .catch((error) => console.warn(error));
  }

  async getUserCurrentLocation() {
    let self = this;
    AppUtils.getCurrentLocation()
      .then((position) => {
        const { latitude, longitude } = position.coords;
        this.setState({
          isLoading: false,
          region: {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
        });
      })
      .catch((err) => {});
  }

  renderUserLocation() {
    let self = this;
    let lat = self.state.region.latitude;
    let long = self.state.region.longitude;
    return (
      <Marker
        key={1024}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: verticalScale(250),
          width: moderateScale(250),
        }}
        coordinate={{ latitude: lat, longitude: long }}
      ></Marker>
    );
  }

  panCloseView() {
    return (
      <View style={[careGiverHomeScreenStyle.panClosedView]}>
        <View style={{ flex: 1.6, width: wp(100) }}>
          <MapView
            style={{
              position: 'absolute',
              height: hp(50),
              width: wp(100),
            }}
            showsMyLocationButton={true}
            followsUserLocation={true}
            region={this.state.region}
            //showsUserLocation={Platform.OS === "ios" ? true : true}
          >
            {this.renderUserLocation()}
          </MapView>
        </View>
        {this.renderExpandedPan()}
      </View>
    );
  }

  renderPaPatienDetailsViews(item) {
    let res = this.state.patienDetailIndx === item.index;
    let age = moment(new Date()).format('YYYY') - moment(item.item.dateOfBirth).format('YYYY');
    AppUtils.console('aszdseds', item.item);
    return (
      <TouchableOpacity activeOpacity={res ? 1 : 0.8} onPress={() => this.setState({ patienDetailIndx: item.index })}>
        <View
          elevation={5}
          style={[
            careGiverHomeScreenStyle.patientView,
            {
              backgroundColor: res ? AppColors.primaryColor : AppColors.whiteColor,
            },
            { marginBottom: hp(1) },
          ]}
        >
          <View style={careGiverHomeScreenStyle.patientInnerView}>
            <CachedImage
              style={{
                width: PixelRatio.getPixelSizeForLayoutSize(9),
                height: PixelRatio.getPixelSizeForLayoutSize(9),
                borderRadius: PixelRatio.getPixelSizeForLayoutSize(15) / 2,
              }}
              source={{ uri: AppUtils.handleNullImg(item.item.profilePic) }}
            />

            <View
              style={{
                marginLeft: wp(1.5),
                justifyContent: 'space-between',
                height: hp(3),
              }}
            >
              <Text
                style={[
                  careGiverHomeScreenStyle.patientTxt,
                  { justifyContent: 'center', width: wp(19) },
                  { color: res ? AppColors.whiteColor : AppColors.blackColor },
                ]}
                numberOfLines={1}
              >
                {item.item.firstName} {item.item.lastName}
              </Text>
              <Text
                style={[careGiverHomeScreenStyle.patientTxt, { fontSize: hp(1) }, { color: res ? AppColors.whiteColor : AppColors.blackColor }]}
                numberOfLines={1}
              >
                {age} Years | {item.item.gender}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderPatienDetails() {
    let patienDetailList = this.state.patienDetailList;
    return (
      <View>
        <Text style={careGiverHomeScreenStyle.softHeading}>{strings('doctor.text.selectPatient')}</Text>
        <View style={{ flex: 1, marginTop: 10 }}>
          {patienDetailList.length > 0 ? (
            <FlatList
              data={this.state.patienDetailList}
              renderItem={(item) => this.renderPaPatienDetailsViews(item)}
              numColumns={2}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View />
          )}
        </View>
        {patienDetailList.length < 5 ? (
          <TouchableOpacity
            onPress={() => this.addProfile()}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 5,
            }}
          >
            <View>
              <Image source={images.addNewMemberIcon} style={careGiverHomeScreenStyle.addNewMemberIcon} />
            </View>
            <View>
              <Text
                style={[
                  careGiverHomeScreenStyle.softHeading,
                  {
                    marginLeft: wp(2),
                    marginTop: Platform.OS === 'ios' ? hp(1) : hp(0),
                  },
                ]}
              >
                {strings('doctor.button.addNew')}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
    );
  }

  render() {
    return (
      <View style={careGiverHomeScreenStyle.container}>
        <AddressView selectedAddress={this.state.selectedAddress} onPress={() => this.setState({ isAddressOpen: true })} />
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
            this.setState(
              {
                addressList: addressList,
                updateAddressData: {},
              },
              () => this.getSelectedAddress(addressList)
            )
          }
        />
        {this.nationalityModal()}
        {this.ageModal()}
        {this.subServiceModal()}
        {this.openDateTimeSelector()}
        {this.patientConditionModal()}
        {this.formConfirmModal()}
        {this.state.isPanExpanded ? (
          <KeyboardAwareScrollView style={careGiverHomeScreenStyle.expandedPanStyle}>
            {this.renderExpandedPan()}
            {this.renderForm()}
          </KeyboardAwareScrollView>
        ) : (
          this.panCloseView()
        )}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }
}

export default caregiverHomeScreen;
