import {
  Text,
  StyleSheet,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  Platform,
  Keyboard,
  TouchableHighlight,
  Image,
  TextInput,
  Modal,
  Dimensions,
  I18nManager,
} from 'react-native';
import React, { Component } from 'react';
import ElevatedView from 'react-native-elevated-view';
import ProgressLoader from 'rn-progress-loader';
import moment from 'moment';
import bmiStyles from '../../styles/bmiStyles';
import images from '../../utils/images';
import CachedImage from '../../cachedImage/CachedImage';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import { AppArray } from '../../utils/AppArray';
import { AppUtils } from '../../utils/AppUtils';
import { strings } from '../../locales/i18n';
import { Dropdown } from 'react-native-material-dropdown';
import CountryPicker, { FlagButton } from 'react-native-country-picker-modal';
import { Switch } from 'react-native-switch';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { Validator } from '../../shared/Validator';
//import DatePicker from 'react-native-date-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from '../../shared/ModalSelector';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Actions } from 'react-native-router-flux';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import { AppStrings } from '../../shared/AppStrings';
const isRTL = I18nManager.isRTL;
const { width, height } = Dimensions.get('window');

let dt = new Date();
dt.setDate(dt.getDate());
let _dt = dt;
const reg = /^[1-9][0-9]*$/;
let relIndex = 0;

const relationData = [
  { key: relIndex++, section: true, label: 'Select Relation' },

  { key: relIndex++, label: 'Spouse' },
  { key: relIndex++, label: 'Son' },
  { key: relIndex++, label: 'Daughter' },
  { key: relIndex++, label: 'Others' },
];

const otherRelationData = [
  { key: relIndex++, section: true, label: 'Select Relation' },
  { key: relIndex++, label: 'Spouse' },
  { key: relIndex++, label: 'Son' },
  { key: relIndex++, label: 'Daughter' },
  { key: relIndex++, label: 'Others' },
];

export default class InstantConsult extends Component {
  constructor(props) {
    super(props);
    this.getInsuranceProviders = this.getInsuranceProviders.bind(this);
    this.state = {
      isLoading: false,
      isCountryListVisible: false,
      countryCode: '',
      cca2: 'SG',
      countryName: 'Singapore',
      departments: [],
      selectedSpecialityId: null,
      selectedSpeciality: null,
      symptoms: '',
      symptomList: [],
      selectedSymptoms: [],
      addSymptoms: '',
      isLoading: false,
      isAddNewRelative: false,
      fName: '',
      lName: '',
      dob: _dt,
      showDOB: false,
      NRIC: '',
      relation: '',
      relationText: '',
      gender: '',
      insuranceNumber: '',
      insuranceText: '',
      maleTextColor: '#d3d3d3',
      femaleTextColor: '#d3d3d3',
      toggled: false,
      isPatientSelected: false,
      relationData: relationData,
      otherRelationData: otherRelationData,
      departmentListForDropdown: [],
      userRelativeList: [],
      insuranceProviders: [],
      selectedUserRelative: null,
      relativeId: '',
      insurancePId: '',
      insuranceCompanyName: 'Select Insurance',
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      userIdTypes: '',
      userId: '',
      userIdNum: '',
      showInput: false,
    };
    this.refs = React.createRef(null);
  }

  componentDidMount() {
    this.setState({
      countryCode: this.props.userCountryCode,
    });
    this.getDepartments();
    this.getUserRelativeList();
    this.setInitialSymptoms();
    this.getInsuranceProviders();
    this.getUserDetails();
  }
  async getUserDetails() {
    let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
    let user = await JSON.parse(userData);

    const data = {
      country: user.country,
    };
    const getIdTypesResponse = await SHApiConnector.getIdList(data);

    const idTypes = getIdTypesResponse?.data?.data?.idTypes;
    if (idTypes) {
      const dataIdentificationType = idTypes.map((item) => {
        return { value: item.identificationType.toUpperCase() };
      });

      this.setState({ userIdTypes: dataIdentificationType });
    }
  }

  handleChange = (value) => {
    this.setState({ userId: value, showInput: true, userIdNum: '' });
  };

