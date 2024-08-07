import {
    BackHandler,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import React from 'react';
import {Actions} from 'react-native-router-flux';
import CheckBox from 'react-native-check-box'
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {AppColors} from "../../shared/AppColors";
import ElevatedView from "react-native-elevated-view";
import {AppUtils} from "../../utils/AppUtils";
import {AppStyles} from "../../shared/AppStyles";
import {SHApiConnector} from "../../network/SHApiConnector";
import moment from "moment";
import ProgressLoader from 'rn-progress-loader';
import Toast from 'react-native-simple-toast';
import styles from "../../styles/WagonBookingDetailsStyles";
import { strings } from '../../locales/i18n';


class WagonBookingDetails extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Medical Transport Booking Details');
        this.state = {
            additionalItems: this.props.bookingDetails.additionalItem,
            fare: this.props.bookingDetails.transportFare.maxPrice,
            currencySymbol: this.props.bookingDetails.transportFare.currency,
            specialNote: ''
        }
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                Actions.MyCareWagonHome();
                return true;
            });
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', () => {
                Actions.MyCareWagonHome();
                return true;
            });
        }
    }

    async bookWagon() {
        let bookData = {
            vehicleType: this.props.bookingDetails.vehicleType,
            tripType: this.props.bookingDetails.tripType,
            pickupLocation: this.props.bookingDetails.pickupLocation,
            dropLocation: this.props.bookingDetails.dropLocation,
            fare: this.state.fare,
            city: this.props.bookingDetails.city,
            paymentMethod: this.props.bookingDetails.paymentMethod,
            unitNumber: this.props.bookingDetails.unitNumber,
            specialNotes: this.state.specialNote,
            additionalItem: this.state.additionalItems,
            bookingType: this.props.bookingDetails.bookingType,
            country: this.props.bookingDetails.country,
            bookingTime: moment(this.props.bookingDetails.bookingTime),
            returnTime: this.props.bookingDetails.returnTime,
            distance: this.props.bookingDetails.distance
        };
        AppUtils.console("sdfvdxfger_123", bookData);
        this.setState({isLoading: true, isRefreshing: false})
        try {
            const response = await SHApiConnector.bookVehicle(bookData);
            this.setState({isLoading: false});
            AppUtils.console('zxcvdfsdfgcgv', response.data.data, bookData);
            if (response.data.status) {
                Actions.SearchingVehicle({bookingData: response.data.data});
            } else {
                this.showAlert(response.data.error_message);
            }
        } catch (e) {
            this.setState({isLoading: false});
            this.showAlert(e.response.data.error_message);

        }
    }

    showAlert(msg, ispop) {
        setTimeout(() => {
            AppUtils.showMessage(this, "", msg, strings('doctor.button.ok'), function () {

            });
        }, 500)
    }

    handleNoteChange = (note) => {
        this.setState({specialNote: note});
    };

    render() {
        AppUtils.console("items......", this.props, this.state);
        let bookingData = this.props.bookingDetails;
        return (
            <View style={styles.content}>
                <View style={{height: hp('100%'), width: wp(80)}}>
                    <KeyboardAvoidingView
                        keyboardVerticalOffset={(Platform.OS === 'ios') ? (AppStyles.isX) ? 120 : 0 : 0}
                        behavior={(Platform.OS === 'ios') ? 'position' : 'position'}
                        style={{marginTop: hp(8)}}>
                        <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom: hp(2)}}>
                            <View>
                                <View style={{alignItems: 'center'}}>
                                    <Image resizeMode={'contain'} style={styles.wagon}
                                           source={require('../../../assets/images/circuler_ambulance.png')}/>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text allowFontScaling={false} style={styles.pickUpFields}>{strings('common.transport.date')}</Text>
                                <Text allowFontScaling={false} style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}
                                      style={styles.driver}>{moment(bookingData.bookingTime).format('MMM Do, YYYY hh:mm A')}</Text>
                            </View>
                            {(bookingData.tripType == 'SINGLE') ? <View/> :
                                <View style={styles.bookingDesign}>
                                    <Text allowFontScaling={false}
                                          style={styles.pickUpFields}>{strings('common.transport.returnTime')}</Text>
                                    <Text allowFontScaling={false}
                                          style={styles.hashSymbol}>:</Text>
                                    <Text allowFontScaling={false}
                                          style={styles.driver}>{(bookingData.returnTime == "NOT_SURE") ? strings('common.transport.notSure') : moment(bookingData.returnTime).format('MMM Do, YYYY hh:mm A')}</Text>
                                </View>
                            }
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.pickUp')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}
                                      style={[styles.driver, {lineHeight: 18}]}>{bookingData.pickupLocation}</Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.drop')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}
                                      style={[styles.driver, {lineHeight: 18}]}>{bookingData.dropLocation} </Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.unitNo')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}
                                      style={styles.driver}>{(bookingData.unitNumber != '') ? bookingData.unitNumber : 'N/A'}</Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.note')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <View elevation={2} style={styles.specialNote}>
                                    <TextInput allowFontScaling={false}
                                        style={{paddingTop: 0, paddingBottom: 0, textAlignVertical: 'top'}}
                                        underlineColorAndroid="transparent"
                                        value={this.state.specialNotes}
                                        placeholder={strings('common.transport.addNote')}
                                        placeholderTextColor="#808080"
                                        onChangeText={this.handleNoteChange}
                                        numberOfLines={10}
                                        multiline={true}
                                    />
                                </View>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.vehicle')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}

                                      style={styles.driver}>{(bookingData.vehicleType == 'AMBULANCE') ? 'Non-Emergency Ambulance' : 'Wheelchair Transport'} </Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.trip')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}

                                      style={styles.driver}>{(bookingData.tripType == 'SINGLE') ? strings('common.transport.oneWay') : strings('common.transport.twoWay')}</Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.fare')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}
                                      style={[styles.driver, {fontFamily: AppStyles.fontFamilyBold}]}>{this.state.currencySymbol + '' + this.state.fare} {strings('common.transport.estimate')}
                                </Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.paymentBy')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <Text allowFontScaling={false}
                                      style={[styles.driver]}>{(bookingData.paymentMethod == 'CASH') ? strings('common.transport.cash') : strings('common.transport.card')}</Text>
                            </View>
                            <View style={styles.bookingDesign}>
                                <Text allowFontScaling={false}
                                      style={styles.pickUpFields}>{strings('common.transport.additionalItems')}</Text>
                                <Text allowFontScaling={false}
                                      style={styles.hashSymbol}>:</Text>
                                <FlatList
                                    style={{width: wp(100)}}
                                    data={this.state.additionalItems}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={(item) => this._render_additionalItems(item)}
                                    extraData={this.state}
                                />
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                    <ElevatedView style={[styles.expandScreenHeader, {position: 'absolute', top: 0}]} elevation={5}>
                        <TouchableOpacity style={{marginTop: (AppUtils.isX) ? 15 : 0}}
                                          onPress={() => Actions.MyCareWagonHome()}>
                            <Image style={styles.backIcon} source={require('../../../assets/images/blackarrow.png')}/>
                        </TouchableOpacity>
                        <View style={[styles.bookingDetail, {marginTop: (AppUtils.isX) ? 20 : 0}]}>
                            <Text allowFontScaling={false}
                                  style={styles.pickupDetails}>{strings('common.transport.bookingDetails')}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => this.bookWagon()}
                            style={{
                                justifyContent: 'center', alignSelf: 'center', marginLeft: wp(8),
                                height: hp(4), width: wp(25),
                                marginTop: (AppUtils.isX) ? 18 : 0,
                                borderRadius: wp(5), borderColor: AppColors.primaryColor, borderWidth: 1
                            }}>
                            <Text allowFontScaling={false}
                                  style={[styles.pickupDetails,
                                      {
                                          color: AppColors.primaryColor,
                                          fontFamily: AppStyles.fontFamilyBold,
                                          fontSize: 13,
                                          marginTop: (Platform.OS === 'ios') ? 5 : 0
                                      }]}>{strings('string.btnTxt.confirm')}</Text>
                        </TouchableOpacity>
                    </ElevatedView>
                </View>
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor}/>
            </View>
        );
    }

    setCheckedData(isChecked, item) { 
                if (this.props.bookingDetails.vehicleType === 'OTHER_VEHICLE') {
            Toast.show(strings('common.transport.optionApplicableForMT'));
        } else {
            let additionalData = this.state.additionalItems;
            additionalData[item.index].itemUsed = !item.item.itemUsed
            let fare = parseInt(this.state.fare);
            if (item.item.itemName == "Lift Landing" && !additionalData[item.index].itemUsed == additionalData[item.index].itemUsedStatus) {
                fare = fare - parseInt(item.item.price);
            } else if(item.item.itemName == "Lift Landing"){
                fare = fare + parseInt(item.item.price);
            } else {
                if (additionalData[item.index].itemUsed == additionalData[item.index].itemUsedStatus) {
                    fare = fare - parseInt(item.item.price);
                } else {
                    fare = fare + parseInt(item.item.price);
                }
            }
           
            this.setState({
                additionalItems: additionalData,
                fare: fare
            })
        }
    }

    _render_additionalItems(items) {
        return (
            <View>
                <CheckBox
                    style={{paddingBottom: 10, paddingTop: 0,}}
                    onClick={(isChecked) => {
                        this.setCheckedData(isChecked, items)
                    }}
                    disabled={false}
                    checkBoxColor={AppColors.primaryColor}
                    isChecked={items.item.itemUsed}
                    leftText={items.item.itemName}
                    leftTextStyle={{color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyMedium}}
                />
            </View>
        )
    }
}

export default WagonBookingDetails;


