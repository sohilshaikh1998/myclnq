import React, { Component } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  BackHandler,
  DatePickerAndroid,
  Dimensions,
  Modal,
  Platform,
  PermissionsAndroid,
  TouchableHighlight,
  Keyboard,
  I18nManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppColors } from '../../shared/AppColors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from '../../shared/AppStyles';
import ProgressLoader from 'rn-progress-loader';
import { AppUtils } from '../../utils/AppUtils';
import images from '../../utils/images';
import { SHApiConnector } from '../../network/SHApiConnector';
import { Actions } from 'react-native-router-flux';
import AddRecordsStyles from './AddRecordsStyles';
import { moderateScale } from '../../utils/Scaling';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FamilyProfile from './../commonFiles/FamilyProfile';
const { width, height } = Dimensions.get('window');
import CommonHeaderVital from '../../navigationHeader/CommonHeaderVital';
import DoctorMappingScreenStyle from './DoctorMappingScreenStyle';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import { authorize, refresh } from 'react-native-app-auth';
import axios from 'axios';

import { CachedImage, ImageCacheProvider } from '../../cachedImage';
import { strings } from '../../locales/i18n';
import { AppStrings } from '../../shared/AppStrings';
import { CountryCodeList } from 'react-native-country-picker-modal';
import { AppArray } from '../../utils/AppArray';

const expParameter = ['Heart Rate', 'Heart Rate Variability', 'Blood Pressure'];
const isRTL = I18nManager.isRTL;
var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
var CurrentDate = moment().format();

class AddRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordList: [],
      showDateSelector: false,
      hasRange: '',
      dateToday: _dt,
      maxDate: _dt,
      selectedRelative: !props.relativeProfile ? [] : props.relativeProfile,
      sDate: props.sDate ? props.sDate : moment(_dt).format('YYYY-MM-DD'),
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      oxygenSaturation: '',
      bodyTemperature: '',
      heartRate: '',
      bloodSugarBF: '',
      bloodSugarAF: '',
      showDeviceList: false,
      // deviceList: AppArray.deviceList(),
    };
  }

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.onBackPress();
      return true;
    });
  }

  componentWillReceiveProps(props) {
    if (props.update) {
      this.getVitalDashboard(this.state.relativeProfile._id);
    }
  }

  vitalDeviceList() {
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDeviceList}
        onRequestClose={this.close}
        animationType={this.props.animationType}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', width: width - 30 }}>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <View style={{ justifyContent: 'center', marginLeft: wp(2.5), marginTop: hp(1.5) }}>
                <View underlayColor="transparent" style={{ height: hp(4), justifyContent: 'center' }}>
                  <Text
                    style={{
                      color: AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyMedium,
                      fontSize: 14,
                      marginLeft: wp(4),
                    }}
                  >
                    {'Select Device'}
                    {/* Translation req */}
                  </Text>
                </View>

                {/* <FlatList
                  data={this.state.deviceList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item, index) => this.deviceListView(item, index)}
                  extraData={this.state}
                /> */}
              </View>
            </View>
            <TouchableHighlight onPress={() => this.setState({ showDeviceList: false })} underlayColor="transparent">
              <View
                style={{
                  backgroundColor: AppColors.primaryColor,
                  height: 45,
                  width: width - 30,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {'Close'}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  async selectDevice(item) {
    this.setState({ showDeviceList: false });
    setTimeout(() => {
      Alert.alert('', 'Feature is in development and will be available in upcoming release.');
    }, 500);
  }

  deviceListView(item) {
    return (
      <View
        style={{
          height: hp(8),
          backgroundColor: AppColors.whiteColor,
          borderRadius: moderateScale(15),
          marginLeft: moderateScale(3),
          marginRight: moderateScale(10),
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}
      >
        <TouchableHighlight
          onPress={() => this.selectDevice(item.item)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            alignSelf: 'center',
          }}
          underlayColor="transparent"
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              alignSelf: 'center',
            }}
          >
            {/* <CachedImage
                        style={{
                            width: wp(3), height: wp(3),
                            marginLeft: wp(2),
                            alignSelf: 'center',
                        }}
                        source={item.item.isMapped ? images.selected : images.unselected}
                    /> */}

            <Image
              style={{
                width: wp(12),
                height: wp(12),
                marginLeft: wp(2),
                borderRadius: hp(50),
                alignSelf: 'center',
              }}
              resizeMode={'contain'}
              source={item.item.deviceImage}
            />
            <View style={{ alignSelf: 'center', marginLeft: wp(5) }}>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: AppColors.blackColor,
                  width: wp(56),
                }}
                numberOfLines={1}
              >
                {item.item.deviceName}{' '}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  width: wp(65),
                  fontSize: wp(2.8),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {item.item.brand}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  width: wp(65),
                  fontSize: wp(2.8),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {item.item.description}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  async setMultipleRecord(data) {
    this.setState({
      isLoading: true,
    });
    let body = { vitalRecordList: data };
    try {
      let response = await SHApiConnector.setMultipleRecord(body);
      if (response.data.status) {
        this.setState({
          isLoading: false,
        });
        setTimeout(() => {
          Alert.alert('', strings('vital.vital.newRecordSuccess'), [
            {
              cancelable: false,
              text: strings('common.common.done'),
              onPress: () => this.goBack(),
            },
            // {
            //   text: strings("doctor.button.camelAdd"),
            //   onPress: () =>
            //     this.getVitalDashboard(this.state.relativeProfile._id),
            // },
          ]);
        }, 300);
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      });
    }
  }

  async getVitalDashboard(id) {
    try {
      this.setState({
        isLoading: true,
      });
      let body = {
        recordDate: this.state.sDate,
      };
      let hasRange = 0;

      let response = await SHApiConnector.getVitalDashboard(id, body);

      if (response.data.status) {
        let res = response.data.response;
        res.map((list) => {
          list.vitalRange ? hasRange++ : 0;
        });

        this.setState({
          recordList: res,
          hasRange: hasRange > 0,
          isLoading: false,
        });
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      });
    }
  }
  goBack() {
    Actions.pop();
    setTimeout(() => {
      Actions.refresh({ update: true, sDate: this.state.sDate });
    }, 500);
  }

  onBackPress() {
    Actions.pop();
    setTimeout(() => {
      Actions.refresh({ update: true });
    }, 500);
  }

  validateDecimal(value) {
    if (value !== '') {
      // Convert value to a string if it's a number
      const stringValue = typeof value === 'number' ? value.toString() : value;

      const cleanedValue = stringValue.replace(/[^0-9.]/g, '');

      console.log(cleanedValue,'cleanedValue')

      // Split the value into integer and decimal parts
      const parts = cleanedValue.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1] || '';

      // Ensure the decimal part has at most two digits
      const truncatedDecimal = decimalPart.slice(0, 2);

      // Combine the integer and truncated decimal parts
      const result = parseFloat(integerPart + (truncatedDecimal ? '.' + truncatedDecimal : ''));
      const formattedResult = parseFloat(result.toString().split('.')[0] + (decimalPart ? '.' + decimalPart : ''));
      // Ensure the result is a valid number
      if (!isNaN(result)) {
        if (decimalPart.length > 2) {

          return formattedResult.toFixed(2); // Ensure two digits after the decimal point if more than two digits present
        } else {
        

          return formattedResult.toString(); // Return result as a string without modifying the decimal places
        } // Ensure two digits after the decimal point
      } else {
        return ''; 
      }
    } else {
      return ''; 
    }
  }
  

  recordListView(item) {
    let self = this;
    let minRange = !item.item.vitalRange ? '' : item.item.vitalRange.minRange ? '' + item.item.vitalRange.minRange : '';

    let maxRange = !item.item.vitalRange ? '' : item.item.vitalRange.maxRange ? '' + item.item.vitalRange.maxRange : '';
 

    minRange = !item.item.isOtherVital ? minRange : '' + item.item.minRange;
    maxRange = !item.item.isOtherVital ? maxRange : '' + item.item.maxRange;
 
    const recordQty = item?.item?.vitalRecord?.recordQuantity;
    let recordQuantity = recordQty ? '' + this.validateDecimal(recordQty) : '';


  
    let secondRecordQuantity = !item?.item?.vitalRecord?.secondAverageRecord ? '' : '' + item?.item?.vitalRecord.secondAverageRecord;

    // if (recordQuantity !== '') {
    //   recordQuantity = Number(recordQuantity).toFixed(2);
    // }

    if (expParameter.includes(item.item.parameterName) && recordQuantity !== '') recordQuantity = Number(recordQuantity).toFixed();
    if (expParameter.includes(item.item.parameterName) && secondRecordQuantity !== '') secondRecordQuantity = Number(secondRecordQuantity).toFixed();

    let currentDate = moment(item.item.createdOn).format('YYYY MM DD') == moment(self.state.sDate).format('YYYY MM DD');
    let hasRange = maxRange && minRange ? true : false;

    return hasRange ? (
      <View style={AddRecordsStyles.modalListContentView}>
        <View style={AddRecordsStyles.modalListContentInnerView}>
          <View style={AddRecordsStyles.modalListContentViewTail}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text allowFontScaling={false} numberOfLines={1} style={AddRecordsStyles.modalListContentViewVitalTxt}>
                {item.item.parameterName}
              </Text>
              <Text allowFontScaling={false} numberOfLines={1} style={[AddRecordsStyles.modalListContentViewSubTxt, { paddingTop: hp(0.4),textAlign: isRTL ? 'left' : 'auto', }]}>
                {'(' + item.item.parameterUnit + ')'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
              {item.item.isMultiParam ? (
                <View style={{ flexDirection: 'row', width: wp(70) }}>
                  <TextInput
                    allowFontScaling={false}
                    editable={hasRange}
                    placeholder={item.item.firstSubParameterName}
                    value={recordQuantity}
                    keyboardType="decimal-pad"
                    autoFocus={item.index == 0 ? true : false}
                    placeholderTextColor={AppColors.textGray}
                    onChangeText={(input) => {
                      self.setQuantity(input, item.item);
                    }}
                    style={[AddRecordsStyles.modalListContentViewTxt, { width: wp(25) }]}
                  />
                  <Text
                    allowFontScling={false}
                    style={[
                      {
                        width: wp(10),
                        paddingTop: hp(1.2),
                        paddingLeft: wp(1.2),
                        justifyContent: 'center',
                        textAlign: isRTL ? "left" : "auto"
                      },
                    ]}
                  >
                    {'/'}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    editable={hasRange}
                    placeholder={item.item.secondSubParameterName}
                    value={secondRecordQuantity}
                    keyboardType="decimal-pad"
                    placeholderTextColor={AppColors.textGray}
                    onChangeText={(input) => {
                      self.setSecondSub(input, item.item);
                    }}
                    style={[AddRecordsStyles.modalListContentViewTxt, { width: wp(19) }]}
                  />
                </View>
              ) : (
                <View style={{ flexDirection: 'row', width: wp(70) }}>
                  <TextInput
                    allowFontScaling={false}
                    editable={hasRange}
                    placeholder={item.item.parameterUnit}
                    defaultValue={recordQuantity}
                    // value={recordQuantity}
                    keyboardType="decimal-pad"
                    autoFocus={item.index == 0 ? true : false}
                    placeholderTextColor={AppColors.textGray}
                    onChangeText={(input) => {
                      self.setQuantity(input, item.item);
                    }}
                    style={AddRecordsStyles.modalListContentViewTxt}
                  />
                </View>
              )}

              <Text allowFontScling={false} style={[AddRecordsStyles.modalListContentViewTxt,{textAlign: isRTL ? 'left' : 'auto',}]}>
                {hasRange
                  ? item.item.parameterName === 'BP'
                    ? maxRange + '/' + minRange
                    : minRange + '/' + maxRange
                  : item.item.parameterName === 'BP'
                  ? 'Max/Min'
                  : 'Min/Max'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    ) : null;
  }

  openCalender() {
    var self = this;
    var selectedDate = moment(self.state.dateToday)._d;
    var maxDate = _dt;
    Keyboard.dismiss();
    self.setState({
      showDateSelector: true,
      date: selectedDate,
      mode: 'default',
      maxDate: maxDate,
    });
  }

  openiOSCalender() {
    let self = this;

    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDateSelector}
        onRequestClose={this.close}
        animationType="fade"
        key={this.state.showDateSelector ? 1 : 2}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: hp(30),
              alignSelf: 'center',
              backgroundColor: AppColors.whiteColor,
              justifyContent: 'center',
              width: width - 30,
            }}
          >
            <View
              style={{
                height: 40,
                width: width - 30,
                backgroundColor: AppColors.whiteColor,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={() => this.setState({ showDateSelector: false })}>
                <Image
                  resizeMode={'contain'}
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: 10,
                  }}
                  source={require('../../../assets/images/cancel.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <DateTimePicker
                mode="date"
                value={new Date(this.state.sDate)}
                display="spinner"
                maximumDate={this.state.maxDate}
                style={{ backgroundColor: AppColors.whiteColor }}
                onChange={(event, selectDate) => {
                  this.setDate(selectDate);
                }}
              />
            </View>
            <TouchableHighlight
              onPress={() => {
                self.setState({ showDateSelector: false });
                console.log('Fetch Data');
              }}
              underlayColor="transparent"
            >
              <View
                style={{
                  backgroundColor: AppColors.colorHeadings,
                  height: 50,
                  width: width - 30,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {moment(this.state.sDate).format('DD MMM Y')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  openAndroidCalender() {
    return (
      <View>
        {this.state.showDateSelector ? (
          <DateTimePicker
            value={new Date(this.state.sDate)}
            style={{ backgroundColor: AppColors.whiteColor }}
            maximumDate={AppUtils.currentDateTime()}
            display="spinner"
            mode="date"
            onChange={(selectDate) => {
              if (selectDate.nativeEvent.timestamp != undefined) {
                this.setDate(selectDate.nativeEvent.timestamp);
              }
            }}
          />
        ) : null}
      </View>
    );
  }

  setDate(date) {
    try {
      this.setState(
        {
          sDate: moment(date).format('YYYY-MM-DD'),
          showDateSelector: false,
        },
        () => {
          setTimeout(() => {
            this.getVitalDashboard(this.state.relativeProfile._id);
          }, 500);
        }
      );
    } catch (e) {}
  }

  setQuantity(value, item) {
    let updatedList = [];
    let self = this;
    value = isNaN(`${value}`) ? '' : `${value}`;
    self.state.recordList.map((list) => {
      let id = list._id;
      if (id === item._id && list.vitalRecord) {

        const changedVal = this.validateDecimal(value)
        // console.log(changedVal,'changedVal')
        list.vitalRecord.recordQuantity = changedVal;
        list.device = AppStrings.vital_devices.MANUAL;
      }
    });
    updatedList = self.state.recordList;
    self.setState({ updatedList: updatedList });
  }

  setSecondSub(value, item) {
    let updatedList = [];
    let self = this;
    value = isNaN(`${value}`) ? '' : `${value}`;
    self.state.recordList.map((list) => {
      let id = list._id;
      if (id === item._id && list.vitalRecord) {
        list.vitalRecord.secondAverageRecord = value;
      }
    });
    updatedList = self.state.recordList;
    this.setState({ updatedList: updatedList });
  }

  submit() {
    let updatedList = [];
    let status = false;

    this.state.recordList.map((list) => {
      if (!list?.vitalRecord?.recordQuantity) {
      } else {
        console.log(list?.vitalRecord?.recordQuantity, 'list?.vitalRecord?.recordQuantity');
        status = true;
        const recordQuantity = list.vitalRecord.recordQuantity;
        updatedList.push({
          relativeId: this.state.relativeProfile._id,
          recordQuantity: recordQuantity ? Number(recordQuantity).toFixed(2) : '',
          secondRecordQuantity: !list?.vitalRecord?.secondAverageRecord ? '' : list?.vitalRecord?.secondAverageRecord,
          recordDate: this.state.sDate,

          userVitalParameterRangeId: !list.isOtherVital ? list.vitalRange && list.vitalRange._id : list._id,
          vitalStatus:
            list?.vitalRecord?.recordQuantity < (!list.isOtherVital ? list.vitalRange && list.vitalRange.minRange : list.minRange)
              ? 'Low'
              : list?.vitalRecord?.recordQuantity >= (!list.isOtherVital ? list.vitalRange && list.vitalRange.minRange : list.minRange) &&
                list?.vitalRecord?.recordQuantity <= (!list.isOtherVital ? list.vitalRange && list.vitalRange.maxRange : list.maxRange)
              ? 'Normal'
              : 'High',
          device: list.device ? list.device : AppStrings.vital_devices.MANUAL,
        });
      }
    });
    if (status) {
      this.setMultipleRecord(updatedList);
    } else {
      Alert.alert('', strings('vital.vital.checkVitalValues'));
    }
  }
  selectedProfile(profile) {
    this.setState({ relativeProfile: profile });
    this.getVitalDashboard(profile._id);
  }

  showFetchRecordDeviceButton() {
    return (
      this.state.hasRange && new Date(Date.parse(moment(new Date()).format('YYYY-MM-DD'))).getTime(),
      new Date(Date.parse(this.state.sDate)).getTime() === new Date(Date.parse(moment(new Date()).format('YYYY-MM-DD'))).getTime()
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
        <CommonHeaderVital title={strings('vital.vital.addRecords')} />
        <KeyboardAwareScrollView style={{ flex: 1 }}>
          <FamilyProfile selectedProfile={(profile) => this.selectedProfile(profile)} selectedRelative={this.state.selectedRelative} />

          <View
            style={{
              flexDirection: 'row',
              width: wp(100),
              backgroundColor: AppColors.whiteColor,
              paddingBottom: hp(2),
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', marginLeft: wp(5) }}
              underlayColor="transparent"
              onPress={() => {
                Actions.SetVitalRange({
                  relativeProfile: this.state.relativeProfile,
                });
              }}
            >
              <CachedImage
                resizeMode={'contain'}
                style={{
                  width: hp(3),
                  height: hp(3),
                }}
                source={images.add_new}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: AppStyles.fontFamilyMedium,
                  paddingTop: AppUtils.isIphone ? hp(0.8) : hp(0.4),
                  fontSize: hp(1.9),
                  width: wp(40),
                  marginLeft: wp(1),
                  color: AppColors.colorHeadings,
                }}
              >
                {strings('vital.vital.addVitlSigns')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.openCalender()}
              allowFontScaling={false}
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                fontFamily: AppStyles.fontFamilyMedium,
                width: wp(40),
                color: AppColors.colorHeadings,
              }}
            >
              <Image
                source={images.activeCalender}
                resizeMode="contain"
                style={{
                  height: wp(5),
                  width: wp(5),
                  marginRight: wp(1),
                  alignSelf: 'center',
                }}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: hp(1.9),
                  fontFamily: AppStyles.fontFamilyRegular,
                  paddingTop: AppUtils.isIphone ? hp(0.8) : hp(0.4),
                  color: AppColors.blackColor,
                }}
              >
                {moment(this.state.sDate).format('DD MMM Y')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ justifyContent: 'center', marginLeft: wp(6) }}>
            {this.state.hasRange ? (
              <FlatList
                data={this.state.recordList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item, index) => this.recordListView(item, index)}
                extraData={this.state}
              />
            ) : this.state.isLoading ? null : (
              <View
                style={{
                  height: hp(50),
                  width: wp(80),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: hp(2.5),
                    fontFamily: AppStyles.fontFamilyMedium,
                  }}
                >
                  {strings('vital.vital.setRange')}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>

        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        {this.footer()}
        {this.vitalDeviceList()}
        {Platform.OS == 'ios' ? this.openiOSCalender() : this.openAndroidCalender()}
      </View>
    );
  }

  footer() {
    return (
      <View
        style={{
          width: wp(100),
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.2,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          backgroundColor: AppColors.whiteColor,
          paddingBottom: AppUtils.isX ? hp(2) : 0,
          elevation: 2,
          height: AppUtils.isX ? hp(12) : hp(10),
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          style={[AddRecordsStyles.addRecordSubmit]}
          onPress={() => {
            this.submit();
          }}
        >
          <Text style={[AddRecordsStyles.addRecordSubmitText]}>{strings('doctor.button.submit')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textViewStyle: {
    alignSelf: 'center',
    height: hp(6),
    flexDirection: 'row',
    width: wp(90),
    borderColor: AppColors.backgroundGray,
  },

  textTitleStyle: {
    flex: 1,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: 'center',
    paddingLeft: wp(5),
  },

  textDataStyle: {
    flex: 1,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    marginLeft: wp(25),
    alignSelf: 'center',
    fontFamily: AppStyles.fontFamilyRegular,
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === 'ios' ? 16 : hp(2),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
});

export default AddRecords;