  async getDepartments() {
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.getWaitingRoomDepartments();
      if (response.data.status) {
        let departmentList = response.data.data.departments;
        this.setState({
          departments: departmentList,
          // departmentListForDropdown: departmentList,
          selectedSpecialityId: departmentList[0]._id,
          selectedSpeciality: departmentList[0].departmentName,
          isLoading: false,
        });
      } else {
        this.setState({ isLoading: false });
        alert(strings('common.waitingRoom.somethingWentWrong'));
      }
    } catch (e) {
      this.setState({ isLoading: false });
      alert(strings('common.waitingRoom.somethingWentWrong'));
    }
  }

  async getUserRelativeList() {
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.relativeList();
      this.setState({ isLoading: false });
      console.log('CheckRelatives', response.data.response.relativeDetails);
      if (response.data.status) {
        this.setState({
          userRelativeList: response.data.response.relativeDetails,
        });
      } else {
        setTimeout(() => {
          Alert.alert('', response.data.error_message);
        }, 500);
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  setInitialSymptoms() {
    let symptomList = [];
    let symptoms = AppArray.symptoms();
    symptoms.map((symptom) => {
      symptom.isSelected = false;
      symptomList.push(symptom);
    });
    this.setState({
      addSymptoms: '',
      selectedSymptoms: [],
      symptomList: symptomList,
    });
  }

  getInsuranceProviders() {
    let self = this;
    self.setState({
      isLoading: true,
    });
    SHApiConnector.getInsuranceProviders(function (err, stat) {
      self.setState({ isLoading: false });
      try {
        if (stat) {
          let firstValue = {
            companyName: 'Select Insurance',
            _id: '00000000000',
          };
          let data = Platform.OS === 'ios' ? [firstValue, ...stat.status] : stat.status;
          self.setState({
            insuranceProviders: data,
            insurancePId: self.state.insurancePId,
          });
          self.setInsuranceData(self.state.insurancePId);
        }
      } catch (e) {
        console.error('Error:', e);
      }
    });
  }

  switch(val) {
    this.setState({ toggled: val });
  }

  openCalender() {
    let self = this;
    Keyboard.dismiss();
    self.setState({ showDOB: true });
  }

  closeIOSCalender() {
    this.setState({ showDOB: false });
  }

  setGender(gender) {
    if (gender == 'Male') {
      this.setState({
        gender: 'Male',
        maleTextColor: '#FF4848',
        femaleTextColor: '#d3d3d3',
      });
    } else {
      this.setState({
        gender: 'Female',
        femaleTextColor: '#FF4848',
        maleTextColor: '#d3d3d3',
      });
    }
  }

  getPickerLabel(pickedVal) {
    switch (pickedVal) {
      case 'Spouse':
        return 'spouse';
      case 'Son':
        return 'son';
      case 'Daughter':
        return 'daughter';
      case 'Others':
        return 'other';
      default:
        return '';
    }
  }

  openAndroidCalender() {
    return (
      <View>
        {this.state.showDOB ? (
          <DateTimePicker
            value={new Date(this.state.dob)}
            style={{ backgroundColor: AppColors.whiteColor }}
            maximumDate={_dt}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              this.setState({ dob: date, showDOB: false });
            }}
          />
        ) : null}
      </View>
    );
  }

  openIOSCalender() {
    let dt = AppUtils.currentDateTime;
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDOB}
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
              <DateTimePicker
                value={new Date(this.state.dob)}
                style={{ backgroundColor: AppColors.whiteColor }}
                maximumDate={_dt}
                mode="date"
                display={'spinner'}
                onChange={(event, date) => {
                  this.setState({ dob: date });
                }}
              />
            </View>
            <TouchableHighlight onPress={() => this.closeIOSCalender()} underlayColor="transparent">
              <View
                style={{
                  backgroundColor: AppColors.primaryColor,
                  height: 50,
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
                  {moment.parseZone(this.state.dob).format('MMM DD YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  openRelation() {
    this.setState({ showRelation: !this.state.showRelation });
  }

  openInsurance() {
    this.setState({ showInsurance: !this.state.showInsurance });
  }

  selectFilters() {
    return (
      <ElevatedView
        elevation={4}
        style={{
          borderRadius: 15,
        }}
      >
        <View style={{ paddingTop: 10, marginHorizontal: hp(2) }}>
          <Text
            style={{
              color: AppColors.instantVideoTheme,
              fontFamily: AppStyles.fontFamilyDemi,
              fontSize: hp(2.2),
            }}
          >
            Country
          </Text>
        </View>
        <View style={{ marginHorizontal: hp(2) }}>
          <View
            style={{
              flexDirection: 'row',
              height: hp(6),
              width: '100%',
              marginTop: hp(2),
              marginBottom: hp(3),
              borderWidth: 2,
              borderRadius: wp(2),
              borderColor: AppColors.lightPink,
              backgroundColor: AppColors.whiteColor,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                alignSelf: 'center',
                marginLeft: wp(2),
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <FlagButton
                withCountryNameButton={!this.state.isCountryListVisible}
                withCallingCodeButton={!this.state.isCountryListVisible}
                containerButtonStyle={{
                  marginTop: Platform.OS === 'ios' ? hp(0.6) : hp(0.8),
                  fontFamily: AppStyles.fontFamilyBold,
                  fontSize: 15,
                  flex: 5,
                }}
                onOpen={() => this.setState({ isCountryListVisible: true })}
                withEmoji={!this.state.isCountryListVisible}
                withFlag={!this.state.isCountryListVisible}
                countryCode={this.state.cca2}
              />
              {this.state.isCountryListVisible ? (
                <CountryPicker
                  visible={this.state.isCountryListVisible}
                  closeable
                  withFilter
                  withFlag
                  withCallingCode
                  withCountryNameButton
                  onClose={() => this.setState({ isCountryListVisible: false })}
                  onSelect={(value) => {
                    this.setState({
                      cca2: value.cca2,
                      countryCode: value.callingCode[0],
                      isCountryListVisible: false,
                    });
                  }}
                  cca2={this.state.cca2}
                  translation="eng"
                />
              ) : (
                <View></View>
              )}
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 2,
            justifyContent: 'flex-end',
          }}
        ></View>
      </ElevatedView>
    );
  }

  selectSpeciality(index, data) {
    this.setState({
      selectedSpecialityId: data[index]._id,
      selectedSpeciality: data[index].departmentName,
    });
  }

  selectCategory() {
    return (
      <ElevatedView elevation={4} style={{ marginTop: 20, borderRadius: 15, backgroundColor: AppColors.whiteColor }}>
        <View style={{ paddingVertical: 10, marginHorizontal: hp(2) }}>
          <Text
            style={{
              color: AppColors.instantVideoTheme,
              fontFamily: AppStyles.fontFamilyDemi,
              fontSize: hp(2.2),
              textAlign: isRTL ? 'left' : 'auto',
            }}
          >
            {strings('common.waitingRoom.speciality')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.refs.departmentDropdown.onPress();
            }}
            style={{
              flexDirection: 'row',
              height: hp(6),
              width: '100%',
              marginVertical: hp(2),
              borderWidth: 2,
              borderRadius: wp(2),
              borderColor: AppColors.greyBorder,
              backgroundColor: AppColors.whiteColor,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dropdown
              ref={'departmentDropdown'}
              label={strings('doctor.text.selectSpe')}
              textColor={AppColors.blackColor}
              itemColor={AppColors.blackColor}
              fontFamily={AppStyles.fontFamilyRegular}
              dropdownPosition={-3.2}
              dropdownOffset={{ top: hp(2), left: wp(1.8) }}
              itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
              rippleCentered={false}
              dropdownMargins={{ min: 8, max: 16 }}
              baseColor={'transparent'}
              value={this.state.selectedSpeciality ? this.state.selectedSpeciality : strings('doctor.text.selectSpe')}
              // containerStyle={{
              //   width: wp(80),
              //   marginLeft: 10,
              //   marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
              //   justifyContent: 'center',
              // }}
              onChangeText={(value, index, data) => this.selectSpeciality(index, data)}
              pickerStyle={{
                width: wp(83),
                height: hp(20),
              }}
              containerStyle={{
                width: wp(80),
                marginLeft: 10,
                marginTop: Platform.OS === 'ios' ? wp(2) : 0,
                justifyContent: 'center',
              }}
              data={this.state.departmentListForDropdown}
            />
            {/* <Image resizeMode={'contain'} style={{ height: hp(2.5), width: hp(2.5), }} source={require('../../../assets/images/arrow_down.png')} /> */}
          </TouchableOpacity>
        </View>
      </ElevatedView>
    );
  }

  selectPatient() {
    return (
      <View>
        <View style={{ paddingTop: 30 }}>
          <Text
            style={{
              color: AppColors.instantVideoTheme,
              fontFamily: AppStyles.fontFamilyDemi,
              fontSize: hp(2.2),
              textAlign: isRTL ? 'left' : 'auto',
            }}
          >
            {strings('doctor.text.selectPatient')}
          </Text>
        </View>
        <FlatList
          data={this.state.userRelativeList}
          key={3}
          style={{ marginTop: hp(2) }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(item) => this._render_Details(item)}
          numColumns={2}
          extraData={this.state}
        />
        {this.state.userRelativeList.length < 6 && !this.state.isAddNewRelative ? (
          <TouchableHighlight
            style={{
              height: verticalScale(50),
              width: moderateScale(150),
            }}
            onPress={() => this.showAddPatientView()}
            underlayColor="transparent"
          >
            <View
              style={{
                alignItems: 'flex-start',
                height: verticalScale(50),
                width: moderateScale(150),
                flexDirection: 'row',
                margin: moderateScale(20),
                marginLeft: 0,
              }}
            >
              <Image
                style={{
                  width: moderateScale(20),
                  height: moderateScale(20),
                  borderRadius: moderateScale(5),
                }}
                source={require('../../../assets/images/add_relative.png')}
              />
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(17),
                  marginLeft: moderateScale(5),
                  color: AppColors.grey,
                }}
              >
                {strings('doctor.button.addNew')}
              </Text>
            </View>
          </TouchableHighlight>
        ) : (
          <View />
        )}

        {this.state.isAddNewRelative ? this.addPatientView() : <View />}
      </View>
    );
  }

  showAddPatientView() {
    this.setState({
      isAddNewRelative: true,
      fName: '',
      lName: '',
      dob: _dt,
      NRIC: '',
      relation: '',
      relationText: '',
      gender: '',
      insuranceNumber: '',
      insuranceText: '',
      maleTextColor: '#d3d3d3',
      femaleTextColor: '#d3d3d3',
      weight: '',
      weightType: 'kgs',
      height: '',
      heightType: 'cms',
      toggled: false,
      confirmation: false,
      isPatientSelected: false,
      relationData: relationData,
      otherRelationData: otherRelationData,
      relativeId: '',
      insurancePId: '',
      insuranceCompanyName: 'Select Insurance',
      isDataSet: false,
    });
  }

  addPatientView() {
    let insuranceProviders = this.state.insuranceProviders.map((d, i) => {
      return <Picker.Item key={d._id} label={d.companyName} value={d._id} />;
    });

    let insuranceProviderIOS = this.state.insuranceProviders.map((d, i) => {
      return i == 0 ? { key: d._id, section: true, label: d.companyName } : { key: d._id, label: d.companyName };
    });

    return (
      <View>
        {!this.state.isDataSet ? (
          <View>
            <TextInput
              allowFontScaling={false}
              placeholder={strings('doctor.text.firstName')}
              multiline={false}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.fName}
              onChangeText={(text) => this.setState({ fName: text })}
              returnKeyType={'next'}
              onSubmitEditing={() => this.refs.LastName.focus()}
            ></TextInput>
            <TextInput
              allowFontScaling={false}
              ref="LastName"
              placeholder={strings('doctor.text.lastName')}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.lName}
              onChangeText={(input) => this.setState({ lName: input, hideResults: true })}
              underlineColorAndroid={'white'}
              returnKeyType={'next'}
            ></TextInput>
            <TouchableHighlight onPress={() => this.openCalender()} underlayColor="transparent">
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>{strings('doctor.text.dob')}</Text>
                <Text ref="DOB" style={styles.date}>
                  {moment(this.state.dob).format('DD-MMM-YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
            <View style={styles.genderView}>
              <Text style={styles.selectGender}>{strings('doctor.text.gender')}</Text>
              <Text style={[styles.male, { color: this.state.maleTextColor }]} onPress={() => this.setGender('Male')}>
                {strings('doctor.text.male')}
              </Text>
              <Text style={[styles.female, { color: this.state.femaleTextColor }]} onPress={() => this.setGender('Female')}>
                {strings('doctor.text.female')}
              </Text>
            </View>

            {this.state.userIdTypes.length > 0 && (
              <View style={{ marginLeft: wp(0.5), marginRight: wp(0.5) }}>
                <TouchableOpacity
                  style={{
                    marginTop: hp(2),
                    height: hp(6),
                    justifyContent: 'center',
                    fontFamily: AppStyles.fontFamilyRegular,
                    borderWidth: hp(0.2),
                    borderColor: AppColors.backgroundGray,
                    borderRadius: hp(1),
                    width: wp(90),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Dropdown
                    ref={'identificationtypeDropdown'}
                    label=""
                    textColor={AppColors.blackColor}
                    itemColor={AppColors.blackColor}
                    fontFamily={AppStyles.fontFamilyRegular}
                    dropdownPosition={-5}
                    dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                    itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                    rippleCentered={false}
                    dropdownMargins={{ min: 8, max: 16 }}
                    baseColor={'transparent'}
                    value={'Identification Type'}
                    pickerStyle={{
                      width: wp(89),
                      height: 'auto',
                    }}
                    containerStyle={{
                      width: wp(80),
                      marginTop: Platform.OS === 'ios' ? hp(0.8) : 0,
                      justifyContent: 'center',
                    }}
                    data={this.state.userIdTypes}
                    onChangeText={this.handleChange}
                  />

                  <Image
                    resizeMode={'contain'}
                    style={{ height: hp(2.5), width: hp(2.5) }}
                    source={require('../../../assets/images/arrow_down.png')}
                  />
                </TouchableOpacity>
              </View>
            )}

            {this.state.showInput && (
              <TextInput
                allowFontScaling={false}
                ref="referral"
                autoCapitalize={'none'}
                placeholder={'ID Number'}
                style={styles.inputStyle}
                placeholderTextColor={AppColors.textGray}
                value={this.state.userIdNum}
                maxLength={50}
                returnKeyType={'next'}
                underlineColorAndroid={'white'}
                onChangeText={(input) => this.setState({ userIdNum: input })}
              ></TextInput>
            )}

            {this.bmiView()}
            {Platform.OS === 'ios' ? (
              <View>
                <ModalSelector
                  data={this.state.isSelfExist ? otherRelationData : relationData}
                  initValue="Select Relation"
                  accessible={true}
                  cancelText={'Cancel'}
                  animationType={'fade'}
                  optionContainerStyle={{
                    backgroundColor: AppColors.whiteColor,
                  }}
                  optionTextStyle={{ color: AppColors.primaryColor }}
                  childrenContainerStyle={{
                    backgroundColor: AppColors.whiteColor,
                  }}
                  onChange={(option) => {
                    this.setState({
                      relation: this.getPickerLabel(option.label),
                      relationText: option.label,
                    });
                  }}
                >
                  <View style={styles.dobStyle}>
                    <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
                    <Text style={styles.date}>{this.state.relationText}</Text>
                  </View>
                </ModalSelector>
              </View>
            ) : (
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#D3D3D3' }}>
                {this.state.isSelfExist ? (
                  <Picker
                    style={styles.picker}
                    selectedValue={this.state.relation}
                    onValueChange={(itemValue, itemIndex) => this.setState({ relation: itemValue })}
                  >
                    <Picker.Item label="Relation" value="" />
                    <Picker.Item label="Spouse" value="spouse" />
                    <Picker.Item label="Son" value="son" />
                    <Picker.Item label="Daughter" value="daughter" />
                    <Picker.Item label="Others" value="other" />
                  </Picker>
                ) : (
                  <Picker
                    style={styles.picker}
                    selectedValue={this.state.relation}
                    onValueChange={(itemValue, itemIndex) => this.setState({ relation: itemValue })}
                  >
                    <Picker.Item label="Relation" value="" />
                    <Picker.Item label="Spouse" value="spouse" />
                    <Picker.Item label="Son" value="son" />
                    <Picker.Item label="Daughter" value="daughter" />
                    <Picker.Item label="Others" value="other" />
                  </Picker>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.holderText}>{strings('doctor.text.insuranceHolder')}</Text>
              <View style={styles.switchStyle}>
                <Switch
                  onValueChange={(value) => this.switch(value)}
                  value={this.state.toggled}
                  disabled={false}
                  circleSize={moderateScale(25)}
                  barHeight={moderateScale(25)}
                  backgroundActive={AppColors.lightPink}
                  backgroundInactive={AppColors.primaryGray}
                  circleActiveColor={AppColors.primaryColor}
                  circleInActiveColor={AppColors.greyColor}
                  changeValueImmediately={true}
                  innerCircleStyle={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: 'transparent',
                  }}
                  switchLeftPx={2}
                  switchRightPx={2}
                  switchWidthMultiplier={2}
                />
              </View>
            </View>
            {this.state.toggled ? (
              <View>
                {Platform.OS === 'ios' ? (
                  <View>
                    <ModalSelector
                      data={insuranceProviderIOS}
                      initValue="Select Insurance"
                      accessible={true}
                      cancelText={'Cancel'}
                      animationType={'fade'}
                      optionContainerStyle={{
                        backgroundColor: AppColors.whiteColor,
                      }}
                      optionTextStyle={{ color: AppColors.primaryColor }}
                      childrenContainerStyle={{
                        backgroundColor: AppColors.whiteColor,
                      }}
                      onChange={(option) => {
                        this.setInsuranceData(option.key);
                      }}
                    >
                      <View style={styles.dobStyle}>
                        <Text style={styles.dobText}>{this.state.insuranceCompanyName}</Text>
                        <Text style={styles.date}></Text>
                      </View>
                    </ModalSelector>
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings('doctor.text.insuranceNum')}
                      placeholderTextColor={AppColors.textGray}
                      style={styles.NRIC}
                      value={this.state.insuranceNumber}
                      onChangeText={(input) => this.setState({ insuranceNumber: input })}
                      underlineColorAndroid={'white'}
                    ></TextInput>
                  </View>
                ) : (
                  <View>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#D3D3D3',
                      }}
                    >
                      <Picker
                        style={styles.picker}
                        selectedValue={this.state.insurancePId}
                        onValueChange={(itemValue, itemIndex) => this.setState({ insurancePId: itemValue })}
                      >
                        {/*onValueChange={(itemValue, itemIndex) => this.setInsuranceData(itemValue)}>*/}
                        {insuranceProviders}
                      </Picker>
                    </View>
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings('doctor.text.insuranceNum')}
                      placeholderTextColor={AppColors.textGray}
                      style={styles.NRIC}
                      value={this.state.insuranceNumber}
                      onChangeText={(input) => this.setState({ insuranceNumber: input })}
                      underlineColorAndroid={'white'}
                    ></TextInput>
                  </View>
                )}
              </View>
            ) : (
              <View />
            )}
          </View>
        ) : (
          <View style={styles.registration}>
            <View style={styles.dobStyle}>
              <Text style={Platform.OS === 'ios' ? styles.inputIOS : styles.dobText}>{this.state.fName}</Text>
            </View>
            <View style={styles.dobStyle}>
              <Text style={Platform.OS === 'ios' ? styles.inputIOS : styles.dobText}>{this.state.lName}</Text>
            </View>
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>{strings('doctor.text.dob')}</Text>
              <Text ref="DOB" style={styles.date}>
                {moment(this.state.dob).format('DD-MMM-YYYY')}
              </Text>
            </View>
            <View style={styles.genderView}>
              <Text style={styles.selectGender}>{strings('doctor.text.gender')}</Text>
              <Text style={[styles.male, { color: this.state.maleTextColor }]}>{strings('doctor.text.male')}</Text>
              <Text style={[styles.female, { color: this.state.femaleTextColor }]}>Female</Text>
            </View>
            {this.bmiView()}
            <View style={styles.dobStyle}>
              <Text style={styles.dobText}>{strings('doctor.text.relation')}</Text>
              <Text style={styles.date}>{this.state.relationText}</Text>
            </View>
            <View>
              <View style={styles.dobStyle}>
                <Text style={styles.dobText}>
                  {this.state.insuranceNumber == '' || this.state.insuranceCompanyName == ''
                    ? strings('doctor.text.insuranceNotAvail')
                    : this.state.insuranceCompanyName}
                </Text>
              </View>
            </View>
            <Text style={styles.dobText}>{this.state.insuranceNumber == '' ? ' ' : this.state.insuranceNumber}</Text>
          </View>
        )}
      </View>
    );
  }

  setInsuranceData(insuranceKey) {
    let self = this;
    this.state.insuranceProviders.map(function (value) {
      if (insuranceKey == value._id) {
        self.setState({
          insuranceCompanyName: value.companyName,
          insurancePId: insuranceKey,
        });
      }
    });
  }

  selectSymptoms() {
    return (
      <View style={{ paddingVertical: 20, width: wp(80) }}>
        <Text
          style={{
            color: AppColors.instantVideoTheme,
            fontFamily: AppStyles.fontFamilyDemi,
            fontSize: hp(2.2),
            textAlign: isRTL ? 'left' : 'auto',
          }}
        >
          {strings('common.waitingRoom.selectSymptoms')}
        </Text>
        {this._renderSymptomsInput()}
        <FlatList
          data={this.state.symptomList}
          key={33}
          style={{ marginTop: hp(2) }}
          keyExtractor={(index) => index.toString()}
          renderItem={(item) => this._renderSymptoms(item)}
          numColumns={3}
          extraData={this.state}
        />
      </View>
    );
  }

  _renderSymptomsInput() {
    return (
      <View>
        <View
          style={{
            width: wp(90),
            borderBottomWidth: wp(0.5),
            borderColor: AppColors.dividerColor,
            paddingBottom: hp(1),
            marginTop: hp(2),
          }}
        >
          {this.state.selectedSymptoms.length > 0 ? (
            <FlatList
              data={this.state.selectedSymptoms}
              key={4}
              style={{ marginTop: hp(3) }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(item) => this._renderSelectedSymptoms(item)}
              numColumns={2}
              extraData={this.state}
            />
          ) : (
            <Text
              style={{
                marginTop: hp(3),
                fontSize: 15,
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings('doctor.text.selectSymptoms')}
            </Text>
          )}
        </View>

        <View
          style={{
            width: wp(90),
            borderBottomWidth: wp(0.5),
            borderColor: AppColors.dividerColor,
            paddingBottom: hp(1),
            marginTop: hp(3),
            flexDirection: 'row',
          }}
        >
          <TextInput
            allowFontScaling={false}
            placeholder={strings('doctor.text.addSymp')}
            multiline={true}
            placeholderTextColor={AppColors.textGray}
            style={{
              flex: 1,
              color: AppColors.blackColor,
              fontSize: moderateScale(15),
              fontFamily: AppStyles.fontFamilyRegular,
              textAlign: isRTL ? 'right' : 'auto',
            }}
            value={this.state.addSymptoms}
            maxLength={25}
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={(text) => this.setState({ addSymptoms: text })}
            returnKeyType={'done'}
          />

          <TouchableOpacity onPress={() => (this.state.addSymptoms.trim().length > 0 ? this._addUserSpecifiedSymptoms() : null)}>
            <Text
              style={{
                flex: 0.2,
                marginTop: hp(0.5),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.primaryColor,
                textAlign: 'right',
              }}
            >
              {strings('doctor.button.add')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _addUserSpecifiedSymptoms() {
    if (this.state.selectedSymptoms.length < 8) {
      let selectedSymptoms = this.state.selectedSymptoms;
      selectedSymptoms.push({
        name: this.state.addSymptoms.trim(),
        isPrimary: false,
      });
      this.setState({ selectedSymptoms: selectedSymptoms, addSymptoms: '' });
    } else {
      Toast.show(strings('doctor.text.notMoreThenEightSymp'));
    }
  }

  _renderSelectedSymptoms(item) {
    return (
      <View
        style={{
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: AppColors.instantVideoTheme,
          borderRadius: wp(5),
          borderColor: AppColors.instantVideoTheme,
          marginRight: wp(3),
          marginBottom: hp(1),
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            paddingBottom: wp(1.2),
            paddingTop: wp(1.2),
            paddingLeft: wp(1.8),
            paddingRight: wp(1.2),
            width: wp(25),
            marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
            fontFamily: AppStyles.fontFamilyRegular,
            color: AppColors.whiteColor,
            textAlign: isRTL ? 'left' : 'auto',
          }}
        >
          {item.item.name}
        </Text>

        <TouchableOpacity onPress={() => this._deleteSelectedSymptoms(item)}>
          <Image resizeMode={'contain'} style={{ height: 30, width: 30 }} source={images.cancelIcon} />
        </TouchableOpacity>
      </View>
    );
  }

  _deleteSelectedSymptoms(item) {
    let selectedSymptoms = this.state.selectedSymptoms;
    let symptoms = this.state.symptomList;
    if (item.item.isPrimary) {
      symptoms[item.item.index].isSelected = false;
    }
    selectedSymptoms.splice(item.index, 1);
    this.setState({
      selectedSymptoms: selectedSymptoms,
      symptomList: symptoms,
    });
  }

  _render_Details(item) {
    let isLeft = item.index % 2 > 0 ? false : true;
    return (
      <ElevatedView
        elevation={4}
        style={{
          width: wp(40),
          height: verticalScale(60),
          backgroundColor: item.item.isSelected ? AppColors.instantVideoTheme : AppColors.whiteColor,
          borderRadius: moderateScale(15),
          marginTop: moderateScale(10),
          marginBottom: moderateScale(5),
          marginRight: isLeft ? wp(5) : 0,
          marginLeft: wp(1),
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}
      >
        <TouchableHighlight
          onPress={() => this.selectRelative(item)}
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
            <CachedImage
              style={{
                width: wp(10),
                height: wp(10),
                borderRadius: wp(10 / 2),
                marginLeft: wp(0.5),
                alignSelf: 'center',
              }}
              source={{ uri: AppUtils.handleNullImg(item.item.profilePic) }}
            />
            <View
              style={{
                alignItems: 'flex-start',
                alignSelf: 'center',
                marginLeft: moderateScale(5),
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: item.item.isSelected ? AppColors.whiteColor : AppColors.blackColor,
                  width: wp(26),
                  textAlign: isRTL ? 'left' : 'auto',
                }}
                numberOfLines={1}
              >
                {item.item.firstName} {item.item.lastName}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: item.item.isSelected ? AppColors.whiteColor : AppColors.grey,
                }}
              >
                {item.item.spouse}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </ElevatedView>
    );
  }

  selectRelative(item) {
    let userRelativeList = this.state.userRelativeList;
    userRelativeList.map((relative, index) => {
      relative.isSelected = item.index === index ? true : false;
    });
    this.setState({
      userRelativeList: userRelativeList,
      selectedUserRelative: item.item,
    });
  }

  bmiView() {
    return (
      <View>
        <View style={bmiStyles.bmiRow}>
          <Text style={bmiStyles.bmiHeader}>
            {strings('doctor.text.weight')} ({strings('doctor.text.optional')})
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              placeholder="0"
              style={bmiStyles.bmiInput}
              value={this.state.weight.toString()}
              textContentType={'telephoneNumber'}
              keyboardType={'numeric'}
              onChangeText={(val) => {
                console.log(val);
                if (val === '' || reg.test(val)) this.setState({ weight: val });
              }}
              maxLength={3}
            />
            <View style={bmiStyles.bmiOptionHolder}>
              <Text
                style={[bmiStyles.weightOption, this.state.weightType === 'kgs' ? bmiStyles.selected : {}]}
                onPress={() => {
                  if (this.state.weightType === 'lbs' && this.state.weight) {
                    const wt = Math.round(Number(this.state.weight) / 2.2046);
                    this.setState({ weightType: 'kgs', weight: wt.toString() });
                  } else {
                    this.setState({ weightType: 'kgs' });
                  }
                }}
              >
                kgs
              </Text>
              <Text
                style={[bmiStyles.weightOption, this.state.weightType === 'lbs' ? bmiStyles.selected : {}]}
                onPress={() => {
                  if (this.state.weightType === 'kgs' && this.state.weight) {
                    const wt = Math.round(Number(this.state.weight) * 2.2046);
                    this.setState({ weightType: 'lbs', weight: wt.toString() });
                  } else {
                    this.setState({ weightType: 'lbs' });
                  }
                }}
              >
                lbs
              </Text>
            </View>
          </View>
        </View>
        <View style={bmiStyles.bmiRow}>
          <Text style={bmiStyles.bmiHeader}>
            {strings('doctor.text.height')} ({strings('doctor.text.optional')})
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              placeholder="0"
              style={bmiStyles.bmiInput}
              value={this.state.height.toString()}
              textContentType={'telephoneNumber'}
              keyboardType={'numeric'}
              maxLength={5}
              onChangeText={(val) => {
                console.log(val.length);
                const { height, heightType } = this.state;
                if (heightType === 'cms') {
                  if (val === '' || reg.test(val)) this.setState({ height: val });
                } else {
                  if (val.length < 2) {
                    if (height.length > val.length) {
                      this.setState({ height: val });
                    } else {
                      if (Number(val) < 1) {
                        return;
                      } else {
                        if (val === '' || reg.test(val)) this.setState({ height: `${val}'` });
                      }
                    }
                  } else if (val.length === 2) {
                    if (height.length > val.length) {
                      this.setState({ height: val });
                    }
                  } else if (val.length === 3) {
                    if (height.length > val.length) {
                      this.setState({ height: val });
                    } else {
                      const rem = val.split("'")[1];
                      if (Number(rem) > 1) {
                        if (reg.test(Number(rem))) {
                          this.setState({ height: `${height}0${Number(rem)}"` });
                        }
                      } else {
                        if (reg.test(Number(rem))) {
                          this.setState({ height: `${height}${Number(rem)}` });
                        }
                      }
                    }
                  } else if (val.length === 4) {
                    console.log(val);
                    if (height.length > val.length) {
                      this.setState({ height: val });
                    } else {
                      const rem = val.split("'")[1];
                      if (Number(rem) < 12) {
                        if (reg.test(Number(rem))) {
                          this.setState({ height: `${height}${Number(rem) % 10}"` });
                        }
                      }
                    }
                  }
                }
              }}
            />
            <View style={bmiStyles.bmiOptionHolder}>
              <Text
                style={[bmiStyles.weightOption, this.state.heightType === 'cms' ? bmiStyles.selected : {}]}
                onPress={() => {
                  const { height, heightType } = this.state;
                  if (heightType === 'ft' && height) {
                    let [ft, inch] = height.split("'");
                    ft = Number(ft);
                    inch = Number(inch?.split('"')[0] || 0);
                    const ht = Math.round(ft * 30.48) + Math.round(inch * 2.54);
                    this.setState({ heightType: 'cms', height: `${ht}` });
                  } else {
                    this.setState({ heightType: 'cms' });
                  }
                }}
              >
                cms
              </Text>
              <Text
                style={[bmiStyles.weightOption, this.state.heightType === 'ft' ? bmiStyles.selected : {}]}
                onPress={() => {
                  const { height, heightType } = this.state;
                  if (heightType === 'cms' && height) {
                    const realFeet = (height * 0.3937) / 12;
                    const ft = Math.floor(realFeet);
                    const inch = Math.round((realFeet - ft) * 12);
                    this.setState({ heightType: 'ft', height: `${ft}'${inch > 9 ? inch : '0' + inch}"` });
                  } else {
                    this.setState({ heightType: 'ft' });
                  }
                }}
              >
                ft
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderSymptoms(item) {
    return (
      <TouchableOpacity
        onPress={() => this.addSymptoms(item)}
        style={{
          flex: 1,
          borderWidth: 2,
          justifyContent: 'center',
          backgroundColor: item.item.isSelected ? AppColors.instantVideoTheme : AppColors.whiteColor,
          borderRadius: wp(2),
          borderColor: item.item.isSelected ? AppColors.primaryColor : AppColors.lightPink2,
          margin: 5,
        }}
      >
        <Text
          style={{
            padding: wp(1),
            marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
            fontFamily: AppStyles.fontFamilyMedium,
            color: item.item.isSelected ? AppColors.whiteColor : AppColors.textGray,
            textAlign: isRTL ? 'left' : 'auto',
          }}
        >
          {item.item.name}
        </Text>
      </TouchableOpacity>
    );
  }

  addSymptoms(item) {
    let symptoms = this.state.symptomList;
    let selectedSymptoms = this.state.selectedSymptoms;
    if (!item.item.isSelected) {
      if (this.state.selectedSymptoms.length < 8) {
        symptoms[item.index].isSelected = !item.item.isSelected;
        selectedSymptoms.push({
          name: item.item.name,
          index: item.index,
          isPrimary: true,
          _id: item.item._id,
        });
      } else {
        Toast.show(strings('doctor.text.notMoreThenEightSymp'));
      }
    } else {
      symptoms[item.index].isSelected = !item.item.isSelected;
      let index = selectedSymptoms.findIndex((symptoms) => symptoms._id === item.item._id);
      selectedSymptoms.splice(index, 1);
    }
    this.setState({
      symptomList: symptoms,
      selectedSymptoms: selectedSymptoms,
    });
  }

  validateNewUser() {
    let isSelectInsurance = Platform.OS === 'ios' ? this.state.insuranceCompanyName === 'Select Insurance' : false;

    if (Validator.isBlank(this.state.fName)) {
      alert(strings('string.mandatory.firstName'));
    } else if (Validator.isBlank(this.state.lName)) {
      alert(strings('string.mandatory.lastName'));
    } else if (!Validator.validateNRIC(this.state.NRIC)) {
      alert(strings('string.mandatory.NRIC'));
    } else if (Validator.isBlank(this.state.gender)) {
      alert(strings('string.mandatory.gender'));
    } else if (Validator.isBlank(this.state.relation)) {
      alert(strings('string.mandatory.relation'));
    } else if (Validator.isValidHeightWeight(this.state.height, this.state.weight)) {
      this.showAlert('Invalid height or weight', true);
    } else if (Validator.isValidDOB(this.state.dob, this.state.relation)) {
      if (this.state.relation == 'Self') {
        alert(strings('string.mandatory.ageDifference'));
      } else {
        alert(strings('doctor.text.dobInvalid'));
      }
      this.setState({
        DOB: moment(new Date()).format('DD-MMM-YYYY'),
      });
    } else {
      if (this.state.toggled) {
        if (isSelectInsurance || !this.state.insurancePId) {
          this.showAlert(strings('string.mandatory.insuranceCompany'), true);
        } else if (Validator.isBlank(this.state.insuranceNumber)) {
          this.showAlert(strings('string.mandatory.insuranceNumber'), true);
        } else {
          this.addNewRelative();
        }
      } else {
        this.addNewRelative();
      }
    }
  }

  showAlert(msg, ispop) {
    let self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  addNewRelative() {
    var self = this;

    self.setState({
      isAddNewRelative: false,
    });
    let insuranceProvider = null;
    let insuranceNumber = null;
    if (this.state.insurancePId == '') {
      insuranceProvider = null;
    } else {
      insuranceProvider = this.state.insurancePId;
    }

    if (this.state.insuranceNumber == '') {
      insuranceNumber = null;
    } else {
      insuranceNumber = this.state.insuranceNumber;
    }

    let profileDetails = {
      firstName: this.state.fName,
      lastName: this.state.lName,
      dateOfBirth: this.state.dob,
      gender: this.state.gender,
      height: this.state.height,
      weight: this.state.weight,
      heightType: this.state.heightType,
      weightType: this.state.weightType,
      NRIC: this.state.NRIC,
      relation: this.state.relation,
      relationText: 'Select Relation',
      insuranceProvider: insuranceProvider,
      insuranceNumber: insuranceNumber,
      identificationType: tempId?._id ?? '',
      identificationNumber: this.state.userIdNum ?? '',
    };

    var self = this;
    self.setState({ isLoading: true });
    SHApiConnector.addNewRelativeInAppointment(profileDetails, function (err, stat) {
      try {
        self.setState({ isLoading: false }, () => {
          if (err) {
            self.showAlert(strings('string.error_code.error_10002'), true);
          } else if (stat?.error_code == '10029') {
            self.showAlert(strings('string.error_code.error_10029'), true);
          } else if (stat?.error_code == '10024') {
            self.showAlert(strings('string.error_code.error_10024'), true);
          } else if (stat?.error_code == '10030') {
            self.showAlert(strings('string.error_code.error_10030'), true);
          } else if (stat?.error_code == '10021') {
            self.showAlert(strings('string.error_code.error_10021'), true);
          } else if (stat?.error_code == '10002') {
            self.showAlert(strings('string.error_code.error_10002'), true);
          } else if (stat?.error_code == '20001') {
            self.showAlert(strings('string.error_code.error_20001'), true);
          } else if (stat && stat !== null) {
            self.setState({
              userRelativeList: stat.relativeDetails,
              fName: '',
              lName: '',
              dob: _dt,
              NRIC: '',
              relation: '',
              relationText: '',
              gender: '',
              insuranceNumber: '',
              insuranceText: '',
              isLoading: false,
            });
            alert(strings('common.waitingRoom.relativeAdded'));
          }
        });
      } catch (e) {
        console.error(e);
        self.setState({ isLoading: false });
      }
    });
  }

  bottomBar() {
    return (
      <View
        style={{
          width: wp(100),
          shadowOffset: {
            width: 10,
            height: -5,
          },
          shadowOpacity: 0.1,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: AppColors.blackColor,
          backgroundColor: AppColors.whiteColor,
          paddingBottom: AppUtils.isX ? hp(1) : 0,
          elevation: 4,
          height: AppUtils.isX ? hp(12) : hp(10),
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }}
          onPress={() => (this.state.isAddNewRelative ? this.setState({ isAddNewRelative: false }) : Actions.pop())}
        >
          <View
            style={{
              height: hp(6),
              width: wp(40),
              backgroundColor: AppColors.whiteColor,
              borderWidth: 2,
              justifyContent: 'center',
              borderRadius: hp(0.8),
              alignItems: 'center',
              borderColor: AppColors.primaryColor,
            }}
          >
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                color: AppColors.primaryColor,
                marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                textAlign: 'center',
                fontSize: hp(2.2),
              }}
            >
              {this.state.isAddNewRelative ? strings('doctor.button.cancel') : strings('doctor.button.previous')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }}
          onPress={() => (this.state.isAddNewRelative ? this.validateNewUser() : this.navigateToNextScreen())}
        >
          <View
            style={{
              height: hp(6),
              width: wp(40),
              backgroundColor: AppColors.instantVideoTheme,
              borderWidth: 2,
              justifyContent: 'center',
              borderRadius: hp(0.8),
              alignItems: 'center',
              borderColor: AppColors.instantVideoTheme,
            }}
          >
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                color: AppColors.whiteColor,
                marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                textAlign: 'center',
                fontSize: hp(2.2),
              }}
            >
              {this.state.isAddNewRelative ? strings('doctor.button.addUser') : strings('doctor.button.next')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  navigateToNextScreen() {
    let self = this.state;
    if (self.selectedUserRelative != null) {
      Actions.Summary({
        speciality: self.selectedSpeciality,
        specialityId: self.selectedSpecialityId,
        selectedSymptoms: self.selectedSymptoms,
        patient: self.selectedUserRelative,
        countryCode: self.countryCode,
      });
    } else {
      alert(strings('common.waitingRoom.plsSelectPatient'));
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
        <ScrollView>
          <View
            style={{
              flexDirection: 'column',
              margin: wp(4),
            }}
          >
            {/* {this.selectFilters()} */}
            {this.selectCategory()}
            {this.selectPatient()}
            {this.selectSymptoms()}
          </View>
        </ScrollView>
        {Platform.OS === 'ios' ? this.openIOSCalender() : this.openAndroidCalender()}
        {this.bottomBar()}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    marginTop: verticalScale(10),
    textAlign: isRTL ? 'right' : 'auto',
  },
  dobStyle: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: AppColors.primaryGray,
    margin: moderateScale(1),
    justifyContent: 'space-between',
  },
  dobText: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
    marginTop: verticalScale(20),
  },
  date: {
    borderBottomWidth: 0,
    width: moderateScale(100),
    marginLeft: moderateScale(100),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
    color: AppColors.textGray,
    textAlign: 'right',
  },
  genderView: {
    flexDirection: 'row',
    height: verticalScale(70),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectGender: {
    width: moderateScale(60),
    color: AppColors.blackColor,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    marginTop: verticalScale(20),
  },
  relation: {
    margin: moderateScale(5),
    color: AppColors.primaryGray,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    marginTop: verticalScale(30),
  },
  male: {
    marginLeft: moderateScale(150),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.primaryGray,
    marginTop: verticalScale(20),
  },
  female: {
    marginLeft: moderateScale(20),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
  },
  holderText: {
    color: AppColors.blackColor,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    margin: moderateScale(5),
    marginTop: verticalScale(30),
  },
  switchStyle: {
    marginLeft: moderateScale(120),
    marginTop: verticalScale(30),
    alignSelf: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? verticalScale(100) : verticalScale(50),
    marginTop: verticalScale(22),
    borderBottomWidth: 1,
    color: AppColors.blackColor,
  },
  NRIC: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    marginTop: verticalScale(20),
  },
});
