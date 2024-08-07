import { Alert, Text, StyleSheet, View, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { Component } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import { AppUtils } from '../../utils/AppUtils';
import { Actions } from 'react-native-router-flux';
import { strings } from '../../locales/i18n';
import images from '../../utils/images';
import ProgressLoader from 'rn-progress-loader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import CachedImage from '../../cachedImage/CachedImage';
import Toast from 'react-native-simple-toast';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { AppStrings } from '../../shared/AppStrings';

export default class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorLanguages: [],
      selectedSymptoms: [],
      countryCode: '',
      countryPaymentCode: '',
      currency: '',
      fixedConsultationfee: '',
      amount: '',
      discountValue: 0,
      specialty: '',
      isCouponModalVisible: false,
      isBottomSheetVisible: false,
      isLoading: false,
      patientDetails: '',
      selectedLanguage: '',
      specialityId: '',
      appointmentRequestId: '',
      appointmentClientSecret: null,
      isCouponApplied: false,
      couponCode: '',
      coupon: '',
      referralCode: '',
      module: '',
      couponId: null,
      isWaivedOff: false,
      isPaymentNegative: false,
    };
    this.refs = React.createRef(null);
  }

  async componentDidMount() {
    let specialtyId = this.props.specialityId;
    let countryCode = this.props.countryCode;
    let code = AppUtils.getCountryCode(countryCode);
    this.getOnlineDoctorDetails(specialtyId, countryCode);

    this.setState({
      specialty: this.props.speciality,
      patientDetails: this.props.patient,
      selectedSymptoms: this.props.selectedSymptoms,
      specialityId: this.props.specialityId,
      countryCode: this.props.countryCode,
      countryPaymentCode: code,
    });
  }

  async getOnlineDoctorDetails(specialtyId, countryCode) {
    this.setState({ isLoading: true });
    let departmentBody = {
      department: specialtyId,
      countryCode: countryCode,
    };
    try {
      let response = await SHApiConnector.getWaitingRoomDoctorDetails(departmentBody);
      if (response.status == 200) {
        let preferredLanguages = response.data.data.languages.reverse();
        const sortedLanguages = preferredLanguages.sort((a, b) => {
          if (a.language === 'English') return -1;
          if (b.language === 'English') return 1;
          return a.language.localeCompare(b.language);
        });

        let EnglishFound = false;
        preferredLanguages.forEach((language, index) => {
          if (index === 0) {
            language.isSelected = true;
          }
          if (language.language == 'English') {
            EnglishFound = true;
            this.setState({ selectedLanguage: language.language });

            if (!language.isSelected) {
              this.setState({ selectedLanguage: language.language });

              language.isSelected = true;

              // Set "isSelected" to false for other languages
              preferredLanguages.forEach((item) => {
                if (item.language !== language.language) {
                  item.isSelected = false;
                }
              });
            }
          }

          if (index === 0 && !EnglishFound) {
            language.isSelected = true;
            this.setState({ selectedLanguage: language.language });
          }
        });
        this.setState({
          doctorLanguages: sortedLanguages,
          currency: response.data.fee.currency,
          amount: response.data.fee.amount,
          fixedConsultationfee: response.data.fee.amount,
          isLoading: false,
        });
      } else {
        this.setState({ isLoading: false });
        Alert.alert('No Doctor is online !', 'Please try again after sometime', [
          {
            text: 'Ok',
            onPress: () => Actions.MainScreen(),
          },
        ]);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      alert('Something went wrong !');
    }
  }

  summaryHeader() {
    return (
      <View
        style={{
          flexDirection: 'column',
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: hp(2),
          }}
        >
          <View>
            <Text
              style={{
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyDemi,
                fontSize: hp(2.4),
              }}
            >
              {strings('common.waitingRoom.consultText')}
            </Text>
            <Text
              style={{
                marginTop: 5,
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyDemi,
                fontSize: hp(2.4),
              }}
            >
              {this.state.specialty}
            </Text>
          </View>
          <View
            style={{
              height: hp(6),
              width: hp(6),
              justifyContent: 'center',
              borderRadius: 30,
              backgroundColor: AppColors.lightPink2,
            }}
          >
            <Image
              style={{
                height: hp(4),
                width: hp(4),
                alignSelf: 'center',
              }}
              source={images.stethoscope}
            />
          </View>
        </View>
        <View style={styles.divider}></View>
        <Text style={styles.subHeading}>{strings('common.waitingRoom.chooseLanguage')}</Text>
        <Text style={styles.caption}>{strings('common.waitingRoom.chooseLangDescription')}</Text>
        <FlatList
          data={this.state.doctorLanguages}
          key={98}
          style={{ marginHorizontal: hp(2) }}
          keyExtractor={(index) => index.toString()}
          renderItem={(item) => this._renderLanguages(item)}
          extraData={this.state}
          horizontal={true}
        />
      </View>
    );
  }

  _renderLanguages(item) {
    return (
      <TouchableOpacity
        onPress={() => this.updatePreferredLanguage(item)}
        style={{
          flex: 1,
          borderWidth: 2,
          paddingVertical: 5,
          paddingHorizontal: 10,
          justifyContent: 'center',
          marginRight: hp(1.5),
          marginBottom: hp(2),
          borderRadius: 30,
          borderColor: item.item.isSelected ? AppColors.instantVideoTheme : AppColors.greyBorder,
        }}
      >
        <Text
          style={{
            padding: wp(1),
            marginTop: Platform.OS === 'ios' ? hp(0.5) : 0,
            fontFamily: AppStyles.fontFamilyMedium,
            color: item.item.isSelected ? AppColors.instantVideoTheme : AppColors.textGray,
          }}
        >
          {item.item.language}
        </Text>
      </TouchableOpacity>
    );
  }

  updatePreferredLanguage(selectedLanguage) {
    let self = this.state;
    self.doctorLanguages.forEach((lang) => (lang.isSelected = false));
    let doctorLanguageList = self.doctorLanguages;

    doctorLanguageList[selectedLanguage.index].isSelected = !selectedLanguage.item.isSelected;
    this.setState({
      doctorLanguages: doctorLanguageList,
      selectedLanguage: selectedLanguage.item.language,
    });
  }

  applyCoupon() {
    return (
      <View
        style={{
          backgroundColor: AppColors.whiteColor,
          marginTop: hp(2),
          paddingHorizontal: hp(2),
        }}
      >
        {this.state.isCouponApplied ? this.couponApplied() : this.applyCouponCode()}
      </View>
    );
  }

  applyCouponCode() {
    return (
      <TouchableOpacity
        onPress={() => this.setState({ isCouponModalVisible: true })}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={{
              height: hp(3),
              width: hp(3),
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              alignSelf: 'center',
            }}
            source={images.discount}
          />
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyMedium,
              fontSize: hp(1.8),
              margin: hp(2),
            }}
          >
            {strings('common.waitingRoom.applyCoupon')}
          </Text>
        </View>
        <AntDesign
          name="right"
          size={15}
          style={{
            color: AppColors.blackColor,
            alignItems: 'center',
            alignSelf: 'center',
          }}
        />
      </TouchableOpacity>
    );
  }

  couponApplied() {
    return (
      <View
        style={{
          flexDirection: 'row',
          marginVertical: hp(2),
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign
            name="checkcircleo"
            size={18}
            style={{
              color: AppColors.greenColor2,
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
          />
          <Text
            style={{
              marginHorizontal: hp(2),
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyMedium,
            }}
          >
            {strings('common.waitingRoom.couponApplied')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => this.removePressed()}>
          <Text
            style={{
              color: AppColors.instantVideoTheme,
              fontSize: hp(1.6),
              fontFamily: AppStyles.fontFamilyMedium,
            }}
          >
            {strings('common.waitingRoom.remove')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  couponModal() {
    return (
      <Modal
        style={{
          backgroundColor: AppColors.transparent,
          margin: 0,
        }}
        visible={this.state.isCouponModalVisible}
        onBackdropPress={() => this.setState({ isCouponModalVisible: false })}
      >
        <View
          style={{
            height: hp(25),
            backgroundColor: AppColors.whiteColor,
            marginHorizontal: 25,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.subHeading}>{strings('common.waitingRoom.pleaseEnterCoupon')}</Text>
          <View
            style={{
              height: hp(6),
              borderWidth: hp(0.2),
              marginVertical: hp(2),
              borderColor: AppColors.backgroundGray,
              borderRadius: wp(2),
              width: wp(60),
              justifyContent: 'center',
              backgroundColor: AppColors.whiteShadeColor,
            }}
          >
            <TextInput
              allowFontScaling={false}
              placeholder={strings('doctor.text.enterCouponCode')}
              placeholderTextColor={AppColors.textGray}
              onChangeText={(value) => this.setState({ couponCode: value })}
              style={{
                height: hp(10),
                fontSize: hp(1.8),
                color: AppColors.textGray,
                padding: hp('1'),
              }}
            />
          </View>
          <TouchableOpacity style={{ marginBottom: wp(3) }} onPress={() => this.applyCouponPressed(this.state.couponCode)}>
            <View
              style={{
                height: hp(5),
                width: wp(28),
                backgroundColor: AppColors.instantVideoTheme,
                borderWidth: 1,
                justifyContent: 'center',
                borderRadius: hp(10),
                alignItems: 'center',
                borderColor: AppColors.instantVideoTheme,
              }}
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyDemi,
                  color: AppColors.whiteColor,
                  textAlign: 'center',
                  fontSize: hp(2),
                }}
              >
                {strings('common.waitingRoom.apply')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  async applyCouponPressed(couponCode) {
    console.log('CheckCouponCodeCheck', couponCode);
    let self = this;
    if (self.state.couponCode.trim() == '') {
      Toast.show(strings('doctor.text.pleaseEnterCouponCode'));
    } else {
      let coupenDetails = {
        referralCode: couponCode,
        module: AppStrings.label.DOCTOR_BOOKING,
        countryCode: self.state.countryCode,
      };
      this.setState({ isLoading: true });
      try {
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        console.log('CheckCouponDetails6', JSON.stringify(response.data));
        if (response.data.status === 'success') {
          this.calculateAmountAfterCouponApplied(response.data.data);
        } else {
          console.log('CheckError2', response.data);
          this.setState({
            isLoading: false,
            isCouponApplied: false,
            isCouponModalVisible: false,
            couponCode: '',
          });
          alert(response.data.message);
        }
      } catch (e) {
        this.setState({ isLoading: false });
        alert('Something went wrong!');
      }
    }
  }

  calculateAmountAfterCouponApplied(couponData) {
    let self = this;
    let discount = 0;
    let total = 0;
    let isPaymentNegative = false;
    let waveOffStatus = false;
    let fixedAmount = self.state.fixedConsultationfee;
    const { coupon } = couponData;
    if (coupon.valueType == 'FIXED') {
      if (coupon.couponValue > fixedAmount) {
        total = -1;
      } else {
        discount = fixedAmount - coupon.couponValue;
        total = coupon.couponValue;
      }
    } else if (coupon.valueType == 'PRICE') {
      discount = discount + coupon.couponValue;
      total = fixedAmount - discount;
    } else if (coupon.valueType == 'PERCENT' && coupon.couponValue == 100) {
      total = 0;
      discount = fixedAmount;
      waveOffStatus = true;
    } else if (coupon.valueType == 'PERCENT') {
      discount = (fixedAmount * coupon.couponValue) / 100;
      total = fixedAmount - discount;
    } else {
      total = fixedAmount;
    }
    console.log('CheckTotal: ', total);
    console.log('Coupon flat value', coupon.couponValue);
    if (total < 0) {
      isPaymentNegative = true;
      setTimeout(() => {
        Toast.show('Coupon pricing is more then consultation price.');
      }, 100);
      self.setState({
        isLoading: false,
        isCouponModalVisible: false,
        isCouponApplied: false,
        isPaymentNegative: isPaymentNegative,
      });
    } else if (total > fixedAmount) {
      setTimeout(() => {
        Toast.show('Invalid Coupon Code');
      }, 100);
      self.setState({
        isLoading: false,
        isCouponModalVisible: false,
        isCouponApplied: false,
      });
    } else {
      self.setState({
        isLoading: false,
        isCouponModalVisible: false,
        isCouponApplied: true,
        couponId: coupon._id,
        amount: total,
        discountValue: discount,
        isWaivedOff: waveOffStatus,
      });
    }
  }

  removePressed() {
    this.setState({
      isCouponApplied: false,
      couponId: null,
      couponCode: '',
      amount: this.state.fixedConsultationfee,
      discountValue: 0,
      isWaivedOff: false,
    });
  }

  consultationInfo() {
    return (
      <View style={{ backgroundColor: AppColors.whiteColor, marginTop: hp(2) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.subHeading]}>{strings('common.waitingRoom.instantConsult')}</Text>
            <Text style={styles.caption}>{strings('common.waitingRoom.videoConsultation')}</Text>
            {/* <View
              style={{
                marginHorizontal: hp(2),
                marginBottom: hp(2.5),
                backgroundColor: AppColors.lightPink2,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: AppColors.blackColor,
                  fontSize: hp(1.5),
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  fontFamily: AppStyles.fontFamilyRegular,
                }}
              >
                You will also get a free follow up for 7 days with every consultation.
              </Text>
            </View> */}
          </View>
          {this.state.isWaivedOff ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.subHeading, { fontSize: hp(1.8), color: AppColors.greenColor }]}>{strings('common.waitingRoom.wavedOff')}</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.subHeading}>
                {this.state.currency} {this.state.amount}
              </Text>
              {this.state.countryCode == '65' || '60' ? (
                <Text style={[styles.caption, { fontSize: hp(1.2) }]}>{strings('common.waitingRoom.taxes')}</Text>
              ) : (
                <View></View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  patientInformation() {
    let patient = this.state.patientDetails;
    return (
      <View style={{ backgroundColor: AppColors.whiteColor, marginTop: hp(2) }}>
        <Text style={styles.subHeading}>{strings('common.waitingRoom.patientDetails')}</Text>
        <View style={{ flexDirection: 'row' }}>
          <CachedImage
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(10 / 2),
              marginLeft: hp(1),
              alignSelf: 'center',
            }}
            source={{ uri: AppUtils.handleNullImg(patient.profilePic) }}
          />
          <View style={{ flexDirection: 'column', marginVertical: hp(2) }}>
            <Text style={{ fontFamily: AppStyles.fontFamilyMedium, marginHorizontal: hp(3) }}>
              {patient.firstName} {patient.lastName}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 2 }}>
              <Text style={{ fontFamily: AppStyles.fontFamilyMedium, marginLeft: hp(3) }}>
                {AppUtils.getAgeFromDateOfBirth(patient.dateOfBirth) + ' yrs'} |
              </Text>
              <Text style={{ fontFamily: AppStyles.fontFamilyMedium }}>{' ' + patient.gender}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  patientSymptoms() {
    return this.state.selectedSymptoms.length != 0 ? (
      <View style={{ backgroundColor: AppColors.whiteColor, marginTop: hp(2) }}>
        <Text style={styles.subHeading}>{strings('common.waitingRoom.symptoms')}</Text>
        <FlatList
          data={this.state.selectedSymptoms}
          key={98}
          style={{ marginHorizontal: hp(2) }}
          keyExtractor={(index) => index.toString()}
          renderItem={(symptom) => this._renderSymptomsList(symptom.item)}
          extraData={this.state}
          horizontal={true}
        />
      </View>
    ) : (
      <View></View>
    );
  }

  _renderSymptomsList(symptom) {
    return <Text style={{ marginBottom: hp(2), marginRight: hp(1), fontFamily: AppStyles.fontFamilyMedium }}>{symptom.name} </Text>;
  }

  dataAndPrivacy() {
    return (
      <View style={{ backgroundColor: AppColors.whiteColor, marginTop: hp(2) }}>
        <View style={{ flexDirection: 'column' }}>
          <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
            <AntDesign
              name="lock"
              size={18}
              style={{
                alignSelf: 'center',
                marginLeft: hp(2),
                color: AppColors.blackColor,
              }}
            />
            <Text style={[styles.subHeading, { marginLeft: hp(1), marginTop: wp(2.5) }]}>{strings('common.waitingRoom.dataPrivacy')}</Text>
          </View>
          <Text style={styles.privacyStyle}>{strings('common.waitingRoom.privacyDesc1')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text style={styles.privacyStyle}>{strings('common.waitingRoom.privacyDesc2')}</Text>
            <TouchableOpacity
              style={{
                marginLeft: hp(2),
                marginBottom: hp(2),
              }}
              onPress={() => Actions.TermsAndConditions()}
            >
              <Text
                style={{
                  color: AppColors.instantVideoTheme,
                  fontFamily: AppStyles.fontFamilyRegular,
                  textDecorationLine: 'underline',
                  fontSize: hp(1.5),
                }}
              >
                {strings('common.waitingRoom.privacyDesc3')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.caption, { marginTop: hp(3), textAlign: 'center' }]}>{strings('common.waitingRoom.disclaimerText')}</Text>
          </View>
        </View>
      </View>
    );
  }

  bottomBar() {
    return (
      <View style={styles.bottomBarStyle}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text
            style={{
              fontFamily: AppStyles.fontFamilyDemi,
              color: this.state.isWaivedOff ? AppColors.greenColor : AppColors.blackColor,
              marginTop: AppUtils.isIphone ? hp(0.5) : 0,
              textAlign: 'center',
              fontSize: hp(2),
              paddingBottom: 5,
            }}
          >
            {this.state.isWaivedOff ? strings('common.waitingRoom.wavedOff') : this.state.currency + ' ' + this.state.amount}
          </Text>
          <TouchableOpacity onPress={() => this.setState({ isBottomSheetVisible: true })}>
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                color: AppColors.instantVideoTheme,
                marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                textAlign: 'center',
                fontSize: hp(1.8),
              }}
            >
              {strings('common.waitingRoom.viewBreakup')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }} onPress={() => this._createPayment()}>
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
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.whiteColor,
                marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                textAlign: 'center',
                fontSize: hp(2),
              }}
            >
              {this.state.isWaivedOff ? strings('common.waitingRoom.continue') : strings('common.waitingRoom.payConsult')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  async xenditPaymentHandler(paymentDetails,paymentStatus) {
    this.setState({ isLoading: true });
    if (paymentStatus === 200) {
      this.setState({ isLoading: false });
      Actions.XenditInstantVc({
        paymentDetails: paymentDetails,
        module: AppStrings.key.appointment,
        callType: 'AUDIO',
        patientDetails: this.state.patientDetails,
      });
    } else {
      this.setState({ isLoading: false });
      Alert.alert('Something went wrong', 'Try again !!');
    }
  }

  async _createPayment() {


    // new logic here

     if (this.state.selectedLanguage) {
      if (this.state.countryCode === '62') {
        const patientName = this.state.patientDetails.firstName + ' ' + this.state.patientDetails.lastName;
        const selectedLanguagesList = [];
        const symptomNamesList = [];
        selectedLanguagesList.push(this.state.selectedLanguage);
        this.state.selectedSymptoms.map((symptom) => {
          symptomNamesList.push(symptom.name);
        });
        const symptomNames = symptomNamesList.join(', ');
        const paymentData = {
          relative: this.state.patientDetails._id,
          department: this.state.specialityId,
          symtomps: symptomNames,
          languages: selectedLanguagesList,
          currency: this.state.currency,
          name: patientName,
          newMobileApp: true,
          coupon : this.state.couponId
        };


        let response = await SHApiConnector.getWaitingRoomPaymentIntent(paymentData);
        if (response?.data?.data?.isWaiveOff) {
          this.confirmPayment(response?.data?.data?.appointmentRequest?._id, true);
        }
        else{
          console.log(response?.data?.data, response?.status,"finalResponse")
          this.xenditPaymentHandler(response?.data?.data,response?.status);
        }
      }
      else{
        let self = this.state;
        let selectedLanguagesList = [];
        let symptomNamesList = [];
        selectedLanguagesList.push(self.selectedLanguage);
        self.selectedSymptoms.map((symptom) => {
          symptomNamesList.push(symptom.name);
        });
        let symptomNames = symptomNamesList.join(', ');
        let patientName = self.patientDetails.firstName + ' ' + self.patientDetails.lastName;

        let paymentDetails = {
          relative: self.patientDetails._id,
          department: self.specialityId,
          symtomps: symptomNames,
          languages: selectedLanguagesList,
          amount: Math.floor(self.fixedConsultationfee) * 100,
          currency: self.currency,
          name: patientName,
          coupon: self.couponId,
        };
        console.log(paymentDetails,'paymentDetails')
        this.generatePaymentIntent(paymentDetails);
      }
    }
    else{
      Alert.alert('', 'Please select at least one language', [
        {
          text: 'Ok',
          onPress: () => console.log('first'),
        },
      ]);
    }
  }

  async generatePaymentIntent(payment) {
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.getWaitingRoomPaymentIntent(payment);
      if (response.data.status == 'success') {
        this.setState({
          isLoading: false,
          appointmentRequestId: response.data.data.appointmentRequest._id,
          appointmentClientSecret: response.data.data.client_secret,
        });
        if (response.data.data.isWaiveOff) {
          this.confirmPayment(this.state.appointmentRequestId, true);
        } else {
          this._initiatePaymentSheet(this.state.appointmentClientSecret, this.state.appointmentRequestId);
        }
      } else {
        this.setState({ isLoading: false });
        Alert.alert('Alert !', response.data.message, [
          {
            text: 'Cancel Request',
            onPress: () => this.cancelPayment(this.state.appointmentRequestId),
          },
        ]);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      alert(strings('common.waitingRoom.somethingWentWrong'));
    }
  }

  async _initiatePaymentSheet(clientSecret, requestId) {
    console.log('InitiateSheet', clientSecret);
    let initResponse = await initPaymentSheet({
      merchantDisplayName: 'myclnq',
      paymentIntentClientSecret: clientSecret,
      defaultBillingDetails: {
        address: {
          country: this.state.countryPaymentCode,
        },
      },
    });

    if (initResponse.error) {
      console.log('Intent Error', initResponse.error);
      alert('Something went wrong !');
      return;
    }

    let paymentResponse = await presentPaymentSheet();
    if (paymentResponse.error) {
      if (paymentResponse.error.code == 'Canceled') {
        this.cancelPayment(requestId);
      } else {
        console.log('TestError', paymentResponse.error.code);
        Alert.alert(paymentResponse.error.code, paymentResponse.error.message);
      }
      return;
    }
    this.confirmPayment(this.state.appointmentRequestId, false);
  }

  async confirmPayment(appointmentRequestId, isWavedOff) {
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.notifyWaitingRoomPaymentSuccess(appointmentRequestId);
      if (response.data.status == 'success') {
        this.setState({ isLoading: false });
        Actions.AppointmentRequested({
          requestId: appointmentRequestId,
          patientDetails: this.state.patientDetails,
          amount: this.state.amount,
          currency: this.state.currency,
          isWavedOff: isWavedOff,
        });
      } else {
        this.setState({ isLoading: false });
        alert(response.data.error_message);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      alert(strings('common.waitingRoom.somethingWentWrong'));
    }
  }

  async cancelPayment(requestId) {
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.cancelWaitingRoomPaymentRequest(requestId);
      if (response.data.status == 'success') {
        this.setState({ isLoading: false });
        alert(strings('common.waitingRoom.paymentCancel'));
      } else {
        this.setState({ isLoading: false });
        alert(strings('common.waitingRoom.somethingWentWrong'));
      }
    } catch (error) {
      this.setState({ isLoading: false });
      alert(strings('common.waitingRoom.somethingWentWrong'));
    }
  }

  showBottomSheet() {
    return (
      <Modal
        style={{
          width: wp(100),
          margin: 0,
        }}
        isVisible={this.state.isBottomSheetVisible}
        onBackdropPress={() => this.setState({ isBottomSheetVisible: false })}
      >
        <View
          style={{
            position: 'absolute',
            height: this.state.discountValue > 0 ? hp(25) : hp(20),
            width: wp(100),
            backgroundColor: AppColors.whiteColor,
            borderTopStartRadius: 15,
            borderTopRightRadius: 15,
            bottom: 0,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.subHeading, { fontSize: hp(2) }]}>{strings('common.waitingRoom.paymentBreakup')}</Text>
            <TouchableOpacity
              style={{
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                alignSelf: 'center',
                marginRight: hp(2),
              }}
              onPress={() => this.setState({ isBottomSheetVisible: false })}
            >
              <Image
                style={{
                  height: hp(2.5),
                  width: hp(2.5),
                }}
                source={images.closeItem}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.subHeading, { color: AppColors.greyColor, fontFamily: AppStyles.fontFamilyMedium }]}>
              {strings('common.waitingRoom.consultationFee')}
            </Text>
            <Text style={[styles.subHeading, { fontFamily: AppStyles.fontFamilyMedium }]}>
              {this.state.currency} {this.state.fixedConsultationfee}
            </Text>
          </View>
          {this.state.discountValue > 0 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.subHeading, { color: AppColors.greyColor, fontFamily: AppStyles.fontFamilyMedium }]}>
                {strings('common.waitingRoom.discount')}
              </Text>
              <Text style={[styles.subHeading, { color: AppColors.greenColor, fontFamily: AppStyles.fontFamilyMedium }]}>
                {this.state.currency} {this.state.discountValue}
              </Text>
            </View>
          ) : (
            <View></View>
          )}
          <View style={[styles.divider, { marginTop: 5 }]}></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.subHeading, { fontSize: hp(2) }]}>{strings('common.waitingRoom.amount')}</Text>
            {this.state.isWaivedOff ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.subHeading, { color: AppColors.greenColor }]}>{strings('common.waitingRoom.wavedOff')}</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.subHeading}>
                  {this.state.currency} {this.state.amount}
                </Text>
                {this.state.countryCode == '65' || '60' ? (
                  <Text style={[styles.caption, { fontSize: hp(1.2) }]}>{strings('common.waitingRoom.taxes')}</Text>
                ) : (
                  <View></View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteChange }}>
        <ScrollView>
          <View
            style={{
              flexDirection: 'column',
            }}
          >
            {this.summaryHeader()}
            {this.applyCoupon()}
            {this.consultationInfo()}
            {this.patientInformation()}
            {this.patientSymptoms()}
            {this.dataAndPrivacy()}
          </View>
        </ScrollView>
        {this.couponModal()}
        {this.bottomBar()}
        {this.showBottomSheet()}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subHeading: {
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyDemi,
    fontSize: hp(2.0),
    marginHorizontal: hp(2),
    marginTop: hp(2),
    marginBottom: hp(0.8),
  },
  caption: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.6),
    marginHorizontal: hp(2),
    marginBottom: hp(2.5),
    color: AppColors.greyColor,
  },
  privacyStyle: {
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.6),
    marginLeft: hp(2),
    marginBottom: hp(1),
  },
  divider: {
    height: hp(0.1),
    flexDirection: 'row',
    marginHorizontal: hp(2),
    backgroundColor: AppColors.greyBorder,
  },
  bottomBarStyle: {
    width: wp(100),
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    backgroundColor: AppColors.whiteColor,
    paddingBottom: AppUtils.isX ? hp(1) : 0,
    elevation: 0,
    height: AppUtils.isX ? hp(12) : hp(10),
    flexDirection: 'row',
  },
});
