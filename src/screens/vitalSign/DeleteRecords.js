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
    Platform, PermissionsAndroid, TouchableHighlight, Modal
} from 'react-native'
import { AppColors } from "../../shared/AppColors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";

import { AppUtils } from "../../utils/AppUtils";
import images from "../../utils/images";
import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import DeleteRecordsScreenStyle from "./DeleteRecordsScreenStyle";
import { moderateScale } from "../../utils/Scaling";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FamilyProfile from "./../commonFiles/FamilyProfile"
import { CachedImage, ImageCacheProvider } from '../../cachedImage';
import CheckBox from "react-native-check-box";
import CommonHeaderVital from "../../navigationHeader/CommonHeaderVital"
import { strings } from '../../locales/i18n';

class DeleteRecords extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("appointmentDetails", props);
        this.state = {
             profileList: [], deleteRecord: false
        }
    }
    getUserDetailsAlways() {
        var self = this;
        self.setState({ isLoading: true })
        SHApiConnector.getUserDetailsAlways(function (err, stat) {
            try {
                self.setState({ isLoading: false })
                AppUtils.console("ResponseProfile", stat)
                if (stat) {
                    if (stat.error_code) {
                        // self.openAlert(stat)
                    } else {
                        self.setState({ profileList: stat.relativeDetails });
                    }
                }
            } catch (e) {
                self.setState({ isLoading: false })
            }
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
                key={this.state.deleteRecord ? 1 : 2}

            >
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: AppColors.transparent,
                    flex: 1,

                }}>

                    <View style={{

                        marginTop: hp(6),
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
                            <Text style={{ alignSelf: 'center', textAlign: 'center', fontFamily: AppStyles.fontFamilyMedium, color: AppColors.greyColor, fontSize: 18 }}>Are you sure you want to permanently delete the records</Text>
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
                                onPress={() => this.submit()}>

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

    componentDidMount() {
        this.getUserDetailsAlways()
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.onBackPress()
            return true;
        });
    }
    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true })
        }, 500);
    }
    componentWillReceiveProps(props) {
        AppUtils.console("MyAppProps", props)
        if (props.update) {

        }
    }




    profileListView(item) {
        let self = this;
        AppUtils.console("profileList", item)
        return (
            <View style={{
                height: hp(6),
                backgroundColor: AppColors.whiteColor,
                borderRadius: moderateScale(15),
                marginLeft: moderateScale(5),
                marginTop: moderateScale(10),
                marginBottom: moderateScale(5),
                marginRight: moderateScale(10),
                alignItems: 'flex-start',
                flexDirection: 'row'
            }}>
                <TouchableHighlight style={{
                    flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'center'
                }}
                    underlayColor='transparent'>
                    <View style={{
                        flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'center'
                    }}>

                        <CheckBox
                            style={{ paddingTop: hp(1) }}
                            onClick={(isChecked) => {
                                self.selectItem(item.item, isChecked);

                            }}
                            checkBoxColor={AppColors.primaryColor}
                            isChecked={item.item.isChecked}
                        />

                        <CachedImage

                            style={{
                                width: wp(12), height: wp(12),
                                marginLeft: wp(2), borderRadius: hp(50),
                                alignSelf: 'center'
                            }}
                            source={{ uri: AppUtils.handleNullImg(item.item.profilePic) }}
                        />
                        <View style={{ alignSelf: 'center', marginLeft: wp(5) }}>
                            <Text style={{
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(12),
                                color: AppColors.blackColor,
                                width: wp(50)
                            }}
                                numberOfLines={1}>{item.item.firstName} {item.item.lastName}  </Text>
                            <Text numberOfLines={1} style={{
                                width: wp(40), paddingTop: hp(.2),
                                fontFamily: AppStyles.fontFamilyRegular, fontSize: moderateScale(10),
                                color: AppColors.grey
                            }}>{item.item.spouse} </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        )
    }
    selectItem(item, value) {
        AppUtils.console("ProfileDataI", item.id)
        let record = [];
        this.state.profileList.map((list) => {
            AppUtils.console("ProfileData", list.id)

            if (list._id === item._id) {
                AppUtils.console("ProfileData", list.isChecked)

                list.isChecked = !list.isChecked

            }

        });
        record = this.state.profileList
        AppUtils.console("ProfileDatanew", record)
        this.setState({ profileList: record })

    }

    confirmDelete() {
        AppUtils.console("Data", this.state.rangeList);
        let status = false;
        this.state.profileList.map((list) => {
            AppUtils.console("listdata", list);
            if (!list.isChecked) {
            } else {
                status = true
            }
        });
        if (status) {
            this.setState({ deleteRecord: true })
        } else {
            Alert.alert("", strings('vital.vital.selectPatient'))
        }



    }

    submit() {
        let updatedList = [];
        let status = true;
        this.state.profileList.map((list) => {
            AppUtils.console("listdata", list);
            if (!list.isChecked) {
            } else {
                updatedList.push({
                    relativeId: list._id,
                })
            }
        })
        AppUtils.console("listdata", updatedList);
        if (status) {
            this.deleteAllRecord(updatedList)
        }
    }
    async deleteAllRecord(data) {
        this.setState({
            isLoading: true, deleteRecord: false
        })
        let body = { relativeList: data }

        try {

            let response = await SHApiConnector.deleteAllRecord(body);
            AppUtils.console("vitalResponse", response);
            if (response.data.status) {
                this.setState({
                    isLoading: false, deleteRecord: false
                })

                this.getUserDetailsAlways();
                setTimeout(() => {
                    Alert.alert('',response.data.response)
                },1500);

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

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
                <CommonHeaderVital title={strings('vital.vital.deleteAll')} />
                <KeyboardAwareScrollView style={{ flex: 1 }}>
                    <View style={{ justifyContent: 'center', marginLeft: wp(7), marginTop: hp(3) }}>

                        <TouchableOpacity underlayColor="transparent" >
                            <Text style={DeleteRecordsScreenStyle.addRecordsTitle}>
                            {strings('doctor.text.selectPatient')}
                            </Text>
                        </TouchableOpacity>

                        <FlatList
                            data={this.state.profileList}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={(item, index) => this.profileListView(item, index)}
                            extraData={this.state}
                        />


                    </View>



                </KeyboardAwareScrollView>
                {this.deleteRecordModal()}

                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={false}
                    isHUD={false}
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
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000000', backgroundColor: AppColors.whiteColor, paddingBottom: (AppUtils.isX) ? hp(2) : 0,
                elevation: 2, height: (AppUtils.isX) ? hp(12) : hp(10), flexDirection: 'row'
            }}>



                <TouchableOpacity onPress={() => {
                    this.confirmDelete()
                }}>
                    <Text style={[DeleteRecordsScreenStyle.btnSubmit]}>{strings('doctor.button.submit')}</Text>
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

export default DeleteRecords;


