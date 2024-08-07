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
    DatePickerAndroid, Dimensions, KeyboardAvoidingView,
    Platform, PermissionsAndroid, TouchableHighlight, Modal
} from 'react-native'
import { AppColors } from "../../shared/AppColors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";
import moment from "moment";
import DateTimePicker from '@react-native-community/datetimepicker';
const { width, height } = Dimensions.get('window');
import {
    CachedImage,
    ImageCacheProvider
} from '../../cachedImage';


import { AppUtils } from "../../utils/AppUtils";
import images from "../../utils/images";
import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import EditVitalStyle from "./EditVitalStyles";
import { moderateScale } from "../../utils/Scaling";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FamilyProfile from "../commonFiles/FamilyProfile"
import BottomUp from 'react-native-modal';
import AddRecordsStyles from "./AddRecordsStyles";
import { strings } from '../../locales/i18n';


var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
class EditVital extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("VitalDetail", props);
        this.state = {
            recordList: props.record.recordList,
            selectedRelative:!props.relativeProfile?[]:props.relativeProfile,
            recordType: props.recordType,
            dateToday: _dt, relativeProfile: [],
            sDate: props.sDate ? props.sDate : moment(_dt).format('YYYY-MM-DD'),
            maxDate: _dt, minRange: '', maxRange: '',
            rangeModal: false, deleteRecord: false
        }
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.onBackPress()
            return true;
        });
    }
    componentWillReceiveProps(props) {
        AppUtils.console("MyAppPropsEdit", props)
        if (props.update) {
            if (!props.sDate) {
                this.getRelativeRecord(this.state.relativeProfile._id)
            } else {
                this.setState({ sDate: props.sDate }, () => {
                    this.getRelativeRecord(this.state.relativeProfile._id)
                });
            }
        }
    }



    goBack() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true, sDate: this.state.sDate })
        }, 500);
    }

    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true })
        }, 500);
    }



    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, { flexDirection: 'row', paddingBottom: hp(3), paddingTop: hp(4), borderBottomWidth: hp(.1), borderColor: AppColors.greyBorder }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{strings('doctor.button.cancel')}</Text>

                </TouchableOpacity>
                <View style={{ width: cellWidth * 3, height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.vital.parameterName}</Text>
                </View>
                <TouchableOpacity onPress={() => { this.updateVitalRecord() }} underlayColor="transparent" style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center', paddingRight: wp(2)
                }}>
                    <Text numberOfLines={1}
                        style={[styles.headerTextIOS, { color: AppColors.colorHeadings }]}>{strings('common.common.done')}</Text>

                </TouchableOpacity>



            </View>

        )
    }

    renderAndroid() {

        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, { flexDirection: 'row', paddingBottom: hp(3), paddingTop: hp(2), borderBottomWidth: hp(.1), borderColor: AppColors.greyBorder }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{strings('doctor.button.cancel')}</Text>

                </TouchableOpacity>
                <View style={{ width: cellWidth * 3, height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.vital.parameterName}</Text>
                </View>
                <TouchableOpacity onPress={() => { this.updateVitalRecord() }} underlayColor="transparent" style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center', paddingRight: wp(2)
                }}>
                    <Text numberOfLines={1}
                        style={[styles.headerTextIOS, { color: AppColors.colorHeadings }]}>{strings('common.common.done')}</Text>

                </TouchableOpacity>


            </View>

        )
    }

    selectedProfile(profile) {
        AppUtils.console("ProfileData", profile);
        this.setState({ relativeProfile: profile })
        this.getRelativeRecord(profile._id)


    }

    renderRangeModal() {
        return (
            <BottomUp
                onBackdropPress={() => { this.setState({ rangeModal: false }) }}
                onBackButtonPress={() => this.setState({
                    rangeModal: !this.state.rangeModal
                })}
                isVisible={this.state.rangeModal} style={{
                    justifyContent: 'flex-end',
                    margin: 0,
                }}
                key={this.state.rangeModal ? 5 : 6}
            >
                <KeyboardAvoidingView behavior={AppUtils.isIphone ? "padding" : null}>

                    <View style={{
                        backgroundColor: AppColors.whiteColor,
                        paddingTop: wp('5'),
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderTopRightRadius: wp(8),
                        borderTopLeftRadius: wp(8),
                        borderColor: 'rgba(0, 0, 0, 0.1)'
                    }}>
                        <View style={{ width: wp(90), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', backgroundColor: AppColors.whiteColor, marginBottom: hp(2) }}>
                            <TouchableOpacity onPress={() => { this.setState({ rangeModal: false }) }} style={{ width: wp(15) }}>
                                <Text allowFontScaling={false} style={[{
                                    fontSize: 16, color: AppColors.blackColor
                                }]} >{strings('doctor.button.cancel')}</Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={false} style={[{
                                width: wp(65), textAlign: 'center',
                                fontSize: 16, color: AppColors.blackColor
                            }]}>{strings('vital.vital.setRange')}</Text>
                            <TouchableOpacity onPress={() => { this.addRange() }} style={[{ width: wp(10), }]} >
                                <Text allowFontScaling={false} style={[{
                                    textAlign: 'right', color: AppColors.colorHeadings,
                                    fontSize: 16
                                }]} >{strings('doctor.button.camelAdd')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={EditVitalStyle.dividerVital} />
                        <View style={{ backgroundColor: AppColors.backgroundGray, width: wp(100) }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: hp(3), marginBottom: hp(15), backgroundColor: AppColors.whiteColor }}>


                                <TextInput allowFontScaling={false}
                                    placeholder={strings('vital.vital.minRange')}
                                    keyboardType="decimal-pad"

                                    value={`${this.state.minRange}`}
                                    placeholderTextColor={AppColors.textGray}
                                    onChangeText={(value) => this.setState({ minRange: isNaN(`${value}`) ? '' : `${value}` })}
                                    style={EditVitalStyle.modalListMinMaxTxt}
                                />

                                <TextInput allowFontScaling={false}
                                    placeholder={strings('vital.vital.maxRange')}
                                    value={`${this.state.maxRange}`}
                                    keyboardType="decimal-pad"

                                    placeholderTextColor={AppColors.textGray}
                                    onChangeText={(value) => this.setState({ maxRange: isNaN(`${value}`) ? '' : `${value}` })}

                                    style={EditVitalStyle.modalListMinMaxTxt}
                                />


                            </View>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </BottomUp>)
    };
    addRange() {
        if (!this.state.maxRange) {
            Alert.alert("", strings('vital.vital.enterMaxRange'));

        } else if (!this.state.minRange) {
            Alert.alert("", strings('vital.vital.enterMinRange'));

        } else if (!(parseInt(this.state.minRange) <= parseInt(this.state.maxRange))) {
            Alert.alert("", strings('vital.vital.checkMinMaxRange'));

        }
        else {
            this.setState({ rangeModal: false });
            this.updateVitalRange()
        }
    }
    openCalender() {
        var self = this;

        var selectedDate = moment(self.state.dateToday)._d;
        var maxDate = _dt;


        if (Platform.OS === 'ios') {
            self.setState({ showDateSelector: true, date: selectedDate, mode: 'default', maxDate: maxDate });
        } else {
            self.showPicker('dateToday', { date: selectedDate, mode: 'default', maxDate: maxDate })
        }

    }

    openDateSelector() {
        let self = this;
        AppUtils.console('sgdfhsedfg345', this.state.date)
        return (
            <Modal
                transparent={true}
                ref={element => this.model = element}
                supportedOrientations={this.props.supportedOrientations}
                visible={this.state.showDateSelector}
                onRequestClose={this.close}
                animationType='fade'

                key={this.state.showDateSelector ? 1 : 2}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(52, 52, 52, 0.8)',
                    height: height, width: width,
                    alignSelf: 'center',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <View style={{ height: hp(30), alignSelf: 'center', backgroundColor: AppColors.whiteColor, justifyContent: 'center', width: width - 30, }}>
                        <View style={{
                            height: 40, width: width - 30,
                            backgroundColor: AppColors.whiteColor,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end'
                        }}>
                            <TouchableOpacity onPress={() => this.setState({ showDateSelector: false })}>
                                <Image resizeMode={'contain'} style={{
                                    height: 30, width: 30, marginRight: 10,
                                }}
                                    source={require('../../../assets/images/cancel.png')} />

                            </TouchableOpacity>
                        </View>
                        <View style={{backgroundColor: AppColors.whiteColor}}>
                        <DateTimePicker
                            mode="date"
                            maximumDate={this.state.maxDate}
                            value={new Date(this.state.sDate)}
                            display="spinner"
                            style={{ backgroundColor: AppColors.whiteColor }}
                            onChange={(event, selectDate) => {
                                AppUtils.console('eventIs', selectDate)
                                this.setDate(selectDate)
                            }} />
                        </View>
                        <TouchableHighlight onPress={() => {
                            self.setState({ showDateSelector: false })
                        }
                        } underlayColor='transparent'>
                            <View style={{
                                backgroundColor: AppColors.colorHeadings,
                                height: 50,
                                width: width - 30,
                                alignSelf: 'center',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text allowFontScaling={false} style={{
                                    fontFamily: AppStyles.fontFamilyBold,
                                    fontSize: 18,
                                    color: AppColors.whiteColor,
                                    alignSelf: 'center'
                                }}>{moment(this.state.sDate).format("DD MMM Y")}</Text>
                            </View>
                        </TouchableHighlight>


                    </View>
                </View>

            </Modal>
        );
    }


    showPicker = async (stateKey, options) => {
        try {
            var newState = {};
            const { action, year, month, day } = await DatePickerAndroid.open(options);
            if (action === DatePickerAndroid.dismissedAction) {
            } else {
                var date = new Date(year, month, day);
                newState[stateKey] = date;
            }
            this.setState(newState);
            this.setDate(date)
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }

    setDate(date) {
        try {
            this.setState({
                sDate: moment(date).format('YYYY-MM-DD'),
            }, () => {
                this.getRelativeRecord(this.state.relativeProfile._id)
            });

        } catch (e) {
            AppUtils.console("DiffError", e);

        }

    }
    async updateVitalRange() {
        this.setState({
            isLoading: true,
        })
        let body = {
            vitalRangeList: [{

                minRange: `${this.state.minRange}`,
                maxRange: `${this.state.maxRange}`,
                userVitalParameterRangeId: !this.props.vital.isOtherVital ? this.props.vital.vitalRange._id : this.props.vital._id,



            }]
        }

        try {

            let response = await SHApiConnector.updateVitalRange(body);

            AppUtils.console("vitalmultipleResponse", response);
            if (response.data.status) {
                this.setState({
                    isLoading: false,
                });

                setTimeout(() => {
                    Alert.alert('', strings('vital.vital.vitalUpdatedSuccess'), [
                        { cancelable: false, text: strings('doctor.button.ok'), onPress: () => this.getRelativeRecord(this.state.relativeProfile._id) },
                    ])
                }, 300);





            } else {
                this.setState({
                    isLoading: false,
                })
            }
        } catch (e) {
            this.setState({
                isLoading: false,
            })

            AppUtils.console("Vital", e);


        }
    }
    async updateVitalRecord() {
        if(this.state.recordList.length > 0){

        let data = [];
        let isMulti = this.props.vital.isMultiParam;
        let status = true
        this.state.recordList.map((list) => {
            AppUtils.console("VitalEdit", list);
            // status = !list.averageRecordQuantity?true:false
            if (isMulti) {
                if (!list.averageRecordQuantity || !list.secondAverageRecord) {
                    status = false
                }

            } else {
                if (!list.averageRecordQuantity) {
                    status = false
                }

            }

            data.push(
                {
                    recordQuantity: `${list.averageRecordQuantity}`,
                    secondRecordQuantity: isMulti ? list.secondAverageRecord : null,
                    usersVitalRecordId: list._id,
                }


            )
        })
        if (!status) {
            Alert.alert("",  strings('vital.vital.vitalDataMissing'))
        }
        else {
            this.setState({
                isLoading: true,
            });

            let body = { vitalRecordList: data }
            AppUtils.console("VitalEdit", body)

            try {

                let response = await SHApiConnector.updateVitalRecord(body);

                AppUtils.console("vitalmultipleResponse", response);
                if (response.data.status) {
                    this.setState({
                        isLoading: false,
                    });


                    setTimeout(() => {
                        Alert.alert('', strings('vital.vital.recordUpdateSuccess'), [
                            { cancelable: false, text: strings('common.common.done'), onPress: () => this.goBack() },
                            { text: 'Edit', onPress: () => this.getRelativeRecord(this.state.relativeProfile._id) },
                        ])
                    }, 300);


                } else {
                    this.setState({
                        isLoading: false,
                    })
                }
            } catch (e) {
                this.setState({
                    isLoading: false,
                })

                AppUtils.console("Vital", e);


            }

        }
        }
    }

    deleteRecordModal = () => {
        return (
            <Modal
                visible={this.state.deleteRecord}
                transparent={true}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: AppColors.transparent,
                }}
                animationType={'fade'}
                key={this.state.deleteRecord ? 3 : 4}

            >
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: AppColors.transparent,
                    flex: 1,

                }}>

                    <View style={{
                        backgroundColor: AppColors.whiteColor,
                        height: hp('38%'),
                        width: wp('90%'),
                        borderRadius: wp(4),
                        marginRight: hp('5%'),
                        marginLeft: hp('5%'),
                        marginTop: hp('3%'),
                        justifyContent: 'center', alignItems: 'center'
                    }}>

                        <Image resizeMode="contain" style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: hp(10), width: wp(10), paddingBottom: hp(5)
                        }}
                            source={require('../../../assets/images/delete_red.png')} />

                        <View style={{
                            justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
                            marginLeft: hp(2), marginRight: hp(2), flexDirection: 'column', height: hp(12)
                        }}>
                            <Text style={{ alignSelf: 'center', textAlign: 'center', fontFamily: AppStrings.fontFamilyMedium, color: AppColors.greyColor, fontSize: 18 }}>{strings('vital.vital.sureWantToDelete')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginLeft: hp('3%'), }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: AppColors.whiteColor,
                                    borderColor: AppColors.colorHeadings,
                                    flexDirection: 'row',
                                    height: hp('5'),
                                    width: wp('28%'),
                                    //marginBottom:hp(10),
                                    borderRadius: hp('1'),
                                    borderWidth: 1,
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',

                                    marginTop: hp('3')
                                }}
                                underlayColor='transparent'
                                onPress={() => this.setState({
                                    deleteRecord: !this.state.deleteRecord
                                })}>

                                <Text style={{
                                    fontSize: 13,
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    color: AppColors.colorHeadings,
                                    alignSelf: 'center',
                                }}>{strings('doctor.button.cancel')}</Text>

                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: AppColors.colorHeadings,
                                    flexDirection: 'row',
                                    height: hp('5'),
                                    width: wp('28%'),
                                    margin: wp('5%'),
                                    //marginBottom:hp(10),
                                    borderRadius: hp('1'),
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',

                                    marginTop: hp('3')
                                }}
                                underlayColor='transparent'
                                onPress={() => this.recordDelete(this.state.recordId)}>

                                <Text style={{
                                    fontSize: 13,
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    color: AppColors.whiteColor,
                                    alignSelf: 'center',
                                }}>{strings('vital.vital.delete')}</Text>

                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </Modal>


        );

    }
    confirmDelete(id) {
        this.setState({ deleteRecord: true, recordId: id })
    }

    async recordDelete(id) {



        this.setState({
            isLoading: true,
        });

        try {

            let response = await SHApiConnector.recordDelete(id);

            AppUtils.console("vitalmultipleResponse", response);
            if (response.data.status) {
                this.setState({
                    isLoading: false, deleteRecord: false
                });
                setTimeout(() => {
                    Alert.alert('', strings('vital.vital.recordDeletedSuccess'), [
                        { cancelable: false, text: strings('doctor.button.ok'), onPress: () => this.getRelativeRecord(this.state.relativeProfile._id) },
                    ])
                }, 300);
            } else {
                this.setState({
                    isLoading: false, deleteRecord: false
                })
            }
        } catch (e) {
            this.setState({
                isLoading: false, deleteRecord: false
            })

            AppUtils.console("Vital", e);


        }
    }



    async getRelativeRecord(id) {
        try {
            let recordType = this.state.recordType;
            this.setState({
                isLoading: true,
            })
            // RECORDS_VIEW_FOR: "ONE_DAY / LAST_SEVEN_DAYS / LAST_THIRTY_DAYS"

            let data = {
                relativeId: id,
                recordDate: this.state.sDate,
                userVitalParameterRangeId: !this.props.vital.isOtherVital ? this.props.vital.vitalRange._id : this.props.vital._id,
                RECORDS_VIEW_FOR: recordType
            }
            AppUtils.console("vitalResponseData", data);

            let response = await SHApiConnector.getRelativeRecord(data);

            let record = response.data.response;
            AppUtils.console("vitalResponse", record);

            if (response.data.status) {
                this.setState({
                    average: !record.recordAverage ? '0' : record.recordAverage.averageRecord,
                    maxRange: !record.recordAverage ? '0' : record.recordAverage.maxRange,
                    minRange: !record.recordAverage ? '0' : record.recordAverage.minRange,
                    isLoading: false,
                    recordList: record.recordList
                })


            } else {
                this.setState({
                    isLoading: false,
                })
            }
        } catch (e) {
            this.setState({
                isLoading: false,
            })

            AppUtils.console("Vital", e);


        }
    }


    recordListView(item) {
        let self = this;
        AppUtils.console("VitalDetailitem", item.item);
        AppUtils.console("VitalDetailitem", this.props.vital);

        let average = AppUtils.getEditAverage(item.item);
        let isMulti = this.props.vital.isMultiParam;
        AppUtils.console("RecordCategoryAveraget", average);
        let recordQuantity = "" + item.item.averageRecordQuantity;
        let secondAverageRecord = (!item.item.secondAverageRecord ? '' : "" + item.item.secondAverageRecord)
        AppUtils.console("RecordCategorySecond", secondAverageRecord);

        return (
            // hasRange?
            <View style={AddRecordsStyles.modalListContentView}>
                <View style={AddRecordsStyles.modalListContentInnerView}>
                    <View style={AddRecordsStyles.modalListContentViewTail}>
                        <Text
                            allowFontScaling={false}

                            style={AddRecordsStyles.modalListContentViewSubTxt}
                        >
                            {"" + this.props.vital.parameterUnit}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'row', width: wp(85) }}>
                                {!isMulti ?
                                    <TextInput allowFontScaling={false}
                                        placeholder={this.props.vital.parameterUnit}
                                        value={recordQuantity}
                                        keyboardType="decimal-pad"
                                        autoFocus={item.index == 0 ? true : false}
                                        placeholderTextColor={AppColors.textGray}
                                        onChangeText={(input) => { self.setQuantity(input, item.item) }}
                                        style={AddRecordsStyles.modalListContentViewTxt}
                                    /> :
                                    <View style={{ flexDirection: 'row', width: wp(65) }}>

                                        <TextInput allowFontScaling={false}
                                            placeholder={this.props.vital.firstSubParameterName}
                                            value={recordQuantity}
                                            keyboardType="decimal-pad"
                                            autoFocus={item.index == 0 ? true : false}
                                            placeholderTextColor={AppColors.textGray}
                                            onChangeText={(input) => { self.setQuantity(input, item.item) }}
                                            style={[AddRecordsStyles.modalListContentViewTxt, { width: wp(25) }]}
                                        />
                                        <Text
                                            allowFontScling={false}

                                            style={[{ width: wp(10), paddingTop: hp(1.2), paddingLeft: wp(1.2), justifyContent: 'center' }]}                                            >
                                            {'/'}


                                        </Text>
                                        <TextInput allowFontScaling={false}
                                            placeholder={this.props.vital.secondSubParameterName}
                                            value={secondAverageRecord}
                                            keyboardType="decimal-pad"
                                            placeholderTextColor={AppColors.textGray}
                                            onChangeText={(input) => { self.setSecondSub(input, item.item) }}
                                            style={[AddRecordsStyles.modalListContentViewTxt, { width: wp(19) }]}
                                        />
                                    </View>
                                }

                                <Text
                                    allowFontScling={false}

                                    style={[AddRecordsStyles.modalListContentViewTxt]}
                                >
                                    {this.props.vital.parameterName === 'BP'?item.item.maxRange + '/' + item.item.minRange :item.item.minRange + '/' + item.item.maxRange}

                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => { this.confirmDelete(item.item._id) }}>
                                <Image resizeMode="contain" style={{
                                    height: hp(3), width: wp(3), marginTop: hp(.5)

                                }}
                                    source={require('../../../assets/images/delete.png')} />
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>
            </View>
            // // :null
            // null
        )
    }
    setQuantity(value, item) {
        let updatedList = [];
        let self = this;
        AppUtils.console("ListVital", item._id);
        value = isNaN(`${value}`) ? '' : `${value}`
        self.state.recordList.map((list) => {
            let id = list._id
            // // AppUtils.console("Rangelistmin",minRange);
            // AppUtils.console("ListVitalId",id);
            if (id === item._id) {
                list.averageRecordQuantity = value
            }
        });
        updatedList = self.state.recordList;
        AppUtils.console("ListVitalUpdate", updatedList);
        self.setState({ recordList: updatedList })



    }


    setSecondSub(value, item) {
        let updatedList = [];
        let self = this;
        AppUtils.console("ListVital", item._id);
        value = isNaN(`${value}`) ? '' : `${value}`
        self.state.recordList.map((list) => {
            let id = list._id
            // // AppUtils.console("Rangelistmin",minRange);
            // AppUtils.console("ListVitalId",id);
            if (id === item._id) {
                list.secondAverageRecord = value
            }
        });
        updatedList = self.state.recordList;
        AppUtils.console("ListVitalUpdate", updatedList);
        self.setState({ recordList: updatedList })



    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
                {((AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid())}

                <KeyboardAwareScrollView style={{ flex: 1 }}>

                    <FamilyProfile
                        selectedProfile={(profile) => this.selectedProfile(profile)}
                        selectedRelative={this.state.selectedRelative}
                        />
                    <View style={{ flexDirection: 'row', width: wp(100), backgroundColor: AppColors.whiteColor, paddingBottom: hp(2) }}>
                    <TouchableOpacity style={{ flexDirection: 'row',marginLeft:wp(5) }}
                                onPress={() => { Actions.AddRecords({ sDate: this.state.sDate }) }} >
                                    <CachedImage
                                        resizeMode={'contain'}
                                        style={{
                                            width: hp(3), height: hp(3),
                                        }}
                                        source={images.add_new}
                                    />
                                    <Text allowFontScaling={false} style={{
                                        fontFamily: AppStyles.fontFamilyMedium, paddingTop: AppUtils.isIphone ? hp(.8) : hp(.4),
                                        fontSize: hp(1.9), width: wp(40), marginLeft: wp(3),
                                        color: AppColors.colorHeadings,
                                    }}>{strings('vital.vital.addRecords')}
                                           </Text>

                                </TouchableOpacity>

                                       <TouchableOpacity onPress={() => this.openCalender()} allowFontScaling={false} style={{
                            justifyContent: 'flex-end', flexDirection: 'row',
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: hp(1.9), width: wp(40), marginLeft: hp(1),
                            color: AppColors.colorHeadings, textAlign: 'right'
                        }}>

                            <Text
                                allowFontScaling={false}
                                style={{
                                    fontSize: moderateScale(15),
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    color: AppColors.blackColor, marginRight: wp(1), paddingTop: AppUtils.isIphone ? hp(.7) : hp(.3)
                                }} >{moment(this.state.sDate).format("DD MMM Y")}</Text>
                            <Image
                                source={images.activeCalender}
                                resizeMode='contain'
                                style={{ height: wp(5), width: wp(5), alignSelf: 'center' }}
                            />

                        </TouchableOpacity>
                    </View>
                    <View style={{ justifyContent: 'center', marginLeft: wp(5), }}>



                        <View style={{ justifyContent: 'center' }}>

                            {this.state.recordList.length > 0 ?
                                <FlatList
                                    data={this.state.recordList}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={(item, index) => this.recordListView(item, index)}
                                    extraData={this.state}
                                /> :
                                this.state.isLoading ? null :
                                    <View style={{ height: hp(50), width: wp(80), justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{
                                            fontSize: hp(2.5),
                                            fontFamily: AppStyles.fontFamilyMedium
                                        }}>{strings('vital.vital.pleaseAddRecords')}</Text>
                                    </View>
                            }


                        </View>
                        <TouchableOpacity onPress={() => {
                            this.setState({ rangeModal: true })
                        }}>

                            <View style={{
                                backgroundColor: AppColors.colorHeadings,
                                marginTop: hp(4), alignSelf: 'flex-start',
                                borderRadius: wp(2), marginLeft: wp(1),
                                width: wp(25), height: hp(5), justifyContent: 'center'
                            }}>

                                <Text style={{ alignSelf: 'center', color: AppColors.whiteColor, fontFamily: AppStyles.fontFamilyDemi }}>{strings('vital.vital.setRange')}</Text>


                            </View>
                        </TouchableOpacity>

                    </View>



                </KeyboardAwareScrollView>

                {this.renderRangeModal()}
                {(this.state.showDateSelector) ? this.openDateSelector() : null}
                {this.deleteRecordModal()}
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


}


const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90), borderColor: AppColors.backgroundGray
    },

    textTitleStyle: {
        flex: 1,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(5),
    },

    textDataStyle: {
        flex: 1,
        fontSize: 14,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginLeft: wp(25),
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular
    },
    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerTextIOS: {
        color: AppColors.blackColor, textAlign: 'center',
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (hp(2))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default EditVital;


