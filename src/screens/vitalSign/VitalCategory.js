import React, { Component } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput, Dimensions,
    Alert,
    BackHandler, DatePickerAndroid,
    Platform, PermissionsAndroid, TouchableHighlight, Modal
} from 'react-native'
import { AppColors } from "../../shared/AppColors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";
import moment from "moment";

const { width, height } = Dimensions.get('window');

import { AppUtils } from "../../utils/AppUtils";
import images from "../../utils/images";
import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import AddRecordsStyles from "./AddRecordsStyles";
import { moderateScale } from "../../utils/Scaling";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FamilyProfile from "./../commonFiles/FamilyProfile"
import VitalCard from './card';
import Dash from 'react-native-dash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IconSimpleLine from 'react-native-vector-icons/SimpleLineIcons'
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import BottomUp from 'react-native-modal';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from "react-native-chart-kit";
import { strings } from '../../locales/i18n';


var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
var maxDatee = new Date(2022, 11, 24, 10, 33, 30, 0);

export default class VitalCategory extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("Pros_categroy", props)

        this.state = {
            isLoading: false, averageCheck: 0,
            selectedRelative: !props.relativeProfile ? [] : props.relativeProfile,
            sDate: moment(_dt).format('YYYY-MM-DD'),
            couponCode: '', average: '--', maximum: '--', minimum: '--', recordType: 'LAST_SEVEN_DAYS',
            reportTime: [
                {
                    option: 'Select Date',
                    isSelected: false,
                    value: 'ONE_DAY'
                },
                {
                    option: '7 Days',
                    isSelected: true,
                    value: 'LAST_SEVEN_DAYS'

                }, {
                    option: '30 Days',
                    isSelected: false,
                    value: 'LAST_THIRTY_DAYS'
                },
            ],
            dateToday: _dt,
            maxDate: _dt,
            minDate: new Date(),
            showDate: false,
            editMenu: false,
            deleteRecord: false,
            vitalReport: false,
            recordList: [
                { name: 'Oxygen Rate/SPO2', minmax: '100/120', currentReading: '12' },
                { name: 'TEMP°', minmax: '110/130', currentReading: '100°' },
                { name: 'Heart Rate', minmax: '100/120', currentReading: '80' },
                { name: 'Blood Sugar (mol/l)', minmax: '100/120', currentReading: '90mol' },
                { name: 'Input Fluid (ml)', minmax: '100/120', currentReading: '200ml' }],
            vitalRecordDateList: [],
            vitalRecordDataList: [],
            legend: [],
            vitalViewMax: 'Maximum',
            vitalViewMin: 'Minimum'

        }
    }

    async componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.onBackPress()
            return true;
        });

    }

    componentWillReceiveProps(props) {
        AppUtils.console("MyAppProps", props)
        if (props.update) {
            if (!props.sDate) {
                this.getRelativeRecord(this.state.relativeProfile._id)
            } else {
                this.setState({ sDate: props.sDate }, () => {
                    this.setSelectedPlan('Select Date')
                });
            }
        }

    }

    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true })
        }, 500);
    }

    updateVitalReport = () => {
        this.setState({
            vitalReport: !this.state.vitalReport
        })
    }
    deleteRecord = () => {
        this.setState({
            deleteRecord: !this.state.deleteRecord
        })

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
                            marginLeft: hp('3%'), flexDirection: 'column', marginRight: hp('5%'), height: hp(12)
                        }}>
                            <Text style={{
                                alignSelf: 'center',
                                fontFamily: AppStrings.fontFamilyMedium,
                                color: AppColors.greyColor,
                                fontSize: 18
                            }}>{strings('vital.vital.sureWantTo')}</Text>
                            <Text style={{
                                alignSelf: 'center',
                                fontFamily: AppStrings.fontFamilyMedium,
                                color: AppColors.greyColor,
                                fontSize: 18
                            }}>{strings('vital.vital.parmanentlyDelete')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>


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
                                onPress={() => this.deleteRecord()}>

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
                                onPress={() => Alert.alert('delete')}>

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

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, {
                flexDirection: 'row',
                paddingBottom: hp(3),
                paddingTop: hp(3),
                borderBottomWidth: hp(.1),
                borderColor: AppColors.greyBorder
            }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: wp(33),
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(2),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.vital.parameterName}</Text>
                </View>
                <TouchableOpacity style={{
                    width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center',
                    alignItems: 'flex-start', marginRight: wp(1)
                }}
                    onPress={() => Actions.AddRecords({ sDate: this.state.sDate,relativeProfile:this.state.relativeProfile })}
                >
                    <Text
                        style={[styles.headerTextIOS, {
                            color: AppColors.colorHeadings,
                            fontSize: 12,
                            marginLeft: wp(10)
                        }]}>{strings('vital.vital.addRecords')}</Text>
                </TouchableOpacity>


            </View>

        )
    }

    renderAndroid() {

        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, {
                flexDirection: 'row',
                paddingBottom: hp(3),
                paddingTop: hp(2),
                borderBottomWidth: hp(.1),
                borderColor: AppColors.greyBorder
            }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: wp(33),
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(1),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.vital.parameterName}</Text>
                </View>
                <TouchableOpacity style={{
                    width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center',
                    alignItems: 'flex-start', marginRight: wp(1)
                }}
                    onPress={() => Actions.AddRecords({ sDate: this.state.sDate,relativeProfile:this.state.relativeProfile })}
                >
                    <Text
                        style={[styles.headerTextIOS, {
                            color: AppColors.colorHeadings,
                            fontSize: 12,
                            marginLeft: wp(10)
                        }]}>{strings('vital.vital.addRecords')}</Text>
                </TouchableOpacity>


            </View>

        )
    }


    renderSelection = (item) => {
        return (
            <TouchableOpacity style={[styles.tab,
            {
                borderBottomLeftRadius: item.item.option == 'Select Date' ? hp(3) : hp(0),
                borderTopLeftRadius: item.item.option == 'Select Date' ? hp(3) : hp(0),
                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderRightWidth: item.item.option == 'Select Date' ? 0 : 1,
                borderLeftWidth: item.item.option == 'Select Date' || item.item.option == '7 Days' ? 1 : 0,
                borderTopRightRadius: item.item.option == '30 Days' ? hp(3) : hp(0),
                borderBottomRightRadius: item.item.option == '30 Days' ? hp(3) : hp(0),
                justifyContent: 'center',
                alignItems: 'center',

                borderColor: item.item.isSelected ? AppColors.colorHeadings : AppColors.primaryGray,
                backgroundColor: item.item.isSelected ? AppColors.colorHeadings : AppColors.whiteColor,
            }]} onPress={() => this.setSelectedPlan(item.item.option)}>
                {item.item.option == 'Select Date' ?
                    <Icon
                        name="calendar-month"
                        size={25}
                        color={item.item.isSelected ? AppColors.whiteColor : AppColors.primaryGray} />

                    :
                    <Text style={[styles.tabText, {
                        backgroundColor: item.item.isSelected ? AppColors.colorHeadings : AppColors.whiteColor,
                        color: item.item.isSelected ? AppColors.whiteColor : AppColors.primaryGray
                    }]}>{item.item.option}</Text>
                }
            </TouchableOpacity>
        )
    }

    menuOptionPopup = () => {
        this.setState({
            editMenu: !this.state.editMenu
        })

    }

    popupDatepicker = () => {
        this.setState({
            showDate: !this.state.showDate
        })
    }

    setSelectedPlan = (selected) => {
        let data = this.state.reportTime;
        data.map((item, index) => {
            if (selected == data[index].option) {
                data[index].isSelected = true;
            } else {
                data[index].isSelected = false;
            }
        })
        this.setState({
            reportTime: data,
        });
        this.getRelativeRecord(this.state.relativeProfile._id)

    }

    viewReport = () => (
        <BottomUp isVisible={this.state.vitalReport}
            onBackdropPress={() => this.updateVitalReport()}
            onBackButtonPress={() => this.updateVitalReport()}
            style={{
                justifyContent: 'flex-end',
                margin: 0,
            }}>
            <View style={{
                backgroundColor: AppColors.whiteColor,
                paddingTop: wp('5'),
                justifyContent: 'center',
                alignItems: 'center',
                borderTopRightRadius: wp(8),
                borderTopLeftRadius: wp(8),
                borderColor: 'rgba(0, 0, 0, 0.1)'
            }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={styles.topBar}></View>
                    <Text allowFontScaling={false} style={styles.vitalHeadingText}>{strings('vital.vital.vitalReport')}</Text>
                    <View style={styles.dividerVital}></View>
                </View>
                <TouchableOpacity style={{
                    flexDirection: 'row-reverse', alignItems: 'center', width: wp(90), height: hp(4),
                    alignContent: 'center', marginBottom: hp(2)
                }}

                    onPress={() => Alert.alert('sdff')}>
                    <Text
                        style={[styles.headerTextIOS, { color: AppColors.colorHeadings }]}>{strings('vital.vital.addRecords')}</Text>
                </TouchableOpacity>

                <View style={{
                    height: hp('50%'), width: wp('90%'),
                    flexDirection: 'row',
                }}><View style={{
                    flex: 1,
                    flexDirection: 'column',
                    borderColor: 'red',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderRadius: wp(3),
                    position: 'relative',
                }}>
                        <View style={{
                            width: wp(90), height: hp(8), alignSelf: 'center', alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text allowFontScaling={false} style={[styles.vitalHeadingText,
                            { alignSelf: 'center', paddingTop: hp(3) }]}>{strings('vital.vital.vitalReport')}</Text>
                        </View>
                        <View style={[styles.dividerVital, { height: hp(.2), width: wp(89), marginBottom: hp(2), }]}></View>
                        <FlatList
                            data={this.state.recordList}
                            renderItem={(item, index) => this.renderReport(item, index)}
                            keyExtractor={index => index.toString()}
                            numColumns={1}
                        />
                        <TouchableOpacity style={{
                            width: wp(33), marginLeft: wp(3), marginBottom: hp(4)
                        }}
                            onPress={() => Alert.alert('sdff')}>
                            <Text
                                style={[styles.headerTextIOS, { color: AppColors.colorHeadings }]}>{strings('vital.vital.viewGraph')}</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={{
                    height: hp('8%'), width: wp('100%'),
                    flexDirection: 'row', backgroundColor: AppColors.backgroundGray
                }}>

                </View>

            </View>
        </BottomUp>
    );

    renderReport = (item, index) => {
        return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: wp(50), height: hp(6), }}>
                        <Text style={{
                            textAlign: 'left',
                            paddingLeft: wp(6),
                            paddingTop: hp(1),
                            color: AppColors.primaryGray
                        }}>{item.item.name}</Text>

                    </View>
                    <View style={{ width: wp(40), height: hp(6), flexDirection: 'row-reverse' }}>
                        <Text style={{
                            textAlign: 'right',
                            paddingRight: wp(6),
                            paddingTop: hp(1),
                            fontSize: 12,
                            color: AppColors.primaryGray
                        }}>{item.item.minmax}</Text>
                        <Text style={{
                            textAlign: 'right',
                            paddingRight: wp(8),
                            paddingTop: hp(1),
                            color: AppColors.blackColor
                        }}>{item.item.currentReading}</Text>


                    </View>

                </View>
                <View style={{
                    width: wp(80), height: hp(.1), marginBottom: hp(0), marginLeft: wp(5),
                    backgroundColor: AppColors.lightGray, justifyContent: 'flex-end'
                }}>

                </View>
            </View>

        )
    }

    selectedProfile(profile) {
        AppUtils.console("ProfileData", profile);
        this.setState({ relativeProfile: profile })
        this.getRelativeRecord(profile._id)
    }

    openCalender() {
        var self = this;

        var selectedDate = moment(self.state.dateToday)._d;
        var maxDate = _dt;


        if (this.state.recordType == 'ONE_DAY') {
            if (Platform.OS === 'ios') {
                self.setState({ showDateSelector: true, date: selectedDate, mode: 'default', maxDate: maxDate });
            } else {
                self.showPicker('dateToday', { date: selectedDate, mode: 'default', maxDate: maxDate })
            }
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
                    <View style={{
                        height: hp(30),
                        alignSelf: 'center',
                        backgroundColor: AppColors.whiteColor,
                        justifyContent: 'center',
                        width: width - 30,
                    }}>
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
                                    alignSelf: 'center',
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

    onMenuPress(value) {
        AppUtils.console("esfdvd2343", value);
        value == 1 ?
            Actions.EditVital({
                record: this.state.relativeRecord,
                vital: this.props.vital,
                recordType: this.state.recordType,
                sDate: this.state.sDate,relativeProfile:this.state.relativeProfile
            }) :
            value == 2 ? Actions.AddRecords({ sDate: this.state.sDate,relativeProfile:this.state.relativeProfile }) : value == 3 ?
                Actions.ShareVital({
                    average: this.state.average,
                    maximum: this.state.maximum,
                    minimum: this.state.minimum,
                    vitalRecordDateList: this.state.vitalRecordDateList,
                    vitalRecordDataList: this.state.vitalRecordDataList,
                    legend: this.state.legend,
                    vital: this.props.vital,
                    vitalViewMaxText: this.state.vitalViewMax,
                    vitalViiewMinText: this.state.vitalViewMin,
                    duration: this.getDuration(),
                    relativeProfile: this.state.relativeProfile
                }) : null;

    }

    async getRelativeRecord(id) {
        try {
            let recordType;
            this.state.reportTime.map((report) => {
                if (report.isSelected) {
                    recordType = report.value
                }

            })
            this.setState({ isLoading: true, recordType: recordType });
            let data = {
                relativeId: id,
                recordDate: this.state.sDate,
                userVitalParameterRangeId: !this.props.vital.isOtherVital ? this.props.vital.vitalRange._id : this.props.vital._id,
                RECORDS_VIEW_FOR: recordType
            };
            let response = await SHApiConnector.getRelativeRecord(data);

            if (response.data.status) {

                let isMulti = this.props.vital.isMultiParam;

                let record = response.data.response;
            


                let vitalAverageData = response.data.response.recordAverage;

                let average = '--';

                let maximum = '--';
                let minimum = '--';
                if (vitalAverageData) {
                    //maximum = AppUtils.getVital(vitalAverageData.maxRecord, vitalAverageData.maxSecondRecord, isMulti)
                    // minimum = AppUtils.getVital(vitalAverageData.minRecord, vitalAverageData.minSecondRecord, isMulti)
                    maximum = isMulti ? Math.round(vitalAverageData.secondAverageRecord) :
                        parseFloat(vitalAverageData.maxRecord) % 1 === 0 ? parseFloat(vitalAverageData.maxRecord) : parseFloat(vitalAverageData.maxRecord).toFixed(1)
                    minimum = isMulti ? Math.round(vitalAverageData.averageRecord) :
                        parseFloat(vitalAverageData.minRecord) % 1 === 0 ? parseFloat(vitalAverageData.minRecord) : parseFloat(vitalAverageData.minRecord).toFixed(1)
                    average = AppUtils.getVital(vitalAverageData.averageRecord, vitalAverageData.secondAverageRecord, isMulti)

                }
                AppUtils.console("RecordCategoryAveraget", isMulti);
                AppUtils.console("RecordCategoryAveraget", average, "maximum", maximum, "minimum", minimum);


                let recordDate = [];
                let recordData = [];

                let recordSecondData = [];

                response.data.response.recordList.map(record => {
                    recordDate.push(moment(record.recordDate).format('DD MMM'));
                    recordData.push(record.averageRecordQuantity);
                    recordSecondData.push(record.secondAverageRecord);
                });
                this.setState({
                    average: !vitalAverageData ? '--' : average,
                    averageCheck: !vitalAverageData ? 0 : vitalAverageData.averageRecord,
                    vitalViewMax: isMulti ? 'Diastolic' : 'Maximum',
                    vitalViewMin: isMulti ? 'Systolic' : 'Minimum',
                    maximum: maximum,
                    minimum: minimum,
                    isLoading: false,
                    relativeRecord: response.data.response,
                    vitalRecordList: response.data.response.recordList,
                    vitalRecordDateList: recordDate,
                    legend: (this.props.vital.isMultiParam) ? [this.props.vital.firstSubParameterName, this.props.vital.secondSubParameterName] : [],
                    vitalRecordDataList: !vitalAverageData ? [] : (this.props.vital.isMultiParam) ? [
                        {
                            data: recordData,
                            color: (opacity = 1) => AppColors.colorHeadings, // optional
                            strokeWidth: 0 // optional
                        },
                        {
                            data: recordSecondData,
                            color: (opacity = 1) => 'green', // optional
                            strokeWidth: 0 // optional
                        }
                    ] :
                        [
                            {
                                data: recordData,
                                color: (opacity = 1) => AppColors.colorHeadings, // optional
                                strokeWidth: 2 // optional
                            }
                        ],
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

    getDuration() {
        let duration;
        if (this.state.recordType == 'LAST_SEVEN_DAYS') {
            duration = (moment(this.state.sDate).subtract(7, 'd').format('DD MMM') + ' - ' + moment(this.state.sDate).format('Do MMM'));
        } else if (this.state.recordType == 'LAST_THIRTY_DAYS') {
            duration = (moment(this.state.sDate).subtract(30, 'd').format('DD MMM') + ' - ' + moment(this.state.sDate).format('Do MMM'));

        } else {
            duration = moment(this.state.sDate).format('Do MMM')
        }
        return duration;

    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
                {((AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid())}

                <KeyboardAwareScrollView style={{ flex: 1 }}>


                    <View style={{
                        height: hp('8%'), width: wp('90%'),
                        flexDirection: 'row',
                        marginLeft: wp(5), marginTop: hp(3), backgroundColor: AppColors.whiteColor
                    }}>
                        <FlatList
                            data={this.state.reportTime}
                            renderItem={(item) => this.renderSelection(item)}
                            keyExtractor={index => index.toString()}
                            numColumns={3}
                        />

                    </View>
                    <FamilyProfile
                        selectedProfile={(profile) => this.selectedProfile(profile)}
                        selectedRelative={this.state.selectedRelative}

                   />

                    <View style={{
                        height: hp('16%'), width: wp('90%'),
                        flexDirection: 'row',
                        marginLeft: wp('6%'), marginTop: hp(3), backgroundColor: AppColors.whiteColor
                    }}>
                        <VitalCard title={'Average'} image={this.props.vital.parameterWhiteImage}
                            reading={this.state.average} unit={this.props.vital.parameterUnit} />
                        <VitalCard title={this.state.vitalViewMin} image={this.props.vital.parameterWhiteImage}
                            reading={this.state.minimum} unit={this.props.vital.parameterUnit} />
                        <VitalCard title={this.state.vitalViewMax} image={this.props.vital.parameterWhiteImage}
                            reading={this.state.maximum} unit={this.props.vital.parameterUnit} />
                    </View>
                    <View style={{
                        marginTop: hp('3%'), height: hp('4%'), marginLeft: wp(8), width: wp('90%'),
                        flexDirection: 'row'
                    }}>
                        <Text style={{
                            fontSize: 25,
                            fontFamily: AppStyles.fontFamilyBold, color: AppColors.blackColor, alignSelf: 'flex-end'
                        }}>{this.state.average}</Text>
                        <Text style={{
                            color: AppColors.grey,
                            alignSelf: 'flex-end',
                            paddingLeft: wp('1%'),
                            paddingBottom: hp(.4)
                        }}>{this.props.vital.parameterUnit}</Text>


                        <View style={{
                            alignItems: 'flex-end', height: hp('3%'), width: wp('10%'),
                            marginRight: wp(3), marginTop: hp(1),
                            marginBottom: hp(1), alignSelf: 'flex-end'
                        }}>

                            <Menu onSelect={value => this.onMenuPress(value)}>
                                <MenuTrigger>
                                    <MaterialIcon
                                        name="more-vert"
                                        size={25}
                                        color={AppColors.blackColor}
                                    />
                                </MenuTrigger>
                                <MenuOptions>
                                    {this.state.recordType == 'ONE_DAY' && this.state.averageCheck > 0 ?
                                        <MenuOption value={1}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image resizeMode="contain" style={{
                                                    marginRight: wp(5),
                                                    height: hp(3), width: wp(4),

                                                }}
                                                    source={require('../../../assets/images/editiconn.png')} />

                                                <Text style={styles.menuText}>Edit</Text>
                                            </View>

                                        </MenuOption> : null}
                                    <MenuOption value={2}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                            <Image resizeMode="contain" style={{
                                                marginRight: wp(5),
                                                height: hp(3), width: wp(4),

                                            }}
                                                source={require('../../../assets/images/plus.png')} />
                                            <Text style={styles.menuText}>{strings('doctor.button.camelAdd')}</Text>
                                        </View>
                                    </MenuOption>
                                    {this.state.vitalRecordDateList.length > 0 ?
                                        <MenuOption value={3}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                <Image resizeMode="contain" style={{
                                                    marginRight: wp(5),
                                                    height: hp(3), width: wp(4),

                                                }}
                                                    source={require('../../../assets/images/share.png')} />
                                                <Text style={styles.menuText}>{strings('vital.vital.share')}</Text>
                                            </View>
                                        </MenuOption> : null
                                    }
                                </MenuOptions>
                            </Menu>

                        </View>


                    </View>
                    {/*{this.state.recordType == 'ONE_DAY' ?*/}

                    <View style={{
                        flexDirection: 'row',
                        width: wp(100),
                        marginLeft: wp(8),
                        marginTop: hp(1),
                        backgroundColor: AppColors.whiteColor,
                        paddingBottom: hp(2)
                    }}>

                        <TouchableOpacity onPress={() => this.openCalender()} allowFontScaling={false} style={{
                            flexDirection: 'row',
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: hp(1.9), width: wp(40),
                            color: AppColors.colorHeadings,
                        }}>

                            <Image
                                source={images.activeCalender}
                                resizeMode='contain'
                                style={{ height: wp(5), marginRight: hp(1), width: wp(5), alignSelf: 'center' }}
                            />

                            <Text
                                allowFontScaling={false}
                                style={{
                                    fontSize: moderateScale(15),
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    paddingTop: AppUtils.isIphone ? hp(.8) : hp(.1),
                                    color: AppColors.blackColor,
                                    marginRight: wp(1)
                                }}>{this.getDuration()}</Text>

                        </TouchableOpacity></View>
                    {/*// :*/}
                    {/*// <View style={{*/}
                    {/*//     height: hp('4%'), marginLeft: wp(8), marginTop: hp(1), width: wp('90%'), flexDirection: 'row',*/}
                    {/*// }}>*/}
                    {/*//*/}
                    {/*//     <Image*/}
                    {/*//         source={images.activeCalender}*/}
                    {/*//         resizeMode='contain'*/}
                    {/*//         style={{ height: wp(5), marginRight: hp(1), width: wp(5), alignSelf: 'center' }}*/}
                    {/*//     />*/}
                    {/*//     <Text style={{ color: AppColors.grey, alignSelf: 'flex-start' }}> {this.getDuration()}</Text>*/}
                    {/*//*/}
                    {/*// </View>}*/}

                    {this.state.vitalRecordDateList.length > 0 ?
                        <View>
                            <LineChart
                                data={{
                                    labels: this.state.vitalRecordDateList,
                                    datasets: this.state.vitalRecordDataList,
                                    legend: this.state.legend
                                }}
                                width={wp(90)} // from react-native
                                height={hp(40)}
                                withInnerLines={false}
                                withOuterLines={true}
                                withDots={true}
                                withShadow={true}
                                transparent={false}
                                yLabelsOffset={10}
                                segments={5}
                                fromZero={true}
                                chartConfig={{
                                    backgroundColor: "white",
                                    backgroundGradientFrom: "white",
                                    backgroundGradientTo: "white",
                                    decimalPlaces: 1, // optional, defaults to 2dp
                                    color: (opacity = 1) => AppColors.colorHeadings,
                                    labelColor: (opacity = 1) => AppColors.greyColor,
                                    style: {
                                        borderRadius: 16,
                                        backgroundColor: 'white'
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "0",
                                        stroke: AppColors.colorHeadings
                                    }
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                    backgroundColor: 'white'
                                }}
                            />
                        </View> :
                        <View style={{
                            height: hp(40),
                            width: wp(80),
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center'
                        }}>
                            <Text style={{
                                color: AppColors.blackColor, fontSize: wp(5),
                                fontFamily: AppStyles.fontFamilyRegular
                            }}>{(this.state.isLoading) ? '' : strings('vital.vital.recordNotAvail')}</Text>
                        </View>
                    }

                    {/* {this.state.showDate ?
                        <DateTimePicker
                            value={new Date(this.state.dateToday)}
                            style={{ backgroundColor: AppColors.whiteColor }}
                            display="spinner"
                            mode="date"
                            maximumDate={maxDatee}
                            minimumDate={this.state.minDate}
                            onChange={(event, date) => {
                                if(event.type === 'set'){
                                    this.setState({ dateToday: date, showDate: false });}
                                    else{this.setState({ showDate: false });}

                            }} />
                        : null

                    }*/}


                    {this.deleteRecordModal()}
                    {this.viewReport()}
                    {(this.state.showDateSelector) ? this.openDateSelector() : null}

                </KeyboardAwareScrollView>
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true}
                    isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor}
                />
                {/* <View style={{

                    width: wp(100),
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: .2,
                    shadowColor: '#000000', backgroundColor: AppColors.whiteColor, paddingBottom: (AppUtils.isX) ? hp(2) : 0,
                    elevation: 2, height: (AppUtils.isX) ? hp(12) : hp(10), flexDirection: 'row',
                }}>



                     <TouchableOpacity onPress={() => {
                        this.updateVitalReport()
                    }}
                        style={{ width: wp(90), marginLeft: wp(3) }}>
                        <Text style={[styles.btnSubmit]}>View Vital Report</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        )
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
        width: wp(100),
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerTextIOS: {
        color: AppColors.blackColor, textAlign: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (hp(1))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }, tab: {
        alignContent: 'center',
        justifyContent: 'center',
        height: hp('6%'),
        width: wp('30%'),
    },
    tabText: {

        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyMedium
    },
    menuText: { color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyMedium },
    btnSubmit: {
        backgroundColor: '#ff4848',
        color: 'white',
        borderColor: '#ff4848',
        borderWidth: hp(.2),
        borderRadius: hp(1),
        width: wp(90),
        textAlign: 'center',
        paddingTop: hp(1.5),
        paddingBottom: hp(1.5),
        marginLeft: wp(2),
        fontSize: 16,
        fontFamily: AppStyles.fontFamilyRegular,
    },
    topBar: {
        flexDirection: 'row',
        width: wp(25),
        height: hp(1),
        borderRadius: hp(2),
        backgroundColor: AppColors.greyBorder,
        marginBottom: hp(3),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    vitalHeadingText: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15,
        color: AppColors.blackColor,
        marginBottom: hp(3)
    },
    dividerVital: {
        width: wp('100%'),
        height: hp(2),
        flexDirection: 'row',
        backgroundColor: AppColors.backgroundGray,
        marginBottom: hp(1),
    }

});
