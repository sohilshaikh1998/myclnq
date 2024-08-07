import React, {Component} from 'react';
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
    BackHandler, Dimensions,
    Platform, PermissionsAndroid, TouchableHighlight, I18nManager
} from 'react-native'
import {AppColors} from "../../shared/AppColors";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {AppStyles} from "../../shared/AppStyles";
import {AppStrings} from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";

const {width, height} = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
import {AppUtils} from "../../utils/AppUtils";
import images from "../../utils/images";
import {SHApiConnector} from "../../network/SHApiConnector";
import {Actions} from "react-native-router-flux";
import SetVitalStyle from "./SetVitalStyle";
import {moderateScale} from "../../utils/Scaling";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import FamilyProfile from "./../commonFiles/FamilyProfile"
import CommonHeaderVital from "../../navigationHeader/CommonHeaderVital"
import AddRecordsStyles from "./AddRecordsStyles"

var dt = new Date();
var _dt = dt;

import moment from "moment";
import { strings } from '../../locales/i18n';


class SetVitalRange extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("appointmentDetails", props);
        this.state = {
            rangeList: [],
            selectedRelative: !props.relativeProfile ? [] : props.relativeProfile,
            setRangeList: [], sDate: moment(_dt).format('YYYY-MM-DD'),
        }
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.onBackPress()
            return true;
        });
    }

    async getVitalDashboard(id,vitalAdded) {
        let oldRange = [];
        this.setState({
            isLoading: true,
        })
        try {
            let body = {
                recordDate: this.state.sDate
            };
            let response = await SHApiConnector.getVitalDashboard(id, body);
            AppUtils.console("vitaldashboardResponse", response);
            if (response.data.status) {
                let list = response.data.response;
                this.setState({
                    rangeList: list,
                    isLoading: false,
                });

                list.map((item) => {
                    if (item.vitalRange || item.isOtherVital) {
                        oldRange.push(item)
                    }
                });
                this.setState({oldRange: oldRange})
                vitalAdded && Actions.VitalDrawer()

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

    async setMultipleRange(data) {
        this.setState({
            isLoading: true,
        })
        let body = {vitalRangeList: data}

        try {

            let response = await SHApiConnector.setMultipleRange(body);

            AppUtils.console("vitalmultipleResponse", response);
            if (response.data.status) {
                this.setState({
                    isLoading: false,
                })

                setTimeout(() => {
                    Alert.alert('', strings('vital.vital.vitalAddedSuccess'), [
                        {
                            cancelable: false,
                            text: strings('doctor.button.ok'),
                            onPress: () => this.getVitalDashboard(this.state.relativeProfile._id,'vitalAdded')
                        },
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

    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({update: true})
        }, 500);
    }

    componentWillReceiveProps(props) {
        AppUtils.console("MyAppProps", props)
        if (props.update) {
        }
    }


    setMinMax(value, item, type) {
        let updatedList = [];
        let self = this;
        AppUtils.console("ListVital", item._id);
        value = isNaN(`${value}`) ? '' : `${value}`;
        AppUtils.console("ListVitalUpdate", value);

        self.state.rangeList.map((list) => {
            let id = list._id
            // // AppUtils.console("Rangelistmin",minRange);
            // AppUtils.console("ListVitalId",id);
            if (id === item._id) {
                AppUtils.console("ListVitalId", id);
                if (!list.isOtherVital) {

                    if (type === "Max") {
                        if (!list.vitalRange) {
                            list.vitalRange = {maxRange: value}

                        } else {
                            list.vitalRange.maxRange = value

                        }
                    } else {
                        if (!list.vitalRange) {
                            list.vitalRange = {minRange: value}

                        } else {
                            list.vitalRange.minRange = value

                        }
                        AppUtils.console("ListVitalVal", value);


                    }
                } else {
                    if (type === "Max") {
                        list.maxRange = value

                    } else {
                        list.minRange = value

                    }

                }
            }
        });

        updatedList = self.state.rangeList;

        AppUtils.console("ListVitalUpdate", updatedList);
        self.setState({rangeList: updatedList})

    }

    submit() {
        let updatedList = [];
        let status = true;
        let msg = "";

        this.state.rangeList.map((list) => {
            AppUtils.console("listdata", list);
            if (!list.isOtherVital) {
                if (!list.vitalRange) {

                } else if ((!list.vitalRange.maxRange || !list.vitalRange.minRange)) {
                    if ((!list.vitalRange.maxRange && !list.vitalRange.minRange)) {
                        // AppUtils.console("listdata",list)

                    } else {
                        status = false;
                        msg = strings('vital.vital.minMaxBothRequire');

                    }
                } else {
                    AppUtils.console("listdataOther", list.vitalRange.minRange, " ", list.vitalRange.maxRange)

                    if (parseInt(list.vitalRange.minRange) <= parseInt(list.vitalRange.maxRange)) {
                        AppUtils.console("listdataOther", !list.isOtherVital ? 'no' : list.isOtherVital)
                        updatedList.push({
                            relativeId: this.state.relativeProfile._id,
                            relativeName: this.state.relativeProfile.firstName + " " + this.state.relativeProfile.lastName,
                            minRange: "" + list.vitalRange.minRange,
                            maxRange: "" + list.vitalRange.maxRange,
                            vitalSignParameterId: list._id,
                            parameterUnit: list.parameterUnit

                        })
                    } else {
                        status = false;
                        // Alert.alert("", 'Please Check Min Max values of  Vital Range')

                        msg = strings('vital.vital.checkMinMaxValue');
                    }

                }
            } else {

                if ((!list.maxRange || !list.minRange)) {
                    if ((!list.maxRange && !list.minRange)) {
                        // AppUtils.console("listdata",list)

                    } else {
                        status = false;
                        //  Alert.alert("", 'Please Check Vital Range')
                        msg = strings('vital.vital.minMaxBothRequire');


                    }
                } else {
                    AppUtils.console("listdataOtherOut", list.minRange, " ", list.maxRange)

                    if (parseInt(list.minRange) <= parseInt(list.maxRange)) {
                        AppUtils.console("listdataOtherIn", !list.isOtherVital ? 'no' : list.isOtherVital)

                        updatedList.push({
                            relativeId: this.state.relativeProfile._id,
                            relativeName: this.state.relativeProfile.firstName + " " + this.state.relativeProfile.lastName,
                            minRange: "" + list.minRange,
                            maxRange: "" + list.maxRange,
                            vitalSignParameterId: null,
                            parameterName: list.parameterName,
                            parameterUnit: list.parameterUnit

                        })

                    } else {
                        AppUtils.console("listdataOther", list.minRange, " ", list.maxRange)
                        status = false;
                        //  Alert.alert("", 'Please Check Min Max values of  Vital Range')
                        msg = strings('vital.vital.checkMinMaxValue');

                    }


                }
            }


        })
        AppUtils.console("listdataNew", updatedList, "msg", msg);

        if (!msg) {
            if (updatedList.length == 0) {
                Alert.alert("", strings('vital.vital.enterMinMaxValue'));

            } else if (status) {
                AppUtils.console("listdataOld", this.state.oldRange);
                if (updatedList.length < this.state.oldRange.length) {
                    Alert.alert("", strings('vital.vital.existingRangeCannotEmpty'))
                } else {
                    this.setMultipleRange(updatedList)
                }
            }
        } else {
            Alert.alert("", msg);
        }
    }

    rangeListView(item) {
        AppUtils.console("Rangelist", item.item);
        let self = this
        let minRange = !item.item.vitalRange ? '' : item.item.vitalRange.minRange ? "" + item.item.vitalRange.minRange : ''
        // AppUtils.console("Rangelistmin",minRange);
        let maxRange = !item.item.vitalRange ? '' : item.item.vitalRange.maxRange ? "" + item.item.vitalRange.maxRange : ''
        AppUtils.console("RangelistOther", !item.item.isOtherVital ? minRange : item.item.minRange, item.item.maxRange);
        minRange = !item.item.isOtherVital ? minRange : "" + item.item.minRange
        maxRange = !item.item.isOtherVital ? maxRange : "" + item.item.maxRange
        AppUtils.console("RangelistMinMax", minRange, maxRange);


        return (
            item.item.parameterName ?
                <View style={SetVitalStyle.modalListContentViewRange}>
                    <View style={SetVitalStyle.modalListContentInnerView}>
                        <View style={{width: wp(45)}}>
                            <View style={{flexDirection: 'row', alignItems: 'center',flexWrap:'wrap'}}>
                                <Text
                                    allowFontScaling={false}
                                    numberOfLines={1}
                                    style={[SetVitalStyle.modalListContentViewVitalTxt,{textAlign: isRTL ? 'left' : 'auto', marginRight: isRTL? wp(1):null}]}
                                >
                                    {item.item.parameterName}

                                </Text>
                                <Text
                                    allowFontScaling={false}
                                    numberOfLines={1}
                                    style={[SetVitalStyle.modalListContentViewSubTxt, {paddingTop: hp(.4),textAlign: isRTL ? 'left' : 'auto',}]}
                                >
                                    {"  (" + item.item.parameterUnit + ")"}
                                </Text>
                            </View>


                        </View>

                        <View style={SetVitalStyle.modalListContentViewHead}>
                            <View style={{flexDirection: 'row',}}>
                                <View style={[SetVitalStyle.modalListMinMAXTxt]}>

                                    <TextInput allowFontScaling={false}
                                        numberOfLines={1}
                                        placeholder={item.item.parameterName == 'BP' ? strings('vital.vital.diastolic') : strings('vital.vital.minRange')}
                                        value={minRange}
                                        keyboardType="decimal-pad"
                                        autoFocus={item.index == 0 ? true : false}
                                        placeholderTextColor={AppColors.textGray}
                                        onChangeText={(input) => {
                                            self.setMinMax(input, item.item, "Min")
                                        }}
                                        style={[{
                                            height: hp(5),
                                            fontSize: 12, color: AppColors.textGray,
                                            textAlign: isRTL ? 'right' : 'auto',
                                        }]}
                                    />

                                </View>

                                <View style={[SetVitalStyle.modalListMinMAXTxt]}>

                                    <TextInput allowFontScaling={false}
                                        numberOfLines={1}
                                        placeholder={item.item.parameterName == 'BP' ? strings('vital.vital.systolic') : strings('vital.vital.maxRange')}
                                        keyboardType="decimal-pad"
                                        value={maxRange}
                                        placeholderTextColor={AppColors.textGray}
                                        onChangeText={(input) => self.setMinMax(input, item.item, 'Max')}
                                        style={[{
                                            height: hp(5),
                                            fontSize: 12, color: AppColors.textGray,
                                            textAlign: isRTL ? 'right' : 'auto',
                                        }]}
                                    />

                                </View>
                            </View>
                        </View>
                    </View>
                </View> : null
        )
    }

    selectedProfile(profile) {
        AppUtils.console("ProfileData", profile);
        this.setState({relativeProfile: profile})
        this.getVitalDashboard(profile._id)


    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: AppColors.whiteColor}}>

                <CommonHeaderVital title={strings('vital.vital.setVitalRange')}/>

                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps={'handled'} disableKBDismissScroll={true} bounces={false}
                    showsVerticalScrollIndicator={false}>
                    <FamilyProfile
                        selectedProfile={(profile) => this.selectedProfile(profile)}
                        selectedRelative={this.state.selectedRelative}

                    />
                    <View style={{marginLeft: wp(5), justifyContent: 'center'}}>
                        <Text style={[SetVitalStyle.addRecordsTitle,{textAlign: isRTL ? "left" : "auto"}]}>
                            {strings('vital.vital.modifyRange')}
                        </Text>
                        <FlatList
                            style={{marginTop: hp(2)}}
                            data={this.state.rangeList}
                            extraData={this.state}
                            renderItem={(item) => this.rangeListView(item)}
                            keyExtractor={(item, index) => index.toString()}

                        />

                    </View>


                </KeyboardAwareScrollView>

                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true}
                    isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor}
                />
                {this.footer()}
            </View>
        );
    }

    footer() {
        return (
            <View style={{

                width: wp(100),
                shadowOffset: {
                    width: 0,
                    height: -3,
                },
                shadowOpacity: .2,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000000',
                backgroundColor: AppColors.whiteColor,
                paddingBottom: (AppUtils.isX) ? hp(2) : 0,
                elevation: 2,
                height: (AppUtils.isX) ? hp(12) : hp(10),
                flexDirection: 'row'
            }}>


                <TouchableOpacity style={[AddRecordsStyles.addRecordSubmit]} onPress={() => {
                    this.submit()
                }}>
                    <Text style={[AddRecordsStyles.addRecordSubmitText]}>{strings('doctor.button.submit')}</Text>
                </TouchableOpacity>
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
        marginTop: (AppUtils.isIphone) ? hp(.5) : hp(1),
        alignSelf: 'center',
        paddingLeft: wp(5), color: AppColors.colorHeadings
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
        fontSize: 16
    }
});

export default SetVitalRange;


